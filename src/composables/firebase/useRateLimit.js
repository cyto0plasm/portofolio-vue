import { db } from '@/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth } from '@/firebase'

const localLimits = new Map()

export function useRateLimit(key, { max = 5, windowMs = 60_000 } = {}) {

  function isAllowed() {
    const now = Date.now()
    const entry = localLimits.get(key)

    if (!entry || now - entry.windowStart > windowMs) {
      localLimits.set(key, { count: 1, windowStart: now })
      syncToFirestore(1, now)
      return true
    }

    if (entry.count >= max) return false

    entry.count++
    syncToFirestore(entry.count, entry.windowStart)
    return true
  }

  function remainingSeconds() {
    const entry = localLimits.get(key)
    if (!entry) return 0
    return Math.ceil((windowMs - (Date.now() - entry.windowStart)) / 1000)
  }

  async function syncToFirestore(count, windowStart) {
    const uid = auth.currentUser?.uid
    if (!uid) return
    try {
      await setDoc(doc(db, 'rateLimits', uid), { count, windowStart }, { merge: true })
    } catch {} // silent — local check is the UX layer, Firestore rule is the enforcer
  }

  return { isAllowed, remainingSeconds }
}