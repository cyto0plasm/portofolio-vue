import { ref } from 'vue'

export function usePhoneReorder(images, active) {
  const dragSrc = ref(null)
  const startX  = ref(null)
  const startY  = ref(null)   // ← add
  const moved   = ref(false)
  const didMove = ref(false)  // ← tracks any significant movement

  function pointerDown(e, i) {
    dragSrc.value = i
    startX.value  = e.clientX
    startY.value  = e.clientY  // ← add
    moved.value   = false
    didMove.value = false       // ← add
  }

  function pointerMove(e) {
    if (dragSrc.value === null) return

    const dx = Math.abs(e.clientX - startX.value)
    const dy = Math.abs(e.clientY - startY.value)

    // Mark as moved if pointer went anywhere significant
    if (dx > 6 || dy > 6) didMove.value = true  // ← add

    if (dx < 24) return

    const el   = document.elementFromPoint(e.clientX, e.clientY)
    const card = el?.closest('[data-phone-idx]')
    if (!card) return

    const target = Number(card.dataset.phoneIdx)
    if (target === dragSrc.value) return

    moved.value = true
    const arr = [...images.value]
    const [item] = arr.splice(dragSrc.value, 1)
    arr.splice(target, 0, item)
    if (active.value === dragSrc.value) active.value = target
    images.value  = arr
    dragSrc.value = target
  }

  function pointerUp(i, emit) {
    if (!moved.value && !didMove.value) {  // ← guard with didMove
      active.value = i
      emit('open', i)
    }
    dragSrc.value = null
    moved.value   = false
    didMove.value = false  // ← reset
  }

  return { dragSrc, pointerDown, pointerMove, pointerUp }
}