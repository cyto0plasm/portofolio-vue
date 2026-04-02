import { reactive } from 'vue'

// SINGLETON reactive state
const flash = reactive({
  message: '',
  type: '',      // 'success' | 'error' | 'info'
  visible: false,
  count: 1
})

let hideTimeout = null
let fadeTimeout = null

export function useFlash() {
  const show = (type, message, duration = 3000, forceNew = false) => {
    const isSameMessage = flash.type === type && flash.message === message

    clearTimeout(hideTimeout)
    clearTimeout(fadeTimeout)

    if (!isSameMessage || forceNew) {
      flash.message = message
      flash.type = type
      flash.count = 1
      flash.visible = true
    } else {
      flash.count++
      flash.visible = true
    }

    hideTimeout = setTimeout(() => {
      flash.visible = false
      fadeTimeout = setTimeout(() => {
        flash.count = 1
      }, 500)
    }, duration)
  }

  return { flash, show }
}