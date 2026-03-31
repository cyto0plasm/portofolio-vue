import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', {
  // ------------------
  // State: reactive properties
  // ------------------
  state: () => ({
    loading:false,
    pageReady: false,
    commandLodaing:false,
    //panles
    asideOpen: false,
    //preferances
     isDark: false,
    preferedColor:"#54debd",
    showSolarSystem: true,

    // terminal
        terminalOpen:false,
        terminalHeight:  200,
    terminalOutput: [
      { type: 'system', text: 'Terminal v1.0.0 — type <span class="text-amber-400">help</span> for available commands' },
      { type: 'system', text: '─────────────────────────────────────────' },
    ],
    terminalHistory: [],
  }),

  // ------------------
  // Getters: computed derived state
  // ------------------
  getters: {
    // preferances
    getColor:(state)=> state.preferedColor,
    isAsideOpen: (state) => state.asideOpen,

  },

  // ------------------
  // Actions: methods that modify state
  // ------------------
  actions: {
    //Main Color
    SetColor(color){
        this.preferedColor =color;
    },
    //Aside Bar
    toggleAside() {
      this.asideOpen = !this.asideOpen
    },
    openAside() {
      this.asideOpen = true
    },
    closeAside() {
      this.asideOpen = false
    },
    //Terminal
   openTerminal() {
  this.terminalOpen = true
},
closeTerminal() {
  this.terminalOpen = false
}

  },
})
