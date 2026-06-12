import type {
  CalendarOverride,
  SchedulePattern,
  ShiftCode,
  ShiftDefinition,
} from 'src/models/app';

const DAY_MS = 86_400_000;
export const FIRST_BREAK_AFTER_SHIFT_START_MINUTES = 135;
export const FIRST_BREAK_NOTIFICATION_BEFORE_MINUTES = 5;

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftCodeForDate(date: Date, pattern: SchedulePattern): ShiftCode {
  if (!pattern.sequence.length) return 'off';
  if (date.getDay() === 0 || date.getDay() === 6) return 'off';
  const start = new Date(`${pattern.startDate}T00:00:00`);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const distance = Math.floor((target.getTime() - start.getTime()) / DAY_MS);
  const weekDistance = Math.floor(distance / 7);
  const index =
    ((weekDistance % pattern.sequence.length) + pattern.sequence.length) %
    pattern.sequence.length;
  return pattern.sequence[index] ?? 'off';
}

export function calendarOverrideForDate(
  date: Date,
  overrides: CalendarOverride[],
): CalendarOverride | undefined {
  const key = dateKey(date);
  const matches = overrides.filter(
    (override) => override.startDate <= key && override.endDate >= key,
  );
  return matches.find((override) => override.type !== 'week-shift') ?? matches[0];
}

export function resolvedShiftCodeForDate(
  date: Date,
  pattern: SchedulePattern,
  overrides: CalendarOverride[] = [],
): ShiftCode {
  const override = calendarOverrideForDate(date, overrides);
  if (!override) return shiftCodeForDate(date, pattern);
  if (override.type === 'week-shift') {
    return date.getDay() === 0 || date.getDay() === 6 ? 'off' : (override.shiftId ?? 'off');
  }
  return override.type === 'extra-shift' && override.shiftId ? override.shiftId : 'off';
}

export function weekDateRange(date: Date): { startDate: string; endDate: string } {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = monday.getDay();
  monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return { startDate: dateKey(monday), endDate: dateKey(sunday) };
}

export function calendarOverridesInRange(
  startDate: string,
  endDate: string,
  overrides: CalendarOverride[],
): CalendarOverride[] {
  return overrides.filter(
    (override) => override.startDate <= endDate && override.endDate >= startDate,
  );
}

export function shiftDateTime(date: Date, time: string): Date {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
}

export function shiftEndDateTime(date: Date, shift: ShiftDefinition): Date {
  const start = shiftDateTime(date, shift.startTime);
  const end = shiftDateTime(date, shift.endTime);
  if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
  return end;
}

export function currentWorkingShift(
  now: Date,
  pattern: SchedulePattern,
  shifts: ShiftDefinition[],
  overrides: CalendarOverride[] = [],
): { date: Date; shift: ShiftDefinition } | null {
  for (const offset of [-1, 0]) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const code = resolvedShiftCodeForDate(date, pattern, overrides);
    if (code === 'off') continue;
    const shift = shifts.find((item) => item.id === code);
    if (!shift) continue;
    const start = shiftDateTime(date, shift.startTime);
    const end = shiftEndDateTime(date, shift);
    if (start.getTime() <= now.getTime() && now.getTime() < end.getTime()) {
      return { date, shift };
    }
  }
  return null;
}

export function nextWorkingShift(
  now: Date,
  pattern: SchedulePattern,
  shifts: ShiftDefinition[],
  overrides: CalendarOverride[] = [],
): { date: Date; shift: ShiftDefinition } | null {
  for (let offset = 0; offset < pattern.sequence.length * 7 * 3; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const code = resolvedShiftCodeForDate(date, pattern, overrides);
    if (code === 'off') continue;
    const shift = shifts.find((item) => item.id === code);
    if (!shift) continue;
    const start = shiftDateTime(date, shift.startTime);
    if (start.getTime() > now.getTime()) return { date, shift };
  }
  return null;
}

export function formatCountdown(target: Date, now: Date): string {
  const totalMinutes = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 60_000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  return [
    days ? `${days}d` : '',
    `${String(hours).padStart(2, '0')}h`,
    `${String(minutes).padStart(2, '0')}m`,
  ]
    .filter(Boolean)
    .join(' ');
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}
