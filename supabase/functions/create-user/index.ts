import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { 
      email, 
      password, 
      nama, 
      noWhatsapp, 
      role, 
      wilayahId, 
      warungId,
      registrationId 
    } = await req.json();

    console.log('Creating user:', { email, nama, role });

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(authError.message);
    }

    console.log('User created:', authData.user.id);

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      nama,
      no_whatsapp: noWhatsapp,
      wilayah_id: role === 'driver' ? wilayahId : null,
      is_verified: true,
      is_active: true,
    });

    if (profileError) {
      console.error('Profile error:', profileError);
      throw new Error('Failed to create profile: ' + profileError.message);
    }

    // Create role
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: authData.user.id,
      role,
    });

    if (roleError) {
      console.error('Role error:', roleError);
      throw new Error('Failed to create role: ' + roleError.message);
    }

    // Create driver stats and status if driver
    if (role === 'driver') {
      await supabase.from('driver_stats').insert({
        driver_id: authData.user.id,
      });
      
      await supabase.from('driver_status').insert({
        driver_id: authData.user.id,
        wilayah_id: wilayahId,
        is_online: false,
      });
    }

    // Assign warung to mitra if selected
    if (role === 'mitra' && warungId) {
      await supabase
        .from('warungs')
        .update({ owner_id: authData.user.id })
        .eq('id', warungId);
    }

    // Update registration status if provided
    if (registrationId) {
      await supabase
        .from('pending_registrations')
        .update({ 
          status: 'approved', 
          processed_at: new Date().toISOString() 
        })
        .eq('id', registrationId);
    }

    console.log('User creation completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        message: 'User created successfully' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to create user' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
