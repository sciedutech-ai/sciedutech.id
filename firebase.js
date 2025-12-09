// =========================
// Firebase Modular v12
// =========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { 
  getAuth, 
  onAuthStateChanged, 
  GoogleAuthProvider,
  PhoneAuthProvider,
  EmailAuthProvider,
  signOut
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { 
  getFirestore 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { 
  getStorage 
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

// =========================
// CONFIG KAMU
// =========================

const firebaseConfig = {
  apiKey: "AIzaSyBfZa9Xp3gNV7QscwAYBXkJBtlYr2IyYwY",
  authDomain: "sciedutech-database.firebaseapp.com",
  projectId: "sciedutech-database",
  storageBucket: "sciedutech-database.appspot.com",
  messagingSenderId: "564808493806",
  appId: "1:564808493806:web:edf713a5586c993455a1ff",
  measurementId: "G-DBLJVSXJLD"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Providers
const googleProvider = new GoogleAuthProvider();
const phoneProvider = new PhoneAuthProvider();
const emailProvider = new EmailAuthProvider();

// Expose global
window.scieduAuth = auth;
window.scieduDB = db;
window.scieduStorage = storage;
window.googleProvider = googleProvider;
window.phoneProvider = phoneProvider;
window.emailProvider = emailProvider;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
