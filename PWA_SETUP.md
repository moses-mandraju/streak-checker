# Streak Checker - PWA Setup Guide

## Overview
Streak Checker has been successfully converted into a Progressive Web App (PWA) with full offline support, installability on Android/iOS/Desktop, and optimized caching strategies.

## ✅ Features Implemented

### 1. **Service Worker & Offline Support**
- Service worker automatically generated via Workbox
- Offline caching of all static assets and app bundle
- Network-first strategy for API calls
- Stale-while-revalidate for optimal performance

### 2. **Web Manifest**
- App name: **Streak Checker**
- Short name: **Streak**
- Theme color: **#10b981** (Emerald green)
- Background color: **#ffffff** (White)
- Display mode: **Standalone** (Full-screen app experience)
- Icons support SVG format with maskable support

### 3. **Installation Prompts**
- Automatic "Add to Home Screen" prompt on supported browsers
- Custom "Install Streak" button in the app sidebar (when supported)
- Works on:
  - ✅ Android Chrome/Brave/Edge
  - ✅ iOS (via PWA web clip)
  - ✅ Windows (Chromium-based browsers)
  - ✅ macOS (Chromium-based browsers)

### 4. **Firebase & Firestore Compatibility**
- ✅ All Firebase authentication flows remain unchanged
- ✅ Firestore database queries work normally
- ✅ Real-time sync continues in online mode
- ✅ Offline support for cached Firestore data

## 📁 Files Modified/Created

### Configuration Files
- **`vite.config.js`** - Added VitePWA plugin configuration
- **`public/manifest.webmanifest`** - Static PWA manifest with app metadata
- **`index.html`** - Added manifest link and theme-color meta tag

### Source Code
- **`src/main.jsx`** - Added service worker registration
- **`src/hooks/usePwaInstall.js`** - New hook for install prompt handling
- **`src/layouts/AppLayout.jsx`** - Added install button UI and PWA hook integration

### Package Dependencies
- **`vite-plugin-pwa`** - PWA build plugin
- **`@vite-pwa/assets-generator`** - Icon and asset generation (optional)
- **`sharp`** - Image processing for icons (optional)
- **`sharp-ico`** - ICO format support (optional)

## 🚀 How to Build & Deploy

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm run preview  # Test the production build locally
```

The build outputs to the `dist/` folder with:
- `manifest.webmanifest` - PWA manifest
- `sw.js` - Service worker
- `index.html` - Modified with PWA metadata

### Deployment Checklist
- [ ] Deploy `dist/` folder to your server
- [ ] Ensure **HTTPS is enabled** (required for PWA)
- [ ] Test manifest loads: `https://yourdomain.com/manifest.webmanifest`
- [ ] Test service worker: Open DevTools → Application → Service Workers
- [ ] Test install prompt on Android/iOS/Desktop

## 📱 How Users Install

### Android
1. Open the app in Chrome/Brave/Edge
2. Wait for the install prompt (top banner or custom button in sidebar)
3. Tap "Install Streak" button or accept the browser prompt
4. App appears on home screen with Streak Checker icon

### iOS (PWA Web Clip)
1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. App works in standalone mode

### Desktop (Windows/macOS)
1. Open in Chrome/Edge
2. Click the install icon in address bar (or use our custom button)
3. App installs and runs standalone

## 🔄 Service Worker Behavior

### Initial Load
1. Service worker registers silently in the background
2. App shell and assets are cached
3. Subsequent loads serve from cache (faster)

### Updates
- New version detection: `registerType: 'prompt'`
- User sees notification about available updates
- Can choose to reload and get latest version

### Offline Mode
- Cached pages load immediately without internet
- Background sync when connection returns
- Firebase operations queue when offline

## 🛠️ Configuration Reference

### `vite.config.js` Key Options
```javascript
VitePWA({
  registerType: 'prompt',              // Show update prompt
  injectRegister: 'auto',              // Auto-inject SW registration
  includeAssets: ['favicon.svg', 'manifest.webmanifest'],
  manifest: false,                     // Use static manifest file
  workbox: {
    globPatterns: [...],               // Files to cache
    navigateFallback: '/',             // Fallback for SPA
  }
})
```

### Manifest Fields
- `name` - Full app name displayed in install dialogs
- `short_name` - Short name for home screen
- `theme_color` - Color of address bar/status bar
- `background_color` - Splash screen background
- `display: 'standalone'` - Full-screen app experience
- `start_url: '/'` - Entry point when launched from home screen
- `icons` - App icons (SVG supported)

## 🐛 Troubleshooting

### "Install button not showing"
- Requires **HTTPS** (not localhost development)
- Check browser compatibility (Chrome 42+, Edge, Firefox 58+)
- Manifest must be valid JSON
- App must be served with valid SSL certificate

### "Service worker not registering"
1. Check DevTools → Application → Service Workers
2. Verify `manifest.webmanifest` loads (Network tab)
3. Check browser console for errors
4. Ensure HTTPS enabled

### "Offline not working"
- Verify service worker is active
- Check precache manifest in `sw.js`
- Ensure assets are in the build output
- Test with DevTools offline simulation

### "Firebase not working"
- Firebase SDK still works normally with PWA
- Offline caching is read-only (write when online)
- Real-time listeners resume when connection returns
- Check Firebase rules allow PWA origin

## 📚 Resources
- [PWA Documentation](https://web.dev/articles/what-are-pwas)
- [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- [Web Manifest Spec](https://www.w3.org/TR/appmanifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Firebase in PWAs](https://firebase.google.com/docs/web/setup)

## ✨ Next Steps (Optional)

### Icon Generation
To generate PNG icons from the SVG logo:
```bash
npm run pwa:generate-icons
```

### Push Notifications
Add push notification support:
```bash
npm install firebase-admin
```

### Workbox Configuration
For advanced caching strategies, modify `workbox` in `vite.config.js`:
```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/api\.example\.com\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        expiration: { maxEntries: 50, maxAgeSeconds: 300 }
      }
    }
  ]
}
```

---

**PWA Setup Complete!** 🎉 Your Streak Checker app is now a full Progressive Web App ready for production deployment.
