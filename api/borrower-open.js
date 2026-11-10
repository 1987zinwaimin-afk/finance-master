const { getAdmin, hash } = require('./_firebaseAdmin');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed.' });
  try {
    const admin = getAdmin();
    const token = String(req.body?.token || '');
    const sessionId = String(req.body?.sessionId || '');
    if (token.length < 24 || token.length > 512 || !/^[a-zA-Z0-9-]{12,100}$/.test(sessionId)) {
      return res.status(400).json({ error: 'Invalid borrower link event.' });
    }
    const db = admin.firestore();
    const shareSnap = await db.doc('borrowerShares/' + token).get();
    if (!shareSnap.exists || shareSnap.data().active !== true) return res.status(404).json({ error: 'This borrower link is unavailable.' });
    const share = shareSnap.data();
    if (!share.ownerUid || !share.borrowerName) return res.status(400).json({ error: 'Borrower link details are incomplete.' });

    const rateRef = db.doc('borrowerPushRateLimits/' + hash(token));
    const now = Date.now();
    const allowed = await db.runTransaction(async tx => {
      const prior = await tx.get(rateRef);
      const last = prior.exists ? Number(prior.data().lastSentMs || 0) : 0;
      if (now - last < 120000) return false;
      tx.set(rateRef, { lastSentMs: now, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      return true;
    });
    if (!allowed) return res.status(200).json({ ok: true, throttled: true });

    const tokenSnap = await db.collection('users').doc(share.ownerUid).collection('pushTokens').where('active', '==', true).get();
    const deviceTokens = [...new Set(tokenSnap.docs.map(d => d.data().token).filter(Boolean))].slice(0, 500);
    if (!deviceTokens.length) return res.status(200).json({ ok: true, delivered: 0, reason: 'owner-device-not-registered' });

    const borrowerName = String(share.borrowerName).slice(0, 100);
    const response = await admin.messaging().sendEachForMulticast({
      tokens: deviceTokens,
      data: {
        title: 'Finance Master · Customer Login',
        body: borrowerName + ' opened their private borrower account.',
        url: '/?source=borrower-notification',
        tag: 'borrower-open-' + hash(token).slice(0, 16)
      },
      webpush: { headers: { TTL: '300', Urgency: 'high' } }
    });
    const batch = db.batch();
    response.responses.forEach((result, index) => {
      if (!result.success && ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token'].includes(result.error?.code)) {
        batch.set(tokenSnap.docs[index].ref, { active: false, disabledAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    });
    await batch.commit();
    return res.status(200).json({ ok: true, delivered: response.successCount });
  } catch (error) {
    console.error('borrower-open push failed:', error.message);
    return res.status(500).json({ error: 'Could not send the owner notification.' });
  }
};
