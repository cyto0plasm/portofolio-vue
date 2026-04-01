
const push = (output, type, text) => output.value.push({ type, text });

// ─── Section navigation (goto) ────────────────────────────────
export const NAV_COMMANDS = {
  hero:        { description: 'Scroll to hero',                  selector: '#hero',             page: 'home'     },
  skills:      { description: 'Scroll to skills',                selector: '#skills',           page: 'home'     },
  projects:    { description: 'Scroll to projects highlight',    selector: '#projects',         page: 'home'     },
  contact:     { description: 'Scroll to contact',               selector: '#contact',          page: 'home'     },

};

// ─── Page navigation (cd) ─────────────────────────────────────
export const PAGE_COMMANDS = {
  home:     { description: 'Open homepage',          path: '/',          role: 'any'   },
  projects: { description: 'Open projects page',     path: '/projects',  role: 'any'   },
};

export const PAGE_COMMANDS_USER = {
  ...PAGE_COMMANDS,
};

// ─── Dynamic per-project goto commands ────────────────────────
export function buildProjectNavCommands(projects = []) {
  const cmds = {};
  projects.forEach(({ slug, name }) => {
    cmds[slug] = {
      description: `Scroll to project: ${name}`,
      selector: `#project-${slug}`,
      page: 'projects',
    };
  });
  return cmds;
}

// ─── Helper: resolve which page key the current route maps to ─
export function resolvePageKey(routePath = '') {
  if (routePath.startsWith('/projects')) return 'projects';
  return 'home';
}

// ─── Utility commands ─────────────────────────────────────────
export const UTILITY_COMMANDS = {

  help: {
    description: 'Show available commands',
    run(_, { output, projectNavCommands = {}, router, role = 'user' }) {
      const pageKey = resolvePageKey(router?.currentRoute?.value?.path ?? '');

      push(output, 'info', 'Utility commands:');
      Object.entries(UTILITY_COMMANDS).forEach(([name, cmd]) => {
        push(output, 'help-row',
          `<span class="cmd-name">${name}${cmd.usage ? ' ' + cmd.usage : ''}</span>` +
          `<span class="cmd-desc">${cmd.description}</span>`
        );
      });

      push(output, 'info', 'Page navigation (cd):');
      Object.entries(PAGE_COMMANDS)
        .filter(([, cmd]) => cmd.role === 'any' || cmd.role === role)
        .forEach(([name, cmd]) => {
          push(output, 'help-row',
            `<span class="cmd-name">cd ${name}</span>` +
            `<span class="cmd-desc">${cmd.description}</span>`
          );
        });

      const allNav = { ...NAV_COMMANDS, ...projectNavCommands };

      const homeSections = Object.entries(allNav).filter(([, cmd]) => cmd.page === 'home');
      if (homeSections.length) {
        push(output, 'info', 'Home page sections (goto):');
        homeSections.forEach(([name, cmd]) => {
          push(output, 'help-row',
            `<span class="cmd-name">goto ${name}</span>` +
            `<span class="cmd-desc">${cmd.description}${pageKey !== 'home' ? ' <span class="c-dim">[cd home first]</span>' : ''}</span>`
          );
        });
      }

      const projectSections = Object.entries(allNav).filter(([, cmd]) => cmd.page === 'projects');
      if (projectSections.length) {
        push(output, 'info', 'Projects page sections (goto):');
        projectSections.forEach(([name, cmd]) => {
          push(output, 'help-row',
            `<span class="cmd-name">goto ${name}</span>` +
            `<span class="cmd-desc">${cmd.description}${pageKey !== 'projects' ? ' <span class="c-dim">[cd projects first]</span>' : ''}</span>`
          );
        });
      }
    },
  },

  ls: {
    description: 'List pages and sections available on current page',
    run(_, { output, router, projectNavCommands = {}, role = 'user' }) {
      push(output, 'info', 'Pages (cd):');
      Object.entries(PAGE_COMMANDS)
        .filter(([, cmd]) => cmd.role === 'any' || cmd.role === role)
        .forEach(([name, cmd]) => {
          push(output, 'help-row',
            `<span class="cmd-name">${name}</span>` +
            `<span class="cmd-desc">${cmd.description}</span>`
          );
        });

      const pageKey = resolvePageKey(router?.currentRoute?.value?.path ?? '');
      const allNav  = { ...NAV_COMMANDS, ...projectNavCommands };

      push(output, 'info', 'Sections on this page (goto):');
      Object.entries(allNav)
        .filter(([, cmd]) => cmd.page === pageKey)
        .forEach(([name, cmd]) => {
          push(output, 'help-row',
            `<span class="cmd-name">${name}</span>` +
            `<span class="cmd-desc">${cmd.description}</span>`
          );
        });
    },
  },

  clear: {
    description: 'Clear terminal output',
    run(_, { output }) { output.value = []; },
  },

  echo: {
    description: 'Print text to terminal',
    usage: '[text]',
    run(args, { output }) { push(output, 'output', args.join(' ') || ''); },
  },

  history: {
    description: 'Show command history',
    run(_, { output, history }) {
      if (!history.value.length) { push(output, 'output', 'No history yet.'); return; }
      history.value.forEach((h, i) => push(output, 'output', `${String(i + 1).padStart(3)} · ${h}`));
    },
  },

  date: {
    description: 'Show current date & time',
    run(_, { output }) { push(output, 'output', new Date().toLocaleString()); },
  },

  whoami: {
    description: 'Show current user',
    run(_, { output }) { push(output, 'output', 'Youssef Adel Zaki, Nice To Meet You'); },
  },

  theme: {
    description: 'Change primary accent color',
    usage: '[color]',
    run(args, { output, layout }) {
      const color = args[0];
      if (!color) { push(output, 'error', 'Usage: theme [color] — e.g. theme #ff6b6b'); return; }
      layout.preferedColor = color;
      push(output, 'success', `Accent color → ${color}`);
    },
  },
};