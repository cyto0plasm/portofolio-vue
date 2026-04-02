<script setup>
import { defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
// import { router } from '@inertiajs/vue3'
import { getCurrentInstance } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'
import { useSwipeScroll } from '../composables/useSwipeScroll'
import Loader       from '../Components/Loader.vue'
import LazyMount    from '../Components/lazy-mount.vue'
import Aside        from './aside.vue'
import Nav          from './nav.vue'
import ScrollButton from '@/Components/scrollButton.vue'
import { useRoute, useRouter } from 'vue-router'
import '../app.css'
import { useHead } from '@unhead/vue'
import Flash from '@/Components/flash.vue'

const isDev = import.meta.env.DEV

useHead({
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/images/favIconProtofolio2.ico'
    }
  ]
})

const router = useRouter()

const AmongUs       = defineAsyncComponent(() => import('../composables/among-us.vue'))
const Terminal      = defineAsyncComponent(() => import('@/Terminal/terminal.vue'))
// const SolarFollower = defineAsyncComponent(() => import('../Components/mouse/solar-follower.vue'))
const MouseLook = defineAsyncComponent(() => import('@/mouse/mouse-look.vue'))

const instance = getCurrentInstance()
useSwipeScroll(() => instance.appContext.config.globalProperties.$lenis)

const layout   = useLayoutStore()
const sections = ref([])
const user = ref({
  is_admin: false
})
const projects = ref([])


const detectSections = () => {
  const seen = new Set()
  const ids = Array.from(document.querySelectorAll('main [data-section]'))
    .filter(el => !el.closest('svg') && el.offsetHeight >= 50 && el.id && !seen.has(el.id) && seen.add(el.id))
    .map(el => el.id)

  if (ids.length) sections.value = ids
}

// Theme watcher
watch(() => layout.preferedColor, c => {
  document.documentElement.style.setProperty('--primary-color', c)
}, { immediate: true }) 

const route = useRoute()

watch(() => route.fullPath, async () => {
  sections.value = []
  await nextTick()
  setTimeout(detectSections, 300)
})
// const removeStart  = router.on('start', () => { layout.loading = true; sections.value = [] })
// const removeFinish = router.on('finish', () => {
//   layout.loading = false
//   window.scrollTo(0, 0)
//   nextTick(() => setTimeout(detectSections, 400))
// })

onMounted(() => {
  nextTick(detectSections)
  import('@/Terminal/terminal.vue') // preload chunk silently
})

// onUnmounted(() => { removeStart(); removeFinish() })
</script>

<template>
  <div class="min-h-screen w-full bg-[#f6f4f4] dark:bg-[#272727] text-gray-600 font-sans relative overflow-x-hidden">
<Flash />
    <Loader  />
    <Nav @toggle-aside="layout.toggleAside()" />
    <Aside />

       <main class="relative z-0">
      <router-view />
    </main>

    <!-- <main class="relative z-0"><slot /></main> -->
    <ScrollButton v-if="sections.length > 1" :sections="sections" :color="layout.preferedColor" />

    <LazyMount>
<MouseLook></MouseLook>
      <!-- <SolarFollower /> -->
      <AmongUs
        :role="user.is_admin ? 'admin' : 'user'"
      />
    </LazyMount>

    <Terminal v-if="layout.terminalOpen"
      :projects="projects"
  :role="user.is_admin ? 'admin' : 'user'" />
 <!-- <RouterLink
  v-if="isDev"
  to="/admin/projects"
  class="fixed bottom-5 left-5 z-[9999] bg-violet-600 hover:bg-violet-500 text-white font-mono text-[11px] px-3 py-1.5 rounded-md opacity-80 hover:opacity-100 transition-all"
>
  ⚙ admin
</RouterLink> -->
  </div>
</template>
