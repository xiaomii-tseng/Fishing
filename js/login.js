import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";

// 🔧 Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDrmErLaf1rLc0GC5-1ncj4cqbOfX11ZaE",
  authDomain: "fishing-dcf4c.firebaseapp.com",
  projectId: "fishing-dcf4c",
  storageBucket: "fishing-dcf4c.firebasestorage.app",
  messagingSenderId: "883849375266",
  appId: "1:883849375266:web:2d3ad179436bf8deb5647b",
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ✅ 登入
window.login = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    localStorage.setItem("userId", userCredential.user.uid);
    location.href = "fishing.html"; // 進入主遊戲
  } catch (err) {
    alert("登入失敗：" + err.message);
  }
};

// ✅ 註冊
window.register = async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("註冊成功，請重新登入");
  } catch (err) {
    alert("註冊失敗：" + err.message);
  }
};
