import { auth } from "./firebase.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

document.getElementById("submitToken").addEventListener("click", async () => {
  const tokenInput = document.getElementById("tokenInput").value.trim();
  const result = document.getElementById("result");
  const user = auth.currentUser;

  if (!user) {
    alert("Silakan login dulu");
    return;
  }

  const tokenRef = doc(db, "tokens", tokenInput);
  const tokenSnap = await getDoc(tokenRef);

  // TOKEN TIDAK ADA
  if (!tokenSnap.exists()) {
    result.innerText = "❌ Token tidak ditemukan";
    return;
  }

  const tokenData = tokenSnap.data();

  // TOKEN SUDAH DIPAKAI
  if (tokenData.used) {
    result.innerText = "❌ Token sudah digunakan";
    return;
  }

  // AKTIVASI TOKEN
  await updateDoc(tokenRef, {
    used: true,
    usedBy: user.uid
  });

  result.innerText = "✅ Token berhasil diaktifkan untuk kelas " + tokenData.kelas;

  // SIMPAN STATUS USER
  await updateDoc(doc(db, "users", user.uid), {
    hasAccess: true,
    kelas: tokenData.kelas
  });

});
