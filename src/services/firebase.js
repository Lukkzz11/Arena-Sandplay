import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC5QjlsJJfyIEnw1zuTQe_gPRr5KEucSXw",
  authDomain: "arena-sandplay-816b6.firebaseapp.com",
  projectId: "arena-sandplay-816b6",
  storageBucket: "arena-sandplay-816b6.firebasestorage.app",
  messagingSenderId: "70265771758",
  appId: "1:70265771758:web:23be029f8907d3f51e85ff",
  measurementId: "G-ZFNE7RV3PT"
};

const app = initializeApp(firebaseConfig);

// 🔥 ISSO QUE IMPORTA
export const db = getFirestore(app);