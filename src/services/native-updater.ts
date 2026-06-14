import { Capacitor, registerPlugin } from '@capacitor/core';
import type { UserData } from 'src/models/app';

interface NativeUpdaterPlugin {
  install(options: { url: string; sha256: string; backup: string }): Promise<void>;
  consumeBackup(): Promise<{ backup: string | null }>;
}

const NativeUpdater = registerPlugin<NativeUpdaterPlugin>('NativeUpdater');

export function canInstallNativeAndroidUpdate(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export async function installNativeAndroidUpdate(
  url: string,
  sha256: string,
  data: UserData,
): Promise<void> {
  await NativeUpdater.install({
    url,
    sha256,
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
