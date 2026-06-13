import { Capacitor } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';
import type { Locale, WorkProfile } from 'src/models/app';
import { buildPushReminders } from 'src/services/push-notifications';

const MAX_PENDING_NOTIFICATIONS = 60;

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

  if (!profile.reminders.enabled) return true;
  if ((await requestNativeNotificationPermission()) !== 'granted') return false;

  const notifications: LocalNotificationSchema[] = buildPushReminders(profile, locale)
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

function notificationId(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (Math.imul(31, hash) + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash) || 1;
}
