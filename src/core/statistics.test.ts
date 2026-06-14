import { describe, expect, it } from 'vitest';
import { createDhlWorkProfile } from './defaults';
import { calculateWorkStatistics, daysBetween, employmentDuration } from './statistics';
import type { WorkProfile } from 'src/models/app';

function profile(overrides: Partial<WorkProfile> = {}): WorkProfile {
  return {
    ...createDhlWorkProfile(),
    employmentStartDate: '2026-01-01',
    trackingStartDate: '2026-01-01',
    pattern: {
      id: 'test',
      name: 'Test',
      startDate: '2026-01-05',
      sequence: ['shift-1'],
    },
    calendarOverrides: [],
    ...overrides,
  };
}

describe('work statistics', () => {
  it('counts only completed shifts and scheduled days off', () => {
    const result = calculateWorkStatistics(profile(), 'all', new Date(2026, 0, 7, 10));
    expect(result.totalShifts).toBe(4);
    expect(result.totalHours).toBe(32);
    expect(result.scheduledDaysOff).toBe(2);
    expect(result.shifts.find(({ id }) => id === 'shift-1')).toMatchObject({
      count: 4,
      hours: 32,
    });
  });

  it('counts override days and applies extra shifts', () => {
    const result = calculateWorkStatistics(
      profile({
        calendarOverrides: [
          {
            id: 'vacation',
            type: 'vacation',
            startDate: '2026-01-05',
            endDate: '2026-01-05',
          },
          {
            id: 'extra',
            type: 'extra-shift',
            startDate: '2026-01-10',
            endDate: '2026-01-10',
            shiftId: 'shift-3',
          },
        ],
      }),
      'all',
      new Date(2026, 0, 11, 12),
    );

    expect(result.overrides.vacation).toBe(1);
    expect(result.overrides['extra-shift']).toBe(1);
    expect(result.totalShifts).toBe(7);
    expect(result.totalHours).toBe(56);
    expect(result.shifts.find(({ id }) => id === 'shift-3')?.count).toBe(1);
  });

  it('limits month and year periods to tracking start', () => {
    const tracked = profile({ trackingStartDate: '2026-02-10' });
    expect(calculateWorkStatistics(tracked, 'month', new Date(2026, 1, 12, 23)).from)
      .toBe('2026-02-10');
    expect(calculateWorkStatistics(tracked, 'year', new Date(2026, 1, 12, 23)).from)
      .toBe('2026-02-10');
  });

  it('returns empty totals when tracking starts in the future', () => {
    const result = calculateWorkStatistics(
      profile({ trackingStartDate: '2027-01-01' }),
      'all',
      new Date(2026, 0, 1),
    );
    expect(result.totalShifts).toBe(0);
    expect(result.totalHours).toBe(0);
    expect(result.scheduledDaysOff).toBe(0);
  });

  it('calculates employment duration across month and year boundaries', () => {
    expect(employmentDuration('2024-01-31', new Date(2025, 2, 2))).toEqual({
      years: 1,
      months: 1,
      days: 2,
    });
    expect(employmentDuration('2027-01-01', new Date(2026, 0, 1))).toEqual({
      years: 0,
      months: 0,
      days: 0,
    });
  });

  it('counts date ranges inclusively and clamps reversed ranges', () => {
    expect(daysBetween('2026-01-01', '2026-01-01')).toBe(1);
    expect(daysBetween('2026-01-01', '2026-01-03')).toBe(3);
    expect(daysBetween('2026-01-03', '2026-01-01')).toBe(0);
  });
});
