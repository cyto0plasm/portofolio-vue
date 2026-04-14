import { useFlash } from '@/composables/feedback/use-flash'

const memoryFallback = new Map()

export function useRateLimit(key, { max = 2, windowMs = 60_000 } = {}) {
  const { show: showFlash } = useFlash()
  const storageKey = `rl_${key}`

  function getEntry() {
    // try localStorage first, fall back to memory
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : (memoryFallback.get(storageKey) ?? null)
    } catch {
      return memoryFallback.get(storageKey) ?? null
    }
  }

  function setEntry(entry) {
    memoryFallback.set(storageKey, entry) // always set memory
    try { localStorage.setItem(storageKey, JSON.stringify(entry)) } catch {}
  }

  function isAllowed() {
    const now = Date.now()
    const entry = getEntry()

    if (!entry || now - entry.windowStart > windowMs) {
      setEntry({ count: 1, windowStart: now })
      return true
    }

    if (entry.count >= max) {
      showFlash('error', `Too many attempts. Try again in ${remainingSeconds()}s.`)
      return false
    }

    setEntry({ count: entry.count + 1, windowStart: entry.windowStart })
    return true
  }

  function remainingSeconds() {
    const entry = getEntry()
    if (!entry) return 0
    return Math.ceil((windowMs - (Date.now() - entry.windowStart)) / 1000)
  }

  return { isAllowed, remainingSeconds }
}