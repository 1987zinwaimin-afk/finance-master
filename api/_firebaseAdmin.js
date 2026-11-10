const admin = require('firebase-admin');

function getAdmin() {
  if (admin.apps.length) return admin;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured.');
  let serviceAccount;
  try { serviceAccount = JSON.parse(raw); }
  catch (_) { throw new Error('FIREBASE_SERVICE_ACCOUNT must contain the complete service-account JSON.'); }
  if (serviceAccount.project_id !== 'finance-master-8d227') {
    throw new Error('Firebase service account project does not match Finance Master.');
  }
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  return admin;
}

function hash(value) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

module.exports = { getAdmin, hash };
