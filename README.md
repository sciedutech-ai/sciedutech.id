
Sciedutech.id - Ready-to-deploy bundle
=====================================

What is included:
- public/ (frontend)
  - index.html, firebase.js (modular), app.js, style.css
  - content/ (sample empty index.json for each course)
- functions/ (cloud functions skeleton)
  - index.js, package.json
- import_codes.js (script to import kode_akses.txt into Firestore)
- kode_akses.txt (copied from your uploaded file)
- links.txt (copied from your uploaded file)

IMPORTANT next steps (required):
1. Replace placeholder logo in public/assets/logo.png with your actual image.
2. In public/firebase.js, verify storageBucket value (should be like 'PROJECT_ID.appspot.com').
3. Enable Authentication methods (Email, Phone, Google) in Firebase Console.
4. Deploy Firestore rules as described in conversation.
5. Set Firebase Functions config for Stripe & SendGrid:
   firebase functions:config:set stripe.secret="sk_..." stripe.webhook_secret="whsec_..." sendgrid.key="SG_xxx" sendgrid.from="noreply@sciedutech.id"
6. Download or create serviceAccountKey.json and place it next to import_codes.js if you want to run the import script locally.
7. Deploy functions and hosting:
   firebase deploy --only functions,hosting
8. Register Stripe webhook to functions endpoint for real payments.

Security notes:
- Do NOT commit serviceAccountKey.json or secret keys to public repos.
- accessCodes collection is intentionally non-readable from client; redeem is done via Cloud Function.

If you want, I can also:
- Add example announcement Cloud Function
- Convert Stripe code to Midtrans/Xendit (Indonesian providers)
- Add per-module access rules (instead of per-course)

