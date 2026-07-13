import { Capacitor, registerPlugin } from '@capacitor/core';
import {
  LocalNotifications,
  type LocalNotificationSchema,
} from '@capacitor/local-notifications';
import type { Locale, WorkProfile } from 'src/models/app';
import {
  buildPushReminders,
  hasAnyEnabledReminder,
  type PushReminder,
} from 'src/services/push-notifications';

const MAX_PENDING_NOTIFICATIONS = 60;
const SYSTEM_ALARM_WINDOW_MS = 24 * 60 * 60 * 1_000;
const ANDROID_TEST_ALARM_ID = 'my-shift:test-system-alarm';

interface SystemAlarmPlugin {
  setAlarm(options: {
    id: string;
    message: string;
    timestamp: number | string;
    skipUi?: boolean;
    includeRingtone?: boolean;
  }): Promise<{ created: boolean }>;
  clearRememberedAlarm(options?: { id?: string }): Promise<void>;
  getStatus(): Promise<AndroidSystemAlarmStatus>;
  chooseAlarmSound(): Promise<{ selected: boolean }>;
  setAlarmOptions(options: {
    vibrationEnabled?: boolean;
    volumeRampEnabled?: boolean;
  }): Promise<Pick<AndroidSystemAlarmStatus, 'vibrationEnabled' | 'volumeRampEnabled'>>;
  previewAlarmSound(): Promise<void>;
  stopAlarmPreview(): Promise<void>;
  openAlarmSettings(): Promise<void>;
  openExactAlarmSettings(): Promise<void>;
}

const SystemAlarm = registerPlugin<SystemAlarmPlugin>('SystemAlarm');

export interface AndroidSystemAlarmStatus {
  canSetAlarm: boolean;
  canScheduleExactAlarms?: boolean;
  hasCustomSound: boolean;
  vibrationEnabled?: boolean;
  volumeRampEnabled?: boolean;
  clockPackage?: string;
  clockActivity?: string;
  dismissPackage?: string;
  dismissActivity?: string;
  ringtonePickerPackage?: string;
  ringtonePickerActivity?: string;
  soundSettingsPackage?: string;
  soundSettingsActivity?: string;
  lastAlarmId?: string;
  lastAlarmMessage?: string;
  lastAlarmTimestamp?: number;
  lastAlarmIso?: string;
  lastTestAlarmId?: string;
  lastTestAlarmMessage?: string;
  lastTestAlarmTimestamp?: number;
  lastTestAlarmIso?: string;
  lastSetAlarmError?: string;
  lastSetAlarmAttemptIso?: string;
  lastSetAlarmResult?: string;
  manufacturer?: string;
  model?: string;
  sdkInt?: number;
}

export interface AndroidTestAlarmResult {
  ok: boolean;
  requestedAt: number;
  requestedAtIso: string;
  pluginResult?: { created: boolean };
  error?: string;
  status: AndroidSystemAlarmStatus;
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export function isNativeAndroidApp(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
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

  if (!hasAnyEnabledReminder(profile)) {
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
    try {
      await LocalNotifications.schedule({ notifications });
    } catch {
      return systemAlarmId !== null;
    }
  }
  return true;
}

export async function getAndroidSystemAlarmStatus(): Promise<{
  canSetAlarm: boolean;
  hasCustomSound: boolean;
}> {
  if (!isNativeAndroidApp()) return { canSetAlarm: false, hasCustomSound: false };
  try {
    return await SystemAlarm.getStatus();
  } catch {
    return { canSetAlarm: false, hasCustomSound: false };
  }
}

export async function getAndroidAlarmDiagnostics(): Promise<AndroidSystemAlarmStatus> {
  if (!isNativeAndroidApp()) {
    return { canSetAlarm: false, hasCustomSound: false };
  }
  try {
    return await SystemAlarm.getStatus();
  } catch (error) {
    return {
      canSetAlarm: false,
      hasCustomSound: false,
      lastSetAlarmError: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function chooseAndroidAlarmSound(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    const result = await SystemAlarm.chooseAlarmSound();
    return result.selected;
  } catch {
    return false;
  }
}

export async function setAndroidAlarmOptions(options: {
  vibrationEnabled?: boolean;
  volumeRampEnabled?: boolean;
}): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.setAlarmOptions(options);
    return true;
  } catch {
    return false;
  }
}

export async function previewAndroidAlarmSound(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.previewAlarmSound();
    return true;
  } catch {
    return false;
  }
}

export async function stopAndroidAlarmPreview(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.stopAlarmPreview();
    return true;
  } catch {
    return false;
  }
}

export async function openAndroidAlarmSettings(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.openAlarmSettings();
    return true;
  } catch {
    return false;
  }
}

export async function openAndroidExactAlarmSettings(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.openExactAlarmSettings();
    return true;
  } catch {
    return false;
  }
}

export async function scheduleAndroidTestAlarm(message: string): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;

  const at = new Date();
  at.setSeconds(0, 0);
  at.setMinutes(at.getMinutes() + 1);

  try {
    await SystemAlarm.setAlarm({
      id: ANDROID_TEST_ALARM_ID,
      message,
      timestamp: String(at.getTime()),
      skipUi: false,
      includeRingtone: false,
    });
    return true;
  } catch {
    return false;
  }
}

export async function runAndroidTestAlarmDiagnostics(
  message: string,
): Promise<AndroidTestAlarmResult> {
  const at = new Date();
  at.setSeconds(0, 0);
  at.setMinutes(at.getMinutes() + 1);

  if (!isNativeAndroidApp()) {
    return {
      ok: false,
      requestedAt: at.getTime(),
      requestedAtIso: at.toISOString(),
      error: 'Native Android runtime is not available',
      status: await getAndroidAlarmDiagnostics(),
    };
  }

  try {
    const pluginResult = await SystemAlarm.setAlarm({
      id: ANDROID_TEST_ALARM_ID,
      message,
      timestamp: String(at.getTime()),
      skipUi: false,
      includeRingtone: false,
    });
    return {
      ok: true,
      requestedAt: at.getTime(),
      requestedAtIso: at.toISOString(),
      pluginResult,
      status: await getAndroidAlarmDiagnostics(),
    };
  } catch (error) {
    return {
      ok: false,
      requestedAt: at.getTime(),
      requestedAtIso: at.toISOString(),
      error: error instanceof Error ? error.message : String(error),
      status: await getAndroidAlarmDiagnostics(),
    };
  }
}

export async function clearAndroidTestAlarm(): Promise<boolean> {
  if (!isNativeAndroidApp()) return false;
  try {
    await SystemAlarm.clearRememberedAlarm({ id: ANDROID_TEST_ALARM_ID });
    return true;
  } catch {
    return false;
  }
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
      timestamp: String(nextAlarm.at),
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
