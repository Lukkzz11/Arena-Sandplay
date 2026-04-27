import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore"; // Mudamos aqui
import { getAuth } from "firebase/auth";

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

// Configuração para evitar o erro net::ERR_BLOCKED_BY_CLIENT
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false, // Ajuda em alguns navegadores que bloqueiam streams
});

export const auth = getAuth(app);