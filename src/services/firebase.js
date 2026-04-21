import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importe o Auth

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

// Exportações para usar no resto do projeto
export const db = getFirestore(app);
export const auth = getAuth(app); // Agora o Login e o App.js vão funcionar