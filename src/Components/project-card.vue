<script setup>
import { computed, onMounted, ref } from 'vue'
import ImageLightbox  from '@/images/Image-lightbox.vue'
import { useScroll } from '@/composables/useScrollReveal.js'
import MultiImage from '@/images/multi-image.vue'
import Badges from '@/svg/badges.vue'
import { useProjectStats } from '@/composables/firebase/useProjectStats'
import { useComments } from '@/composables/firebase/useProjectStats'



const props = defineProps({
  project:   { type: Object, required: true },
  typeLabel: { type: Object, required: true },
  index:     { type: Number, default: 0 },
})
const { views, likes, liked, toggleLike } = useProjectStats(props.project.slug)

const { comments } = useComments(props.project.slug)
const emit = defineEmits(['open-comments'])

// onMounted(function(){
//     console.log(props.project)
// })
const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}
const { targetRef, isVisible, direction } = useScroll({ threshold: 0.1 })

const formattedStart = computed(() => formatDate(props.project.start_date))
const formattedEnd   = computed(() => formatDate(props.project.end_date))
const isWide         = computed(() => props.project.images?.length !== 1)
const isMobile       = computed(() => props.project.type === 'mobile')
const isOdd          = computed(() => props.index % 2 !== 0)
const imageSrcs = computed(() =>
  (props.project.images ?? []).map(img => img.path ?? img)
)

function formatDate(date) {
  if (!date) return null
  return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}
</script>

