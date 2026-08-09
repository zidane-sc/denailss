import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  index,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const userRoleEnum = pgEnum("user_role", ["owner", "customer"]);
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_deposit",
  "waiting_verification",
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);
export const depositStatusEnum = pgEnum("deposit_status", [
  "waiting_verification",
  "approved",
  "rejected",
]);
export const fulfillmentEnum = pgEnum("fulfillment_method", ["pickup", "delivery"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  role: userRoleEnum("role").notNull().default("customer"),
  name: text("name").notNull(),
  phone: text("phone"),
  ...timestamps,
});

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [uniqueIndex("customers_phone_unique").on(table.phone), index("customers_email_idx").on(table.email)]
);

export const services = pgTable(
  "services",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    shortDescription: text("short_description").notNull(),
    description: text("description").notNull(),
    priceFrom: integer("price_from").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    tiers: jsonb("tiers").notNull().default([]),
    requiresPickup: boolean("requires_pickup").notNull().default(false),
    depositApplicable: boolean("deposit_applicable").notNull().default(false),
    active: boolean("active").notNull().default(true),
    heroImage: text("hero_image").notNull(),
    gallerySeeds: jsonb("gallery_seeds").notNull().default([]),
    faq: jsonb("faq").notNull().default([]),
    priceNote: text("price_note"),
    ...timestamps,
  },
  (table) => [uniqueIndex("services_slug_unique").on(table.slug), index("services_active_idx").on(table.active)]
);

export const gallery = pgTable(
  "gallery",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    aspect: text("aspect").notNull(),
    style: text("style").notNull(),
    color: text("color").notNull(),
    occasion: text("occasion").notNull(),
    shape: text("shape").notNull(),
    difficulty: text("difficulty").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("gallery_slug_unique").on(table.slug)]
);

export const galleryImages = pgTable(
  "gallery_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    galleryId: text("gallery_id").notNull().references(() => gallery.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [index("gallery_images_gallery_idx").on(table.galleryId, table.sortOrder)]
);

export const availabilityTemplates = pgTable(
  "availability_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weekday: integer("weekday").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    ...timestamps,
  },
  (table) => [index("availability_templates_weekday_idx").on(table.weekday)]
);

export const availabilityOverrides = pgTable(
  "availability_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    ranges: jsonb("ranges").notNull().default([]),
    ...timestamps,
  },
  (table) => [uniqueIndex("availability_overrides_date_unique").on(table.date)]
);

export const blockedTimes = pgTable(
  "blocked_times",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    reason: text("reason").notNull(),
    ...timestamps,
  },
  (table) => [index("blocked_times_date_idx").on(table.date)]
);

export const appointments = pgTable(
  "appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingCode: text("booking_code").notNull(),
    customerId: uuid("customer_id").notNull().references(() => customers.id),
    date: date("date"),
    time: time("time"),
    durationMinutes: integer("duration_minutes").notNull(),
    designSlug: text("design_slug"),
    designTitle: text("design_title"),
    fulfillment: fulfillmentEnum("fulfillment"),
    subtotal: integer("subtotal").notNull(),
    discount: integer("discount").notNull().default(0),
    price: integer("price").notNull(),
    depositRequired: boolean("deposit_required").notNull().default(false),
    depositAmount: integer("deposit_amount"),
    depositProofUrl: text("deposit_proof_url"),
    depositStatus: depositStatusEnum("deposit_status"),
    depositRejectReason: text("deposit_reject_reason"),
    status: bookingStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("appointments_booking_code_unique").on(table.bookingCode),
    index("appointments_date_status_idx").on(table.date, table.status),
    index("appointments_customer_idx").on(table.customerId),
  ]
);

export const appointmentServices = pgTable(
  "appointment_services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    appointmentId: uuid("appointment_id").notNull().references(() => appointments.id, { onDelete: "cascade" }),
    serviceId: text("service_id").notNull().references(() => services.id),
    serviceSlug: text("service_slug").notNull(),
    serviceName: text("service_name").notNull(),
    tierKey: text("tier_key"),
    tierLabel: text("tier_label"),
    price: integer("price").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    ...timestamps,
  },
  (table) => [index("appointment_services_appointment_idx").on(table.appointmentId)]
);

export const schema = {
  users,
  customers,
  services,
  gallery,
  galleryImages,
  availabilityTemplates,
  availabilityOverrides,
  blockedTimes,
  appointments,
  appointmentServices,
};

export type DatabaseSchema = typeof schema;
