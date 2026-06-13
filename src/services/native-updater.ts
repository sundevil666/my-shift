import { Capacitor, registerPlugin } from '@capacitor/core';
import type { UserData } from 'src/models/app';

interface NativeUpdaterPlugin {
  install(options: { url: string; backup: string }): Promise<void>;
  consumeBackup(): Promise<{ backup: string | null }>;
}

const NativeUpdater = registerPlugin<NativeUpdaterPlugin>('NativeUpdater');

export function canInstallNativeAndroidUpdate(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function installNativeAndroidUpdate(url: string, data: UserData): Promise<void> {
  await NativeUpdater.install({
    url,
    backup: JSON.stringify(data),
  });
}

export async function loadNativeUpdateBackup(): Promise<UserData | null> {
  if (!canInstallNativeAndroidUpdate()) return null;
  try {
    const { backup } = await NativeUpdater.consumeBackup();
    if (!backup) return null;
    const parsed = JSON.parse(backup) as UserData;
    return parsed.schemaVersion === 2 ? parsed : null;
  } catch {
    return null;
  }
}
