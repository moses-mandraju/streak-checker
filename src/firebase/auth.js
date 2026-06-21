import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './config'

const provider = new GoogleAuthProvider()

function assertAuthReady() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Add your environment values and reload the app.')
  }
}

export async function signInWithGoogle() {
  assertAuthReady()
  await setPersistence(auth, browserLocalPersistence)
  return signInWithPopup(auth, provider)
}

export function observeAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export function logoutUser() {
  if (!isFirebaseConfigured || !auth) {
    return Promise.resolve()
  }

  return signOut(auth)
}
