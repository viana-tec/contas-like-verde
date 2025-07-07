-- Insert admin user directly into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@sistema.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"full_name": "Administrador"}',
  false,
  '',
  '',
  '',
  ''
);

-- Insert corresponding profile for the admin user
INSERT INTO public.profiles (
  user_id,
  full_name,
  email,
  role,
  status
) 
SELECT 
  u.id,
  'Administrador',
  'admin@sistema.com',
  'admin',
  'active'
FROM auth.users u 
WHERE u.email = 'admin@sistema.com';