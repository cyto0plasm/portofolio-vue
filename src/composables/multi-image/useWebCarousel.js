import { ref } from 'vue'

export function useWebCarousel(active, count, emit) {
  const offset = ref(0)
  let startX = null, startY = null, dragging = false, delta = 0, didDrag = false 

  function mouseDown(e) {
  if (e.button !== 0) return
  if (e.target.closest('button')) return 
  startX = e.clientX; startY = e.clientY; dragging = false; delta = 0; didDrag = false
  let verticalDrag = false  // ← add

  const onMove = (ev) => {
    const dx = ev.clientX - startX
    const dy = Math.abs(ev.clientY - startY)
    if (!dragging && dy > 8 && Math.abs(dx) <= dy) verticalDrag = true  // ← add
    if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > dy) { dragging = true; didDrag = true }
    if (dragging) { ev.preventDefault(); delta = dx; offset.value = dx }
  }
  const onUp = () => {
    const d = delta
    dragging = false; delta = 0; offset.value = 0; startX = null
   if (!verticalDrag && Math.abs(delta) < 8) emit('open', active.value)
else if (delta < -50) active.value = (active.value + 1) % count.value
else if (delta > 50) active.value = (active.value - 1 + count.value) % count.value
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

  // ← add this function
  function clickCapture(e) {
    if (didDrag) {
      didDrag = false
      e.stopPropagation()
      e.preventDefault()
    }
  }

  function touchStart(e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; delta = 0 }
let verticalDrag = false

function touchMove(e) {
  const dx = e.touches[0].clientX - startX
  const dy = Math.abs(e.touches[0].clientY - startY)

  if (!dragging && dy > 8 && Math.abs(dx) <= dy) verticalDrag = true
  if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > dy) {
    dragging = true
    didDrag = true
  }

  if (dragging && !verticalDrag && e.cancelable) {
    e.preventDefault()
    delta = dx
    offset.value = dx
  }
}
  function touchEnd() {
    if (delta < -50) active.value = (active.value + 1) % count.value
    else if (delta > 50) active.value = (active.value - 1 + count.value) % count.value
    offset.value = 0; delta = 0
  }

  return { offset, mouseDown, touchStart, touchMove, touchEnd, clickCapture }  
}