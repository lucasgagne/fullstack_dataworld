// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB5Fks8PSo_4k3q0jany0BI6ereRNl6-U0",
  authDomain: "dataworld-a4afa.firebaseapp.com",
  projectId: "dataworld-a4afa",
  storageBucket: "dataworld-a4afa.firebasestorage.app",
  messagingSenderId: "858436173058",
  appId: "1:858436173058:web:ea37ea24eaf680398cd61b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the auth service so other files can use it
export const auth = getAuth(app);
export default app;


