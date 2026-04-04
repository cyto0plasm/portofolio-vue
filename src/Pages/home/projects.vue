<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '../../Stores/home-store'
import { useLayoutStore } from '../../Stores/layout-store'
import { useI18n } from 'vue-i18n'
import Devider from '../../Components/devider.vue'
import ProjectCard from '@/Components/project-card.vue'
import ProjectComments from '@/Components/project-comments.vue'
import { computed, ref } from 'vue'
import { useScroll } from '../../composables/useScrollReveal.js'

const { targetRef: projectsIntroRef, isVisible: introVisible, direction: introDirection } 
  = useScroll({ threshold: 0.01 })
const { t, locale } = useI18n()
const { projects } = storeToRefs(useHomeStore())
const { preferedColor } = storeToRefs(useLayoutStore())
const openCommentSlug = ref(null)

const typeLabel = computed(() => {
  const isAr = locale.value === 'ar'
  return {
    web:     isAr ? 'موقع ويب'            : 'Web Site',
    desktop: isAr ? 'تطبيق سطح المكتب'   : 'Desktop Application',
    mobile:  isAr ? 'تطبيق موبايل'        : 'Mobile Application',
  }
})
</script>

<template>
 <section 
    id="projects" 
    ref="projectsIntroRef"
    class="projects-section reveal-wrap relative"
    :class="{ visible: introVisible }"
    :data-dir="introDirection ?? 'down'"
  >
    <!-- Smooth top fade – blends with hero's bottom fade -->
    <div class="section-top-fade" aria-hidden="true"></div>

    <div v-if="projects.length" class="min-h-[60vh] relative z-10">
      <!-- intro with reveal animations -->
      <div class="mt-4 mb-4 max-w-6xl mx-auto p-6">
        <p 
          class="reveal-item font-mono text-[0.65rem] tracking-widest uppercase text-gray-400 dark:text-zinc-500 mb-3"
          style="--i: 0"
        >
          ${{ locale === 'ar' ? ' شغل / مشاريع' : ' work / projects' }} {{ projects.length ? ` (${projects.length})` : '' }}
        </p>
        <h2 
          class="reveal-item text-4xl font-bold tracking-tight leading-none mb-3"
          style="--i: 1"
        >
          <span class="text-gray-700 dark:text-gray-200">{{ t('projects.h1') }} </span>
          <span :style="{ color: preferedColor }">{{ t('projects.h2') }}</span>
        </h2>
        <p 
          class="reveal-item mt-3 text-zinc-500 dark:text-zinc-400 text-base max-w-md"
          style="--i: 2"
        >
          {{ t('projects.desc') }}
        </p>
      </div>

      <div class="reveal-item" style="--i: 3">
        <Devider />
      </div>

      <template v-for="(project, i) in projects" :key="project.id">
        <div :id="`project-${project.slug}`" data-section class="min-h-[60vh]">
          <ProjectCard
            :project="project"
            :type-label="typeLabel"
            :index="i"
            @open-comments="openCommentSlug = project.slug"
          />
          <ProjectComments
            :slug="project.slug"
            :force-open="openCommentSlug === project.slug"
          />
        </div>
        <Devider />
      </template>

      <Devider />
    </div>

    <div v-else class="min-h-[20vh] flex items-center justify-center text-gray-500 dark:text-gray-200 relative z-10">
      Empty Projects
    </div>
  </section>
</template>

<style scoped>
/* ── reveal animation (mirrors hero) ───────────────────────── */
.reveal-wrap[data-dir="down"] {
  --from: 28px;
}
.reveal-wrap[data-dir="up"] {
  --from: -28px;
}

.reveal-item {
  opacity: 0;
  transform: translateY(var(--from, 28px));
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  transition-delay: calc(var(--i, 0) * 80ms);
}

.reveal-wrap.visible .reveal-item {
  opacity: 1;
  transform: none;
}
</style>