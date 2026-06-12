import type { UserData } from 'src/models/app';

const STORAGE_KEY = 'my-shift:user-data';

export interface StorageAdapter {
  load(): UserData | Record<string, unknown> | null;
  save(data: UserData): StorageSaveResult;
  clear(): void;
}

export type StorageSaveResult =
  | { ok: true }
  | { ok: false; reason: 'quota-exceeded' | 'unavailable' };

export const browserStorage: StorageAdapter = {
  load() {
    try {
      const value = localStorage.getItem(STORAGE_KEY);
      return value ? (JSON.parse(value) as UserData) : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        reason: isQuotaExceededError(error) ? 'quota-exceeded' : 'unavailable',
      };
    }
  },
  clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith('my-shift:'))
      .forEach((key) => localStorage.removeItem(key));
  },
};

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014)
  );
}
