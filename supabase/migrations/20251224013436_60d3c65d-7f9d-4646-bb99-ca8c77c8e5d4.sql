-- Update handle_new_user function with input validation for full_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  validated_full_name text;
BEGIN
  -- Validate and sanitize full_name: max 255 characters, trim whitespace
  validated_full_name := NULLIF(TRIM(LEFT(COALESCE(new.raw_user_meta_data ->> 'full_name', ''), 255)), '');
  
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, validated_full_name);
  RETURN new;
END;
$$;