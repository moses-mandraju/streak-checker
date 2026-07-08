// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDaPZnvPAcCCS8P4iPVpKoQmoafhuexX6Y",
  authDomain: "streak-checker.firebaseapp.com",
  projectId: "streak-checker",
  storageBucket: "streak-checker.firebasestorage.app",
  messagingSenderId: "425702039130",
  appId: "1:425702039130:web:ef488f49d5e7f23de3c263"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Streak Checker Reminder'
  const body = payload.notification?.body || 'Open the app to keep your streak going.'
  const tag = payload.data?.tag || `streak-reminder-${Date.now()}`

  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    tag,
    renotify: true,
    requireInteraction: true
  })
})
