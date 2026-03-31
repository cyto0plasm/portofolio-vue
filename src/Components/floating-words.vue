<script setup>
defineProps({ color: { type: String, default: '#6ee7b7' } })

const WORDS = [
  'ecommerce','invoices','REST API','dashboard','auth',
  'reports','CI/CD','webhooks','SaaS','billing',
  'queues','caching','OAuth','multitenancy','migrations',
  'Docker','Stripe','PostgreSQL','cron jobs','microservices',
]

// Spread evenly across the full viewport using golden-ratio-ish offsets
const words = WORDS.map((text, i) => ({
  text,
  top:     `${(i * 13.7) % 90 + 3}%`,
  left:    `${(i * 17.3) % 88 + 2}%`,
  delay:   `${(i * 0.6)  %  6}s`,
  dur:     `${6 + (i * 0.8) % 5}s`,
  size:    `${0.58 + (i % 3) * 0.08}rem`,
  opacity:  0.03 + (i % 4) * 0.015,
}))
</script>

<template>
  <div class="fixed inset-0 pointer-events-none overflow-hidden" style="z-index:0" aria-hidden="true">
    <span
      v-for="(w, i) in words" :key="i"
      class="absolute font-mono whitespace-nowrap select-none"
      :style="{
        top: w.top,
        left: w.left,
        fontSize: w.size,
        opacity: w.opacity,
        color,
        animation: `fw-float ${w.dur} ${w.delay} ease-in-out infinite`,
      }"
    >{{ w.text }}</span>
  </div>
</template>

<style>
@keyframes fw-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-14px); }
}
</style>
