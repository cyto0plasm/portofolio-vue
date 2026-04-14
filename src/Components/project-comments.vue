<script setup>
import { ref, watch } from 'vue'
import { useComments } from '@/composables/firebase/useComments'
import { useLayoutStore } from '@/Stores/layout-store'
import { storeToRefs } from 'pinia'
import CommentItem from './comment-item.vue'
import { useI18n } from 'vue-i18n'
import { useFlash } from '@/composables/feedback/use-flash'

  const { flash, show } = useFlash()

const { t } = useI18n()
const props = defineProps({
  slug: { type: String, required: true },
  forceOpen: { type: Boolean, default: false }
})
const { comments, addComment } = useComments(props.slug)
const { isDark } = storeToRefs(useLayoutStore())

const open = ref(props.forceOpen)
const name = ref('')
const text = ref('')
const loading = ref(false)
const replyingTo = ref(null)

watch(() => props.forceOpen, (val) => open.value = val)

// Lock body scroll when dialog is open
watch(open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

async function submit() {
  if (!text.value.trim()) return
  loading.value = true
  try {
    const result = await addComment(text.value.trim(), name.value.trim() || 'Anonymous')
    if (result?.error) { show('error', result.error); return }
    text.value = ''
    name.value = ''
    replyingTo.value = null
    show('success', "Posted");
  } catch (e) {
    console.error('Failed to post comment:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <!-- Trigger button -->
  <!-- <button
    @click="open = true"
    class="flex items-center gap-2 text-xs font-mono transition-colors"
    :class="isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'"
  >
    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
    </svg>
    {{ comments.length }} {{ t('comments.title') }}
  </button> -->

  <!-- Dialog -->
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click.self="open = false"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 backdrop-blur-sm"
          :class="isDark ? 'bg-black/60' : 'bg-black/30'"
          @click="open = false"
        />

        <!-- Panel -->
        <div
          class="relative z-10 w-full max-w-lg max-h-[80vh] flex flex-col rounded-2xl border shadow-2xl"
          :class="isDark
            ? 'bg-[#1c1c1c] border-zinc-700/50'
            : 'bg-white border-zinc-200'"
        >
          <!-- Header -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b"
            :class="isDark ? 'border-zinc-700/50' : 'border-zinc-200'"
          >
            <span class="text-xs font-mono tracking-widest uppercase"
              :class="isDark ? 'text-zinc-400' : 'text-zinc-500'">
              {{ comments.length }} {{ t('comments.title') }}
            </span>
            <button
              @click="open = false"
              class="w-6 h-6 flex items-center justify-center rounded-full transition-colors"
              :class="isDark ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-700' : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Comments list -->
          <div @wheel.stop class="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
            <template v-if="comments.length">
              <CommentItem
                v-for="c in comments" :key="c.id"
                :comment="c"
                :replying-to="replyingTo"
                @toggle-reply="replyingTo = replyingTo === c.id ? null : c.id"
              />
            </template>
            <p v-else class="text-xs font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
              {{ t('comments.noComments') }}
            </p>
          </div>

          <!-- Input -->
          <div
            class="px-5 py-4 border-t flex flex-col gap-2"
            :class="isDark ? 'border-zinc-700/50 bg-zinc-900/40' : 'border-zinc-200 bg-zinc-50'"
          >
            <input
              v-model="name"
              :placeholder="t('comments.name')"
              class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors border"
              :class="isDark
                ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
                : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"
            />
            <textarea
              v-model="text"
              :placeholder="t('comments.placeholder')"
              rows="2"
              class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors resize-none border"
              :class="isDark
                ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
                : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"
            />
            <button
              @click="submit"
              :disabled="loading || !text.trim() || text.length < 5"
              class="self-end px-4 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              :class="isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 text-white'"
            >
              {{ loading ? 'Posting...' : t('comments.submit') }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.25s ease;
}
.dialog-enter-active .relative,
.dialog-leave-active .relative {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease;
}
.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}
.dialog-enter-from .relative,
.dialog-leave-to .relative {
  transform: translateY(16px);
  opacity: 0;
}
</style>