<script setup>
import { ref, onMounted } from 'vue'
const show = ref(false)
onMounted(() => {
  const cb = () => { show.value = true }
  'requestIdleCallback' in window
    ? requestIdleCallback(cb, { timeout: 2000 })
    : setTimeout(cb, 400)
})
</script>
<template><slot v-if="show" /></template>
