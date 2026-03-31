<script setup>
import { computed, ref } from 'vue'
import DarkMode from '../Components/dark-mode.vue'
import ToggleSwitch from '../Components/ToggleSwitch.vue'
import { useLayoutStore } from '../Stores/layout-store.js'
import X from '@/svg/x.vue'

const layout = useLayoutStore()

const showSolarCommandText =ref(true);
const showModeCommandText =ref(true);

const presetColors = ['#54debd', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6']
</script>

<template>
  <!-- Backdrop -->
  <Transition
    enter-active-class="transition-opacity duration-250 ease-out"
    leave-active-class="transition-opacity duration-200 ease-in"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="layout.asideOpen"
      class="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
      @click="layout.closeAside"
    />
  </Transition>

  <!-- Panel -->
  <aside class="fixed top-0 right-0 z-50 h-screen pointer-events-none">
    <Transition
      enter-active-class="transition-transform duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)]"
      leave-active-class="transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="layout.asideOpen"
        class="pointer-events-auto h-full flex flex-col
               w-[clamp(260px,80vw,300px)]
               bg-[#f0f2f7]
               border-l border-black/[0.08]
               shadow-[-8px_0_40px_rgba(0,0,0,0.10)]"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 pt-5 pb-4">
          <div class="flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full" :style="{ background: layout.getColor, boxShadow: `0 0 6px ${layout.getColor}80` }" />
            <span class="text-[0.8125rem] font-semibold tracking-[0.08em] uppercase text-black/40">
              Preferences
            </span>
          </div>
          <button
            @click="layout.closeAside"
            aria-label="Close"
            class="flex items-center justify-center w-7 h-7 rounded-lg
                   border border-black/[0.08]
                   bg-black/[0.04]
                   text-neutral-500
                   hover:bg-black/[0.09]
                   hover:scale-105 transition-all duration-150"
          >
            <X />
          </button>
        </div>

        <!-- Divider -->
        <div class="mx-4 h-px bg-gradient-to-r from-transparent via-black/[0.08] to-transparent" />

        <!-- Scrollable content -->
        <div class="relative flex-1 overflow-y-auto flex flex-col [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

          <!-- Color section -->
          <section class="flex flex-col gap-3.5 px-5 py-[18px]">
            <div class="flex items-start gap-2.5">
              <div
                class="w-[30px] h-[30px] shrink-0 rounded-lg flex items-center justify-center mt-px border"
                :style="{ background: `${layout.getColor}1a`, borderColor: `${layout.getColor}26`, color: layout.getColor }"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <circle cx="8" cy="8" r="6.5"/>
                  <path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-neutral-900 leading-snug">Color</h2>
                <p class="text-[0.72rem] text-neutral-400 mt-0.5 leading-snug">Accent color scheme</p>
              </div>
            </div>

            <div class="flex items-center gap-2.5 pl-10">
              <input
                type="color"
                :value="layout.getColor"
                @input="layout.SetColor($event.target.value)"
                class="w-8 h-8 rounded-lg border-[1.5px] border-black/[0.12]
                       p-0.5 cursor-pointer bg-transparent
                       [&::-webkit-color-swatch-wrapper]:p-0
                       [&::-webkit-color-swatch]:rounded-[5px] [&::-webkit-color-swatch]:border-none"
              />
              <div class="flex gap-1.5">
                <button
                  v-for="c in presetColors"
                  :key="c"
                  :style="{
                    backgroundColor: c,
                    borderColor: layout.getColor === c ? 'white' : 'transparent',
                    boxShadow: layout.getColor === c ? `0 0 0 2px ${c}` : 'none'
                  }"
                  class="w-[18px] h-[18px] rounded-full border-2 shadow-sm hover:scale-125 transition-transform duration-150"
                  @click="layout.SetColor(c)"
                />
              </div>
            </div>
          </section>

          <!-- Divider -->
          <div class="mx-4 h-px bg-gradient-to-r from-transparent via-black/[0.08] to-transparent" />

          <!-- Cursor section -->
          <section class="flex flex-col gap-3.5 px-5 py-[18px]">
            <div class="flex items-start gap-2.5">
              <div
                class="w-[30px] h-[30px] shrink-0 rounded-lg flex items-center justify-center mt-px border"
                :style="{ background: `${layout.getColor}1a`, borderColor: `${layout.getColor}26`, color: layout.getColor }"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4">
                  <rect x="4.5" y="2" width="7" height="10" rx="3.5"/>
                  <path d="M8 2v4.5M4.5 6.5h7" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h2 class="text-sm font-semibold text-neutral-900 leading-snug">Cursor</h2>
                <p class="text-[0.72rem] text-neutral-400 mt-0.5 leading-snug">Mouse behavior & effects</p>
              </div>
            </div>

            <div class="flex items-center justify-between pl-10 pr-3 py-3 rounded-xl
                        bg-black/[0.03]
                        border border-black/[0.06]
                        hover:bg-black/[0.05]
                        transition-colors duration-150">
              <div class="flex flex-col gap-0.5">
                <span class="text-[0.8rem] font-medium text-neutral-800">Solar System</span>
                <span v-if="showSolarCommandText" @click="showSolarCommandText = !showSolarCommandText" class="text-[0.68rem] ">  <span class="dark:text-gray-400 text-gray-500">{{ layout.showSolarSystem?'unfollow':'follow' }}</span></span>
                <span v-else @click="showSolarCommandText = !showSolarCommandText" class="text-[0.68rem]  text-yellow-600 font-mono ">solar   <span class="dark:text-gray-400 text-gray-500">{{ layout.showSolarSystem?'--off':'--on' }}</span></span>
              </div>
              <ToggleSwitch v-model="layout.showSolarSystem" :color="layout.getColor" size="md" />
            </div>
          </section>

          <!-- Divider -->
          <div class="mx-4 h-px bg-gradient-to-r from-transparent via-black/[0.08] to-transparent" />
          <!-- darkMode -->
          <section class=" px-5  ">
            <div class="flex items-center justify-between pl-10 pr-3 py-3 rounded-xl
                        bg-black/[0.03]
                        border border-black/[0.06]
                        hover:bg-black/[0.05]
                        transition-colors duration-150">
              <div class="flex flex-col gap-0.5">
                <span class="text-[0.8rem] font-medium text-neutral-800">Dark Mode</span>
                <span v-if="showModeCommandText" @click="showModeCommandText = !showModeCommandText"  class="text-[0.68rem] text-neutral-400" >{{ layout.isDark ? 'Switch to Light' : 'Switch to Dark' }}</span>
                <span v-if="!showModeCommandText" @click="showModeCommandText = !showModeCommandText" class="text-[0.68rem] text-gray-500 font-mono" ><span class="dark:text-yellow-400  text-yellow-600">mode </span>{{ layout.isDark ? 'light' : 'dark' }}</span>
              </div>
<DarkMode />
            </div>

          </section>

          <!-- <section class=" absolute bottom-0 left-0  ">
             <DarkMode/>
          </section> -->

        </div>

        <!-- Footer -->
        <div class="px-5 py-3.5 border-t border-black/[0.06] flex justify-center">
          <span class="text-[0.68rem] tracking-wide text-neutral-400">Changes apply instantly</span>
        </div>
      </div>
    </Transition>
  </aside>
</template>
