import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

const statusText = document.getElementById("statusText");
const akses = document.getElementById("aksesKelas");
const beli = document.getElementById("beliKelas");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // 🛡️ ANTI ERROR
  const data = snap.exists() ? snap.data() : {};
  const kelasUser = data.kelas || [];

  if (kelasUser.includes("sains")) {
    statusText.innerText = "✅ Anda sudah memiliki akses Kelas Sains";
    akses.style.display = "block";
  } else {
    statusText.innerText = "❌ Anda belum memiliki akses Kelas Sains";
    beli.style.display = "block";
  }
});
