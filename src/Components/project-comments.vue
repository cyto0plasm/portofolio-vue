<script setup>
import { ref } from 'vue'
import { useComments } from '@/composables/firebase/useProjectStats'
import { useLayoutStore } from '@/Stores/layout-store'
import { storeToRefs } from 'pinia'
import CommentItem from './comment-item.vue'

const props = defineProps({ slug: { type: String, required: true } })
const { comments, addComment } = useComments(props.slug)
const { isDark } = storeToRefs(useLayoutStore())

const open = ref(false)
const name = ref('')
const text = ref('')
const loading = ref(false)
const replyingTo = ref(null)

async function submit() {
  if (!text.value.trim()) return
  loading.value = true
  await addComment(text.value.trim(), name.value.trim() || 'Anonymous')
  text.value = ''
  name.value = ''
  loading.value = false
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-7 pb-4">
    <button @click="open = !open"
      class="flex items-center gap-2 text-xs font-mono transition-colors"
      :class="isDark ? 'text-zinc-500 hover:text-zinc-300' : 'text-zinc-400 hover:text-zinc-700'">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
      </svg>
      {{ comments.length }} comment{{ comments.length !== 1 ? 's' : '' }}
      <span :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">{{ open ? '▲' : '▼' }}</span>
    </button>

    <div v-if="open" class="mt-3 flex flex-col gap-3">
      <div v-if="comments.length" class="flex flex-col gap-3">
        <CommentItem
          v-for="c in comments" :key="c.id"
          :comment="c"
          :replying-to="replyingTo"
          @toggle-reply="replyingTo = replyingTo === c.id ? null : c.id"
        />
      </div>
      <p v-else class="text-xs font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
        No comments yet. Be the first.
      </p>

      <div class="flex flex-col gap-2 rounded-xl p-3 border"
        :class="isDark ? 'border-zinc-700/40 bg-zinc-900/40' : 'border-zinc-300 bg-zinc-100'">
        <input v-model="name" placeholder="Name (optional)"
          class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors border"
          :class="isDark
            ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
            : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"/>
        <textarea v-model="text" placeholder="Leave a comment..." rows="2"
          class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors resize-none border"
          :class="isDark
            ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
            : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"/>
        <button @click="submit" :disabled="loading || !text.trim()"
          class="self-end px-4 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :class="isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 text-white'">
          {{ loading ? 'Posting...' : 'Post' }}
        </button>
      </div>
    </div>
  </div>
</template>