import { create } from 'zustand';
import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
  logOut,
  onAuthChange,
  formatUser,
} from '@/lib/auth';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initialized: false, // true once the auth listener has fired at least once

  // ─── Email / Password Login ───────────────────────────────
  login: async (email, password) => {
    set({ loading: true });
    try {
      const firebaseUser = await signInWithEmail(email, password);
      set({ user: formatUser(firebaseUser), isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: friendlyError(err) };
    }
  },

  // ─── Email / Password Registration ────────────────────────
  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const firebaseUser = await registerWithEmail(name, email, password);
      // registerWithEmail already called updateProfile, but the returned
      // user object may not reflect it yet, so we patch displayName manually.
      const user = formatUser({ ...firebaseUser, displayName: name });
      set({ user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: friendlyError(err) };
    }
  },

  // ─── Google Sign-In ───────────────────────────────────────
  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      const firebaseUser = await signInWithGoogle();
      set({ user: formatUser(firebaseUser), isAuthenticated: true, loading: false });
      return { success: true };
    } catch (err) {
      set({ loading: false });
      return { success: false, error: friendlyError(err) };
    }
  },

  // ─── Logout ───────────────────────────────────────────────
  logout: async () => {
    try {
      await logOut();
    } catch {
      // even if signOut call fails, clear local state
    }
    set({ user: null, isAuthenticated: false });
  },

  // ─── Persistent Auth Listener ─────────────────────────────
  // Call once in App.jsx on mount. Sets initialized = true after
  // the first check so the UI can show a loading state until then.
  initAuthListener: () => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        set({
          user: formatUser(firebaseUser),
          isAuthenticated: true,
          initialized: true,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          initialized: true,
        });
      }
    });
    return unsubscribe;
  },
}));

// ─── Map Firebase error codes to friendly messages ──────────
function friendlyError(err) {
  const code = err?.code || '';
  const map = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
  };
  return map[code] || err?.message || 'Something went wrong. Please try again.';
}
