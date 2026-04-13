// composables/useProjectStats.js
import { db, auth } from '@/firebase'
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { ref, onMounted, onUnmounted } from 'vue'
import { useRateLimit } from './useRateLimit'

/* -------------------- HELPERS -------------------- */

async function ensureAuth() {
  if (!auth.currentUser) await signInAnonymously(auth)
}

function safeDoc(collectionName, id) {
  if (!id) throw new Error(`${collectionName} id is required`)
  return doc(db, collectionName, id)
}

function safeGet(storage, key) {
  try { return storage.getItem(key) } catch { return null }
}

function safeSet(storage, key, value) {
  try { storage.setItem(key, value) } catch {}
}

function safeRemove(storage, key) {
  try { storage.removeItem(key) } catch {}
}

/* -------------------- PROJECT STATS -------------------- */

export function useProjectStats(projectId) {
  const views = ref(0)
  const likes = ref(0)
  const liked = ref(!!safeGet(localStorage, `liked_${projectId}`))
  const rateLimitError = ref('')
  let unsub = null

  // 10 like toggles per minute is already generous
  const { isAllowed, remainingSeconds } = useRateLimit(`likes_${projectId}`, {
    max: 10,
    windowMs: 60_000
  })

  onMounted(async () => {
    if (!projectId) return

    const projectRef = safeDoc('projects', projectId)

    unsub = onSnapshot(
      projectRef,
      (snap) => {
        if (!snap.exists()) return
        const data = snap.data()
        views.value = data?.views ?? 0
        likes.value = data?.likes ?? 0
      },
      (err) => console.error('[stats] snapshot error:', err)
    )

    const sessionKey = `viewed_${projectId}`
    if (!safeGet(sessionStorage, sessionKey)) {
      try {
        await ensureAuth()
        if (navigator.onLine) {
          await updateDoc(projectRef, { views: increment(1) })
        } else {
          console.warn('[stats] Offline, skipping view increment')
        }
        safeSet(sessionStorage, sessionKey, '1')
      } catch (err) {
        console.error('[stats] increment view failed:', err)
      }
    }
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  async function toggleLike() {
    if (!projectId) return

    if (!navigator.onLine) {
      console.warn('[stats] Offline — like not saved')
      return
    }

    if (!isAllowed()) {
      rateLimitError.value = `Slow down! Try again in ${remainingSeconds()}s.`
      return { error: rateLimitError.value }
    }

    rateLimitError.value = ''

    const projectRef = safeDoc('projects', projectId)
    const key = `liked_${projectId}`
    const alreadyLiked = !!safeGet(localStorage, key)

    try {
      await ensureAuth()
      await updateDoc(projectRef, { likes: increment(alreadyLiked ? -1 : 1) })

      if (alreadyLiked) {
        safeRemove(localStorage, key)
      } else {
        safeSet(localStorage, key, '1')
      }

      liked.value = !alreadyLiked
    } catch (err) {
      console.error('[stats] toggle like failed:', err)
    }
  }

  return { views, likes, liked, toggleLike, rateLimitError }
}