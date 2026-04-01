<template>
  <button
    class="relative flex-shrink-0 rounded-full border-none cursor-pointer p-0 outline-none transition-all duration-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AF2CF] [-webkit-tap-highlight-color:transparent] [touch-action:manipulation]"
    :class="[sizeClasses.button, isDark
      ? 'bg-white/[0.04] shadow-[inset_4px_4px_10px_rgba(0,0,0,0.45),inset_-4px_-4px_10px_rgba(255,255,255,0.04),0_0_0_1px_rgba(255,255,255,0.08)]'
      : 'bg-[#dde0e8] shadow-[inset_4px_4px_10px_rgba(163,168,185,0.5),inset_-4px_-4px_10px_rgba(255,255,255,0.85)]']"
    @click="toggle"
    role="switch"
    :aria-checked="isDark"
    aria-label="Toggle dark mode"
  >
    <span
      class="absolute top-[4px] left-[4px] rounded-full flex items-center justify-center transition-all duration-[450ms] [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
      :class="[sizeClasses.thumb, isDark
        ? `${sizeClasses.translate} bg-gradient-to-br from-[#1e2535] to-[#252e3a] shadow-[2px_2px_6px_rgba(0,0,0,0.6),-2px_-2px_6px_rgba(255,255,255,0.04),0_0_10px_rgba(90,242,207,0.12)]`
        : 'translate-x-0 bg-[#f0f2f7] shadow-[2px_2px_10px_rgba(163,168,185,0.55),-2px_-2px_10px_rgba(255,255,255,0.9)]']"
    >
      <svg class="absolute transition-all duration-300" :class="[sizeClasses.icon, isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100']"
        viewBox="0 0 24 24" fill="none" stroke="#f0a500" stroke-width="2" stroke-linecap="round">
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
      <svg class="absolute transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]"
        :class="[sizeClasses.icon, isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50']"
        viewBox="0 0 24 24" fill="none" stroke="#5AF2CF" stroke-width="2" stroke-linecap="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    </span>
  </button>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'

const props = defineProps({
  localKey: { type: String, default: null },
  size:     { type: String, default: 'md' }, // 'sm' | 'md' | 'lg'
    responsive: { type: Boolean, default: false }

})

const emit = defineEmits(['update:modelValue'])
const layout = useLayoutStore()

const sizes = {
  sm: { button: 'w-12 h-6',  thumb: 'w-[18px] h-[18px]', translate: 'translate-x-6',      icon: 'w-2.5 h-2.5' },
  md: { button: 'w-16 h-8',  thumb: 'w-6 h-6',            translate: 'translate-x-8',      icon: 'w-3.5 h-3.5' },
  lg: { button: 'w-20 h-9',  thumb: 'w-7 h-7',            translate: 'translate-x-[44px]', icon: 'w-4 h-4'      },
}

const responsiveSizes = {
  button:    'w-12 h-6    sm:w-16 sm:h-8',
  thumb:     'w-[18px] h-[18px] sm:w-6 sm:h-6',
  translate: 'translate-x-6 sm:translate-x-8',
  icon:      'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5',
}
const sizeClasses = computed(() => props.responsive ? responsiveSizes : (sizes[props.size] ?? sizes.md))

const localDark = ref(true)
const isDark = computed({
  get: () => props.localKey ? localDark.value : layout.isDark,
  set: (val) => { if (props.localKey) localDark.value = val; else layout.isDark = val }
})

onMounted(() => {
  const key = props.localKey ?? 'theme'
  const saved = localStorage.getItem(key)
  isDark.value = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  if (!props.localKey) document.documentElement.classList.toggle('dark', isDark.value)
})

watch(isDark, (val) => {
  localStorage.setItem(props.localKey ?? 'theme', val ? 'dark' : 'light')
  if (!props.localKey) document.documentElement.classList.toggle('dark', val)
})

function toggle() {
  isDark.value = !isDark.value
  emit('update:modelValue', isDark.value)
}
</script>