<template>
  <button
    class="relative flex-shrink-0 w-16 h-8 sm:w-20 sm:h-9 rounded-full border-none cursor-pointer p-0 outline-none transition-all duration-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AF2CF] [-webkit-tap-highlight-color:transparent] [touch-action:manipulation]"
    :class="layout.isDark
      ? 'bg-white/[0.04] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.45),inset_-4px_-4px_10px_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.08)]'
      : 'bg-[#dde0e8] shadow-[inset_4px_4px_10px_rgba(163,168,185,0.5),inset_-4px_-4px_10px_rgba(255,255,255,0.85)]'"
    @click="toggle"
    role="switch"
    :aria-checked="layout.isDark"
    aria-label="Toggle dark mode"
  >
    <!-- Thumb -->
    <span
      class="absolute top-[4px] left-[4px] w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
      :class="layout.isDark
        ? 'translate-x-8 sm:translate-x-[44px] bg-gradient-to-br from-[#1e2535] to-[#252e3a] shadow-[2px_2px_6px_rgba(0,0,0,0.6),-2px_-2px_6px_rgba(255,255,255,0.04),0_0_10px_rgba(90,242,207,0.12)]'
        : 'translate-x-0 bg-[#f0f2f7] shadow-[2px_2px_10px_rgba(163,168,185,0.55),-2px_-2px_10px_rgba(255,255,255,0.9)]'"
    >
      <!-- Sun -->
      <svg
        class="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300"
        :class="layout.isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'"
        viewBox="0 0 24 24" fill="none" stroke="#f0a500"
        stroke-width="2" stroke-linecap="round"
      >
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2"  x2="12" y2="5"  />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2"  y1="12" x2="5"  y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </svg>

      <!-- Moon -->
      <svg
        class="absolute w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
        :class="layout.isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'"
        viewBox="0 0 24 24" fill="none" stroke="#5AF2CF"
        stroke-width="2" stroke-linecap="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'

const layout = useLayoutStore();


onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark') {
    layout.isDark = true
    document.documentElement.classList.add('dark')
  } else if (savedTheme === 'light') {
    layout.isDark = false
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    layout.isDark = prefersDark
    document.documentElement.classList.toggle('dark', prefersDark)
  }
})

watch(()=>layout.isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
})

function toggle() {
  layout.isDark = !layout.isDark
}
</script>
