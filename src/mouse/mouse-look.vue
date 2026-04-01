<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Dot: follows mouse exactly
// Ring: lerps toward dot with delay
const dx = ref(0), dy = ref(0)   // dot
const rx = ref(0), ry = ref(0)   // ring
const scale = ref(1), dark = ref(false)

let click = false, hover = false, _scale = 1, raf = null, mo = null, styleEl = null
let _dx = 0, _dy = 0, _rx = 0, _ry = 0

const L = (a, b, t) => a + (b - a) * t
const RING_R = 10 // base ring radius

function frame() {
  raf = requestAnimationFrame(frame)
  _scale = L(_scale, click ? .5 : hover ? 1.8 : 1, .15)
  scale.value = _scale

  // Ring lerps toward dot — delay effect
  _rx = L(_rx, _dx, 0.12)
  _ry = L(_ry, _dy, 0.12)

  // Clamp ring center so dot never exits ring bounds
  const ringR = RING_R * _scale
  const dotR  = Math.max(0.5, 2.8 * _scale)
  const maxOffset = Math.max(0, ringR - dotR)
  const offX = _dx - _rx, offY = _dy - _ry
  const dist = Math.sqrt(offX * offX + offY * offY)
  if (dist > maxOffset) {
    const ratio = maxOffset / dist
    _rx = _dx - offX * ratio
    _ry = _dy - offY * ratio
  }

  dx.value = _dx; dy.value = _dy
  rx.value = _rx; ry.value = _ry
}

onMounted(() => {
   if (window.matchMedia('(pointer: coarse)').matches) return  // ← add this

  dark.value = document.documentElement.classList.contains('dark')
  mo = new MutationObserver(() => { dark.value = document.documentElement.classList.contains('dark') })
  mo.observe(document.documentElement, { attributeFilter: ['class'] })
  styleEl = Object.assign(document.createElement('style'), {
    textContent: '*,*::before,*::after{cursor:none!important}.terminal-root input,.terminal-root textarea{cursor:text!important}'
  })
  document.head.appendChild(styleEl)
  window.addEventListener('mousemove', e => { _dx = e.clientX; _dy = e.clientY }, { passive: true })
  window.addEventListener('mousedown', () => click = true)
  window.addEventListener('mouseup',   () => click = false)
  document.addEventListener('mouseover', e => {
    hover = !!(e.target?.closest('a,button,[role="button"],input,label,select,textarea'))
  }, { passive: true })
  raf = requestAnimationFrame(frame)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  mo?.disconnect()
  styleEl?.remove()
})
</script>

<template>
  <!-- Ring (delayed) -->
  <div class="fixed top-0 left-0 pointer-events-none z-[10000]"
    :style="{ transform: `translate(${rx}px,${ry}px)` }">
    <div :style="{
      position: 'absolute',
      width:  `${RING_R * 2 * scale}px`,
      height: `${RING_R * 2 * scale}px`,
      transform: 'translate(-50%,-50%)',
      borderRadius: '50%',
      border: `0.8px solid ${dark ? 'rgba(255,255,255,.3)' : 'rgba(0,0,0,.2)'}`

    }"/>
  </div>
  <!-- Dot (instant) -->
  <div class="fixed top-0 left-0 pointer-events-none z-[10000]"
    :style="{ transform: `translate(${dx}px,${dy}px)` }">
    <div :style="{
      position: 'absolute',
      width:  `${Math.max(1, 5.6 * scale)}px`,
      height: `${Math.max(1, 5.6 * scale)}px`,
      transform: 'translate(-50%,-50%)',
      borderRadius: '50%',
      background: dark ? 'rgba(255,255,255,.75)' : 'rgba(0,0,0,.7)',
      boxShadow: '0 0 0 1px rgba(0,0,0,.5), 0 0 0 2px rgba(255,255,255,.4)'


    }"/>
  </div>
</template>
