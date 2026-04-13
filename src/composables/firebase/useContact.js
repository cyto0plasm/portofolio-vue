import { db, auth } from '@/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { signInAnonymously } from 'firebase/auth'
import { ref } from 'vue'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'service_a0cy3f8'   
const EMAILJS_TEMPLATE_ID = 'template_rsxadmo'  
const EMAILJS_PUBLIC_KEY  = '4PdY-VHfZ4o8xtBgk' 

export function useContact() {
  const submitting = ref(false)
  const success = ref(false)
  const error = ref('')

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

      // Save to Firestore as before
      await addDoc(collection(db, 'contacts'), {
        name, email, message,
        createdAt: serverTimestamp()
      })

      // Send email notification to yourself
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: name,
          from_email: email,
          message: message,
        },
        EMAILJS_PUBLIC_KEY
      )

      success.value = true
    } catch (err) {
      console.error('Failed:', err)
      error.value = 'Failed to send message. Try again later.'
    } finally {
      submitting.value = false
    }
  }

  return { submitting, success, error, sendMessage }
}
