<script setup>
import { storeToRefs } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useScroll } from '../../composables/useScrollReveal.js'
import { useHomeStore } from '../../Stores/home-store'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

const homeStore = useHomeStore()
const { categories, filteredTechnologies, activeCategory } = storeToRefs(homeStore)

const iconErrors = ref({})
const { targetRef, isVisible } = useScroll({ threshold: 0.15 })
const isMobile = ref(window.innerWidth < 640)

window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 640
})
const ITEMS_PER_PAGE = computed(() => isMobile.value ? 6 : 10)
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.ceil(filteredTechnologies.value.length / ITEMS_PER_PAGE.value)
)

const paginatedTechnologies = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE.value
  return filteredTechnologies.value.slice(start, start + ITEMS_PER_PAGE.value)
})

// Reset to page 1 when filter changes
watch(activeCategory, () => { currentPage.value = 1 })
</script>

<template>
  <section
    id="skills"
    data-section
    ref="targetRef"
    class="skills-section relative w-full max-w-6xl mx-auto px-6 py-24"
  >
    <!-- HEADER -->
    <div class="anim-header mb-10" :class="{ visible: isVisible }">
      <p class="font-mono text-[16px] tracking-widest uppercase dark:text-zinc-500 mb-3">
        $ stack / technologies
      </p>
      <h2 class="text-4xl font-bold tracking-tight text-gray-700 dark:text-gray-200 leading-none">
        {{ t('skills.title') }}
      </h2>
      <p class="mt-3 text-zinc-500 text-base max-w-md">
        {{ t('skills.desc') }}
      </p>
    </div>

    <!-- CATEGORY FILTER -->
    <div class="anim-header flex flex-wrap gap-2 mb-8" :class="{ visible: isVisible }">
      <button
        v-for="cat in categories"
        :key="cat"
        class="px-3 py-1 rounded-full border font-mono text-xs font-semibold transition-all duration-200"
        :class="activeCategory === cat
          ? 'bg-zinc-800 text-white border-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 dark:border-zinc-200'
          : 'border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300'"
        @click.prevent.stop="activeCategory = cat"
      >
        {{ cat }}
      </button>
    </div>

    <!-- GRID -->
    <div class="flex flex-wrap gap-3 w-full">
      <div
        v-for="(tech, i) in paginatedTechnologies"
        :key="tech.id"
        class="tech-card anim-card group flex flex-col items-center gap-3 p-2 w-24 shrink-0
               rounded-xl border border-zinc-400 hover:border-zinc-500 dark:border-zinc-500 dark:bg-[#2c2c2c]
               hover:dark:bg-[#353434] transition-colors duration-200 cursor-default"
        :class="{ visible: isVisible }"
        :style="{ transitionDelay: isVisible ? `${i * 40}ms` : '0ms' }"
      >
        <div class="w-9 h-9 flex items-center justify-center">
          <img
            v-if="tech.icon && !iconErrors[tech.id]"
            :src="tech.icon"
            :alt="tech.name"
            class="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200 mix-blend-screen"
            loading="lazy"
            width="36" height="36"
            @error="iconErrors[tech.id] = true"
          />
          <span v-else
            class="text-lg font-bold text-zinc-800 dark:text-zinc-500 dark:group-hover:text-zinc-300
                   group-hover:text-zinc-950 transition-colors">
            {{ tech.name[0] }}
          </span>
        </div>
        <span class="font-mono text-[11px] tracking-wide text-zinc-500 dark:text-zinc-400
                     group-hover:text-zinc-700 group-hover:font-semibold dark:group-hover:text-zinc-200
                     transition-colors text-center leading-tight">
          {{ tech.name }}
        </span>
      </div>
    </div>

    <!-- PAGINATION -->
    <div
      v-if="totalPages > 1"
      class="anim-header flex items-center justify-center gap-3 mt-8"
      :class="{ visible: isVisible }"
    >
      <!-- Prev -->
      <button
        :disabled="currentPage === 1"
        class="px-3 py-1 rounded-full border font-mono text-xs font-semibold transition-all duration-200
               border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-700
               dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="currentPage--"
      >
         {{ locale.value === 'ar' ?   t('buttons.prev')+' →' : '← '+t('buttons.prev')   }}
      </button>

      <!-- Dots -->
      <div class="flex items-center gap-2">
        <button
          v-for="page in totalPages"
          :key="page"
          class="w-2 h-2 rounded-full transition-all duration-200"
          :class="page === currentPage
            ? 'bg-zinc-800 dark:bg-zinc-200 scale-125'
            : 'bg-zinc-400 dark:bg-zinc-600 hover:bg-zinc-600 dark:hover:bg-zinc-400'"
          @click="currentPage = page"
        />
      </div>

      <!-- Next -->
      <button
        :disabled="currentPage === totalPages"
        class="px-3 py-1 rounded-full border font-mono text-xs font-semibold transition-all duration-200
               border-zinc-400 text-zinc-500 hover:border-zinc-600 hover:text-zinc-700
               dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
        @click="currentPage++"
      >
         {{ locale.value === 'ar' ?  t('buttons.next')+' ←' : t('buttons.next') + ' →' }}

      </button>
    </div>
  </section>
</template>

<style scoped>
.anim-header {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.anim-header.visible { opacity: 1; transform: translateY(0); }

.anim-card {
  opacity: 0;
  transform: scale(0.88) translateY(12px);
  will-change: transform, opacity;
  transition:
    opacity   0.45s cubic-bezier(.22, 1, .36, 1),
    transform 0.45s cubic-bezier(.22, 1, .36, 1);
}
.anim-card.visible { opacity: 1; transform: scale(1) translateY(0); will-change: auto; }
</style>