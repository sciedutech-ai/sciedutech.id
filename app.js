// =======================
// IMPORT FIREBASE GLOBAL
// =======================

const auth = window.scieduAuth;
const db = window.scieduDB;

// =======================
// FIREBASE UI SETUP
// =======================

const uiConfig = {
  signInOptions: [
    window.emailProvider.providerId,
    window.googleProvider.providerId,
    window.phoneProvider.providerId
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => {
      document.getElementById("authModal").classList.add("hidden");
      return false;
    }
  }
};

const ui = new firebaseui.auth.AuthUI(auth);

// =======================
// MODAL LOGIN
// =======================

const loginBtn = document.getElementById("loginBtn");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");

loginBtn.addEventListener("click", () => {
  authModal.classList.remove("hidden");
  ui.start("#firebaseui-auth-container", uiConfig);
});

closeAuth.addEventListener("click", () => {
  authModal.classList.add("hidden");
});

// =======================
// USER STATE
// =======================

window.onAuthStateChanged(auth, user => {
  const userArea = document.getElementById("userArea");

  if (user) {
    userArea.innerHTML = `
      <span class="userName">Hi, ${user.email || user.phoneNumber}</span>
      <button id="logoutBtn" class="btn small red">Keluar</button>
    `;

    document.getElementById("logoutBtn").addEventListener("click", async () => {
      await window.signOut(auth);
      location.reload();
    });

  } else {
    userArea.innerHTML = `
      <button id="loginBtn" class="btn small">Masuk / Daftar</button>
    `;
    document.getElementById("loginBtn").addEventListener("click", () => {
      authModal.classList.remove("hidden");
      ui.start("#firebaseui-auth-container", uiConfig);
    });
  }
});

// =======================
// REDEEM KODE AKSES
// =======================

document.getElementById("redeemBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  const result = document.getElementById("redeemResult");

  if (!user) return result.innerHTML = "Silakan login dulu.";

  const code = document.getElementById("redeemCode").value.trim();

  if (!code) return result.innerHTML = "Masukkan kode dulu.";

  // cek kode via Cloud Function
  try {
    const res = await fetch(
      "https://us-central1-sciedutech-database.cloudfunctions.net/redeemCode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, code })
      }
    );

    const data = await res.json();
    result.innerHTML = data.message;
  } catch (err) {
    result.innerHTML = "Terjadi kesalahan.";
  }
});

// =======================
// BELI MODUL
// =======================

document.getElementById("buyBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  const result = document.getElementById("buyResult");

  if (!user) return result.innerHTML = "Silakan login dulu.";

  const course = document.getElementById("buyCourse").value;

  result.innerHTML = "Membuat invoice...";

  // Memanggil Cloud Function Stripe
  const res = await fetch(
    "https://us-central1-sciedutech-database.cloudfunctions.net/createPayment",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, course })
    }
  );

  const data = await res.json();

  if (data.url) {
    window.location.href = data.url;
  } else {
    result.innerHTML = data.message;
  }
});

// =======================
// BUKA KELAS
// =======================

document.querySelectorAll(".openCourse").forEach(btn => {
  btn.addEventListener("click", () => openCourse(btn.dataset.course));
});

async function openCourse(course) {
  const user = auth.currentUser;

  if (!user) return alert("Silakan login untuk membuka kelas.");

  // cek Firestore
  const res = await fetch(
    "https://us-central1-sciedutech-database.cloudfunctions.net/checkAccess",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: user.uid, course })
    }
  );

  const data = await res.json();

  if (data.access) {
    window.location.href = `content/${course}/index.json`;
  } else {
    alert("Anda belum punya akses. Silakan beli atau gunakan kode.");
  }
}

// =======================
// LOAD WA & TELEGRAM LINK
// =======================

fetch("links.txt")
  .then(r => r.text())
  .then(t => {
    const lines = t.split("\n").map(x => x.trim()).filter(x => x.length > 0);

    document.getElementById("waLink").href = lines[0];
    document.getElementById("tgLink").href = lines[1];
  });
