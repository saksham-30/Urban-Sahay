
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _role app_role;
  _meta jsonb;
BEGIN
  _meta := NEW.raw_user_meta_data;
  
  -- Determine role, default to 'user'
  _role := COALESCE((_meta->>'role')::app_role, 'user');
  
  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);
  
  -- Insert profile based on role
  IF _role = 'user' THEN
    INSERT INTO public.profiles (user_id, full_name, phone, email)
    VALUES (
      NEW.id,
      COALESCE(_meta->>'full_name', ''),
      _meta->>'phone',
      NEW.email
    );
  ELSIF _role = 'service_provider' THEN
    INSERT INTO public.service_providers (user_id, full_name, service_type, city, phone, description, experience_years, hourly_rate)
    VALUES (
      NEW.id,
      COALESCE(_meta->>'full_name', ''),
      COALESCE(_meta->>'service_type', ''),
      COALESCE(_meta->>'city', ''),
      COALESCE(_meta->>'phone', ''),
      _meta->>'description',
      COALESCE((_meta->>'experience_years')::integer, 0),
      _meta->>'hourly_rate'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
