<template>
  <!-- IN PROGRESS -->
  <svg v-if="status === 'in_progress'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="23" fill="#185FA5" stroke="#0C447C" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="#378ADD" stroke-width="0.8" opacity="0.45"/>
    <circle cx="24" cy="24" r="13" fill="#0C447C" stroke="#378ADD" stroke-width="0.8"/>
    <circle cx="24" cy="24" r="9" fill="none" stroke="#185FA5" stroke-width="3"/>
    <circle cx="24" cy="24" r="9" fill="none" stroke="#85B7EB" stroke-width="3" stroke-dasharray="14 42" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 24 24" to="360 24 24" dur="2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="24" cy="24" r="2" fill="#85B7EB"/>
  </svg>

  <!-- DONE -->
  <svg v-else-if="status === 'done'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="23" fill="#0F6E56" stroke="#085041" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="#1D9E75" stroke-width="0.8" opacity="0.5"/>
    <circle cx="24" cy="24" r="13" fill="#085041" stroke="#1D9E75" stroke-width="0.8"/>
    <polyline points="18,25 22,29 30,19" fill="none" stroke="#5DCAA5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['in_progress', 'done'].includes(v),
  },
  size: {
    type: Number,
    default: 48,
  },
})
</script>
