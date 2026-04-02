<template>
  <Transition name="loader-fade" @after-leave="onAfterLeave">
    <div class="bg-[#f6f4f4] dark:bg-[#262626] " v-if="visible" id="loader" :class="{ 'cut-complete': cutComplete }">
      <div class="scene">
        <div class="sword-wrap">
          <div class="sword">
            <div class="blade"></div>
            <div class="tsuba"></div>
            <div class="tsuka"></div>
          </div>
        </div>

        <div class="dummy-wrap">
          <div class="dummy-top">
            <div class="cut-line"></div>
          </div>
          <div class="dummy-bottom"></div>
          <div class="dummy-stake"></div>
        </div>

        <div class="slash"></div>

        <div class="loading-ui">
          <div class="loading-label text-gray-700 dark:text-gray-200 ">{{ t('loading') }}</div>
          <div class="progress-track">
            <div class="progress-fill" :key="progressKey"></div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const {t} = useI18n()
const layout = useLayoutStore()
const router = useRouter()                    

const MIN_TIME = 600

const visible = ref(false)
const cutComplete = ref(false)
const progressKey = ref(0) // forces progress bar to re-animate on each load

let startTime = 0
let exitTimer1 = null
let exitTimer2 = null

function startEntry() {
  if (layout.loading) return
  layout.loading = true
  layout.pageReady = false
  startTime = performance.now()

  clearTimeout(exitTimer1)
  clearTimeout(exitTimer2)

  visible.value = true
  cutComplete.value = false
  progressKey.value++   // restart progress bar animation
}

function startExit() {
  if (!layout.loading) return
  layout.loading = false

  const elapsed = performance.now() - startTime
  const delay = Math.max(0, MIN_TIME - elapsed)

  cutComplete.value = true

  clearTimeout(exitTimer1)
  clearTimeout(exitTimer2)

  exitTimer1 = setTimeout(() => {
    visible.value = false  // triggers <Transition> leave
  }, delay)
}

function onAfterLeave() {
  // clean up after fade-out transition fully completes
  cutComplete.value = false
  layout.pageReady = true
}



const removeBeforeEach = router.beforeEach(() => {
  startEntry()
})

const removeAfterEach = router.afterEach(() => {
  startExit()
})
onMounted(() => {
  const initLoader = document.getElementById('init-loader')
  if (initLoader) {
    initLoader.style.opacity = '0'
    setTimeout(() => initLoader.remove(), 500)
  }

  // Show loader on initial page load
  requestAnimationFrame(() => requestAnimationFrame(() => {
    startEntry()
    setTimeout(() => { if (layout.loading) startExit() }, MIN_TIME)
  }))
})

onBeforeUnmount(() => {
  removeBeforeEach()   // ✅ Vue Router guards return an unregister function
  removeAfterEach()
  clearTimeout(exitTimer1)
  clearTimeout(exitTimer2)
})
</script>

<style scoped>
#loader {
  position: fixed;
  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.loading-label {
  font-size: 0.75rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  margin-bottom: 10px;
  font-family: monospace;

  /* typewriter */
  width: 7ch; /* exact width of "Loading" */
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.4);
  animation:
    typing 0.6s steps(7, end) forwards,
    caret 0.7s step-end infinite;
}



@keyframes typing {
  from { width: 0ch; }
  to   { width: 13ch; }
}

@keyframes caret {
  0%, 100% { border-color: rgba(255, 255, 255, 0.4); }
  50%       { border-color: transparent; }
}

.progress-track {
  width: 180px;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, #c8a96e, #7ecfff);
  animation: loadBar 0.8s ease-in-out forwards;
}

@keyframes loadBar {
  0%   { width: 0%; }
  100% { width: 100%; }
}

/* Let Vue's <Transition> handle the fade — cleaner than a CSS class toggle */
.loader-fade-leave-active {
  transition: opacity 0.6s ease-in;
}
.loader-fade-leave-to {
  opacity: 0;
}
</style>
