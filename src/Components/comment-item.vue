<script setup>
import { ref } from 'vue'
import { useReplies } from '@/composables/firebase/useReplies'
import { useComments } from '@/composables/firebase/useComments'
import { useLayoutStore } from '@/Stores/layout-store'
import { storeToRefs } from 'pinia'
import { useFlash } from '@/composables/feedback/use-flash'

const props = defineProps({
  comment: { type: Object, required: true },
  replyingTo: { type: String, default: null }
})
const emit = defineEmits(['toggle-reply'])

const { isDark } = storeToRefs(useLayoutStore())
const { replies, addReply, toggleReplyLike, isReplyLiked, rateLimitError: replyRateError } = useReplies(props.comment.id)
const { toggleCommentLike, isCommentLiked, rateLimitError: commentRateError } = useComments(null)
const { show: showFlash } = useFlash()

const replyName = ref('')
const replyText = ref('')
const loading = ref(false)
const likeLoading = ref(false)
const replyLikeLoading = ref(null)

async function submitReply() {
  if (!replyText.value.trim()) return
  loading.value = true
  const result = await addReply(replyText.value.trim(), replyName.value.trim() || 'Anonymous')
  if (result?.error) showFlash('error', result.error)
  else {
    replyText.value = ''
    replyName.value = ''
    emit('toggle-reply')
  }
  loading.value = false
}

async function handleCommentLike() {
  if (likeLoading.value) return
  likeLoading.value = true
  const result = await toggleCommentLike(props.comment.id)
  if (result?.error) showFlash('error', result.error)
  likeLoading.value = false
}

async function handleReplyLike(replyId) {
  if (replyLikeLoading.value === replyId) return
  replyLikeLoading.value = replyId
  const result = await toggleReplyLike(replyId)
  if (result?.error) showFlash('error', result.error)
  replyLikeLoading.value = null
}

function formatDate(ts) {
  return ts?.toDate?.().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) ?? '...'
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Comment -->
    <div
      class="flex flex-col gap-1.5 rounded-xl px-4 py-3 border transition-colors"
      :class="isDark ? 'bg-zinc-800/40 border-zinc-700/40' : 'bg-white border-zinc-200'"
    >
      <div class="flex items-center justify-between">
        <span class="text-xs font-mono font-medium text-emerald-500">{{ comment.author }}</span>
        <span class="text-[10px] font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
          {{ formatDate(comment.createdAt) }}
        </span>
      </div>

      <p class="text-sm leading-relaxed" :class="isDark ? 'text-zinc-300' : 'text-zinc-700'">
        {{ comment.text }}
      </p>

      <div class="flex items-center gap-3 pt-0.5">
        <!-- Like -->
        <button
          @click="handleCommentLike"
          :disabled="likeLoading"
          class="flex items-center gap-1.5 text-[11px] font-mono transition-all disabled:opacity-50"
          :class="isCommentLiked(comment.id)
            ? 'text-rose-400'
            : isDark ? 'text-zinc-600 hover:text-rose-400' : 'text-zinc-400 hover:text-rose-400'"
        >
          <svg class="w-3.5 h-3.5 transition-transform" :class="{ 'scale-125': likeLoading }" viewBox="0 0 24 24">
            <path
              v-if="isCommentLiked(comment.id)" fill="currentColor"
              d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
            />
            <path
              v-else fill="none" stroke="currentColor" stroke-width="1.5"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {{ comment.likes ?? 0 }}
        </button>

        <span :class="isDark ? 'text-zinc-700' : 'text-zinc-300'" class="text-xs">·</span>

        <!-- Reply toggle -->
        <button
          @click="emit('toggle-reply', comment.id)"
          class="text-[11px] font-mono transition-colors"
          :class="replyingTo === comment.id
            ? isDark ? 'text-zinc-400' : 'text-zinc-600'
            : isDark ? 'text-zinc-600 hover:text-zinc-400' : 'text-zinc-400 hover:text-zinc-600'"
        >
          {{ replyingTo === comment.id ? '✕ cancel' : `↩ reply${replies.length ? ` (${replies.length})` : ''}` }}
        </button>
      </div>
    </div>

    <!-- Reply form -->
    <Transition name="slide">
      <div
        v-if="replyingTo === comment.id"
        class="ml-5 flex flex-col gap-2 rounded-xl p-3 border"
        :class="isDark ? 'border-zinc-700/30 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-50'"
      >
        <input
          v-model="replyName"
          placeholder="Name (optional)"
          class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors border"
          :class="isDark
            ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
            : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"
        />
        <textarea
          v-model="replyText"
          placeholder="Write a reply..."
          rows="2"
          class="bg-transparent rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none transition-colors resize-none border"
          :class="isDark
            ? 'border-zinc-700/50 text-zinc-300 placeholder-zinc-600 focus:border-zinc-500'
            : 'border-zinc-300 text-zinc-700 placeholder-zinc-400 focus:border-zinc-500'"
        />
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
            {{ replyText.length }}/500
          </span>
          <button
            @click="submitReply"
            :disabled="loading || !replyText.trim() || replyText.length < 2"
            class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-mono transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            :class="isDark ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200' : 'bg-zinc-800 hover:bg-zinc-700 text-white'"
          >
            <svg v-if="loading" class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ loading ? 'Posting…' : 'Reply' }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Replies -->
    <div v-if="replies.length" class="ml-5 flex flex-col gap-1.5">
      <div
        v-for="r in replies" :key="r.id"
        class="flex flex-col gap-1 rounded-xl px-3 py-2.5 border"
        :class="isDark ? 'bg-zinc-900/60 border-zinc-700/30' : 'bg-zinc-50 border-zinc-200'"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-mono font-medium text-sky-500">{{ r.author }}</span>
          <span class="text-[10px] font-mono" :class="isDark ? 'text-zinc-600' : 'text-zinc-400'">
            {{ formatDate(r.createdAt) }}
          </span>
        </div>
        <p class="text-sm leading-relaxed" :class="isDark ? 'text-zinc-400' : 'text-zinc-600'">
          {{ r.text }}
        </p>
        <button
          @click="handleReplyLike(r.id)"
          :disabled="replyLikeLoading === r.id"
          class="self-start flex items-center gap-1.5 text-[11px] font-mono transition-all disabled:opacity-50 mt-0.5"
          :class="isReplyLiked(r.id)
            ? 'text-rose-400'
            : isDark ? 'text-zinc-600 hover:text-rose-400' : 'text-zinc-400 hover:text-rose-400'"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              v-if="isReplyLiked(r.id)" fill="currentColor"
              d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
            />
            <path
              v-else fill="none" stroke="currentColor" stroke-width="1.5"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          {{ r.likes ?? 0 }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-enter-active, .slide-leave-active {
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>