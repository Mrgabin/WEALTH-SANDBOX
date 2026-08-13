import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut,
  onAuthStateChanged,
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

export function subscribeAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { auth, db, isFirebaseConnected, firebaseConfig };

