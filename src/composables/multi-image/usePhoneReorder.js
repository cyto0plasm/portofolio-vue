import { ref } from 'vue'

export function usePhoneReorder(images, active) {
  const dragSrc  = ref(null)
  const startX   = ref(null)
  const moved    = ref(false)

  function pointerDown(e, i) {
    dragSrc.value = i
    startX.value  = e.clientX
    moved.value   = false
    // NO setPointerCapture — we need elementFromPoint to work freely
  }

  function pointerMove(e) {
    if (dragSrc.value === null) return
    if (Math.abs(e.clientX - startX.value) < 24) return

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
    if (!moved.value) {
      active.value = i
      emit('open', i)
    }
    dragSrc.value = null
    moved.value   = false
  }

  return { dragSrc, pointerDown, pointerMove, pointerUp }
}