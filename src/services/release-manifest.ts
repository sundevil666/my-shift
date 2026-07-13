import { Capacitor } from '@capacitor/core';

export type ReleaseChannel = 'stable' | 'advanced';
export type ReleasePlatform = 'android' | 'ios';

export interface MobileRelease {
  version: string;
  versionCode: number;
  date: string;
  url: string | null;
  sha256: string | null;
  status: 'available' | 'preparing';
}

export type MobileReleaseManifest = Record<
  ReleasePlatform,
  Record<ReleaseChannel, MobileRelease[]>
>;

const REMOTE_MANIFEST_URL =
  'https://github.com/sundevil666/my-shift/releases/latest/download/mobile-releases.json';
const DEPLOYED_MANIFEST_URL = 'https://my-shift-iota.vercel.app/mobile-releases.json';

export const RELEASE_MANIFEST_URLS = [
  '/mobile-releases.json',
  DEPLOYED_MANIFEST_URL,
  'https://raw.githubusercontent.com/sundevil666/my-shift/main/public/mobile-releases.json',
  REMOTE_MANIFEST_URL,
] as const;

const NATIVE_RELEASE_MANIFEST_URLS = [
  DEPLOYED_MANIFEST_URL,
  'https://raw.githubusercontent.com/sundevil666/my-shift/main/public/mobile-releases.json',
  REMOTE_MANIFEST_URL,
] as const;

export async function loadReleaseManifest(
  fetcher: typeof fetch = fetch,
): Promise<MobileReleaseManifest | null> {
  const manifests: MobileReleaseManifest[] = [];
  for (const source of releaseManifestUrls()) {
    try {
      const separator = source.includes('?') ? '&' : '?';
      const response = await fetcher(`${source}${separator}time=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!response.ok) continue;
      const manifest = (await response.json()) as MobileReleaseManifest;
      if (isReleaseManifest(manifest)) manifests.push(manifest);
    } catch {
      // Try the next independent source.
    }
  }
  return manifests.length > 0 ? mergeReleaseManifests(manifests) : null;
}

function releaseManifestUrls(): readonly string[] {
  if (Capacitor.isNativePlatform()) {
    return NATIVE_RELEASE_MANIFEST_URLS;
  }

  if (
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  ) {
    return ['/mobile-releases.json'];
  }
  return RELEASE_MANIFEST_URLS;
}

export function latestAvailableRelease(
  releases: MobileRelease[],
  currentVersionCode = 0,
): MobileRelease | null {
  return (
    releases
      .filter(
        (release) =>
          release.status === 'available' &&
          Boolean(release.url) &&
          Boolean(release.sha256) &&
          release.versionCode > currentVersionCode,
      )
      .sort((left, right) => right.versionCode - left.versionCode)[0] ?? null
  );
}

function mergeReleaseManifests(manifests: MobileReleaseManifest[]): MobileReleaseManifest {
  return {
    android: {
      stable: mergeReleases(manifests.flatMap((manifest) => manifest.android.stable)),
      advanced: mergeReleases(manifests.flatMap((manifest) => manifest.android.advanced)),
    },
    ios: {
      stable: mergeReleases(manifests.flatMap((manifest) => manifest.ios.stable)),
      advanced: mergeReleases(manifests.flatMap((manifest) => manifest.ios.advanced)),
    },
  };
}

function mergeReleases(releases: MobileRelease[]): MobileRelease[] {
  const byVersionCode = new Map<number, MobileRelease>();
  for (const release of releases) {
    const existing = byVersionCode.get(release.versionCode);
    if (!existing || release.status === 'available') {
      byVersionCode.set(release.versionCode, release);
    }
  }
  return [...byVersionCode.values()].sort((left, right) => right.versionCode - left.versionCode);
}

const analyticsOrigin = 'https://my-shift-iota.vercel.app';

export function trackedDownloadUrl(release: MobileRelease, absolute = false): string | null {
  if (!release.url) return null;
  const params = new URLSearchParams({
    version: release.version,
    url: release.url,
  });
  return `${absolute ? analyticsOrigin : ''}/api/analytics/download?${params.toString()}`;
}

function isReleaseManifest(value: unknown): value is MobileReleaseManifest {
  if (!value || typeof value !== 'object') return false;
  const manifest = value as Partial<MobileReleaseManifest>;
  return ['android', 'ios'].every((platform) => {
    const channels = manifest[platform as ReleasePlatform];
    return (
      channels &&
      ['stable', 'advanced'].every((channel) =>
        Array.isArray(channels[channel as ReleaseChannel]),
      )
    );
  });
}
