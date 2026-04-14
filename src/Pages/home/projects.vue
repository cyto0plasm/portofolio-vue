<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '../../Stores/home-store'
import { useLayoutStore } from '../../Stores/layout-store'
import { useI18n } from 'vue-i18n'
import Devider from '../../Components/devider.vue'
import ProjectCard from '@/Components/project-card.vue'
import ProjectComments from '@/Components/project-comments.vue'
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useScroll } from '../../composables/useScrollReveal.js'

const { targetRef: projectsIntroRef, isVisible: introVisible, direction: introDirection }
  = useScroll({ threshold: 0.02 })

const { t, locale } = useI18n()
const { projects } = storeToRefs(useHomeStore())
const { preferedColor } = storeToRefs(useLayoutStore())

const openCommentSlug = ref(null)

const typeLabel = computed(() => {
  const isAr = locale.value === 'ar'
  return {
    web:     isAr ? 'موقع ويب' : 'Web Site',
    desktop: isAr ? 'تطبيق سطح المكتب' : 'Desktop Application',
    mobile:  isAr ? 'تطبيق موبايل' : 'Mobile Application',
  }
})

const outerRef = ref(null)
const innerRef = ref(null)

let cardEls = []
let ticking  = false
let vh       = window.innerHeight
let total    = 0

// Lerp — decouples scroll events from rendering, smooth on all devices
let currentTy = []
let targetTy  = []
let rafId     = null
const LERP    = 0.14  // tweak: higher = snappier, lower = more glide

function cache() {
  if (!innerRef.value) return
  cardEls   = Array.from(innerRef.value.querySelectorAll('.stack-card'))
  total     = projects.value.length
  currentTy = Array(total).fill(0)
  targetTy  = Array(total).fill(0)

  cardEls.forEach((el, i) => {
    el.style.willChange = 'transform'
    const ty = i === 0 ? 0 : 100
    currentTy[i] = targetTy[i] = ty
    el.style.transform = `translate3d(0,${ty}%,0)`
  })
}

const isPinned = ref(false)
const isAfter  = ref(false)

function computeTargets() {
  if (!outerRef.value) return

  const rectTop  = outerRef.value.getBoundingClientRect().top
  const scrolled = -rectTop
  const pinRange = (total - 1) * vh

  isPinned.value = scrolled >= 0 && scrolled < pinRange
  isAfter.value  = scrolled >= pinRange

  if (scrolled < 0) return

  const active = Math.floor(scrolled / vh)

  for (let i = 0; i < total; i++) {
    if (i < active - 1 || i > active + 2) continue

    if (i === 0) {
      targetTy[i] = 0
    } else {
      const start    = (i - 1) * vh
      let   progress = (scrolled - start) / vh
      if (progress < 0) progress = 0
      if (progress > 1) progress = 1
      targetTy[i] = 100 - progress * 100
    }
  }
}

function animateLoop() {
  let stillMoving = false

  for (let i = 0; i < cardEls.length; i++) {
    const diff = targetTy[i] - currentTy[i]

    if (Math.abs(diff) < 0.02) {
      currentTy[i] = targetTy[i]
    } else {
      currentTy[i] += diff * LERP
      stillMoving = true
    }

    cardEls[i].style.transform = `translate3d(0,${currentTy[i]}%,0)`
  }

  rafId = stillMoving ? requestAnimationFrame(animateLoop) : null
}

function kickAnimate() {
  if (!rafId) rafId = requestAnimationFrame(animateLoop)
}

function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    computeTargets()
    kickAnimate()
    ticking = false
  })
}

function onResize() {
  vh = window.innerHeight
  computeTargets()
}

onMounted(() => {
  nextTick(() => {
    cache()
    computeTargets()
    kickAnimate()
  })
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<template>
  <section
    id="projects"
    ref="projectsIntroRef"
    class="projects-section reveal-wrap relative"
    :class="{ visible: introVisible }"
    :data-dir="introDirection ?? 'down'"
  >
    <div class="section-top-fade" aria-hidden="true"></div>

    <div v-if="projects.length">
      <div data-section id="projectHeader" class="mt-4 mb-4 max-w-6xl mx-auto p-6">
        <p class="reveal-item font-mono text-[0.65rem] tracking-widest uppercase text-gray-400 dark:text-zinc-500 mb-3" style="--i: 0">
          ${{ locale === 'ar' ? ' شغل / مشاريع' : ' work / projects' }}
          {{ projects.length ? ` (${projects.length})` : '' }}
        </p>
        <h2 class="reveal-item text-4xl font-bold tracking-tight leading-none mb-3" style="--i: 1">
          <span class="text-gray-700 dark:text-gray-200">{{ t('projects.h1') }} </span>
          <span :style="{ color: preferedColor }">{{ t('projects.h2') }}</span>
        </h2>
        <p class="reveal-item mt-3 text-zinc-500 dark:text-zinc-400 text-base max-w-md" style="--i: 2">
          {{ t('projects.desc') }}
        </p>
      </div>

      <div class="reveal-item" style="--i: 3">
        <Devider />
      </div>

      <div
        ref="outerRef"
        class="outer-scroll-wrapper"
        :style="{ height: `${projects.length * 100}vh` }"
      >
        <div
          ref="innerRef"
          class="inner-sticky"
          :class="{ 'is-fixed': isPinned, 'is-after': isAfter }"
        >
          <div
            v-for="(project, i) in projects"
            :key="project.id"
            :id="`project-${project.slug}`"
            class="stack-card bg-[#f5f2f2] dark:bg-[#262626]"
            :style="{ zIndex: i + 1 }"
          >
            <div class="card-scroll-inner">
              <ProjectCard
                :project="project"
                :type-label="typeLabel"
                :index="i"
                @open-comments="openCommentSlug = openCommentSlug === project.slug ? null : project.slug"
              />
              <ProjectComments
                :slug="project.slug"
                :force-open="openCommentSlug === project.slug"
              />
            </div>
          </div>
        </div>
      </div>

      <Devider />
    </div>

    <div v-else class="min-h-[20vh] flex items-center justify-center text-gray-500 dark:text-gray-200">
      Empty Projects
    </div>
  </section>
</template>

<style scoped>
.reveal-wrap[data-dir="down"] { --from: 28px; }
.reveal-wrap[data-dir="up"]   { --from: -28px; }
.reveal-item {
  opacity: 0;
  transform: translateY(var(--from, 28px));
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 80ms);
}
.reveal-wrap.visible .reveal-item { opacity: 1; transform: none; }

.outer-scroll-wrapper { position: relative; }

.inner-sticky { position: absolute; top: 0; left: 0; right: 0; height: 100vh; overflow: hidden; }
.inner-sticky.is-fixed { position: fixed; top: 0; left: 0; right: 0; height: 100vh; }
.inner-sticky.is-after { position: absolute; top: auto; bottom: 0; }

.stack-card {
  position: absolute;
  inset: 0;
  backface-visibility: hidden; /* promotes to GPU layer */
}

.card-scroll-inner { width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; overflow-y: hidden; }
</style>