import { defineBoot } from '#q-app/wrappers';
import { watch } from 'vue';
import {
  addMinutes,
  currentWorkingShift,
  dateKey,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  FIRST_BREAK_NOTIFICATION_BEFORE_MINUTES,
  nextWorkingShift,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';
import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import type { Locale } from 'src/models/app';
import {
  showReminderFeedback,
  unlockReminderAudio,
  type ReminderKind,
} from 'src/services/reminders/reminder-feedback';
import { hasStorageMarker, setStorageMarker } from 'src/services/storage/storage';
import { useAppStore } from 'stores/app-store';

interface ScheduledReminder {
  at: Date;
  body: string;
  id: string;
  kind: ReminderKind;
  stopLabel?: string;
}

const messages: Record<
  Locale,
  {
    alarm: string;
    alarmStop: string;
    departure: string;
    shift: string;
    firstBreak: string;
    shiftEnd: string;
  }
> = {
  'en-US': {
    alarm: 'Time to wake up',
    alarmStop: 'Stop alarm',
    departure: 'Time to leave soon',
    shift: 'Your shift starts in 10 minutes',
    firstBreak: 'First break starts in 5 minutes',
    shiftEnd: 'Your shift ends in 20 minutes',
  },
  'ru-RU': {
    alarm: 'Пора просыпаться',
    alarmStop: 'Отключить будильник',
    departure: 'Скоро пора выходить',
    shift: 'Смена начнётся через 10 минут',
    firstBreak: 'Первый перерыв через 5 минут',
    shiftEnd: 'До конца смены осталось 20 минут',
  },
  'uk-UA': {
    alarm: 'Час прокидатися',
    alarmStop: 'Вимкнути будильник',
    departure: 'Скоро час виходити',
    shift: 'Зміна почнеться через 10 хвилин',
    firstBreak: 'Перша перерва через 5 хвилин',
    shiftEnd: 'До кінця зміни залишилося 20 хвилин',
  },
  'sk-SK': {
    alarm: 'Čas vstávať',
    alarmStop: 'Vypnúť budík',
    departure: 'Čoskoro treba vyraziť',
    shift: 'Zmena sa začne o 10 minút',
    firstBreak: 'Prvá prestávka sa začne o 5 minút',
    shiftEnd: 'Do konca zmeny zostáva 20 minút',
  },
};

export default defineBoot(({ store }) => {
  if (typeof window === 'undefined') return;

  const app = useAppStore(store);
  let timers: number[] = [];

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const schedule = () => {
    clearTimers();
    if (!app.activeProfile.reminders.enabled) return;

    const now = new Date();
    const currentShift = currentWorkingShift(
      now,
      app.pattern,
      app.shifts,
      app.activeProfile.calendarOverrides,
    );
    const upcomingShift = nextWorkingShift(
      now,
      app.pattern,
      app.shifts,
      app.activeProfile.calendarOverrides,
    );
    const localeMessages = messages[app.data.settings.locale];
    const reminders: ScheduledReminder[] = [];

    if (upcomingShift) {
      const shiftKey = `${dateKey(upcomingShift.date)}:${upcomingShift.shift.id}`;
      const shiftStart = shiftDateTime(upcomingShift.date, upcomingShift.shift.startTime);
      const selectedRoute = dhlBusRoutes.find(
        (route) => route.id === app.activeProfile.transport.busRouteId,
      );
      const selectedStop = selectedRoute?.stops.find(
        (stop) => stop.id === app.activeProfile.transport.busStopId,
      );
      const busTime = selectedStop?.times[upcomingShift.shift.id];
      const referenceTime =
        app.activeProfile.transport.mode === 'bus' && busTime
          ? shiftDateTime(upcomingShift.date, busTime)
          : shiftStart;

      if (app.activeProfile.transport.alarmEnabled) {
        reminders.push({
          at: addMinutes(
            referenceTime,
            -app.activeProfile.transport.alarmBeforeReferenceMinutes,
          ),
          body: localeMessages.alarm,
          id: `my-shift:alarm:${shiftKey}`,
          kind: 'alarm',
          stopLabel: localeMessages.alarmStop,
        });
      }

      if (app.activeProfile.transport.leaveReminderEnabled) {
        reminders.push({
          at: addMinutes(
            referenceTime,
            -app.activeProfile.transport.leaveBeforeReferenceMinutes,
          ),
          body: localeMessages.departure,
          id: `my-shift:departure:${shiftKey}`,
          kind: 'notification',
        });
      }

      if (app.activeProfile.reminders.shiftStartEnabled) {
        reminders.push({
          at: addMinutes(shiftStart, -10),
          body: localeMessages.shift,
          id: `my-shift:shift:${shiftKey}`,
          kind: 'notification',
        });
      }
    }

    const breakShift = currentShift ?? upcomingShift;
    if (breakShift) {
      const breakShiftKey = `${dateKey(breakShift.date)}:${breakShift.shift.id}`;
      if (app.activeProfile.reminders.firstBreakEnabled) {
        reminders.push({
          at: addMinutes(
            shiftDateTime(breakShift.date, breakShift.shift.startTime),
            FIRST_BREAK_AFTER_SHIFT_START_MINUTES -
              FIRST_BREAK_NOTIFICATION_BEFORE_MINUTES,
          ),
          body: localeMessages.firstBreak,
          id: `my-shift:first-break:${breakShiftKey}`,
          kind: 'notification',
        });
      }
      if (app.activeProfile.reminders.shiftEndEnabled) {
        reminders.push({
          at: addMinutes(shiftEndDateTime(breakShift.date, breakShift.shift), -20),
          body: localeMessages.shiftEnd,
          id: `my-shift:shift-end:${breakShiftKey}`,
          kind: 'notification',
        });
      }
    }

    reminders.forEach((reminder) => {
      const delay = reminder.at.getTime() - now.getTime();
      if (delay <= 0 || hasStorageMarker(reminder.id)) return;

      timers.push(
        window.setTimeout(() => {
          showReminderFeedback(reminder);
          setStorageMarker(reminder.id);
          schedule();
        }, delay),
      );
    });
  };

  window.addEventListener('pointerdown', unlockReminderAudio, { once: true });
  window.addEventListener('keydown', unlockReminderAudio, { once: true });
  window.addEventListener('focus', schedule);
  document.addEventListener('visibilitychange', schedule);

  watch(
    () => [
      app.activeProfile.reminders.enabled,
      app.activeProfile.transport.alarmEnabled,
      app.activeProfile.transport.alarmBeforeReferenceMinutes,
      app.activeProfile.transport.leaveReminderEnabled,
      app.activeProfile.transport.leaveBeforeReferenceMinutes,
      app.activeProfile.reminders.shiftStartEnabled,
      app.activeProfile.reminders.firstBreakEnabled,
      app.activeProfile.reminders.shiftEndEnabled,
      app.activeProfile.transport.mode,
      app.activeProfile.transport.busRouteId,
      app.activeProfile.transport.busStopId,
      app.activeProfile.pattern.startDate,
      app.activeProfile.pattern.sequence.join(','),
      app.activeProfile.calendarOverrides
        .map(
          (override) =>
            `${override.id}:${override.type}:${override.startDate}:${override.endDate}:${override.shiftId ?? ''}`,
        )
        .join(','),
      app.activeProfile.shifts
        .map((shift) => `${shift.id}:${shift.startTime}:${shift.endTime}`)
        .join(','),
      app.data.settings.locale,
    ],
    schedule,
    { immediate: true },
  );
});
