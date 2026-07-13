import { defaultUserData } from 'src/core/defaults';
import type { Locale, ThemeMode, UserData } from 'src/models/app';

export function migrateUserData(saved: unknown): UserData | null {
  if (!saved || typeof saved !== 'object') return null;
  const candidate = saved as Record<string, unknown>;
  if (candidate.schemaVersion === 2) {
    const data = structuredClone(candidate) as unknown as UserData;
    data.settings.cloudPushConsent ??= false;
    data.workProfiles.forEach((profile) => {
      profile.reminders.arrivalEnabled ??= false;
      profile.reminders.arrivalAfterShiftEndMinutes ??= 35;
      profile.reminders.arrivalMode ??= 'notification';
    });
    return data;
  }
  if (candidate.schemaVersion !== 1) return null;

  const result = structuredClone(defaultUserData);
  const oldSettings = (candidate.settings ?? {}) as Record<string, unknown>;
  result.settings = {
    ...result.settings,
    locale: (oldSettings.locale as Locale) ?? result.settings.locale,
    theme: (oldSettings.theme as ThemeMode) ?? result.settings.theme,
    sleepHours: Number(oldSettings.sleepHours ?? result.settings.sleepHours),
  };
  return result;
}

export function serializeMigration(data: UserData): string {
  return JSON.stringify({
    format: 'my-shift-domain-migration',
    exportedAt: new Date().toISOString(),
    data,
  });
}

export function parseMigration(value: string): UserData | null {
  try {
    const parsed = JSON.parse(value) as { format?: string; data?: unknown };
    if (parsed.format !== 'my-shift-domain-migration') return null;
    return migrateUserData(parsed.data);
  } catch {
    return null;
  }
}
