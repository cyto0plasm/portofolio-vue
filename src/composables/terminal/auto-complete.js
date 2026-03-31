import { NAV_COMMANDS, PAGE_COMMANDS, UTILITY_COMMANDS } from './terminal-commands';

// ─── Build full command list ───────────────────────────────────
function allCommands(projectNavCommands = {}) {
  const navKeys = Object.keys({ ...NAV_COMMANDS, ...projectNavCommands }).map(k => `goto ${k}`);
  const cdKeys  = Object.keys(PAGE_COMMANDS).map(k => `cd ${k}`);
  return [...Object.keys(UTILITY_COMMANDS), ...navKeys, ...cdKeys];
}

// ─── Returns the single ghost suggestion, or '' ───────────────
export function getGhost(input, projectNavCommands) {
  if (!input) return '';
  const matches = allCommands(projectNavCommands).filter(c => c.startsWith(input) && c !== input);
  return matches.length === 1 ? matches[0] : '';
}

// ─── Returns all prefix matches (for Tab with multiple hits) ──
export function getPrefixMatches(input, projectNavCommands) {
  return allCommands(projectNavCommands).filter(c => c.startsWith(input));
}

// ─── Returns closest command by Levenshtein distance ─────────
export function getClosestCommand(input, projectNavCommands) {
  const close = allCommands(projectNavCommands).filter(c => levenshtein(c, input) <= 2);
  return close[0] ?? null;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = a[i-1] === b[j-1]
        ? d[i-1][j-1]
        : 1 + Math.min(d[i-1][j], d[i][j-1], d[i-1][j-1]);
  return d[m][n];
}
