import '@fontsource/ubuntu/300.css'
import '@fontsource/ubuntu/400.css'
import '@fontsource/ubuntu/500.css'
import '@fontsource/ubuntu/700.css'
import './app.css'

//firebase migrate
// import { db } from './firebase'
// import { doc, setDoc } from 'firebase/firestore'

// const slugs = ['taskly', 'techlink', 'bills', 'pms', 'lms']

// for (const slug of slugs) {
//   await setDoc(doc(db, 'projects', slug), { views: 0, likes: 0 })
// }

import { createApp }      from 'vue'
import { createPinia }    from 'pinia'
import { createHead  } from '@unhead/vue/client'
import Lenis              from 'lenis'
import router             from './Router/index.js'
import App                from './App.vue'          //  root shell
import { useLayoutStore } from './Stores/layout-store'

const pinia = createPinia()
const app   = createApp(App)
const head = createHead()

app.use(router)
app.use(pinia)
app.use(head)

// Lenis smooth scroll
const lenis = new Lenis({
  prevent: node => node.closest?.('.term-root') !== null,
})
const raf = time => { lenis.raf(time); requestAnimationFrame(raf) }
requestAnimationFrame(raf)

app.config.globalProperties.$lenis = lenis   // ← before mount

app.mount('#app')

// Terminal shortcut — after mount so pinia is active
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