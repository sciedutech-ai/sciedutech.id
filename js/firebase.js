import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA7_DlF7cuWjT6T3dIfQq0BCLeuKIcyFrQ",
  authDomain: "sciedutech-platform.firebaseapp.com",
  projectId: "sciedutech-platform",
  appId: "1:548051165082:web:281d741d46277ff4432423"
};

// INIT SEKALI SAJA
const app = initializeApp(firebaseConfig);

// EXPORT DARI APP YANG SAMA
export const auth = getAuth(app);
export const db = getFirestore(app);

///
