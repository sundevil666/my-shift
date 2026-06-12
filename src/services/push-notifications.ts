import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  dateKey,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  FIRST_BREAK_NOTIFICATION_BEFORE_MINUTES,
  resolvedShiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';
import type { Locale, WorkProfile } from 'src/models/app';

interface PushReminder {
  at: number;
  body: string;
  id: string;
  kind: 'alarm' | 'notification';
}

const DEVICE_ID_KEY = 'my-shift:push-device-id';
const pushMessages: Record<
  Locale,
  { alarm: string; departure: string; firstBreak: string; shift: string; shiftEnd: string }
> = {
  'en-US': {
    alarm: 'Time to wake up',
    departure: 'Time to leave soon',
    shift: 'Your shift starts in 10 minutes',
    firstBreak: 'First break starts in 5 minutes',
    shiftEnd: 'Your shift ends in 20 minutes',
  },
  'ru-RU': {
    alarm: 'Пора просыпаться',
    departure: 'Скоро пора выходить',
    shift: 'Смена начнётся через 10 минут',
    firstBreak: 'Первый перерыв через 5 минут',
    shiftEnd: 'До конца смены осталось 20 минут',
  },
  'uk-UA': {
    alarm: 'Час прокидатися',
    departure: 'Скоро час виходити',
    shift: 'Зміна почнеться через 10 хвилин',
    firstBreak: 'Перша перерва через 5 хвилин',
    shiftEnd: 'До кінця зміни залишилося 20 хвилин',
  },
  'sk-SK': {
    alarm: 'Čas vstávať',
    departure: 'Čoskoro treba vyraziť',
    shift: 'Zmena sa začne o 10 minút',
    firstBreak: 'Prvá prestávka sa začne o 5 minút',
    shiftEnd: 'Do konca zmeny zostáva 20 minút',
  },
};

export async function syncPushReminders(
  profile: WorkProfile,
  locale: Locale,
): Promise<boolean> {
  if (
    !profile.reminders.enabled ||
    Notification.permission !== 'granted' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window)
  ) {
    return false;
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    const response = await fetch('/api/push/config');
    if (!response.ok) return false;
    const { publicKey } = (await response.json()) as { publicKey: string };
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  const response = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: getDeviceId(),
      subscription: subscription.toJSON(),
      reminders: buildPushReminders(profile, locale),
    }),
  });
  return response.ok;
}

function buildPushReminders(profile: WorkProfile, locale: Locale): PushReminder[] {
  const now = new Date();
  const messages = pushMessages[locale];
  const reminders: PushReminder[] = [];
  const route = dhlBusRoutes.find((item) => item.id === profile.transport.busRouteId);
  const stop = route?.stops.find((item) => item.id === profile.transport.busStopId);

  for (let offset = 0; offset < 14; offset += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const shiftCode = resolvedShiftCodeForDate(date, profile.pattern, profile.calendarOverrides);
    const shift = profile.shifts.find((item) => item.id === shiftCode);
    if (!shift) continue;

    const key = `${dateKey(date)}:${shift.id}`;
    const shiftStart = shiftDateTime(date, shift.startTime);
    const shiftEnd = shiftEndDateTime(date, shift);
    const busTime = stop?.times[shift.id];
    const referenceTime =
      profile.transport.mode === 'bus' && busTime
        ? shiftDateTime(date, busTime)
        : profile.transport.mode === 'car'
          ? addMinutes(shiftStart, -profile.transport.carTravelMinutes)
          : shiftStart;

    if (profile.transport.alarmEnabled) {
      addReminder(
        reminders,
        addMinutes(referenceTime, -profile.transport.alarmBeforeReferenceMinutes),
        `alarm:${key}`,
        messages.alarm,
        'alarm',
      );
    }
    if (profile.transport.leaveReminderEnabled) {
      addReminder(
        reminders,
        addMinutes(referenceTime, -profile.transport.leaveBeforeReferenceMinutes),
        `departure:${key}`,
        messages.departure,
      );
    }
    if (profile.reminders.shiftStartEnabled) {
      addReminder(reminders, addMinutes(shiftStart, -10), `shift:${key}`, messages.shift);
    }
    if (profile.reminders.firstBreakEnabled) {
      addReminder(
        reminders,
        addMinutes(
          shiftStart,
          FIRST_BREAK_AFTER_SHIFT_START_MINUTES - FIRST_BREAK_NOTIFICATION_BEFORE_MINUTES,
        ),
        `first-break:${key}`,
        messages.firstBreak,
      );
    }
    if (profile.reminders.shiftEndEnabled) {
      addReminder(reminders, addMinutes(shiftEnd, -20), `shift-end:${key}`, messages.shiftEnd);
    }
  }

  return reminders;
}

function addReminder(
  reminders: PushReminder[],
  at: Date,
  id: string,
  body: string,
  kind: PushReminder['kind'] = 'notification',
) {
  if (at.getTime() <= Date.now()) return;
  reminders.push({ at: at.getTime(), body, id: `my-shift:${id}`, kind });
}

function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const deviceId = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, deviceId);
  return deviceId;
}

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}
