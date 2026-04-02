//firebase migrate
// import { db } from './firebase'
// import { doc, setDoc } from 'firebase/firestore'

// const slugs = ['taskly', 'techlink', 'bills', 'pms', 'lms']

// for (const slug of slugs) {
//   await setDoc(doc(db, 'projects', slug), { views: 0, likes: 0 })
// }

import '@fontsource/ubuntu/300.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import './app.css'

import { createApp }      from 'vue'
import { createPinia }    from 'pinia'
import { createHead }     from '@unhead/vue/client'
import Lenis              from 'lenis'
import router             from './Router/index.js'
import App                from './App.vue'
import { useLayoutStore } from './Stores/layout-store'
import { i18n, detectLanguage } from './i18n/index.js'

async function bootstrap() {
  // Detect language — falls back to 'en' internally if anything fails
  let lang = 'en'
  try {
    lang = await detectLanguage()
  } catch {
    console.warn('[i18n] Language detection failed, using default:', lang)
  }

  try {
    i18n.global.locale.value = lang
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  } catch {
    console.warn('[i18n] Failed to apply language settings')
  }

  const pinia = createPinia()
  const app   = createApp(App)
  const head  = createHead()

  app.use(router)
  app.use(pinia)
  app.use(head)
  app.use(i18n)

  // Lenis smooth scroll
  try {
    const lenis = new Lenis({
      prevent: node => node.closest?.('.term-root') !== null,
    })
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf) }
    requestAnimationFrame(raf)
    app.config.globalProperties.$lenis = lenis
  } catch {
    console.warn('[lenis] Smooth scroll failed to initialize')
  }

  app.mount('#app')

  const updateOnlineStatus = () => {
  document.documentElement.dataset.online = navigator.onLine
}
updateOnlineStatus()
window.addEventListener('online',  updateOnlineStatus)
window.addEventListener('offline', updateOnlineStatus)
  
  // Terminal shortcut — after mount so pinia is active
  try {
    const layout = useLayoutStore()
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        layout.terminalOpen = !layout.terminalOpen
      }
      if (e.key === 'Escape' && layout.terminalOpen) {
        e.preventDefault()
        layout.terminalOpen = false
      }
    })
  } catch {
    console.warn('[terminal] Keyboard shortcut failed to register')
  }
}

bootstrap().catch(err => {
  // Last resort — app failed to boot entirely
  console.error('[bootstrap] Fatal error, attempting bare mount:', err)
  try {
    createApp(App).mount('#app')
  } catch {
    document.body.innerHTML = '<p style="padding:2rem">Something went wrong. Please refresh.</p>'
  }
})