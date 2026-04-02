export function detectIntent(q) {
  if (!q || typeof q !== "string") return "GENERAL";
  q = q.toLowerCase().trim();
  if (/^(hi|hello|hey|yo|sup|مرحبا|اهلا|ازيك|السلام)/.test(q)) return "GREETING";
  if (/(hire|job|freelance|available|work with|توظيف|شغل)/.test(q)) return "HIRING";
  if (/(linkedin|github|portfolio|social)/.test(q)) return "SOCIAL";
  if (/(contact|email|phone|reach|تواصل|معلومات التواصل)/.test(q)) return "CONTACT";
  if (/(project|taskly|pms|bills|lms|مشروع|تطبيق)/.test(q)) return "PROJECT";
  if (/(skill|tech|stack|laravel|vue|flutter|winForms|مهارة|تقنية)/.test(q)) return "SKILLS";
  if (/(which|compare|best|vs|أي|مقارنة)/.test(q)) return "COMPARISON";
  if (/(who|about|youssef|مين|عن يوسف)/.test(q)) return "ABOUT";
  if (/(link|repo|url)/.test(q)) return "LINKS";
  return "GENERAL";
}

export function detectMode(q) {
  q = q.toLowerCase();
  if (/(joke|laugh|funny|ضحك|نكتة)/.test(q)) return "FUN";
  if (/(idk|ok|whatever|nope|meh)/.test(q)) return "LOW_INTEREST";
  if (/(stop|annoying|leave me|مش عايز)/.test(q)) return "RESISTANT";
  return "NORMAL";
}