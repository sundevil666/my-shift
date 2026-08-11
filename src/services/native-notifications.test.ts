import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDhlWorkProfile } from 'src/core/defaults';
import type { WorkProfile } from 'src/models/app';

interface ScheduledNotification {
  extra?: {
    kind?: string;
    reminderId?: string;
  };
}

const mocks = vi.hoisted(() => {
  const systemAlarm = {
    setAlarm: vi.fn(),
    clearRememberedAlarm: vi.fn(),
    getStatus: vi.fn(),
    chooseAlarmSound: vi.fn(),
    setAlarmOptions: vi.fn(),
    previewAlarmSound: vi.fn(),
    stopAlarmPreview: vi.fn(),
    openAlarmSettings: vi.fn(),
    openExactAlarmSettings: vi.fn(),
  };
  const localNotifications = {
    checkPermissions: vi.fn(),
    requestPermissions: vi.fn(),
    getPending: vi.fn(),
    cancel: vi.fn(),
    schedule: vi.fn(),
  };
  const capacitor = {
    isNativePlatform: vi.fn(),
    getPlatform: vi.fn(),
  };

  return { capacitor, localNotifications, systemAlarm };
});

vi.mock('@capacitor/core', () => ({
  Capacitor: mocks.capacitor,
  registerPlugin: vi.fn(() => mocks.systemAlarm),
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: mocks.localNotifications,
}));

async function service() {
  return await import('./native-notifications');
}

