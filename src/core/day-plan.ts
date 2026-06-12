import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  resolvedShiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';
import type {
  CalendarOverride,
  SchedulePattern,
  ShiftDefinition,
  TransportSettings,
} from 'src/models/app';

export type DayPlanEventKind =
  | 'sleep'
  | 'wake'
  | 'leave'
  | 'transport'
  | 'shift'
  | 'break'
  | 'shift-end';
export interface DayPlanEvent {
  kind: DayPlanEventKind;
  target: Date;
}
export interface WorkDayPlan {
  date: Date;
  shift: ShiftDefinition;
  shiftStart: Date;
  shiftEnd: Date;
  firstBreak: Date;
  referenceTime: Date;
  alarmTime: Date;
  sleepTime: Date;
  leaveHome: Date;
  transportMode: TransportSettings['mode'];
  busRouteCode: string | null;
  busStopName: string | null;
  carTravelMinutes: number;
  events: DayPlanEvent[];
}

export function buildWorkDayPlan(options: {
  date: Date;
  pattern: SchedulePattern;
  shifts: ShiftDefinition[];
  overrides?: CalendarOverride[];
  transport: TransportSettings;
  sleepHours: number;
}): WorkDayPlan | null {
  const { date, pattern, shifts, overrides = [], transport, sleepHours } = options;
  const code = resolvedShiftCodeForDate(date, pattern, overrides);
  const shift = code === 'off' ? undefined : shifts.find((item) => item.id === code);
  if (!shift) return null;
  const shiftStart = shiftDateTime(date, shift.startTime);
  const shiftEnd = shiftEndDateTime(date, shift);
  const firstBreak = addMinutes(shiftStart, FIRST_BREAK_AFTER_SHIFT_START_MINUTES);
  const route = dhlBusRoutes.find((item) => item.id === transport.busRouteId);
  const stop = route?.stops.find((item) => item.id === transport.busStopId);
  const busTime = stop?.times[shift.id];
  const referenceTime =
    transport.mode === 'bus' && busTime
      ? shiftDateTime(date, busTime)
      : transport.mode === 'car'
        ? addMinutes(shiftStart, -transport.carTravelMinutes)
        : shiftStart;
  const alarmTime = addMinutes(referenceTime, -transport.alarmBeforeReferenceMinutes);
  const leaveHome =
    transport.mode === 'car'
      ? referenceTime
      : addMinutes(referenceTime, -transport.leaveBeforeReferenceMinutes);
  const sleepTime = addMinutes(alarmTime, -sleepHours * 60);
  const events: DayPlanEvent[] = [
    { kind: 'sleep', target: sleepTime },
    { kind: 'wake', target: alarmTime },
    ...(transport.leaveReminderEnabled ? [{ kind: 'leave' as const, target: leaveHome }] : []),
    { kind: 'transport', target: referenceTime },
    { kind: 'shift', target: shiftStart },
    { kind: 'break', target: firstBreak },
    { kind: 'shift-end', target: shiftEnd },
  ];
  return {
    date,
    shift,
    shiftStart,
    shiftEnd,
    firstBreak,
    referenceTime,
    alarmTime,
    sleepTime,
    leaveHome,
    transportMode: transport.mode,
    busRouteCode: route?.code ?? null,
    busStopName: stop?.name ?? null,
    carTravelMinutes: transport.carTravelMinutes,
    events,
  };
}

export function nearestUpcomingEvent(plan: WorkDayPlan, now: Date): DayPlanEvent | null {
  return plan.events.find((event) => event.target.getTime() > now.getTime()) ?? null;
}
