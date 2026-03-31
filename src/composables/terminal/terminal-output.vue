<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  output: { type: Array, required: true },
});

const bodyRef = ref(null);

// Auto-scroll on new lines
watch(() => props.output.length, () => {
  nextTick(() => {
    if (bodyRef.value) bodyRef.value.scrollTop = bodyRef.value.scrollHeight;
  });
});

const LINE_CLASS = {
  input:      'text-slate-200',
  output:     'text-slate-300',
  info:       'text-cyan-300',
  success:    'text-emerald-400',
  error:      'text-red-400',
  system:     'text-white/25 text-[11px]',
  'help-row': 'text-slate-300',
};
</script>

<template>
  <div
    ref="bodyRef"
    class="flex-1 overflow-y-scroll px-[18px] py-2.5 z-10 overscroll-contain
           [scrollbar-width:thin] [scrollbar-color:rgba(52,211,153,0.18)_transparent]"
    @click.stop
  >
    <div
      v-for="(line, i) in output"
      :key="i"
      class="flex items-baseline gap-1.5 leading-7 whitespace-pre-wrap break-all animate-[fadein_0.08s_ease]"
      :class="LINE_CLASS[line.type] ?? 'text-slate-300'"
    >
      <span v-if="line.type === 'input'" class="text-emerald-400 flex-shrink-0" aria-hidden="true">❯</span>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="line.text" />
    </div>
  </div>
</template>

<style scoped>
/* Deep overrides for v-html highlights emitted by commands */
:deep(.hl-amber) { color: #fbbf24; }
:deep(.hl-red)   { color: #f87171; }
:deep(.cmd-name) { color: #fbbf24; display: inline-block; min-width: 160px; }
:deep(.cmd-desc) { color: #94a3b8; }

@keyframes fadein {
  from { opacity: 0; transform: translateY(2px); }
  to   { opacity: 1; transform: none; }
}
</style>
