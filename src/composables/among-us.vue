<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoboStore } from '@/Stores/ai-store'
import DarkMode from '@/Components/dark-mode.vue'

// ── Core ──────────────────────────────────────────────────────────
const { t, locale } = useI18n()
const robo      = useRoboStore()
const messages  = computed(() => robo.messages)
const streaming = computed(() => robo.streaming)

const props   = defineProps({ role: { type: String, default: 'user' } })
const emit    = defineEmits(['create-project', 'create-technology', 'create-category'])
const isAdmin = computed(() => props.role === 'admin')

// ── RTL ───────────────────────────────────────────────────────────
const RTL_LOCALES = new Set(['ar', 'he', 'fa', 'ur'])
const isRTL = computed(() => RTL_LOCALES.has(locale.value))
const dir   = computed(() => isRTL.value ? 'rtl' : 'ltr')
// Per-text Arabic detection (bot may reply in any language)
const isAr = s => /[\u0600-\u06FF]/.test(s)

// ── Theme ─────────────────────────────────────────────────────────
const dark = ref(true)
onMounted(() => { dark.value = localStorage.getItem('robo-theme') !== 'light' })

// Shared theme tokens — avoids repeating the same ternaries everywhere
const T = computed(() => ({
  panel  : dark.value ? 'bg-[#0f1117]/95 border-white/[0.07] text-slate-100'  : 'bg-white/95 border-black/[0.07] text-slate-800',
  divider: dark.value ? 'border-white/[0.07]'  : 'border-black/[0.07]',
  bubble : dark.value ? 'bg-white/[0.06] border-white/[0.06] text-slate-200'  : 'bg-slate-50 border-slate-200/80 text-slate-700',
  user   : dark.value ? 'bg-sky-500/15 text-sky-100 border-sky-500/20'        : 'bg-sky-50 text-sky-900 border-sky-200/80',
  input  : dark.value ? 'bg-white/[0.06] border-white/[0.07] text-slate-100 placeholder-slate-600 focus:border-sky-400/40 focus:bg-white/[0.08]'
                      : 'bg-slate-50 border-black/[0.08] text-slate-800 placeholder-slate-400 focus:border-sky-400/50 focus:bg-white',
  send   : dark.value ? 'bg-sky-400/15 text-sky-400 border-sky-400/20 enabled:hover:bg-sky-400/30'
                      : 'bg-sky-500 text-white border-sky-600 enabled:hover:bg-sky-600',
  chip   : dark.value ? 'border-white/10 text-slate-400 hover:border-sky-400/40 hover:text-sky-300 hover:bg-sky-400/8'
                      : 'border-black/10 text-slate-500 hover:border-sky-400/50 hover:text-sky-600 hover:bg-sky-50',
  admin  : dark.value ? 'bg-slate-900/88 text-slate-200 hover:bg-slate-800/90' : 'bg-white/90 text-slate-700 hover:bg-white',
  tip    : dark.value ? 'bg-[#0f1117]/90 border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-sky-400/30'
                      : 'bg-white/95 border-black/[0.07] text-slate-500 hover:text-slate-700 hover:border-sky-400/40',
  tipBg  : dark.value ? '#0f1117' : '#ffffff',
}))

// ── Eye tracking ──────────────────────────────────────────────────
const eyeStyle  = ref({})
const bodyStyle = ref({})
const tipIdx    = ref(0)
let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, tipTimer = null

