import { computed } from 'vue';
import { useLayoutStore } from '../../Stores/layout-store.js';

export function useResize() {
  const layout = useLayoutStore();
  const height = computed({
    get: () => layout.terminalHeight,
    set: v  => (layout.terminalHeight = v),
  });

  let startY = 0, startH = 0, rafId = null;

  function startResize(e) {
    e.preventDefault();
    startY = e.clientY;
    startH = height.value;
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup',   stop, { once: true });
  }

  function onMove(e) {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      const min = 120, max = window.innerHeight * 0.85;
      height.value = Math.min(Math.max(min, startH + (startY - e.clientY)), max);
      rafId = null;
    });
  }

  function stop() {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    document.body.style.userSelect = '';
    window.removeEventListener('mousemove', onMove);
  }

  return { height, startResize };
}
