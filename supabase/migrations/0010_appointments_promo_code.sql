-- Add promo_code to appointments so applied promotions are recorded on the
-- booking (previously only the discount amount was stored).
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS promo_code text;
