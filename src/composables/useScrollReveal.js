import { ref, onMounted, onUnmounted } from 'vue'

// Shared observer pool — one observer per unique threshold+margin combo
const observers = new Map()

function getObserver(threshold, rootMargin, callback) {
  const key = `${threshold}|${rootMargin}`
  if (!observers.has(key)) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        const cb = e.target._scrollCb
        if (cb) cb(e)
      })
    }, { threshold, rootMargin })
    observers.set(key, io)
  }
  return observers.get(key)
}

export function useScroll({ threshold = 0.08, once = false, rootMargin = '0px 0px -40px 0px' } = {}) {
  const targetRef = ref(null)
  const isVisible = ref(false)
  const direction = ref(null)

  let observer = null

  function onIntersect(entry) {
    if (entry.isIntersecting) {
      direction.value = entry.boundingClientRect.top > 0 ? 'down' : 'up'
      isVisible.value = true
      if (once) {
        observer.unobserve(entry.target)
        delete entry.target._scrollCb
      }
    } else {
      if (!once) isVisible.value = false
    }
  }

  onMounted(() => {
    const el = targetRef.value
    if (!el) return
    observer = getObserver(threshold, rootMargin, onIntersect)
    el._scrollCb = onIntersect
    observer.observe(el)
  })

  onUnmounted(() => {
    const el = targetRef.value
    if (!el) return
    observer?.unobserve(el)
    delete el._scrollCb
  })

  return { targetRef, isVisible, direction }
}
