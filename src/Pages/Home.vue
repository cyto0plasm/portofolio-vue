<script setup>
import Hero from './home/hero.vue'
import Devider from '@/Components/devider.vue'
import Projects from './home/projects.vue'
import Skills from './home/skills.vue'
import { useHead } from '@unhead/vue'
import About from './home/about.vue'



useHead({
  title: "Home",
  meta: [
    { name: 'description', content: "Youssef Zaki's Home Page" },
  ],
    link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/images/favIconProtofolio2.ico'
    }
  ]
})
</script>

<template>

    
  <Hero />
  <About />
  <Projects />
  <Skills />
</template>