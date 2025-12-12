import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProcessOrderRequest {
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

    const { orderId }: ProcessOrderRequest = await req.json();
    
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "orderId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing order: ${orderId}`);

    // Fetch order with warung details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(`
        *,
        warung:warungs(id, nama, owner_id, no_wa),
        wilayah:wilayahs(id, nama)
      `)
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("Order not found:", orderError);
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Order found: ${order.id}, warung owner: ${order.warung?.owner_id}`);

    // Check if warung has an owner (registered mitra)
    const hasOwner = order.warung?.owner_id !== null;

    if (hasOwner) {
      // Warung has owner - update status to diproses_warung and wait for mitra confirmation
      console.log("Warung has owner, setting status to diproses_warung");
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "diproses_warung" })
        .eq("id", orderId);

      if (updateError) {
        console.error("Error updating order status:", updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order sent to warung for processing",
          status: "diproses_warung",
          hasOwner: true
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No owner - skip warung confirmation, directly find driver
      console.log("Warung has no owner, finding available driver");
      
      const driverResult = await findAndAssignDriver(supabase, order);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: driverResult.message,
          status: driverResult.status,
          hasOwner: false,
          driverId: driverResult.driverId
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error processing order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function findAndAssignDriver(supabase: any, order: any) {
  const wilayahId = order.wilayah_id;
  
  console.log(`Finding driver for wilayah: ${wilayahId}`);

  // Find available online drivers in the same wilayah, sorted by rating and completed orders
  const { data: availableDrivers, error: driverError } = await supabase
    .from("driver_status")
    .select(`
      driver_id,
      wilayah_id,
      is_online
    `)
    .eq("is_online", true)
    .eq("wilayah_id", wilayahId);

  if (driverError) {
    console.error("Error fetching drivers:", driverError);
    throw driverError;
  }

  console.log(`Found ${availableDrivers?.length || 0} online drivers in wilayah`);

  if (!availableDrivers || availableDrivers.length === 0) {
    // No driver available in wilayah, try all online drivers
    const { data: allDrivers } = await supabase
      .from("driver_status")
      .select("driver_id, wilayah_id, is_online")
      .eq("is_online", true);

    if (!allDrivers || allDrivers.length === 0) {
      // No drivers available, set status to menunggu_driver
      await supabase
        .from("orders")
        .update({ status: "menunggu_driver" })
        .eq("id", order.id);

      return {
        success: true,
        message: "No drivers available, waiting for driver",
        status: "menunggu_driver",
        driverId: null
      };
    }

    // Use first available driver from any wilayah
    console.log(`Using driver from different wilayah: ${allDrivers[0].driver_id}`);
    return await assignDriverToOrder(supabase, order.id, allDrivers[0].driver_id);
  }

  // Get driver stats to rank them
  const driverIds = availableDrivers.map((d: any) => d.driver_id);
  const { data: driverStats } = await supabase
    .from("driver_stats")
    .select("driver_id, average_rating, completed_orders, acceptance_rate")
    .in("driver_id", driverIds);

  // Sort drivers by: acceptance_rate DESC, average_rating DESC, completed_orders DESC
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

  // Check if driver already has active assignment
  for (const driver of rankedDrivers) {
    const { data: existingAssignment } = await supabase
      .from("driver_assignments")
      .select("id")
      .eq("driver_id", driver.driver_id)
      .in("status", ["pending", "accepted", "picked_up"])
      .limit(1);

    if (!existingAssignment || existingAssignment.length === 0) {
      console.log(`Assigning driver: ${driver.driver_id}`);
      return await assignDriverToOrder(supabase, order.id, driver.driver_id);
    }
  }

  // All drivers are busy
  await supabase
    .from("orders")
    .update({ status: "menunggu_driver" })
    .eq("id", order.id);

  return {
    success: true,
    message: "All drivers busy, waiting for available driver",
    status: "menunggu_driver",
    driverId: null
  };
}

async function assignDriverToOrder(supabase: any, orderId: string, driverId: string) {
  // Create driver assignment
  const { error: assignError } = await supabase
    .from("driver_assignments")
    .insert({
      order_id: orderId,
      driver_id: driverId,
      status: "pending"
    });

  if (assignError) {
    console.error("Error creating assignment:", assignError);
    throw assignError;
  }

  // Update order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ 
      status: "diambil_driver",
      driver_id: driverId
    })
    .eq("id", orderId);

  if (updateError) {
    console.error("Error updating order:", updateError);
    throw updateError;
  }

  return {
    success: true,
    message: "Driver assigned successfully",
    status: "diambil_driver",
    driverId: driverId
  };
}
