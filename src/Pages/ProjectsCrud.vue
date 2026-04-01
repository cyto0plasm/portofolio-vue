<script setup>
import { ref, computed, nextTick } from 'vue'
import projectsRaw from '../data/projects.json'

const TYPES      = ['web', 'mobile', 'desktop']
const STATUSES   = ['done', 'in_progress']
const CATEGORIES = ['Frontend','Backend','Database','Mobile','Desktop','Tools','Frameworks','Version Control','Other']

const projects   = ref(JSON.parse(JSON.stringify(projectsRaw)))
const currentId  = ref(null)
const toastMsg   = ref('')
const toastOk    = ref(true)
const showImport = ref(false)
const showSave   = ref(false)
const importText = ref('')

const current = computed(() => projects.value.find(p => p.id === currentId.value) ?? null)
const jsonOutput = computed(() => JSON.stringify(projects.value, null, 2))

function nextId() {
  return Math.max(0, ...projects.value.map(p => p.id)) + 1
}

function select(id) { currentId.value = id }

async function newProject() {
  const id = nextId()
  projects.value.push({
    id,
    name: 'New Project',
    slug: `project-${id}`,
    short_description: '',
    description: '',
    logo: null,
    github_url: null,
    live_url: null,
    type: 'web',
    status: 'in_progress',
    featured: false,
    position: projects.value.length,
    start_date: new Date().toISOString().slice(0, 10),
    end_date: null,
    highlight: null,
    images: [],
    technologies: []
  })
  await nextTick()
  select(id)
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return
  projects.value = projects.value.filter(p => p.id !== id)
  if (currentId.value === id) currentId.value = null
  toast('Deleted', true)
}

// images
function addImage() {
  current.value.images.push({ id: Date.now(), path: '' })
}
function removeImage(i) { current.value.images.splice(i, 1) }

// techs
function addTech() {
  current.value.technologies.push({ id: Date.now(), name: '', icon: null, category: null })
}
function removeTech(i) { current.value.technologies.splice(i, 1) }
function setTechCat(i, val) {
  current.value.technologies[i].category = val ? { name: val } : null
}

