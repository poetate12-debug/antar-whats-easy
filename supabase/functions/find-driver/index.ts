import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FindDriverRequest {
  orderId: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId }: FindDriverRequest = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Finding driver for order: ${orderId}`);

    // Fetch order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, wilayah:wilayahs(id, nama)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if order already has a driver
    if (order.driver_id) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order already has driver assigned",
          driverId: order.driver_id 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const wilayahId = order.wilayah_id;
    console.log(`Finding driver for wilayah: ${wilayahId}`);

    // Find available online drivers in the same wilayah
    const { data: availableDrivers } = await supabase
      .from("driver_status")
      .select("driver_id, wilayah_id, is_online")
      .eq("is_online", true)
      .eq("wilayah_id", wilayahId);

    let candidateDrivers = availableDrivers || [];

    if (candidateDrivers.length === 0) {
      // Try all online drivers
      const { data: allDrivers } = await supabase
        .from("driver_status")
        .select("driver_id, wilayah_id, is_online")
        .eq("is_online", true);

      candidateDrivers = allDrivers || [];
    }

    if (candidateDrivers.length === 0) {
      // No drivers available
      await supabase
        .from("orders")
        .update({ status: "menunggu_driver" })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No drivers available",
          status: "menunggu_driver"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get driver stats to rank them
    const driverIds = candidateDrivers.map((d: any) => d.driver_id);
    const { data: driverStats } = await supabase
      .from("driver_stats")
      .select("driver_id, average_rating, completed_orders, acceptance_rate")
      .in("driver_id", driverIds);

    // Sort drivers by ranking
    const rankedDrivers = driverIds.map((id: string) => {
      const stats = driverStats?.find((s: any) => s.driver_id === id) || {
        average_rating: 5,
        completed_orders: 0,
        acceptance_rate: 100
      };
      return { driver_id: id, ...stats };
    }).sort((a: any, b: any) => {
      if (b.acceptance_rate !== a.acceptance_rate) return b.acceptance_rate - a.acceptance_rate;
      if (b.average_rating !== a.average_rating) return b.average_rating - a.average_rating;
      return b.completed_orders - a.completed_orders;
    });

    // Find available driver (not busy)
    for (const driver of rankedDrivers) {
      const { data: existingAssignment } = await supabase
        .from("driver_assignments")
        .select("id")
        .eq("driver_id", driver.driver_id)
        .in("status", ["pending", "accepted", "picked_up"])
        .limit(1);

      if (!existingAssignment || existingAssignment.length === 0) {
        // Assign this driver
        await supabase
          .from("driver_assignments")
          .insert({
            order_id: orderId,
            driver_id: driver.driver_id,
            status: "pending"
          });

        await supabase
          .from("orders")
          .update({ 
            status: "diambil_driver",
            driver_id: driver.driver_id
          })
          .eq("id", orderId);

        console.log(`Driver ${driver.driver_id} assigned to order ${orderId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Driver assigned successfully",
            driverId: driver.driver_id,
            status: "diambil_driver"
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // All drivers busy
    await supabase
      .from("orders")
      .update({ status: "menunggu_driver" })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "All drivers are busy",
        status: "menunggu_driver"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error finding driver:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
