<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoboStore } from '@/Stores/ai-store'

const robo     = useRoboStore()
const messages = computed(() => robo.messages)   // ✅ from store
const streaming = computed(() => robo.streaming) // ✅ from store

const props = defineProps({ role: { type: String, default: 'user' } })
const isAdmin = computed(() => props.role === 'admin')
const emit = defineEmits(['create-project', 'create-technology', 'create-category'])

// ── Theme ──────────────────────────────────────────────────────
const dark = ref(true)
onMounted(() => { dark.value = localStorage.getItem('robo-theme') !== 'light' })
function toggleTheme() {
  dark.value = !dark.value
  localStorage.setItem('robo-theme', dark.value ? 'dark' : 'light')
}

// ── Eye tracking ───────────────────────────────────────────────
const eyeStyle = ref({}), bodyStyle = ref({})
let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, tipTimer = null

onMounted(() => {
  window.addEventListener('mousemove', e => {
    tx = (e.clientX / window.innerWidth)  * 2 - 1
    ty = (e.clientY / window.innerHeight) * 2 - 1
  }, { passive: true })

  const tick = () => {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08
    eyeStyle.value  = { transform: `translate(${cx * 6}px, ${cy * 4}px)` }
    bodyStyle.value = { transform: `rotate(${cx * 2}deg)` }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  tipTimer = setInterval(() => tipIdx.value = (tipIdx.value + 1) % tips.length, 3500)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearInterval(tipTimer)
  document.removeEventListener('click', outside)
})

// ── Chat state ─────────────────────────────────────────────────
const chatOpen = ref(false)
const input    = ref('')
const bounce   = ref(false)
const chatEl   = ref(null)
const inputEl  = ref(null)
const root     = ref(null)

// ── Arabic ─────────────────────────────────────────────────────
const ARABIC_RE   = /[\u0600-\u06FF]/
const isArabicText = text => ARABIC_RE.test(text)
const isArabicMode = computed(() => {
  const last = [...messages.value].reverse().find(m => m.role === 'user')
  return last ? isArabicText(last.text) : false
})

const chips = computed(() =>
  isArabicMode.value
    ? ['مين يوسف؟', 'أفضل مشروع؟', 'التقنيات؟', 'التواصل؟']
    : ['Who is Youssef?', 'Best project?', 'His stack?', 'Hire him →']
)
const tips    = ['Who built this?', 'Open for work', 'Ask me anything →', 'Stack breakdown?']
const tipIdx  = ref(0)
const hasUserMsg = computed(() => messages.value.some(m => m.role === 'user'))

// ── Admin ──────────────────────────────────────────────────────
const menuOpen = ref(false)
const adminActions = [
  { label: 'New Project',    event: 'create-project',    color: 'text-violet-400', icon: '▦'   },
  { label: 'New Technology', event: 'create-technology', color: 'text-cyan-400',   icon: '</>' },
  { label: 'New Category',   event: 'create-category',   color: 'text-emerald-400', icon: '#'  },
]

// ── Format ─────────────────────────────────────────────────────
function formatInline(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-sky-400">$1</strong>')
    .replace(/(https?:\/\/[^\s<]+)/g, '<a class="underline text-sky-400 break-all hover:text-sky-300 transition-colors" href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}

function fmt(text) {
  if (!text?.trim()) return ''
  const lines    = text.trim().split('\n').filter(l => l.trim())
  const isBullet = l => /^[-•*]\s+/.test(l.trim())

  if (lines.length > 1 && lines.every(isBullet)) {
    const rtl   = isArabicText(text)
    const items = lines.map(l => `<li>${formatInline(l.replace(/^[-•*]\s+/, '').trim())}</li>`).join('')
    return `<ul ${rtl ? 'dir="rtl"' : ''} class="bullet-list ${rtl ? 'rtl-list' : ''}">${items}</ul>`
  }

  return lines.map(l => {
    const rtl = isArabicText(l)
    const dir = rtl ? 'dir="rtl" style="text-align:right"' : ''
    if (isBullet(l)) {
      return `<ul class="bullet-list ${rtl ? 'rtl-list' : ''}" ${dir}><li>${formatInline(l.replace(/^[-•*]\s+/, '').trim())}</li></ul>`
    }
    return `<p ${dir} class="msg-para">${formatInline(l)}</p>`
  }).join('')
}

// ── Ask ────────────────────────────────────────────────────────
async function ask(q) {
  const question = (q || input.value).trim()
  if (!question || robo.streaming) return
  input.value = ''
  await robo.ask(question, () => scroll())
  bounce.value = true
  setTimeout(() => bounce.value = false, 600)
  await scroll()
}

async function scroll() {
  await nextTick()
  chatEl.value?.scrollTo({ top: chatEl.value.scrollHeight, behavior: 'smooth' })
}

function open() {
  chatOpen.value = true
  if (!robo.messages.length) {
    robo.messages.push({ role: 'bot', text: "Hey 👋 I'm **Robo** — Youssef's digital wingman. Ask me about his projects, stack, or availability." })
  }
  nextTick(() => inputEl.value?.focus())
}

function outside(e) { if (!root.value?.contains(e.target)) chatOpen.value = false }
watch(chatOpen, v => {
  if (v) nextTick(() => document.addEventListener('click', outside))
  else   document.removeEventListener('click', outside)
})
</script>
<template>
  <div ref="root" class="fixed bottom-7 right-8 z-[9999] flex flex-col items-end gap-3  font-sans">

    <!-- ── Admin menu ────────────────────────────────────────── -->
    <Transition name="fade-up">
      <div v-if="isAdmin && menuOpen" class="flex flex-col items-end gap-2">
        <button
          v-for="(a, i) in adminActions" :key="a.event"
          :style="{ animationDelay: `${i * 40}ms` }"
          class="anim-slide-in flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 backdrop-blur-xl cursor-pointer transition-colors"
          :class="dark ? 'bg-slate-900/88 text-slate-200 hover:bg-slate-800/90' : 'bg-white/90 text-slate-700 hover:bg-white'"
          @click="emit(a.event); menuOpen = false"
        >
          <span :class="a.color" class="font-mono w-5 text-center">{{ a.icon }}</span>
          {{ a.label }}
        </button>
      </div>
    </Transition>

    <!-- ── Chat panel ────────────────────────────────────────── -->
    <Transition name="chat-pop">
      <div
        v-if="!isAdmin && chatOpen"
        class="w-[22rem] rounded-2xl border backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl"
        :class="dark
          ? 'bg-[#0f1117]/95 border-white/[0.07] text-slate-100'
          : 'bg-white/95 border-black/[0.07] text-slate-800'"
        @click.stop
      >

        <!-- Header -->
        <div
          class="flex items-center justify-between px-4 py-3 border-b"
          :class="dark ? 'border-white/[0.07]' : 'border-black/[0.07]'"
        >
          <div class="flex items-center gap-2.5">
            <!-- Status dot -->
            <span
              class="relative flex w-2 h-2"
            >
              <span
                v-if="streaming"
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
              />
              <span
                class="relative inline-flex rounded-full w-2 h-2 transition-colors duration-300"
                :class="streaming ? 'bg-emerald-400' : (dark ? 'bg-slate-600' : 'bg-slate-300')"
              />
            </span>

            <div class="flex flex-col">
              <span class="text-[12px] font-semibold tracking-wide" :class="dark ? 'text-slate-200' : 'text-slate-700'">
                Ask Robo
              </span>
              <span class="text-[10px] tracking-widest uppercase" :class="dark ? 'text-slate-500' : 'text-slate-400'">
                {{ streaming ? 'Thinking…' : 'About Youssef' }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              class="w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-colors cursor-pointer"
              :class="dark ? 'hover:bg-white/8 text-slate-400' : 'hover:bg-black/5 text-slate-500'"
              @click="toggleTheme"
            >{{ dark ? '☀️' : '🌙' }}</button>
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

    <!-- Message bubble -->
    <div
      class="max-w-[92%] px-3 py-2.5 rounded-2xl text-[13px] leading-relaxed"
      :class="m.role === 'user'
        ? ['self-end rounded-tr-sm',
            dark ? 'bg-sky-500/15 text-sky-100 border border-sky-500/20'
                 : 'bg-sky-50 text-sky-900 border border-sky-200/80']
        : ['self-start rounded-tl-sm bot-msg',
            dark ? 'bg-white/[0.06] text-slate-200 border border-white/[0.06]'
                 : 'bg-slate-50 text-slate-700 border border-slate-200/80']"
    >
      <template v-if="m.role === 'bot' && streaming && i === messages.length - 1">
        <span v-html="fmt(m.text)" />
        <span class="cursor-blink" />
      </template>
      <span v-else-if="m.role === 'bot'" v-html="fmt(m.text)" />
      <span
        v-else
        :dir="isArabicText(m.text) ? 'rtl' : 'ltr'"
        :style="isArabicText(m.text) ? 'display:block;text-align:right' : ''"
      >{{ m.text }}</span>
    </div>

    <!-- Project cards — outside bubble, same loop iteration -->
   <div
  v-if="m.role === 'bot' 
    && /project|built|app/i.test(m.text) 
    && robo.projects.length
    && messages.slice(0, i).some(m => m.role === 'user')"
  class="self-start w-full flex flex-col gap-1.5"
>
      <a
        v-for="p in robo.projects" :key="p.name"
        :href="p.url"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-between px-3 py-2 rounded-xl border text-[12px] transition-all hover:-translate-y-px group"
        :class="dark
          ? 'bg-white/[0.04] border-white/[0.07] text-slate-300 hover:border-sky-400/40 hover:bg-sky-400/8'
          : 'bg-slate-50 border-black/[0.08] text-slate-600 hover:border-sky-400/50 hover:bg-sky-50'"
      >
        <span class="font-medium truncate">{{ p.name }}</span>
        <span class="text-[10px] opacity-40 group-hover:opacity-80 transition-opacity ml-2 shrink-0">↗</span>
      </a>
    </div>

  </template>
</TransitionGroup>

          <!-- Thinking indicator -->
          <div
            v-if="streaming && messages[messages.length - 1]?.role !== 'bot'"
            class="self-start flex gap-1.5 px-3.5 py-3 rounded-2xl rounded-tl-sm border"
            :class="dark ? 'bg-white/[0.06] border-white/[0.06]' : 'bg-slate-50 border-slate-200/80'"
          >
            <span
              v-for="n in 3" :key="n"
              class="w-1.5 h-1.5 rounded-full animate-dot"
              :class="dark ? 'bg-slate-500' : 'bg-slate-400'"
              :style="{ animationDelay: `${(n - 1) * 0.2}s` }"
            />
          </div>
        </div>

        <!-- Quick chips -->
        <Transition name="chips">
          <div
            v-if="!hasUserMsg"
            class="flex flex-wrap gap-1.5 px-3.5 pb-3 pt-2 border-t"
            :class="[
              dark ? 'border-white/[0.07]' : 'border-black/[0.07]',
              isArabicMode ? 'flex-row-reverse' : ''
            ]"
          >
            <button
              v-for="c in chips" :key="c"
              class="chip-btn text-[11px] px-2.5 py-1 rounded-full border transition-all hover:-translate-y-px active:scale-95 cursor-pointer"
              :class="dark
                ? 'border-white/10 text-slate-400 hover:border-sky-400/40 hover:text-sky-300 hover:bg-sky-400/8'
                : 'border-black/10 text-slate-500 hover:border-sky-400/50 hover:text-sky-600 hover:bg-sky-50'"
              @click="ask(c)"
            >{{ c }}</button>
          </div>
        </Transition>

        <!-- Input row -->
        <div
          class="flex gap-2 p-3 border-t"
          :class="dark ? 'border-white/[0.07]' : 'border-black/[0.07]'"
        >
          <input
            ref="inputEl"
            v-model="input"
            :placeholder="isArabicMode ? 'اسأل أي حاجة…' : 'Ask anything about Youssef…'"
            maxlength="300"
            autocomplete="off"
            class="flex-1 text-[13px] px-3 py-2 rounded-xl border outline-none transition-all"
            :class="dark
              ? 'bg-white/[0.06] border-white/[0.07] text-slate-100 placeholder-slate-600 focus:border-sky-400/40 focus:bg-white/[0.08]'
              : 'bg-slate-50 border-black/[0.08] text-slate-800 placeholder-slate-400 focus:border-sky-400/50 focus:bg-white'"
            :dir="input && isArabicText(input) ? 'rtl' : 'ltr'"
            @keydown.enter.prevent="ask()"
            @keydown.esc="chatOpen = false"
          />
          <button
            :disabled="!input.trim() || streaming"
            class="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-25 disabled:cursor-default cursor-pointer font-bold text-sm"
            :class="dark
              ? 'bg-sky-400/15 text-sky-400 border border-sky-400/20 enabled:hover:bg-sky-400/30 enabled:hover:scale-105 enabled:active:scale-95'
              : 'bg-sky-500 text-white border border-sky-600 enabled:hover:bg-sky-600 enabled:hover:scale-105 enabled:active:scale-95'"
            @click="ask()"
          >↑</button>
        </div>

      </div>
    </Transition>

    <!-- ── Idle tip bubble ────────────────────────────────────── -->
    <Transition name="bubble" mode="out-in">
      <div
        v-if="!isAdmin && !chatOpen"
        :key="tipIdx"
        class="relative px-3.5 py-2 rounded-[14px_14px_14px_4px] border text-[12px] font-medium cursor-pointer backdrop-blur-xl transition-all hover:-translate-y-0.5 shadow-lg"
        :class="dark
          ? 'bg-[#0f1117]/90 border-white/[0.07] text-slate-400 hover:text-slate-200 hover:border-sky-400/30'
          : 'bg-white/95 border-black/[0.07] text-slate-500 hover:text-slate-700 hover:border-sky-400/40'"
        @click.stop="open"
      >
        {{ tips[tipIdx] }}
        <!-- Tail -->
        <div
          class="absolute -bottom-1.5 right-3 w-2.5 h-1.5"
          :class="dark ? 'bg-[#0f1117]/90' : 'bg-white/95'"
          style="clip-path: polygon(0 0, 100% 0, 0 100%)"
        />
      </div>
    </Transition>

    <!-- ── Robo avatar button ─────────────────────────────────── -->
    <button
      class="relative bg-transparent border-0 p-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-full"
      :aria-label="isAdmin ? 'Admin menu' : 'Open Robo chat'"
      @click.stop="isAdmin ? (menuOpen = !menuOpen) : open()"
    >
      <!-- Glow -->
      <div
        class="absolute -inset-2 rounded-full blur-xl -z-10 transition-all duration-500"
        :class="[
          isAdmin ? 'bg-violet-500/15' : 'bg-sky-400/15',
          streaming ? '!opacity-100 scale-125 animate-pulse' : '',
          (isAdmin && menuOpen) ? '!bg-violet-500/50 !scale-[1.4]' : '',
        ]"
      />

      <!-- Body -->
      <div
        class="relative w-[68px] drop-shadow-[0_6px_24px_rgba(0,0,0,.5)]"
        :class="bounce ? 'anim-bounce' : 'anim-breathe'"
        :style="bodyStyle"
      >
        <!-- Backpack -->
        <div
          class="absolute top-[18px] right-[-17px] w-5 h-9 rounded-[3px_10px_10px_3px] z-10"
          :class="isAdmin ? 'bg-gradient-to-b from-violet-700 to-indigo-800' : 'bg-gradient-to-b from-sky-600 to-sky-900'"
        />

        <!-- Torso -->
        <div
          class="relative w-[68px] h-[76px] rounded-[34px_34px_18px_18px] z-20"
          :class="isAdmin
            ? 'bg-gradient-to-br from-violet-400 to-indigo-600 shadow-[inset_0_2px_5px_rgba(255,255,255,.18),0_0_0_1.5px_rgba(139,92,246,.3)]'
            : 'bg-gradient-to-br from-sky-300 to-sky-700 shadow-[inset_0_2px_5px_rgba(255,255,255,.18),0_0_0_1.5px_rgba(56,189,248,.3)]'"
        >
          <!-- Crown (admin) -->
          <div v-if="isAdmin" class="absolute -top-3.5 left-1/2 -translate-x-1/2 w-6 text-amber-400 drop-shadow-[0_1px_5px_rgba(251,191,36,.7)]">
            <svg viewBox="0 0 24 12" fill="none"><path d="M0 12 L4 2 L12 8 L20 2 L24 12 Z" fill="currentColor"/></svg>
          </div>

          <!-- Visor -->
          <div class="absolute top-3 left-2.5 w-12 h-8 bg-gradient-to-br from-slate-700 to-slate-950 rounded-[20px_20px_12px_12px] overflow-hidden shadow-[inset_0_2px_6px_rgba(255,255,255,.08)]">
            <div class="absolute inset-0 flex items-center justify-around px-2" :style="eyeStyle">
              <div class="w-3.5 h-3.5 rounded-full bg-[radial-gradient(circle_at_33%_33%,#e2e8f0_55%,#94a3b8)]" />
              <div class="w-3.5 h-3.5 rounded-full bg-[radial-gradient(circle_at_33%_33%,#e2e8f0_55%,#94a3b8)]" />
            </div>
            <div class="absolute top-1 left-1.5 w-3.5 h-1.5 rounded-full bg-white/20 -rotate-6" />
          </div>

          <!-- Stream activity light -->
          <div
            v-if="streaming"
            class="absolute bottom-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#34d399] animate-pulse"
          />
        </div>

        <!-- Legs -->
        <div class="relative flex justify-center gap-2 -mt-0.5 z-20 anim-waddle">
          <div class="w-5 h-[17px] rounded-b-full" :class="isAdmin ? 'bg-gradient-to-b from-violet-700 to-indigo-800' : 'bg-gradient-to-b from-sky-600 to-sky-900'" />
          <div class="w-5 h-[17px] rounded-b-full" :class="isAdmin ? 'bg-gradient-to-b from-violet-700 to-indigo-800' : 'bg-gradient-to-b from-sky-600 to-sky-900'" />
        </div>
      </div>
    </button>

  </div>
</template>

<style scoped>
/* ── Animations ── */
.anim-breathe { animation: breathe 3.4s ease-in-out infinite; will-change: transform; }
@keyframes breathe { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }

.anim-waddle { animation: waddle 3.4s ease-in-out infinite; }
@keyframes waddle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(1deg); } 75% { transform: rotate(-1deg); } }

