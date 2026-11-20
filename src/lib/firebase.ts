import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdJhixunasS5ZJmsDaASLgvoabvedctUo",
  authDomain: "pineappleg-d243b.firebaseapp.com",
  projectId: "pineappleg-d243b",
  storageBucket: "pineappleg-d243b.firebasestorage.app",
  messagingSenderId: "528092394512",
  appId: "1:528092394512:web:9baf27ac76da894a1c0695",
  measurementId: "G-8M46DQSYMD",
};

export const app = getApps()[0] ?? initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only exists in the browser; load it lazily so static export never touches it.
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(app);
    })
    .catch(() => {});
}

export const ADMIN_EMAIL = "30copallock@pulaskischools.org";