// export — downloads the file
function exportJSON() {
  const blob = new Blob([jsonOutput.value], { type: 'application/json' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = 'projects.json'
  a.click()
  toast('Downloaded! Replace src/data/projects.json', true)
}

// save — copies + shows modal with instructions
async function saveToFile() {
  await navigator.clipboard.writeText(jsonOutput.value)
  showSave.value = true
}

// import
function doImport() {
  try {
    const data = JSON.parse(importText.value)
    if (!Array.isArray(data)) throw new Error('Must be an array')
    projects.value = data
    currentId.value = null
    showImport.value = false
    importText.value = ''
    toast(`Imported ${data.length} projects`, true)
  } catch(e) { alert('Invalid JSON: ' + e.message) }
}

function toast(msg, ok = true) {
  toastMsg.value = msg
  toastOk.value  = ok
  setTimeout(() => toastMsg.value = '', 3000)
}
</script>

<template>
  <div class="crud-root">

    <!-- SIDEBAR -->
    <aside class="sidebar">
      <div class="sidebar-head">
        <p class="label-accent">projects.json</p>
        <p class="label-muted">{{ projects.length }} projects · dev only</p>
      </div>

      <div class="sidebar-list">
        <div
          v-for="p in projects" :key="p.id"
          class="proj-item"
          :class="{ active: currentId === p.id }"
          @click="select(p.id)"
        >
          <span class="dot" :class="`dot-${p.type}`" />
          <div class="proj-info">
            <div class="proj-name">{{ p.name }}</div>
            <div class="proj-slug">/{{ p.slug }}</div>
          </div>
          <button class="del-btn" @click.stop="deleteProject(p.id)">×</button>
        </div>
      </div>

      <div class="sidebar-foot">
        <button class="btn-new" @click="newProject">+ new project</button>
      </div>
    </aside>

    <!-- MAIN -->
    <div class="main-area">

      <!-- TOOLBAR -->
      <div class="toolbar">
        <span class="breadcrumb">
          $ admin / <em>{{ current?.slug ?? 'select a project' }}</em>
        </span>
        <div class="toolbar-actions">
          <button class="btn-ghost" @click="showImport = true">⬆ import</button>
          <button class="btn-ghost" @click="saveToFile">⎘ save</button>
          <button class="btn-export" @click="exportJSON">⬇ export .json</button>
        </div>
      </div>

      <!-- FORM -->
      <div v-if="current" class="form-scroll">

        <section-header>// basic info</section-header>
        <div class="grid2">
          <div class="field">
            <label>Name</label>
            <input v-model="current.name" type="text" />
          </div>
          <div class="field">
            <label>Slug</label>
            <input v-model="current.slug" type="text" />
          </div>
          <div class="field span2">
            <label>Short Description</label>
            <textarea v-model="current.short_description" rows="2" />
          </div>
          <div class="field span2">
            <label>Description</label>
            <textarea v-model="current.description" rows="3" />
          </div>
          <div class="field">
            <label>Type</label>
            <select v-model="current.type">
              <option v-for="t in TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select v-model="current.status">
              <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div class="field">
            <label>Start Date</label>
            <input v-model="current.start_date" type="date" />
          </div>
          <div class="field">
            <label>End Date</label>
            <input v-model="current.end_date" type="date" />
          </div>
          <div class="field">
            <label>Position</label>
            <input v-model.number="current.position" type="number" />
          </div>
          <div class="field">
            <label>Featured</label>
            <select v-model="current.featured">
              <option :value="true">Yes</option>
              <option :value="false">No</option>
            </select>
          </div>
          <div class="field">
            <label>Logo Path</label>
            <input v-model="current.logo" type="text" placeholder="/images/..." />
          </div>
          <div class="field">
            <label>Highlight</label>
            <input v-model="current.highlight" type="text" placeholder="e.g. biggest project" />
          </div>
          <div class="field span2">
            <label>GitHub URL</label>
            <input v-model="current.github_url" type="text" />
          </div>
          <div class="field span2">
            <label>Live URL</label>
            <input v-model="current.live_url" type="text" />
          </div>
        </div>

        <!-- IMAGES -->
        <div class="sub-header">
          <span>// images</span>
          <button class="btn-add" @click="addImage">+ add</button>
        </div>
        <div class="list-rows">
          <div v-for="(img, i) in current.images" :key="img.id" class="list-row">
            <input v-model="img.path" type="text" placeholder="/images/projects/name/file.png" class="row-input" />
            <button class="row-del" @click="removeImage(i)">×</button>
          </div>
          <p v-if="!current.images.length" class="empty-hint">no images — click + add</p>
        </div>

        <!-- TECHNOLOGIES -->
        <div class="sub-header">
          <span>// technologies</span>
          <button class="btn-add" @click="addTech">+ add</button>
        </div>
        <div class="list-rows">
          <div v-for="(tech, i) in current.technologies" :key="tech.id" class="tech-row">
            <input v-model="tech.name" type="text" placeholder="Name" class="row-input" />
            <input v-model="tech.icon" type="text" placeholder="/technologies/icon.svg" class="row-input" />
            <select
              class="row-input"
              :value="tech.category?.name ?? ''"
              @change="setTechCat(i, $event.target.value)"
            >
              <option value="">no category</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
            <button class="row-del" @click="removeTech(i)">×</button>
          </div>
          <p v-if="!current.technologies.length" class="empty-hint">no technologies — click + add</p>
        </div>

        <div class="danger-row">
          <button class="btn-delete" @click="deleteProject(current.id)">delete project</button>
        </div>

      </div>

      <!-- EMPTY STATE -->
      <div v-else class="empty-state">
        <span class="empty-icon">◈</span>
        <span>select or create a project</span>
      </div>
    </div>

    <!-- IMPORT MODAL -->
    <div v-if="showImport" class="modal-back" @click.self="showImport = false">
      <div class="modal">
        <p class="label-accent mb-3">// import projects.json</p>
        <textarea v-model="importText" rows="10" class="modal-ta" placeholder="Paste JSON array here..." />
        <div class="modal-actions">
          <button class="btn-ghost" @click="showImport = false">cancel</button>
          <button class="btn-violet" @click="doImport">import</button>
        </div>
      </div>
    </div>

    <!-- SAVE MODAL -->
    <div v-if="showSave" class="modal-back" @click.self="showSave = false">
      <div class="modal">
        <p class="label-accent mb-1">// copied to clipboard ✓</p>
        <p class="label-muted mb-4">Paste it into <code>src/data/projects.json</code> and save the file. Vite hot-reloads automatically.</p>
        <div class="save-steps">
          <div class="step"><span class="step-n">1</span> Open <code>src/data/projects.json</code> in your editor</div>
          <div class="step"><span class="step-n">2</span> Select all (<kbd>Ctrl+A</kbd>) and paste (<kbd>Ctrl+V</kbd>)</div>
          <div class="step"><span class="step-n">3</span> Save the file — Vite reloads instantly</div>
        </div>
        <div class="modal-actions">
          <button class="btn-violet" @click="showSave = false">got it</button>
        </div>
      </div>
    </div>

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="toastMsg" class="toast" :class="toastOk ? 'toast-ok' : 'toast-err'">
        {{ toastMsg }}
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* ROOT */
.crud-root {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #0e0e0f;
  color: #e4e4e7;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 13px;
}

/* SIDEBAR */
.sidebar {
  width: 256px;
  flex-shrink: 0;
  border-right: 1px solid #1f1f23;
  background: #111113;
  display: flex;
  flex-direction: column;
}
.sidebar-head {
  padding: 16px;
  border-bottom: 1px solid #1f1f23;
}
.label-accent { font-size: 11px; color: #a78bfa; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; }
.label-muted  { font-size: 10px; color: #3f3f46; margin-top: 2px; }
.sidebar-list { flex: 1; overflow-y: auto; padding: 6px; }
.sidebar-list::-webkit-scrollbar { width: 3px; }
.sidebar-list::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }

.proj-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background .15s;
  margin-bottom: 2px;
}
.proj-item:hover { background: #18181b; }
.proj-item.active { background: #18181b; border-color: #3f3f46; }

.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.dot-web     { background: #a78bfa; }
.dot-mobile  { background: #34d399; }
.dot-desktop { background: #fbbf24; }

.proj-info { flex: 1; min-width: 0; }
.proj-name { font-size: 12px; font-weight: 500; color: #d4d4d8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.proj-slug { font-size: 10px; color: #3f3f46; margin-top: 1px; }

.del-btn {
  opacity: 0;
  background: none;
  border: none;
  color: #71717a;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 5px;
  border-radius: 3px;
  transition: opacity .15s, color .15s;
  line-height: 1;
}
.proj-item:hover .del-btn { opacity: 1; }
.del-btn:hover { color: #f87171; }

.sidebar-foot { padding: 10px; border-top: 1px solid #1f1f23; }
.btn-new {
  width: 100%;
  padding: 8px;
  border-radius: 6px;
  background: #7c3aed;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background .15s;
}
.btn-new:hover { background: #6d28d9; }

/* MAIN */
.main-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
  border-bottom: 1px solid #1f1f23;
  background: #111113;
  flex-shrink: 0;
}
.breadcrumb { font-size: 11px; color: #52525b; }
.breadcrumb em { color: #a78bfa; font-style: normal; }
.toolbar-actions { display: flex; gap: 6px; }

.btn-ghost {
  padding: 5px 12px;
  border-radius: 5px;
  border: 1px solid #27272a;
  background: none;
  color: #a1a1aa;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background .15s, color .15s;
}
.btn-ghost:hover { background: #18181b; color: #e4e4e7; }

.btn-export {
  padding: 5px 12px;
  border-radius: 5px;
  border: 1px solid rgba(52,211,153,.3);
  background: rgba(52,211,153,.08);
  color: #34d399;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background .15s;
}
.btn-export:hover { background: rgba(52,211,153,.15); }

/* FORM */
.form-scroll { flex: 1; overflow-y: auto; padding: 24px 32px; }
.form-scroll::-webkit-scrollbar { width: 3px; }
.form-scroll::-webkit-scrollbar-thumb { background: #27272a; border-radius: 2px; }

.grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
.span2 { grid-column: 1 / -1; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 10px; color: #52525b; text-transform: uppercase; letter-spacing: .06em; }
.field input,
.field select,
.field textarea {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 5px;
  color: #e4e4e7;
  font-family: inherit;
  font-size: 12px;
  padding: 7px 10px;
  outline: none;
  transition: border-color .15s;
  width: 100%;
}
.field input:focus,
.field select:focus,
.field textarea:focus { border-color: #7c3aed; }
.field textarea { resize: vertical; }
.field select option { background: #18181b; }

/* SUB HEADERS */
.sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 10px;
  color: #a78bfa;
  text-transform: uppercase;
  letter-spacing: .08em;
  border-bottom: 1px solid #1f1f23;
  padding-bottom: 8px;
  margin-bottom: 10px;
  margin-top: 24px;
}
.btn-add {
  font-family: inherit;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  border: 1px solid #27272a;
  background: none;
  color: #a1a1aa;
  cursor: pointer;
  transition: background .15s;
}
.btn-add:hover { background: #18181b; color: #e4e4e7; }

/* LIST ROWS */
.list-rows { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }

.list-row,
.tech-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.tech-row { display: grid; grid-template-columns: 1fr 1.4fr 1fr auto; gap: 6px; }

.row-input {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 5px;
  color: #e4e4e7;
  font-family: inherit;
  font-size: 12px;
  padding: 6px 10px;
  outline: none;
  width: 100%;
  transition: border-color .15s;
  min-width: 0;
}
.row-input:focus { border-color: #7c3aed; }
.row-input option { background: #18181b; }

.row-del {
  background: none;
  border: none;
  color: #52525b;
  font-size: 18px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 3px;
  line-height: 1;
  flex-shrink: 0;
  transition: color .15s;
}
.row-del:hover { color: #f87171; }

.empty-hint { font-size: 11px; color: #3f3f46; padding: 4px 0; }

/* DANGER */
.danger-row {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  margin-top: 16px;
  border-top: 1px solid #1f1f23;
}
.btn-delete {
  padding: 7px 16px;
  border-radius: 5px;
  border: 1px solid rgba(248,113,113,.3);
  background: rgba(248,113,113,.08);
  color: #f87171;
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition: background .15s;
}
.btn-delete:hover { background: rgba(248,113,113,.18); }

/* EMPTY STATE */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #3f3f46;
}
.empty-icon { font-size: 36px; }

/* MODAL */
.modal-back {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.75);
  display: flex; align-items: center; justify-content: center;
  z-index: 50;
}
.modal {
  background: #111113;
  border: 1px solid #27272a;
  border-radius: 10px;
  padding: 24px;
  width: 480px;
  max-width: 90vw;
}
.mb-1 { margin-bottom: 4px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }

.modal-ta {
  width: 100%;
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 6px;
  color: #e4e4e7;
  font-family: inherit;
  font-size: 11px;
  padding: 10px 12px;
  resize: vertical;
  outline: none;
}
.modal-ta:focus { border-color: #7c3aed; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; }

.btn-violet {
  padding: 6px 16px;
  border-radius: 5px;
  background: #7c3aed;
  color: #fff;
  border: none;
  font-family: inherit;
  font-size: 12px;
  cursor: pointer;
  transition: background .15s;
}
.btn-violet:hover { background: #6d28d9; }

/* SAVE STEPS */
.save-steps { display: flex; flex-direction: column; gap: 8px; margin-bottom: 4px; }
.step { display: flex; align-items: flex-start; gap: 10px; font-size: 12px; color: #a1a1aa; }
.step-n {
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #27272a;
  color: #a78bfa;
  font-size: 10px;
  font-weight: 600;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
code {
  background: #18181b;
  border: 1px solid #27272a;
  border-radius: 3px;
  padding: 1px 5px;
  font-family: inherit;
  color: #34d399;
  font-size: 11px;
}
kbd {
  background: #27272a;
  border-radius: 3px;
  padding: 1px 5px;
  font-family: inherit;
  font-size: 11px;
  color: #e4e4e7;
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 20px; right: 20px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 6px;
  z-index: 100;
}
.toast-ok  { background: #34d399; color: #000; }
.toast-err { background: #f87171; color: #000; }
.toast-enter-active, .toast-leave-active { transition: all .25s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(6px); }
</style>