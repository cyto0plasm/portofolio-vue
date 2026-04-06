<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'

const layout = useLayoutStore()

const props = defineProps({
  width:    { type: String, default: '90%' },
  duration: { type: Number, default: 1600 },
  color:    { type: String, default: null }
})

const wrapper = ref(null)
const line    = ref(null)
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

onBeforeUnmount(() => observer?.disconnect())

const resolvedColor = computed(() => props.color ?? layout.preferedColor)</script>

<template>
  <div ref="wrapper" class="mx-auto overflow-hidden" :style="{ width }">
    <div
      ref="line"
      class="h-px"
      :style="{
        background: `linear-gradient(to right, transparent, color-mix(in srgb, ${resolvedColor} 40%, transparent), transparent)`,
        transform: 'scaleX(0)',
        transformOrigin: 'center',
        transition: `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        willChange: 'transform'
      }"
    />
  </div>
</template>