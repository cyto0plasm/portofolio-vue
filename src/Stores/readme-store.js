// stores/readme-store.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

const TOKEN = import.meta.env.VITE_GITHUB_TOKEN

export const useReadmeStore = defineStore('readme', () => {
  const cache     = ref({})
  const loadingId = ref(null)

  function repoPath(url) {
    const m = url?.match(/github\.com\/([^/]+\/[^/]+)/)
    return m ? m[1].replace(/\.git\/?$/, '') : null
  }

  async function fetch(project) {
    if (cache.value[project.id]) return
    loadingId.value = project.id
    try {
      const path = repoPath(project.github_url)
      if (!path) throw new Error('bad url')
      const res  = await window.fetch(`https://api.github.com/repos/${path}/readme`,
        { headers: TOKEN ? { Authorization: `token ${TOKEN}` } : {} })
      if (res.status === 404) { cache.value[project.id] = '_none_'; return }
      const { download_url } = await res.json()
      cache.value[project.id] = await (await window.fetch(download_url)).text()
    } catch {
      cache.value[project.id] = '_error_'
    } finally {
      loadingId.value = null
    }
  }

  return { cache, loadingId, fetch }
})