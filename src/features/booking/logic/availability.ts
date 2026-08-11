import { toDateKey } from "@/lib/format";
import type {
  AvailabilityConfig,
  AvailabilityWeekday,
  DayAvailabilityStatus,
  SlotGroup,
  SlotStatus,
  TimeRange,
} from "@/types";

const SLOT_STEP_MINUTES = 30;

/** An occupied slot (a booked appointment's start/end, or a blocked range). */
export interface OccupiedSlot {
  start: string;
  end: string;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isWithinVacation(config: AvailabilityConfig, dateKey: string) {
  return config.vacations.some(
    (vacation) => dateKey >= vacation.start && dateKey <= vacation.end
  );
}

function getEffectiveRanges(config: AvailabilityConfig, dateKey: string, weekday: AvailabilityWeekday): TimeRange[] {
  return config.overrides[dateKey] ?? config.weeklyTemplate[weekday];
}

function getBlockedRangesForDate(config: AvailabilityConfig, dateKey: string) {
  return config.blockedTimes
    .filter((block) => block.date === dateKey)
    .map((block) => block.range);
}

interface SlotCandidate {
  time: string;
  minutes: number;
  isFull: boolean;
}

function buildCandidates(
  config: AvailabilityConfig,
  dateKey: string,
  occupiedSlots: OccupiedSlot[],
  ranges: TimeRange[],
  durationMinutes: number,
  now: Date
): SlotCandidate[] {
  const { bufferMinutes, minimumNoticeHours, maxBookingsPerDay } = config.bookingRules;
  const dayIsMaxedOut = occupiedSlots.length >= maxBookingsPerDay;

  const isToday = dateKey === toDateKey(now);
  const earliestBookableMinutes = isToday
    ? now.getHours() * 60 + now.getMinutes() + minimumNoticeHours * 60
    : -Infinity;

  const occupied = [
    ...occupiedSlots.map((slot) => ({ start: toMinutes(slot.start) - bufferMinutes, end: toMinutes(slot.end) + bufferMinutes })),
    ...getBlockedRangesForDate(config, dateKey).map((r) => ({ start: toMinutes(r.start), end: toMinutes(r.end) })),
  ];

  const candidates: SlotCandidate[] = [];

  for (const range of ranges) {
    const rangeStart = toMinutes(range.start);
    const rangeEnd = toMinutes(range.end);

    for (
      let slotStart = rangeStart;
      slotStart + durationMinutes <= rangeEnd;
      slotStart += SLOT_STEP_MINUTES
    ) {
      if (slotStart < earliestBookableMinutes) continue;

      const slotEnd = slotStart + durationMinutes;
      const overlapsOccupied = occupied.some(
        (block) => slotStart < block.end && block.start < slotEnd
      );

      candidates.push({
        time: toTimeString(slotStart),
        minutes: slotStart,
        isFull: overlapsOccupied || dayIsMaxedOut,
      });
    }
  }

  return candidates;
}

function groupCandidates(candidates: SlotCandidate[]): SlotGroup[] {
  const groups: { label: string; test: (m: number) => boolean }[] = [
    { label: "Pagi", test: (m) => m < 12 * 60 },
    { label: "Siang", test: (m) => m >= 12 * 60 && m < 18 * 60 },
    { label: "Malam", test: (m) => m >= 18 * 60 },
  ];

  return groups
    .map((group): SlotGroup => {
      const slots = candidates
        .filter((c) => group.test(c.minutes))
        .map((c) => ({ time: c.time, status: (c.isFull ? "full" : "available") as SlotStatus }));

      const availableCount = slots.filter((s) => s.status === "available").length;
      const status: SlotStatus =
        slots.length === 0 || availableCount === 0
          ? "full"
          : availableCount <= 2
            ? "limited"
            : "available";

      return { label: group.label, status, slots };
    })
    .filter((group) => group.slots.length > 0);
}

export function getDayTimeSlots(
  date: Date,
  durationMinutes: number,
  config: AvailabilityConfig,
  now: Date = new Date(),
  occupiedSlots: OccupiedSlot[] = []
): SlotGroup[] {
  const dateKey = toDateKey(date);
  const weekday = date.getDay() as AvailabilityWeekday;

  if (isWithinVacation(config, dateKey)) return [];

  const ranges = getEffectiveRanges(config, dateKey, weekday);
  if (ranges.length === 0) return [];

  const candidates = buildCandidates(config, dateKey, occupiedSlots, ranges, durationMinutes, now);
  return groupCandidates(candidates);
}

export function getDayStatus(
  date: Date,
  durationMinutes: number,
  config: AvailabilityConfig,
  now: Date = new Date(),
  occupiedSlots: OccupiedSlot[] = []
): DayAvailabilityStatus {
  const dateKey = toDateKey(date);
  const today = startOfDay(now);
  const target = startOfDay(date);

  if (target < today) return "past";

  const { bookingWindowDays } = config.bookingRules;
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + bookingWindowDays);
  if (target > windowEnd) return "outside-window";

  if (isWithinVacation(config, dateKey)) return "closed";

  const weekday = date.getDay() as AvailabilityWeekday;
  const ranges = getEffectiveRanges(config, dateKey, weekday);
  if (ranges.length === 0) return "closed";

  const groups = getDayTimeSlots(date, durationMinutes, config, now, occupiedSlots);
  const totalSlots = groups.reduce((sum, g) => sum + g.slots.length, 0);
  const availableSlots = groups.reduce(
    (sum, g) => sum + g.slots.filter((s) => s.status === "available").length,
    0
  );

  if (totalSlots === 0 || availableSlots === 0) return "full";
  if (availableSlots <= 3) return "limited";
  return "available";
}

export function getMonthAvailability(
  year: number,
  month: number,
  durationMinutes: number,
  config: AvailabilityConfig,
  now: Date = new Date(),
  occupiedByDate: Record<string, OccupiedSlot[]> = {}
): Map<string, DayAvailabilityStatus> {
  const map = new Map<string, DayAvailabilityStatus>();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = toDateKey(date);
    map.set(dateKey, getDayStatus(date, durationMinutes, config, now, occupiedByDate[dateKey] ?? []));
  }

  return map;
}
