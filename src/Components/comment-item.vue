<script setup>
import { ref } from 'vue'
import { useReplies } from '@/composables/firebase/useProjectStats'
import { useLayoutStore } from '@/Stores/layout-store'
import { storeToRefs } from 'pinia'

const props = defineProps({
  comment: { type: Object, required: true },
  replyingTo: { type: String, default: null }
})
const emit = defineEmits(['toggle-reply'])

const { isDark } = storeToRefs(useLayoutStore())
const { replies, addReply } = useReplies(props.comment.id)
const replyName = ref('')
const replyText = ref('')
const loading = ref(false)

async function submitReply() {
  if (!replyText.value.trim()) return
  loading.value = true
  await addReply(replyText.value.trim(), replyName.value.trim() || 'Anonymous')
  replyText.value = ''
  replyName.value = ''
  loading.value = false
  emit('toggle-reply')
}

function formatDate(ts) {
  return ts?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '...'
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- Comment -->
    <div class="flex flex-col gap-0.5 rounded-xl px-4 py-3 border"
      :class="isDark ? 'bg-zinc-800/40 border-zinc-700/40' : 'bg-white border-zinc-200'">
      <span class="text-xs font-mono text-emerald-500">{{ comment.author }}</span>
      <p class="text-sm leading-relaxed" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">{{ comment.text }}</p>
      <div class="flex items-center justify-between mt-1">
        <span class="text-[10px] font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
          {{ formatDate(comment.createdAt) }}
        </span>
        <button @click="emit('toggle-reply', comment.id)"
          class="text-[10px] font-mono transition-colors"
          :class="isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'">
          {{ replyingTo === comment.id ? 'cancel' : `↩ reply${replies.length ? ` (${replies.length})` : ''}` }}
        </button>
      </div>
    </div>

    <!-- Replies -->
    <div v-if="replies.length" class="ml-6 flex flex-col gap-1">
      <div v-for="r in replies" :key="r.id"
        class="flex flex-col gap-0.5 rounded-xl px-3 py-2 border"
        :class="isDark ? 'bg-zinc-900/60 border-zinc-700/30' : 'bg-zinc-50 border-zinc-200'">
        <span class="text-xs font-mono text-sky-500">{{ r.author }}</span>
        <p class="text-sm leading-relaxed" :class="isDark ? 'text-zinc-400' : 'text-zinc-600'">{{ r.text }}</p>
        <span class="text-[10px] font-mono mt-0.5" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
          {{ formatDate(r.createdAt) }}
        </span>
      </div>
    </div>

    <!-- Reply form -->
    <div v-if="replyingTo === comment.id"
      class="ml-6 flex flex-col gap-2 rounded-xl p-3 border"
      :class="isDark ? 'border-zinc-700/30 bg-zinc-900/30' : 'border-zinc-300 bg-zinc-100'">
      <input v-model="replyName" placeholder="Name (optional)"
        class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors border"
        :class="isDark
          ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
          : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"/>
      <textarea v-model="replyText" placeholder="Write a reply..." rows="2"
        class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors resize-none border"
        :class="isDark
          ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
          : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"/>
      <button @click="submitReply" :disabled="loading || !replyText.trim()"
        class="self-end px-4 py-1.5 rounded-lg text-xs font-mono transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :class="isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 text-white'">
        {{ loading ? 'Posting...' : 'Reply' }}
      </button>
    </div>
  </div>
</template>