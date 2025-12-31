import { auth } from "./firebase.js";
import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  document.querySelectorAll(".class-btn").forEach(btn => {
    btn.onclick = () => {
      if (!user) {
        localStorage.setItem("targetClass", btn.dataset.class);
        window.location.href = "login.html";
      } else {
        window.location.href = btn.dataset.class;
      }
    };
  });
});

import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

  // ELEMENTS
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const tokenInput = document.getElementById("tokenInput");
  const activateBtn = document.getElementById("activateTokenBtn");
  const statusText = document.getElementById("tokenStatus");

  // =========================
  // 🔐 AUTH STATE LISTENER
  // =========================
  onAuthStateChanged(auth, async (user) => {

    if (!user) {
      // ❌ BELUM LOGIN
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (logoutBtn) logoutBtn.style.display = "none";

      if (activateBtn) {
        activateBtn.onclick = () => {
          alert("Silakan login terlebih dahulu");
          window.location.href = "login.html";
        };
      }

      return;
    }

    // ✅ SUDAH LOGIN
    if (loginBtn) loginBtn.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "inline-block";

    try {
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        console.warn("User document belum ada");
        return;
      }

      console.log("User data:", snap.data());

      // 👉 DI SINI NANTI BISA:
      // - tampilkan tombol "Masuk"
      // - sembunyikan tombol "Beli"
      // - load kelas user

    } catch (err) {
      console.error("Gagal load data user:", err);
    }
  });

  // =========================
  // 🚪 LOGOUT
  // =========================
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await signOut(auth);
        window.location.href = "login.html";
      } catch (err) {
        alert("Logout gagal");
        console.error(err);
      }
    });
  }

  // =========================
  // 🔑 TOKEN AKTIVASI
  // =========================
  if (activateBtn) {
    activateBtn.addEventListener("click", async () => {

      const user = auth.currentUser;
      if (!user) return;

      const token = tokenInput.value.trim().toUpperCase();
      if (!token) return;

      let kelas = null;

      if (["A", "Q", "Z"].includes(token[0])) {
        kelas = "sains";
      } else if (["M", "P"].includes(token[0])) {
        kelas = "math";
      } else if (token.startsWith("B")) {
        kelas = "blockchain";
      } else {
        statusText.innerText = "❌ Token tidak valid";
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          kelas: arrayUnion(kelas)
        });

        statusText.innerText = `✅ Token aktif! Akses kelas ${kelas}`;
        tokenInput.value = "";

      } catch (err) {
        console.error("Gagal aktivasi token:", err);
        statusText.innerText = "Terjadi kesalahan saat aktivasi";
      }
    });
  }

});
