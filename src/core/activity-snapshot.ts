import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  dateKey,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  resolvedShiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';
import type { UserData, WorkProfile } from 'src/models/app';

export function buildActivitySnapshot(data: UserData, now = new Date()) {
  const profile =
    data.workProfiles.find((item) => item.id === data.activeWorkProfileId) ?? data.workProfiles[0];
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  if (!profile) return { timezone, locale: data.settings.locale, preferences: {}, days: [] };
  const start = new Date(now);
  start.setDate(start.getDate() - 14);
  start.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return activityDay(date, profile, data.settings.sleepHours);
  });
  return {
    timezone,
    locale: data.settings.locale,
    preferences: { sleepDurationMinutes: data.settings.sleepHours * 60 },
    days,
  };
}

function activityDay(date: Date, profile: WorkProfile, sleepHours: number) {
  const shiftId = resolvedShiftCodeForDate(date, profile.pattern, profile.calendarOverrides);
  const shift = profile.shifts.find((item) => item.id === shiftId);
  const override = profile.calendarOverrides.find(
    (item) => item.startDate <= dateKey(date) && item.endDate >= dateKey(date),
  );
  if (!shift) {
    return {
      date: dateKey(date),
      dayType: override?.type ?? 'day_off',
      shift: null,
      sleep: null,
      wakeUp: null,
      commuteToWork: null,
      workBreaks: [],
      commuteHome: null,
      timeline: [],
      recommendedLearningWindows: [],
    };
  }
  const starts = shiftDateTime(date, shift.startTime);
  const ends = shiftEndDateTime(date, shift);
  const wake = shiftDateTime(date, shift.wakeTime);
  if (wake > starts) wake.setDate(wake.getDate() - 1);
  const sleep = addMinutes(wake, -sleepHours * 60);
  const route = dhlBusRoutes.find((item) => item.id === profile.transport.busRouteId);
  const stop = route?.stops.find((item) => item.id === profile.transport.busStopId);
  const selectedBusTime = stop?.times[shift.id] ?? shift.departureTime;
  const departure = shiftDateTime(date, selectedBusTime);
  if (departure > starts) departure.setDate(departure.getDate() - 1);
  const firstBreak = addMinutes(starts, FIRST_BREAK_AFTER_SHIFT_START_MINUTES);
  const breakEnd = addMinutes(firstBreak, 30);
  const commuteStart = profile.transport.mode === 'car'
    ? addMinutes(starts, -profile.transport.carTravelMinutes)
    : departure;
  return {
    date: dateKey(date),
    dayType: 'workday',
    shift: {
      id: shift.id,
      name: shift.name,
      startsAt: starts.toISOString(),
      endsAt: ends.toISOString(),
      isNightShift: ends.getDate() !== starts.getDate(),
      source: override ? 'user_setting' : 'schedule',
      status: 'scheduled',
    },
    sleep: {
      startsAt: sleep.toISOString(),
      endsAt: wake.toISOString(),
      durationMinutes: sleepHours * 60,
      source: 'estimated',
      confidence: 0.7,
    },
    wakeUp: { at: wake.toISOString(), source: 'user_setting', confidence: 1 },
    commuteToWork: {
      transport: profile.transport.mode,
      startsAt: commuteStart.toISOString(),
      endsAt: starts.toISOString(),
      durationMinutes: Math.max(0, Math.round((starts.getTime() - commuteStart.getTime()) / 60_000)),
      route: route ? { id: route.id, name: route.name, code: route.code } : null,
      stop: stop ? { id: stop.id, name: stop.name } : null,
      bus: profile.transport.mode === 'bus'
        ? { departureAt: departure.toISOString(), arrivalAt: starts.toISOString() }
        : null,
    },
    workBreaks: [{
      id: 'first-break',
      startsAt: firstBreak.toISOString(),
      endsAt: breakEnd.toISOString(),
      durationMinutes: 30,
      source: 'estimated',
      confidence: 0.6,
      lessonSuitability: { allowed: true, recommendedDurationMinutes: 10 },
    }],
    commuteHome: null,
    timeline: [
      interval('sleep', sleep, wake, 'unavailable'),
      interval('awake', wake, commuteStart, 'recommended'),
      interval('commute', commuteStart, starts, 'not_recommended'),
      interval('work', starts, ends, 'unavailable'),
      interval('work_break', firstBreak, breakEnd, 'short_lesson'),
    ],
    recommendedLearningWindows: [
      {
        startsAt: addMinutes(wake, 30).toISOString(),
        endsAt: addMinutes(commuteStart, -30).toISOString(),
        recommendedDurationMinutes: 30,
        priority: 100,
        reason: 'awake_before_work',
      },
      {
        startsAt: addMinutes(firstBreak, 5).toISOString(),
        endsAt: addMinutes(breakEnd, -5).toISOString(),
        recommendedDurationMinutes: 10,
        priority: 50,
        reason: 'work_break',
      },
    ],
  };
}

function interval(type: string, startsAt: Date, endsAt: Date, lessonAvailability: string) {
  return { type, startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), lessonAvailability };
}
