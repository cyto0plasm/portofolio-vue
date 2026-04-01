<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useHomeStore }   from '@/Stores/home-store'
import { useLayoutStore } from '@/Stores/layout-store'
import { useReadmeStore } from '@/Stores/readme-store'
import { useScroll }      from '@/composables/useScrollReveal.js'
import { useHead } from '@unhead/vue'

useHead({
  title: "Zaki's Projects",
  meta: [
    { name: 'description', content: "Youssef Zaki's Projects Page" },
  ]
})

const { projects }  = storeToRefs(useHomeStore())
const mainColor     = computed(() => useLayoutStore().preferedColor)
const readme        = useReadmeStore()

const { targetRef: pageRef, direction } = useScroll({ threshold: 0 })
const openId    = ref(null)
const hoveredId = ref(null)

async function toggle(project) {
  openId.value = openId.value === project.id ? null : project.id
  if (openId.value) await readme.fetch(project)
}

function md(raw, project) {
  if (!raw || raw === '_none_') return '<p>No README available.</p>'
  if (raw === '_error_')        return '<p>Failed to load README.</p>'

  const base = project?.github_url
    ? project.github_url
        .replace('github.com', 'raw.githubusercontent.com')
        .replace(/\/?$/, '/') + 'main/'
    : ''

  return raw.slice(0, 5000)
    .replace(/```[\w]*\n?([\s\S]*?)```/g, (_, c) =>
      `<pre><code>${c.replace(/</g,'&lt;').replace(/>/g,'&gt;').trim()}</code></pre>`)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#{4} (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,   '<h2>$1</h2>')
    .replace(/^# (.+)$/gm,    '<h1>$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,         '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) => {
      const resolved = src.startsWith('http') ? src : base + src
      return `<img src="${resolved}" alt="${alt}" style="display:inline;vertical-align:middle;margin:2px 3px;max-width:100%;" />`
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">$1</a>')
    .replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/^> (.+)$/gm,    '<blockquote>$1</blockquote>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\[x\]/gi, '✅')
    .replace(/\[ \]/g,  '☐')
    .replace(/^---$/gm, '<hr>')
    .replace(/\n\n/g, '</p><p>')
}
</script>

<template>
  <section
    ref="pageRef"
    class="reveal-wrap min-h-screen px-5 sm:px-8 lg:px-14 pt-28 pb-16 max-w-4xl mx-auto visible"
    :data-dir="direction ?? 'down'"
  >
    <!-- Header -->
    <div class="mb-14">
      <p class="reveal-item text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400 mb-2" style="--i:0">
        Portfolio / Projects
      </p>
      <h1 class="reveal-item font-black leading-[.9] tracking-tighter text-[clamp(2rem,6vw,3.5rem)]" style="--i:1">
        <span class="block text-gray-700 dark:text-gray-300">Things I've</span>
        <span class="block" :style="{ color: mainColor }">Built</span>
      </h1>
    </div>

    <!-- Rows -->
    <div
      v-for="(p, idx) in projects" :key="p.id"
      class="reveal-item border-t border-gray-100 dark:border-gray-800/70 last:border-b"
      :style="`--i:${idx + 2}`"
    >
      <!-- Row -->
      <div
        class="flex items-start justify-between gap-5 py-7 cursor-pointer select-none"
        @click="toggle(p)"
        @mouseenter="hoveredId = p.id"
        @mouseleave="hoveredId = null"
      >
        <!-- Left -->
        <div class="flex items-start gap-4">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 ring-1 ring-black/5 dark:ring-white/5">
            <img v-if="p.logo" :src="p.logo" :alt="p.name" class="w-full h-full object-cover" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300 dark:text-zinc-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14"/>
              </svg>
            </div>
          </div>

          <div>
            <p class="font-mono text-[0.58rem] tracking-widest text-gray-300 dark:text-gray-600 mb-0.5">
              {{ String(idx + 1).padStart(2, '0') }}
            </p>
            <p
              class="text-[1.05rem] font-bold transition-colors duration-200 text-gray-800 dark:text-gray-100"
              :style="hoveredId === p.id ? { color: mainColor } : {}"
            >{{ p.name }}</p>
            <p class="text-[0.82rem] text-gray-400 mt-0.5 leading-relaxed">{{ p.short_description }}</p>
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span
                v-for="t in p.technologies" :key="t.id"
                class="font-mono text-[0.6rem] border border-gray-200 dark:border-gray-700 text-gray-400 px-2 py-0.5 rounded-full"
              >{{ t.name }}</span>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="flex flex-col items-end gap-2.5 shrink-0 pt-0.5">
          <div class="flex gap-2">
            <a v-if="p.live_url"    :href="p.live_url"    target="_blank" rel="noopener" @click.stop class="pill-link" :style="{ '--c': mainColor }">Live ↗</a>
            <a v-if="p.github_url"  :href="p.github_url"  target="_blank" rel="noopener" @click.stop class="pill-link" :style="{ '--c': mainColor }">GitHub ↗</a>
          </div>
          <span
            class="font-mono text-[0.62rem] text-gray-400 transition-colors flex items-center gap-1"
            :style="openId === p.id ? { color: mainColor } : {}"
          >
            <span
              class="transition-transform duration-300 inline-block"
              :style="openId === p.id ? 'transform:rotate(180deg)' : ''"
            >▼</span>
            {{ openId === p.id ? 'close' : 'readme' }}
          </span>
        </div>
      </div>

      <!-- README panel -->
      <Transition
        enter-active-class="transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
        enter-from-class="opacity-0 -translate-y-2"
        leave-active-class="transition-all duration-200 ease-in"
        leave-to-class="opacity-0"
      >
        <div v-if="openId === p.id" class="mb-8">
          <div class="readme-body" @wheel.stop>
            <div v-if="readme.loadingId === p.id" class="flex items-center gap-2 py-1">
              <span class="readme-dot" style="--d:0s" />
              <span class="readme-dot" style="--d:.15s" />
              <span class="readme-dot" style="--d:.3s" />
              <span class="text-[0.72rem] text-gray-500 ml-1">Loading…</span>
            </div>
            <div v-else class="readme-content" v-html="md(readme.cache[p.id],p)" />
          </div>
        </div>
      </Transition>
    </div>
  </section>
</template>

<style scoped>
/* reveal */
.reveal-wrap[data-dir="down"] { --from: 28px; }
.reveal-wrap[data-dir="up"]   { --from: -28px; }
.reveal-item {
  opacity: 0; transform: translateY(var(--from, 28px));
  transition: opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1);
  transition-delay: calc(var(--i, 0) * 80ms);
}
.reveal-wrap.visible .reveal-item { opacity: 1; transform: none; }

