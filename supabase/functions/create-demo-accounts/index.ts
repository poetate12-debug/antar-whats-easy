import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const results: any[] = [];

    // Demo accounts to create
    const demoAccounts = [
      { 
        nama: "Pelanggan Demo", 
        no_whatsapp: "081111111111", 
        role: "pelanggan" as const,
        password: "Demo123!"
      },
      { 
        nama: "Driver Demo", 
        no_whatsapp: "082222222222", 
        role: "driver" as const,
        password: "Demo123!",
        wilayah_id: null // Will be set to first wilayah
      },
    ];

    // Get first wilayah for driver
    const { data: wilayahs } = await supabase.from("wilayahs").select("id").limit(1);
    const firstWilayahId = wilayahs?.[0]?.id;

    for (const account of demoAccounts) {
      const email = `${account.no_whatsapp}@gelis.app`;
      
      console.log(`Creating account for ${account.nama} (${email})`);

      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("no_whatsapp", account.no_whatsapp)
        .maybeSingle();

      if (existingProfile) {
        console.log(`Account ${account.no_whatsapp} already exists, skipping`);
        results.push({ 
          nama: account.nama, 
          status: "already_exists",
          no_whatsapp: account.no_whatsapp 
        });
        continue;
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password: account.password,
        email_confirm: true,
      });

      if (authError) {
        console.error(`Error creating auth user ${account.nama}:`, authError);
        results.push({ 
          nama: account.nama, 
          status: "error", 
          error: authError.message 
        });
        continue;
      }

      const userId = authData.user.id;

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        user_id: userId,
        nama: account.nama,
        no_whatsapp: account.no_whatsapp,
        is_verified: true,
        is_active: true,
        wilayah_id: account.role === "driver" ? firstWilayahId : null,
      });

      if (profileError) {
        console.error(`Error creating profile for ${account.nama}:`, profileError);
      }

      // Create role
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: account.role,
      });

      if (roleError) {
        console.error(`Error creating role for ${account.nama}:`, roleError);
      }

      // If driver, create driver_stats and driver_status
      if (account.role === "driver") {
        await supabase.from("driver_stats").insert({
          driver_id: userId,
          total_orders: 5,
          completed_orders: 4,
          total_earnings: 50000,
          average_rating: 4.8,
          total_ratings: 4,
        });

        await supabase.from("driver_status").insert({
          driver_id: userId,
          is_online: true,
          wilayah_id: firstWilayahId,
        });
      }

      results.push({ 
        nama: account.nama, 
        status: "created",
        no_whatsapp: account.no_whatsapp,
        password: account.password,
        role: account.role
      });

      console.log(`Successfully created account for ${account.nama}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Demo accounts processed",
        accounts: results 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error creating demo accounts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
