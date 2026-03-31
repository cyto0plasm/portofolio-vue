<!-- components/ToggleSwitch.vue -->
<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  size: {
    type: String,
    default: 'md' // 'sm' | 'md' | 'lg'
  }
})

const emit = defineEmits(['update:modelValue'])

const sizes = {
  sm: { trackW: 36, trackH: 20, thumbSize: 14, gap: 3 },
  md: { trackW: 52, trackH: 28, thumbSize: 20, gap: 4 },
  lg: { trackW: 68, trackH: 36, thumbSize: 26, gap: 5 },
}

const s = computed(() => sizes[props.size])

const thumbTranslate = computed(() => {
  const { trackW, thumbSize, gap } = s.value
  return props.modelValue ? `${trackW - thumbSize - gap * 2}px` : '0px'
})

// Derive a slightly darker shade for inner shadow depth
const darken = (hex, amt = 40) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, (n >> 16) - amt)
  const g = Math.max(0, ((n >> 8) & 0xff) - amt)
  const b = Math.max(0, (n & 0xff) - amt)
  return `rgb(${r},${g},${b})`
}

const trackStyle = computed(() => ({
  width: `${s.value.trackW}px`,
  height: `${s.value.trackH}px`,
  padding: `${s.value.gap}px`,
  backgroundColor: props.modelValue ? props.color : 'transparent',
  borderColor: props.modelValue ? props.color : 'rgba(120,120,140,0.3)',
  boxShadow: props.modelValue
    ? `inset 0 2px 6px ${darken(props.color, 60)}55, 0 0 0 1px ${darken(props.color, 20)}44, 0 1px 3px rgba(0,0,0,0.3)`
    : 'inset 0 2px 4px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.06)',
}))

const thumbStyle = computed(() => ({
  width: `${s.value.thumbSize}px`,
  height: `${s.value.thumbSize}px`,
  transform: `translateX(${thumbTranslate.value})`,
  boxShadow: props.modelValue
    ? `0 2px 8px ${darken(props.color, 30)}88, 0 1px 2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.5)`
    : '0 2px 6px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.6)',
}))

const glowStyle = computed(() => ({
  opacity: props.modelValue ? 1 : 0,
  background: `radial-gradient(ellipse at 30% 40%, ${props.color}55 0%, transparent 70%)`,
}))
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    @click="emit('update:modelValue', !modelValue)"
    class="toggle-track"
    :style="trackStyle"
  >
    <!-- Ambient glow layer -->
    <span class="toggle-glow" :style="glowStyle" />

    <!-- Noise/grain texture overlay -->
    <span class="toggle-grain" />

    <!-- Thumb -->
    <span class="toggle-thumb" :style="thumbStyle">
      <!-- Thumb inner highlight -->
      <span class="toggle-thumb-shine" />

      <!-- Active state: subtle icon -->
      <svg
        v-if="modelValue"
        class="toggle-icon"
        viewBox="0 0 10 10"
        fill="none"
      >
        <path d="M2 5.5L4 7.5L8 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </button>
</template>

<style scoped>
.toggle-track {
  position: relative;
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  border: 1px solid;
  cursor: pointer;
  outline: none;
  transition:
    background-color 280ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 280ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.toggle-track:focus-visible {
  outline: 2px solid v-bind(color);
  outline-offset: 3px;
}

/* Glow */
.toggle-glow {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  transition: opacity 280ms ease;
}

/* Grain texture via SVG filter */
.toggle-grain {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 80px 80px;
  mix-blend-mode: overlay;
}

/* Thumb */
.toggle-thumb {
  position: relative;
  border-radius: 9999px;
  background: linear-gradient(160deg, #ffffff 0%, #e8e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 280ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  z-index: 1;
}

/* Thumb inner shine */
.toggle-thumb-shine {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.7) 0%,
    rgba(255, 255, 255, 0) 55%
  );
  pointer-events: none;
}

/* Check icon */
.toggle-icon {
  width: 55%;
  height: 55%;
  color: v-bind(color);
  opacity: 0.85;
  position: relative;
  z-index: 1;
  animation: icon-pop 200ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes icon-pop {
  from { transform: scale(0.4); opacity: 0; }
  to   { transform: scale(1);   opacity: 0.85; }
}
</style>
