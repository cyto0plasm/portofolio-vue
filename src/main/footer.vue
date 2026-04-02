<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useLayoutStore } from '../Stores/layout-store.js'
import { useI18n } from 'vue-i18n'

const layout = useLayoutStore()
const route  = useRoute()
const { t, locale } = useI18n()

const currentYear = new Date().getFullYear()

const navLinks = computed(() => [
  { label: t('nav.home'),     to: '/' },
  { label: t('nav.projects'), to: '/projects' },
  { label: t('nav.contact'),  to: '/contact' },
])

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/cyto0plasm',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483
               0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466
               -.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832
               .092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688
               -.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844
               a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651
               .64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855
               0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017
               C22 6.484 17.522 2 12 2z"/>
    </svg>`,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/youssef-zakiz/',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136
               2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37
               4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063
               2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542
               C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222
               0h.003z"/>
    </svg>`,
  },
  {
    label: 'Twitter / X',
    href: 'https://x.com/Yousif_Zaki202',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747
               l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>`,
  },
]

const isActive = (to) =>
  to === '/' ? route.path === '/' : route.path.startsWith(to)
</script>

<template>
  <footer
    class="w-full border-t border-gray-200/60 dark:border-white/10
           bg-white/80 dark:bg-[#272727] backdrop-blur-md"
  >
    <!-- Main footer body -->
    <div class="max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

      <!-- ① Brand + tagline -->
      <div class="flex flex-col gap-3">
        <RouterLink to="/" class="flex items-center gap-0 no-underline select-none w-fit">
          <span class="text-[1.05rem] font-semibold tracking-tight transition-colors duration-200"
                :style="{ color: layout.preferedColor }">
            {{ t('nav.logo1') }}&nbsp;
          </span>
          <span class="text-[1.05rem] font-semibold tracking-tight text-gray-800 dark:text-white/90">
            {{ t('nav.logo2') }}
          </span>
        </RouterLink>

        <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-[22ch]">
          {{ t('footer.tagline', 'Crafting digital experiences with care.') }}
        </p>

        <!-- Social icons -->
        <div class="flex items-center gap-2 mt-1">
          <a
            v-for="s in socialLinks"
            :key="s.label"
            :href="s.href"
            :aria-label="s.label"
            target="_blank"
            rel="noopener noreferrer"
            class="w-8 h-8 flex items-center justify-center rounded-lg
                   border border-gray-200 dark:border-white/15
                   text-gray-500 dark:text-gray-400
                   hover:text-gray-900 dark:hover:text-white
                   hover:border-gray-400 dark:hover:border-white/40
                   hover:-translate-y-0.5 active:scale-90
                   transition-all duration-150"
            v-html="s.icon"
          />
        </div>
      </div>

      <!-- ② Navigation -->
      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {{ t('footer.nav', 'Navigation') }}
        </h3>
        <ul class="flex flex-col gap-1.5 list-none m-0 p-0">
          <li v-for="item in navLinks" :key="item.label">
            <RouterLink
              :to="item.to"
              class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                     transition-colors duration-150 no-underline flex items-center gap-1.5 group w-fit"
              :class="{ 'font-medium': isActive(item.to) }"
              :style="isActive(item.to) ? { color: layout.preferedColor } : {}"
            >
              <span class="w-1 h-1 rounded-full bg-current opacity-0 group-hover:opacity-100
                           transition-opacity duration-150"
                    :class="{ 'opacity-100': isActive(item.to) }" />
              {{ item.label }}
            </RouterLink>
          </li>
        </ul>
      </div>

      <!-- ③ Quick actions -->
      <div class="flex flex-col gap-3">
        <h3 class="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
          {{ t('footer.contact', 'Get in touch') }}
        </h3>

        <a
          href="mailto:yousifzaki017@gmail.com"
          class="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white
                 transition-colors duration-150 no-underline w-fit"
        >
          yousifzaki017@gmail.com
        </a>

        <!-- Download CV -->
        <a
          href="/resume.pdf"
          download="Youssef-Zaki_CV.pdf"
          class="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit
                 text-xs font-medium transition-all duration-200
                 border border-gray-200 dark:border-white/15
                 text-gray-600 dark:text-gray-300
                 hover:bg-gray-100 dark:hover:bg-white/10 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          {{ t('nav.cv') }}
        </a>
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      class="border-t border-gray-200/60 dark:border-white/10
             px-6 sm:px-10 lg:px-14 py-4
             flex flex-col sm:flex-row items-center justify-between gap-2"
    >
      <p class="text-xs text-gray-400 dark:text-gray-500">
        © {{ currentYear }}
        <span :style="{ color: layout.preferedColor }">{{ t('nav.logo1') }}</span>
        {{ t('nav.logo2') }} · {{ t('footer.rights', 'All rights reserved.') }}
      </p>

      <p class="text-xs text-gray-400 dark:text-gray-500">
        {{ t('footer.built', 'Built with Vue 3 + Tailwind CSS') }}
      </p>
    </div>
  </footer>
</template>