onMounted(() => {
  window.addEventListener('mousemove', ({ clientX, clientY }) => {
    tx = (clientX / window.innerWidth)  * 2 - 1
    ty = (clientY / window.innerHeight) * 2 - 1
  }, { passive: true })

  const tick = () => {
    cx += (tx - cx) * 0.08
    cy += (ty - cy) * 0.08
    eyeStyle.value  = { transform: `translate(${cx * 6}px, ${cy * 4}px)` }
    bodyStyle.value = { transform: `rotate(${cx * 2}deg)` }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  tipTimer = setInterval(() => tipIdx.value = (tipIdx.value + 1) % 4, 3500)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearInterval(tipTimer)
  document.removeEventListener('click', outside)
})

// ── i18n arrays ───────────────────────────────────────────────────
const tips  = computed(() => [t('robo.tip1'),  t('robo.tip2'),  t('robo.tip3'),  t('robo.tip4')])
const chips = computed(() => [t('robo.chip1'), t('robo.chip2'), t('robo.chip3'), t('robo.chip4')])

const adminActions = computed(() => [
  { label: t('robo.newProject'),    event: 'create-project',    color: 'text-violet-400', icon: '▦'   },
  { label: t('robo.newTechnology'), event: 'create-technology', color: 'text-cyan-400',   icon: '</>' },
  { label: t('robo.newCategory'),   event: 'create-category',   color: 'text-emerald-400',icon: '#'   },
])

// ── State ─────────────────────────────────────────────────────────
const chatOpen = ref(false)
const menuOpen = ref(false)
const input    = ref('')
const bounce   = ref(false)
const chatEl   = ref(null)
const inputEl  = ref(null)
const root     = ref(null)

const hasUserMsg      = computed(() => messages.value.some(m => m.role === 'user'))
const isProjectIntent = s => s && /project|portfolio|work|apps|مشاريع|شغل/i.test(s)

// ── Formatting ────────────────────────────────────────────────────
const fmtInline = s => s
  .replace(/\*\*(.*?)\*\*/g,
    '<strong class="font-semibold text-sky-400">$1</strong>')
  .replace(/(https?:\/\/[^\s<]+)/g,
    '<a class="underline text-sky-400 break-all hover:text-sky-300" href="$1" target="_blank" rel="noopener noreferrer">$1</a>')

function fmt(text) {
  if (!text?.trim()) return ''
  const isBullet = l => /^[-•*]\s+/.test(l.trim())
  return text.trim().split('\n').filter(l => l.trim()).map(l => {
    const rtl  = isAr(l)
    const da   = `dir="${rtl ? 'rtl' : 'ltr'}"${rtl ? ' style="text-align:right"' : ''}`
    const body = fmtInline(l.replace(/^[-•*]\s+/, '').trim())
    return isBullet(l)
      ? `<ul class="bullet-list" ${da}><li>${body}</li></ul>`
      : `<p class="msg-para" ${da}>${fmtInline(l)}</p>`
  }).join('')
}

// ── Actions ───────────────────────────────────────────────────────
async function ask(q) {
  const question = (q ?? input.value).trim()
  if (!question || streaming.value) return
  input.value = ''
  await robo.ask(question, scroll)
  bounce.value = true
  setTimeout(() => bounce.value = false, 600)
  scroll()
}

async function scroll() {
  await nextTick()
  chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: 'smooth' })
}

function open() {
  chatOpen.value = true
  if (!messages.value.length)
    robo.messages.push({ role: 'bot', text: t('robo.greeting') })
  nextTick(() => inputEl.value?.focus())
}

function outside(e) {
  if (!root.value?.contains(e.target)) chatOpen.value = false
}

watch(chatOpen, v =>
  nextTick(() => v
    ? document.addEventListener('click', outside)
    : document.removeEventListener('click', outside)
  )
)
</script>

