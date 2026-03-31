<script setup>
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '../Stores/layout-store'
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
// import { Link } from '@inertiajs/vue3'

const props = defineProps({
  label: { type: String, required: true },
  href: { type: String, default: '#' },
  delete: { type: Boolean, default: false },
  active: { type: Boolean, default: false }
})

const layout = useLayoutStore()
const { preferedColor } = storeToRefs(layout)
const hovered = ref(false)
</script>

<template>
  <RouterLink 
    preserve-scroll
    :to="href"
    class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border font-mono text-sm font-medium transition-all duration-200 hover:-translate-y-px active:translate-y-0 active:scale-95 no-underline"
    :class="[
      props.delete
        ? 'hover:!text-red-500 dark:hover:!text-red-400'
        : '',
      props.active
        ? 'border-[color-mix(in_srgb,var(--accent)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] text-gray-900 dark:text-gray-100'
        : 'border-transparent text-gray-800 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:border-[color-mix(in_srgb,var(--accent)_30%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] bg-[color-mix(in_srgb,var(--accent)_3%,transparent)] shadow-sm'
    ]"
    :style="{ '--accent': preferedColor }"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
  >
    <span
      class="text-[0.7rem] font-bold w-4 transition-all duration-200 group-hover:translate-x-0.5"
      :style="{ color: preferedColor }"
    >{{ hovered || active ? '>' : '//' }}</span>

    <span>{{ label }}</span>

    <!-- underline bar -->
    <span
      class="absolute bottom-0 left-3 right-3 h-px rounded-full origin-left transition-transform duration-300"
      :class="active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'"
      :style="{ background: preferedColor }"
    />
  </RouterLink>
</template>
