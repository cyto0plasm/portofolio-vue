<script setup>
import { computed } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'

const layout = useLayoutStore()

const props = defineProps({
  status: { type: String, required: true, validator: v => ['in_progress', 'done'].includes(v) },
  size:   { type: Number, default: 48 },
  color:  { type: String, default: null },
})

const c = computed(() => props.color ?? layout.preferedColor)

const isDark = computed(() => layout.isDark)

const vars = computed(() => {
  const base = c.value
  const bg   = isDark.value ? '#0a0a0a' : '#f0f0f0'
  const bgIn = isDark.value ? '#050505' : '#e8e8e8'

  if (props.status === 'in_progress') return {
    '--si-bg-outer': `color-mix(in srgb, ${base} ${isDark.value ? 18 : 12}%, ${bg})`,
    '--si-border':   `color-mix(in srgb, ${base} ${isDark.value ? 30 : 20}%, ${bg})`,
    '--si-ring':     `color-mix(in srgb, ${base} 55%, transparent)`,
    '--si-bg-inner': `color-mix(in srgb, ${base} ${isDark.value ? 12 : 8}%, ${bgIn})`,
    '--si-track':    `color-mix(in srgb, ${base} ${isDark.value ? 15 : 10}%, ${bg})`,
    '--si-spinner':  `color-mix(in srgb, ${base} 90%, ${isDark.value ? '#fff' : '#000'})`,
  }
  return {
    '--si-bg-outer': `color-mix(in srgb, ${base} ${isDark.value ? 14 : 10}%, ${bg})`,
    '--si-border':   `color-mix(in srgb, ${base} ${isDark.value ? 25 : 15}%, ${bg})`,
    '--si-ring':     `color-mix(in srgb, ${base} 45%, transparent)`,
    '--si-bg-inner': `color-mix(in srgb, ${base} ${isDark.value ? 10 : 6}%, ${bgIn})`,
    '--si-check':    `color-mix(in srgb, ${base} 95%, ${isDark.value ? '#fff' : '#000'})`,
  }
})
</script>

<template>
  <!-- IN PROGRESS -->
  <svg v-if="status === 'in_progress'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="status-icon" :style="vars">
    <circle cx="24" cy="24" r="23" fill="var(--si-bg-outer)" stroke="var(--si-border)" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="var(--si-ring)" stroke-width="0.8" opacity="0.45"/>
    <circle cx="24" cy="24" r="13" fill="var(--si-bg-inner)" stroke="var(--si-ring)" stroke-width="0.8"/>
    <circle cx="24" cy="24" r="9" fill="none" stroke="var(--si-track)" stroke-width="3"/>
    <circle cx="24" cy="24" r="9" fill="none" stroke="var(--si-spinner)" stroke-width="3" stroke-dasharray="14 42" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="24" cy="24" r="2" fill="var(--si-spinner)"/>
  </svg>

  <!-- DONE -->
  <svg v-else-if="status === 'done'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="status-icon" :style="vars">
    <circle cx="24" cy="24" r="23" fill="var(--si-bg-outer)" stroke="var(--si-border)" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="var(--si-ring)" stroke-width="0.8" opacity="0.5"/>
    <circle cx="24" cy="24" r="13" fill="var(--si-bg-inner)" stroke="var(--si-ring)" stroke-width="0.8"/>
    <polyline points="18,25 22,29 30,19" fill="none" stroke="var(--si-check)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<style scoped>
.status-icon { display: inline-block; }
</style>