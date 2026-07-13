import { mkdtemp, rm, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = process.cwd();
const downloads = path.join(root, 'public', 'downloads');
const tempRoot = await mkdtemp(path.join(tmpdir(), 'my-shift-downloads-'));
const tempDownloads = path.join(tempRoot, 'downloads');

async function cleanAndroidDownloadAssets() {
  await rm(path.join(root, 'src-capacitor', 'www', 'downloads'), {
    force: true,
    recursive: true,
  });
  await rm(
    path.join(root, 'src-capacitor', 'android', 'app', 'src', 'main', 'assets', 'public', 'downloads'),
    {
      force: true,
      recursive: true,
    },
  );
}

async function runQuasarAndroidBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn('npx', ['quasar', 'build', '-m', 'capacitor', '-T', 'android'], {
      env: process.env,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Android build failed with exit code ${code}`));
    });
  });
}

let movedDownloads = false;
try {
  if (existsSync(downloads)) {
    await rename(downloads, tempDownloads);
    movedDownloads = true;
  }
  await cleanAndroidDownloadAssets();
  await runQuasarAndroidBuild();
  await cleanAndroidDownloadAssets();
} finally {
  if (movedDownloads && !existsSync(downloads)) {
    await rename(tempDownloads, downloads);
  }
  await rm(tempRoot, { force: true, recursive: true });
}
