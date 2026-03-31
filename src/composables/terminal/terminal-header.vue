<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLayoutStore } from '../../Stores/layout-store.js'
import { resolvePageKey } from './terminal-commands.js'

const layout = useLayoutStore()
const route  = useRoute()

const currentPageKey = computed(() => resolvePageKey(route.name ?? ''))

defineEmits(['clear'])
</script>

<template>
  <header
    class="flex items-center gap-3 px-4 py-[5px]
           bg-white/[0.02] border-b border-white/5
           flex-shrink-0 z-10"
    @click.stop
  >
    <!-- Traffic lights -->
    <div class="flex gap-1.5 items-center">
      <button
        class="w-[11px] h-[11px] rounded-full bg-[#ff5f57] hover:brightness-125 transition-all border-none"
        title="Close (Esc)"
        aria-label="Close terminal"
        @click="layout.terminalOpen = false"
      />
      <button
        class="w-[11px] h-[11px] rounded-full bg-[#febc2e] hover:brightness-125 transition-all border-none"
        title="Clear (Ctrl+L)"
        aria-label="Clear output"
        @click="$emit('clear')"
      />
      <span class="w-[11px] h-[11px] rounded-full bg-[#28c840] block" />
    </div>

    <!-- Title -->
    <span class="flex-1 text-center text-[12px] tracking-wide select-none">
      <span class="text-emerald-400">yousif</span>
      <span class="text-white/20">@</span>
      <span class="text-cyan-300">site</span>
      <span class="text-white/20"> — </span>
      <span class="text-amber-400">{{ currentPageKey }}</span>
    </span>

    <!-- Shortcut hints -->
    <div class="flex gap-1">
      <kbd
        v-for="k in ['Tab', '↑↓', 'Esc']"
        :key="k"
        class="text-[10px] px-1.5 py-0.5 rounded font-mono
               bg-white/[0.04] border border-white/[0.08] text-white/25"
      >{{ k }}</kbd>
    </div>
  </header>
</template>
