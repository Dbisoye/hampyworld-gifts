-- Fix orders table SELECT policy - remove the "Anonymous cannot read orders" policy
-- which has a logic flaw (allows any authenticated user to read with auth.uid() IS NOT NULL)
DROP POLICY IF EXISTS "Anonymous cannot read orders" ON public.orders;

-- The existing "Users can view their own orders" policy is correct (auth.uid() = user_id)
-- And "Admins can view all orders" allows admins access
-- No need to add a new policy as these two cover the use cases correctly

-- Add DENY INSERT policy on otp_verifications to prevent spam attacks
-- OTP records should only be created by the edge function using service role
CREATE POLICY "Deny all INSERT on otp_verifications"
ON public.otp_verifications
FOR INSERT
WITH CHECK (false);