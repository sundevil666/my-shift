import type { UserData } from 'src/models/app';

const STORAGE_KEY = 'my-shift:user-data';

export interface StorageAdapter {
  load(): UserData | null;
  save(data: UserData): void;
}

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
};
