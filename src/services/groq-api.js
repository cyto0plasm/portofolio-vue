const MODEL = "llama-3.3-70b-versatile";
const MAX_TOKENS = {
  GREETING: 30, ABOUT: 200, PROJECT: 300,
  SKILLS: 280, HIRING: 280, COMPARISON: 320, GENERAL: 180,
};

const KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
].filter(Boolean);

let currentKeyIndex = 0;
const getKey = () => KEYS[currentKeyIndex % KEYS.length];
const rotateKey = () => { currentKeyIndex = (currentKeyIndex + 1) % KEYS.length; };

export async function streamGroq({ question, intent, isArabic, systemPrompt, history, onToken }) {
  let lastError;

  for (let attempt = 0; attempt < KEYS.length; attempt++) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getKey()}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.5,
        max_tokens: MAX_TOKENS[intent] ?? 180,
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: question },
        ],
      }),
    });

    if (res.status === 429) {
      rotateKey();
      lastError = new Error("AI Offline (429)");
      continue; // try next key immediately
    }

    if (!res.ok) throw new Error(`AI Offline (${res.status})`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n").filter(Boolean);
      for (const line of lines) {
        if (line.includes("[DONE]")) return fullText;
        if (!line.startsWith("data: ")) continue;
        try {
          const token = JSON.parse(line.slice(6)).choices[0]?.delta?.content;
          if (token) { fullText += token; onToken?.(token); }
        } catch {}
      }
    }
    return fullText;
  }

  throw lastError; // all keys exhausted
}