<template>
  <div class="sketch-wrapper">
    <span ref="textRef" class="sketch-text">
      <slot />
    </span>

    <svg
      class="sketch-svg"
      :style="svgStyle"
      viewBox="0 0 500 150"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        ref="pathRef"
        :d="handDrawnPath"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
    </svg>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'

// ========================
// 1. YOUR CUSTOM HAND-DRAWN PATH (closed with Z)
// ========================
const handDrawnPath = ref(`
  M 325,18
  C 228.7,-8.3 118.5,8.3 78,21
  C 22.4,38.4 4.6,54.6 5.6,77.6
  c 1.4,32.4 52.2,54 142.6,63.7
  c 66.2,7.1 212.2,7.5 273.5,-8.3
  c 64.4,-16.6 104.3,-57.6 33.8,-98.2
  C 386.7,-4.9 179.4,-1.4 126.3,20.7
  Z
`)

const textRef = ref(null)
const pathRef = ref(null)

// Reactive dimensions + padding
const wrapperWidth = ref(0)
const wrapperHeight = ref(0)

// Extra padding around text (so the shape breathes)
const PAD_X = 28   // horizontal padding
const PAD_Y = 24   // vertical padding

// SVG size = text size + padding
const svgStyle = ref({
  width: '0px',
  height: '0px'
})

let resizeObserver = null
let animationFrameId = null

// ========================
// 2. UPDATE SVG SIZE BASED ON TEXT DIMENSIONS
// ========================
function updateSvgSize() {
  if (!textRef.value) return

  const rect = textRef.value.getBoundingClientRect()
  const newWidth = rect.width + PAD_X * 2
  const newHeight = rect.height + PAD_Y * 2

  wrapperWidth.value = newWidth
  wrapperHeight.value = newHeight

  svgStyle.value = {
    width: `${newWidth}px`,
    height: `${newHeight}px`
  }

  // After size update, re-trigger stroke animation
  nextTick(() => animateStroke())
}

// ========================
// 3. STROKE DRAWING ANIMATION (keeps the hand-drawn feel)
// ========================
function animateStroke() {
  const pathEl = pathRef.value
  if (!pathEl) return

  // Cancel any ongoing animation to avoid conflicts
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  // Force a reflow to ensure fresh length calculation
  const length = pathEl.getTotalLength()

  // Set dash properties
  pathEl.style.strokeDasharray = length
  pathEl.style.strokeDashoffset = length

  // Trigger animation on next frame
  animationFrameId = requestAnimationFrame(() => {
    if (pathEl) {
      pathEl.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
      pathEl.style.strokeDashoffset = '0'
    }
  })
}

// ========================
// 4. RESIZE OBSERVER + CONTENT CHANGE WATCHER
// ========================
function initResizeObserver() {
  if (resizeObserver) resizeObserver.disconnect()

  resizeObserver = new ResizeObserver(() => {
    updateSvgSize()
  })

  if (textRef.value) {
    resizeObserver.observe(textRef.value)
  }
}

// Watch for slot content changes (text length / innerHTML)
watch(
  () => textRef.value?.innerText,
  () => {
    updateSvgSize()
  }
)

onMounted(async () => {
  await nextTick()
  updateSvgSize()
  initResizeObserver()
})

// Cleanup
import { onBeforeUnmount } from 'vue'
onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<style scoped>
/* ========================
   5. WRAPPER & TEXT STYLES
   ======================== */
.sketch-wrapper {
  position: relative;
  display: inline-block;
  /* ensures the wrapper hugs the text tightly */
  line-height: 1;
}

.sketch-text {
  position: relative;
  z-index: 2;
  display: inline-block;
  /* preserve text readability & natural flow */
  white-space: normal;
  word-break: keep-all;
  /* fine-tune padding if you want extra internal spacing */
  padding: 0.15em 0.3em;
}

/* ========================
   6. SVG POSITIONING (overlay + hand-drawn border)
   ======================== */
.sketch-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  pointer-events: none;

  /* force smooth rendering even when scaled */
  shape-rendering: geometricPrecision;
}
</style>