/* pill links */
.pill-link {
  font-family: ui-monospace, monospace; font-size: 0.65rem;
  border: 1px solid rgb(209 213 219); color: rgb(156 163 175);
  padding: 2px 12px; border-radius: 999px;
  transition: color .15s, border-color .15s;
}
.pill-link:hover { color: var(--c); border-color: var(--c); }

/* readme shell */
.readme-body {
  overflow-y: auto; max-height: 480px; overscroll-behavior: contain;
  padding: 1.5rem 1.75rem; border-radius: 1rem;
  background: #07070f; border: 1px solid #14142a;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  position: relative;
}
.readme-body::before {
  content: ''; position: absolute; top: 0; left: 1.5rem; right: 1.5rem;
  height: 2px; background: v-bind(mainColor); opacity: 0.5; border-radius: 0 0 4px 4px;
}

/* scrollbar */
.readme-body::-webkit-scrollbar { width: 3px; }
.readme-body::-webkit-scrollbar-track { background: transparent; }
.readme-body::-webkit-scrollbar-thumb { background: #222238; border-radius: 999px; }
.readme-body::-webkit-scrollbar-thumb:hover { background: v-bind(mainColor); }
.readme-body { scrollbar-width: thin; scrollbar-color: #222238 transparent; }

/* loading dots */
.readme-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: v-bind(mainColor); opacity: .35;
  animation: dp 1.2s ease-in-out infinite; animation-delay: var(--d, 0s);
}
@keyframes dp { 0%,80%,100% { transform:scale(1);opacity:.35; } 40% { transform:scale(1.6);opacity:1; } }

/* markdown */
.readme-body :deep(h1) { font-size:.92rem; font-weight:700; color:#eeeef8; border-bottom:1px solid #1a1a2e; padding-bottom:6px; margin:0 0 12px; }
.readme-body :deep(h2) { font-size:.72rem; font-weight:600; color:#9090b0; text-transform:uppercase; letter-spacing:.1em; margin:18px 0 7px; }
.readme-body :deep(h3) { font-size:.76rem; font-weight:600; color:#7070a0; margin:12px 0 5px; }
.readme-body :deep(h3)::before { content:'§ '; color:v-bind(mainColor); opacity:.5; }
.readme-body :deep(p)  { font-size:.73rem; color:#646480; line-height:1.85; margin-bottom:9px; }
.readme-body :deep(li) { font-size:.73rem; color:#646480; line-height:1.85; padding-left:1rem; position:relative; list-style:none; }
.readme-body :deep(li)::before { content:'▸'; position:absolute; left:0; color:v-bind(mainColor); opacity:.7; font-size:.62rem; }
.readme-body :deep(strong) { color:#b8b8d0; font-weight:600; }
.readme-body :deep(code) { font-size:.68rem; background:#0e0e1e; color:v-bind(mainColor); padding:2px 6px; border-radius:4px; border:1px solid #1a1a32; }
.readme-body :deep(pre) { background:#040409; border:1px solid #0e0e20; border-left:2px solid v-bind(mainColor); border-radius:0 8px 8px 0; padding:14px 16px; overflow-x:auto; margin:12px 0; }
.readme-body :deep(pre code) { background:none; border:none; padding:0; color:#8080a0; }
.readme-body :deep(hr) { border:none; height:1px; background:v-bind(mainColor); opacity:.15; margin:16px 0; }
</style>