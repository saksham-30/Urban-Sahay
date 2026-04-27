
-- Create storage bucket for selfie uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('kyc-selfies', 'kyc-selfies', false);

-- Create KYC verifications table
CREATE TABLE public.kyc_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_number text,
  aadhaar_number text,
  aadhaar_verified boolean NOT NULL DEFAULT false,
  selfie_url text,
  selfie_verified boolean NOT NULL DEFAULT false,
  is_fully_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC" ON public.kyc_verifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own KYC" ON public.kyc_verifications
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own KYC" ON public.kyc_verifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_kyc_updated_at
  BEFORE UPDATE ON public.kyc_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for kyc-selfies bucket
CREATE POLICY "Users can upload their own selfie" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'kyc-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own selfie" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'kyc-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own selfie" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'kyc-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);
