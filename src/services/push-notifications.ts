import { dhlBusRoutes } from 'src/core/dhl-bus-routes';
import {
  addMinutes,
  dateKey,
  FIRST_BREAK_AFTER_SHIFT_START_MINUTES,
  resolvedShiftCodeForDate,
  shiftDateTime,
  shiftEndDateTime,
} from 'src/core/schedule';
import type { Locale, WorkProfile } from 'src/models/app';

export interface PushReminder {
  at: number;
  body: string;
  id: string;
  kind: 'alarm' | 'notification';
}

const DEVICE_ID_KEY = 'my-shift:push-device-id';
const pushMessages: Record<Locale, { alarm: string; departure: string }> = {
  'en-US': {
    alarm: 'Time to wake up',
    departure: 'Time to leave soon',
  },
  'ru-RU': {
    alarm: 'Пора просыпаться',
    departure: 'Скоро пора выходить',
  },
  'uk-UA': {
    alarm: 'Час прокидатися',
    departure: 'Скоро час виходити',
  },
  'sk-SK': {
    alarm: 'Čas vstávať',
    departure: 'Čoskoro treba vyraziť',
  },
};

export async function syncPushReminders(profile: WorkProfile, locale: Locale): Promise<boolean> {
  if (
    !profile.reminders.enabled ||
    typeof Notification === 'undefined' ||
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

export async function removePushSubscription(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  const deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (deviceId) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    }).catch(() => undefined);
  }
  await subscription?.unsubscribe();
}

export function buildPushReminders(profile: WorkProfile, locale: Locale): PushReminder[] {
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
      addReminder(
        reminders,
        addMinutes(shiftStart, -profile.reminders.shiftStartBeforeMinutes),
        `shift:${key}`,
        reminderMessage(locale, 'shiftStart', profile.reminders.shiftStartBeforeMinutes),
      );
    }
    if (profile.reminders.firstBreakEnabled) {
      addReminder(
        reminders,
        addMinutes(
          shiftStart,
          FIRST_BREAK_AFTER_SHIFT_START_MINUTES - profile.reminders.firstBreakBeforeMinutes,
        ),
        `first-break:${key}`,
        reminderMessage(locale, 'firstBreak', profile.reminders.firstBreakBeforeMinutes),
      );
    }
    if (profile.reminders.shiftEndEnabled) {
      addReminder(
        reminders,
        addMinutes(shiftEnd, -profile.reminders.shiftEndBeforeMinutes),
        `shift-end:${key}`,
        reminderMessage(locale, 'shiftEnd', profile.reminders.shiftEndBeforeMinutes),
      );
    }
  }

  return reminders;
}

export function reminderMessage(
  locale: Locale,
  event: 'shiftStart' | 'firstBreak' | 'shiftEnd',
  minutes: number,
): string {
  const messages = {
    'en-US': {
      shiftStart: `Your shift starts in ${minutes} minutes`,
      firstBreak: `First break starts in ${minutes} minutes`,
      shiftEnd: `Your shift ends in ${minutes} minutes`,
    },
    'ru-RU': {
      shiftStart: `Смена начнётся через ${minutes} мин.`,
      firstBreak: `Первый перерыв через ${minutes} мин.`,
      shiftEnd: `До конца смены ${minutes} мин.`,
    },
    'uk-UA': {
      shiftStart: `Зміна почнеться через ${minutes} хв.`,
      firstBreak: `Перша перерва через ${minutes} хв.`,
      shiftEnd: `До кінця зміни ${minutes} хв.`,
    },
    'sk-SK': {
      shiftStart: `Zmena sa začne o ${minutes} min.`,
      firstBreak: `Prvá prestávka sa začne o ${minutes} min.`,
      shiftEnd: `Do konca zmeny zostáva ${minutes} min.`,
    },
  } satisfies Record<Locale, Record<typeof event, string>>;
  return messages[locale][event];
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
