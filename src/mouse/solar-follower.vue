<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useLayoutStore } from '../../Stores/layout-store.js'
import { useMouse } from '../../composables/mouse/use-mouse.js'

const store = useLayoutStore()
const canvas = ref(null)
const { mx, my } = useMouse()

const SIZE = 180, MARGIN = 16, DR = 22
let CX = 0, CY = 0
let ctx, dpr, raf, dark = false, mo = null, resizeTimer = null
let sunGrad = null, lastAtk = 0, nextAtk = 3000

// Flashes: cheap hit effect — just a fading ring, no per-frame alpha loop
const flashes = [], proj = []

const PLANETS = [
  { a: 0.0, s: .040, r: 14, sz: 1.8, lc: '#a8b8c8', dc: '#5a6e7f', w: 0, ws: .08, _g: null, _gx: -1, _gy: -1 },
  { a: 2.1, s: .025, r: 22, sz: 2.6, lc: '#54DEBD', dc: '#0a9b7d', w: 1, ws: .05, _g: null, _gx: -1, _gy: -1 },
  { a: 4.2, s: .016, r: 31, sz: 2.0, lc: '#ffb347', dc: '#c97a0a', w: 2, ws: .07, _g: null, _gx: -1, _gy: -1 },
  { a: 1.0, s: .010, r: 40, sz: 1.8, lc: '#ff6b6b', dc: '#bb2222', w: 3, ws: .03, _g: null, _gx: -1, _gy: -1 },
]
const DEF = Array.from({ length: 4 }, (_, i) => ({
  a: i * Math.PI / 2, s: .038 + i * .006, wx: 0, wy: 0
}))

function setup() {
  dpr = devicePixelRatio || 1
  CX = innerWidth - MARGIN - SIZE / 2
  CY = MARGIN + SIZE / 2
  const c = canvas.value
  c.width = innerWidth * dpr; c.height = innerHeight * dpr
  c.style.width = innerWidth + 'px'; c.style.height = innerHeight + 'px'
  ctx = c.getContext('2d')
  ctx.scale(dpr, dpr)
  sunGrad = null
  for (const p of PLANETS) { p._g = null; p._gx = -1; p._gy = -1 }
}

// Flash: expanding ring drawn with a single stroke — no globalAlpha needed
function flash(x, y, col) {
  flashes.push({ x, y, col, r: 4, life: 8 })
}

function spawnAtk(now) {
  const p = PLANETS[Math.random() * 4 | 0]
  const pr = p.r + Math.sin(p.w) * 2.5
  const ox = CX + Math.cos(p.a) * pr, oy = CY + Math.sin(p.a) * pr
  const ang = Math.atan2(my.value - oy, mx.value - ox) + (Math.random() - .5) * .35
  const spd = 1.6 + Math.random() * 1.2
  proj.push({ x: ox, y: oy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, col: dark ? p.lc : p.dc, age: 0 })
  lastAtk = now; nextAtk = 2200 + Math.random() * 2800
}

