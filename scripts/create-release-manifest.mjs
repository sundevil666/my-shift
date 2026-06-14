import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [apkPath, outputPath, downloadUrl] = process.argv.slice(2);
if (!apkPath || !outputPath || !downloadUrl) {
  throw new Error('Usage: create-release-manifest <apk> <output> <download-url>');
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const version = process.env.RELEASE_VERSION ?? pkg.version;
const versionCode = Number(process.env.RELEASE_VERSION_CODE ?? pkg.androidVersionCode);
if (!Number.isInteger(versionCode) || versionCode < 1) throw new Error('Invalid versionCode');

const checksum = createHash('sha256').update(await readFile(apkPath)).digest('hex');
const release = {
  version,
  versionCode,
  date: new Date().toISOString().slice(0, 10),
  url: downloadUrl,
  sha256: checksum,
  status: 'available',
};
const manifest = {
  android: { stable: [release], advanced: [] },
  ios: { stable: [], advanced: [] },
};
await writeFile(path.resolve(outputPath), `${JSON.stringify(manifest, null, 2)}\n`);
