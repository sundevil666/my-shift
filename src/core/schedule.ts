import type { SchedulePattern, ShiftCode, ShiftDefinition } from 'src/models/app';

const DAY_MS = 86_400_000;

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function shiftCodeForDate(date: Date, pattern: SchedulePattern): ShiftCode {
  if (!pattern.sequence.length) return 'off';
  const start = new Date(`${pattern.startDate}T00:00:00`);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const distance = Math.floor((target.getTime() - start.getTime()) / DAY_MS);
  const weekDistance = Math.floor(distance / 7);
  const index =
    ((weekDistance % pattern.sequence.length) + pattern.sequence.length) %
    pattern.sequence.length;
  return pattern.sequence[index] ?? 'off';
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
): { date: Date; shift: ShiftDefinition } | null {
  for (const offset of [-1, 0]) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const code = shiftCodeForDate(date, pattern);
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
): { date: Date; shift: ShiftDefinition } | null {
  for (let offset = 0; offset < pattern.sequence.length * 7 * 3; offset += 1) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const code = shiftCodeForDate(date, pattern);
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
