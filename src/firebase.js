import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjuMokvyVNhezvbe__4qOHtbO0vsrPULU",
  authDomain: "martina-6aa4e.firebaseapp.com",
  projectId: "martina-6aa4e",
  storageBucket: "martina-6aa4e.firebasestorage.app",
  messagingSenderId: "387522578281",
  appId: "1:387522578281:web:8f890ad4f60ce1d4e35ff8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const DOC_ID = "martina_shared";
const COL = "appdata";

export async function saveToFirebase(data) {
  try {
    await setDoc(doc(db, COL, DOC_ID), data);
  } catch (e) {
    console.error("Firebase save error:", e);
  }
}

export function subscribeToFirebase(callback) {
  return onSnapshot(doc(db, COL, DOC_ID), (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    }
  });
}
