import { useSettingsStore } from '../store/settingsStore'

let audioContext

function getAudioContext() {
  if (typeof window === 'undefined') return null

  const AudioContext =
    window.AudioContext || window.webkitAudioContext

  if (!AudioContext) return null

  audioContext ||= new AudioContext()
  return audioContext
}

export function playCompletionSound() {
  if (!useSettingsStore.getState().soundEnabled) return

  try {
    const context = getAudioContext()
    if (!context) return

    if (context.state === 'suspended') {
      context.resume().catch(() => {})
    }

    const now = context.currentTime
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(660, now)
    oscillator.frequency.exponentialRampToValueAtTime(990, now + 0.08)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14)

    oscillator.connect(gain)
    gain.connect(context.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.15)
  } catch {
    // Sound is non-critical; never interrupt habit completion.
  }
}
