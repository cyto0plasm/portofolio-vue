// composables/useComments.js
import { db } from '@/firebase'
import {
  collection, addDoc, query, where, orderBy, onSnapshot,
  serverTimestamp, doc, updateDoc, increment
} from 'firebase/firestore'
import { ref, onMounted, onUnmounted } from 'vue'
import emailjs from '@emailjs/browser'
import { useRateLimit } from './useRateLimit'

const EMAILJS_SERVICE_ID  = 'service_a0cy3f8'
const EMAILJS_TEMPLATE_ID = 'template_rsxadmo'
const EMAILJS_PUBLIC_KEY  = '4PdY-VHfZ4o8xtBgk'

export function useComments(projectId) {
  const comments = ref([])
  const rateLimitError = ref('')
  let unsub = null

  const { isAllowed, remainingSeconds } = useRateLimit(`comments_${projectId}`, {
    max: 5,
    windowMs: 60_000
  })

  const { isAllowed: likeAllowed, remainingSeconds: likeRemaining } =
    useRateLimit(`comment_likes_${projectId}`, { max: 20, windowMs: 60_000 })

  onMounted(() => {
    if (!projectId) return

    const q = query(
      collection(db, 'comments'),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    unsub = onSnapshot(
      q,
      (snap) => { comments.value = snap.docs.map((d) => ({ id: d.id, ...d.data() })) },
      (err) => console.error('[comments] snapshot error:', err)
    )
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  async function addComment(text, author = 'Anonymous') {
    if (!projectId || !text?.trim()) return

    if (!isAllowed()) {
      rateLimitError.value = `Too many comments. Try again in ${remainingSeconds()}s.`
      return { error: rateLimitError.value }
    }

    rateLimitError.value = ''

    try {
      await addDoc(collection(db, 'comments'), {
        projectId,
        text: text.trim(),
        author,
        likes: 0,
        createdAt: serverTimestamp()
      })

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: author,
          from_email: 'comment@portfolio',
          message: text.trim(),
          project_id: projectId,
          type: 'Comment'
        },
        EMAILJS_PUBLIC_KEY
      )
    } catch (err) {
      console.error(' [comments] error:', err)
    }
  }

  // key pattern: liked_comment_{commentId}
  async function toggleCommentLike(commentId) {
    if (!commentId) return

    if (!likeAllowed()) {
      rateLimitError.value = `Too many likes. Try again in ${likeRemaining()}s.`
      return { error: rateLimitError.value }
    }

    rateLimitError.value = ''

    const key = `liked_comment_${commentId}`
    const alreadyLiked = !!localStorage.getItem(key)

    try {
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(alreadyLiked ? -1 : 1)
      })

      if (alreadyLiked) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, '1')
      }

      // reflect change locally so UI updates instantly without waiting for snapshot
      const comment = comments.value.find((c) => c.id === commentId)
      if (comment) comment.likes = (comment.likes ?? 0) + (alreadyLiked ? -1 : 1)

      return { liked: !alreadyLiked }
    } catch (err) {
      console.error(' [comments] toggleLike failed:', err)
    }
  }

  function isCommentLiked(commentId) {
    return !!localStorage.getItem(`liked_comment_${commentId}`)
  }

  return { comments, addComment, toggleCommentLike, isCommentLiked, rateLimitError }
}