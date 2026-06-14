import { describe, expect, it } from 'vitest';
import { dhlDefaultShifts } from 'src/core/defaults';
import {
  calendarOverrideForDate,
  calendarOverridesInRange,
  currentWorkingShift,
  dateKey,
  formatCountdown,
  nextWorkingShift,
  resolvedShiftCodeForDate,
  shiftCodeForDate,
  shiftEndDateTime,
  weekDateRange,
} from './schedule';
import type { CalendarOverride, SchedulePattern } from 'src/models/app';

const pattern: SchedulePattern = {
  id: 'test',
  name: 'Test',
  startDate: '2026-01-05',
  sequence: ['shift-1', 'shift-3', 'shift-2'],
};

const overrides: CalendarOverride[] = [
  {
    id: 'week',
    type: 'week-shift',
    startDate: '2026-01-12',
    endDate: '2026-01-18',
    shiftId: 'shift-2',
  },
  {
    id: 'vacation',
    type: 'vacation',
    startDate: '2026-01-14',
    endDate: '2026-01-14',
  },
  {
    id: 'extra',
    type: 'extra-shift',
    startDate: '2026-01-17',
    endDate: '2026-01-17',
    shiftId: 'shift-1',
  },
];

describe('schedule', () => {
  it('formats local dates without UTC shifts', () => {
    expect(dateKey(new Date(2026, 0, 2, 23, 30))).toBe('2026-01-02');
  });

  it('rotates shifts by work week and keeps weekends off', () => {
    expect(shiftCodeForDate(new Date(2026, 0, 5), pattern)).toBe('shift-1');
    expect(shiftCodeForDate(new Date(2026, 0, 12), pattern)).toBe('shift-3');
    expect(shiftCodeForDate(new Date(2026, 0, 19), pattern)).toBe('shift-2');
    expect(shiftCodeForDate(new Date(2026, 0, 10), pattern)).toBe('off');
    expect(shiftCodeForDate(new Date(2025, 11, 29), pattern)).toBe('shift-2');
  });

  it('returns off for an empty pattern', () => {
    expect(shiftCodeForDate(new Date(2026, 0, 5), { ...pattern, sequence: [] })).toBe('off');
  });

  it('gives specific day overrides priority over a week override', () => {
    expect(calendarOverrideForDate(new Date(2026, 0, 14), overrides)?.id).toBe('vacation');
    expect(resolvedShiftCodeForDate(new Date(2026, 0, 13), pattern, overrides)).toBe('shift-2');
    expect(resolvedShiftCodeForDate(new Date(2026, 0, 14), pattern, overrides)).toBe('off');
    expect(resolvedShiftCodeForDate(new Date(2026, 0, 17), pattern, overrides)).toBe('shift-1');
  });

  it('calculates Monday-to-Sunday ranges including Sundays', () => {
    expect(weekDateRange(new Date(2026, 0, 11))).toEqual({
      startDate: '2026-01-05',
      endDate: '2026-01-11',
    });
  });

  it('finds all overrides overlapping a date range', () => {
    expect(calendarOverridesInRange('2026-01-14', '2026-01-17', overrides).map(({ id }) => id))
      .toEqual(['week', 'vacation', 'extra']);
  });

  it('moves overnight shift endings to the next day', () => {
    const end = shiftEndDateTime(new Date(2026, 0, 5), dhlDefaultShifts[2]!);
    expect(end).toEqual(new Date(2026, 0, 6, 6));
  });

  it('recognizes an overnight shift after midnight', () => {
    const result = currentWorkingShift(
      new Date(2026, 0, 6, 1),
      { ...pattern, sequence: ['shift-3'] },
      dhlDefaultShifts,
    );
    expect(result?.shift.id).toBe('shift-3');
    expect(dateKey(result!.date)).toBe('2026-01-05');
  });

  it('uses start-inclusive and end-exclusive shift boundaries', () => {
    const singleShift = { ...pattern, sequence: ['shift-1'] };
    expect(currentWorkingShift(new Date(2026, 0, 5, 6), singleShift, dhlDefaultShifts)?.shift.id)
      .toBe('shift-1');
    expect(currentWorkingShift(new Date(2026, 0, 5, 14), singleShift, dhlDefaultShifts)).toBeNull();
  });

  it('finds the next future shift and skips the current start', () => {
    const singleShift = { ...pattern, sequence: ['shift-1'] };
    expect(nextWorkingShift(new Date(2026, 0, 5, 6), singleShift, dhlDefaultShifts)?.date)
      .toEqual(new Date(2026, 0, 6));
    expect(nextWorkingShift(new Date(2026, 0, 9, 15), singleShift, dhlDefaultShifts)?.date)
      .toEqual(new Date(2026, 0, 12));
  });

  it('formats countdowns and clamps expired targets to zero', () => {
    const now = new Date(2026, 0, 1, 10);
    expect(formatCountdown(new Date(2026, 0, 2, 12, 5), now)).toBe('1d 02h 05m');
    expect(formatCountdown(new Date(2026, 0, 1, 9), now)).toBe('00h 00m');
  });
});
