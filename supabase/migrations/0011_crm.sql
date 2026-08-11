-- CRM persistence (hand-authored): customer_notes table + customers.preferences.
--
-- One notes row per customer (owner's "little book" notebook). Preferences
-- (preferred time / shapes / colors) live as a jsonb column on customers.

CREATE TABLE IF NOT EXISTS public.customer_notes (
  customer_id uuid PRIMARY KEY NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  content text NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS customer_notes_owner_write ON public.customer_notes;
CREATE POLICY customer_notes_owner_write ON public.customer_notes
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');

DROP POLICY IF EXISTS customer_notes_select_self ON public.customer_notes;
CREATE POLICY customer_notes_select_self ON public.customer_notes
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.customers
      WHERE customers.id = customer_notes.customer_id
        AND customers.user_id = auth.uid()
    )
  );

ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS preferences jsonb;

-- Expenses table (finance) + RLS — owner-only bookkeeping.
CREATE TABLE IF NOT EXISTS public.expenses (
  id text PRIMARY KEY NOT NULL,
  description text NOT NULL,
  amount integer NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS expenses_date_idx ON public.expenses(date);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY expenses_owner_write ON public.expenses
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');
