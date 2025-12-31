import { auth } from "./firebase.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const db = getFirestore();

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists() || !userSnap.data().hasAccess) {
    alert("❌ Anda belum memiliki akses kelas");
    window.location.href = "token.html";
    return;
  }

  // OPTIONAL: CEK KELAS
  const kelas = userSnap.data().kelas;
  if (kelas !== "sains") {
    alert("❌ Token Anda bukan untuk kelas ini");
    window.location.href = "index.html";
  }
});
