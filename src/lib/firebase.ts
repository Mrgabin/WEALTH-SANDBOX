import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Import Firebase Applet Config provisioned for wealthsand-c07bb
import firebaseAppletConfig from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId
};

let app;
let auth: ReturnType<typeof getAuth> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
let isFirebaseConnected = false;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  if (firebaseAppletConfig.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== '(default)') {
    db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId);
  } else {
    db = getFirestore(app);
  }
  
  isFirebaseConnected = true;
} catch (e) {
  console.warn("Firebase initialization warning (falling back to local DB engine):", e);
  isFirebaseConnected = false;
}

export async function signUpWithFirebase(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth non initialisé");
  return await createUserWithEmailAndPassword(auth, email, pass);
}

export async function signInWithFirebase(email: string, pass: string) {
  if (!auth) throw new Error("Firebase Auth non initialisé");
  return await signInWithEmailAndPassword(auth, email, pass);
}

export async function logoutFirebase() {
  if (!auth) return;
  return await fbSignOut(auth);
}

export async function signInWithGoogle() {
  if (!auth) throw new Error("Firebase Auth non initialisé");
  const provider = new GoogleAuthProvider();
  return await signInWithPopup(auth, provider);
}

export function subscribeAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

// Firestore Database Sync Helpers
function sanitizeForFirestore(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  if (typeof obj === 'object') {
    const clean: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        if (val !== undefined) {
          clean[key] = sanitizeForFirestore(val);
        } else {
          clean[key] = null;
        }
      }
    }
    return clean;
  }
  return obj;
}

export async function saveStateToFirestore(state: any) {
  if (!db || !isFirebaseConnected || !auth?.currentUser) return;
  try {
    const docRef = doc(db, 'users_saves', auth.currentUser.uid);
    const sanitized = sanitizeForFirestore(state);
    await setDoc(docRef, sanitized);
  } catch (e) {
    console.error("Error saving state to Firestore:", e);
  }
}

export async function loadStateFromFirestore(): Promise<any | null> {
  if (!db || !isFirebaseConnected || !auth?.currentUser) return null;
  try {
    const docRef = doc(db, 'users_saves', auth.currentUser.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
  } catch (e) {
    console.error("Error loading state from Firestore:", e);
  }
  return null;
}

export { auth, db, isFirebaseConnected, firebaseConfig };

