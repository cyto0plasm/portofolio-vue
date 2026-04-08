<script setup>
import { computed } from 'vue'
import { useLayoutStore } from '@/Stores/layout-store'
import { useI18n } from 'vue-i18n'
import { useHead } from '@unhead/vue'
import { useContactStore } from '@/Stores/contact-store'

useHead({
  title: "Connect with Zaki",
  meta: [{ name: 'description', content: "Connect with Youssef Zaki" }],
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/images/favIconProtofolio2.ico' }]
})

const { t } = useI18n()
const layout = useLayoutStore()
const preferedColor = computed(() => layout.preferedColor ?? '#6ee7b7')

// pinia store
const contact = useContactStore()

// links
const links = [
  { label: 'GitHub', href: 'https://github.com/cyto0plasm', icon: 'GH' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/youssef-zakiz/', icon: 'LI' },
  { label: 'Email', href: 'mailto:yousifzaki017@gmail.com', icon: '@' },
]
</script>
<template>
  <section
class="relative mt-14 min-h-svh flex  items-center justify-center px-5 sm:px-8 lg:px-14 py-20 overflow-hidden bg-white dark:bg-[#0d0d0d]"
    :style="{ '--c': preferedColor }"
    aria-label="Contact section"
  >

    <!-- bg grid -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="
        background-image:
          linear-gradient(to right,  color-mix(in srgb, currentColor 4%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, currentColor 4%, transparent) 1px, transparent 1px);
        background-size: 40px 40px;
      "
      aria-hidden="true"
    />

    <!-- glow orb -->
    <div
      class="absolute inset-0 pointer-events-none"
      :style="{ background: `radial-gradient(ellipse 55% 40% at 60% 50%, color-mix(in srgb, var(--c) 12%, transparent), transparent)` }"
      aria-hidden="true"
    />

    <div class="relative z-10 w-full max-w-5xl mx-auto grid  md:grid-cols-[1fr_1.2fr] gap-12 md:gap-16 items-start">

      <!-- ── LEFT: info ── -->
     
      <div class="order-1 md:order-2 rounded-2xl border p-6 sm:p-8 flex flex-col gap-6 backdrop-blur-xl"
        :style="{
          borderColor: 'color-mix(in srgb, var(--c) 18%, transparent)',
          background:  'color-mix(in srgb, var(--c) 3%, transparent)',
        }"
      >

        <!-- mono header -->
        <div class="flex items-center justify-between mb-1">
          <span class="font-mono text-[0.8rem] text-gray-500 dark:text-gray-400 tracking-widest uppercase">
            // {{ t('contact.formTitle') }}
          </span>
          <span
            class="font-mono text-[0.6rem] px-2 py-0.5 rounded-full border"
            :style="{
              color: preferedColor,
              borderColor: 'color-mix(in srgb, var(--c) 30%, transparent)',
              background:  'color-mix(in srgb, var(--c) 8%, transparent)',
            }"
          >
            {{ contact.submitting ? t('contact.submitting') : contact.success ? t('contact.sent') : t('contact.ready') }}
          </span>
        </div>

        <form @submit.prevent="contact.submitForm" class="flex flex-col gap-5" novalidate>

          <!-- text + email fields -->
          <div v-for="field in contact.fields" :key="field.id" class="relative flex flex-col gap-1.5">
            <label
              :for="field.id"
              class="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest transition-colors duration-200"
              :style="{ color: contact.focused === field.id ? preferedColor : undefined }"
              :class="contact.focused === field.id ? '' : 'text-gray-400 dark:text-gray-500'"
            >
              <span class="font-mono opacity-50">{{ field.prefix }}</span>
              {{ t(field.labelKey) }}
            </label>
            <div class="relative">
              <input
                :id="field.id"
                v-model="field.model"
                :type="field.type"
                :placeholder="t(field.placeholderKey)"
                required
                autocomplete="off"
                class="w-full rounded-xl border bg-transparent px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-all duration-200 focus:outline-none"
                :style="{
                  borderColor: contact.focused === field.id
                    ? 'color-mix(in srgb, var(--c) 55%, transparent)'
                    : 'color-mix(in srgb, currentColor 12%, transparent)',
                  boxShadow: contact.focused === field.id
                    ? '0 0 0 3px color-mix(in srgb, var(--c) 10%, transparent)'
                    : 'none',
                }"
                @focus="contact.focused = field.id"
                @blur="contact.focused = null"
              />
              <!-- active bar -->
              <span
                class="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 pointer-events-none"
                :style="{
                  width:      contact.focused === field.id ? '100%' : '0%',
                  background: preferedColor,
                }"
              />
            </div>
          </div>

          <!-- message textarea -->
          <div class="relative flex flex-col gap-1.5">
            <label
              for="message"
              class="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest transition-colors duration-200"
              :style="{ color: contact.focused === 'message' ? preferedColor : undefined }"
              :class="contact.focused === 'message' ? '' : 'text-gray-400 dark:text-gray-500'"
            >
              <span class="font-mono opacity-50">03</span>
              {{ t('contact.message') }}
            </label>
            <div class="relative">
              <textarea
                id="message"
                v-model="contact.message"
                :placeholder="t('contact.messagePlaceholder')"
                rows="5"
                required
                class="w-full rounded-xl border bg-transparent px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none transition-all duration-200 focus:outline-none"
                :style="{
                  borderColor: contact.focused === 'message'
                    ? 'color-mix(in srgb, var(--c) 55%, transparent)'
                    : 'color-mix(in srgb, currentColor 12%, transparent)',
                  boxShadow: contact.focused === 'message'
                    ? '0 0 0 3px color-mix(in srgb, var(--c) 10%, transparent)'
                    : 'none',
                }"
                @focus="contact.focused = 'message'"
                @blur="contact.focused = null"
              />
              <!-- char count -->
              <span class="absolute bottom-3 right-3 font-mono text-[0.6rem] text-gray-400 pointer-events-none select-none">
                {{ contact.message.length }}
              </span>
              <!-- active bar -->
              <span
                class="absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-300 pointer-events-none"
                :style="{
                  width:      contact.focused === 'message' ? '100%' : '0%',
                  background: preferedColor,
                }"
              />
            </div>
          </div>

          <!-- submit button -->
          <button
            type="submit"
            :disabled="contact.submitting || contact.success"
            class="group relative mt-1 flex items-center justify-center gap-2.5 rounded-xl font-semibold text-sm py-3 px-6 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
            :style="{
              background:  contact.success ? 'color-mix(in srgb, var(--c) 18%, transparent)' : preferedColor,
              color:       contact.success ? preferedColor : '#0a0a0a',
              boxShadow:   contact.submitting || contact.success ? 'none' : `0 4px 24px color-mix(in srgb, var(--c) 30%, transparent)`,
              border:      contact.success ? `1px solid color-mix(in srgb, var(--c) 35%, transparent)` : 'none',
            }"
          >
            <!-- spinner -->
            <svg v-if="contact.submitting" class="animate-spin w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            <!-- check -->
            <svg v-else-if="contact.success" class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <!-- send arrow -->
            <svg v-else class="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>

            <span>{{ contact.submitting ? t('contact.submitting') : contact.success ? t('contact.success')  : t('contact.submit')  }}</span>
          </button>

          <!-- error feedback -->
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition-all duration-300 ease-in"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <p v-if="contact.error" class="text-xs font-medium text-red-400 flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ contact.error }}
            </p>
          </Transition>

        </form>
      </div>
      <!-- ── RIGHT: form ── -->
       <div class=" order-2 md:order-1 flex flex-col gap-6 pt-2">

        <!-- status badge -->
        <p class="flex items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-widest text-gray-400">
          <span class="inline-flex h-[7px] w-[7px] shrink-0 relative">
            <span
              class="absolute inset-0 rounded-full animate-ping"
              :style="{ background: preferedColor }"
            />
            <span
              class="relative h-full w-full rounded-full block"
              :style="{ background: preferedColor }"
            />
          </span>
          {{ t('contact.status') }}
        </p>

        <!-- heading -->
        <h1 class="m-0 font-black leading-[0.88] tracking-tighter text-[clamp(2.6rem,7vw,4.5rem)]">
          <span class="text-gray-700 dark:text-gray-200">{{ t('contact.h1') }}</span><br>
          <span :style="{ color: preferedColor }">{{ t('contact.h2') }}</span><br>
          <span class="text-gray-700 dark:text-gray-200">{{ t('contact.h3') }}</span>
        </h1>

        <p class="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
         {{ t('contact.desc') }}
        </p>

        <!-- quick links -->
        <ul class="flex flex-col gap-3 mt-2 list-none p-0 m-0">
          <li v-for="link in links" :key="link.label">
            <a
              :href="link.href"
              target="_blank"
              rel="noopener"
              class="group inline-flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 no-underline transition-colors duration-200 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <span
                class="inline-flex items-center justify-center w-8 h-8 rounded-lg border font-mono text-[0.6rem] font-bold shrink-0 transition-all duration-200"
                :style="{
                  borderColor: 'color-mix(in srgb, var(--c) 30%, transparent)',
                  color: preferedColor,
                  background: 'color-mix(in srgb, var(--c) 7%, transparent)',
                }"
              >
                {{ link.icon }}
              </span>
              <span class="group-hover:translate-x-0.5 transition-transform duration-200">{{ link.label }}</span>
            </a>
          </li>
        </ul>

        <!-- decorative dots -->
        <svg class="mt-4 opacity-20" width="52" height="110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <circle
            v-for="n in 30" :key="n"
            :cx="((n-1) % 5) * 10 + 5"
            :cy="Math.floor((n-1) / 5) * 18 + 9"
            r="1.6"
            :fill="preferedColor"
          />
        </svg>
      </div>

    </div>
  </section>
</template>