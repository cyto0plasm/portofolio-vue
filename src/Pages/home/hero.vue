<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useScroll } from '../../composables/useScrollReveal.js'
import { useLayoutStore } from '../../Stores/layout-store'
// import FloatingWords from '@/Components/floating-words.vue'
import Badges from '@/svg/badges.vue'
import MainButton from '@/Components/main-button.vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t ,locale} = useI18n()

const router = useRouter()
const goToContact = () => {
  router.push('/contact')
}
const firstName = computed(() => t('hero.fname'))
const lastName = computed(() => t('hero.lname'))
const role = computed(() => t('hero.subtitle'))

const tags = computed(() => [
  t('hero.laravel'),
  t('hero.vue'),
  t('hero.api')
])


const props = defineProps({
    preferedColor: { type: String, default: '#6ee7b7' },
    
    tags: { type: Array, default: () => ['Structure', 'Build', 'Maintain'] },
    available: { type: Boolean, default: true },
    photoSrc: { type: String, default: '/images/me.webp' },
})

const layout = useLayoutStore()
const openTerminal = () => { layout.terminalOpen = true }
const { targetRef: heroRef, isVisible, direction } = useScroll({ threshold: 0.05 })

// floating words
const FLOAT_WORDS = [
    'ecommerce', 'invoices', 'exporting', 'REST API', 'dashboard',
    'auth', 'reports', 'Docker', 'CI/CD', 'PostgreSQL',
    'webhooks', 'SaaS', 'billing', 'migrations', 'cron jobs',
    'queues', 'caching', 'OAuth', 'Stripe', 'multitenancy',
]
const floatWords = FLOAT_WORDS.map((w, i) => ({
    text: w,
    top:     `${8  + (i * 5.9)  % 84}%`,
    left: `${52 + (i * 11.3) % 44}%`,
    delay:   `${(i * 0.38) % 5}s`,
    dur:     `${7  + (i * 0.6)  % 5}s`,
    size:    `${0.58 + (i % 3) * 0.09}rem`,
   opacity: 0.025 + (i % 3) * 0.03,
}))

// cycling code lines
const CODE_LINES = [
    `const me = { role: "dev" }`,
    `git commit -m "available"`,
    `npm run build // ✓`,
    `while (true) { learn() }`,
    `<component :is="passion" />`,
]
const lineIdx    = ref(0)
const lineVisible = ref(true)
let timer = null
onMounted(() => {
    timer = setInterval(() => {
        lineVisible.value = false
        setTimeout(() => {
            lineIdx.value = (lineIdx.value + 1) % CODE_LINES.length
            lineVisible.value = true
        }, 300)
    }, 2600)
})

// pan / parallax
const PAN  = 14
const LERP = 0.072
const lerp = (a, b, t) => a + (b - a) * t

function usePan(cardRef) {
    const imgStyle  = ref({ transform: 'scale(1.15)', willChange: 'transform' })
    const isHovered = ref(false)
    const offset    = ref({ x: 0, y: 0 })
    let tx = 0, ty = 0, cx = 0, cy = 0, rafId = null, running = false

    function tick() {
        cx = lerp(cx, tx, LERP); cy = lerp(cy, ty, LERP)
        offset.value  = { x: cx, y: cy }
        imgStyle.value = { transform: `scale(1.15) translate(${cx}px,${cy}px)`, willChange: 'transform' }
        const done = Math.abs(tx - cx) < 0.01 && Math.abs(ty - cy) < 0.01
        if (done) { cx = tx; cy = ty; offset.value = { x: cx, y: cy }; running = false; rafId = null }
        else rafId = requestAnimationFrame(tick)
    }
    const start = () => { if (!running) { running = true; rafId = requestAnimationFrame(tick) } }

    const onMouseMove = (e) => {
        const el = cardRef.value; if (!el) return
        const { left, top, width, height } = el.getBoundingClientRect()
        tx = ((e.clientX - left) / width  * 2 - 1) * -PAN
        ty = ((e.clientY - top)  / height * 2 - 1) * -PAN
        start()
    }
    const onMouseLeave = () => { isHovered.value = false; tx = 0; ty = 0; start() }

    return {
        imgStyle, isHovered, offset,
        onMouseMove,
        onMouseEnter: () => { isHovered.value = true },
        onMouseLeave,
        destroy: () => { if (rafId) cancelAnimationFrame(rafId) },
    }
}

