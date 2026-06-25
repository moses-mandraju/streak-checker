import { precacheAndRoute } from 'workbox-precaching'
import { initializeApp } from 'firebase/app'
import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw'
import { firebaseConfig } from './firebase/config'

precacheAndRoute(self.__WB_MANIFEST)

const firebaseApp = initializeApp(firebaseConfig)
const messaging = getMessaging(firebaseApp)

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.notification?.title || 'Streak Checker Reminder'
  const notificationOptions = {
    body: payload.notification?.body || 'Open the app to keep your streak going.',
    icon: '/favicon.svg',
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
