import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ── Configuration ──────────────────────────────────────────────
const GITHUB_USERNAME = 'cyto0plasm'
const MODEL = 'llama-3.3-70b-versatile'
const MAX_TOKENS = {
  GREETING: 30, ABOUT: 200, PROJECT: 300, 
  SKILLS: 280, HIRING: 280, COMPARISON: 320, GENERAL: 180,
}

// ── Utility Helpers (Outside store to keep it clean) ────────────
const cleanReadme = (text) => {
  if (!text) return ''
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')      // images
    .replace(/<[^>]*>/g, '')               // HTML
    .replace(/https?:\/\/\S+/g, '')        // URLs
    .replace(/#+\s*/g, '')                 // Headers
    .replace(/\n{3,}/g, '\n\n')            // whitespace
    .trim().slice(0, 300)
}

export const useRoboStore = defineStore('robo', () => {
  // ── State ────────────────────────────────────────────────────
  const messages = ref([])
  const projects = ref([])
  const streaming = ref(false)
  const isInitialized = ref(false)

  // ── GitHub Logic ─────────────────────────────────────────────
  async function fetchRepos() {
      if (!navigator.onLine) {
    console.warn('⚠️ Offline — skipping GitHub fetch')
    return []
  }
    try {
      const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, {
        headers: import.meta.env.VITE_GITHUB_TOKEN 
          ? { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } 
          : {}
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to fetch repos')
      }

      const data = await res.json()
      if (!Array.isArray(data)) return []

      return data.filter(r => !r.fork && !r.archived && r.description)
        .map(repo => ({
          name: repo.name,
          description: repo.description,
          url: repo.html_url,
        }))
    } catch (err) {
      console.error("❌ GitHub Repo Fetch Failed:", err.message)
      return []
    }
  }

 async function fetchReadme(repoName) {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/readme`, {
      headers: import.meta.env.VITE_GITHUB_TOKEN 
        ? { Authorization: `Bearer ${import.meta.env.VITE_GITHUB_TOKEN}` } 
        : {}
    });

    // If 403 (Rate Limit) or 404 (No Readme), exit silently
    if (!res.ok) return null;

    const data = await res.json();
    return atob(data.content);
  } catch (err) {
    // Catch network errors, but don't log them to keep console clean
    return null;
  }
}

  async function initStore() {
    if (isInitialized.value) return
    isInitialized.value = true
    
    const repoList = await fetchRepos()
    
    // Batch fetch Readmes (limit to first 12 to save rate limit/tokens)
    const processed = await Promise.all(
      repoList.slice(0, 12).map(async (repo) => {
        const rawReadme = await fetchReadme(repo.name)
        return {
          ...repo,
          readme: cleanReadme(rawReadme),
          hasReadme: !!rawReadme
        }
      })
    )
    projects.value = processed
  }

  // ── AI Context Builders ──────────────────────────────────────
 const projectsContext = computed(() => {
  if (projects.value.length === 0) return "No project details available right now."
  return projects.value.map(p => 
    `• ${p.name}: ${p.description} (GitHub: ${p.url}) ${p.readme ? `\n  Context: ${p.readme}` : ''}`
  ).join('\n')
})

  function detectIntent(q) {
    q = q.toLowerCase()
    if (/^(hi|hello|hey|مرحبا|اهلا)/.test(q)) return 'GREETING'
    if (/(hire|job|work|email|تواصل|شغل)/.test(q)) return 'HIRING'
    if (/(project|app|built|مشروع|تطبيق)/.test(q)) return 'PROJECT'
    if (/(skill|tech|stack|تقنية)/.test(q)) return 'SKILLS'
    if (/(who|about|youssef|مين|انت)/.test(q)) return 'ABOUT'
    return 'GENERAL'
  }

  // ── Core Actions ─────────────────────────────────────────────
  async function ask(question, onToken) {
    if (!question || streaming.value) return

  if (!navigator.onLine) {
    messages.value.push({ role: 'user', text: question })
    messages.value.push({ role: 'bot', text: "⚠️ You're offline. Please check your connection." })
    return
  }
  
    if (!question || streaming.value) return
    
    // Ensure data is loaded before first question
    if (projects.value.length === 0) await initStore()

    messages.value.push({ role: 'user', text: question })
    streaming.value = true

    const isArabic = /[\u0600-\u06FF]/.test(question)
    const intent = detectIntent(question)
    const botIdx = messages.value.push({ role: 'bot', text: '' }) - 1

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.5,
          max_tokens: MAX_TOKENS[intent],
          stream: true,
          messages: [
            { role: 'system', content: buildSystemPrompt(intent, isArabic, projectsContext.value) },
            ...getLastHistory(8),
            { role: 'user', content: question }
          ]
        }),
      })

      if (!response.ok) throw new Error(`AI Offline (${response.status})`)

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')
        
        for (const line of lines) {
          if (line.includes('[DONE]')) break
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            const token = data.choices[0]?.delta?.content
            if (token) {
              messages.value[botIdx].text += token
              onToken?.()
            }
          } catch (e) { /* ignore parse errors for partial chunks */ }
        }
      }
    } catch (err) {
      messages.value[botIdx].text = `⚠️ ${err.message}`
    } finally {
      streaming.value = false
    }
  }

  // ── Helpers ──────────────────────────────────────────────────
  function getLastHistory(limit) {
    return messages.value.slice(-limit).map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: m.text
    }))
  }

  function reset() {
    messages.value = []
    streaming.value = false
  }

  // Initial load
  initStore()

  return { messages, streaming, projects, ask, reset }
})

// ── Separate System Prompt logic for readability ───────────────
function buildSystemPrompt(intent, isArabic, context) {
  const langRules = isArabic 
    ? "رد بالعامية المصرية. التقنيات بالإنجليزي. الجامعة: جامعة برج العرب التكنولوجية." 
    : "Casual English. University: Borg El-Arab Technological University (BATU)."

  return `You are Robo, Youssef Zaki's AI.
  ${langRules}
  Max 3 sentences. Bold tech names.
  Never write out URLs — the UI handles links automatically.
  
  CONTEXT:
  ${context}
  
  INTENT: ${intent}`
}