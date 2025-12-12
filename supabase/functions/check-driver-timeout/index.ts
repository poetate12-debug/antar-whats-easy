import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TIMEOUT_SECONDS = 60;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Checking for timed out driver assignments...');

    // Find pending assignments that are older than TIMEOUT_SECONDS
    const timeoutThreshold = new Date(Date.now() - TIMEOUT_SECONDS * 1000).toISOString();

    const { data: timedOutAssignments, error: fetchError } = await supabase
      .from('driver_assignments')
      .select('id, order_id, driver_id')
      .eq('status', 'pending')
      .lt('assigned_at', timeoutThreshold);

    if (fetchError) {
      console.error('Error fetching timed out assignments:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${timedOutAssignments?.length || 0} timed out assignments`);

    if (!timedOutAssignments || timedOutAssignments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No timed out assignments found', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processed = 0;
    let reassigned = 0;

    for (const assignment of timedOutAssignments) {
      console.log(`Processing timeout for assignment ${assignment.id}, order ${assignment.order_id}`);

      // Mark current assignment as timed out
      const { error: updateError } = await supabase
        .from('driver_assignments')
        .update({
          status: 'timeout',
          rejection_reason: 'Driver tidak merespon dalam 60 detik',
        })
        .eq('id', assignment.id);

      if (updateError) {
        console.error(`Error updating assignment ${assignment.id}:`, updateError);
        continue;
      }

      processed++;

      // Try to find a new driver
      // Get the order's wilayah_id
      const { data: order } = await supabase
        .from('orders')
        .select('wilayah_id')
        .eq('id', assignment.order_id)
        .single();

      if (!order) {
        console.log(`Order ${assignment.order_id} not found`);
        continue;
      }

      // Get all rejected/timed out drivers for this order
      const { data: excludedAssignments } = await supabase
        .from('driver_assignments')
        .select('driver_id')
        .eq('order_id', assignment.order_id)
        .in('status', ['rejected', 'timeout']);

      const excludedDriverIds = excludedAssignments?.map(a => a.driver_id) || [];

      // Find available drivers in the same wilayah
      let query = supabase
        .from('driver_status')
        .select(`
          driver_id,
          wilayah_id,
          driver_stats:driver_stats(average_rating, completed_orders)
        `)
        .eq('is_online', true)
        .eq('wilayah_id', order.wilayah_id);

      if (excludedDriverIds.length > 0) {
        // Filter out excluded drivers using not.in
        query = query.not('driver_id', 'in', `(${excludedDriverIds.join(',')})`);
      }

      const { data: availableDrivers } = await query;

      if (!availableDrivers || availableDrivers.length === 0) {
        console.log(`No available drivers for order ${assignment.order_id}`);
        
        // Update order status to waiting for driver
        await supabase
          .from('orders')
          .update({ status: 'menunggu_driver', driver_id: null })
          .eq('id', assignment.order_id);
        
        continue;
      }

      // Check which drivers don't have active assignments
      const { data: busyDrivers } = await supabase
        .from('driver_assignments')
        .select('driver_id')
        .in('status', ['pending', 'accepted', 'picked_up']);

      const busyDriverIds = busyDrivers?.map(d => d.driver_id) || [];
      
      // Filter to only available (not busy) drivers
      const freeDrivers = availableDrivers.filter(d => !busyDriverIds.includes(d.driver_id));

      if (freeDrivers.length === 0) {
        console.log(`All available drivers are busy for order ${assignment.order_id}`);
        
        await supabase
          .from('orders')
          .update({ status: 'menunggu_driver', driver_id: null })
          .eq('id', assignment.order_id);
        
        continue;
      }

      // Sort by rating and completed orders
      const sortedDrivers = freeDrivers.sort((a, b) => {
        const aStats = a.driver_stats?.[0] || { average_rating: 0, completed_orders: 0 };
        const bStats = b.driver_stats?.[0] || { average_rating: 0, completed_orders: 0 };
        
        // Prioritize by rating first, then by completed orders
        if (bStats.average_rating !== aStats.average_rating) {
          return bStats.average_rating - aStats.average_rating;
        }
        return bStats.completed_orders - aStats.completed_orders;
      });

      const newDriver = sortedDrivers[0];

      // Create new assignment
      const { error: assignError } = await supabase
        .from('driver_assignments')
        .insert({
          order_id: assignment.order_id,
          driver_id: newDriver.driver_id,
          status: 'pending',
        });

      if (assignError) {
        console.error(`Error creating new assignment for order ${assignment.order_id}:`, assignError);
        continue;
      }

      // Update order with new driver
      await supabase
        .from('orders')
        .update({ driver_id: newDriver.driver_id, status: 'menunggu_driver' })
        .eq('id', assignment.order_id);

      console.log(`Reassigned order ${assignment.order_id} to driver ${newDriver.driver_id}`);
      reassigned++;
    }

    return new Response(
      JSON.stringify({ 
        message: 'Timeout check completed',
        processed,
        reassigned,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in check-driver-timeout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
