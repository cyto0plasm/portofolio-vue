<template>
  <div
    ref="btnRef"
    class="relative overflow-hidden flex items-center gap-2
           px-3 py-1.5 rounded-[30px] border-[0.1px] border-gray-500 dark:border-gray-400 cursor-pointer
           text-sm sm:text-base lg:text-lg
           sm:px-4 sm:py-2
           lg:px-6 lg:py-3"
    :style="magnetStyle"
    @mouseenter="isHovered = true"
    @mouseleave="handleMouseLeave"
  >
    <!-- Sliding background -->
    <div
      class="absolute inset-0 rounded-[30px]"
      :style="[bgStyle, { backgroundColor: props.color }]">
    </div>

    <!-- Button content -->
    <div class="relative z-10 flex items-center gap-2 dark:text-white text-gray-800">
      <!-- Pulsing circle with glow -->
      <div class="relative flex items-center justify-center">
        <!-- Glow circle underneath -->
        <div class="absolute w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 rounded-full bg-green-400 opacity-30 animate-heartbeat-slow"></div>
        <!-- Main circle -->
        <div class="w-2 h-2 sm:w-3 sm:h-3 lg:w-3 lg:h-3 rounded-full bg-green-400 animate-heartbeat"></div>
      </div>

      <div>{{ t('hero.contact') }}</div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
const { t ,locale} = useI18n()


const props = defineProps({
  color: { type: String, default: '#45afed' },
  strength: { type: Number, default: 20 },
  maxDistance: { type: Number, default: 150 },
  repelStrength: { type: Number, default: 15 }, // softer repel
  repelDuration: { type: Number, default: 80 } // shorter repel
})

const btnRef = ref(null)
const isHovered = ref(false)
const isRepelling = ref(false)
const exitDirection = ref({ x: 0, y: -1 })

const mouseX = ref(0)
const mouseY = ref(0)
const targetX = ref(0)
const targetY = ref(0)
const currentX = ref(0)
const currentY = ref(0)

function handleMouseMove(e) {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

function handleMouseLeave(e) {
  if (!btnRef.value) return
  const rect = btnRef.value.getBoundingClientRect()
  const x = e.clientX - (rect.left + rect.width / 2)
  const y = e.clientY - (rect.top + rect.height / 2)
  exitDirection.value = { x: Math.sign(x), y: Math.sign(y) }

  isHovered.value = false
  isRepelling.value = true
  targetX.value = exitDirection.value.x * props.repelStrength
  targetY.value = exitDirection.value.y * props.repelStrength

  // end repel quickly
  setTimeout(() => {
    isRepelling.value = false
  }, props.repelDuration)
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)

  const animate = () => {
    if (!btnRef.value) return
    const rect = btnRef.value.getBoundingClientRect()
    const offsetX = mouseX.value - (rect.left + rect.width / 2)
    const offsetY = mouseY.value - (rect.top + rect.height / 2)
    const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2)

    if (isHovered.value) {
      if (distance < props.maxDistance) {
        targetX.value = (offsetX / props.maxDistance) * props.strength
        targetY.value = (offsetY / props.maxDistance) * props.strength
      } else {
        targetX.value = 0
        targetY.value = 0
      }

      // subtle jitter
      const jitterX = (Math.random() - 0.5) * 1
      const jitterY = (Math.random() - 0.5) * 1
      targetX.value += jitterX
      targetY.value += jitterY
    } else if (!isHovered.value && !isRepelling.value) {
      targetX.value = 0
      targetY.value = 0
    }

    const ease = 0.15
    currentX.value += (targetX.value - currentX.value) * ease
    currentY.value += (targetY.value - currentY.value) * ease

    requestAnimationFrame(animate)
  }

  animate()
})

onBeforeUnmount(() => window.removeEventListener('mousemove', handleMouseMove))

const magnetStyle = computed(() => ({
  transform: `translate(${currentX.value}px, ${currentY.value}px)`,
  transition: 'none'
}))

const bgStyle = computed(() => {
  if (isHovered.value) return { transform: 'translate(0%,0%)', transition: 'transform 0.3s ease-out' }
  const x = exitDirection.value.x * 100
  const y = exitDirection.value.y * 100
  return { transform: `translate(${x}%, ${y}%)`, transition: 'transform 0.4s ease-in' }
})
</script>
<style scoped>
/* main heartbeat animation */
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  25%, 75% { transform: scale(1.3); }
  50% { transform: scale(1); }
}
.animate-heartbeat { animation: heartbeat 1s infinite ease-in-out; }

/* slower heartbeat for glow circle */
@keyframes heartbeat-slow {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.5); }
}
.animate-heartbeat-slow { animation: heartbeat-slow 2s infinite ease-in-out; }
</style>