import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDKEkTVURsr89c5wPTQfYpGiLqI3DU1hYA",
    authDomain: "cashnova-acf36.firebaseapp.com",
    projectId: "cashnova-acf36",
    storageBucket: "cashnova-acf36.firebasestorage.app",
    messagingSenderId: "709482691009",
    appId: "1:709482691009:web:4ae63d848f688a7eb1d740",
    measurementId: "G-V10RC4PV4S"
};

try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    console.log("Firebase App Name:", app.name);
    console.log("Firebase Auth instance initialized.");
} catch (error) {
    console.error("Firebase init failed:", error);
}
