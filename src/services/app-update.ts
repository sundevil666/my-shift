import { backupAndClearUserData, getStoredSchemaVersion } from 'src/services/storage/storage';

export interface AppUpdateDetail {
  registration: ServiceWorkerRegistration;
  compatible: boolean;
  storedSchemaVersion: number | null;
  release: string | null;
}

export const CURRENT_APP_VERSION = process.env.APP_VERSION;
export const CURRENT_ANDROID_VERSION_CODE = Number(process.env.ANDROID_VERSION_CODE);

interface UpdateMetadata {
  release?: string;
  compatibleDataVersions?: number[];
}

export const APP_UPDATE_AVAILABLE_EVENT = 'my-shift:update-available';

export async function createAppUpdateDetail(
  registration: ServiceWorkerRegistration,
): Promise<AppUpdateDetail> {
  const storedSchemaVersion = getStoredSchemaVersion();
  const metadata = await loadUpdateMetadata();
  const compatibleVersions = metadata?.compatibleDataVersions ?? [];

  return {
    registration,
    storedSchemaVersion,
    release: metadata?.release ?? null,
    compatible:
      storedSchemaVersion === null || compatibleVersions.includes(storedSchemaVersion),
  };
}

export function activateAppUpdate(detail: AppUpdateDetail, resetData: boolean): boolean {
  if (resetData && !backupAndClearUserData()) return false;

  const waitingWorker = detail.registration.waiting;
  if (!waitingWorker) {
    window.location.reload();
    return true;
  }

  let reloading = false;
  const reload = () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    reload();
  });
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  window.setTimeout(reload, 4_000);
  return true;
}

async function loadUpdateMetadata(): Promise<UpdateMetadata | null> {
  try {
    const response = await fetch(`app-update.json?time=${Date.now()}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as UpdateMetadata;
  } catch {
    return null;
  }
}

declare global {
  interface WindowEventMap {
    [APP_UPDATE_AVAILABLE_EVENT]: CustomEvent<AppUpdateDetail>;
  }
}
