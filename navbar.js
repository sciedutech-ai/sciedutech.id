import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const authBtn = document.getElementById("authBtn");

  if (!authBtn) return;

  onAuthStateChanged(auth, (user) => {
    console.log("AUTH STATE:", user);

    if (user) {
      authBtn.textContent = "Logout";
      authBtn.href = "#";
      authBtn.onclick = async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
      };
    } else {
      authBtn.textContent = "Get Started";
      authBtn.href = "login.html";
      authBtn.onclick = null;
    }
  });
});
