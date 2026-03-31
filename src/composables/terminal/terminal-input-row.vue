<script setup>
import { ref, watch, nextTick } from 'vue';
import { useLayoutStore } from '../../Stores/layout-store.js';

const props = defineProps({
  modelValue: { type: String, required: true },
  ghost:      { type: String, default: '' },
  error:      { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'keydown', 'submit']);

const layout  = useLayoutStore();
const inputEl = ref(null);

// Auto-focus whenever the terminal opens
watch(
  () => layout.terminalOpen,
  open => { if (open) nextTick(() => inputEl.value?.focus()); },
  { immediate: true },
);

// Only steal focus if the user isn't actively selecting text
function onContainerClick() {
  if (window.getSelection()?.toString()) return;
  inputEl.value?.focus();
}

defineExpose({ focus: () => inputEl.value?.focus() });
</script>

<template>
  <div
    class="flex items-center gap-2 px-[18px] py-[7px] pb-[10px]
           border-t border-white/5 bg-black/25 flex-shrink-0 z-10"
    @click.stop="onContainerClick"
  >
    <span class="text-emerald-400 flex-shrink-0 select-none" aria-hidden="true">❯</span>

    <!-- Stacked: ghost hint behind real input -->
    <div class="relative flex-1 flex items-center">
      <!-- Ghost layer -->
      <span
        class="absolute inset-0 flex items-center pointer-events-none
               font-mono text-[13px] tracking-[0.01em] whitespace-pre"
        aria-hidden="true"
      >
        <span class="invisible">{{ modelValue }}</span>
        <span class="text-white/20">{{ ghost.slice(modelValue.length) }}</span>
      </span>

      <!-- Real input -->
      <input
        ref="inputEl"
        :value="modelValue"
        :class="[
          'relative z-10 w-full bg-transparent border-none outline-none',
          'text-slate-200 font-mono text-[13px] caret-emerald-400 tracking-[0.01em]',
          'placeholder:text-white/15 placeholder:italic',
          error && 'animate-[shake_0.35s_cubic-bezier(.36,.07,.19,.97)]',
        ]"
        type="text"
        spellcheck="false"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        placeholder="type a command…"
        aria-label="Terminal input"
        @input="emit('update:modelValue', $event.target.value)"
        @keydown.enter.prevent="emit('submit')"
        @keydown="emit('keydown', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  10%, 90%      { transform: translateX(-1px); }
  20%, 80%      { transform: translateX(2px);  }
  30%, 50%, 70% { transform: translateX(-3px); }
  40%, 60%      { transform: translateX(3px);  }
}
</style>
