<template>
  <!-- WEBSITE -->
  <svg v-if="type === 'web'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="web-bg" cx="38%" cy="32%" r="68%">
        <stop offset="0%" stop-color="#0a1628"/>
        <stop offset="100%" stop-color="#020509"/>
      </radialGradient>
      <radialGradient id="web-shine" cx="35%" cy="28%" r="60%">
        <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="#60a5fa" stop-opacity="0"/>
      </radialGradient>
      <filter id="web-glow">
        <feGaussianBlur stdDeviation="1.8" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="web-clip"><circle cx="24" cy="24" r="18"/></clipPath>
    </defs>

    <!-- sphere body -->
    <circle cx="24" cy="24" r="19" fill="none" stroke="#3b82f6" stroke-width="0.4" opacity="0.2"/>
    <circle cx="24" cy="24" r="18" fill="url(#web-bg)"/>
    <circle cx="24" cy="24" r="18" fill="url(#web-shine)"/>

    <!-- meridian lines -->
    <g clip-path="url(#web-clip)" stroke="#3b82f6" stroke-width="0.55" fill="none" opacity="0.45">
      <ellipse cx="24" cy="24" rx="18" ry="18"/>
      <ellipse cx="24" cy="18" rx="14" ry="4.5"/>
      <ellipse cx="24" cy="30" rx="14" ry="4.5"/>
      <ellipse cx="24" cy="24" rx="7"  ry="18"/>
      <ellipse cx="24" cy="24" rx="13" ry="18"/>
      <line x1="24" y1="6"  x2="24" y2="42"/>
      <line x1="6"  y1="24" x2="42" y2="24"/>
    </g>

    <!-- ping glow -->
    <circle cx="24" cy="24" r="3.5" fill="#3b82f6" opacity="0.15" filter="url(#web-glow)">
      <animate attributeName="r"       values="3;6;3"           dur="2.2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0.15;0.28;0.15"  dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="24" cy="24" r="2.2" fill="#93c5fd" filter="url(#web-glow)"/>
    <circle cx="22.8" cy="22.8" r="0.7" fill="white" opacity="0.5"/>
  </svg>

  <!-- DESKTOP -->
  <svg v-else-if="type === 'desktop'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="desk-screen" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#1a2a1a"/>
        <stop offset="100%" stop-color="#060d06"/>
      </radialGradient>
      <filter id="desk-glow">
        <feGaussianBlur stdDeviation="1.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <clipPath id="desk-screen-clip">
        <rect x="6" y="7" width="36" height="24" rx="2"/>
      </clipPath>
    </defs>

    <!-- monitor bezel -->
    <rect x="5" y="6" width="38" height="26" rx="2.5" fill="#0f1a0f" stroke="#22c55e" stroke-width="0.6" opacity="0.9"/>

    <!-- screen -->
    <rect x="6" y="7" width="36" height="24" rx="2" fill="url(#desk-screen)"/>

    <!-- scanlines -->
    <g clip-path="url(#desk-screen-clip)" stroke="#22c55e" stroke-width="0.3" opacity="0.07">
      <line x1="6" y1="10" x2="42" y2="10"/>
      <line x1="6" y1="13" x2="42" y2="13"/>
      <line x1="6" y1="16" x2="42" y2="16"/>
      <line x1="6" y1="19" x2="42" y2="19"/>
      <line x1="6" y1="22" x2="42" y2="22"/>
      <line x1="6" y1="25" x2="42" y2="25"/>
      <line x1="6" y1="28" x2="42" y2="28"/>
    </g>

    <!-- terminal lines -->
    <rect x="14" y="16"   width="20" height="1.5" rx="0.5" fill="#22c55e" opacity="0.25"/>
    <rect x="14" y="19.5" width="13" height="1.5" rx="0.5" fill="#22c55e" opacity="0.18"/>
    <!-- blinking cursor -->
    <rect x="14" y="23" width="6" height="1.5" rx="0.5" fill="#4ade80" opacity="0.7">
      <animate attributeName="opacity" values="0.7;0;0.7" dur="1.1s" repeatCount="indefinite"/>
    </rect>

    <!-- stand -->
    <rect x="22" y="33" width="4" height="5"  rx="1"   fill="#0f1a0f" stroke="#22c55e" stroke-width="0.5" opacity="0.6"/>
    <rect x="15" y="38" width="18" height="3" rx="1.5" fill="#0f1a0f" stroke="#22c55e" stroke-width="0.5" opacity="0.6"/>

    <!-- status light -->
    <circle cx="9" cy="10" r="1" fill="#22c55e" opacity="0.5" filter="url(#desk-glow)">
      <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite"/>
    </circle>
  </svg>

  <!-- MOBILE -->
  <svg v-else-if="type === 'mobile'" :width="size" :height="size" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="mob-screen" cx="50%" cy="35%" r="70%">
        <stop offset="0%" stop-color="#1a0e1c"/>
        <stop offset="100%" stop-color="#06030a"/>
      </radialGradient>
      <filter id="mob-glow">
        <feGaussianBlur stdDeviation="1.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <!-- phone body -->
    <rect x="13" y="3" width="22" height="42" rx="4" fill="#0d0010" stroke="#a855f7" stroke-width="0.6" opacity="0.9"/>

    <!-- screen -->
    <rect x="14" y="4" width="20" height="40" rx="3.5" fill="url(#mob-screen)"/>

    <!-- notch -->
    <rect x="19" y="5.5" width="10" height="2.5" rx="1.25" fill="#0d0010"/>

    <!-- app grid -->
    <g fill="#a855f7" opacity="0.5">
      <rect x="18"   y="13" width="3.5" height="3.5" rx="0.8"/>
      <rect x="22.5" y="13" width="3.5" height="3.5" rx="0.8"/>
      <rect x="27"   y="13" width="3.5" height="3.5" rx="0.8"/>
      <rect x="18"   y="18" width="3.5" height="3.5" rx="0.8"/>
      <rect x="22.5" y="18" width="3.5" height="3.5" rx="0.8"/>
      <rect x="27"   y="18" width="3.5" height="3.5" rx="0.8"/>
    </g>

    <!-- content bars -->
    <rect x="17" y="25" width="14" height="1.5" rx="0.75" fill="#a855f7" opacity="0.3"/>
    <rect x="17" y="28" width="10" height="1.5" rx="0.75" fill="#a855f7" opacity="0.2"/>

    <!-- home indicator -->
    <rect x="20" y="38.5" width="8" height="1.5" rx="0.75" fill="#a855f7" opacity="0.4"/>

    <!-- signal ring -->
    <g filter="url(#mob-glow)">
      <circle cx="35" cy="10" r="3" fill="none" stroke="#c084fc" stroke-width="0.7" opacity="0.6">
        <animate attributeName="r"       values="2;5;2"     dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="35" cy="10" r="1.5" fill="#c084fc" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </g>
  </svg>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (v) => ['web', 'mobile', 'desktop'].includes(v),
  },
  size: {
    type: Number,
    default: 48,
  },
})
</script>

