-- Fix overly permissive INSERT policies

-- Drop the overly permissive "Anyone can create OTP" policy
DROP POLICY IF EXISTS "Anyone can create OTP" ON public.otp_verifications;

-- Drop the overly permissive "Allow order items creation with order" policy  
DROP POLICY IF EXISTS "Allow order items creation with order" ON public.order_items;

-- Create more restrictive order_items INSERT policy
-- Only allow insert if the order belongs to the current user or is anonymous
CREATE POLICY "Allow order items creation with valid order"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      orders.user_id = auth.uid() 
      OR (orders.user_id IS NULL AND auth.uid() IS NULL)
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  )
);