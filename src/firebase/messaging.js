import { getMessaging, getToken } from 'firebase/messaging'
import { db, firebaseApp, isFirebaseConfigured } from './config'
import { doc, setDoc, collection, serverTimestamp } from 'firebase/firestore'

export function getCurrentTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  return permission
}

// export async function saveDeviceToken(uid, token) {
//   if (!isFirebaseConfigured || !db) {
//     throw new Error('Firebase is not configured yet.')
//   }

//   const tokensCollection = collection(db, 'users', uid, 'deviceTokens')
//   const tokenDoc = doc(tokensCollection, token)

//   // Firestore schema for multiple devices per user via deviceTokens subcollection.
//   // Future Cloud Functions can read this collection and send notifications to each token.
//   return setDoc(tokenDoc, {
//     token,
//     createdAt: serverTimestamp(),
//     lastSeenAt: serverTimestamp(),
//   })
// }

export async function saveDeviceToken(uid, token) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured yet.')
  }

  // Stable device identifier — same device always overwrites same doc
  const deviceId = await getDeviceFingerprint()

  const tokenDoc = doc(db, 'users', uid, 'deviceTokens', deviceId)

  return setDoc(tokenDoc, {
    token,
    updatedAt: serverTimestamp(),
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    userAgent: navigator.userAgent,
  }, { merge: true }) // merge so createdAt isn't overwritten
}

// Simple stable fingerprint — not perfect but good enough
async function getDeviceFingerprint() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone
  ].join('|')

  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw))
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32) // 32 char doc ID
}

export async function getMessagingToken() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured yet.')
  }

  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser.')
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
  if (!vapidKey) {
    throw new Error('Missing VITE_FIREBASE_VAPID_KEY environment variable.')
  }

  //const registration = await navigator.serviceWorker.ready
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/'
  })

  // Wait for it to be active
  await navigator.serviceWorker.ready
  const messaging = getMessaging(firebaseApp)
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
}
