import path from 'node:path';

const forbiddenFilePatterns = [
  { pattern: /(^|\/)\.env($|\.)/i, allow: /\.env\.example$/i, label: 'environment file' },
  { pattern: /\.(jks|keystore|p12|pfx|pem|key)$/i, label: 'key or certificate file' },
  { pattern: /(^|\/)(id_rsa|id_ed25519|credentials\.json)$/i, label: 'credential file' },
];

const credentialPatterns = [
  { pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, label: 'private key' },
  { pattern: /\bAKIA[0-9A-Z]{16}\b/, label: 'AWS access key' },
  { pattern: /\bghp_[A-Za-z0-9]{30,}\b/, label: 'GitHub token' },
  { pattern: /\bgithub_pat_[A-Za-z0-9_]{30,}\b/, label: 'GitHub token' },
  { pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/, label: 'Slack token' },
  { pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{20,}\b/, label: 'secret API key' },
  { pattern: /\bre_[A-Za-z0-9]{20,}\b/, label: 'Resend API key' },
  {
    pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    label: 'JWT token',
  },
  {
    pattern: /(?:https?|postgres(?:ql)?):\/\/[^/\s:@]+:[^/\s@]+@/i,
    label: 'URL with embedded credentials',
  },
];

const sensitiveAssignment =
  /^\s*["']?([A-Za-z0-9_.-]*(?:api[_-]?key|secret|token|password|passwd|private[_-]?key)[A-Za-z0-9_.-]*)["']?\s*[:=]\s*(.+?)\s*[,;]?\s*$/i;

export function scanTrackedFile(filePath, content) {
  const findings = [];
  const normalizedPath = filePath.split(path.sep).join('/');

  for (const rule of forbiddenFilePatterns) {
    if (rule.pattern.test(normalizedPath) && !rule.allow?.test(normalizedPath)) {
      findings.push({ file: normalizedPath, line: 1, reason: rule.label });
    }
  }

  if (content === null) return findings;

  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const rule of credentialPatterns) {
      if (rule.pattern.test(line)) {
        findings.push({ file: normalizedPath, line: index + 1, reason: rule.label });
      }
    }

    const assignment = line.match(sensitiveAssignment);
    if (!assignment) continue;
    const value = stripQuotes(assignment[2] ?? '');
    if (looksLikeRealSecret(value)) {
      findings.push({
        file: normalizedPath,
        line: index + 1,
        reason: `hardcoded ${assignment[1]}`,
      });
    }
  }

  return uniqueFindings(findings);
}

function stripQuotes(value) {
  return value.trim().replace(/^["']|["']$/g, '');
}

function looksLikeRealSecret(value) {
  if (!value || value.length < 8) return false;
  if (
    /^(?:process\.env|import\.meta\.env|\$\{\{\s*secrets\.|Deno\.env|getenv\(|requireEnvironment\()/i.test(
      value,
    )
  ) {
    return false;
  }
  if (
    /(?:example|placeholder|replace[-_ ]?with|your[-_ ]|changeme|not[-_ ]?a[-_ ]?secret|<.+>)/i.test(
      value,
    )
  ) {
    return false;
  }
  return /[A-Za-z]/.test(value) && /[0-9_\-+/=]/.test(value);
}

function uniqueFindings(findings) {
  return findings.filter(
    (finding, index) =>
      findings.findIndex(
        (candidate) =>
          candidate.file === finding.file &&
          candidate.line === finding.line &&
          candidate.reason === finding.reason,
      ) === index,
  );
}
