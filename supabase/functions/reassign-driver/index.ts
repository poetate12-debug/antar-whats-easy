import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReassignRequest {
  orderId: string;
  reason?: string;
  currentDriverId?: string;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, reason, currentDriverId }: ReassignRequest = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Reassigning driver for order: ${orderId}, reason: ${reason}`);

    // Get order details
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

    // Mark current assignment as rejected if exists
    if (currentDriverId) {
      await supabase
        .from("driver_assignments")
        .update({ 
          status: "rejected",
          rejection_reason: reason || "Driver rejected or timed out"
        })
        .eq("order_id", orderId)
        .eq("driver_id", currentDriverId)
        .eq("status", "pending");

      // Update driver stats - decrease acceptance rate
      const { data: currentStats } = await supabase
        .from("driver_stats")
        .select("*")
        .eq("driver_id", currentDriverId)
        .single();

      if (currentStats) {
        const newCancelled = (currentStats.cancelled_orders || 0) + 1;
        const newTotal = currentStats.total_orders || 1;
        const newAcceptanceRate = Math.max(0, ((newTotal - newCancelled) / newTotal) * 100);

        await supabase
          .from("driver_stats")
          .update({
            cancelled_orders: newCancelled,
            acceptance_rate: newAcceptanceRate
          })
          .eq("driver_id", currentDriverId);
      }
    }

    // Find new driver
    const wilayahId = order.wilayah_id;
    const excludeDriverId = currentDriverId;

    console.log(`Finding new driver for wilayah: ${wilayahId}, excluding: ${excludeDriverId}`);

    // Get online drivers in wilayah, excluding current driver
    let query = supabase
      .from("driver_status")
      .select("driver_id, wilayah_id, is_online")
      .eq("is_online", true)
      .eq("wilayah_id", wilayahId);

    if (excludeDriverId) {
      query = query.neq("driver_id", excludeDriverId);
    }

    const { data: availableDrivers } = await query;

    let candidateDrivers = availableDrivers || [];

    // If no drivers in wilayah, try all online drivers
    if (candidateDrivers.length === 0) {
      let allQuery = supabase
        .from("driver_status")
        .select("driver_id, wilayah_id, is_online")
        .eq("is_online", true);

      if (excludeDriverId) {
        allQuery = allQuery.neq("driver_id", excludeDriverId);
      }

      const { data: allDrivers } = await allQuery;
      candidateDrivers = allDrivers || [];
    }

    if (candidateDrivers.length === 0) {
      // No drivers available
      await supabase
        .from("orders")
        .update({ status: "menunggu_driver", driver_id: null })
        .eq("id", orderId);

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "No drivers available for reassignment",
          status: "menunggu_driver"
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get driver stats for ranking
    const driverIds = candidateDrivers.map((d: any) => d.driver_id);
    const { data: driverStats } = await supabase
      .from("driver_stats")
      .select("driver_id, average_rating, completed_orders, acceptance_rate")
      .in("driver_id", driverIds);

    // Rank drivers
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

        console.log(`New driver ${driver.driver_id} assigned to order ${orderId}`);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "New driver assigned successfully",
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
      .update({ status: "menunggu_driver", driver_id: null })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "All available drivers are busy",
        status: "menunggu_driver"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error reassigning driver:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