const desktopCard = ref(null)
const mobileCard  = ref(null)
const desktop     = usePan(desktopCard)
const mobile      = usePan(mobileCard)
onBeforeUnmount(() => { desktop.destroy(); mobile.destroy(); clearInterval(timer) })

const dots = Array.from({ length: 50 }, (_, i) => ({
    cx: (i % 5) * 10 + 5,
    cy: Math.floor(i / 5) * 18 + 9,
}))
const shiftColor = (color, darken = 10, desaturate = 10) => {
  return `
    color-mix(
      in hsl,
      ${color} ${80 - darken}%,
      black ${darken}%
    )
  `
}
</script>

<template>
    <section
        id="hero" data-section ref="heroRef"
        class="reveal-wrap section-wrap has-edge-glow relative min-h-svh flex items-center px-5 sm:px-8 lg:px-14 overflow-hidden"
        :class="{ visible: isVisible }"
        :data-dir="direction ?? 'down'"
        :style="{ '--glow-color': preferedColor }"
        aria-label="Hero introduction"
    >
 <!-- <FloatingWords :color="layout.preferedColor"></FloatingWords> -->





        <!-- <SentanceCramble /> -->

        <!-- ── main layout ───────────────────────────────────── -->
        <div class="relative z-10 w-full max-w-5xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 md:gap-10 lg:gap-14">

            <!-- TEXT -->
            <div class="flex flex-col gap-4 flex-1 min-w-0">

                <p v-if="available"
                   class="reveal-item m-0 flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400"
                   style="--i:0" aria-live="polite">
                    <Badges status="done" :size="28" />
                    {{ t('hero.avil') }}
                </p>

                <div class="flex items-center justify-start gap-6">
                    <h1 class="m-0 flex flex-col font-black leading-[0.9] tracking-tighter text-[clamp(2.5rem,8vw,5rem)]">
                        <span class="reveal-item text-gray-700 dark:text-gray-300" style="--i:1">{{ firstName }}</span>
                        <span class="reveal-item" :style="{ '--i': 2, color: preferedColor }">{{ lastName }}</span>
                    </h1>

                    <!-- mobile photo -->
                    <div class="reveal-item md:hidden shrink-0 self-center" style="--i:3" aria-hidden="true">
                        <div ref="mobileCard"
                            class="photo-frame relative w-[4.5rem] h-[5.5rem] sm:w-20 sm:h-24 rounded-xl overflow-hidden select-none cursor-crosshair"
                            @mousemove="mobile.onMouseMove" @mouseenter="mobile.onMouseEnter" @mouseleave="mobile.onMouseLeave">
                            <div class="absolute inset-0 rounded-xl rotate-3 opacity-30 pointer-events-none -z-10"
                                 :style="{ background: preferedColor }" />
                            <img :src="photoSrc" :alt="`${firstName} ${lastName}`"
                                class="w-full h-full object-cover object-top block rounded-xl ring-1 ring-gray-200 shadow-lg"
                                :style="mobile.imgStyle.value" loading="eager" decoding="async" draggable="false" />
                            <div class="absolute inset-0 rounded-xl pointer-events-none z-10 transition-opacity duration-300"
                                :class="mobile.isHovered.value ? 'opacity-100' : 'opacity-0'"
                                :style="{ boxShadow: `inset 0 0 0 2px ${preferedColor}66` }" />
                        </div>
                    </div>
                </div>

                <!-- role + terminal -->
                <div class="reveal-item flex flex-wrap items-center gap-4 lg:gap-8 " style="--i:4">
                    <span class="font-bold tracking-wide text-[clamp(0.9rem,2vw,1.25rem)]"
                          :style="{ color: preferedColor }">{{ role }}</span>
                    <button class="terminal-btn px-3 py-1.5 rounded border font-mono text-xs font-semibold cursor-pointer transition-transform hover:-translate-y-px"
                      :style="{ color: shiftColor(preferedColor, 10) }" @click="openTerminal" aria-label="Open terminal">
                        <span class="blink" aria-hidden="true">_</span> {{ t('buttons.terminal') }}
                    </button>
                </div>



            <!-- tags -->