<template>
  <!--
    Root is sized only by the avatar button.
    All overlays (panel, tip, admin menu) are absolute bottom-full
    so the avatar position never shifts.
  -->
  <div
    ref="root"
    :dir="dir"
    class="fixed bottom-5 z-[9999] font-sans isolate"
    :class="isRTL ? 'left-5 sm:left-8' : 'right-5 sm:right-8'"
  >

    <!-- ── Admin menu (absolute, no layout shift) ───────────────── -->
    <Transition name="fade-up">
      <div
        v-if="isAdmin && menuOpen"
        class="absolute bottom-full mb-3 flex flex-col gap-2"
        :class="isRTL ? 'left-0 items-start' : 'right-0 items-end'"
      >
        <button
          v-for="(a, i) in adminActions"
          :key="a.event"
          :style="{ animationDelay: `${i * 40}ms` }"
          class="anim-slide-in flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-xl cursor-pointer transition-colors"
          :class="T.admin"
          @click="emit(a.event); menuOpen = false"
        >
          <span :class="a.color" class="font-mono w-5 text-center">{{ a.icon }}</span>
          {{ a.label }}
        </button>
      </div>
    </Transition>

    <!-- ── Chat panel (absolute, no layout shift) ───────────────── -->
    <Transition name="chat-pop">
      <div
        v-if="!isAdmin && chatOpen"
        class="absolute bottom-full mb-3 w-[22rem] rounded-2xl border backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl"
        :class="[T.panel, isRTL ? 'left-0' : 'right-0']"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b" :class="T.divider">
          <div class="flex items-center gap-2.5" :class="isRTL ? 'flex-row-reverse' : ''">
            <!-- Status dot -->
            <span class="relative flex w-2 h-2 shrink-0">
              <span v-if="streaming" class="animate-ping absolute inset-0 rounded-full bg-emerald-400 opacity-75" />
              <span
                class="relative rounded-full w-2 h-2 transition-colors"
                :class="streaming ? 'bg-emerald-400' : (dark ? 'bg-slate-600' : 'bg-slate-300')"
              />
            </span>
            <div class="flex flex-col" :class="isRTL ? 'items-end' : 'items-start'">
              <span class="text-[12px] font-semibold tracking-wide" :class="dark ? 'text-slate-200' : 'text-slate-700'">
                {{ t('robo.about') }}
              </span>
              <span class="text-[10px] tracking-widest uppercase" :class="dark ? 'text-slate-500' : 'text-slate-400'">
                {{ streaming ? t('robo.thinking') : t('nav.logo1') }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <DarkMode local-key="robo-theme" v-model="dark" responsive />
            <button
              class="w-7 h-7 rounded-lg text-[11px] flex items-center justify-center transition-colors cursor-pointer"
              :class="dark ? 'text-slate-500 hover:text-white hover:bg-white/8' : 'text-slate-400 hover:text-slate-700 hover:bg-black/5'"
              @click.stop="chatOpen = false"
            >✕</button>
          </div>
        </div>

        <!-- Messages -->
        <div
          ref="chatEl"
          class="flex flex-col gap-2.5 p-3.5 overflow-y-auto max-h-72 scroll-smooth select-text"
          style="overscroll-behavior: contain"
          @wheel.stop
        >
          <TransitionGroup name="msg">
            <template v-for="(m, i) in messages" :key="i">

              <!-- Bubble -->
              <div
                class="max-w-[92%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed border"
                :class="m.role === 'user'
                  ? [isRTL ? 'self-start rounded-tl-sm' : 'self-end rounded-tr-sm', T.user]
                  : [isRTL ? 'self-end rounded-tr-sm'   : 'self-start rounded-tl-sm', 'bot-msg', T.bubble]"
              >
                <template v-if="m.role === 'bot' && streaming && i === messages.length - 1">
                  <span v-html="fmt(m.text)" /><span class="cursor-blink" />
                </template>
                <span v-else-if="m.role === 'bot'" v-html="fmt(m.text)" />
                <!-- User text: dir from content, not locale (user may type any language) -->
                <span
                  v-else
                  class="block"
                  :dir="isAr(m.text) ? 'rtl' : 'ltr'"
                  :style="{ textAlign: isAr(m.text) ? 'right' : 'left' }"
                >{{ m.text }}</span>
              </div>

              <!-- Project cards -->
              <div
                v-if="m.role === 'bot' && isProjectIntent(messages[i - 1]?.text) && robo.projects.length && messages.slice(0, i).some(x => x.role === 'user')"
                class="w-full flex flex-col gap-1.5"
                :class="isRTL ? 'self-end' : 'self-start'"
              >
                <a
                  v-for="p in robo.projects"
                  :key="p.name"
                  :href="p.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center justify-between px-3 py-2 rounded-xl border text-[12px] transition-all hover:-translate-y-px group"
                  :class="dark
                    ? 'bg-white/[0.04] border-white/[0.07] text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/8'
                    : 'bg-slate-50 border-black/[0.08] text-slate-600 hover:border-sky-400/50 hover:bg-sky-50'"
                >
                  <span class="font-medium truncate">{{ p.name }}</span>
                  <span class="text-[10px] opacity-40 group-hover:opacity-80 transition-opacity shrink-0" :class="isRTL ? 'mr-2' : 'ml-2'">↗</span>
                </a>
              </div>

            </template>
          </TransitionGroup>

          <!-- Thinking dots -->
          <div
            v-if="streaming && messages.at(-1)?.role !== 'bot'"
            class="flex gap-1.5 px-3.5 py-3 rounded-2xl border self-start"
            :class="T.bubble"
          >
            <span
              v-for="n in 3" :key="n"
              class="w-1.5 h-1.5 rounded-full animate-dot"
              :class="dark ? 'bg-slate-500' : 'bg-slate-400'"
              :style="{ animationDelay: `${(n - 1) * 0.2}s` }"
            />
          </div>
        </div>

        <!-- Chips -->
        <Transition name="chips">
          <div
            v-if="!hasUserMsg"
            class="flex flex-wrap gap-1.5 px-3.5 pb-3 pt-2 border-t"
            :class="T.divider"
            :dir="dir"
          >
            <button
              v-for="c in chips" :key="c"
              class="chip-btn text-[11px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-px active:scale-95 cursor-pointer"
              :class="T.chip"
              @click="ask(c)"
            >{{ c }}</button>
          </div>
        </Transition>

        <!-- Input -->
        <div class="flex gap-2 p-3 border-t" :class="[T.divider, isRTL ? 'flex-row-reverse' : '']">
          <input
            ref="inputEl"
            v-model="input"
            :placeholder="t('robo.placeholder')"
            maxlength="300"
            autocomplete="off"
            class="flex-1 text-[13px] px-3 py-2 rounded-xl border outline-none transition-all"
            :class="[T.input, isAr(input) || (!input && isRTL) ? 'text-right' : 'text-left']"
            :dir="isAr(input) ? 'rtl' : dir"
            @keydown.enter.prevent="ask()"
            @keydown.esc="chatOpen = false"
          />
          <button
            :disabled="!input.trim() || streaming"
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all border disabled:opacity-25 disabled:cursor-default cursor-pointer font-bold text-sm enabled:hover:scale-105 enabled:active:scale-95"
            :class="T.send"
            @click="ask()"
          >{{ isRTL ? '↓' : '↑' }}</button>
        </div>
      </div>
    </Transition>

    <!-- ── Tip bubble (absolute, no layout shift) ───────────────── -->
    <Transition name="bubble" mode="out-in">
      <div
        v-if="!isAdmin && !chatOpen"
        :key="tipIdx"
        class="absolute bottom-full mb-3 px-3.5 py-2 border text-[12px] font-medium cursor-pointer backdrop-blur-xl transition-all hover:-translate-y-0.5 shadow-lg whitespace-nowrap"
        :class="[
          T.tip,
          isRTL ? 'left-0 rounded-[14px_14px_4px_14px]' : 'right-0 rounded-[14px_14px_14px_4px]'
        ]"
        @click.stop="open"
      >
        {{ tips[tipIdx] }}
        <!-- Speech bubble tail — flips side in RTL -->
        <div
          class="absolute -bottom-1.5 w-2.5 h-1.5"
          :class="isRTL ? 'left-3' : 'right-3'"
          :style="{
            background: T.tipBg,
            clipPath: isRTL ? 'polygon(100% 0, 0 0, 100% 100%)' : 'polygon(0 0, 100% 0, 0 100%)'
          }"
        />
      </div>
    </Transition>

    <!-- ── Avatar button ────────────────────────────────────────── -->
    <button
      class="relative bg-transparent border-0 p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-full"
      :aria-label="isAdmin ? t('robo.newProject') : t('robo.about')"
      @click.stop="isAdmin ? (menuOpen = !menuOpen) : open()"
    >
      <!-- Glow ring -->
      <div
        class="absolute -inset-2 rounded-full blur-xl -z-10 transition-all duration-500"
        :class="[
          isAdmin ? 'bg-violet-500/15' : 'bg-sky-400/15',
          streaming ? '!opacity-100 scale-125 animate-pulse' : '',
          isAdmin && menuOpen ? '!bg-violet-500/50 !scale-[1.4]' : '',
        ]"
      />

      <!-- Robot body -->
      <div
        class="relative w-[52px] sm:w-[68px] drop-shadow-[0_6px_24px_rgba(0,0,0,.5)]"
        :class="bounce ? 'anim-bounce' : 'anim-breathe'"
        :style="bodyStyle"
      >
        <!-- Backpack (flips side in RTL) -->
        <div
          class="absolute top-[14px] sm:top-[18px] w-4 sm:w-5 h-7 sm:h-9 z-10"
          :class="[
            isAdmin ? 'bg-gradient-to-b from-violet-700 to-indigo-800' : 'bg-gradient-to-b from-sky-600 to-sky-900',
            isRTL
              ? 'left-[-13px] sm:left-[-17px] rounded-[10px_3px_3px_10px]'
              : 'right-[-13px] sm:right-[-17px] rounded-[3px_10px_10px_3px]'
          ]"
        />

        <!-- Torso -->
        <div
          class="relative w-[52px] sm:w-[68px] h-[58px] sm:h-[76px] rounded-[26px_26px_14px_14px] sm:rounded-[34px_34px_18px_18px] z-20"
          :class="isAdmin
            ? 'bg-gradient-to-br from-violet-400 to-indigo-600 shadow-[inset_0_2px_5px_rgba(255,255,255,.18),0_0_0_1.5px_rgba(139,92,246,.3)]'
            : 'bg-gradient-to-br from-sky-300 to-sky-700 shadow-[inset_0_2px_5px_rgba(255,255,255,.18),0_0_0_1.5px_rgba(56,189,248,.3)]'"
        >
          <!-- Admin crown -->
          <div
            v-if="isAdmin"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 text-amber-400 drop-shadow-[0_1px_5px_rgba(251,191,36,.7)]"
          >
            <svg viewBox="0 0 24 12" fill="none">
              <path d="M0 12 L4 2 L12 8 L20 2 L24 12 Z" fill="currentColor"/>
            </svg>
          </div>

          <!-- Visor -->
          <div class="absolute top-2 sm:top-3 left-2 sm:left-2.5 w-9 sm:w-12 h-6 sm:h-8 bg-gradient-to-br from-slate-700 to-slate-950 rounded-[20px_20px_12px_12px] overflow-hidden shadow-[inset_0_2px_6px_rgba(255,255,255,.08)]">
            <div class="absolute inset-0 flex items-center justify-around px-1.5 sm:px-2" :style="eyeStyle">
              <div class="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-[radial-gradient(circle_at_33%_33%,#e2e8f0_55%,#94a3b8)]" />
              <div class="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 rounded-full bg-[radial-gradient(circle_at_33%_33%,#e2e8f0_55%,#94a3b8)]" />
            </div>
            <div class="absolute top-1 left-1.5 w-3.5 h-1.5 rounded-full bg-white/20 -rotate-6" />
          </div>

          <!-- Streaming activity light -->
          <div
            v-if="streaming"
            class="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse"
            :class="isRTL ? 'left-2.5' : 'right-2.5'"
          />
        </div>

        <!-- Legs -->
        <div class="relative flex justify-center gap-1.5 sm:gap-2 -mt-0.5 z-20 anim-waddle">
          <div
            v-for="n in 2" :key="n"
            class="w-4 sm:w-5 h-[13px] sm:h-[17px] rounded-b-full"
            :class="isAdmin ? 'bg-gradient-to-b from-violet-700 to-indigo-800' : 'bg-gradient-to-b from-sky-600 to-sky-900'"
          />
        </div>
      </div>
    </button>

  </div>
