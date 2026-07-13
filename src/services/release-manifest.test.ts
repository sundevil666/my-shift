import { describe, expect, it, vi } from 'vitest';
import {
  latestAvailableRelease,
  loadReleaseManifest,
  type MobileRelease,
  type MobileReleaseManifest,
} from './release-manifest';

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
    expect(await loadReleaseManifest(fetcher)).toEqual(manifest);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('uses the local manifest during local development', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost' } });
    const manifest: MobileReleaseManifest = {
      android: { stable: releases, advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(manifest)));

    expect(await loadReleaseManifest(fetcher)).toEqual(manifest);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toMatch(/^\/mobile-releases\.json\?time=/);
    vi.unstubAllGlobals();
  });

  it('skips the bundled manifest in native Android builds', async () => {
    vi.stubGlobal('window', { location: { hostname: 'localhost', protocol: 'capacitor:' } });
    const manifest: MobileReleaseManifest = {
      android: { stable: releases, advanced: [] },
      ios: { stable: [], advanced: [] },
    };
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(manifest)));

    expect(await loadReleaseManifest(fetcher)).toEqual(manifest);
    expect(fetcher).toHaveBeenCalledOnce();
    expect(fetcher.mock.calls[0]?.[0]).toMatch(
      /^https:\/\/raw\.githubusercontent\.com\/sundevil666\/my-shift\/main\/public\/mobile-releases\.json\?time=/,
    );
    vi.unstubAllGlobals();
  });
});
