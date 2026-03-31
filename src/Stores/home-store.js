import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import projectsData from '../data/projects.json'

export const useHomeStore = defineStore('home', () => {
  // flatten all technologies from all projects, deduplicate by id
 const allTechs = projectsData.flatMap(p => p.technologies ?? [])
const seen = new Set()
const uniqueTechs = allTechs.filter(t => {
  if (!t || !t.id) return false        // ← guard against missing id
  if (seen.has(t.id)) return false
  seen.add(t.id)
  return true
})

  const projects      = ref(projectsData)
  const technologies  = ref(uniqueTechs)
  const activeCategory = ref('All')

  const categories = computed(() => {
    const cats = [...new Set(
      technologies.value.map(t => t.category?.name).filter(Boolean)
    )]
    return ['All', ...cats]
  })

  const filteredTechnologies = computed(() =>
    activeCategory.value === 'All'
      ? technologies.value
      : technologies.value.filter(t => t.category?.name === activeCategory.value)
  )

  // keep init() in case you want to override data later
  function init({ projects: p, technologies: t }) {
    projects.value    = p
    technologies.value = t
  }

  return { projects, technologies, activeCategory, init, categories, filteredTechnologies }
})