<div class="reveal-item flex flex-col gap-4" style="--i:5">
  <div class="flex flex-col">
    <h2 class="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-100">
      {{ t('hero.h1') }}
    </h2>
    <p class="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-full sm:max-w-lg">
      {{ t('hero.h2') }}
    </p>
  </div>

  <div class="flex flex-col gap-2">
    <span class="text-[9px] sm:text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold">
      {{ t('hero.stack') }}
    </span>
    <ul class="flex flex-wrap gap-2 list-none p-0 m-0">
      <li v-for="(tag, i) in tags" :key="tag"
          class="reveal-item px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md border font-mono text-[10px] sm:text-xs
                 border-gray-200 dark:border-white/10
                 bg-white dark:bg-white/5
                 text-gray-600 dark:text-gray-300
                 hover:border-[#54debd] 
                 font-semibold  
                 hover:-translate-y-0.5 transition-all duration-300"
          :style="`--i:${6 + i}`">
        <span class="opacity-40">&lt;</span>{{ tag }}<span class="opacity-40">/&gt;</span>
      </li>
    </ul>
  </div>
</div>

             <!-- CTA -->
<div class="reveal-item flex flex-wrap items-center gap-3 mt-2" style="--i:8">
    <!-- Primary Button -->
    <RouterLink to="/projects"
   class="group relative text-white no-underline font-medium rounded-lg
          text-sm sm:text-base lg:text-lg
          px-4 py-2 sm:px-5 sm:py-2.5 lg:px-6 lg:py-3
          transition-all duration-200 ease-out
          hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
   :style="{ background: layout.preferedColor, boxShadow: `0 1px 2px 0 rgb(0 0 0 / 0.05)`, '--focus-ring': layout.preferedColor }">
    {{ t('hero.cta1') }}
</RouterLink>
    <MainButton @click="goToContact"  ></MainButton>

   


</div>
            </div>

            <!-- PHOTO (md+) -->
            <div class="reveal-item hidden md:flex md:items-center md:justify-center shrink-0" style="--i:3" aria-hidden="true">
                <slot name="model">
                    <div class="photo-scene relative flex items-center p-8 pl-8 cursor-crosshair"
                        @mousemove="desktop.onMouseMove"
                        @mouseenter="desktop.onMouseEnter"
                        @mouseleave="desktop.onMouseLeave">

                        <!-- dots -->
                        <svg class="absolute top-8 left-0 pointer-events-none"
                             width="52" height="182" xmlns="http://www.w3.org/2000/svg"
                             :style="{ transform: `translate(${desktop.offset.value.x * 0.25}px,${desktop.offset.value.y * 0.50}px)`, willChange: 'transform' }">
                            <circle v-for="(d, i) in dots" :key="i"
                                :cx="d.cx" :cy="d.cy" r="1.6" :fill="preferedColor" opacity="0.10" />
                        </svg>

                        <!-- cycling code line -->
                        <span class="code-line absolute top-1.5 left-12 font-mono text-xs pointer-events-none select-none"
                            :class="lineVisible ? 'opacity-[0.65] blur-0' : 'opacity-0 blur-sm'"
                            :style="{
                                color: preferedColor,
                                transform: `translate(${desktop.offset.value.x * 0.90}px,${desktop.offset.value.y * 0.30}px)`,
                                transition: 'opacity .28s ease, filter .28s ease, transform .05s linear',
                                willChange: 'transform, opacity, filter',
                            }">
                            {{ CODE_LINES[lineIdx] }}
                        </span>

                        <!-- photo card -->
                        <div ref="desktopCard"
                            class="photo-frame relative w-44 h-52 md:w-52 md:h-64 lg:w-80 lg:h-96 rounded-2xl overflow-hidden select-none cursor-crosshair">
                            <div class="absolute inset-0 rounded-2xl rotate-3 opacity-30 pointer-events-none -z-10"
                                 :style="{ background: preferedColor }" />
                            <img :src="photoSrc" :alt="`${firstName} ${lastName}`"
                                class="w-full h-full object-cover object-top block rounded-2xl ring-1 ring-gray-200 shadow-xl"
                                :style="desktop.imgStyle.value" loading="eager" decoding="async" draggable="false" />
                            <div class="absolute inset-0 rounded-2xl pointer-events-none z-10 transition-opacity duration-300"
                                :class="desktop.isHovered.value ? 'opacity-100' : 'opacity-0'"
                                :style="{ boxShadow: `inset 0 0 0 2px ${preferedColor}66` }" />
                            <div class="absolute -top-5 -right-5 z-20"><slot name="toy" /></div>
                        </div>

                        <!-- status pill -->
                        <!-- <div class="absolute bottom-1.5 left-5 flex items-center gap-2 font-mono text-[0.65rem]
                                    px-3 py-1.5 rounded-full border backdrop-blur-sm pointer-events-none"
                            :style="{
                                '--c': preferedColor,
                                borderColor: `color-mix(in srgb, ${preferedColor} 22%, transparent)`,
                                background:  `color-mix(in srgb, ${preferedColor} 5%,  transparent)`,
                                transform: `translate(${desktop.offset.value.x * 0.18}px,${desktop.offset.value.y * 0.18}px)`,
                                willChange: 'transform',
                                transition: 'transform .05s linear',
                            }">
                            <span class="relative flex h-[7px] w-[7px] shrink-0">
                                <span class="ping absolute inset-0 rounded-full" :style="{ background: preferedColor }" />
                                <span class="relative h-full w-full rounded-full block" :style="{ background: preferedColor }" />
                            </span>
                            <span class="text-gray-400">
                                git commit -m <span :style="{ color: preferedColor }">"available"</span>
                            </span>
                        </div> -->

                    </div>
                </slot>
            </div>

        </div>
    </section>
