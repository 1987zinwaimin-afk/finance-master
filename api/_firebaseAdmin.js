const admin = require('firebase-admin');

function parseServiceAccount(raw) {
  let value = String(raw || '').trim().replace(/^\uFEFF/, '');
  if (!value) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');

  // Accept common environment-variable copy formats without ever logging the secret.
  value = value.replace(/^(?:export\s+)?FIREBASE_SERVICE_ACCOUNT\s*=\s*/i, '').trim();
  value = value.replace(/^\x60\x60\x60(?:json)?\s*/i, '').replace(/\s*\x60\x60\x60\s*$/, '').trim();

  const candidates = [];
  if (value.startsWith('base64:')) {
    try { candidates.push(Buffer.from(value.slice(7).trim(), 'base64').toString('utf8').trim()); }
    catch (_) {}
  }
  candidates.push(value);
  if ((value.startsWith("'") && value.endsWith("'")) ||
      (value.startsWith('"') && value.endsWith('"'))) {
    candidates.push(value.slice(1, -1).trim());
  }

  const repairPemNewlines = candidate => candidate.replace(
    /("private_key"\s*:\s*")([\s\S]*?)("\s*[,}])/,
    (_, prefix, key, suffix) => prefix + key.replace(/\r?\n/g, '\\n') + suffix
  );

  let serviceAccount = null;
  for (const candidate of candidates) {
    for (const input of [candidate, repairPemNewlines(candidate)]) {
      try {
        const parsed = JSON.parse(input);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          serviceAccount = parsed;
          break;
        }
        if (typeof parsed === 'string') {
          const nested = JSON.parse(parsed);
          if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
            serviceAccount = nested;
            break;
          }
        }
      } catch (_) {}
    }
    if (serviceAccount) break;
  }

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON. Copy the complete Firebase service-account JSON object into the Vercel variable without adding extra text.');
  }
  if (serviceAccount.type !== 'service_account' ||
      serviceAccount.project_id !== 'finance-master-8d227') {
    throw new Error('Firebase service account type or project does not match Finance Master.');
  }
  if (typeof serviceAccount.client_email !== 'string' ||
      !serviceAccount.client_email.endsWith('.iam.gserviceaccount.com') ||
      typeof serviceAccount.private_key !== 'string' ||
      !/-----BEGIN PRIVATE KEY-----[\s\S]*-----END PRIVATE KEY-----/.test(serviceAccount.private_key)) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing a valid client_email or private_key. Re-copy the complete JSON key from the Finance Master Firebase service account.');
  }

  // Vercel may preserve escaped newlines literally; Firebase Admin needs PEM line breaks.
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
  return serviceAccount;
}

function getAdmin() {
  if (admin.apps.length) return admin;
  const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

function hash(value) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = { getAdmin, hash, parseServiceAccount };
