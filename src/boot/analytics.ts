import { Capacitor } from '@capacitor/core';
import { defineBoot } from '#q-app/wrappers';

const installationKey = 'my-shift:anonymous-installation-id';
const lastActivityKey = 'my-shift:last-activity-date';
const analyticsOrigin = 'https://my-shift-iota.vercel.app';

export default defineBoot(() => {
  if (typeof window === 'undefined' || window.location.hostname === 'localhost') return;

  const today = new Date().toISOString().slice(0, 10);
  const activityMarker = `${today}:${process.env.APP_VERSION}`;
  if (localStorage.getItem(lastActivityKey) === activityMarker) return;

  const installationId = getInstallationId();
  const endpoint = Capacitor.isNativePlatform()
    ? `${analyticsOrigin}/api/analytics/activity`
    : '/api/analytics/activity';
  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      installationId,
      platform: detectPlatform(),
      appVersion: process.env.APP_VERSION,
    }),
    keepalive: true,
  })
    .then((response) => {
      if (response.ok) localStorage.setItem(lastActivityKey, activityMarker);
    })
    .catch(() => {
      // Analytics must never prevent offline or local-first use.
    });
});

function getInstallationId() {
  const stored = localStorage.getItem(installationKey);
  if (stored) return stored;
  const created = crypto.randomUUID();
  localStorage.setItem(installationKey, created);
  return created;
}

function detectPlatform() {
  if (Capacitor.isNativePlatform()) return Capacitor.getPlatform();
  if (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  ) {
    return 'pwa';
  }
  return 'web';
}
