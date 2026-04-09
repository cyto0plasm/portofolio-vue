<script setup>
import { computed, ref } from 'vue'
import DarkMode from '../Components/dark-mode.vue'
import { useLayoutStore } from '../Stores/layout-store.js'
import X from '@/svg/x.vue'
import CountryFlag from '@/svg/country-flag.vue'
import { useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LangSwitcher from '@/Components/lang-switcher.vue'

const route = useRoute()
const { locale, t } = useI18n()
const layout = useLayoutStore()
const showModeCommandText = ref(true)
const presetColors = ['#54debd', '#8ae68a', '#f59e0b', '#ef4444', '#8b5cf6']
const langOpen = ref(false)

const links = computed(() => [
  { label: t('nav.home'),     to: '/' },
  { label: t('nav.projects'), to: '/projects' },
  { label: t('nav.contact'), to: '/contact' },
])

const langs = [
  { code: 'en', label: 'English', country: 'uk', short: 'EN' },
  { code: 'ar', label: 'العربية', country: 'eg', short: 'AR' },
]

const currentLang = computed(() => locale.value)
const currentLangObj = computed(() => langs.find(l => l.code === locale.value) ?? langs[0])

const isActive = (to) => to === '/' ? route.path === '/' : route.path.startsWith(to)

function selectLang(code) {
  locale.value = code
  localStorage.setItem('lang', code)
  document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = code
  langOpen.value = false
}
</script>

<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-250 ease-out"
    leave-active-class="transition-opacity duration-200 ease-in"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div v-if="layout.asideOpen" class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" @click="layout.closeAside" />
  </Transition>

  <!-- Panel -->
  <aside class="fixed top-0 right-0 left-auto z-50 h-screen pointer-events-none [direction:ltr]">
    <Transition
      enter-active-class="transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      leave-active-class="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
    v-if="layout.asideOpen"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
    class="pointer-events-auto h-full flex flex-col
           w-[240px] sm:w-[270px]
           bg-[#f0f2f7] dark:bg-[#111318]
           border-l border-black/[0.08] dark:border-white/[0.07]
           shadow-[-8px_0_40px_rgba(0,0,0,0.10)]"
  >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 pt-4 pb-3">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ background: layout.getColor, boxShadow: `0 0 6px ${layout.getColor}80` }" />
            <span class="text-[0.72rem] font-semibold tracking-[0.08em] uppercase text-black/40 dark:text-white/30">
              {{ t('aside.theme') }}
            </span>
          </div>
          <button
            @click="layout.closeAside"
            class="flex items-center justify-center w-6 h-6 rounded-lg
                   border border-black/[0.08] dark:border-white/[0.08]
                   bg-black/[0.04] dark:bg-white/[0.04]
                   text-neutral-500 dark:text-neutral-400
                   hover:bg-black/[0.09] dark:hover:bg-white/[0.08]
                   hover:scale-105 transition-all duration-150"
          >
            <X />
          </button>
        </div>

        <div class="mx-3 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.07] to-transparent" />

        <!-- Scrollable content -->
        <div class="flex-1 overflow-y-auto flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          <!-- Color section -->
          <section class="flex flex-col gap-3 px-4 py-4">
            <div class="flex items-center gap-2">
              <div
                class="w-6 h-6 shrink-0 rounded-md flex items-center justify-center border"
                :style="{ background: `${layout.getColor}1a`, borderColor: `${layout.getColor}26`, color: layout.getColor }"
              >
                <svg class="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <circle cx="8" cy="8" r="6.5"/>
                  <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h2 class="text-[0.8rem] font-semibold text-neutral-900 dark:text-neutral-100">{{ t('aside.theme') }}</h2>
                <p class="text-[0.68rem] text-neutral-400 dark:text-neutral-500">Accent color scheme</p>
              </div>
            </div>

            <div class="flex items-center gap-2 pl-8">
              <input
                type="color"
                :value="layout.getColor"
                @input="layout.SetColor($event.target.value)"
                class="w-7 h-7 rounded-md border-[1.5px] border-black/[0.12] dark:border-white/[0.12]
                       p-0.5 cursor-pointer bg-transparent
                       [&::-webkit-color-swatch-wrapper]:p-0
                       [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-none"
              />
              <div class="flex gap-1.5">
                <button
                  v-for="c in presetColors" :key="c"
                  :style="{ backgroundColor: c, borderColor: layout.getColor === c ? 'white' : 'transparent', boxShadow: layout.getColor === c ? `0 0 0 2px ${c}` : 'none' }"
                  class="w-4 h-4 rounded-full border-2 hover:scale-125 transition-transform duration-150"
                  @click="layout.SetColor(c)"
                />
              </div>
            </div>
          </section>

          <div class="mx-3 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.07] to-transparent" />

          <!-- Dark Mode section -->
          <section class="px-4 py-3">
            <div class="flex items-center justify-between px-3 py-2.5 rounded-xl
                        bg-black/[0.03] dark:bg-white/[0.04]
                        border border-black/[0.06] dark:border-white/[0.06]
                        hover:bg-black/[0.05] dark:hover:bg-white/[0.07]
                        transition-colors duration-150">
              <div class="flex flex-col gap-0.5">
                <span class="text-[0.78rem] font-medium text-neutral-800 dark:text-neutral-200">
                  {{ t('aside.dark') }} Mode
                </span>
                <span
                  v-if="showModeCommandText"
                  @click="showModeCommandText = !showModeCommandText"
                  class="text-[0.65rem] text-neutral-400 dark:text-neutral-500 cursor-pointer"
                >{{ layout.isDark ? t('aside.light') : t('aside.dark') }}</span>
                <span
                  v-else
                  @click="showModeCommandText = !showModeCommandText"
                  class="text-[0.65rem] text-gray-500 font-mono cursor-pointer"
                ><span class="dark:text-yellow-400 text-yellow-600">mode </span>{{ layout.isDark ? 'light' : 'dark' }}</span>
              </div>
              <DarkMode size="sm" />
            </div>
          </section>

          <div class="mx-3 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.07] to-transparent" />

          <!-- Language section -->
          <section class="flex flex-col gap-1.5 px-4 py-3">
        <span class="text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-black/30 dark:text-white/25 mb-1">
          {{ t('aside.language') }}
        </span>
        <LangSwitcher  />
      </section>

          <div class="mx-3 h-px bg-gradient-to-r from-transparent via-black/[0.08] dark:via-white/[0.07] to-transparent" />

          <!-- Nav Links section -->
          <section class="flex flex-col gap-1.5 px-4 py-3">
            <span class="text-[0.65rem] font-semibold tracking-[0.08em] uppercase text-black/30 dark:text-white/25 mb-1">
              {{ t('aside.nav') }}
            </span>
            <RouterLink
              v-for="item in links" :key="item.label"
              :to="item.to"
              @click="layout.closeAside"
              class="flex items-center px-3 py-2 rounded-xl text-[0.82rem] font-medium border transition-all duration-150"
              :class="isActive(item.to)
                ? 'border-transparent text-white'
                : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06] text-neutral-700 dark:text-neutral-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.07]'"
              :style="isActive(item.to) ? { background: layout.getColor, borderColor: layout.getColor } : {}"
            >
              {{ item.label }}
            </RouterLink>

            <a
              href="/resume.pdf"
              download="Youssef-Zaki_CV.pdf"
              class="flex items-center gap-2 px-3 py-2 rounded-xl text-[0.82rem] font-medium border
                     bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.06]
                     text-neutral-700 dark:text-neutral-300
                     hover:bg-black/[0.06] dark:hover:bg-white/[0.07] transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {{ t('nav.cv') }}
            </a>
          </section>

        </div>

        <!-- Footer -->
        <div class="px-4 py-2.5 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-center">
          <span class="text-[0.65rem] tracking-wide text-neutral-400 dark:text-neutral-600">
            {{ t('aside.bmessage') }}
          </span>
        </div>
      </div>
    </Transition>
  </aside>
</template>