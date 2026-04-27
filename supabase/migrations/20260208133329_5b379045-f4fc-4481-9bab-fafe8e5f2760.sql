
CREATE TABLE public.concerns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  location TEXT NOT NULL,
  service_type TEXT NOT NULL,
  concern TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.concerns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own concerns"
ON public.concerns FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own concerns"
ON public.concerns FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own concerns"
ON public.concerns FOR UPDATE
USING (user_id = auth.uid());

CREATE TRIGGER update_concerns_updated_at
BEFORE UPDATE ON public.concerns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