function drawSolar() {
  // Orbit rings
  ctx.strokeStyle = dark ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.07)'
  ctx.lineWidth = .5
  for (const p of PLANETS) { ctx.beginPath(); ctx.arc(CX, CY, p.r, 0, Math.PI * 2); ctx.stroke() }

  // Aim line
  const ang = Math.atan2(my.value - CY, mx.value - CX)
  ctx.save()
  ctx.setLineDash([3, 5])
  ctx.strokeStyle = dark ? 'rgba(255,220,100,.22)' : 'rgba(180,120,0,.18)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(CX + Math.cos(ang) * 11, CY + Math.sin(ang) * 11)
  ctx.lineTo(CX + Math.cos(ang) * 38, CY + Math.sin(ang) * 38)
  ctx.stroke()
  ctx.restore()

  // Sun
  if (!sunGrad) {
    sunGrad = ctx.createRadialGradient(CX - 1, CY - 1, 0, CX, CY, 10)
    sunGrad.addColorStop(0, '#fff7a1'); sunGrad.addColorStop(.6, '#FDB813'); sunGrad.addColorStop(1, '#f97316')
  }
  ctx.beginPath(); ctx.arc(CX, CY, 8, 0, Math.PI * 2); ctx.fillStyle = sunGrad; ctx.fill()

  // Planets
  for (const p of PLANETS) {
    p.a += p.s; p.w += p.ws
    const pr = p.r + Math.sin(p.w) * 2.5
    const px = CX + Math.cos(p.a) * pr, py = CY + Math.sin(p.a) * pr
    const col = dark ? p.lc : p.dc
    if (!p._g || Math.abs(px - p._gx) > 1 || Math.abs(py - p._gy) > 1) {
      p._g = ctx.createRadialGradient(px, py, 0, px, py, p.sz * 2.5)
      p._g.addColorStop(0, col + '55'); p._g.addColorStop(1, col + '00')
      p._gx = px; p._gy = py
    }
    ctx.beginPath(); ctx.arc(px, py, p.sz * 2.5, 0, Math.PI * 2); ctx.fillStyle = p._g; ctx.fill()
    ctx.beginPath(); ctx.arc(px, py, p.sz, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill()
  }
}

function drawDefenders() {
  ctx.fillStyle = dark ? '#54DEBD' : '#0a9b7d'
  for (const d of DEF) {
    d.a += d.s
    d.wx = CX + Math.cos(d.a) * DR
    d.wy = CY + Math.sin(d.a) * DR
    ctx.beginPath(); ctx.arc(d.wx, d.wy, 1.8, 0, Math.PI * 2); ctx.fill()
  }
}

function tickProj() {
  for (let i = proj.length - 1; i >= 0; i--) {
    const p = proj[i]; p.x += p.vx; p.y += p.vy; p.age++
    let hit = false
    for (const d of DEF) {
      if (Math.hypot(p.x - d.wx, p.y - d.wy) < 7) { flash(p.x, p.y, p.col); hit = true; break }
    }
    if (!hit && Math.hypot(p.x - mx.value, p.y - my.value) < 10) { flash(p.x, p.y, '#ff6b6b'); hit = true }
    if (hit || p.age > 600 || p.x < -60 || p.x > innerWidth + 60 || p.y < -60 || p.y > innerHeight + 60) {
      proj.splice(i, 1); continue
    }
    ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fillStyle = p.col + '33'; ctx.fill()
    ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fillStyle = p.col; ctx.fill()
  }
}

function tickFlashes() {
  // No globalAlpha — use hex opacity on stroke color instead
  for (let i = flashes.length - 1; i >= 0; i--) {
    const f = flashes[i]
    f.r += 2; f.life--
    if (f.life <= 0) { flashes.splice(i, 1); continue }
    // opacity encoded as hex: life goes 8→1, map to 11→88
    const op = Math.floor((f.life / 8) * 0x88).toString(16).padStart(2, '0')
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
    ctx.strokeStyle = f.col + op; ctx.lineWidth = 1.5; ctx.stroke()
  }
}

function frame(now) {
  raf = requestAnimationFrame(frame)
  ctx.clearRect(0, 0, innerWidth, innerHeight)
  if (!store.showSolarSystem) return
  drawSolar()
  if (now - lastAtk > nextAtk) spawnAtk(now)
  tickProj()
  tickFlashes()
  drawDefenders()
}

function onDarkChange() {
  dark = document.documentElement.classList.contains('dark')
  sunGrad = null
  for (const p of PLANETS) p._g = null
}

onMounted(() => {
  setup()
  dark = document.documentElement.classList.contains('dark')
  mo = new MutationObserver(onDarkChange)
  mo.observe(document.documentElement, { attributeFilter: ['class'] })
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(setup, 150) })
  raf = requestAnimationFrame(frame)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearTimeout(resizeTimer)
  mo?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="fixed inset-0 pointer-events-none z-[9999]" />
</template>
