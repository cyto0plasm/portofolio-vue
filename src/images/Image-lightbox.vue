<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: { type: Array, required: true },  // array of src strings
  startIndex: { type: Number, default: 0 },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const current = ref(props.startIndex)

function prev() {
  current.value = (current.value - 1 + props.images.length) % props.images.length
}
function next() {
  current.value = (current.value + 1) % props.images.length
}

// Keyboard
function onKey(e) {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

// Swipe
const touchStartX = ref(null)
function onTouchStart(e) { touchStartX.value = e.touches[0].clientX }
function onTouchEnd(e) {
  if (touchStartX.value === null) return
  const delta = e.changedTouches[0].clientX - touchStartX.value
  if (Math.abs(delta) > 50) delta < 0 ? next() : prev()
  touchStartX.value = null
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="emit('close')"
      @touchstart="onTouchStart"
      @touchend="onTouchEnd"
    >
      <!-- Close -->
      <button
        @click="emit('close')"
        class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        aria-label="Close"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>

      <!-- Prev -->
      <button
        v-if="images.length > 1"
        @click="prev"
        class="absolute left-3 md:left-6 text-white/60 hover:text-white transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full p-2"
        aria-label="Previous"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
      </button>

      <!-- Image -->
      <div class="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          :src="images[current]"
          :alt="`${alt} ${current + 1}`"
          class="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl select-none"
          draggable="false"
        />
      </div>

      <!-- Next -->
      <button
        v-if="images.length > 1"
        @click="next"
        class="absolute right-3 md:right-6 text-white/60 hover:text-white transition-colors z-10 bg-black/30 hover:bg-black/50 rounded-full p-2"
        aria-label="Next"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>

      <!-- Dots -->
      <div v-if="images.length > 1" class="absolute bottom-5 flex gap-2">
        <button
          v-for="(_, i) in images" :key="i"
          @click="current = i"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="i === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'"
        />
      </div>
    </div>
  </Teleport>
</template>
