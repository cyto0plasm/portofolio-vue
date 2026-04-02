import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { fetchRepos, fetchReadme } from "@/services/github-api";
import { streamGroq } from "@/services/groq-api";
import { detectIntent, detectMode } from "@/services/intent-detector";
import { buildSystemPrompt } from "@/prompts/systemPromptPro";
import { responseCache } from "@/services/response-cache";
import projectsData from '../../data/projects.json'

const RATE_LIMIT_MS = 8000;
let lastRequest = 0;
let requestQueue = [];
let isProcessingQueue = false;

export const useRoboStore = defineStore("robo", () => {
  const messages = ref([]);
  const localProjects = ref([]);   // from projects.json — rich data
  const githubRepos = ref([]);     // from GitHub API — extra repos
  const streaming = ref(false);
  const isInitialized = ref(false);
  const userState = ref({ mode: "NORMAL" });

  // AI gets full context: description + stack + github link
  const projectsContext = computed(() =>
    localProjects.value.map(p =>
      `• ${p.name}: ${p.short_description} | Stack: ${p.technologies.map(t => t.name).join(', ')} | GitHub: ${p.github_url}`
    ).join('\n')
  );

  // UI: featured = local, other = github repos not already in local
  const allProjects = computed(() => {
    const localNames = new Set(localProjects.value.map(p => p.name.toLowerCase()))
    const other = githubRepos.value.filter(r => !localNames.has(r.name.toLowerCase()))
    return { featured: localProjects.value, other }
  });

  // backward compat — anything using store.projects still works
  const projects = localProjects;

const projectsMap = computed(() => {
  const map = {};
  localProjects.value.forEach((p) => { map[p.name.toLowerCase()] = p.github_url || p.url; });
  githubRepos.value.forEach((r) => { map[r.name.toLowerCase()] = r.url; });
  return map;
});

  async function initStore() {
    if (isInitialized.value) return;
    isInitialized.value = true;

    // local data — instant, always available
    localProjects.value = projectsData;

    // github repos — background, non-blocking
    fetchRepos()
      .then(repos => { githubRepos.value = repos; })
      .catch(() => {});
  }

  function getHistory(limit) {
    return messages.value.slice(-limit).map((m) => ({
      role: m.role === "bot" ? "assistant" : "user",
      content: m.text.slice(0, 200),
    }));
  }

  async function ask(question, onToken) {
    if (!question || streaming.value || isProcessingQueue) return;
    if (!isInitialized.value) await initStore();

    userState.value.mode = detectMode(question);
    const intent = detectIntent(question);
    const isArabic = /[\u0600-\u06FF]/.test(question);

    messages.value.push({ role: "user", text: question });
    const botIdx = messages.value.push({ role: "bot", text: "" }) - 1;

    return new Promise((resolve, reject) => {
      requestQueue.push({ question, onToken, intent, isArabic, botIdx, resolve, reject });
      processQueue();
    });
  }

  async function processQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
      const { question, onToken, intent, isArabic, botIdx, resolve, reject } = requestQueue[0];
      streaming.value = true;

      try {
        if (responseCache.canCache(intent) && intent !== "HIRING") {
          const cached = responseCache.get(intent);
          if (cached) {
            messages.value[botIdx].text = cached;
            resolve(); requestQueue.shift(); continue;
          }
        }

        let text = "";
        for (let attempt = 0; attempt <= 2; attempt++) {
          try {
            text = await streamGroq({
              question, intent, isArabic,
              systemPrompt: buildSystemPrompt(intent, isArabic, projectsContext.value, userState.value),
              history: getHistory(8),
              onToken: (token) => { messages.value[botIdx].text += token; onToken?.(); },
            });
            break;
          } catch (err) {
            if (err.message.includes("429") && attempt < 2) {
              const delay = 15000 * (attempt + 1);
              messages.value[botIdx].text = `⏳ Rate limited, retrying in ${delay / 1000}s...`;
              await new Promise((r) => setTimeout(r, delay));
              messages.value[botIdx].text = "";
            } else throw err;
          }
        }

        if (responseCache.canCache(intent)) responseCache.set(intent, text);
        resolve();
      } catch (err) {
        messages.value[botIdx].text = err.message.includes("429")
          ? "⚠️ Still rate limited. Wait a minute."
          : `⚠️ ${err.message}`;
        reject(err);
      } finally {
        streaming.value = false;
        lastRequest = Date.now();
        requestQueue.shift();
        if (requestQueue.length > 0)
          await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));
      }
    }

    isProcessingQueue = false;
  }

  function reset() { messages.value = []; streaming.value = false; }

  initStore();
  return { messages, streaming, projects, allProjects, githubRepos, projectsMap, ask, reset };
});