import { db, auth } from '@/firebase'
import { doc, onSnapshot, updateDoc, increment, collection, addDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { ref, onMounted, onUnmounted } from 'vue'

export function useProjectStats(projectId) {
  const views = ref(0)
  const likes = ref(0)
  const liked = ref(!!localStorage.getItem(`liked_${projectId}`))

  let unsub = null

  onMounted(async () => {
    // Start listener only after mount
    unsub = onSnapshot(doc(db, 'projects', projectId), (snap) => {
      if (snap.exists()) {
        views.value = snap.data().views ?? 0
        likes.value = snap.data().likes ?? 0
      }
    })

    // Guard against dev HMR double-increments
    const sessionKey = `viewed_${projectId}`
    if (!sessionStorage.getItem(sessionKey)) {
      try {
        await updateDoc(doc(db, 'projects', projectId), { views: increment(1) })
        sessionStorage.setItem(sessionKey, '1')
      } catch (err) {
        console.error('Failed to increment views:', err)
      }
    }
  })

  onUnmounted(() => unsub?.())

  async function toggleLike() {
    try {
      if (!auth.currentUser) await signInAnonymously(auth)
      const alreadyLiked = !!localStorage.getItem(`liked_${projectId}`)
      await updateDoc(doc(db, 'projects', projectId), {
        likes: increment(alreadyLiked ? -1 : 1)
      })
      alreadyLiked
        ? localStorage.removeItem(`liked_${projectId}`)
        : localStorage.setItem(`liked_${projectId}`, '1')
      liked.value = !alreadyLiked
    } catch (err) {
      console.error('Failed to toggle like:', err)
    }
  }

  return { views, likes, liked, toggleLike }
}

export function useComments(slug) {
  const comments = ref([])
  let unsub = null

  onMounted(() => {
    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', slug),
      orderBy('createdAt', 'desc')
    )
    unsub = onSnapshot(q, snap => {
      comments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  })

  onUnmounted(() => unsub?.())

  async function addComment(text, author) {
    try {
      if (!auth.currentUser) await signInAnonymously(auth)
      await addDoc(collection(db, 'comments'), {
        projectId: slug, text, author, createdAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Failed to add comment:', err)
    }
  }

  return { comments, addComment }
}

// ✅ Fix: accept projectSlug as a parameter
export function useReplies(commentId, projectSlug) {
  const replies = ref([])
  let unsub = null

  onMounted(() => {
    const q = query(
      collection(db, 'comments', commentId, 'replies'),
      orderBy('createdAt', 'asc')
    )
    // ✅ Fix: assign unsub correctly inside onMounted
    unsub = onSnapshot(q, snap => {
      replies.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })
  })

  onUnmounted(() => unsub?.())

  // ✅ Fix: addReply is now properly inside the composable scope
  async function addReply(text, author) {
    try {
      if (!auth.currentUser) await signInAnonymously(auth)
      await addDoc(collection(db, 'comments', commentId, 'replies'), {
        text,
        author: author || 'Anonymous',
        createdAt: serverTimestamp()
      })
      if (projectSlug) {
        await updateDoc(doc(db, 'projects', projectSlug), {
          commentCount: increment(1)
        })
      }
    } catch (err) {
      console.error('Failed to add reply:', err)
    }
  }

  return { replies, addReply }
}