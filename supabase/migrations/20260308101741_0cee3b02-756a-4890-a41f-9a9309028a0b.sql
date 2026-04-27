
-- Drop the restrictive policy and recreate as permissive
DROP POLICY "Authenticated users can view pending concerns" ON public.concerns;
DROP POLICY "Users can view their own concerns" ON public.concerns;

-- Permissive: users can see their own concerns (any status)
CREATE POLICY "Users can view their own concerns"
  ON public.concerns FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Permissive: authenticated users can see all pending concerns (for provider map)
CREATE POLICY "Authenticated users can view pending concerns"
  ON public.concerns FOR SELECT TO authenticated
  USING (status = 'pending');
