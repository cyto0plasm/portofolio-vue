<script setup>
import { useI18n } from 'vue-i18n'
import { useLayoutStore } from '../../Stores/layout-store'
import { useScroll } from '../../composables/useScrollReveal.js'
import GithubGraph from '@/Components/github-graph.vue'

const { t, locale } = useI18n()
const layout = useLayoutStore()
const { targetRef: aboutRef, isVisible, direction } = useScroll({ threshold: 0.2,  rootMargin: '0px 0px 0px 0px' })

  </script>

<template>
  <section
    id="about"
    data-section
    ref="aboutRef"
    class="reveal-wrap relative py-18 px-5 sm:px-8 lg:px-14"
    :class="{ visible: isVisible }"
    :data-dir="direction ?? 'down'"
    :style="`--c: ${layout.preferedColor}`"
    aria-label="About"
  >
    <!-- top divider -->
    <div class="absolute top-0 inset-x-0 h-px pointer-events-none"
      :style="`background: linear-gradient(to right, transparent, color-mix(in srgb, ${layout.preferedColor} 25%, transparent), transparent)`"
      aria-hidden="true" />

    <div class="relative z-10 w-full max-w-3xl mx-auto flex flex-col gap-10">

      <!-- label -->
      <p class="reveal-item font-mono text-[1rem] font-semibold uppercase tracking-widest text-gray-400 m-0" style="--i:0">
        $ {{ t('about.label') }}
      </p>

      <!-- bio -->
      <div class="reveal-item" style="--i:1" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
        <h2 class="m-0 text-2xl sm:text-3xl font-bold leading-snug tracking-tight text-gray-600 dark:text-gray-200">
          {{ t('about.bio') }}
        </h2>
      </div>

      <!-- actions row -->
      <div class="reveal-item flex flex-wrap items-center gap-3" style="--i:2">
        <a
          href="https://github.com/cyto0plasm"
          target="_blank" rel="noopener"
          class="inline-flex items-center gap-2 text-sm font-semibold no-underline
                 text-gray-500 dark:text-gray-400
                 hover:text-gray-900 dark:hover:text-white
                 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          github.com/cyto0plasm
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </a>

        <a
          href="/cv.pdf" download
          class="inline-flex items-center gap-1.5 text-sm font-semibold no-underline
                 px-4 py-2 rounded-lg border
                 border-gray-200 dark:border-white/10
                 text-gray-700 dark:text-white/80
                 hover:border-[var(--c)] hover:text-[var(--c)]
                 transition-all duration-200 hover:-translate-y-px"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('about.cv_btn') }}
        </a>
      </div>

      <!-- github graph -->
      <div class="reveal-item" style="--i:3">
        <GithubGraph />
      </div>

    </div>

    <!-- bottom divider -->
    <div class="absolute bottom-0 inset-x-0 h-px pointer-events-none"
      :style="`background: linear-gradient(to right, transparent, color-mix(in srgb, ${layout.preferedColor} 20%, transparent), transparent)`"
      aria-hidden="true" />
  </section>
</template>

<style scoped>
.reveal-wrap[data-dir="down"] { --from: 28px; }
.reveal-wrap[data-dir="up"]   { --from: -28px; }
.reveal-item {
  opacity: 0;
  transform: translateY(var(--from, 28px));
  transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1);
  transition-delay: calc(var(--i, 0) * 100ms + 200ms);
}
.reveal-wrap.visible .reveal-item { opacity: 1; transform: none; }
</style>