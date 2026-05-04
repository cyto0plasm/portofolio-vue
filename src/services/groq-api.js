// streamGroq() → calls /api/chat → backend(vercel) → Groq
export async function streamGroq({
  question,
  systemPrompt,
  history,
}) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question,
      systemPrompt,
      history,
    }),
  });

  if (!res.ok) throw new Error("API error");

  const data = await res.json();

  return data.text;
}