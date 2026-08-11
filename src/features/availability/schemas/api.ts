import { z } from "zod";

const timeRangeSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/, "Jam harus dalam format HH:MM."),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Jam harus dalam format HH:MM."),
});

const dateKeySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus dalam format YYYY-MM-DD.");

const weekdayRecordSchema = z.record(
  z.union([z.literal("0"), z.literal("1"), z.literal("2"), z.literal("3"), z.literal("4"), z.literal("5"), z.literal("6")]),
  z.array(timeRangeSchema)
);

export const availabilityConfigSchema = z.object({
  weeklyTemplate: weekdayRecordSchema,
  overrides: z.record(z.string(), z.array(timeRangeSchema)),
  vacations: z.array(z.object({ start: dateKeySchema, end: dateKeySchema, reason: z.string().trim().min(1) })),
  blockedTimes: z.array(z.object({ date: dateKeySchema, range: timeRangeSchema, reason: z.string().trim().min(1) })),
  bookingRules: z.object({
    bookingWindowDays: z.number().int().positive("Jendela booking harus lebih dari 0 hari."),
    minimumNoticeHours: z.number().int().nonnegative(),
    maxBookingsPerDay: z.number().int().positive("Maksimal booking per hari harus lebih dari 0."),
    bufferMinutes: z.number().int().nonnegative(),
  }),
});

export type AvailabilityConfigInput = z.infer<typeof availabilityConfigSchema>;
