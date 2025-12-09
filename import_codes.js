// import_codes.js
// Usage: place serviceAccountKey.json in root, then run:
//   node import_codes.js
const fs = require('fs');
const admin = require('firebase-admin');

const serviceAccountPath = './serviceAccountKey.json';
if(!fs.existsSync('./kode_akses.txt')){ console.error('kode_akses.txt not found'); process.exit(1); }
if(!fs.existsSync(serviceAccountPath)){ console.error('serviceAccountKey.json not found'); process.exit(1); }

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function importCodes(){
  const data = fs.readFileSync('./kode_akses.txt','utf8');
  const tokens = data.split(/\s+/).filter(Boolean);
  console.log('Found', tokens.length, 'codes');
  for(const code of tokens){
    await db.collection('accessCodes').doc(code).set({
      code, used:false, owner:null, createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Imported', code);
  }
  console.log('Done');
}

importCodes().catch(e=>console.error(e));
