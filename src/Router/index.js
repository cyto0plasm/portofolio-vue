import { createRouter, createWebHistory } from "vue-router";

//pages
import Home from "@/Pages/Home.vue";
import Projects from "@/Pages/Projects.vue";
import AppLayout from "@/main/app-layout.vue";

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
    ]
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
