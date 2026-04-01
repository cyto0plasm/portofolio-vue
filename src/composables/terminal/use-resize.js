import { computed } from 'vue';
import { useLayoutStore } from '../../Stores/layout-store.js';
export let isResizing = false 

export function useResize() {
  const layout = useLayoutStore();
  const height = computed({
    get: () => layout.terminalHeight,
    set: v  => (layout.terminalHeight = v),
  });

  let startY = 0, startH = 0, rafId = null;

  function startResize(e) {
    e.preventDefault();
     isResizing = true  
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startH = height.value;
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   stop, { once: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend',  stop,  { once: true });
  }

  function onMove(e) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const min = 120, max = window.innerHeight * 0.85;
      height.value = Math.min(Math.max(min, startH + (startY - clientY)), max);
      rafId = null;
    });
  }

  function stop() {
    isResizing = false
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('touchmove', onMove);
  }

  return { height, startResize };
}