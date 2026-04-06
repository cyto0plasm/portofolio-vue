export function usePhoneSwipe(active, count) {
  let startX = null, startY = null

  function start(x, y) { startX = x; startY = y }

  function end(x) {
    if (startX === null) return
    const dx = x - startX
    if (Math.abs(dx) < 50) { startX = null; return }
    if (dx < 0) active.value = Math.min(active.value + 1, count.value - 1)
    else        active.value = Math.max(active.value - 1, 0)
    startX = null
  }

  function touchMove(e) {
    if (startX === null) return
    const dx = Math.abs(e.touches[0].clientX - startX)
    const dy = Math.abs(e.touches[0].clientY - startY)
    if (dx > dy) e.preventDefault()
  }

  return { start, end, touchMove }
}