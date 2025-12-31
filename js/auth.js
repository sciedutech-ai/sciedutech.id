// ===============================
// FIREBASE AUTH (LOGIN & REGISTER)
// ===============================

// 1. IMPORT FIREBASE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 2. KONFIGURASI FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyA7_DlF7cuWjT6T3dIfQq0BCLeuKIcyFrQ",
  authDomain: "sciedutech-platform.firebaseapp.com",
  projectId: "sciedutech-platform",
  appId: "1:548051165082:web:281d741d46277ff4432423"
};

// 3. INIT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ===============================
// REGISTER
// ===============================
window.register = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email dan password wajib diisi");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Registrasi berhasil, silakan login");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// ===============================
// LOGIN
// ===============================
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Email dan password wajib diisi");
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};

// ===============================
// CEK AUTH (PROTECT PAGE)
// ===============================
window.checkAuth = function () {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
};

// ===============================
// LOGOUT
// ===============================
window.logout = function () {
  signOut(auth)
    .then(() => {
      alert("Logout berhasil");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert(error.message);
    });
};
export { auth };