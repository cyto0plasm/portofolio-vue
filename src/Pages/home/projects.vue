<script setup>
import { storeToRefs } from 'pinia'
import { useHomeStore } from '../../Stores/home-store'
import Devider from '../../Components/devider.vue'
import ProjectCard from '@/Components/project-card.vue'

const { projects } = storeToRefs(useHomeStore())

const typeLabel = {
  web:     'Web Site',
  desktop: 'Desktop Application',
  mobile:  'Mobile Application',
}
</script>

<template>
  <section data-section>
    <div v-if="projects.length" class="min-h-[60vh]" id="projects">
      <template v-for="(project, i) in projects" :key="project.id">
        <Devider />
        <ProjectCard :project="project" :type-label="typeLabel" :index="i" />
      </template>
      <Devider />
    </div>

    <div v-else class="min-h-[20vh] flex items-center justify-center text-gray-500 dark:text-gray-200" >
      Empty Projects
    </div>
  </section>
</template>
