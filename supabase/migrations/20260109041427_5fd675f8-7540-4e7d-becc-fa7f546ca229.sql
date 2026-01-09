-- Remove the overly permissive SELECT and UPDATE policies that expose OTP codes
DROP POLICY IF EXISTS "Anyone can verify OTP" ON public.otp_verifications;
DROP POLICY IF EXISTS "Anyone can update OTP verification" ON public.otp_verifications;

-- Create a rate limiting table for tracking OTP attempts
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    attempt_count INTEGER NOT NULL DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access rate limits (edge functions use service role key)
-- No policies needed as edge functions use service role key which bypasses RLS