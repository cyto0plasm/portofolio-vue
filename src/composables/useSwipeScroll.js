import { onMounted, onUnmounted } from 'vue'
import { isResizing } from '@/composables/terminal/use-resize'
export function useSwipeScroll(getLenis) {
  let startY = null, isDragging = false, didDrag = false
  let lastY = 0, velocity = 0

  const MULTIPLIER  = 1.01
  const FRICTION    = 0.96
  const DRAG_THRESHOLD = 6   // px — must move this far before it counts as a drag

  function onMouseDown(e) {
    if (isResizing) return
    if (e.button !== 0) return
    if (['INPUT','TEXTAREA','SELECT','BUTTON','A'].includes(e.target.tagName)) return
    if (e.target.closest('.term-root')) return
    if (e.target.closest('.select-text')) return

    startY     = e.clientY
    lastY      = e.clientY
    isDragging = false
    didDrag    = false
  }

  function onMouseMove(e) {
    if (startY === null) return

    const delta = Math.abs(e.clientY - startY)

    // Activate drag only after threshold
    if (!isDragging) {
      if (delta < DRAG_THRESHOLD) return
      isDragging = true
      didDrag    = true
      e.preventDefault()
      document.body.style.cursor     = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    velocity = (lastY - e.clientY) * MULTIPLIER
    lastY    = e.clientY
    getLenis().scrollTo(window.scrollY + velocity, { immediate: true })
  }

  function onMouseUp() {
    if (startY === null) return
    startY = null

    document.body.style.cursor     = ''
    document.body.style.userSelect = ''

    if (!isDragging) return
    isDragging = false

    const target = window.scrollY + velocity * (1 / (1 - FRICTION))
    getLenis().scrollTo(target, { duration: 0.6, easing: t => 1 - Math.pow(1 - t, 3) })
    velocity = 0
  }

  // Swallow the click that fires after mouseup when we actually dragged
  function onClickCapture(e) {
    if (didDrag) {
      didDrag = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  onMounted(() => {
    window.addEventListener('mousedown',  onMouseDown)
    window.addEventListener('mousemove',  onMouseMove)   // not passive — may call preventDefault
    window.addEventListener('mouseup',    onMouseUp)
    window.addEventListener('click',      onClickCapture, { capture: true })
  })

  onUnmounted(() => {
    window.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup',   onMouseUp)
    window.removeEventListener('click',     onClickCapture, { capture: true })
  })
}
