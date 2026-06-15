import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDhlWorkProfile } from 'src/core/defaults';
import { buildPushReminders, reminderMessage } from './push-notifications';

afterEach(() => {
  vi.useRealTimers();
});

describe('push reminders', () => {
  it('builds future reminders with stable ids and localized bodies', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 0));
    const profile = createDhlWorkProfile();
    profile.pattern = {
      id: 'test',
      name: 'Test',
      startDate: '2026-01-05',
      sequence: ['shift-1'],
    };
    profile.transport.busRouteId = 'route-1-a';
    profile.transport.busStopId = 'route-1-a-stop-1';
    profile.transport.alarmBeforeReferenceMinutes = 30;
    profile.transport.leaveBeforeReferenceMinutes = 15;

    const reminders = buildPushReminders(profile, 'ru-RU');
    const firstDay = reminders.filter(({ id }) => id.includes('2026-01-05'));

    expect(firstDay).toHaveLength(5);
    expect(firstDay.map(({ id }) => id)).toEqual([
      'my-shift:alarm:2026-01-05:shift-1',
      'my-shift:departure:2026-01-05:shift-1',
      'my-shift:shift:2026-01-05:shift-1',
      'my-shift:first-break:2026-01-05:shift-1',
      'my-shift:shift-end:2026-01-05:shift-1',
    ]);
    expect(firstDay[0]).toMatchObject({ body: 'Пора просыпаться', kind: 'alarm' });
    expect(new Date(firstDay[0]!.at)).toEqual(new Date(2026, 0, 5, 4, 30));
  });

  it('drops reminders that are already in the past', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 8, 30));
    const profile = createDhlWorkProfile();
    profile.pattern = {
      id: 'test',
      name: 'Test',
      startDate: '2026-01-05',
      sequence: ['shift-1'],
    };

    const today = buildPushReminders(profile, 'en-US').filter(({ id }) =>
      id.includes('2026-01-05'),
    );
    expect(today.map(({ id }) => id)).toEqual(['my-shift:shift-end:2026-01-05:shift-1']);
  });

  it('uses car travel time and respects disabled reminder types', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 0));
    const profile = createDhlWorkProfile();
    profile.pattern = {
      id: 'test',
      name: 'Test',
      startDate: '2026-01-05',
      sequence: ['shift-1'],
    };
    profile.transport.mode = 'car';
    profile.transport.carTravelMinutes = 40;
    profile.transport.alarmBeforeReferenceMinutes = 20;
    profile.transport.leaveReminderEnabled = false;
    profile.reminders.shiftStartEnabled = false;
    profile.reminders.firstBreakEnabled = false;
    profile.reminders.shiftEndEnabled = false;

    const today = buildPushReminders(profile, 'sk-SK').filter(({ id }) =>
      id.includes('2026-01-05'),
    );
    expect(today).toHaveLength(1);
    expect(new Date(today[0]!.at)).toEqual(new Date(2026, 0, 5, 5));
    expect(today[0]?.body).toBe('Čas vstávať');
  });

  it('builds no reminders when reminders are disabled globally', () => {
    const profile = createDhlWorkProfile();
    profile.reminders.enabled = false;

    expect(buildPushReminders(profile, 'en-US')).toEqual([]);
  });

  it('formats every supported reminder locale', () => {
    expect(reminderMessage('en-US', 'shiftStart', 10)).toBe('Your shift starts in 10 minutes');
    expect(reminderMessage('ru-RU', 'firstBreak', 5)).toBe('Первый перерыв через 5 мин.');
    expect(reminderMessage('uk-UA', 'shiftEnd', 30)).toBe('До кінця зміни 30 хв.');
    expect(reminderMessage('sk-SK', 'shiftStart', 15)).toBe('Zmena sa začne o 15 min.');
  });
});
