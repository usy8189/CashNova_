import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDKEkTVURsr89c5wPTQfYpGiLqI3DU1hYA",
    authDomain: "cashnova-acf36.firebaseapp.com",
    projectId: "cashnova-acf36",
    storageBucket: "cashnova-acf36.firebasestorage.app",
    messagingSenderId: "709482691009",
    appId: "1:709482691009:web:4ae63d848f688a7eb1d740",
    measurementId: "G-V10RC4PV4S"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
