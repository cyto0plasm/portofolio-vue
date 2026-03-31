<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  width: { type: String, default: '90%' },
  duration: { type: Number, default: 1600 }
})

const wrapper = ref(null)
const line = ref(null)

let observer

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        line.value.style.transform = 'scaleX(1)'
        observer.disconnect()
      }
    },
    { threshold: 0.3 }
  )

  observer.observe(wrapper.value)
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<template>
  <div
    ref="wrapper"
    class="mx-auto overflow-hidden"
    :style="{ width }"
  >
    <div
      ref="line"
      class="h-px bg-gradient-to-r from-transparent via-black/40 to-transparent dark:via-white/60"
      :style="{
        transform: 'scaleX(0)',
        transformOrigin: 'center',
        transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'transform'
      }"
    />
  </div>
</template>
