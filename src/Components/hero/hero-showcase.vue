<script setup>
/**
 * HeroCard.vue
 * Hero showcase — 4 panels: chat → dashboard → code → php (dummy)
 *
 * - Color + dark mode sourced from useLayoutStore (no color prop)
 * - PHP panel is fully static / unselectable dummy
 * - Auto-cycles every 3s; pauses while mouse is over the card
 * - Dark mode: `.dark` class bound on root → all Tailwind `dark:` variants respond
 * - i18n: uses useI18n() for ar / en
 *
 * Props:
 *   photoSrc – path to your headshot
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '@/Stores/layout-store'

const props = defineProps({
  photoSrc: { type: String, default: '/images/me.webp' },
})

// ── i18n ──────────────────────────────────────────────────────────────────────
const { t } = useI18n()

// ── Store ─────────────────────────────────────────────────────────────────────
const layout = useLayoutStore()
const color  = computed(() => layout.preferedColor)
const isDark = computed(() => layout.isDark)

// ── Panel navigation ──────────────────────────────────────────────────────────
const VIEWS   = ['chat', 'dashboard']
const current = ref(0)
const hovered = ref(false)

function go(i)  { current.value = i }
function next() { go((current.value + 1) % VIEWS.length) }
const view = computed(() => VIEWS[current.value])

let timer = null
onMounted(()   => { timer = setInterval(() => { if (!hovered.value) next() }, 3000) })
onUnmounted(() => clearInterval(timer))

// ── Dashboard data ────────────────────────────────────────────────────────────
const BARS = [32, 55, 40, 78, 60, 92, 68]
const DAYS = computed(() => [
  t('hero.dashboard.days.mon'),
  t('hero.dashboard.days.tue'),
  t('hero.dashboard.days.wed'),
  t('hero.dashboard.days.thu'),
  t('hero.dashboard.days.fri'),
  t('hero.dashboard.days.sat'),
  t('hero.dashboard.days.sun'),
])
const STATS = computed(() => [
  { label: t('hero.dashboard.stats.clients.label'),  val: '24+',   delta: t('hero.dashboard.stats.clients.delta'),  accent: true  },
  { label: t('hero.dashboard.stats.projects.label'), val: '80+',   delta: t('hero.dashboard.stats.projects.delta'), accent: false },
  { label: t('hero.dashboard.stats.uptime.label'),   val: '99.9%', delta: t('hero.dashboard.stats.uptime.delta'),   accent: true  },
  { label: t('hero.dashboard.stats.apis.label'),     val: '30+',   delta: t('hero.dashboard.stats.apis.delta'),     accent: false },
])
// ── Tech Stack (simple & human readable) ────────────────────────────────────
const STACK = {
  frontend: "Vue 3 + Tailwind",
  backend: "Laravel + PHP",
  api: "REST APIs",
  focus: "Dashboards & Business Tools"
}

// ── What I build ─────────────────────────────────────────────────────────────
const SERVICES = [
  "Admin dashboards",
  "Invoice systems",
  "Custom business tools",
  "APIs for web apps"
]

// ── Output feeling (what user gets) ──────────────────────────────────────────
const RESULT = "Fast, simple, custom systems that fit your business"

// ── Chat messages ─────────────────────────────────────────────────────────────
const MESSAGES = computed(() => [
  { from: 'in',  text: t('hero.chat.msg1'), time: '09:14' },
  { from: 'out', text: t('hero.chat.msg2'), time: '09:15' },
  { from: 'in',  text: t('hero.chat.msg3'), time: '09:15' },
  { from: 'out', text: t('hero.chat.msg4'), time: '09:16' },
])
</script>

<template>
  <div
    :class="[
      'relative flex flex-col w-44 h-52 md:w-52 md:h-64 lg:w-80 lg:h-96 overflow-hidden rounded-[18px] select-none cursor-pointer',
      { dark: isDark }
    ]"
    style="aspect-ratio: 5/6.5"
    @mouseenter="hovered = true"
    @mouseleave="hovered = false"
    @click.self="next"
  >

    <!-- Card shell -->
    <div
      class="absolute inset-0 rounded-[18px] pointer-events-none
             bg-white        dark:bg-zinc-900
             border border-black/[.08] dark:border-white/[.08]
             shadow-[0_2px_20px_rgba(0,0,0,.07)] dark:shadow-[0_2px_24px_rgba(0,0,0,.4)]"
      aria-hidden="true"
    />

    <!-- ── Tab bar ──────────────────────────────────────────────────────────── -->
    <div class="relative z-10 flex shrink-0 px-1
                border-b border-black/[.08] dark:border-white/[.08]
                bg-zinc-100 dark:bg-zinc-800">
      <button
        v-for="(v, i) in VIEWS" :key="v"
        class="flex flex-1 items-center justify-center gap-1
               border-0 border-b-2 border-transparent bg-transparent
               py-2 px-1 text-[9px] font-semibold uppercase tracking-[.04em]
               text-zinc-400 transition-colors duration-200 cursor-pointer"
        :class="{ 'text-zinc-800 dark:text-zinc-100': i === current }"
        :style="i === current ? { color: color, borderBottomColor: color } : {}"
        @click.stop="go(i)"
      >
        <!-- chat icon -->
        <svg v-if="v === 'chat'"
             width="9" height="9" viewBox="0 0 14 14" fill="currentColor">
          <path d="M2 1h10a1 1 0 011 1v6a1 1 0 01-1 1H7.5L4 12V9H2a1 1 0 01-1-1V2a1 1 0 011-1z"/>
        </svg>

        <!-- dashboard icon -->
        <svg v-else-if="v === 'dashboard'"
             width="9" height="9" viewBox="0 0 14 14" fill="currentColor">
          <rect x="1"   y="8" width="3" height="5" rx="1"/>
          <rect x="5.5" y="5" width="3" height="8" rx="1"/>
          <rect x="10"  y="2" width="3" height="11" rx="1"/>
        </svg>

        <!-- code icon -->
        <svg v-else-if="v === 'code'"
             width="9" height="9" viewBox="0 0 14 14" fill="none"
             stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 3L1 7l3 4M10 3l3 4-3 4"/>
        </svg>

        <!-- php icon -->
        <svg v-else-if="v === 'php'"
             width="9" height="9" viewBox="0 0 16 16" fill="none"
             :stroke="i === current ? color : 'currentColor'"
             stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 2l6 3.5v5L8 14l-6-3.5v-5L8 2z"/>
          <path d="M8 2v12M2 5.5l6 3.5 6-3.5"/>
        </svg>

        {{ t(`hero.tabs.${v}`) }}
      </button>
    </div>

    <!-- ── Panels ─────────────────────────────────────────────────────────── -->
    <Transition name="fade" mode="out-in">

      <!-- ── CHAT ─────────────────────────────────────────────────────────── -->
      <div v-if="view === 'chat'" key="chat"
           class="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">

        <div class="flex shrink-0 items-center justify-between px-3 py-2.5
                    border-b border-black/[.08] dark:border-white/[.08]
                    bg-zinc-100 dark:bg-zinc-800">
          <div class="flex items-center gap-2">
            <img
              :src="photoSrc"
              class="h-7 w-7 shrink-0 rounded-full object-cover object-top"
              :style="{ outline: `2px solid ${color}`, outlineOffset: '2px' }"
              :alt="t('hero.chat.altDev')"
            />
            <div>
              <div class="text-[11px] font-semibold text-zinc-800 dark:text-zinc-100">
                {{ t('hero.chat.available') }}
              </div>
              <div class="flex items-center gap-1 text-[9px] text-zinc-400">
                <span class="inline-block h-1.5 w-1.5 rounded-full" :style="{ background: color }"/>
                {{ t('hero.chat.online') }}
              </div>
            </div>
          </div>
          <span class="text-[9px] text-zinc-400">{{ t('hero.chat.role') }}</span>
        </div>

        <div class="flex flex-1 flex-col justify-end gap-1.5 overflow-hidden px-3 py-3 min-h-0">
          <div
            v-for="m in MESSAGES" :key="m.text"
            class="flex flex-col gap-0.5"
            :class="m.from === 'in' ? 'items-start' : 'items-end'"
          >
            <div
              class="max-w-[85%] rounded-2xl px-2.5 py-1.5 text-[10px] leading-relaxed
                     border border-black/[.08] dark:border-white/[.08]
                     bg-zinc-100 dark:bg-zinc-800
                     text-zinc-800 dark:text-zinc-200"
              :class="m.from === 'out' ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'"
              :style="m.from === 'out' ? { background: color, color: '#000', border: 'none' } : {}"
            >{{ m.text }}</div>
            <span class="text-[8.5px] text-zinc-400">{{ m.time }}</span>
          </div>
          <div class="text-right text-[8.5px] text-zinc-400">{{ t('hero.chat.delivered') }}</div>
        </div>

        <!-- Decorative input bar -->
        <div class="flex shrink-0 items-center gap-2 px-3 py-2
                    border-t border-black/[.08] dark:border-white/[.08]
                    bg-zinc-100 dark:bg-zinc-800">
          <div class="flex-1 rounded-full border border-black/[.08] dark:border-white/[.08]
                      bg-white dark:bg-zinc-700 px-3 py-1.5 text-[9.5px] text-zinc-400">
            {{ t('hero.chat.inputPlaceholder') }}
          </div>
          <div class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
               :style="{ background: color }">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M6 1l5 5-5 5" stroke="#000" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- ── DASHBOARD ─────────────────────────────────────────────────────── -->
      <div v-else-if="view === 'dashboard'" key="dash"
           class="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden gap-2 p-3">

        <div class="flex shrink-0 items-center gap-2">
          <img
            :src="photoSrc"
            class="h-8 w-8 shrink-0 rounded-full object-cover object-top"
            :style="{ outline: `2px solid ${color}`, outlineOffset: '2px' }"
            :alt="t('hero.chat.altDev')"
          />
          <div>
            <div class="text-[10px] font-bold text-zinc-800 dark:text-zinc-100">
              {{ t('hero.dashboard.title') }}
            </div>
            <div class="text-[8.5px] text-zinc-400">{{ t('hero.dashboard.subtitle') }}</div>
          </div>
        </div>

        <div class="grid shrink-0 grid-cols-2 gap-1.5">
          <div
            v-for="s in STATS" :key="s.label"
            class="flex flex-col gap-0.5 rounded-[10px] p-2.5
                   bg-zinc-100 dark:bg-zinc-800"
          >
            <div class="text-[9px] font-medium text-zinc-400">{{ s.label }}</div>
            <div class="text-[17px] font-bold"
                 :style="s.accent ? { color } : {}"
                 :class="!s.accent ? 'text-zinc-800 dark:text-zinc-100' : ''">
              {{ s.val }}
            </div>
            <div class="text-[9px] text-zinc-400">{{ s.delta }}</div>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 flex-col gap-2 rounded-[10px] p-2.5
                    bg-zinc-100 dark:bg-zinc-800">
          <div class="flex shrink-0 items-center justify-between">
            <span class="text-[9px] font-semibold uppercase tracking-[.04em] text-zinc-400">
              {{ t('hero.dashboard.weeklyOutput') }}
            </span>
            <span class="text-[9px] font-bold" :style="{ color }">↑ avg 72%</span>
          </div>
          <div class="flex min-h-0 flex-1 items-end gap-[3px]">
            <div
              v-for="(h, i) in BARS" :key="i"
              class="flex h-full flex-1 flex-col items-center justify-end gap-[3px] min-h-0"
            >
              <div
                class="w-full min-h-[3px] rounded-t-[3px] transition-all duration-500"
                :style="{
                  height: h + '%',
                  background: i === 5 ? color : `color-mix(in srgb, ${color} 22%, transparent)`
                }"
              />
              <span class="text-[8px] text-zinc-400">{{ DAYS[i] }}</span>
            </div>
          </div>
        </div>

        <div
          class="shrink-0 rounded-[9px] border px-2.5 py-1.5 text-[9px] font-semibold"
          :style="{
            color,
            borderColor: `color-mix(in srgb,${color} 30%,transparent)`,
            background:  `color-mix(in srgb,${color} 8%,transparent)`,
          }"
        >
          <svg class="inline mr-1 mb-[1px]" width="9" height="9" viewBox="0 0 12 12"
               fill="none" stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 6l3 3 5-5"/>
          </svg>
          {{ t('hero.dashboard.shipped') }}
        </div>
      </div>

      <!-- ── CODE ──────────────────────────────────────────────────────────── -->
      <div v-else-if="view === 'code'" key="code"
           class="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden">

        <div class="flex shrink-0 items-center gap-1.5 px-3 py-2
                    border-b border-black/[.08] dark:border-white/[.08]
                    bg-zinc-100 dark:bg-zinc-800">
          <span class="h-[7px] w-[7px] shrink-0 rounded-full bg-[#ff5f57]"/>
          <span class="h-[7px] w-[7px] shrink-0 rounded-full bg-[#ffbd2e]"/>
          <span class="h-[7px] w-[7px] shrink-0 rounded-full bg-[#28c840]"/>
          <span class="ml-1 font-mono text-[9px] font-bold" :style="{ color }">stack.config.js</span>
        </div>

        <div class="flex-1 overflow-hidden px-3.5 py-3 min-h-0">
          <pre class="m-0 whitespace-pre font-mono text-[10px] leading-[1.8]
                      text-zinc-800 dark:text-zinc-200"><code>{{ CODE }}</code></pre>
        </div>

        <div class="flex shrink-0 items-center gap-2.5 px-3 py-2
                    border-t border-black/[.08] dark:border-white/[.08]
                    bg-zinc-100 dark:bg-zinc-800">
          <img :src="photoSrc" class="h-8 w-8 shrink-0 rounded-full object-cover object-top" :alt="t('hero.chat.altDev')"/>
          <div>
            <div class="font-mono text-[9px] font-bold" :style="{ color }">
              <svg class="inline mr-1 mb-[1px]" width="9" height="9" viewBox="0 0 12 12"
                   fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 6l3 3 5-5"/>
              </svg>
              {{ t('hero.code.buildOk') }}
            </div>
            <div class="text-[8.5px] text-zinc-400">{{ t('hero.code.prodReady') }}</div>
          </div>
        </div>

        <div
          class="flex shrink-0 justify-between px-3 py-[3px] text-[8px] font-bold
                 tracking-[.02em] text-black/70"
          :style="{ background: color }"
        >
          <span>⎇ main</span><span>Vue 3 · Laravel</span><span>UTF-8</span>
        </div>
      </div>

      <!-- ── PHP DUMMY ──────────────────────────────────────────────────────── -->
      <!--
        Fully static / decorative. No store, no fetch, no real execution.
        `user-select: none` + `pointer-events: none` on the content areas
        prevents accidental text selection. The Run button is cosmetic only.
      -->
      <div v-else-if="view === 'php'" key="php"
           class="relative z-10 flex flex-col flex-1 min-h-0 overflow-hidden gap-2 p-2.5">

        <div class="flex shrink-0 items-center justify-between">
          <div class="flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
                 :stroke="color" stroke-width="1.5"
                 stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 2l6 3.5v5L8 14l-6-3.5v-5L8 2z"/>
              <path d="M8 2v12M2 5.5l6 3.5 6-3.5"/>
            </svg>
            <span class="font-mono text-[10px] font-bold" :style="{ color }">
              {{ t('hero.php.title') }}
            </span>
          </div>

          <!-- Cosmetic Run button — no action -->
          <span
            class="flex items-center gap-1 rounded-md
                   px-3 py-1 text-[9px] font-bold text-black"
            :style="{ background: color }"
            aria-hidden="true"
          >
            <svg width="7" height="8" viewBox="0 0 8 10" fill="currentColor">
              <path d="M1 1l6 4-6 4V1z"/>
            </svg>
            {{ t('hero.php.run') }}
          </span>
        </div>

        <!-- Dummy code area — unselectable, non-interactive -->
        <div
          class="min-h-0 flex-1 rounded-lg px-2.5 py-2
                 border border-black/[.08] dark:border-white/[.08]
                 bg-zinc-100 dark:bg-zinc-800
                 font-mono text-[9.5px] leading-[1.7]
                 text-zinc-800 dark:text-zinc-200
                 overflow-hidden"
          style="user-select: none; pointer-events: none;"
          aria-hidden="true"
        >
          <pre class="m-0 whitespace-pre">{{ PHP_CODE }}</pre>
        </div>

        <!-- Dummy terminal output — unselectable -->
        <div
          class="max-h-20 min-h-[52px] shrink-0 overflow-hidden rounded-lg
                 bg-[#0d0d0d] px-2.5 py-2
                 font-mono text-[9.5px] leading-relaxed text-[#a3e635]"
          style="user-select: none; pointer-events: none;"
          aria-hidden="true"
        >
          <pre class="m-0 whitespace-pre-wrap">{{ PHP_OUTPUT }}</pre>
        </div>
      </div>

    </Transition>

    <!-- ── Navigation dots ──────────────────────────────────────────────────── -->
    <div class="relative z-10 flex shrink-0 items-center justify-center gap-1 py-2">
      <div
        v-for="(v, i) in VIEWS" :key="v"
        class="h-[5px] cursor-pointer rounded-full transition-all duration-[250ms]"
        :style="{
          width:      i === current ? '16px' : '5px',
          background: i === current
            ? color
            : isDark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.15)',
        }"
        @click.stop="go(i)"
      />
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity .18s ease, transform .2s ease; }
.fade-enter-from   { opacity: 0; transform: translateY(5px); }
.fade-leave-to     { opacity: 0; }
</style>