import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrackRequest {
  shipment_id?: string;
  awb_code?: string;
}

const getShiprocketToken = async (): Promise<string> => {
  const email = Deno.env.get("SHIPROCKET_EMAIL");
  const password = Deno.env.get("SHIPROCKET_PASSWORD");

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }

  const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Failed to authenticate with Shiprocket");
  }

  const data = await response.json();
  return data.token;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client with user's auth token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { shipment_id, awb_code }: TrackRequest = await req.json();

    if (!shipment_id && !awb_code) {
      return new Response(
        JSON.stringify({ error: "Either shipment_id or awb_code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!adminRole;

    // If not admin, verify user owns the order with this shipment
    if (!isAdmin) {
      let query = supabase
        .from("orders")
        .select("id, user_id")
        .eq("user_id", user.id);

      if (shipment_id) {
        query = query.eq("shiprocket_shipment_id", shipment_id);
      } else if (awb_code) {
        query = query.eq("tracking_number", awb_code);
      }

      const { data: order, error: orderError } = await query.maybeSingle();

      if (orderError || !order) {
        return new Response(
          JSON.stringify({ error: "Forbidden: You don't have access to this tracking information" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const token = await getShiprocketToken();

    let url: string;
    if (awb_code) {
      url = `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awb_code)}`;
    } else {
      url = `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${encodeURIComponent(shipment_id!)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Shiprocket tracking error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch tracking info" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    console.log("Shiprocket tracking result:", result);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error tracking shipment:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
