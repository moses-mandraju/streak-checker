import { registerSW } from 'virtual:pwa-register'
import { usePwaInstall } from './hooks/usePwaInstall'

/**
 * SERVICE WORKER REGISTRATION
 * Location: src/main.jsx
 * 
 * The PWA service worker is automatically registered on app startup.
 * Configure lifecycle events below:
 */

registerSW({
  // Called when the app is ready to work offline
  onOfflineReady() {
    console.log('Streak Checker is ready to work offline.')
  },

  // Called once service worker is registered
  onRegisteredSW(swScriptUrl, registration) {
    console.log('Service worker registered:', swScriptUrl)
  },

  // Called if service worker registration fails
  onRegisterError(error) {
    console.error('Service worker registration failed:', error)
  },

  // Called when a new version is available (prompt mode)
  onNeedRefresh() {
    console.log('New version available - user will be prompted')
  },

  // Called when service worker takes control
  onNeedReload() {
    console.log('Service worker updated and reloading')
  },
})

/**
 * INSTALL PROMPT HOOK
 * Location: src/hooks/usePwaInstall.js
 * 
 * Use this hook to show a custom install button when the app can be installed
 * 
 * Example usage in React components:
 */

/*
import { usePwaInstall } from '@/hooks/usePwaInstall'

export function MyComponent() {
  const { canInstall, promptInstall } = usePwaInstall()

  return (
    <>
      {canInstall && (
        <button onClick={promptInstall}>
          Install Streak Checker
        </button>
      )}
    </>
  )
}

// Response from promptInstall():
// { outcome: 'accepted' } or { outcome: 'dismissed' }
*/

/**
 * WEB MANIFEST
 * Location: public/manifest.webmanifest
 * 
 * Contains app metadata required for:
 * - Home screen installation
 * - App name, icon, colors
 * - Theme and background colors
 * - Start URL and display mode
 */

/**
 * SERVICE WORKER FEATURES
 * 
 * The generated service worker (dist/sw.js) provides:
 * 
 * 1. PRECACHING
 *    - Caches app shell and static assets on install
 *    - Listed in workbox precache manifest
 * 
 * 2. OFFLINE SUPPORT
 *    - Serves cached assets when offline
 *    - Fallback page: /index.html (SPA navigation)
 * 
 * 3. AUTOMATIC UPDATES
 *    - Checks for updates periodically
 *    - Shows prompt on new version available
 * 
 * 4. NAVIGATION FALLBACK
 *    - Routes all navigation to index.html
 *    - Enables client-side routing (React Router)
 */

/**
 * FIREBASE INTEGRATION
 * 
 * ✅ Compatible with PWA:
 * - Authentication flows work normally
 * - Firestore queries execute online
 * - Real-time listeners sync data
 * 
 * ⚠️ Limitations offline:
 * - Cannot make new API requests
 * - Firestore writes queue if offline persistence enabled
 * - Real-time listeners pause and resume on reconnect
 * 
 * 💡 Best practices:
 * - Use Firebase offline persistence for Firestore caching
 * - Handle connection state with Firebase listeners
 * - Queue writes for sync when connection returns
 */

/**
 * TESTING OFFLINE MODE
 * 
 * In Chrome DevTools:
 * 1. Open DevTools (F12)
 * 2. Go to Application → Service Workers
 * 3. Check "Offline" checkbox
 * 4. Navigate your app - should work without network
 * 
 * OR use Network tab:
 * 1. Go to Network tab
 * 2. Check "Throttling" dropdown
 * 3. Select "Offline"
 */

/**
 * PRECACHE MANIFEST
 * 
 * Service worker automatically precaches:
 * - index.html
 * - CSS bundles
 * - JS bundles
 * - favicon.svg
 * - manifest.webmanifest
 * 
 * See dist/sw.js for exact list after build
 */

export default {}
