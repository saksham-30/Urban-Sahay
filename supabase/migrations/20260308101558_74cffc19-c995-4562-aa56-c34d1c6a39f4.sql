
-- Allow all authenticated users to view pending concerns (for provider map)
CREATE POLICY "Authenticated users can view pending concerns"
  ON public.concerns FOR SELECT TO authenticated
  USING (status = 'pending');
