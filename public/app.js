// public/app.js (modular)
import { auth, db } from './firebase.js';
import { getIdToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { collection, getDocs, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Initialize FirebaseUI (global firebaseui provided)
const uiConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID
  ],
  callbacks: {
    signInSuccessWithAuthResult: () => false
  },
  credentialHelper: firebaseui.auth.CredentialHelper.NONE
};
const ui = new firebaseui.auth.AuthUI(window.firebaseAuth);

// UI helpers
const authModal = document.getElementById('authModal');
const closeAuth = document.getElementById('closeAuth');
const userArea = document.getElementById('userArea');
closeAuth && closeAuth.addEventListener('click', ()=> authModal.classList.add('hidden'));

function showAuth(){ authModal.classList.remove('hidden'); ui.start('#firebaseui-auth-container', uiConfig); }

function hideProtected(){ document.querySelectorAll('.openCourse').forEach(b=> b.disabled=true); document.getElementById('redeemBtn').disabled=true; document.getElementById('buyBtn').disabled=true; }
function enableProtected(){ document.querySelectorAll('.openCourse').forEach(b=> b.disabled=false); document.getElementById('redeemBtn').disabled=false; document.getElementById('buyBtn').disabled=false; }

hideProtected();

onAuthStateChanged(auth, async (user)=>{
  if(user){
    // update lastLogin
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email || null,
      displayName: user.displayName || null,
      lastLogin: serverTimestamp()
    }, { merge: true });
    userArea.innerHTML = `<span style="margin-right:10px">Halo, ${user.displayName || user.email || user.uid}</span><button id="logoutBtn" class="btn">Logout</button>`;
    document.getElementById('logoutBtn').addEventListener('click', ()=> signOut(auth));
    enableProtected();
    refreshUserAccessUI(user.uid);
  } else {
    userArea.innerHTML = `<button id="loginBtn" class="btn">Login / Sign Up</button>`;
    document.getElementById('loginBtn').addEventListener('click', showAuth);
    hideProtected();
  }
});

async function refreshUserAccessUI(uid){
  // get purchases
  try{
    const snap = await getDocs(collection(db, 'users', uid, 'purchases'));
    const owned = {};
    snap.forEach(d=> owned[d.id]= d.data());
    document.querySelectorAll('.openCourse').forEach(btn=>{
      const course = btn.dataset.course;
      if(owned[course] || owned['ALL']){
        btn.innerText = 'Buka Kelas (Anda punya akses)';
        btn.onclick = ()=> openCoursePage(course);
      } else {
        btn.innerText = 'Beli / Redeem untuk Akses';
        btn.onclick = ()=> showAuth();
      }
    });
  }catch(e){ console.error(e); }
}

async function openCoursePage(course){
  try{
    const res = await fetch(`/content/${course}/index.json`);
    if(!res.ok) throw new Error('no index');
    const json = await res.json();
    let html = `<h3>${course.toUpperCase()}</h3><ul>`;
    if(json.videos) json.videos.forEach(v=> html+=`<li><a href="/content/${course}/videos/${v}" target="_blank">${v}</a></li>`);
    if(json.modules) json.modules.forEach(m=> html+=`<li><a href="/content/${course}/modules/${m}" target="_blank">${m}</a></li>`);
    html += `</ul>`;
    const w = window.open('', '_blank');
    w.document.write(`<pre style="color:#fff;background:#0b0b0b;padding:20px">${html}</pre>`);
  }catch(err){
    alert('Tidak menemukan daftar materi. Pastikan Anda sudah meng-upload content/'+course+'/index.json');
  }
}

// Redeem code
document.getElementById('redeemBtn').addEventListener('click', async ()=>{
  const user = auth.currentUser;
  if(!user){ showAuth(); return; }
  const code = document.getElementById('redeemCode').value.trim();
  if(!code) return;
  document.getElementById('redeemResult').innerText = 'Memproses...';
  try{
    const token = await user.getIdToken();
    const res = await fetch('/redeemCode', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({code})});
    const data = await res.json();
    document.getElementById('redeemResult').innerText = data.message || data.error || JSON.stringify(data);
    refreshUserAccessUI(user.uid);
  }catch(e){ console.error(e); document.getElementById('redeemResult').innerText = 'Gagal redeem'; }
});

// Buy button (create checkout session)
document.getElementById('buyBtn').addEventListener('click', async ()=>{
  const user = auth.currentUser;
  if(!user){ showAuth(); return; }
  const course = document.getElementById('buyCourse').value;
  document.getElementById('buyResult').innerText = 'Membuat sesi pembayaran...';
  try{
    const token = await user.getIdToken();
    const res = await fetch('/createCheckoutSession', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({course, price:3000})});
    const data = await res.json();
    if(data.sessionUrl) window.location.href = data.sessionUrl;
    else document.getElementById('buyResult').innerText = data.error || 'Gagal membuat sesi pembayaran';
  }catch(e){ console.error(e); document.getElementById('buyResult').innerText = 'Terjadi error'; }
});
