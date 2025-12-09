const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const stripe = require('stripe')(functions.config().stripe ? functions.config().stripe.secret : 'STRIPE_SECRET_PLACEHOLDER');
const sgMail = require('@sendgrid/mail');
if(functions.config().sendgrid) sgMail.setApiKey(functions.config().sendgrid.key);

exports.createCheckoutSession = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send({error:'Method not allowed'});
    const idToken = (req.headers.authorization||'').split('Bearer ')[1];
    if (!idToken) return res.status(401).send({error:'Unauthorized'});
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const { course, price } = req.body;
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'https://YOUR_DOMAIN/thanks.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://YOUR_DOMAIN/',
      line_items: [{
        price_data: {
          currency: 'idr',
          product_data: { name: `Akses kelas ${course}` },
          unit_amount: Math.round((price||3000) * 100)
        },
        quantity: 1
      }],
      metadata: { uid, course }
    });
    res.json({ sessionUrl: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  // For raw body verification in Stripe, configure the function to not parse body.
  // When deploying, register webhook secret and use stripe.webhooks.constructEvent
  res.json({ received: true });
});

exports.redeemCode = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send({error:'Method not allowed'});
    const idToken = (req.headers.authorization||'').split('Bearer ')[1];
    if (!idToken) return res.status(401).send({error:'Unauthorized'});
    const decoded = await admin.auth().verifyIdToken(idToken);
    const uid = decoded.uid;
    const { code } = req.body;
    if (!code) return res.status(400).send({error:'No code'});
    const codeRef = db.collection('accessCodes').doc(code);
    const result = await db.runTransaction(async t => {
      const snap = await t.get(codeRef);
      if (!snap.exists) throw new Error('Kode tidak valid');
      const data = snap.data();
      if (data.used) throw new Error('Kode sudah digunakan');
      t.update(codeRef, { used:true, owner: uid, usedAt: admin.firestore.FieldValue.serverTimestamp() });
      const course = data.course || 'ALL';
      const pRef = db.collection('users').doc(uid).collection('purchases').doc(course);
      t.set(pRef, { course, boughtAt: admin.firestore.FieldValue.serverTimestamp(), via:'redeem', lifetime:true });
      return { course };
    });
    // send email via SendGrid if configured
    try {
      const user = await admin.auth().getUser(uid);
      if (user && user.email && functions.config().sendgrid) {
        const msg = {
          to: user.email,
          from: functions.config().sendgrid.from,
          subject: `Kode berhasil digunakan`,
          text: `Halo ${user.displayName||''}, kode ${code} berhasil digunakan. Anda mendapatkan akses ${result.course}.`
        };
        await sgMail.send(msg);
      }
    } catch(e){ console.error('sendgrid error', e); }
    res.json({message: 'Kode berhasil diklaim. Akses sudah ditambahkan.'});
  } catch(err) {
    console.error(err);
    res.status(400).json({error: err.message});
  }
});
