INSERT INTO public.users (id, role, name)
SELECT
  au.id,
  'customer'::public.user_role,
  COALESCE(
    NULLIF(au.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(au.raw_user_meta_data ->> 'name', ''),
    NULLIF(au.email, ''),
    'Pengguna Denailss'
  )
FROM auth.users AS au
ON CONFLICT (id) DO NOTHING;
