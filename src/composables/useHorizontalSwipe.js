import { watch, onUnmounted } from 'vue'

export function useHorizontalSwipe(getEl) {
  let startX = null, scrollLeft = 0, isDragging = false
  const DRAG_THRESHOLD = 5

  function onMouseDown(e) {
    const el = getEl()
    if (!el || e.button !== 0) return
    startX     = e.clientX
    scrollLeft = el.scrollLeft
    isDragging = false
  }

  function onMouseMove(e) {
    if (startX === null) return
    const el = getEl()
    if (!el) return

    const delta = e.clientX - startX
    if (!isDragging) {
      if (Math.abs(delta) < DRAG_THRESHOLD) return
      isDragging = true
      e.preventDefault()
      el.style.cursor     = 'grabbing'
      el.style.userSelect = 'none'
    }

    el.scrollLeft = scrollLeft - delta
  }

  function onMouseUp() {
    if (startX === null) return
    startX = null
    const el = getEl()
    if (el) {
      el.style.cursor     = ''
      el.style.userSelect = ''
    }
    isDragging = false
  }

  // Watch the ref — attaches only once the element actually exists in the DOM
  const stop = watch(getEl, (el, _old, onCleanup) => {
    if (!el) return
    el.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)

    onCleanup(() => {
      el.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    })
  })

  onUnmounted(stop)
}