// public/app.js (Custom Auth UI, modular + uses globals set in firebase.js)

// ---------- IMPORTS (Firebase modular helpers we need) ----------
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged,
  getIdToken
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

import {
  setDoc,
  doc,
  serverTimestamp,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// ---------- GLOBALS from firebase.js ----------
const auth = window.scieduAuth;
const db = window.scieduDB;

// ---------- DOM ELEMENTS ----------
const openLoginBtn = document.getElementById("openLogin");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");
const authTitle = document.getElementById("authTitle");
const authMessage = document.getElementById("authMessage");

const emailInput = document.getElementById("emailInput");
const passwordInput = document.getElementById("passwordInput");
const authSubmit = document.getElementById("authSubmit");
const toggleMode = document.getElementById("toggleMode");

const googleLoginBtn = document.getElementById("googleLogin");
const phoneLoginBtn = document.getElementById("phoneLogin");

const phoneUI = document.getElementById("phoneUI");
const phoneInput = document.getElementById("phoneInput");
const sendOtpBtn = document.getElementById("sendOtp");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");
const verifyOtpBtn = document.getElementById("verifyOtp");
const backToEmail = document.getElementById("backToEmail");

const redeemBtn = document.getElementById("redeemBtn");
const redeemResult = document.getElementById("redeemResult");
const redeemCodeInput = document.getElementById("redeemCode");

const buyBtn = document.getElementById("buyBtn");
const buyResult = document.getElementById("buyResult");
const buyCourseSelect = document.getElementById("buyCourse");

// course open buttons
const openCourseBtns = document.querySelectorAll(".openCourse");

// user area
const userArea = document.getElementById("userArea");

// links
const waLinkEl = document.getElementById("waLink");
const tgLinkEl = document.getElementById("tgLink");

// ---------- UI STATE ----------
let mode = "login"; // or 'register'
let phoneConfirmationResult = null;

// ---------- Helpers ----------
function showModal() {
  authModal.classList.remove("hidden");
  authMessage.innerText = "";
  // reset small parts
  emailInput.value = "";
  passwordInput.value = "";
  phoneUI.classList.add("hidden");
  document.getElementById("authForm").classList.remove("hidden");
}

function hideModal() {
  authModal.classList.add("hidden");
  authMessage.innerText = "";
  // cleanup recaptcha if any
  if (window.recaptchaVerifier) {
    try { window.recaptchaVerifier.clear(); } catch(e) {}
    window.recaptchaVerifier = null;
  }
  otpSection.classList.add("hidden");
  phoneConfirmationResult = null;
}

function setAuthMode(newMode) {
  mode = newMode;
  if (mode === "login") {
    authTitle.innerText = "Masuk";
    authSubmit.innerText = "Masuk";
    toggleMode.innerText = "Belum punya akun? Daftar di sini";
  } else {
    authTitle.innerText = "Daftar";
    authSubmit.innerText = "Daftar";
    toggleMode.innerText = "Sudah punya akun? Masuk di sini";
  }
}

// ---------- Event Listeners (modal open/close and toggle) ----------
document.addEventListener("DOMContentLoaded", () => {
  // open login
  openLoginBtn && openLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode("login");
    showModal();
  });

  // close modal
  closeAuth && closeAuth.addEventListener("click", (e) => {
    e.preventDefault();
    hideModal();
  });

  // toggle login/register
  toggleMode && toggleMode.addEventListener("click", () => {
    setAuthMode(mode === "login" ? "register" : "login");
  });

  // email submit (login or register)
  authSubmit && authSubmit.addEventListener("click", async (e) => {
    e.preventDefault();
    authMessage.innerText = "";
    const email = (emailInput.value || "").trim();
    const password = (passwordInput.value || "").trim();
    if (!email || !password) {
      authMessage.innerText = "Email dan password harus diisi.";
      return;
    }
    try {
      if (mode === "login") {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await afterSignIn(cred.user);
        hideModal();
      } else {
        // register
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        // create user doc
        await setDoc(doc(db, "users", cred.user.uid), {
          email: cred.user.email || null,
          displayName: cred.user.displayName || null,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }, { merge: true });
        await afterSignIn(cred.user);
        hideModal();
      }
    } catch (err) {
      console.error(err);
      authMessage.innerText = err.message || "Gagal melakukan autentikasi.";
    }
  });

  // Google login
  googleLoginBtn && googleLoginBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await afterSignIn(result.user);
      hideModal();
    } catch (err) {
      console.error(err);
      authMessage.innerText = err.message || "Gagal login Google.";
    }
  });

  // Phone login UI toggle
  phoneLoginBtn && phoneLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("authForm").classList.add("hidden");
    phoneUI.classList.remove("hidden");
    // setup recaptcha
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // invisible callback
        }
      }, auth);
      window.recaptchaVerifier.render().catch(()=>{});
    }
  });

  // back to email UI
  backToEmail && backToEmail.addEventListener("click", (e) => {
    e.preventDefault();
    phoneUI.classList.add("hidden");
    document.getElementById("authForm").classList.remove("hidden");
  });

  // send OTP
  sendOtpBtn && sendOtpBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const phone = (phoneInput.value || "").trim();
    if (!phone) { authMessage.innerText = "Masukkan nomor HP dengan format +62..."; return; }
    authMessage.innerText = "Mengirim OTP...";
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', { size: 'invisible' }, auth);
        await window.recaptchaVerifier.render();
      }
      phoneConfirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      authMessage.innerText = "OTP dikirim. Masukkan kode OTP.";
      otpSection.classList.remove("hidden");
    } catch (err) {
      console.error(err);
      authMessage.innerText = err.message || "Gagal mengirim OTP.";
    }
  });

  // verify OTP
  verifyOtpBtn && verifyOtpBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    const code = (otpInput.value || "").trim();
    if (!code || !phoneConfirmationResult) { authMessage.innerText = "Masukkan OTP dulu."; return; }
    try {
      const result = await phoneConfirmationResult.confirm(code);
      await afterSignIn(result.user);
      hideModal();
    } catch (err) {
      console.error(err);
      authMessage.innerText = err.message || "OTP tidak valid.";
    }
  });

  // redeem button
  redeemBtn && redeemBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    redeemResult.innerText = "";
    const code = (redeemCodeInput.value || "").trim();
    if (!code) { redeemResult.innerText = "Masukkan kode akses."; return; }
    const user = auth.currentUser;
    if (!user) { redeemResult.innerText = "Silakan login terlebih dahulu."; return; }
    try {
      const idToken = await getIdToken(user);
      const res = await fetch("/redeemCode", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + idToken },
        body: JSON.stringify({ code })
      });
      const json = await res.json();
      if (res.ok) {
        redeemResult.innerText = json.message || "Kode berhasil diklaim.";
      } else {
        redeemResult.innerText = json.error || JSON.stringify(json);
      }
    } catch (err) {
      console.error(err);
      redeemResult.innerText = "Terjadi kesalahan saat klaim kode.";
    }
  });

  // buy button
  buyBtn && buyBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    buyResult.innerText = "";
    const user = auth.currentUser;
    if (!user) { buyResult.innerText = "Silakan login terlebih dahulu."; return; }
    const course = (buyCourseSelect.value || "sains");
    try {
      const idToken = await getIdToken(user);
      const res = await fetch("/createCheckoutSession", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + idToken },
        body: JSON.stringify({ course, price: 3000 })
      });
      const json = await res.json();
      if (res.ok && json.sessionUrl) {
        // redirect to Stripe Checkout
        window.location.href = json.sessionUrl;
      } else {
        buyResult.innerText = json.error || JSON.stringify(json);
      }
    } catch (err) {
      console.error(err);
      buyResult.innerText = "Terjadi kesalahan saat membuat sesi pembayaran.";
    }
  });

  // open course buttons
  openCourseBtns.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const course = btn.dataset.course;
      const user = auth.currentUser;
      if (!user) {
        showModal();
        return;
      }
      // check Firestore purchases
      try {
        const pDoc = await getDoc(doc(db, "users", user.uid, "purchases", course));
        const pAll = await getDoc(doc(db, "users", user.uid, "purchases", "ALL"));
        if ((pDoc.exists() && pDoc.data()?.lifetime) || (pAll.exists() && pAll.data()?.lifetime)) {
          // open the content index
          window.open(`/content/${course}/index.json`, "_blank");
        } else {
          alert("Anda belum punya akses. Silakan beli atau gunakan kode.");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memeriksa akses. Coba lagi.");
      }
    });
  });

  // load links.txt
  fetch("links.txt").then(r => r.text()).then(t => {
    const lines = t.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    if (lines.length > 0) waLinkEl.href = lines[0];
    if (lines.length > 1) tgLinkEl.href = lines[1];
  }).catch(()=>{ /* ignore */ });

}); // DOMContentLoaded

