import { defineBoot } from '#q-app/wrappers';
import { watch } from 'vue';
import {
  addMinutes,
  currentWorkingShift,
  dateKey,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
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
import { reminderMessage, syncPushReminders } from 'src/services/push-notifications';
import { isNativeApp, syncNativeReminders } from 'src/services/native-notifications';
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
  }
> = {
  'en-US': {
    alarm: 'Time to wake up',
    alarmStop: 'Stop alarm',
    departure: 'Time to leave soon',
  },
  'ru-RU': {
    alarm: 'Пора просыпаться',
    alarmStop: 'Отключить будильник',
    departure: 'Скоро пора выходить',
  },
  'uk-UA': {
    alarm: 'Час прокидатися',
    alarmStop: 'Вимкнути будильник',
    departure: 'Скоро час виходити',
  },
  'sk-SK': {
    alarm: 'Čas vstávať',
    alarmStop: 'Vypnúť budík',
    departure: 'Čoskoro treba vyraziť',
  },
};

export default defineBoot(({ store }) => {
  if (typeof window === 'undefined') return;

  const app = useAppStore(store);
  const native = isNativeApp();
  let timers: number[] = [];
  let pushSyncTimer: number | undefined;

  const clearTimers = () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers = [];
  };

  const schedule = () => {
    clearTimers();
    if (native) {
      void syncNativeReminders(app.activeProfile, app.data.settings.locale);
      return;
    }
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

      if (app.activeProfile.reminders.enabled && app.activeProfile.transport.alarmEnabled) {
        reminders.push({
          at: addMinutes(referenceTime, -app.activeProfile.transport.alarmBeforeReferenceMinutes),
          body: localeMessages.alarm,
          id: `my-shift:alarm:${shiftKey}`,
          kind: 'alarm',
          stopLabel: localeMessages.alarmStop,
        });
      }

      if (app.activeProfile.reminders.enabled && app.activeProfile.transport.leaveReminderEnabled) {
        reminders.push({
          at: addMinutes(referenceTime, -app.activeProfile.transport.leaveBeforeReferenceMinutes),
          body: localeMessages.departure,
          id: `my-shift:departure:${shiftKey}`,
          kind: 'notification',
        });
      }

      if (app.activeProfile.reminders.enabled && app.activeProfile.reminders.shiftStartEnabled) {
        reminders.push({
          at: addMinutes(shiftStart, -app.activeProfile.reminders.shiftStartBeforeMinutes),
          body: reminderMessage(
            app.data.settings.locale,
            'shiftStart',
            app.activeProfile.reminders.shiftStartBeforeMinutes,
          ),
          id: `my-shift:shift:${shiftKey}`,
          kind: 'notification',
        });
      }
    }

    const breakShift = currentShift ?? upcomingShift;
    if (breakShift) {
      const breakShiftKey = `${dateKey(breakShift.date)}:${breakShift.shift.id}`;
      if (app.activeProfile.reminders.enabled && app.activeProfile.reminders.firstBreakEnabled) {
        reminders.push({
          at: addMinutes(
            shiftDateTime(breakShift.date, breakShift.shift.startTime),
            FIRST_BREAK_AFTER_SHIFT_START_MINUTES -
              app.activeProfile.reminders.firstBreakBeforeMinutes,
          ),
          body: reminderMessage(
            app.data.settings.locale,
            'firstBreak',
            app.activeProfile.reminders.firstBreakBeforeMinutes,
          ),
          id: `my-shift:first-break:${breakShiftKey}`,
          kind: 'notification',
        });
      }
      if (app.activeProfile.reminders.enabled && app.activeProfile.reminders.shiftEndEnabled) {
        reminders.push({
          at: addMinutes(
            shiftEndDateTime(breakShift.date, breakShift.shift),
            -app.activeProfile.reminders.shiftEndBeforeMinutes,
          ),
          body: reminderMessage(
            app.data.settings.locale,
            'shiftEnd',
            app.activeProfile.reminders.shiftEndBeforeMinutes,
          ),
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
          void showReminderFeedback(reminder);
          setStorageMarker(reminder.id);
          schedule();
        }, delay),
      );
    });
  };

  const schedulePushSync = () => {
    if (native) return;
    if (pushSyncTimer) window.clearTimeout(pushSyncTimer);
    pushSyncTimer = window.setTimeout(() => {
      if (app.data.settings.cloudPushConsent) {
        void syncPushReminders(app.activeProfile, app.data.settings.locale);
      }
    }, 1_000);
  };

  window.addEventListener('pointerdown', () => void unlockReminderAudio(), { once: true });
  window.addEventListener('keydown', () => void unlockReminderAudio(), { once: true });
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
      app.activeProfile.reminders.shiftStartBeforeMinutes,
      app.activeProfile.reminders.firstBreakEnabled,
      app.activeProfile.reminders.firstBreakBeforeMinutes,
      app.activeProfile.reminders.shiftEndEnabled,
      app.activeProfile.reminders.shiftEndBeforeMinutes,
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
      app.data.settings.cloudPushConsent,
    ],
    schedule,
    { immediate: true },
  );

  watch(() => JSON.stringify(app.data), schedulePushSync, { immediate: true });
});
