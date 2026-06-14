import { beforeEach, describe, expect, it } from 'vitest';
import { defaultUserData } from 'src/core/defaults';
import { backupAndClearUserData, browserStorage } from './storage';

class MemoryStorage {
  private values = new Map<string, string>();
  get length() {
    return this.values.size;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}

describe('browser storage', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new MemoryStorage(),
      configurable: true,
    });
  });

  it('saves and restores user data', () => {
    expect(browserStorage.save(defaultUserData)).toEqual({ ok: true });
    expect(browserStorage.load()).toEqual(defaultUserData);
  });

  it('creates an update backup before clearing active data', () => {
    browserStorage.save(defaultUserData);
    expect(backupAndClearUserData()).toBe(true);
    expect(browserStorage.load()).toBeNull();
    expect(localStorage.getItem('my-shift:user-data:update-backup')).toBeTruthy();
  });
});
