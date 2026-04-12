<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { usePhoneReorder } from '@/composables/multi-image/usePhoneReorder'
import { usePhoneSwipe }   from '@/composables/multi-image/usePhoneSwipe'
import { useWebCarousel }  from '@/composables/multi-image/useWebCarousel'

const emit  = defineEmits(['open'])
const props = defineProps({
  imagesSrc: { type: Array, default: () => [] },
  alt:       { type: String, default: '' },
  type:      { type: String, default: 'web' }
})

const active      = ref(0)
const images      = ref([])
const objectUrls  = ref([])
const hovered     = ref(null)
const containerRef = ref(null)
const count   = computed(() => images.value.length)
const mobile  = computed(() => props.type === 'mobile')

// ── Images ────────────────────────────────────────────────
const buildImages = () => {
  objectUrls.value.forEach(url => URL.revokeObjectURL(url))
  objectUrls.value = []
  images.value = props.imagesSrc.map(img => {
    if (img instanceof File) {
      const url = URL.createObjectURL(img)
      objectUrls.value.push(url)
      return url
    }
    return img
  })
  active.value = 0
}
watch(() => props.imagesSrc, buildImages, { immediate: true, deep: true })

// ── Composables ───────────────────────────────────────────
const carousel = useWebCarousel(active, count, emit)
const swipe    = usePhoneSwipe(active, count)
const reorder  = usePhoneReorder(images, active)

// ── Phone slots ───────────────────────────────────────────
const VISIBLE = 3
const SLOTS = [
  { x: -115, rotate: -8, scale: 0.82, z: 10 },
  { x: 0,    rotate:  0, scale: 1,    z: 20 },
  { x:  115, rotate:  8, scale: 0.82, z: 10 },
]

const visibleIndices = computed(() => {
  const c = count.value
  if (c === 0) return []
  if (c === 1) return [0]
  if (c === 2) return [0, 1]
  const start = Math.max(0, Math.min(active.value - 1, c - VISIBLE))
  return Array.from({ length: VISIBLE }, (_, i) => start + i)
})

function mobileStyle(idx) {
  const vi   = visibleIndices.value
  const slot = vi.indexOf(idx)
  if (slot === -1) return { display: 'none' }

  const defs = vi.length === 1 ? [SLOTS[1]]
             : vi.length === 2 ? [SLOTS[0], SLOTS[2]]
             : SLOTS
  const pos  = defs[slot]
  const isActive  = idx === active.value
  const isHovered = hovered.value === idx
  const scale     = isHovered && !isActive ? pos.scale * 1.06 : pos.scale
  const ty        = isHovered ? -14 : 0

  return {
    width: '140px', height: '290px',
    position: 'absolute', bottom: '0',
    left: `calc(50% - 70px + ${pos.x}px)`,
    zIndex: reorder.dragSrc.value === idx ? 40 : isHovered ? 30 : pos.z,
    transform: `translateY(${ty}px) scale(${scale}) rotate(${pos.rotate}deg)`,
   transition: reorder.dragSrc.value === idx
  ? 'left 120ms cubic-bezier(0.25,1,0.5,1), transform 120ms cubic-bezier(0.25,1,0.5,1)'
  : 'left 420ms cubic-bezier(0.34,1.4,0.64,1), transform 420ms cubic-bezier(0.34,1.4,0.64,1)',
    opacity: isActive ? 1 : 0.95,
    touchAction: 'pan-y',
  }
}

// ── Touch passive fix ─────────────────────────────────────
onMounted(() => {
  containerRef.value?.addEventListener('touchmove', swipe.touchMove, { passive: false })
})
onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('touchmove', swipe.touchMove)
  objectUrls.value.forEach(url => URL.revokeObjectURL(url))
})
</script>

