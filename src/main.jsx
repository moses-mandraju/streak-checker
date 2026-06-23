import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

registerSW({
  onOfflineReady() {
    console.log('Streak Checker is ready to work offline.')
  },
  onRegisteredSW(swScriptUrl, registration) {
    console.log('Service worker registered:', swScriptUrl, registration)
  },
  onRegisterError(error) {
    console.error('Service worker registration failed:', error)
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