</template>

<style scoped>
/* ── Robot animations ─────────────────────────────────────────── */
.anim-breathe { animation: breathe 3.4s ease-in-out infinite; will-change: transform; }
@keyframes breathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

.anim-waddle { animation: waddle 3.4s ease-in-out infinite; }
@keyframes waddle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }

.anim-bounce { animation: crew-bounce .55s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes crew-bounce {
  0%   { transform: translateY(0)    scale(1); }
  25%  { transform: translateY(-14px) scale(1.05,.94); }
  50%  { transform: translateY(0)    scale(.96,1.05); }
  75%  { transform: translateY(-5px) scale(1.02,.98); }
  100% { transform: translateY(0)    scale(1); }
}

.anim-slide-in { animation: slide-in .2s both; }
@keyframes slide-in { from { opacity:0; transform: translateX(10px) scale(.9); } to { opacity:1; transform:none; } }

/* ── Chat micro-animations ────────────────────────────────────── */
.animate-dot { animation: dot-pulse 1.2s ease-in-out infinite; }
@keyframes dot-pulse { 0%,80%,100% { transform:scale(1); opacity:.4; } 40% { transform:scale(1.4); opacity:1; } }

.cursor-blink {
  display: inline-block; width: 2px; height: 1em;
  background: currentColor; opacity: .6; margin-left: 2px;
  vertical-align: bottom; animation: blink .7s ease-in-out infinite;
}
@keyframes blink { 0%,100% { opacity:.6; } 50% { opacity:0; } }

/* ── Bot message rich text ────────────────────────────────────── */
.bot-msg :deep(.msg-para)             { margin-bottom: 4px; }
.bot-msg :deep(.msg-para:last-child)  { margin-bottom: 0; }
.bot-msg :deep(.bullet-list)          { margin: 4px 0; padding-inline-start: 1.25rem; list-style-type: disc; }
.bot-msg :deep(.bullet-list li)       { margin-bottom: 3px; }
.bot-msg :deep(.bullet-list li:last-child) { margin-bottom: 0; }

/* ── Chip ─────────────────────────────────────────────────────── */
.chip-btn { font-weight: 500; letter-spacing: 0.01em; }

/* ── Transitions ──────────────────────────────────────────────── */
.bubble-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.bubble-leave-active { transition: all .15s ease-in; }
.bubble-enter-from   { opacity:0; transform: translateY(6px) scale(.93); }
.bubble-leave-to     { opacity:0; transform: translateY(-3px); }

.chat-pop-enter-active { transition: all .28s cubic-bezier(.34,1.56,.64,1); }
.chat-pop-leave-active { transition: all .16s ease-in; }
.chat-pop-enter-from   { opacity:0; transform: translateY(14px) scale(.9); transform-origin: bottom center; }
.chat-pop-leave-to     { opacity:0; transform: translateY(6px) scale(.96); transform-origin: bottom center; }

.fade-up-enter-active { transition: all .2s ease-out; }
.fade-up-leave-active { transition: all .14s ease-in; }
.fade-up-enter-from   { opacity:0; transform: translateY(8px); }
.fade-up-leave-to     { opacity:0; }

.msg-enter-active { transition: all .25s cubic-bezier(.34,1.4,.64,1); }
.msg-enter-from   { opacity:0; transform: translateY(8px) scale(.96); }

.chips-leave-active { transition: all .2s ease; overflow: hidden; }
.chips-leave-to     { opacity:0; max-height:0; padding:0; }
</style>