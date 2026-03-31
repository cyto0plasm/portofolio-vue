import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import './useScrollReveal.css'
import { useLayoutStore } from '../Stores/layout-store'

// Shared pool keyed by threshold|rootMargin
const pool = new Map()

function getSharedObserver(threshold, rootMargin) {
  const key = `${threshold}|${rootMargin}`
  if (!pool.has(key)) {
    pool.set(key, new IntersectionObserver(
      entries => entries.forEach(e => e.target._revealCb?.(e)),
      { threshold, rootMargin }
    ))
  }
  return pool.get(key)
}

export function useScrollReveal(options = {}) {
  const { threshold = 0.08, once = false, rootMargin = '0px' } = options

  const layout    = useLayoutStore()
  const revealRef = ref(null)
  const isVisible = ref(false)
  const exitDir   = ref(null)

  let observer = null
  let revealed = false

  function reveal() {
    if (revealed && once) return
    revealed = true
    isVisible.value = true
    if (once) {
      observer?.unobserve(revealRef.value)
      delete revealRef.value._revealCb
    }
  }

  function hide(dir) {
    if (once) return
    revealed = false
    isVisible.value = false
    exitDir.value = dir
  }

  function isInViewport() {
    const el = revealRef.value
    if (!el) return false
    const { top, bottom, height } = el.getBoundingClientRect()
    return (Math.min(bottom, window.innerHeight) - Math.max(top, 0)) / height >= threshold
  }

  watch(() => layout.pageReady, (ready) => {
    if (ready && isInViewport()) reveal()
  })

  onMounted(() => {
    const el = revealRef.value
    if (!el) return

    observer = getSharedObserver(threshold, rootMargin)

    el._revealCb = (entry) => {
      if (entry.isIntersecting) {
        exitDir.value = null
        if (layout.pageReady) reveal()
      } else {
        hide(entry.boundingClientRect.top > 0 ? 'bottom' : 'top')
      }
    }

    observer.observe(el)

    // Handle elements already in view on mount
    requestAnimationFrame(() => {
      if (layout.pageReady && isInViewport()) reveal()
    })
  })

  onBeforeUnmount(() => {
    const el = revealRef.value
    if (!el) return
    observer?.unobserve(el)
    delete el._revealCb
  })

  return { revealRef, isVisible, exitDir }
}
