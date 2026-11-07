import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, signInAnonymously, signOut, type Auth, type User } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  memoryLocalCache,
  persistentLocalCache,
  persistentSingleTabManager,
  type Firestore,
} from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase/config";

/** Survives dev hot reloads, so Firestore is never initialised twice. */
const globalCache = globalThis as typeof globalThis & { __bydFirestore?: Firestore };

export function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured");
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/**
 * Firestore, initialised once. The kiosk uses the persistent offline cache
 * (IndexedDB) so it keeps working when the hall internet drops; the staff
 * dashboard only needs memory.
 */
export function getDb(mode: "kiosk" | "staff"): Firestore {
  if (globalCache.__bydFirestore) return globalCache.__bydFirestore;
  const app = getFirebaseApp();
  try {
    globalCache.__bydFirestore = initializeFirestore(app, {
      localCache:
        mode === "kiosk"
          ? persistentLocalCache({ tabManager: persistentSingleTabManager({}) })
          : memoryLocalCache(),
    });
  } catch {
    // Already initialised (e.g. after a hot reload).
    globalCache.__bydFirestore = getFirestore(app);
  }
  return globalCache.__bydFirestore;
}

let kioskSignIn: Promise<User | null> | null = null;

/**
 * Makes sure the kiosk is signed in anonymously. The session persists, so
 * after the first online launch this works offline too. Never rejects.
 */
export function ensureKioskSignedIn(): Promise<User | null> {
  if (kioskSignIn) return kioskSignIn;
  kioskSignIn = (async () => {
    const auth = getFirebaseAuth();
    await auth.authStateReady();
    // The security rules only let anonymous (kiosk) users write players.
    if (auth.currentUser && !auth.currentUser.isAnonymous) await signOut(auth);
    if (auth.currentUser) return auth.currentUser;
    const cred = await signInAnonymously(auth);
    return cred.user;
  })().catch((err) => {
    console.warn("Kiosk sign-in failed (will retry when online)", err);
    kioskSignIn = null;
    return null;
  });
  return kioskSignIn;
}

/** For the status panel. */
export function isKioskSignedIn(): boolean {
  if (!isFirebaseConfigured) return false;
  const user = getFirebaseAuth().currentUser;
  return Boolean(user?.isAnonymous);
}
