<script setup>
defineEmits(['start-resize']);
</script>

<template>
  <div
    class="group h-4 flex items-center justify-center cursor-ns-resize
           bg-white/[0.015] border-b border-white/[0.04]
           hover:bg-emerald-400/5 transition-colors flex-shrink-0 z-10"
    aria-hidden="true"
    @mousedown.stop="$emit('start-resize', $event)"
   @touchstart.stop.prevent="$emit('start-resize', $event)"

  >
    <span class="flex gap-[3px]">
      <i
        v-for="n in 3" :key="n"
        class="block w-[18px] h-[1.5px] rounded-sm
               bg-white/10 group-hover:bg-emerald-400/40 transition-colors"
      />
    </span>
  </div>
</template>