</template>

<style scoped>
/* ── reveal ───────────────────────────────────────────────── */
.reveal-wrap[data-dir="down"] { --from:  28px; }
.reveal-wrap[data-dir="up"]   { --from: -28px; }
.reveal-item {
    opacity: 0;
    transform: translateY(var(--from, 28px));
    transition: opacity .55s cubic-bezier(.22,1,.36,1),
                transform .55s cubic-bezier(.22,1,.36,1);
    transition-delay: calc(var(--i, 0) * 80ms);
}
.reveal-wrap.visible .reveal-item { opacity: 1; transform: none; }

/* ── photo perf ───────────────────────────────────────────── */
.photo-frame, .photo-frame img { will-change: transform; }

/* ── terminal button ──────────────────────────────────────── */
.terminal-btn {
    color: var(--c);
    border-color: color-mix(in srgb, var(--c) 35%, transparent);
    background:   color-mix(in srgb, var(--c) 7%,  transparent);
}
.terminal-btn:hover { background: color-mix(in srgb, var(--c) 15%, transparent); }
.blink { animation: blink 1.1s step-end infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* ── ping dot ─────────────────────────────────────────────── */
@keyframes ping { 75%, 100% { transform: scale(2.2); opacity: 0; } }
.ping { animation: ping 1.5s cubic-bezier(0,0,.2,1) infinite; }

/* ── floating words ───────────────────────────────────────── */
@keyframes wordFloat {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-12px); }
}
.float-word { animation: wordFloat ease-in-out infinite; }
</style>