<template>
  <div
    ref="targetRef"
    class="flex flex-col lg:flex-row justify-center max-w-6xl mx-auto p-1 hover:scale-[101.8%] transition-transform duration-700"
  >
    <!-- TEXT COL -->
    <div class="flex flex-col justify-start p-6 flex-1 gap-3">

      <!-- Slug -->
      <div
        class="font-mono text-[18px] tracking-widest uppercase text-zinc-600 w-fit transition-all duration-[650ms]"
        :class="isVisible ? 'opacity-100' : 'opacity-0 -translate-x-4'"
      >
        $ projects / {{ project.slug }}
      </div>

      <div class="flex flex-col gap-2.5 flex-1">

        <!-- Title -->
        <h1
          class="text-5xl font-bold tracking-tight text-gray-700 dark:text-gray-200 leading-none transition-all duration-700 delay-[120ms] mb-2"
          :class="isVisible
            ? 'opacity-100 translate-x-0'
            : isOdd ? 'opacity-0 translate-x-12' : 'opacity-0 -translate-x-12'"
        >
          {{ project.name }}
        </h1>

        <!-- Identity bar -->
        <div
          class="flex items-center gap-2 flex-wrap transition-all duration-500 delay-[230ms]"
          :class="isVisible
            ? 'opacity-100 translate-y-0'
            : direction === 'up' ? 'opacity-0 -translate-y-3' : 'opacity-0 translate-y-3'"
        >
          <!-- Badge -->
          <span
            class="inline-flex transition-all duration-500 delay-[320ms]"
            :class="isVisible ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'"
          >
            <Badges :status="project.status" :size="22" />
          </span>

          <span class="text-zinc-700 text-xs select-none" aria-hidden="true">·</span>

          <h2 class="text-sm font-medium text-zinc-400 hover:text-green-400 transition-colors duration-300 underline decoration-zinc-600/40 underline-offset-2 w-fit">
            {{ typeLabel[project.type] ?? project.type }}
          </h2>

          <span class="text-zinc-700 text-xs select-none" aria-hidden="true">·</span>

          <span class="font-mono text-[11px] text-zinc-500">
            {{ formattedStart ?? '—' }}
            <span class="mx-1 text-zinc-700" aria-hidden="true">→</span>
            <span :class="project.end_date ? 'text-zinc-500' : 'text-emerald-500 font-semibold'">
              {{ formattedEnd ?? 'In Progress' }}
            </span>
          </span>
        </div>

        <!-- Description -->
        <p
          class="text-zinc-500 text-lg leading-relaxed max-w-md mt-1 transition-all duration-[650ms] delay-[340ms]"
          :class="isVisible
            ? 'opacity-100 translate-y-0 blur-none'
            : direction === 'up' ? 'opacity-0 -translate-y-4 blur-sm' : 'opacity-0 translate-y-4 blur-sm'"
        >
          {{ project.short_description }}
        </p>

        <!-- Links -->
        <div class="flex gap-4 justify-end mt-auto">
            <a
            v-if="project.github_url"
            :href="project.github_url"
            target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm dark:text-zinc-300 text-zinc-800 hover:text-zinc-500  dark:hover:text-white border border-zinc-700 hover:border-zinc-400 px-3 py-1.5 rounded-md transition-all duration-[250ms] delay-[60ms]"
            :class="isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'"
          >
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
        </a>
        <a
            v-if="project.live_url"
            :href="project.live_url"
            target="_blank" rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm font-medium text-zinc-900 bg-[#d3d3d3] hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-all duration-[250ms] delay-[60ms]"
            :class="isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-2'"
          >
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Live Demo
        </a>
        </div>

      </div>
    </div>

    <!-- VISUAL COL -->
    <div
      class="flex flex-col gap-3 w-full lg:shrink-0 p-2 lg:p-6 transition-all duration-[800ms] delay-[80ms]"
      :class="[
        isWide ? 'lg:w-[55%]' : 'lg:w-[35%]',
        isVisible
          ? 'opacity-100 translate-x-0 scale-100'
          : isOdd
            ? 'opacity-0 -translate-x-14 scale-[0.96]'
            : 'opacity-0 translate-x-14 scale-[0.96]'
      ]"
    >

      <!-- Tech tags -->
      <div v-if="project.technologies?.length" class="flex flex-wrap gap-1.5 px-1">
        <span
          v-for="tech in project.technologies" :key="tech.id"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium tracking-wide dark:bg-zinc-800/70 bg-zinc-100 dark:text-zinc-300 text-zinc-500 border dark:border-zinc-700/60 border-zinc-300 dark:hover:border-zinc-500 hover:border-zinc-400 dark:hover:text-white hover:text-zinc-600 transition-colors duration-200 whitespace-nowrap"
        >
          <img v-if="tech.icon" :src="tech.icon" :alt="tech.name" class="w-3.5 h-3.5 object-contain" loading="lazy" width="14" height="14" />
          {{ tech.name }}
        </span>
      </div>

      <!-- Image box -->
      <div
        class="flex flex-col rounded-2xl overflow-hidden border border-zinc-200/10 dark:border-zinc-700/40 bg-zinc-100 dark:bg-zinc-900/60 w-full"
        :class="isMobile ? 'min-h-[420px]' : 'min-h-[260px]'"
      >
        <!-- Image count indicator -->
        <div v-if="imageSrcs.length > 1" class="flex items-center gap-1 px-3 pt-2.5">
          <div
            v-for="(_, i) in imageSrcs.slice(0, 3)" :key="i"
            class="h-1 rounded-full bg-zinc-400/40 flex-1 max-w-[32px]"
          />
        </div>

        <!-- Images -->
        <div
  class="relative flex items-center justify-center flex-1 min-h-0 p-2 cursor-zoom-in"
  @click="openLightbox(0)"
>
  <MultiImage
    :images-src="imageSrcs"
    :alt="project.name"
    :type="project.type"
  />
</div>
<ImageLightbox
  v-if="lightboxOpen"
  :images="imageSrcs"
  :start-index="lightboxIndex"
  :alt="project.name"
  @close="lightboxOpen = false"
/>
        <!-- Social bar -->
        <div class="flex flex-row gap-1 justify-center py-2.5 px-3 mt-1 mx-2 mb-2 rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/40">
  
  <!-- Views -->
  <button type="button" aria-label="Views"
    class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-zinc-500 dark:text-zinc-400 text-xs font-mono">
    <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
    {{ views }}
  </button>

  <!-- Comments (static for now) -->
 <button type="button" aria-label="Comments"
  @click="emit('open-comments')"
  class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-mono transition-all">
  <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
  </svg>
  {{ comments.length }}
</button>

  <!-- Likes -->
  <button type="button" aria-label="Like" @click="toggleLike"
    class="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all group hover:bg-zinc-100 dark:hover:bg-zinc-700"
    :class="liked ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400'">
    <svg class="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform"
      :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
    </svg>
    {{ likes }}
  </button>

</div>
      </div>

    </div>
  </div>
</template>
