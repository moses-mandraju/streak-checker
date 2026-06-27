import { getMessaging, getToken } from 'firebase/messaging'
import { db, firebaseApp, isFirebaseConfigured } from './config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { getDeviceFingerprint } from '../utils/deviceFingerprint'

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

  const deviceId = await getDeviceFingerprint()
  const tokenDoc = doc(db, 'users', uid, 'deviceTokens', deviceId)

  return setDoc(tokenDoc, {
    token,
    updatedAt: serverTimestamp(),
    platform: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
    userAgent: navigator.userAgent,
  }, { merge: true })
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

  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/'
  })

  await navigator.serviceWorker.ready
  const messaging = getMessaging(firebaseApp)
  return getToken(messaging, { vapidKey, serviceWorkerRegistration: registration })
}