import { describe, expect, it } from 'vitest';
import { buildWorkDayPlan, nearestUpcomingEvent } from './day-plan';
import { dhlDefaultShifts } from './defaults';
import type { SchedulePattern, TransportSettings } from 'src/models/app';

const pattern: SchedulePattern = {
  id: 'test',
  name: 'Test',
  startDate: '2026-01-05',
  sequence: ['shift-1'],
};

const transport: TransportSettings = {
  mode: 'bus',
  alarmEnabled: true,
  alarmBeforeReferenceMinutes: 30,
  leaveReminderEnabled: true,
  leaveBeforeReferenceMinutes: 15,
  carTravelMinutes: 25,
  busRouteId: 'route-1-a',
  busStopId: 'route-1-a-stop-1',
};

describe('work day plan', () => {
  it('builds bus timing from the selected stop', () => {
    const plan = buildWorkDayPlan({
      date: new Date(2026, 0, 5),
      pattern,
      shifts: dhlDefaultShifts,
      transport,
      sleepHours: 8,
    });

    expect(plan?.busRouteCode).toBe('1/A');
    expect(plan?.busStopName).toBe('Čermáň Kostolná');
    expect(plan?.referenceTime).toEqual(new Date(2026, 0, 5, 5));
    expect(plan?.alarmTime).toEqual(new Date(2026, 0, 5, 4, 30));
    expect(plan?.leaveHome).toEqual(new Date(2026, 0, 5, 4, 45));
    expect(plan?.sleepTime).toEqual(new Date(2026, 0, 4, 20, 30));
    expect(plan?.firstBreak).toEqual(new Date(2026, 0, 5, 8, 15));
  });

  it('uses travel time as the car departure time', () => {
    const plan = buildWorkDayPlan({
      date: new Date(2026, 0, 5),
      pattern,
      shifts: dhlDefaultShifts,
      transport: { ...transport, mode: 'car', carTravelMinutes: 35 },
      sleepHours: 7.5,
    });

    expect(plan?.referenceTime).toEqual(new Date(2026, 0, 5, 5, 25));
    expect(plan?.leaveHome).toEqual(plan?.referenceTime);
    expect(plan?.sleepTime).toEqual(new Date(2026, 0, 4, 21, 25));
  });

  it('omits the leave event when its reminder is disabled', () => {
    const plan = buildWorkDayPlan({
      date: new Date(2026, 0, 5),
      pattern,
      shifts: dhlDefaultShifts,
      transport: { ...transport, leaveReminderEnabled: false },
      sleepHours: 8,
    });
    expect(plan?.events.map(({ kind }) => kind)).not.toContain('leave');
  });

  it('returns null on days off or for unknown shift ids', () => {
    expect(
      buildWorkDayPlan({
        date: new Date(2026, 0, 10),
        pattern,
        shifts: dhlDefaultShifts,
        transport,
        sleepHours: 8,
      }),
    ).toBeNull();
    expect(
      buildWorkDayPlan({
        date: new Date(2026, 0, 5),
        pattern: { ...pattern, sequence: ['missing'] },
        shifts: dhlDefaultShifts,
        transport,
        sleepHours: 8,
      }),
    ).toBeNull();
  });

  it('finds the first strictly future event', () => {
    const plan = buildWorkDayPlan({
      date: new Date(2026, 0, 5),
      pattern,
      shifts: dhlDefaultShifts,
      transport,
      sleepHours: 8,
    })!;
    expect(nearestUpcomingEvent(plan, new Date(2026, 0, 5, 4, 30))?.kind).toBe('leave');
    expect(nearestUpcomingEvent(plan, new Date(2026, 0, 5, 14))).toBeNull();
  });
});
