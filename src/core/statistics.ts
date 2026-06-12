import {
  calendarOverrideForDate,
  dateKey,
  resolvedShiftCodeForDate,
  shiftEndDateTime,
} from 'src/core/schedule';
import type { CalendarOverrideType, WorkProfile } from 'src/models/app';

const DAY_MS = 86_400_000;

export type StatisticsPeriod = 'month' | 'year' | 'all';

export interface WorkStatistics {
  from: string;
  to: string;
  totalShifts: number;
  totalHours: number;
  scheduledDaysOff: number;
  overrides: Record<CalendarOverrideType, number>;
  shifts: Array<{ id: string; count: number; hours: number }>;
}

export function calculateWorkStatistics(
  profile: WorkProfile,
  period: StatisticsPeriod,
  now = new Date(),
): WorkStatistics {
  const today = atStartOfDay(now);
  const trackingStart = parseDate(profile.trackingStartDate);
  const periodStart =
    period === 'month'
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : period === 'year'
        ? new Date(today.getFullYear(), 0, 1)
        : trackingStart;
  const from = periodStart.getTime() > trackingStart.getTime() ? periodStart : trackingStart;
  const shiftTotals = new Map(profile.shifts.map((shift) => [shift.id, { count: 0, hours: 0 }]));
  const overrides: Record<CalendarOverrideType, number> = {
    'day-off': 0,
    vacation: 0,
    'sick-leave': 0,
    'extra-shift': 0,
    'week-shift': 0,
  };
  let totalShifts = 0;
  let totalHours = 0;
  let scheduledDaysOff = 0;

  if (from.getTime() <= today.getTime()) {
    for (const date = new Date(from); date.getTime() <= today.getTime(); date.setDate(date.getDate() + 1)) {
      const override = calendarOverrideForDate(date, profile.calendarOverrides);
      if (override) overrides[override.type] += 1;
      const shiftId = resolvedShiftCodeForDate(date, profile.pattern, profile.calendarOverrides);
      const shift = profile.shifts.find((item) => item.id === shiftId);
      if (!shift) {
        if (!override) scheduledDaysOff += 1;
        continue;
      }
      if (shiftEndDateTime(date, shift).getTime() > now.getTime()) continue;
      const hours = shiftDurationHours(shift.startTime, shift.endTime);
      const total = shiftTotals.get(shift.id);
      if (total) {
        total.count += 1;
        total.hours += hours;
      }
      totalShifts += 1;
      totalHours += hours;
    }
  }

  return {
    from: dateKey(from),
    to: dateKey(today),
    totalShifts,
    totalHours,
    scheduledDaysOff,
    overrides,
    shifts: profile.shifts.map((shift) => ({
      id: shift.id,
      ...(shiftTotals.get(shift.id) ?? { count: 0, hours: 0 }),
    })),
  };
}

export function employmentDuration(startDate: string, now = new Date()) {
  const start = parseDate(startDate);
  const end = atStartOfDay(now);
  if (start.getTime() > end.getTime()) return { years: 0, months: 0, days: 0 };

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();
  if (days < 0) {
    months -= 1;
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function daysBetween(startDate: string, endDate: string): number {
  return Math.max(0, Math.floor((parseDate(endDate).getTime() - parseDate(startDate).getTime()) / DAY_MS) + 1);
}

function parseDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

function atStartOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function shiftDurationHours(startTime: string, endTime: string): number {
  const [startHours = 0, startMinutes = 0] = startTime.split(':').map(Number);
  const [endHours = 0, endMinutes = 0] = endTime.split(':').map(Number);
  const start = startHours * 60 + startMinutes;
  let end = endHours * 60 + endMinutes;
  if (end <= start) end += 24 * 60;
  return (end - start) / 60;
}
