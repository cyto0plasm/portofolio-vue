<script setup>
import { ref, watch } from 'vue';
import { useLayoutStore } from '@/Stores/layout-store.js';
import TerminalResizeBar from '@/composables/terminal/terminal-resize-bar.vue';
import TerminalHeader from '@/composables/terminal/terminal-header.vue';
import TerminalOutput from '@/composables/terminal/terminal-output.vue';
import TerminalInputRow from '@/composables/terminal/terminal-input-row.vue';
import { useResize } from '@/composables/terminal/use-resize';
import { useCommandRunner } from '@/composables/terminal/use-command-runner';

const props = defineProps({
  projects: { type: Array, default: () => [] },
   role:     { type: String, default: 'user' },
});

const layout   = useLayoutStore();
const { height, startResize } = useResize();
const { output, command, ghost, inputError, clear, handleKeydown, runCommand } = useCommandRunner(props);

const inputRowRef = ref(null);

// Don't steal focus while the user is selecting text
function handleRootClick() {
  if (window.getSelection()?.toString()) return;
  inputRowRef.value?.focus();
}
watch(() => layout.terminalOpen, (open) => {
  if (open) nextTick(() => inputRowRef.value?.focus());
});
</script>

<template>
  <Transition name="t-slide">
    <section
    @wheel.stop
      v-show="layout.terminalOpen"
      class="fixed bottom-0 inset-x-0 z-[9999] flex flex-col
             bg-[rgba(9,11,14,0.97)] backdrop-blur-xl
             border-t border-emerald-500/20
             shadow-[0_-10px_50px_rgba(0,0,0,0.65)]
             font-mono text-[13px] text-slate-200 overflow-hidden"
      :style="{ height: `${height}px` }"
      role="region"
      aria-label="Terminal"
      @click="handleRootClick"
    >
      <!-- CRT scanlines overlay -->
      <div
        class="absolute inset-0 pointer-events-none z-0
               [background:repeating-linear-gradient(to_bottom,transparent_0,transparent_3px,rgba(0,0,0,0.07)_3px,rgba(0,0,0,0.07)_4px)]"
        aria-hidden="true"
      />

      <TerminalResizeBar @start-resize="startResize" />
      <TerminalHeader    @clear="clear" />
      <TerminalOutput    :output="output"  @focus-input="inputRowRef?.focus()"/>
      <TerminalInputRow
        ref="inputRowRef"
        v-model="command"
        :ghost="ghost"
        :error="inputError"
        @keydown="handleKeydown"
        @submit="runCommand"
      />
    </section>
  </Transition>
</template>

<style scoped>
.t-slide-enter-active,
.t-slide-leave-active {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1),
              opacity   0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.t-slide-enter-from,
.t-slide-leave-to { transform: translateY(100%); opacity: 0; }
</style>
