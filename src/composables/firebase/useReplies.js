// composables/useReplies.js
import { db } from '@/firebase'
import {
  collection, addDoc, query, orderBy, onSnapshot,
  serverTimestamp, increment, updateDoc, doc
} from 'firebase/firestore'
import { ref, onMounted, onUnmounted } from 'vue'
import emailjs from '@emailjs/browser'
import { useRateLimit } from './useRateLimit'

const EMAILJS_SERVICE_ID  = 'service_a0cy3f8'
const EMAILJS_TEMPLATE_ID = 'template_rsxadmo'
const EMAILJS_PUBLIC_KEY  = '4PdY-VHfZ4o8xtBgk'

export function useReplies(commentId, projectId) {
  const replies = ref([])
  const rateLimitError = ref('')
  let unsub = null

  const { isAllowed, remainingSeconds } = useRateLimit(`replies_${commentId}`, {
    max: 5,
    windowMs: 60_000
  })

  const { isAllowed: likeAllowed, remainingSeconds: likeRemaining } =
    useRateLimit(`reply_likes_${commentId}`, { max: 20, windowMs: 60_000 })

  onMounted(() => {
    if (!commentId) return

    const q = query(
      collection(db, 'comments', commentId, 'replies'),
      orderBy('createdAt', 'asc')
    )

    unsub = onSnapshot(
      q,
      (snap) => { replies.value = snap.docs.map((d) => ({ id: d.id, ...d.data() })) },
      (err) => console.error('[replies] snapshot error:', err)
    )
  })

  onUnmounted(() => {
    if (typeof unsub === 'function') unsub()
  })

  async function addReply(text, author = 'Anonymous') {
    if (!commentId || !text?.trim()) return

    if (!isAllowed()) {
      rateLimitError.value = `Too many replies. Try again in ${remainingSeconds()}s.`
      return { error: rateLimitError.value }
    }

    rateLimitError.value = ''

    try {
      await addDoc(collection(db, 'comments', commentId, 'replies'), {
        text: text.trim(),
        author,
        likes: 0,
        createdAt: serverTimestamp()
      })

      if (projectId) {
        await updateDoc(doc(db, 'projects', projectId), {
          commentCount: increment(1)
        })
      }

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: author,
          from_email: 'reply@portfolio',
          message: text.trim(),
          project_id: projectId ?? 'N/A',
          type: 'Reply',
          comment_id: commentId
        },
        EMAILJS_PUBLIC_KEY
      )
    } catch (err) {
      console.error(' [replies] error:', err)
    }
  }

  // key pattern: liked_reply_{commentId}_{replyId}
  async function toggleReplyLike(replyId) {
    if (!replyId) return

    if (!likeAllowed()) {
      rateLimitError.value = `Too many likes. Try again in ${likeRemaining()}s.`
      return { error: rateLimitError.value }
    }

    rateLimitError.value = ''

    const key = `liked_reply_${commentId}_${replyId}`
    const alreadyLiked = !!localStorage.getItem(key)

    try {
      await updateDoc(doc(db, 'comments', commentId, 'replies', replyId), {
        likes: increment(alreadyLiked ? -1 : 1)
      })

      if (alreadyLiked) {
        localStorage.removeItem(key)
      } else {
        localStorage.setItem(key, '1')
      }

      // reflect change locally so UI updates instantly without waiting for snapshot
      const reply = replies.value.find((r) => r.id === replyId)
      if (reply) reply.likes = (reply.likes ?? 0) + (alreadyLiked ? -1 : 1)

      return { liked: !alreadyLiked }
    } catch (err) {
      console.error(' [replies] toggleLike failed:', err)
    }
  }

  function isReplyLiked(replyId) {
    return !!localStorage.getItem(`liked_reply_${commentId}_${replyId}`)
  }

  return { replies, addReply, toggleReplyLike, isReplyLiked, rateLimitError }
}