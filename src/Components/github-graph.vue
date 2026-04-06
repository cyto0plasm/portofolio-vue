<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useLayoutStore } from '../Stores/layout-store'
import { useI18n } from 'vue-i18n'
import '../composables/feedback/toolTip.js'
import { useHorizontalSwipe } from '../composables/useHorizontalSwipe'
import { fetchContributions } from '@/services/github-api'


const { t } = useI18n()
const layout = useLayoutStore()

// ── Constants ──────────────────────────────────────────────
const MONTHS     = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHOW_DAYS  = new Set([1, 3, 5]) // Mon, Wed, Fri
const LEVEL_OPS  = [0, 0.25, 0.5, 0.75, 1]
const CUR_YEAR   = new Date().getFullYear()
const YEARS      = Array.from({ length: CUR_YEAR - 2024 + 1 }, (_, i) => 2024 + i)

// ── State ──────────────────────────────────────────────────
const selectedYear = ref(null) // null = rolling 52w
const weeks        = ref([])
const total        = ref(0)
const loading      = ref(false)
const hasError     = ref(false)
const graphRef = ref(null)

// ── Horizontal Swipe Scroll ──────────────────────────────────────────────────
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

// ── Cell style ─────────────────────────────────────────────
const cellLevel = (n) => n === 0 ? 0 : n <= 3 ? 1 : n <= 6 ? 2 : n <= 9 ? 3 : 4

const cellStyle = (day) => {
  const lv = cellLevel(day.contributionCount)
  return lv === 0
    ? { background: 'var(--cell-empty)' }
    : { background: layout.preferedColor, opacity: LEVEL_OPS[lv] }
}

// ── Tooltip ───────────────────────────────────────────────
const cellTooltip = (day) => {
  const n = day.contributionCount
  const dateStr = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
  return n === 0
    ? `No contributions on ${dateStr}`
    : `${n} contribution${n !== 1 ? 's' : ''} on ${dateStr}`
}
</script>

<template>
<div class="github-graph flex flex-col gap-3 w-full lg:max-w-3xl lg:mx-auto"
  :style="`--c: ${layout.preferedColor}`"
>
    <!-- header: label + pills + total -->
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400">
        {{ t('about.github_label') }}
      </span>

      <div class="flex items-center gap-1">
        <button
          @click="selectedYear = null"
          class="year-pill" :class="selectedYear === null ? 'pill-on' : 'pill-off'"
        >52w</button>
        <button
          v-for="yr in YEARS" :key="yr"
          @click="selectedYear = yr"
          class="year-pill" :class="selectedYear === yr ? 'pill-on' : 'pill-off'"
        >{{ yr }}</button>
      </div>

      <span v-if="!loading && !hasError" class="text-[0.65rem] font-mono text-gray-400">
        <span :style="{ color: layout.preferedColor }">{{ total }}</span>
        {{ t('about.github_total') }}
      </span>
    </div>

    <!-- graph box -->
    <div class="graph-box rounded-xl p-4 sm:p-5"
    >

      <!-- skeleton -->
      <div v-if="loading" class="h-[104px] rounded-lg animate-pulse bg-black/8 dark:bg-white/5" />

      <!-- error -->
      <div v-else-if="hasError" class="text-xs text-gray-400 font-mono text-center py-8">
        {{ t('about.github_error') }}
      </div>

      <!-- graph -->
     <div v-else ref="graphRef"  class="relative overflow-x-auto py-1" style="scrollbar-width: thin; scrollbar-color: var(--c) transparent;" dir="ltr">



        <!-- month labels -->
        <div class="flex gap-[3px] mb-[4px]" style="margin-inline-start: 28px">
          <span
            v-for="(label, i) in monthLabels" :key="i"
            class="w-[11px] shrink-0 text-[10px] text-gray-400 leading-none overflow-visible whitespace-nowrap"
          >{{ label }}</span>
        </div>

        <!-- day labels + grid -->
        <div class="flex gap-[6px]">

          <!-- day labels -->
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
      :data-tooltip="cellTooltip(day)"
      data-position="top"
    />
  </div>
</div>
        </div>

       

      <!-- legend -->
      <div v-if="!loading && !hasError" class="flex items-center gap-1.5 justify-end mt-3">
        <span class="text-[10px] text-gray-400">Less</span>
        <div
          v-for="lv in [0, 1, 2, 3, 4]" :key="lv"
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
/* ── cells ────────────────────────────────────────────── */
.cell { width: 11px; height: 11px; }

.github-graph      { --cell-empty: #eff1f5; }
.dark .github-graph { --cell-empty: #12171c; }

/* ── graph box ────────────────────────────────────────── */
.graph-box {
  background: #f6f8fa;
  border: 1px solid #d0d7de;
  
}
:root.dark .graph-box {
  background: #0d1117;
  border: 1px solid rgba(255,255,255,0.08);
}





/* ── year pills ───────────────────────────────────────── */
.year-pill {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-family: ui-monospace, monospace;
  font-weight: 600;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all .15s;
  line-height: 1.6;
}
.pill-off { color: #9ca3af; border-color: #e5e7eb; background: transparent; }
.pill-off:hover { color: #6b7280; border-color: #d1d5db; }
:root.dark .pill-off { color: rgba(255,255,255,0.3); border-color: rgba(255,255,255,0.1); }
:root.dark .pill-off:hover { color: rgba(255,255,255,0.6); border-color: rgba(255,255,255,0.2); }
.pill-on {
  color: var(--c);
  border-color: var(--c);
  background: color-mix(in srgb, var(--c) 10%, transparent);
}
</style>