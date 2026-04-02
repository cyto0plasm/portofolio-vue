import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useContact } from '@/composables/firebase/useContact.js'
import { useFlash } from '@/composables/feedback/use-flash.js'

export const useContactStore = defineStore('contact', () => {
  const { flash, show } = useFlash()

  // form fields
  const name = ref('')
  const email = ref('')
  const message = ref('')
  const focused = ref(null)

  const { submitting, success, error, sendMessage } = useContact()

  // validation rules
  const errors = ref({ name: '', email: '', message: '' })

  const validate = () => {
    let valid = true
    errors.value.name = ''
    errors.value.email = ''
    errors.value.message = ''

    if (!name.value || name.value.length < 3) {
      errors.value.name = 'Name must be at least 3 characters'
      show('error', errors.value.name)
      valid = false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.value || !emailRegex.test(email.value)) {
      errors.value.email = 'Invalid email address'
      show('error', errors.value.email)
      valid = false
    }

    if (!message.value || message.value.length < 16) {
      errors.value.message = 'Message must be at least 16 characters'
      show('error', errors.value.message)
      valid = false
    }

    return valid
  }

  const submitForm = async () => {
    if (!validate()) return

    await sendMessage({ name: name.value, email: email.value, message: message.value })

    if (success.value) {
      show('success', 'Message sent successfully!')
      name.value = ''
      email.value = ''
      message.value = ''
    } else if (error.value) {
      show('error', error.value || 'Failed to send message.')
    }
  }

const fields = [
  { id: 'name', model: name, type: 'text', prefix: '01', labelKey: 'contact.name', placeholderKey: 'contact.namePlaceholder' },
  { id: 'email', model: email, type: 'email', prefix: '02', labelKey: 'contact.email', placeholderKey: 'contact.emailPlaceholder' },
]

  return {
    name,
    email,
    message,
    focused,
    submitting,
    success,
    error,
    errors,
    submitForm,
    fields,
    flash
  }
})