.anim-bounce { animation: crew-bounce .55s cubic-bezier(.36,.07,.19,.97) both; }
@keyframes crew-bounce {
  0%   { transform: translateY(0)     scale(1); }
  25%  { transform: translateY(-14px) scale(1.05, .94); }
  50%  { transform: translateY(0)     scale(.96, 1.05); }
  75%  { transform: translateY(-5px)  scale(1.02, .98); }
  100% { transform: translateY(0)     scale(1); }
}

.anim-slide-in { animation: slide-in .2s both; }
@keyframes slide-in { from { opacity: 0; transform: translateX(10px) scale(.9); } to { opacity: 1; transform: none; } }

/* ── Chat micro-animations ── */
.animate-dot   { animation: dot-pulse 1.2s ease-in-out infinite; }
.cursor-blink  { display: inline-block; width: 2px; height: 1em; background: currentColor; opacity: .6; margin-left: 2px; vertical-align: bottom; animation: blink .7s ease-in-out infinite; }
@keyframes dot-pulse { 0%,80%,100% { transform: scale(1); opacity: .4; } 40% { transform: scale(1.4); opacity: 1; } }
@keyframes blink     { 0%,100% { opacity: .6; } 50% { opacity: 0; } }

/* ── Bot bubble rich text ── */
.bot-msg :deep(.msg-para)           { margin-bottom: 4px; }
.bot-msg :deep(.msg-para:last-child){ margin-bottom: 0; }
.bot-msg :deep(.bullet-list)        { margin: 4px 0; padding-left: 1.25rem; list-style-type: disc; }
.bot-msg :deep(.bullet-list li)     { margin-bottom: 3px; display: list-item; }
.bot-msg :deep(.bullet-list li:last-child) { margin-bottom: 0; }
.bot-msg :deep(.rtl-list)           { padding-left: 0; padding-right: 1.25rem; }

