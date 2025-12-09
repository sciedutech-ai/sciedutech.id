// public/firebase.js (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBfZa9Xp3gNV7QscwAYBXkJBtlYr2IyYwY",
  authDomain: "sciedutech-database.firebaseapp.com",
  projectId: "sciedutech-database",
  storageBucket: "sciedutech-database.appspot.com",
  messagingSenderId: "564808493806",
  appId: "1:564808493806:web:edf713a5586c993455a1ff",
  measurementId: "G-DBLJVSXJLD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // exported for app.js to import
export const db = getFirestore(app);
export const storage = getStorage(app);

// Expose to window for compatibility with firebase-ui-auth script
window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;
