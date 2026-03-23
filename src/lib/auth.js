import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';

// ─── Google Sign-In ─────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await saveUserToFirestore(result.user);
  return result.user;
}

// ─── Email / Password Sign-In ───────────────────────────────
export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await saveUserToFirestore(result.user);
  return result.user;
}

// ─── Email / Password Registration ─────────────────────────
export async function registerWithEmail(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Set the displayName on the Firebase Auth profile
  await updateProfile(result.user, { displayName: name });

  await saveUserToFirestore({ ...result.user, displayName: name });
  return result.user;
}

// ─── Logout ─────────────────────────────────────────────────
export function logOut() {
  return signOut(auth);
}

// ─── Auth State Listener ────────────────────────────────────
// Returns an unsubscribe function. The callback receives the
// Firebase user (or null when logged out).
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ─── Save / update user profile in Firestore ────────────────
// Uses setDoc with merge:true so it creates a new doc on first
// login and only updates lastLogin on subsequent logins.
export async function saveUserToFirestore(user) {
  if (!user?.uid) return;

  const userRef = doc(db, 'users', user.uid);
  await setDoc(
    userRef,
    {
      uid: user.uid,
      name: user.displayName || user.email?.split('@')[0] || 'User',
      email: user.email || '',
      photoURL: user.photoURL || '',
      lastLogin: serverTimestamp(),
    },
    { merge: true }
  );
}

// ─── Helper: normalize Firebase user → app user shape ───────
// All stores use `user.id` for Firestore queries, so we map
// `uid` → `id` here once.
export function formatUser(firebaseUser) {
  if (!firebaseUser) return null;
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || '',
    photoURL: firebaseUser.photoURL || '',
  };
}
