const admin = require('firebase-admin');

function parseServiceAccount(raw) {
  const value = String(raw || '').trim();
  if (!value) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');

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

  let serviceAccount = null;
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
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

  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is not valid JSON. In Vercel, paste the complete Firebase service-account JSON object, or use base64:<encoded-json>. Do not add shell quotes.');
  }
  if (serviceAccount.project_id !== 'finance-master-8d227') {
    throw new Error('Firebase service account project does not match Finance Master.');
  }
  if (typeof serviceAccount.client_email !== 'string' ||
      !serviceAccount.client_email.endsWith('.iam.gserviceaccount.com') ||
      typeof serviceAccount.private_key !== 'string' ||
      !serviceAccount.private_key.includes('PRIVATE KEY')) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing a valid client_email or private_key. Re-copy the complete JSON key from the Finance Master Firebase service account.');
  }

  // Some environment-variable managers preserve escaped newlines literally.
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n').replace(/\r\n/g, '\n');
  return serviceAccount;
}

function getAdmin() {
  if (admin.apps.length) return admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  const serviceAccount = parseServiceAccount(raw);
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

function hash(value) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = { getAdmin, hash, parseServiceAccount };
