import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';
import type { Locale, WorkProfile } from 'src/models/app';
import { buildPushReminders, type PushReminder } from 'src/services/push-notifications';

const MAX_PENDING_NOTIFICATIONS = 60;
const SYSTEM_ALARM_WINDOW_MS = 24 * 60 * 60 * 1_000;

interface SystemAlarmPlugin {
  setAlarm(options: {
    id: string;
    message: string;
    timestamp: number;
  }): Promise<{ created: boolean }>;
  clearRememberedAlarm(): Promise<void>;
}

const SystemAlarm = registerPlugin<SystemAlarmPlugin>('SystemAlarm');

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function requestNativeNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (!isNativeApp()) return 'unsupported';

  const current = await LocalNotifications.checkPermissions();
  const permission =
    current.display === 'prompt'
      ? await LocalNotifications.requestPermissions()
      : current;

  if (permission.display !== 'granted') return 'denied';

  if (Capacitor.getPlatform() === 'android') {
    const exact = await LocalNotifications.checkExactNotificationSetting();
    if (exact.exact_alarm !== 'granted') {
      await LocalNotifications.changeExactNotificationSetting();
    }
  }

  return 'granted';
}

export async function syncNativeReminders(
  profile: WorkProfile,
  locale: Locale,
): Promise<boolean> {
  if (!isNativeApp()) return false;

  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map(({ id }) => ({ id })),
    });
  }

  if (!profile.reminders.enabled) {
    await clearAndroidSystemAlarm();
    return true;
  }
  if ((await requestNativeNotificationPermission()) !== 'granted') return false;

  const reminders = buildPushReminders(profile, locale);
  const systemAlarmId = await syncAndroidSystemAlarm(reminders);

  const notifications: LocalNotificationSchema[] = reminders
    .filter((reminder) => reminder.id !== systemAlarmId)
    .slice(0, MAX_PENDING_NOTIFICATIONS)
    .map((reminder) => ({
      id: notificationId(reminder.id),
      title: 'My Shift',
      body: reminder.body,
      schedule: {
        at: new Date(reminder.at),
        allowWhileIdle: true,
      },
      extra: {
        reminderId: reminder.id,
        kind: reminder.kind,
      },
    }));

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }
  return true;
}

async function syncAndroidSystemAlarm(reminders: PushReminder[]): Promise<string | null> {
  if (Capacitor.getPlatform() !== 'android') return null;

  const now = Date.now();
  const nextAlarm = reminders.find(
    (reminder) =>
      reminder.kind === 'alarm' &&
      reminder.at > now &&
      reminder.at - now <= SYSTEM_ALARM_WINDOW_MS,
  );
  if (!nextAlarm) {
    await clearAndroidSystemAlarm();
    return null;
  }

  try {
    await SystemAlarm.setAlarm({
      id: nextAlarm.id,
      message: systemAlarmMessage(nextAlarm),
      timestamp: nextAlarm.at,
    });
    return nextAlarm.id;
  } catch {
    return null;
  }
}

async function clearAndroidSystemAlarm(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return;
  await SystemAlarm.clearRememberedAlarm().catch(() => undefined);
}

function systemAlarmMessage(reminder: PushReminder): string {
  const date = new Date(reminder.at);
  const day = new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
  return `My Shift ${day} - ${reminder.body}`;
}

function notificationId(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
}
