// composables/useComments.js
import { db } from '@/firebase'
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { ref } from 'vue'

export function useComments(projectId) {
  const comments = ref([])

  const q = query(
    collection(db, 'comments'),
    where('projectId', '==', projectId),
    orderBy('createdAt', 'desc')
  )

  onSnapshot(q, (snap) => {
    comments.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  })

  async function addComment(text, author) {
    await addDoc(collection(db, 'comments'), {
      projectId,
      text,
      author,
      createdAt: serverTimestamp()
    })
  }

  return { comments, addComment }
}
