<template>
  <!-- IN PROGRESS -->
  <svg v-if="status === 'in_progress'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="status-icon">
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
  <svg v-else-if="status === 'done'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="status-icon status-icon--done">
    <circle cx="24" cy="24" r="23" fill="var(--si-bg-outer)" stroke="var(--si-border)" stroke-width="1"/>
    <circle cx="24" cy="24" r="19" fill="none" stroke="var(--si-ring)" stroke-width="0.8" opacity="0.5"/>
    <circle cx="24" cy="24" r="13" fill="var(--si-bg-inner)" stroke="var(--si-ring)" stroke-width="0.8"/>
    <polyline points="18,25 22,29 30,19" fill="none" stroke="var(--si-check)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
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

<style scoped>
.status-icon {
  --si-bg-outer: #185FA5;
  --si-border:   #0C447C;
  --si-ring:     #378ADD;
  --si-bg-inner: #0C447C;
  --si-track:    #185FA5;
  --si-spinner:  #85B7EB;
}

.status-icon--done {
  --si-bg-outer: #0F6E56;
  --si-border:   #085041;
  --si-ring:     #1D9E75;
  --si-bg-inner: #085041;
  --si-check:    #5DCAA5;
}

@media (prefers-color-scheme: dark) {
  .status-icon {
    --si-bg-outer: #1A6FBF;
    --si-border:   #1152A0;
    --si-ring:     #5AA8F0;
    --si-bg-inner: #113D72;
    --si-track:    #1A6FBF;
    --si-spinner:  #A8D0F5;
  }

  .status-icon--done {
    --si-bg-outer: #1edf92;
    --si-border:   #14aa8c;
    --si-ring:     #2DC49A;
    --si-bg-inner: #176957;
    --si-check:    #7EDFC0;
  }
}
</style>