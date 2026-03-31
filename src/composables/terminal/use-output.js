import { computed } from 'vue';
import { useLayoutStore } from '../../Stores/layout-store.js';

const MAX_LINES = 300;

export function useOutput() {
  const layout = useLayoutStore();
  const output = computed({
    get: () => layout.terminalOutput,
    set: v  => (layout.terminalOutput = v),
  });

  function push(type, text) {
    const next = [...output.value, { type, text }];
    output.value = next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
  }

  function clear() {
    output.value = [];
  }

  return { output, push, clear };
}
