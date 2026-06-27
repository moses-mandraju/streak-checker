import {
  GoogleAuthProvider,
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, isFirebaseConfigured } from './config'
import { getDeviceFingerprint } from '../utils/deviceFingerprint'

const provider = new GoogleAuthProvider()

function assertAuthReady() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error('Firebase is not configured yet. Add your environment values and reload the app.')
  }
}

export async function signInWithGoogle() {
  assertAuthReady()

  await setPersistence(auth, browserLocalPersistence)

  const result = await signInWithPopup(auth, provider)

  const user = result.user

  await setDoc(
    doc(db, 'users', user.uid),
    {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  )

  return result
}

export function observeAuth(callback) {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export async function logoutUser() {
  if (!isFirebaseConfigured || !auth) {
    return Promise.resolve()
  }

  const uid = auth.currentUser?.uid
  if (uid) {
    try {
      const deviceId = await getDeviceFingerprint()
      const tokenDoc = doc(db, 'users', uid, 'deviceTokens', deviceId)
      await deleteDoc(tokenDoc)
    } catch (err) {
      console.warn('Failed to remove device token on logout:', err)
    }
  }

  return signOut(auth)
}