import { db, auth } from '@/firebase'
import {
  doc,
  onSnapshot,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { ref, onMounted, onUnmounted } from 'vue'

/* -------------------- HELPERS -------------------- */

async function ensureAuth() {
  if (!auth.currentUser) {
    await signInAnonymously(auth)
  }
}

function safeDoc(collectionName, id) {
  if (!id) throw new Error(`${collectionName} id is required`)
  return doc(db, collectionName, id)
}

function safeGet(storage, key) {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage, key, value) {
  try {
    storage.setItem(key, value)
  } catch {}
}

function safeRemove(storage, key) {
  try {
    storage.removeItem(key)
  } catch {}
}

/* -------------------- PROJECT STATS -------------------- */

export function useProjectStats(projectId) {
  const views = ref(0)
  const likes = ref(0)
  const liked = ref(!!safeGet(localStorage, `liked_${projectId}`))

  let unsub = null

  onMounted(async () => {
    if (!projectId) return

    const projectRef = safeDoc('projects', projectId)

    // Listener
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

    // View tracking (once per session)
    const sessionKey = `viewed_${projectId}`

    if (!safeGet(sessionStorage, sessionKey)) {
      try {
        await ensureAuth()
        if (navigator.onLine) {
      await updateDoc(projectRef, { views: increment(1) })
    } else {
      console.warn('Offline, skipping view increment')
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
    console.warn('⚠️ Offline — like not saved')
    return
  }
  
    const projectRef = safeDoc('projects', projectId)
    const key = `liked_${projectId}`

    const alreadyLiked = !!safeGet(localStorage, key)

    try {
      await ensureAuth()

      await updateDoc(projectRef, {
        likes: increment(alreadyLiked ? -1 : 1)
      })

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

  return { views, likes, liked, toggleLike }
}

/* -------------------- COMMENTS -------------------- */

export function useComments(projectId) {
  const comments = ref([])
  let unsub = null

  onMounted(() => {
    if (!projectId) return

    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    unsub = onSnapshot(
      q,
      (snap) => {
        comments.value = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      },
      (err) => console.error('[comments] snapshot error:', err)
    )
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  async function addComment(text, author = 'Anonymous') {
    if (!projectId || !text?.trim()) return

    try {
      await ensureAuth()

      await addDoc(collection(db, 'comments'), {
        projectId,
        text: text.trim(),
        author,
        createdAt: serverTimestamp()
      })
    } catch (err) {
      console.error('[comments] add failed:', err)
    }
  }

  return { comments, addComment }
}

/* -------------------- REPLIES -------------------- */

export function useReplies(commentId, projectId) {
  const replies = ref([])
  let unsub = null

  onMounted(() => {
    if (!commentId) return

    const q = query(
      collection(db, 'comments', commentId, 'replies'),
      orderBy('createdAt', 'asc')
    )

    unsub = onSnapshot(
      q,
      (snap) => {
        replies.value = snap.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }))
      },
      (err) => console.error('[replies] snapshot error:', err)
    )
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  async function addReply(text, author = 'Anonymous') {
    if (!commentId || !text?.trim()) return

    try {
      await ensureAuth()

      await addDoc(collection(db, 'comments', commentId, 'replies'), {
        text: text.trim(),
        author,
        createdAt: serverTimestamp()
      })

      // optional project counter
      if (projectId) {
        await updateDoc(safeDoc('projects', projectId), {
          commentCount: increment(1)
        })
      }
    } catch (err) {
      console.error('[replies] add failed:', err)
    }
  }

  return { replies, addReply }
}