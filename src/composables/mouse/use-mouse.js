import { ref, onMounted, onUnmounted } from 'vue'

// Singleton — one listener shared across all consumers
const mx = ref(typeof window !== 'undefined' ? innerWidth / 2 : 0)
const my = ref(typeof window !== 'undefined' ? innerHeight / 2 : 0)
let refCount = 0

function handler(e) { mx.value = e.clientX; my.value = e.clientY }

export function useMouse() {
  onMounted(() => { if (++refCount === 1) window.addEventListener('mousemove', handler, { passive: true }) })
  onUnmounted(() => { if (--refCount === 0) window.removeEventListener('mousemove', handler) })
  return { mx, my }
}
