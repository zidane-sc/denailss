-- Contact messages from the public "Kirim Pesan" form (hand-authored).
-- Anyone may submit; only the owner can list and mark messages read.

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS contact_messages_read_idx ON public.contact_messages(is_read, created_at);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone (anon or logged in) can submit a message; no auth gate on the public form.
CREATE POLICY contact_messages_insert_public ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- The inbox is owner-only: list, read (is_read), and delete.
CREATE POLICY contact_messages_owner_all ON public.contact_messages
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');
