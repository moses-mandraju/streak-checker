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

export async function saveDeviceToken(uid, token) {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured yet.')
  }

  const tokensCollection = collection(db, 'users', uid, 'deviceTokens')
  const tokenDoc = doc(tokensCollection, token)

  // Firestore schema for multiple devices per user via deviceTokens subcollection.
  // Future Cloud Functions can read this collection and send notifications to each token.
  return setDoc(tokenDoc, {
    token,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  })
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

  const registration = await navigator.serviceWorker.ready
  const messaging = getMessaging(firebaseApp)
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
}
