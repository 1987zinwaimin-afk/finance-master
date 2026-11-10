const { getAdmin, hash } = require('./_firebaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const admin = getAdmin();
    const header = String(req.headers.authorization || '');
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) return res.status(401).json({ error: 'Owner sign-in is required.' });
    const decoded = await admin.auth().verifyIdToken(match[1]);
    if (String(decoded.email || '').toLowerCase() !== '1987zinwaimin@gmail.com' || decoded.email_verified !== true) {
      return res.status(403).json({ error: 'Only the verified Finance Master Owner can register notifications.' });
    }
    const token = String(req.body?.token || '');
    if (token.length < 80 || token.length > 4096) return res.status(400).json({ error: 'Invalid FCM token.' });
    const tokenId = hash(token);
    await admin.firestore().doc('users/' + decoded.uid + '/pushTokens/' + tokenId).set({
      token, platform: 'web', active: true, updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('register-push failed:', error.message);
    return res.status(500).json({ error: 'Could not register this device for notifications.' });
  }
};
