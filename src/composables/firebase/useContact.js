// src/composables/contact.js
import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { ref } from 'vue'

export function useContact() {
  const submitting = ref(false)
  const success = ref(false)
  const error = ref('')

  /**
   * Send a contact message to Firebase
   * @param {Object} data - { name, email, message }
   */
  async function sendMessage({ name, email, message }) {
    submitting.value = true
    success.value = false
    error.value = ''

    if (!name || !email || !message) {
      error.value = 'Please fill all fields'
      submitting.value = false
      return
    }

    try {
      if (!auth.currentUser) await signInAnonymously(auth)

      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        createdAt: serverTimestamp()
      })

      success.value = true
    } catch (err) {
      console.error('Failed to send contact message:', err)
      error.value = 'Failed to send message. Try again later.'
    } finally {
      submitting.value = false
    }
  }

  return {
    submitting,
    success,
    error,
    sendMessage
  }
}