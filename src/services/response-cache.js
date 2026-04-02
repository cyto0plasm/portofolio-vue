const CACHE_PREFIX = "robo_cache_";
const CACHE_TTL_MS = 1000 * 60 * 60 * 6; // 6 hours

const CACHEABLE_INTENTS = new Set(["GREETING", "HIRING", "ABOUT", "SKILLS"]);
export const responseCache = {
  canCache(intent) {
    return CACHEABLE_INTENTS.has(intent);
  },

  get(intent) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + intent);
      if (!raw) return null;
      const { text, timestamp } = JSON.parse(raw);
      if (Date.now() - timestamp > CACHE_TTL_MS) {
        this.delete(intent);
        return null;
      }
      return text;
    } catch {
      return null;
    }
  },

  set(intent, text) {
    try {
      localStorage.setItem(
        CACHE_PREFIX + intent,
        JSON.stringify({ text, timestamp: Date.now() })
      );
    } catch (e) {
      console.warn("Cache write failed:", e);
    }
  },

  delete(intent) {
    localStorage.removeItem(CACHE_PREFIX + intent);
  },

  clear() {
    Object.keys(localStorage).filter(k => k.startsWith('robo_cache_')).forEach(k => localStorage.removeItem(k))

  },
};