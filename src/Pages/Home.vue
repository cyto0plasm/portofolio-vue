<script setup>
import Hero from './home/hero.vue'
import Devider from '@/Components/devider.vue'
import Projects from './home/projects.vue'
import Skills from './home/skills.vue'
import { useHead } from '@unhead/vue'



useHead({
  title: "Zaki's Home",
  meta: [
    { name: 'description', content: "Youssef Zaki's Home Page" },
  ]
})
</script>

<template>

    
  <Hero />
  <Devider />
  <Projects />
  <Skills />
</template>