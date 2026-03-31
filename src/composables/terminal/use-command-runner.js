import { ref, computed, watch } from 'vue';
import { useLayoutStore } from '../../Stores/layout-store.js';
import {
  UTILITY_COMMANDS,
  NAV_COMMANDS,
  PAGE_COMMANDS,
  PAGE_COMMANDS_USER,
  buildProjectNavCommands,
  resolvePageKey,
} from './terminal-commands.js';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/vue3';
import { useOutput } from './use-output.js';
import { getGhost, getPrefixMatches, getClosestCommand } from './auto-complete.js';

export function useCommandRunner(props) {
  // props.role: 'admin' | 'user'
  const layout  = useLayoutStore();
  const command = ref('');
  const ghost   = ref('');
  const inputError = ref(false);

  const { output, push, clear } = useOutput();

  const history = computed({
    get: () => layout.terminalHistory,
    set: v  => (layout.terminalHistory = v),
  });
  const histIdx = ref(-1);

  const isAdmin = computed(() => props.role === 'admin');

  const projectNavCommands = computed(() => buildProjectNavCommands(props.projects));
  const currentPageKey     = computed(() => resolvePageKey(router.currentRoute?.value?.name ?? ''));

  // ─── Ghost text ────────────────────────────────────────────
  watch(command, val => {
    ghost.value = getGhost(val, projectNavCommands.value);
  });

  // ─── Keyboard handler ──────────────────────────────────────
  function handleKeydown(e) {
    if (e.key === 'ArrowUp')                { e.preventDefault(); historyUp();    }
    else if (e.key === 'ArrowDown')         { e.preventDefault(); historyDown();  }
    else if (e.key === 'Tab')               { e.preventDefault(); onTab();        }
    else if (e.key === 'Escape')            { layout.terminalOpen = false;        }
    else if (e.key === 'l' && e.ctrlKey)    { e.preventDefault(); clear();        }
  }

  function onTab() {
    const raw = command.value.trim();
    if (ghost.value) { command.value = ghost.value + ' '; ghost.value = ''; return; }
    const matches = getPrefixMatches(raw, projectNavCommands.value);
    if (matches.length > 1) push('info', matches.join('   '));
  }

  // ─── History navigation ────────────────────────────────────
  function historyUp() {
    if (!history.value.length) return;
    histIdx.value = Math.min(histIdx.value + 1, history.value.length - 1);
    command.value = history.value[history.value.length - 1 - histIdx.value];
  }

  function historyDown() {
    if (histIdx.value <= 0) { histIdx.value = -1; command.value = ''; return; }
    histIdx.value--;
    command.value = history.value[history.value.length - 1 - histIdx.value];
  }

  // ─── Run command ───────────────────────────────────────────
  function runCommand() {
    const raw = command.value.trim();
    command.value = '';
    ghost.value   = '';
    histIdx.value = -1;
    if (!raw) return;

    if (history.value.at(-1) !== raw)
      history.value = [...history.value, raw];

    push('input', raw);

    const [base, ...args] = raw.split(/\s+/);
    if (base === 'cd')   return execCd(args);
    if (base === 'goto') return execGoto(args);
    execUtility(base, args);
  }

  function execCd(args) {
    const page = args[0];
    if (!page) return fail('Usage: <span class="hl-amber">cd [page]</span>');

    const cmd = PAGE_COMMANDS[page];
    if (!cmd) return fail(`Unknown page: <span class="hl-red">${esc(page)}</span>`);

    // Admin-only page, user is not admin
    if (cmd.role === 'admin' && !isAdmin.value) {
      // Special case: redirect 'projects' to the public route
      if (page === 'projects') {
        const publicCmd = PAGE_COMMANDS_USER['projects'];
        if (route().current(publicCmd.route)) {
          push('info', `Already on <span class="hl-amber">${page}</span>`);
          return;
        }
        push('success', `→ navigating to ${page}…`);
        router.visit(route(publicCmd.route));
        return;
      }
      return fail(`Access denied: <span class="hl-red">${esc(page)}</span> requires admin privileges.`);
    }

    if (route().current(cmd.route)) {
      push('info', `Already on <span class="hl-amber">${page}</span>`);
      return;
    }

    push('success', `→ navigating to ${page}…`);
    router.visit(route(cmd.route));
  }

  function execGoto(args) {
    const target = args[0];
    if (!target) return fail('Usage: <span class="hl-amber">goto [section]</span>');

    const allNav = { ...NAV_COMMANDS, ...projectNavCommands.value };
    const cmd    = allNav[target];
    if (!cmd) return fail(`Unknown section: <span class="hl-red">${esc(target)}</span>`);

    if (cmd.page !== currentPageKey.value) {
      return fail(
        `<span class="hl-red">${esc(target)}</span> is on ` +
        `<span class="hl-amber">${cmd.page}</span>. ` +
        `Run <span class="hl-amber">cd ${cmd.page}</span> first.`
      );
    }

    const el = document.querySelector(cmd.selector);
    if (!el) return fail(`Element not found for <span class="hl-red">${esc(target)}</span>`);

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    push('success', `↓ scrolled to ${target}`);
  }

  function execUtility(base, args) {
    const cmd = UTILITY_COMMANDS[base];
    if (!cmd) {
      const hint = getClosestCommand(base, projectNavCommands.value);
      return fail(
        `Not found: <span class="hl-red">${esc(base)}</span>` +
        (hint ? `  Did you mean <span class="hl-amber">${esc(hint)}</span>?` : '')
      );
    }
    try {
      cmd.run(args, {
        output,
        history,
        layout,
        router,
        projectNavCommands: projectNavCommands.value,
        role: props.role ?? 'user',
      });
    } catch (err) {
      push('error', `Error: ${esc(String(err.message ?? err))}`);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────
  function fail(msg) {
    push('error', msg);
    inputError.value = true;
    setTimeout(() => (inputError.value = false), 400);
  }

  function esc(s) {
    return s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  return { output, command, ghost, inputError, clear, handleKeydown, runCommand };
}
