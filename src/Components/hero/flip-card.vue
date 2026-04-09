<script setup>
/**
 * FlipCard.vue
 *
 * Front face : HeroCard (showcase panels)
 * Back face  : PhotoCard (photo + parallax)
 *
 * Flip mechanic
 *  - Mount → shows HeroCard (front)
 *  - After 3 s → auto-flips to PhotoCard (back)
 *  - Desktop: dblclick anywhere on the wrapper toggles flip
 *  - Mobile : single tap toggles flip (dblclick unreliable on touch)
 *  - Direction: LTR → slides + rotates left  (translateX negative then back)
 *               RTL → slides + rotates right (translateX positive then back)
 *  - Parallax active only when showing the photo face
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n }        from 'vue-i18n'
import HeroCard           from '@/Components/hero/hero-showcase.vue'
import PhotoCard          from '@/Components/hero/photo-card.vue'

const props = defineProps({
  photoSrc:      { type: String, default: '/images/me.webp' },
  preferedColor: { type: String, default: '#6ee7b7' },
  firstName:     { type: String, default: '' },
  lastName:      { type: String, default: '' },
})
 
const { locale } = useI18n()
const isRtl      = computed(() => locale.value === 'ar')
const dirSign    = computed(() => isRtl.value ? 1 : -1)
 
// flipped: false = HeroCard (front) | true = PhotoCard (back)
const flipped   = ref(false)
const animating = ref(false)
// flipDir: 'forward' (hero→photo) | 'backward' (photo→hero)
const flipDir   = ref('forward')
const showGlint = ref(false)
 
function flip() {
  if (animating.value) return
  animating.value = true
  flipDir.value   = flipped.value ? 'backward' : 'forward'
  flipped.value   = !flipped.value
 
  // glint fires at the 90° midpoint of the flip
  setTimeout(() => { showGlint.value = true  }, 220)
  setTimeout(() => { showGlint.value = false }, 420)
  setTimeout(() => { animating.value = false }, 700)
}
 
let autoTimer = null
onMounted(()   => { autoTimer = setTimeout(flip, 3000) })
onUnmounted(() => { clearTimeout(autoTimer) })
 
// ── Touch tap detection ───────────────────────────────────────────────────────
const touchStart = ref(null)
function onTouchStart(e) {
  touchStart.value = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }
}
function onTouchEnd(e) {
  if (!touchStart.value) return
  const dx = Math.abs(e.changedTouches[0].clientX - touchStart.value.x)
  const dy = Math.abs(e.changedTouches[0].clientY - touchStart.value.y)
  const dt = Date.now() - touchStart.value.t
  touchStart.value = null
  if (dx < 10 && dy < 10 && dt < 300) flip()
}
 
// ── Per-direction CSS vars injected on wrapper ────────────────────────────────
// forward:  leave slides in dirSign direction, enter comes from opposite
// backward: fully mirrored
const wrapperVars = computed(() => {
  const d = dirSign.value
  return {
    '--leave-x':  flipDir.value === 'forward'  ? `${d * 60}px`  : `${d * -60}px`,
    '--enter-x':  flipDir.value === 'forward'  ? `${d * -60}px` : `${d * 60}px`,
    '--leave-ry': flipDir.value === 'forward'  ? '90deg'        : '-90deg',
    '--enter-ry': flipDir.value === 'forward'  ? '-90deg'       : '90deg',
  }
})
</script>
 
<template>
  <div
    class="flip-wrapper"
    :style="wrapperVars"
    @dblclick="flip"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- glint sweep — fires at the 90° midpoint -->
    <Transition name="glint">
      <div v-if="showGlint" class="glint" :style="{ '--gc': preferedColor }" aria-hidden="true" />
    </Transition>
 
    <!-- FRONT: HeroCard -->
    <Transition name="card-flip">
      <div v-if="!flipped" key="front" class="flip-face">
        <HeroCard :photoSrc="photoSrc" :preferedColor="preferedColor" />
      </div>
    </Transition>
 
    <!-- BACK: PhotoCard -->
    <Transition name="card-flip">
      <div v-if="flipped" key="back" class="flip-face">
        <PhotoCard
          :photoSrc="photoSrc"
          :preferedColor="preferedColor"
          :firstName="firstName"
          :lastName="lastName"
        >
          <template #toy><slot name="toy" /></template>
        </PhotoCard>
      </div>
    </Transition>
  </div>
</template>
 
<style scoped>
.flip-wrapper {
  perspective: 1000px;
  position: relative;
  width: fit-content;
  height: fit-content;
}
 
.flip-face {
  backface-visibility: hidden;
  will-change: transform, opacity, filter;
}
 
/* ── LEAVE ───────────────────────────────────────────────────────────────── */
.card-flip-leave-active {
  transition:
    transform 0.28s cubic-bezier(.55, 0, 1, .45),
    opacity   0.18s ease 0.08s,
    filter    0.28s ease;
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}
.card-flip-leave-to {
  transform:
    translateX(var(--leave-x, -60px))
    rotateY(var(--leave-ry, 90deg))
    scale(0.88);
  opacity: 0;
  filter: blur(2px) brightness(1.4);
}
 
/* ── ENTER ───────────────────────────────────────────────────────────────── */
/* cubic-bezier overshoot at the end gives a satisfying spring snap */
.card-flip-enter-active {
  transition:
    transform 0.44s cubic-bezier(.22, 1.4, .36, 1) 0.28s,
    opacity   0.22s ease                            0.28s,
    filter    0.38s ease                            0.28s;
  z-index: 2;
}
.card-flip-enter-from {
  transform:
    translateX(var(--enter-x, 60px))
    rotateY(var(--enter-ry, -90deg))
    scale(0.88);
  opacity: 0;
  filter: blur(3px) brightness(1.6);
}
.card-flip-enter-to {
  transform: translateX(0) rotateY(0deg) scale(1);
  opacity: 1;
  filter: blur(0) brightness(1);
}
 
/* ── Glint sweep ─────────────────────────────────────────────────────────── */
.glint {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  border-radius: 18px;
  background: linear-gradient(
    105deg,
    transparent 30%,
    color-mix(in srgb, var(--gc, white) 55%, white) 50%,
    transparent 70%
  );
  background-size: 300% 100%;
  background-position: 100% 0;
}
.glint-enter-active {
  transition: background-position 0.2s ease, opacity 0.1s ease;
}
.glint-leave-active {
  transition: opacity 0.15s ease;
}
.glint-enter-from { background-position: 100% 0; opacity: 0; }
.glint-enter-to   { background-position:   0% 0; opacity: 1; }
.glint-leave-to   { opacity: 0; }
</style>