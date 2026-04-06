import { ref } from 'vue'

export function useWebCarousel(active, count, emit) {
  const offset = ref(0)
  let startX = null, startY = null, dragging = false, delta = 0

  function mouseDown(e) {
    if (e.button !== 0) return
    startX = e.clientX; startY = e.clientY; dragging = false; delta = 0

    const onMove = (ev) => {
      const dx = ev.clientX - startX
      const dy = Math.abs(ev.clientY - startY)
      if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > dy) { dragging = true }
      if (dragging) { ev.preventDefault(); delta = dx; offset.value = dx }
    }
    const onUp = () => {
      const d = delta
      dragging = false; delta = 0; offset.value = 0; startX = null
      if (Math.abs(d) < 8) emit('open', active.value)
      else if (d < -50) active.value = (active.value + 1) % count.value
      else if (d >  50) active.value = (active.value - 1 + count.value) % count.value
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  function touchStart(e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; delta = 0 }
  function touchMove(e) {
    const dx = e.touches[0].clientX - startX
    const dy = Math.abs(e.touches[0].clientY - startY)
    if (Math.abs(dx) > dy) { e.preventDefault(); delta = dx; offset.value = dx }
  }
  function touchEnd() {
    if (delta < -50) active.value = (active.value + 1) % count.value
    else if (delta > 50) active.value = (active.value - 1 + count.value) % count.value
    offset.value = 0; delta = 0
  }

  return { offset, mouseDown, touchStart, touchMove, touchEnd }
}