<template>
  <div class="w-full h-full flex flex-col gap-2">

    <!-- EMPTY -->
    <div v-if="count === 0"
      class="w-full h-48 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-sm">
      No images
    </div>

    <!-- ── WEB ────────────────────────────────────────────── -->
    <template v-else-if="!mobile">
      <div class="rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-900 shadow-lg select-none">

        <div class="flex items-center gap-2 px-3 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
          <div class="flex gap-1.5">
            <div class="w-2.5 h-2.5 rounded-full bg-red-500/70"/>
            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/70"/>
            <div class="w-2.5 h-2.5 rounded-full bg-green-500/70"/>
          </div>
          <div class="flex-1 mx-2 px-3 py-0.5 rounded-md bg-zinc-700/50 text-zinc-500 text-[10px] font-mono truncate">
            {{ alt.toLowerCase().replace(/\s+/g, '-') }}.app
          </div>
          <div v-if="count > 1" class="flex gap-1">
            <button v-for="(_, i) in images" :key="i"
              @click.stop.prevent="active = i"
              class="w-2 h-2 rounded-full transition-all duration-200"
              :class="active === i ? 'bg-blue-400 scale-125' : 'bg-zinc-600 hover:bg-zinc-400'"
            />
          </div>
        </div>

        <div
          class="relative overflow-hidden bg-zinc-950 cursor-grab active:cursor-grabbing"
          style="height: 260px"
          @mousedown="carousel.mouseDown"
          @touchstart.passive="carousel.touchStart"
          @touchmove="carousel.touchMove"
          @touchend="carousel.touchEnd"
            @click.capture="carousel.clickCapture"

        >
          <template v-for="(img, i) in images" :key="i">
            <img loading="lazy" :src="img" :alt="alt"
              class="absolute inset-0 w-full h-full object-contain transition-all duration-500 pointer-events-none"
              :style="active === i ? { opacity: 1, transform: `translateX(${carousel.offset.value}px)` } : {}"
              :class="active === i ? '' : i < active ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'"
            />
          </template>

          <template v-if="count > 1">
            <button type="button" @click.stop="active = (active - 1 + count) % count"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-all hover:scale-110">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button type="button" @click.stop="active = (active + 1) % count"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-all hover:scale-110">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-zinc-400 text-[10px] font-mono backdrop-blur-sm">
              {{ active + 1 }} / {{ count }}
            </div>
          </template>
        </div>
      </div>
    </template>

    <!-- ── MOBILE ──────────────────────────────────────────── -->
    <template v-else>
      <div
        ref="containerRef"
        class="relative flex justify-center items-end w-full select-none"
        style="height: 300px"
        @touchstart.passive="(e) => swipe.start(e.touches[0].clientX, e.touches[0].clientY)"
        @touchend="(e) => swipe.end(e.changedTouches[0].clientX)"
      >
        <template v-for="(img, i) in images" :key="i">
          <div
            v-if="visibleIndices.includes(i)"
            :data-phone-idx="i"
            :style="mobileStyle(i)"
            :class="reorder.dragSrc.value === i ? 'cursor-grabbing' : 'cursor-grab'"
            @pointerdown="reorder.pointerDown($event, i)"
           @pointermove="reorder.pointerMove($event)"
            @pointerup="reorder.pointerUp(i, emit)"
            @pointercancel="reorder.dragSrc.value = null"
            @pointerenter="hovered = i"
            @pointerleave="hovered = null"
          >
            <div class="absolute inset-0 rounded-[22px] border-[3px] border-zinc-600/80 bg-zinc-800 shadow-xl shadow-black/40"/>
            <div class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-zinc-700 z-10"/>
            <div class="absolute inset-[4px] rounded-[18px] overflow-hidden bg-zinc-950">
              <img loading="lazy" :src="img" :alt="alt" class="w-full h-full object-cover"/>
            </div>
            <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-600/70 z-10"/>
          </div>
        </template>

        <div v-if="count > 1" class="absolute bottom-[-18px] left-1/2 -translate-x-1/2 flex gap-1">
          <div v-for="(_, i) in images" :key="i"
            class="rounded-full transition-all duration-300 cursor-pointer"
            :class="active === i ? 'w-3 h-1.5 bg-white/70' : 'w-1.5 h-1.5 bg-white/25'"
            @click="active = i"
          />
        </div>
      </div>
    </template>

  </div>
</template>