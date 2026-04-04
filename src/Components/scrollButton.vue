<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  sections: { type: Array, default: () => [] },
  color:    { type: String, default: '#6ee7b7' },
})

const current = ref(0)
const visible = ref(true)
let hideTimer = null
const cancelHide = () => clearTimeout(hideTimer)


const showTemporarily = () => {
  visible.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { visible.value = false }, 2500)
}

watch(() => props.sections, () => { current.value = 0 }, { flush: 'post' })

const scrollTo = (idx) => {
  current.value = idx
  document.getElementById(props.sections[idx])?.scrollIntoView({ behavior: 'smooth' })
  showTemporarily()
}

const next = () => scrollTo(Math.min(current.value + 1, props.sections.length - 1))
const prev = () => scrollTo(Math.max(current.value - 1, 0))

let ticking = false
const updateCurrent = () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    const vh = window.innerHeight
    const idx = props.sections.findIndex(id => {
      const el = document.getElementById(id)
      if (!el) return false
      const { top, bottom } = el.getBoundingClientRect()
      return top <= vh * 0.5 && bottom >= vh * 0.5
    })
    if (idx !== -1) current.value = idx
    showTemporarily()
    ticking = false
  })
}

onMounted(() => {
  window.addEventListener('scroll', updateCurrent, { passive: true })
  showTemporarily()
})
onUnmounted(() => {
  window.removeEventListener('scroll', updateCurrent)
  clearTimeout(hideTimer)
})
</script>

<template>
  <Transition name="fade">
    <div
      v-show="visible"
      class="fixed left-6 bottom-1/2 translate-y-1/2 z-20 flex flex-col items-center gap-2"
      @mouseenter="visible = true; cancelHide()"
      @mouseleave="showTemporarily"
    >
      <button
        v-if="current > 0"
        @click="prev"
        class="group flex items-center justify-center w-8 h-8 rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
        :style="{ borderColor: color + '50', background: color + '15', color }"
        aria-label="Previous section"
      >
        <svg class="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"/>
        </svg>
      </button>

      <div class="flex flex-col gap-2 py-1">
        <button
          v-for="(id, i) in sections" :key="id"
          @click="scrollTo(i)"
          class="rounded-full transition-all duration-300 hover:opacity-100"
          :class="current === i ? 'w-2 h-5' : 'w-1.5 h-1.5 opacity-25 hover:opacity-50'"
          :style="{ background: color }"
          :aria-label="`Go to ${id}`"
        />
      </div>

      <button
        v-if="current < sections.length - 1"
        @click="next"
        class="group flex items-center justify-center w-8 h-8 rounded-full border backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
        :style="{ borderColor: color + '50', background: color + '15', color }"
        aria-label="Next section"
      >
        <svg class="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