/* ── Chips ── */
.chip-btn { font-weight: 500; letter-spacing: 0.01em; }

/* ── Transitions ── */
.bubble-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.bubble-leave-active { transition: all .15s ease-in; }
.bubble-enter-from   { opacity: 0; transform: translateY(6px) scale(.93); }
.bubble-leave-to     { opacity: 0; transform: translateY(-3px); }

.chat-pop-enter-active { transition: all .28s cubic-bezier(.34,1.56,.64,1); }
.chat-pop-leave-active { transition: all .16s ease-in; }
.chat-pop-enter-from   { opacity: 0; transform: translateY(14px) scale(.9); transform-origin: bottom right; }
.chat-pop-leave-to     { opacity: 0; transform: translateY(6px)  scale(.96); transform-origin: bottom right; }

.fade-up-enter-active { transition: all .2s ease-out; }
.fade-up-leave-active { transition: all .14s ease-in; }
.fade-up-enter-from   { opacity: 0; transform: translateY(8px); }
.fade-up-leave-to     { opacity: 0; }

.msg-enter-active { transition: all .25s cubic-bezier(.34,1.4,.64,1); }
.msg-enter-from   { opacity: 0; transform: translateY(8px) scale(.96); }

.chips-leave-active { transition: all .2s ease; overflow: hidden; }
.chips-leave-to     { opacity: 0; max-height: 0; padding: 0; }
</style>