// ---------- after sign-in housekeeping ----------
async function afterSignIn(user) {
  try {
    // update lastLogin
    await setDoc(doc(db, "users", user.uid), {
      email: user.email || null,
      phone: user.phoneNumber || null,
      displayName: user.displayName || null,
      lastLogin: serverTimestamp()
    }, { merge: true });

    // update UI user area
    renderUserArea(user);
  } catch (err) {
    console.error("afterSignIn error", err);
  }
}

// ---------- render user area (listen to auth state) ----------
onAuthStateChanged(auth, user => {
  renderUserArea(user);
});

function renderUserArea(user) {
  if (!user) {
    userArea.innerHTML = `<button id="openLogin" class="btn small">Masuk / Daftar</button>`;
    const btn = document.getElementById("openLogin");
    if (btn) btn.addEventListener("click", (e) => { e.preventDefault(); setAuthMode("login"); showModal(); });
  } else {
    userArea.innerHTML = `
      <span style="margin-right:10px">Hi, ${user.displayName || user.email || user.phoneNumber}</span>
      <button id="logoutBtn" class="btn small red">Keluar</button>
    `;
    const logoutBtn = document.getElementById("logoutBtn");
    logoutBtn && logoutBtn.addEventListener("click", async () => {
      await signOut(auth);
      // reload to refresh protected UI
      location.reload();
    });
  }
}

// ---------- small helper to set initial auth mode ----------
function setAuthMode(newMode) {
  mode = newMode;
  if (mode === "login") {
    authTitle.innerText = "Masuk";
    authSubmit.innerText = "Masuk";
    toggleMode.innerText = "Belum punya akun? Daftar di sini";
  } else {
    authTitle.innerText = "Daftar";
    authSubmit.innerText = "Daftar";
    toggleMode.innerText = "Sudah punya akun? Masuk di sini";
  }
}

// ensure initial mode
setAuthMode("login");
