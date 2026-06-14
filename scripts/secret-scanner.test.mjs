import { describe, expect, it } from 'vitest';
import { scanTrackedFile } from './secret-scanner.mjs';

describe('secret scanner', () => {
  it('rejects tracked environment and keystore files', () => {
    expect(scanTrackedFile('.env', 'SAFE=value')).toEqual([
      { file: '.env', line: 1, reason: 'environment file' },
    ]);
    expect(scanTrackedFile('android/release.jks', null)).toEqual([
      { file: 'android/release.jks', line: 1, reason: 'key or certificate file' },
    ]);
  });

  it('allows empty and documented example configuration', () => {
    expect(
      scanTrackedFile(
        '.env.example',
        [
          'RESEND_API_KEY=',
          'FEEDBACK_CAPTCHA_SECRET=',
          'PASSWORD=replace-with-secure-password',
        ].join('\n'),
      ),
    ).toEqual([]);
  });

  it('detects known token and private-key formats', () => {
    const findings = scanTrackedFile(
      'config.txt',
      [
        ['github', '_pat_1234567890abcdefghijklmnopqrstuvwxyz'].join(''),
        ['-----BEGIN ', 'PRIVATE KEY-----'].join(''),
        ['postgres://app:', 'SuperSecret123', '@db.example.com/app'].join(''),
      ].join('\n'),
    );
    expect(findings.map(({ reason }) => reason)).toEqual([
      'GitHub token',
      'private key',
      'URL with embedded credentials',
    ]);
  });

  it('detects hardcoded sensitive assignments', () => {
    expect(scanTrackedFile('config.json', '"apiKey": "live_1234567890abcdef"')).toEqual([
      { file: 'config.json', line: 1, reason: 'hardcoded apiKey' },
    ]);
    expect(scanTrackedFile('keystore.properties', 'storePassword=S3cureValue123')).toEqual([
      { file: 'keystore.properties', line: 1, reason: 'hardcoded storePassword' },
    ]);
  });

  it('allows environment references and GitHub Actions secrets', () => {
    expect(
      scanTrackedFile(
        'config.ts',
        [
          'const token = process.env.QSTASH_TOKEN;',
          "const secret = requireEnvironment('FEEDBACK_CAPTCHA_SECRET');",
          'password: ${{ secrets.ANDROID_KEY_PASSWORD }}',
        ].join('\n'),
      ),
    ).toEqual([]);
  });
});
