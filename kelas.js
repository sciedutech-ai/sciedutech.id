import { auth } from "./firebase.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".class-btn");

  onAuthStateChanged(auth, (user) => {
    buttons.forEach(btn => {
      btn.onclick = () => {
        const target = btn.dataset.class;

        if (user) {
          window.location.href = target;
        } else {
          localStorage.setItem("targetClass", target);
          window.location.href = "login.html";
        }
      };
    });
  });
});
