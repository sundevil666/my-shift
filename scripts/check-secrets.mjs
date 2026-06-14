import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { scanTrackedFile } from './secret-scanner.mjs';

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);
const findings = [];

for (const file of trackedFiles) {
  let content = null;
  try {
    const bytes = readFileSync(file);
    if (!bytes.subarray(0, 8_192).includes(0)) content = bytes.toString('utf8');
  } catch {
    continue;
  }
  findings.push(...scanTrackedFile(file, content));
}

if (findings.length) {
  console.error('Potential secrets found in Git-tracked files:');
  for (const finding of findings) {
    console.error(`- ${finding.file}:${finding.line} (${finding.reason})`);
  }
  process.exitCode = 1;
} else {
  console.log(`Secret scan passed (${trackedFiles.length} tracked files checked).`);
}
