import { backupAndClearUserData, getStoredSchemaVersion } from 'src/services/storage/storage';

export interface AppUpdateDetail {
  registration: ServiceWorkerRegistration;
  compatible: boolean;
  storedSchemaVersion: number | null;
  release: string | null;
}

export const CURRENT_APP_VERSION = '0.1.1';

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
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
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
