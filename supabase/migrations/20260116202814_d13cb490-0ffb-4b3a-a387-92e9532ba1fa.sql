-- Fix 1: Add explicit SELECT deny policy for otp_verifications to prevent OTP code exposure
-- OTP verification should only happen server-side via edge functions
CREATE POLICY "Deny all SELECT on otp_verifications"
ON public.otp_verifications
FOR SELECT
USING (false);

-- Fix 2: Add explicit UPDATE policy for otp_verifications (only server-side via service role)
CREATE POLICY "Deny all UPDATE on otp_verifications"
ON public.otp_verifications
FOR UPDATE
USING (false);

-- Fix 3: Add explicit DELETE policy for otp_verifications
CREATE POLICY "Deny all DELETE on otp_verifications"
ON public.otp_verifications
FOR DELETE
USING (false);

-- Fix 4: Enable RLS on otp_rate_limits and add deny policies
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deny all SELECT on otp_rate_limits"
ON public.otp_rate_limits
FOR SELECT
USING (false);

CREATE POLICY "Deny all INSERT on otp_rate_limits"
ON public.otp_rate_limits
FOR INSERT
WITH CHECK (false);

CREATE POLICY "Deny all UPDATE on otp_rate_limits"
ON public.otp_rate_limits
FOR UPDATE
USING (false);

CREATE POLICY "Deny all DELETE on otp_rate_limits"
ON public.otp_rate_limits
FOR DELETE
USING (false);

-- Fix 5: Add policy to prevent anonymous users from reading any orders
-- Anonymous orders can only be created, not read back by anonymous users
CREATE POLICY "Anonymous cannot read orders"
ON public.orders
FOR SELECT
USING (
  -- Either you're the authenticated owner of the order
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR 
  -- Or you're an admin
  has_role(auth.uid(), 'admin'::app_role)
);