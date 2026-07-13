import { describe, expect, it, vi } from 'vitest';
import {
  latestAvailableRelease,
  loadReleaseManifest,
  type MobileRelease,
  type MobileReleaseManifest,
} from './release-manifest';
import { Capacitor } from '@capacitor/core';

const releases: MobileRelease[] = [
  {
    version: '1.0.1',
    versionCode: 11,
    date: '2026-01-01',
    url: 'https://example.com/11.apk',
    sha256: 'a'.repeat(64),
    status: 'available',
  },
  {
    version: '1.0.3',
    versionCode: 13,
    date: '2026-01-03',
    url: 'https://example.com/13.apk',
    sha256: 'b'.repeat(64),
    status: 'available',
  },
];

describe('release manifest', () => {
  it('selects the highest installable versionCode', () => {
    expect(latestAvailableRelease(releases, 11)?.versionCode).toBe(13);
    expect(latestAvailableRelease(releases, 13)).toBeNull();
  });

  it('falls back when the primary source fails', async () => {
    const manifest: MobileReleaseManifest = {
      android: { stable: releases, advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify(manifest)));
    const result = await loadReleaseManifest(fetcher);
    expect(result?.android.stable.map((release) => release.versionCode)).toEqual([13, 11]);
    expect(fetcher).toHaveBeenCalledTimes(4);
  });

  it('keeps the newest release when an earlier source is stale', async () => {
    const staleManifest: MobileReleaseManifest = {
      android: { stable: [releases[0] as MobileRelease], advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const freshManifest: MobileReleaseManifest = {
      android: { stable: [releases[1] as MobileRelease], advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(JSON.stringify(staleManifest)))
      .mockResolvedValueOnce(new Response(JSON.stringify(freshManifest)))
      .mockRejectedValue(new Error('offline'));

    const manifest = await loadReleaseManifest(fetcher);

    expect(manifest?.android.stable[0]?.versionCode).toBe(13);
    expect(manifest?.android.stable[1]?.versionCode).toBe(11);
  });

  it('uses the local manifest during local development', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } });
    const manifest: MobileReleaseManifest = {
      android: { stable: releases, advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(manifest)));

    const result = await loadReleaseManifest(fetcher);
    expect(result?.android.stable.map((release) => release.versionCode)).toEqual([13, 11]);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toMatch(/^\/mobile-releases\.json\?time=/);
    vi.unstubAllGlobals();
  });

  it('skips the bundled manifest in native Android builds', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);
    vi.stubGlobal('window', { location: { hostname: 'localhost', protocol: 'http:' } });
    const manifest: MobileReleaseManifest = {
      android: { stable: releases, advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(manifest)));

    const result = await loadReleaseManifest(fetcher);
    expect(result?.android.stable.map((release) => release.versionCode)).toEqual([13, 11]);
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(fetcher.mock.calls[0]?.[0]).toMatch(
      /^https:\/\/my-shift-iota\.vercel\.app\/mobile-releases\.json\?time=/,
    );
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});
