<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import ButtonBounce from '../Components/button-bounce.vue'
import DarkMode from '../Components/dark-mode.vue'
import { useLayoutStore } from '../Stores/layout-store.js'
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/Components/lang-switcher.vue'

defineEmits(['toggleAside'])

const layout = useLayoutStore()
const router = useRouter()
const route  = useRoute()
const { t ,locale} = useI18n()


// ── Links (no backend = no auth/admin separation) ──────────────────────────
const links = computed(() => [
  { label: t('nav.home'),     to: '/' },
  { label: t('nav.projects'), to: '/projects' },
  { label: t('nav.contact'),  to: '/contact' },
])

// ── Active state via Vue Router ────────────────────────────────────────────
const isActive = (to) => {
  return to === '/'
    ? route.path === '/'
    : route.path.startsWith(to)
}

// ── Hide nav on scroll down ────────────────────────────────────────────────
const showNav = ref(true)
let lastScroll = 0

const handleScroll = () => {
  const current = window.scrollY
  if (Math.abs(current - lastScroll) < 8) return
  showNav.value = !(current > lastScroll && current > 80)
  lastScroll = current
}

onMounted(()  => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-300 ease-in"
    enter-from-class="-translate-y-full opacity-0"
    leave-to-class="-translate-y-full opacity-0"
  >
    <nav
      v-if="showNav"
      class="fixed top-0 left-0 w-full flex items-center justify-between px-6 sm:px-10 lg:px-14 py-4 z-50
             border-b border-gray-200/60 dark:border-white/10
             bg-white/80 dark:bg-[#1e1e1e]/85 backdrop-blur-md shadow-sm"
    >
      <!-- Logo -->
      <RouterLink to="/" class="group flex items-center gap-0 no-underline select-none">
        <span class="text-[1.1rem] font-semibold tracking-tight transition-colors duration-200" :style="{ color: layout.preferedColor }">{{ t('nav.logo1') }}&nbsp;</span>
        <span class="text-[1.1rem] font-semibold tracking-tight text-gray-800 dark:text-white/90">{{ t('nav.logo2') }} </span>
      </RouterLink>

      <!-- Nav links -->
      <ul class="hidden md:flex items-center gap-1 list-none m-0 p-0">
        <li v-for="item in links" :key="item.label">
          <ButtonBounce :label="item.label" :href="item.to" :active="isActive(item.to)" />
        </li>
      </ul>

      <!-- Right actions -->
      <div class="flex items-center gap-2">
        <a href="/resume.pdf" download="Youssef-Zaki_CV.pdf"
           class="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                  text-xs font-medium transition-all duration-200
                  border border-gray-200 dark:border-white/15
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98]">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('nav.cv') }}
        </a>

        <span class="hidden md:block w-px h-4 bg-gray-200 dark:bg-white/10" />
        <LangSwitcher class="hidden md:block" />
        <DarkMode class="hidden md:block" />

        <button @click="layout.toggleAside()"
                class="w-9 h-9 flex items-center justify-center rounded-lg
                       border border-gray-200 dark:border-white/15
                       text-gray-600 dark:text-white/70
                       hover:bg-gray-100 dark:hover:bg-white/10
                       hover:scale-105 active:scale-90 transition-all duration-150 text-base"
                aria-label="Toggle menu">☰</button>
      </div>
    </nav>
  </transition>

  <!-- Floating menu button when nav is hidden -->
  <transition
    enter-active-class="transition duration-300"
    enter-from-class="opacity-0 scale-75"
    enter-to-class="opacity-100 scale-100"
  >
    <button
      v-if="!showNav && !layout.asideOpen"
      @click="layout.toggleAside()"
      class="fixed top-5 right-5 z-50 w-10 h-10 rounded-xl
             backdrop-blur-md bg-white/80 dark:bg-[#1e1e1e]/80
             border border-gray-200 dark:border-white/15
             text-gray-700 dark:text-white/80
             flex items-center justify-center
             hover:scale-110 active:scale-90
             shadow-md transition-all duration-150"
    >
      ☰
    </button>
  </transition>
</template>