import { Capacitor } from '@capacitor/core';

const reportingOrigin = 'https://my-shift-iota.vercel.app';
const reportedErrors = new Set<string>();

export interface ErrorDetails {
  name: string;
  message: string;
  stack: string;
}

export function reportError(error: unknown): void {
  if (typeof window === 'undefined' || window.location.hostname === 'localhost') return;

  const details = normalizeError(error);
  const fingerprint = `${details.name}:${details.message}:${details.stack.slice(0, 500)}`;
  if (reportedErrors.has(fingerprint)) return;
  reportedErrors.add(fingerprint);

  const endpoint = Capacitor.isNativePlatform()
    ? `${reportingOrigin}/api/error-report`
    : '/api/error-report';
  const body = JSON.stringify({
    ...details,
    page: `${window.location.origin}${window.location.pathname}${window.location.hash}`,
    platform: Capacitor.isNativePlatform() ? Capacitor.getPlatform() : 'web',
    appVersion: process.env.APP_VERSION,
  });

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Error reporting must never cause another user-facing failure.
  });
}

export function normalizeError(error: unknown): ErrorDetails {
  if (error instanceof Error) {
    return {
      name: error.name || 'Error',
      message: error.message || 'Unknown error',
      stack: error.stack?.slice(0, 8000) ?? '',
    };
  }

  if (typeof error === 'string') return { name: 'Error', message: error, stack: '' };

  return {
    name: 'Error',
    message: safelySerialize(error).slice(0, 2000) || 'Unknown error',
    stack: '',
  };
}

function safelySerialize(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
