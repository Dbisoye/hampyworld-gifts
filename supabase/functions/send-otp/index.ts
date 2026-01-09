import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OTPRequest {
  identifier: string;
  type: "email" | "phone";
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const checkRateLimit = async (
  supabase: any,
  identifier: string,
  maxAttempts: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remainingAttempts: number }> => {
  const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Get recent attempts
  const { data: existingRecord, error: fetchError } = await supabase
    .from("otp_rate_limits")
    .select("*")
    .eq("identifier", identifier)
    .gte("window_start", windowStart.toISOString())
    .order("window_start", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchError) {
    console.error("Rate limit fetch error:", fetchError);
    // Allow on error but log it
    return { allowed: true, remainingAttempts: maxAttempts };
  }

  if (!existingRecord) {
    // Create new rate limit record
    await supabase
      .from("otp_rate_limits")
      .insert({
        identifier,
        attempt_count: 1,
        window_start: new Date().toISOString(),
      });
    return { allowed: true, remainingAttempts: maxAttempts - 1 };
  }

  if (existingRecord.attempt_count >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0 };
  }

  // Increment attempt count
  await supabase
    .from("otp_rate_limits")
    .update({ attempt_count: existingRecord.attempt_count + 1 })
    .eq("id", existingRecord.id);

  return { allowed: true, remainingAttempts: maxAttempts - existingRecord.attempt_count - 1 };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { identifier, type }: OTPRequest = await req.json();
    
    if (!identifier || !type) {
      return new Response(
        JSON.stringify({ error: "Identifier and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate identifier format
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier) || identifier.length > 255) {
        return new Response(
          JSON.stringify({ error: "Invalid email format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (type === "phone") {
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(identifier)) {
        return new Response(
          JSON.stringify({ error: "Invalid phone format" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check rate limit: max 3 OTP requests per identifier per hour
    const { allowed, remainingAttempts } = await checkRateLimit(supabase, identifier, 3, 60);
    
    if (!allowed) {
      return new Response(
        JSON.stringify({ error: "Too many OTP requests. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    const { error: dbError } = await supabase
      .from("otp_verifications")
      .insert({
        identifier,
        otp_code: otp,
        type,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === "email") {
      // Send email via Brevo
      const emailResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: { name: "HampyWorld", email: "noreply@hampyworld.com" },
          to: [{ email: identifier }],
          subject: "Your OTP for HampyWorld",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #8B4513; text-align: center;">HampyWorld</h1>
              <div style="background: #FFF8F0; padding: 30px; border-radius: 10px; text-align: center;">
                <h2>Your Verification Code</h2>
                <p style="font-size: 32px; font-weight: bold; color: #D97706; letter-spacing: 8px;">${otp}</p>
                <p style="color: #666;">This code will expire in 10 minutes.</p>
              </div>
              <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
                If you didn't request this code, please ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.text();
        console.error("Brevo email error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send email" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (type === "phone") {
      // Send SMS via Brevo
      const smsResponse = await fetch("https://api.brevo.com/v3/transactionalSMS/sms", {
        method: "POST",
        headers: {
          "accept": "application/json",
          "api-key": brevoApiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          sender: "HampyWorld",
          recipient: identifier,
          content: `Your HampyWorld verification code is: ${otp}. Valid for 10 minutes.`,
        }),
      });

      if (!smsResponse.ok) {
        const errorData = await smsResponse.text();
        console.error("Brevo SMS error:", errorData);
        return new Response(
          JSON.stringify({ error: "Failed to send SMS" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`OTP sent successfully to ${type}: ${identifier.substring(0, 3)}***`);

    return new Response(
      JSON.stringify({ success: true, message: `OTP sent to ${type}`, remainingAttempts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-otp:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
