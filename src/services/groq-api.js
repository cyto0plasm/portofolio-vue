export async function streamGroq({
  question,
  systemPrompt,
  history,
  onToken,
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

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split("\n").filter(Boolean);

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;

      if (line.includes("[DONE]")) return fullText;

      try {
        const { token } = JSON.parse(line.replace("data: ", ""));
        if (token) {
          fullText += token;
          onToken?.(token);
        }
      } catch {}
    }
  }

  return fullText;
}