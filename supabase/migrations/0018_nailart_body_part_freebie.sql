-- Nail art body part (hand/foot) + free add-ons (manicure/pedicure).
--
-- appointment_services.body_part records whether a nail-art appointment is
-- for hands or feet. appointment_add_ons stores the free service bundled with
-- that nail-art service (hand -> manicure, foot -> pedicure).

ALTER TABLE "public"."appointment_services"
  ADD COLUMN IF NOT EXISTS "body_part" text;
--> statement-breakpoint
CREATE TABLE "public"."appointment_add_ons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"service_id" text NOT NULL,
	"service_slug" text NOT NULL,
	"service_name" text NOT NULL,
	"body_part" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "public"."appointment_add_ons" ADD CONSTRAINT "appointment_add_ons_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "public"."appointment_add_ons" ADD CONSTRAINT "appointment_add_ons_service_id_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."services"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "appointment_add_ons_appointment_idx" ON "public"."appointment_add_ons" USING btree ("appointment_id");
--> statement-breakpoint
ALTER TABLE "public"."appointment_add_ons" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY appointment_add_ons_owner_all ON public.appointment_add_ons
  FOR ALL TO authenticated
  USING (public.current_user_role() = 'owner')
  WITH CHECK (public.current_user_role() = 'owner');
--> statement-breakpoint
CREATE POLICY appointment_add_ons_select_self ON public.appointment_add_ons
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.appointments
      JOIN public.customers ON customers.id = appointments.customer_id
      WHERE appointments.id = appointment_add_ons.appointment_id
        AND customers.user_id = auth.uid()
    )
  );
