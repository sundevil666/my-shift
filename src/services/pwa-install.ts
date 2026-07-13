import { ref } from 'vue';
import { Capacitor } from '@capacitor/core';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const pwaInstallPrompt = ref<BeforeInstallPromptEvent | null>(null);
export const isPwaInstalled = ref(isInstalledDisplayMode());

let listenersRegistered = false;

export function registerPwaInstallListeners() {
  if (Capacitor.isNativePlatform() || listenersRegistered || typeof window === 'undefined') return;
  listenersRegistered = true;

  window.addEventListener('beforeinstallprompt', captureInstallPrompt);
  window.addEventListener('appinstalled', markAppInstalled);
}

export function unregisterPwaInstallListeners() {
  if (!listenersRegistered || typeof window === 'undefined') return;
  listenersRegistered = false;

  window.removeEventListener('beforeinstallprompt', captureInstallPrompt);
  window.removeEventListener('appinstalled', markAppInstalled);
}

export async function requestPwaInstall() {
  if (Capacitor.isNativePlatform()) return 'unavailable' as const;

  const prompt = pwaInstallPrompt.value;
  if (!prompt) return 'unavailable' as const;

  await prompt.prompt();
  const choice = await prompt.userChoice;
  pwaInstallPrompt.value = null;
  if (choice.outcome === 'accepted') isPwaInstalled.value = true;
  return choice.outcome;
}

function captureInstallPrompt(event: Event) {
  if (Capacitor.isNativePlatform()) return;

  event.preventDefault();
  pwaInstallPrompt.value = event as BeforeInstallPromptEvent;
}

function markAppInstalled() {
  pwaInstallPrompt.value = null;
  isPwaInstalled.value = true;
}

function isInstalledDisplayMode() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (Capacitor.isNativePlatform()) return true;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

registerPwaInstallListeners();
