<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'
import { useI18n } from 'vue-i18n'
import { useHorizontalSwipe } from '../composables/useHorizontalSwipe'
import { fetchContributions } from '@/services/github-api'

const { t } = useI18n()
const layout = useLayoutStore()

// ── Constants ──────────────────────────────────────────────
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHOW_DAYS  = new Set([1, 3, 5]) // Mon, Wed, Fri only
const LEVEL_OPS  = [0, 0.25, 0.5, 0.75, 1]
const CUR_YEAR   = new Date().getFullYear()
const YEARS      = Array.from({ length: CUR_YEAR - 2024 + 1 }, (_, i) => 2024 + i)

// ── State ──────────────────────────────────────────────────
const selectedYear = ref(null) // null = rolling 52 weeks
const weeks        = ref([])
const total        = ref(0)
const loading      = ref(false)
const hasError     = ref(false)
const graphRef     = ref(null)

// Mobile tap-to-show tooltip state
const activeTooltip = ref(null) // { text, x, y } or null

// ── Swipe scroll on mobile ─────────────────────────────────
useHorizontalSwipe(() => graphRef.value)

// ── Fetch ──────────────────────────────────────────────────
const fetchGraph = async () => {
  loading.value  = true
  hasError.value = false
  weeks.value    = []

  let from, to
  if (selectedYear.value === null) {
    const now  = new Date()
    const past = new Date(now.getTime() - 52 * 7 * 24 * 60 * 60 * 1000)
    from = past.toISOString()
    to   = now.toISOString()
  } else {
    const yr = selectedYear.value
    from = `${yr}-01-01T00:00:00Z`
    to   = yr === CUR_YEAR ? new Date().toISOString() : `${yr}-12-31T23:59:59Z`
  }

  try {
    const cal   = await fetchContributions(from, to)
    weeks.value = cal.weeks
    total.value = cal.totalContributions
  } catch {
    hasError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchGraph)
watch(selectedYear, fetchGraph)

// ── Month labels ───────────────────────────────────────────
const monthLabels = computed(() =>
  weeks.value.map((week, i) => {
    const d = week.contributionDays[0]?.date
    if (!d) return ''
    const mo = new Date(d + 'T12:00:00').getMonth()
    if (i === 0) return MONTHS[mo]
    const pd = weeks.value[i - 1].contributionDays[0]?.date
    if (!pd) return ''
    return new Date(pd + 'T12:00:00').getMonth() !== mo ? MONTHS[mo] : ''
  })
)

// ── Cell helpers ───────────────────────────────────────────
const cellLevel = (n) => n === 0 ? 0 : n <= 3 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : 4

const cellStyle = (day) => {
  const lv = cellLevel(day.contributionCount)
  return lv === 0
    ? { background: 'var(--cell-empty)' }
    : { background: layout.preferedColor, opacity: LEVEL_OPS[lv] }
}

const cellText = (day) => {
  const n = day.contributionCount
  const dateStr = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  return n === 0
    ? `No contributions on ${dateStr}`
    : `${n} contribution${n !== 1 ? 's' : ''} on ${dateStr}`
}

// ── Mobile tooltip: tap cell → show/hide tooltip ──────────
// On desktop, native title attr handles it fine.
// On mobile, we show a small floating label inside the graph box.
const onCellTap = (event, day) => {
  const text = cellText(day)

  if (activeTooltip.value?.text === text) {
    activeTooltip.value = null
    return
  }

  const containerRect = graphRef.value.getBoundingClientRect()
  const cellRect = event.currentTarget.getBoundingClientRect()

  const padding = 8
  const tooltipWidth = 140 // تقدير (مهم)
  
  // center X
  let x = cellRect.left - containerRect.left + cellRect.width / 2

  // clamp يمين / شمال
  const minX = tooltipWidth / 2 + padding
  const maxX = containerRect.width - tooltipWidth / 2 - padding

  x = Math.max(minX, Math.min(x, maxX))

  // Y logic
  const yAbove = cellRect.top - containerRect.top - 8
  const yBelow = cellRect.bottom - containerRect.top + 8

  const isNearTop = yAbove < 20

  activeTooltip.value = {
    text,
    x,
    y: isNearTop ? yBelow : yAbove,
    below: isNearTop
  }
}

// Dismiss tooltip when tapping anywhere else
const dismissTooltip = (e) => {
  if (!e.target.closest('.cell')) activeTooltip.value = null
}
</script>

<template>
<div
  class="flex flex-col gap-3 w-full"
  :style="`--c: ${layout.preferedColor}`"
>
  <!-- header: label + year pills + total -->
  <div class="flex flex-wrap items-center justify-between gap-2">
  <span class="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400">
    {{ t('about.github_label') }}
  </span>

  <!-- year selector pills -->
  <div class="flex items-center gap-1">
    <button
      @click="selectedYear = null"
      class="year-pill"
      :class="selectedYear === null ? 'pill-on' : 'pill-off'"
    >52w</button>
    <button
      v-for="yr in YEARS"
      :key="yr"
      @click="selectedYear = yr"
      class="year-pill"
      :class="selectedYear === yr ? 'pill-on' : 'pill-off'"
    >{{ yr }}</button>
  </div>

  <!-- total / loading / error -->
  <span class="text-[0.65rem] font-mono text-gray-400 min-w-[60px] flex items-center justify-center">
    <template v-if="loading">
         <svg 
              class="w-4 h-4 shrink-0 animate-pulse "
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
      
    </template>
    <template v-else-if="hasError">
      Error
    </template>
    <template v-else>
      <span :style="{ color: layout.preferedColor }">{{ total }}/ </span> {{ t('about.github_total') }}
    </template>
  </span>
</div>

  <!-- graph box -->
  <div class="rounded-xl p-4 sm:p-5 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-white/8">

    <!-- loading skeleton -->
    <div v-if="loading" class="h-[130px] rounded-lg animate-pulse bg-black/8 dark:bg-white/5" />

    <!-- error -->
    <div v-else-if="hasError" class="text-xs text-gray-400 font-mono text-center py-8">
      {{ t('about.github_error') }}
    </div>

    <!-- graph — always LTR regardless of page language -->
    <div
      v-else
      ref="graphRef"
      class="relative overflow-x-auto py-1"
      style="scrollbar-width: thin; scrollbar-color: var(--c) transparent"
      dir="ltr"
      @click="dismissTooltip"
    >
      <!-- mobile tap tooltip — positioned absolutely inside the scroll container -->
      <Transition name="tip">
                <div
          v-if="activeTooltip"
          class="absolute z-20 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap pointer-events-none
                bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 shadow-md"
          :style="{
            left: activeTooltip.x + 'px',
            top:  activeTooltip.y + 'px',
            transform: activeTooltip.below
              ? 'translate(-50%, 0%)'
              : 'translate(-50%, -100%)'
          }"
        >{{ activeTooltip.text }}</div>
      </Transition>

      <!-- month labels row -->
      <div class="flex gap-[3px] mb-1" style="margin-inline-start: 28px">
        <span
          v-for="(label, i) in monthLabels" :key="i"
          class="w-[11px] shrink-0 text-[10px] text-gray-400 leading-none overflow-visible whitespace-nowrap"
        >{{ label }}</span>
      </div>

      <!-- day labels + week columns -->
      <div class="flex gap-[6px]">

        <!-- Mon/Wed/Fri labels -->
        <div class="flex flex-col gap-[3px] shrink-0" style="width: 22px">
          <div
            v-for="i in 7" :key="i"
            class="text-[10px] text-gray-400 leading-none flex items-center"
            style="height: 11px"
          >{{ SHOW_DAYS.has(i - 1) ? DAY_LABELS[i - 1] : '' }}</div>
        </div>

        <!-- week columns -->
        <div class="flex gap-[3px]">
          <div v-for="(week, wi) in weeks" :key="wi" class="flex flex-col gap-[3px]">
            <div
              v-for="(day, di) in week.contributionDays" :key="di"
              class="cell shrink-0 rounded-[2px] cursor-default transition-transform duration-100 hover:scale-125"
              :style="cellStyle(day)"
              :title="cellText(day)"
              @click.stop="onCellTap($event, day)"
            />
          </div>
        </div>
      </div>

      <!-- legend -->
      <div class="flex items-center gap-1.5 justify-end mt-3">
        <span class="text-[10px] text-gray-400">Less</span>
        <div
          v-for="lv in [0,1,2,3,4]" :key="lv"
          class="w-[10px] h-[10px] rounded-[2px]"
          :style="lv === 0
            ? { background: 'var(--cell-empty)' }
            : { background: layout.preferedColor, opacity: LEVEL_OPS[lv] }"
        />
        <span class="text-[10px] text-gray-400">More</span>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
@reference "tailwindcss";

/* cell size */
.cell { width: 11px; height: 11px; }

/* empty cell color — adapts to dark mode */
.dark div { --cell-empty: #161b22; }
div       { --cell-empty: #ebedf0; }

/* year pills */
.year-pill {
  @apply px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold 
         border border-gray-300   text-gray-400   bg-transparent
         cursor-pointer transition-all duration-150;
  line-height: 1.6;
}
.pill-off {
  @apply opacity-70;
}


.pill-off:hover {
  /* @apply bg-gray-300 border-gray-500 text-gray-950;
  @apply dark:bg-white/5 dark:border-white/20 dark:text-white/60; */
}
.pill-on {
  color: var(--c);
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 15%, white);
  opacity: 1;
}

.dark .pill-on {
  /* dark mode */
  background: color-mix(in srgb, var(--c) 20%, transparent);
}
.pill-on:hover {
  filter: brightness(1.1);
}

/* tooltip fade */
.tip-enter-active, .tip-leave-active { transition: opacity .15s, transform .15s; }
.tip-enter-from, .tip-leave-to { opacity: 0; transform: translate(-50%, calc(-100% + 4px)); }
</style>