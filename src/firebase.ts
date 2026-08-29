console.log('env check:', import.meta.env.VITE_FIREBASE_PROJECT_ID, import.meta.env.VITE_FIREBASE_API_KEY)
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore/lite'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

export interface VisitorLogEntry {
  name: string
  visitorMode: string | null
}

/**
 * Fire-and-forget visitor log. Never throws outward — a misconfigured env,
 * an ad-blocker, or a network hiccup should never be able to break the game.
 */
export async function logVisitor(entry: VisitorLogEntry) {
  try {
    await addDoc(collection(db, 'visitors'), {
      name: entry.name,
      visitorMode: entry.visitorMode,
      userAgent: navigator.userAgent,
      referrer: document.referrer || null,
      createdAt: serverTimestamp(),
    })
  } catch (err) {
    console.warn('[visitor log] failed to write (non-fatal):', err)
  }
}
