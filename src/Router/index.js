import { createRouter, createWebHistory } from "vue-router";

//pages
import Home from "@/Pages/Home.vue";
import Projects from "@/Pages/Projects.vue";
import AppLayout from "@/main/app-layout.vue";
import Contact from "@/Pages/Contact.vue";

// import About from '@/Pages/About.vue'
// import Contact from '@/Pages/Contact.vue'
// import Skills from '@/Pages/Skills.vue'

const routes = [
  {
    path: '/',
    component: AppLayout,      // ← shell that contains Nav, Aside, etc.
    children: [
      { path: '',         name: 'home',     component: Home },
      { path: 'projects', name: 'projects', component: Projects },
      { path: 'contact', name: 'contact', component: Contact },

      
      // dev only — stripped from production bundle
      ...(import.meta.env.DEV ? [
        {
          path: 'admin/projects',
          name: 'admin-projects',
          component: () => import('@/Pages/ProjectsCrud.vue'),
        }
      ] : [])
    
    ]
    
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
 scrollBehavior() {
  return { left: 0, top: 0 }
}
});
export default router;
