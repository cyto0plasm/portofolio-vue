<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  imagesSrc: { type: Array, default: () => [] },
  alt:       { type: String, default: '' },
  type:      { type: String, default: 'web' }
})

const hovered     = ref(null)
const active      = ref(0)
const images      = ref([])
const objectUrls  = ref([])
const containerRef = ref(null)
const touchStartX = ref(null)
const touchStartY = ref(null)
const touchEndX   = ref(null)

function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
  touchStartY.value = e.touches[0].clientY
}

function onTouchMove(e) {
  if (touchStartX.value === null) return
  const dx = Math.abs(e.touches[0].clientX - touchStartX.value)
  const dy = Math.abs(e.touches[0].clientY - touchStartY.value)
  if (dx > dy) e.preventDefault()
}

function onTouchEnd(e) {
  touchEndX.value = e.changedTouches[0].clientX
  const delta = touchEndX.value - touchStartX.value
  if (Math.abs(delta) < 50) return
  if (delta < 0) {
    active.value = (active.value + 1) % count.value
  } else {
    active.value = (active.value - 1 + count.value) % count.value
  }
  touchStartX.value = null
  touchStartY.value = null
}
function mobileStyle(i) {
  const positions = {
    1: [{ x: 0,    rotate:  0, scale: 1,    z: 20 }],
    2: [{ x: -80,  rotate: -6, scale: 0.88, z: 10 }, { x: 80,  rotate: 6, scale: 0.88, z: 10 }],
    3: [{ x: -115, rotate: -8, scale: 0.82, z: 10 }, { x: 0, rotate: 0, scale: 1, z: 20 }, { x: 115, rotate: 8, scale: 0.82, z: 10 }],
  }

  // Reorder so active is always at center slot
  const order = [...Array(count.value).keys()]
  const reordered = [
    ...order.filter(j => j < active.value),
    active.value,
    ...order.filter(j => j > active.value),
  ]
  const slot = reordered.indexOf(i)
  const pos = (positions[count.value] ?? positions[1])[slot]

  const isActive = i === active.value
  const isHovered = hovered.value === i

  const scale = isHovered && !isActive ? pos.scale * 1.06 : pos.scale
  const translateY = isHovered ? -14 : 0

  return {
    width: '140px',
    height: '290px',
    bottom: '0',
    left: `calc(50% - 70px + ${pos.x}px)`,
    zIndex: isHovered ? 30 : pos.z,
    transform: `translateY(${translateY}px) scale(${scale}) rotate(${pos.rotate}deg)`,
    transition: 'left 420ms cubic-bezier(0.34,1.4,0.64,1), transform 420ms cubic-bezier(0.34,1.4,0.64,1)',
    opacity: isActive ? 1 : 0.95,
  }
}
const buildImages = () => {
  objectUrls.value.forEach(url => URL.revokeObjectURL(url))
  objectUrls.value = []
  images.value = props.imagesSrc.slice(0, 3).map(img => {
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

onMounted(() => {
  containerRef.value?.addEventListener('touchmove', onTouchMove, { passive: false })
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('touchmove', onTouchMove)
  objectUrls.value.forEach(url => URL.revokeObjectURL(url))
})

const count  = computed(() => images.value.length)
// const mobile = computed(() => props.type === 'mobile')
const mobile = computed(() => {
//   console.log('[MultiImage] type prop:', props.type, '→ mobile:', props.type === 'mobile')
  return props.type === 'mobile'
})
// watch(() => props.type, (val) => {
//   console.log('[MultiImage] type prop changed to:', val)
// })
</script>

<template>
  <div class="w-full h-full flex flex-col gap-2">

    <!-- EMPTY STATE -->
    <div v-if="count === 0"
      class="w-full h-48 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-sm">
      No images
    </div>

    <!-- ── WEB LAYOUT ─────────────────────────────────────────── -->
    <template v-else-if="!mobile">

      <div class="rounded-xl overflow-hidden border border-zinc-700/60 bg-zinc-900 shadow-lg">

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

        <div class="relative overflow-hidden bg-zinc-950" style="height: 260px;">
          <template v-for="(img, i) in images" :key="i">
            <img
              loading="lazy"
              :src="img" :alt="alt"
              class="absolute inset-0 w-full h-full object-contain transition-all duration-500"
              :class="active === i ? 'opacity-100 translate-x-0' : i < active ? 'opacity-0 -translate-x-4' : 'opacity-0 translate-x-4'"
            />
          </template>

          <template v-if="count > 1">
            <button
            type="button"
              @click.stop="active = (active - 1 + count) % count"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
              </svg>
            </button>
            <button
            type="button"
              @click.stop="active = (active + 1) % count"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white transition-all hover:scale-110"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </template>

          <div v-if="count > 1"
            class="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-zinc-400 text-[10px] font-mono backdrop-blur-sm">
            {{ active + 1 }} / {{ count }}
          </div>
        </div>

      </div>
    </template>

   <!-- ── MOBILE LAYOUT ──────────────────────────────────────── -->
<template v-else>
  <div
    ref="containerRef"
    class="relative flex justify-center items-end w-full h-[360px]"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
    <div
      v-for="(img, i) in images" :key="i"
      class="absolute cursor-pointer will-change-transform"
      :style="mobileStyle(i)"
      @click.stop="active = i"
      @pointerenter="hovered = i"
      @pointerleave="hovered = null"
    >
      <div class="absolute inset-0 rounded-[22px] border-[3px] border-zinc-600/80 bg-zinc-800 shadow-xl shadow-black/40" />
      <div class="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-zinc-700 z-10" />
      <div class="absolute inset-[4px] rounded-[18px] overflow-hidden bg-zinc-950 flex items-center justify-center">
        <img loading="lazy" :src="img" :alt="alt" class="w-full h-full object-cover" />
      </div>
      <div class="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-zinc-600/70 z-10" />
    </div>
  </div>
</template>

  </div>
</template>