function workProfile(): WorkProfile {
  const profile = createDhlWorkProfile();
  profile.pattern = {
    id: 'test',
    name: 'Test',
    startDate: '2026-01-05',
    sequence: ['shift-1'],
  };
  profile.transport.mode = 'car';
  profile.transport.carTravelMinutes = 0;
  profile.transport.alarmBeforeReferenceMinutes = 60;
  return profile;
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 0, 5, 0));
  vi.clearAllMocks();

  mocks.capacitor.isNativePlatform.mockReturnValue(true);
  mocks.capacitor.getPlatform.mockReturnValue('android');
  mocks.localNotifications.checkPermissions.mockResolvedValue({ display: 'granted' });
  mocks.localNotifications.requestPermissions.mockResolvedValue({ display: 'granted' });
  mocks.localNotifications.getPending.mockResolvedValue({ notifications: [] });
  mocks.localNotifications.cancel.mockResolvedValue(undefined);
  mocks.localNotifications.schedule.mockResolvedValue(undefined);
  mocks.systemAlarm.setAlarm.mockResolvedValue({ created: true });
  mocks.systemAlarm.clearRememberedAlarm.mockResolvedValue(undefined);
  mocks.systemAlarm.getStatus.mockResolvedValue({
    canSetAlarm: true,
    hasCustomSound: true,
    vibrationEnabled: true,
    volumeRampEnabled: true,
  });
  mocks.systemAlarm.chooseAlarmSound.mockResolvedValue({ selected: true });
  mocks.systemAlarm.setAlarmOptions.mockResolvedValue({
    vibrationEnabled: false,
    volumeRampEnabled: true,
  });
  mocks.systemAlarm.previewAlarmSound.mockResolvedValue(undefined);
  mocks.systemAlarm.stopAlarmPreview.mockResolvedValue(undefined);
  mocks.systemAlarm.openAlarmSettings.mockResolvedValue(undefined);
  mocks.systemAlarm.openExactAlarmSettings.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('native Android reminders', () => {
  it('schedules the next wake reminder through SystemAlarm and excludes it from local notifications', async () => {
    const { syncNativeReminders } = await service();
    const profile = workProfile();

    await expect(syncNativeReminders(profile, 'ru-RU')).resolves.toBe(true);

    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledOnce();
    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'my-shift:alarm:2026-01-05:shift-1',
        message: expect.stringContaining('Пора просыпаться'),
        timestamp: String(new Date(2026, 0, 5, 5).getTime()),
      }),
    );
    expect(mocks.localNotifications.schedule).toHaveBeenCalledOnce();
    const scheduled = (mocks.localNotifications.schedule.mock.calls[0]?.[0].notifications ??
      []) as ScheduledNotification[];
    expect(
      scheduled.some((item) => item.extra?.reminderId === 'my-shift:alarm:2026-01-05:shift-1'),
    ).toBe(false);
  });

  it('schedules the next work alarm even when it is more than 24 hours away', async () => {
    const { syncNativeReminders } = await service();
    const profile = workProfile();
    profile.transport.alarmBeforeReferenceMinutes = -1_500;

    await expect(syncNativeReminders(profile, 'en-US')).resolves.toBe(true);

    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'my-shift:alarm:2026-01-05:shift-1',
        timestamp: String(new Date(2026, 0, 6, 7).getTime()),
      }),
    );
  });

  it('reschedules the owned work alarm when its configured time changes', async () => {
    const { syncNativeReminders } = await service();
    const profile = workProfile();

    await syncNativeReminders(profile, 'en-US');
    profile.transport.alarmBeforeReferenceMinutes = 30;
    await syncNativeReminders(profile, 'en-US');

    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledTimes(2);
    expect(mocks.systemAlarm.setAlarm.mock.calls[0]?.[0].timestamp).toBe(
      String(new Date(2026, 0, 5, 5).getTime()),
    );
    expect(mocks.systemAlarm.setAlarm.mock.calls[1]?.[0].timestamp).toBe(
      String(new Date(2026, 0, 5, 5, 30).getTime()),
    );
  });

  it('falls back to a local notification alarm when SystemAlarm rejects the alarm', async () => {
    const { syncNativeReminders } = await service();
    mocks.systemAlarm.setAlarm.mockRejectedValueOnce(new Error('exact alarm disabled'));

    await expect(syncNativeReminders(workProfile(), 'en-US')).resolves.toBe(true);

    const scheduled = (mocks.localNotifications.schedule.mock.calls[0]?.[0].notifications ??
      []) as ScheduledNotification[];
    expect(scheduled.some((item) => item.extra?.kind === 'alarm')).toBe(true);
  });

  it('keeps the Android system alarm even when scheduling ordinary notifications fails', async () => {
    const { syncNativeReminders } = await service();
    mocks.localNotifications.schedule.mockRejectedValueOnce(new Error('notification quota'));

    await expect(syncNativeReminders(workProfile(), 'en-US')).resolves.toBe(true);

    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledOnce();
  });

  it('clears remembered Android alarms when no reminders are enabled', async () => {
    const { syncNativeReminders } = await service();
    const profile = workProfile();
    profile.reminders.enabled = false;
    profile.reminders.arrivalEnabled = false;

    await expect(syncNativeReminders(profile, 'en-US')).resolves.toBe(true);

    expect(mocks.systemAlarm.clearRememberedAlarm).toHaveBeenCalledOnce();
    expect(mocks.systemAlarm.clearRememberedAlarm).toHaveBeenCalledWith();
    expect(mocks.systemAlarm.setAlarm).not.toHaveBeenCalled();
    expect(mocks.localNotifications.schedule).not.toHaveBeenCalled();
  });

  it('clears arrival alarms when the global switch is disabled', async () => {
    const { syncNativeReminders } = await service();
    const profile = workProfile();
    profile.reminders.enabled = false;
    profile.reminders.arrivalEnabled = true;
    profile.reminders.arrivalMode = 'alarm';
    profile.reminders.arrivalAfterShiftEndMinutes = 35;

    await expect(syncNativeReminders(profile, 'ru-RU')).resolves.toBe(true);

    expect(mocks.systemAlarm.clearRememberedAlarm).toHaveBeenCalledOnce();
    expect(mocks.systemAlarm.setAlarm).not.toHaveBeenCalled();
  });

  it('does not touch native APIs outside an installed native app', async () => {
    const { syncNativeReminders } = await service();
    mocks.capacitor.isNativePlatform.mockReturnValue(false);

    await expect(syncNativeReminders(workProfile(), 'en-US')).resolves.toBe(false);

    expect(mocks.localNotifications.getPending).not.toHaveBeenCalled();
    expect(mocks.systemAlarm.setAlarm).not.toHaveBeenCalled();
  });
});

