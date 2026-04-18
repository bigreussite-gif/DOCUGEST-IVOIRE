-- DocuGest Ivoire - Authentication Sync & Fixes
-- Syncs auth.users with public.users and sets up the trigger

-- 1. Create the sync function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Backfill existing users (especially bigreussite@gmail.com)
INSERT INTO public.users (id, full_name, email, role)
SELECT 
  id, 
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', email), 
  email, 
  'user'
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;

-- 4. Promote bigreussite@gmail.com to super_admin as it seems to be the owner/admin account
UPDATE public.users SET role = 'super_admin' WHERE email = 'bigreussite@gmail.com';
