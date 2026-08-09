-- Run this in Supabase SQL Editor after BOTH approved owners sign in with Google.
-- Replace both UUID placeholders with IDs from Authentication -> Users.

UPDATE public.users
SET role = 'owner', updated_at = now()
WHERE id IN (
  '5aac8634-b516-4432-a91e-8520f626f4e0',
  'REPLACE_WITH_SECOND_OWNER_USER_ID'
);

-- Verify both owner accounts.
SELECT id, role, name, phone
FROM public.users
WHERE id IN (
  '5aac8634-b516-4432-a91e-8520f626f4e0',
  'REPLACE_WITH_SECOND_OWNER_USER_ID'
);