describe('Android alarm controls', () => {
  it('schedules a test alarm for the next whole minute in a separate scope', async () => {
    const { runAndroidTestAlarmDiagnostics } = await service();

    await expect(runAndroidTestAlarmDiagnostics('Test alarm')).resolves.toMatchObject({
      ok: true,
      requestedAt: new Date(2026, 0, 5, 0, 1).getTime(),
    });
    expect(mocks.systemAlarm.setAlarm).toHaveBeenCalledWith({
      id: 'my-shift:test-system-alarm',
      message: 'Test alarm',
      timestamp: String(new Date(2026, 0, 5, 0, 1).getTime()),
      skipUi: false,
      includeRingtone: false,
    });
  });

  it('clears only the separate test alarm scope', async () => {
    const { clearAndroidTestAlarm } = await service();

    await expect(clearAndroidTestAlarm()).resolves.toBe(true);
    expect(mocks.systemAlarm.clearRememberedAlarm).toHaveBeenCalledWith({
      id: 'my-shift:test-system-alarm',
    });
  });

  it('saves vibration and volume options through the SystemAlarm plugin', async () => {
    const { setAndroidAlarmOptions } = await service();

    await expect(
      setAndroidAlarmOptions({ vibrationEnabled: false, volumeRampEnabled: true }),
    ).resolves.toBe(true);

    expect(mocks.systemAlarm.setAlarmOptions).toHaveBeenCalledWith({
      vibrationEnabled: false,
      volumeRampEnabled: true,
    });
  });

  it('returns false when optional alarm control calls fail', async () => {
    const { chooseAndroidAlarmSound, previewAndroidAlarmSound, stopAndroidAlarmPreview } =
      await service();
    mocks.systemAlarm.chooseAlarmSound.mockRejectedValueOnce(new Error('picker missing'));
    mocks.systemAlarm.previewAlarmSound.mockRejectedValueOnce(new Error('sound missing'));
    mocks.systemAlarm.stopAlarmPreview.mockRejectedValueOnce(new Error('stop failed'));

    await expect(chooseAndroidAlarmSound()).resolves.toBe(false);
    await expect(previewAndroidAlarmSound()).resolves.toBe(false);
    await expect(stopAndroidAlarmPreview()).resolves.toBe(false);
  });

  it('reports plugin errors in alarm diagnostics instead of throwing', async () => {
    const { getAndroidAlarmDiagnostics } = await service();
    mocks.systemAlarm.getStatus.mockRejectedValueOnce(new Error('plugin unavailable'));

    await expect(getAndroidAlarmDiagnostics()).resolves.toMatchObject({
      canSetAlarm: false,
      hasCustomSound: false,
      lastSetAlarmError: 'plugin unavailable',
    });
  });
});

describe('Android manifest alarm permissions', () => {
  it('keeps permissions required by full-screen alarms, exact alarms and vibration', () => {
    const manifest = readFileSync('src-capacitor/android/app/src/main/AndroidManifest.xml', 'utf8');

    expect(manifest).toContain('android.permission.SCHEDULE_EXACT_ALARM');
    expect(manifest).toContain('android.permission.USE_FULL_SCREEN_INTENT');
    expect(manifest).toContain('android.permission.VIBRATE');
  });

  it('keeps alarm Activity sound and vibration failures observable instead of fatal', () => {
    const activity = readFileSync(
      'src-capacitor/android/app/src/main/java/com/myshift/app/SystemAlarmActivity.java',
      'utf8',
    );

    expect(activity).toContain('LAST_ALARM_ACTIVITY_ERROR');
    expect(activity).toContain('rememberActivityError("sound:"');
    expect(activity).toContain('rememberActivityError("vibration:"');
    expect(activity).toContain('rememberActivityError("stop-vibration:"');
  });

  it('keeps test and work alarms separate and replaces the previous owned alarm', () => {
    const plugin = readFileSync(
      'src-capacitor/android/app/src/main/java/com/myshift/app/SystemAlarmPlugin.java',
      'utf8',
    );

    expect(plugin).toContain('return "test".equals(scope) ? 9302 : 9301;');
    expect(plugin).toContain('alarmManager.cancel(operation);');
    expect(plugin).toContain('alarmManager.setAlarmClock');
    expect(plugin.indexOf('alarmManager.cancel(operation);')).toBeLessThan(
      plugin.indexOf('alarmManager.setAlarmClock'),
    );
  });
});
