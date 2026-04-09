<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  photoSrc:      { type: String, required: true },
  preferedColor: { type: String, default: '#6ee7b7' },
  firstName:     { type: String, default: '' },
  lastName:      { type: String, default: '' },
})

// ── Cycling code lines ────────────────────────────────────────────────────────
const CODE_LINES = [
  `const me = { role: "dev" }`,
  `git commit -m "available"`,
  `npm run build // ✓`,
  `while (true) { learn() }`,
  `<component :is="passion" />`,
]
const lineIdx     = ref(0)
const lineVisible = ref(true)
let timer = null
onMounted(() => {
  timer = setInterval(() => {
    lineVisible.value = false
    setTimeout(() => {
      lineIdx.value = (lineIdx.value + 1) % CODE_LINES.length
      lineVisible.value = true
    }, 300)
  }, 2600)
})

// ── Parallax pan ──────────────────────────────────────────────────────────────
const PAN  = 14
const LERP = 0.072
const lerp = (a, b, t) => a + (b - a) * t

const cardRef   = ref(null)
const imgStyle  = ref({ transform: 'scale(1.15)', willChange: 'transform' })
const isHovered = ref(false)
const offset    = ref({ x: 0, y: 0 })
let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null, running = false

function tick() {
  cx = lerp(cx, tx, LERP); cy = lerp(cy, ty, LERP)
  offset.value   = { x: cx, y: cy }
  imgStyle.value = { transform: `scale(1.15) translate(${cx}px,${cy}px)`, willChange: 'transform' }
  const done = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01
  if (done) { cx = tx; cy = ty; offset.value = { x: cx, y: cy }; running = false; rafId = null }
  else rafId = requestAnimationFrame(tick)
}
const startRaf = () => { if (!running) { running = true; rafId = requestAnimationFrame(tick) } }

const onMouseMove = (e) => {
  const el = cardRef.value; if (!el) return
  const { left, top, width, height } = el.getBoundingClientRect()
  tx = ((e.clientX - left) / width  * 2 - 1) * -PAN
  ty = ((e.clientY - top)  / height * 2 - 1) * -PAN
  startRaf()
}
const onMouseEnter = () => { isHovered.value = true }
const onMouseLeave = () => { isHovered.value = false; tx = 0; ty = 0; startRaf() }

onBeforeUnmount(() => {
  clearInterval(timer)
  if (rafId) cancelAnimationFrame(rafId)
})

const dots = Array.from({ length: 50 }, (_, i) => ({
  cx: (i % 5) * 10 + 5,
  cy: Math.floor(i / 5) * 18 + 9,
}))
</script>

<template>
  <div
    class="photo-scene relative flex items-center p-8 pl-8 cursor-crosshair"
    @mousemove="onMouseMove"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- dots -->
    <svg
      class="absolute top-8 left-0 pointer-events-none"
      width="52" height="182" xmlns="http://www.w3.org/2000/svg"
      :style="{ transform: `translate(${offset.x * 0.25}px,${offset.y * 0.50}px)`, willChange: 'transform' }"
    >
      <circle
        v-for="(d, i) in dots" :key="i"
        :cx="d.cx" :cy="d.cy" r="1.6" :fill="preferedColor" opacity="0.10"
      />
    </svg>

    <!-- cycling code line -->
    <span
      class="code-line absolute top-1.5 left-12 font-mono text-xs pointer-events-none select-none"
      :class="lineVisible ? 'opacity-[0.65] blur-0' : 'opacity-0 blur-sm'"
      :style="{
        color: preferedColor,
        transform: `translate(${offset.x * 0.90}px,${offset.y * 0.30}px)`,
        transition: 'opacity .28s ease, filter .28s ease, transform .05s linear',
        willChange: 'transform, opacity, filter',
      }"
    >{{ CODE_LINES[lineIdx] }}</span>

    <!-- photo card -->
    <div
      ref="cardRef"
      class="photo-frame relative w-44 h-52 md:w-52 md:h-64 lg:w-80 lg:h-96 rounded-2xl overflow-hidden select-none cursor-crosshair"
    >
      <div
        class="absolute inset-0 rounded-2xl rotate-3 opacity-30 pointer-events-none -z-10"
        :style="{ background: preferedColor }"
      />
      <img
        :src="photoSrc"
        :alt="`${firstName} ${lastName}`"
        class="w-full h-full object-cover object-top block rounded-2xl ring-1 ring-gray-200 shadow-xl"
        :style="imgStyle"
        loading="eager" decoding="async" draggable="false"
      />
      <div
        class="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-300"
        :class="isHovered ? 'opacity-100' : 'opacity-0'"
        :style="{ boxShadow: `inset 0 0 0 2px ${preferedColor}66` }"
      />
      <div class="absolute -top-5 -right-5 z-20">
        <slot name="toy" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.photo-frame,
.photo-frame img { will-change: transform; }
</style>