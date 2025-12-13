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
      nama, 
      noWhatsapp, 
      password,
      alamat,
      role = 'pelanggan',
      wilayahId
    } = await req.json();

    console.log('Registering customer:', { nama, noWhatsapp, role });

    // Validate required fields
    if (!nama || !noWhatsapp || !password) {
      throw new Error('Nama, nomor WhatsApp, dan password wajib diisi');
    }

    if (password.length < 6) {
      throw new Error('Password minimal 6 karakter');
    }

    // Clean phone number
    const cleanPhone = noWhatsapp.replace(/\D/g, '');
    
    // Generate email from phone number
    const email = `${cleanPhone}@gelis.app`;

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === email);
    
    if (userExists) {
      throw new Error('Nomor WhatsApp sudah terdaftar');
    }

    // Create auth user with their password
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

    // Create profile with is_verified = false for non-pelanggan roles
    const needsVerification = role !== 'pelanggan';
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: authData.user.id,
      nama: nama.trim(),
      no_whatsapp: cleanPhone,
      alamat: alamat || null,
      wilayah_id: role === 'driver' ? wilayahId : null,
      is_verified: !needsVerification, // pelanggan verified by default
      is_active: true,
    });

    if (profileError) {
      console.error('Profile error:', profileError);
      // Rollback: delete auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Gagal membuat profil: ' + profileError.message);
    }

    // Create role
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: authData.user.id,
      role,
    });

    if (roleError) {
      console.error('Role error:', roleError);
      throw new Error('Gagal membuat role: ' + roleError.message);
    }

    // For non-pelanggan, also save to pending_registrations for admin tracking
    if (needsVerification) {
      await supabase.from('pending_registrations').insert({
        nama: nama.trim(),
        no_whatsapp: cleanPhone,
        requested_role: role,
        status: 'pending',
      });
      
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
    }

    console.log('Registration completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        userId: authData.user.id,
        needsVerification,
        message: needsVerification 
          ? 'Akun berhasil dibuat, menunggu verifikasi admin' 
          : 'Akun berhasil dibuat, silakan login'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: any) {
    console.error('Error registering:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Gagal mendaftar' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
