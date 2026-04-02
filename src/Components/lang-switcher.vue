<script setup>
import CountryFlag from '@/svg/country-flag.vue'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t,  locale } = useI18n()
const open = ref(false)
const el   = ref(null)

const langs = [
  { code: 'en', country: 'uk', short: 'EN' },
  { code: 'ar', country: 'eg', short: 'AR' },
  { code: 'fr', country: 'fr', short: 'FR' },
  { code: 'es', country: 'es', short: 'ES' },
  { code: 'zh', country: 'cn', short: 'ZH' },
  { code: 'ja', country: 'jp', short: 'JA' },

]

const current = computed(() => langs.find(l => l.code === locale.value) ?? langs[0])

function select(code) {
  locale.value = code
  localStorage.setItem('lang', code)
  document.documentElement.dir  = code === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.lang = code
  open.value = false
}

function onClickOutside(e) {
  if (el.value && !el.value.contains(e.target)) open.value = false
}

onMounted(()  => document.addEventListener('mousedown', onClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', onClickOutside))
</script>

<template>
  <div ref="el" class="relative">

    <!-- Trigger -->
    <button
      @click="open = !open"
      class="flex items-center gap-1.5 h-7 px-2.5 rounded-lg text-xs font-medium
             border border-gray-200 dark:border-white/15
             bg-white/60 dark:bg-white/5
             text-gray-700 dark:text-white/80
             hover:bg-gray-100 dark:hover:bg-white/10
             hover:border-gray-300 dark:hover:border-white/25
             active:scale-95 transition-all duration-150 select-none"
      :aria-expanded="open"
      aria-haspopup="listbox"
    >
      <CountryFlag :country="current.country" />
      <span class="tracking-wide">{{ current.short }}</span>
      <svg
        class="w-3 h-3 text-gray-400 dark:text-white/40 transition-transform duration-200"
        :class="{ 'rotate-180': open }"
        viewBox="0 0 12 12" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"
      >
        <polyline points="2,4 6,8 10,4" />
      </svg>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-1"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-1"
    >
      <ul
  @wheel.stop
  v-if="open"
  role="listbox"
  style="scrollbar-width: thin; scrollbar-color: var(--primary-color, #6ee7b7) transparent;"

  class="absolute top-full mt-1.5 z-50 min-w-[130px]
         max-h-48 overflow-y-auto [&::-webkit-scrollbar]:w-px
         rounded-xl
         border border-gray-200/80 dark:border-white/10
         bg-white/90 dark:bg-[#1e1e1e]/95
         backdrop-blur-md shadow-lg shadow-black/10 dark:shadow-black/40
         list-none m-0 p-1"
>
        <li
          v-for="lang in langs"
          :key="lang.code"
          role="option"
          :aria-selected="lang.code === locale.value"
          @click="select(lang.code)"
          class="flex items-center gap-2.5 my-0.5 px-2.5 py-2 rounded-lg cursor-pointer
                 text-sm text-gray-700 dark:text-white/80
                 transition-colors duration-100"
          :class="lang.code === locale
            ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
            : 'hover:bg-gray-50 dark:hover:bg-white/5'"
        >
          <CountryFlag :country="lang.country"  />
          <span class="flex-1">{{ t(`langs.${lang.code}`) }}</span>
          <svg
            v-if="lang.code === locale"
            class="w-3.5 h-3.5 text-gray-500 dark:text-white/50"
            viewBox="0 0 12 12" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="2,6 5,9 10,3" />
          </svg>
        </li>
      </ul>
    </Transition>

  </div>
</template>
