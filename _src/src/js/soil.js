// Valósághű talajtextúrák az oldalon: előre kirajzolt, ismételhető csempék (assets/tex/*.webp, 4 × 3 m, 256 px/m).
// A csempéket a _src/tex/soiltex.js rajzolja (újragyártás: python3 _src/tex/render.py assets/tex).
const V = '1';
export const SOIL = {
  clay: '#84705a', loess: '#d3b780', peat: '#2b1d12', peatdry: '#5e452c', gyttja: '#4a473e', rubble: '#7f7262', slag: '#33312f', waste: '#2b241c', mixed: '#70593f',
  topsoil: '#33251a', sand: '#c7a871', gravel: '#a38b63', silt: '#868069', natural: '#8a6f4c', grass: '#4c6b2c', grassdry: '#9c9058',
};
const imgs = {}; let left = 0, started = false; const cbs = [];
export const soilURL = (k) => `assets/tex/${k}.webp?v=${V}`;
function load() {
  if (started) return; started = true; const ks = Object.keys(SOIL); left = ks.length;
  for (const k of ks) { const im = new Image(); im.decoding = 'async'; im.onload = im.onerror = () => { if (--left === 0) cbs.splice(0).forEach((f) => f()); }; im.src = soilURL(k); imgs[k] = im; }
}
// visszahívás, amikor minden csempe betöltött (a vászonra rajzoló ábrák ekkor rajzolnak újra)
export function onSoil(cb) { load(); if (left === 0) cb(); else cbs.push(cb); }
export const soilOK = (k) => !!(imgs[k] && imgs[k].complete && imgs[k].naturalWidth);
// kitöltő stílus 2D-vászonhoz: ppm = a vászon képpont/méter léptéke; amíg a csempe tölt, a talaj alapszíne
export function soilPattern(g, kind, ppm = 256, ox = 0, oy = 0) {
  load(); if (!soilOK(kind)) return SOIL[kind] || '#777';
  const p = g.createPattern(imgs[kind], 'repeat'); const k = ppm / 256; p.setTransform(new DOMMatrix([k, 0, 0, k, ox, oy])); return p;
}
// SVG-minták: #tex-<fajta> minden talajhoz, és a régi #hatch-* azonosítók is a valósághű csempére mutatnak
export function initSoilSVG() {
  load(); const NS = 'http://www.w3.org/2000/svg'; const defs = document.querySelector('svg defs'); if (!defs) return;
  const mk = (id, kind, w = 300) => { let p = document.getElementById(id); if (!p) { p = document.createElementNS(NS, 'pattern'); p.id = id; defs.append(p); } const h = w * 0.75; p.setAttribute('patternUnits', 'userSpaceOnUse'); p.setAttribute('width', w); p.setAttribute('height', h); p.textContent = '';
    const r = document.createElementNS(NS, 'rect'); r.setAttribute('width', w); r.setAttribute('height', h); r.setAttribute('fill', SOIL[kind]); const im = document.createElementNS(NS, 'image'); im.setAttribute('href', soilURL(kind)); im.setAttribute('width', w); im.setAttribute('height', h); im.setAttribute('preserveAspectRatio', 'none'); p.append(r, im); };
  for (const k of Object.keys(SOIL)) mk('tex-' + k, k);
  mk('hatch-clay', 'clay'); mk('hatch-loess', 'loess'); mk('hatch-fill', 'rubble'); mk('hatch-peat', 'peat');
}

// kiszáradt agyagfelszín felülnézetben: sokszöges száradási repedések (k = 0…1 a kiszáradás mértéke)
export function crackedTop(g, w, h, k, seed = 5, cell = 60) {
  const mk = (sd) => { let a = sd >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
  const r = mk(seed); const cols = Math.ceil(w / cell) + 2, rows = Math.ceil(h / cell) + 2; const pt = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pt.push([(i - 0.5 + 0.15 + r() * 0.7) * cell, (j - 0.5 + 0.15 + r() * 0.7) * cell]);
  const P2 = (i, j) => pt[j * cols + i]; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  for (let pass = 0; pass < 2; pass++) { const rr = mk(seed + 3); g.strokeStyle = pass ? `rgba(22,15,9,${0.3 + 0.6 * k})` : `rgba(120,100,70,${0.3 * k})`;
    const seg = (a, b, lw) => { const mx = (a[0] + b[0]) / 2 + (rr() - 0.5) * cell * 0.22, my = (a[1] + b[1]) / 2 + (rr() - 0.5) * cell * 0.22; g.lineWidth = lw + (pass ? 0 : 3); g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx, my, b[0], b[1]); g.stroke(); };
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) { const lw = (0.6 + rr() * 2.2) * (0.3 + k * 1.3) * cell / 60; const d = rr() < 0.3 ? 1 : 0; if (rr() < 0.9) seg(P2(i, j), P2(i + 1, Math.min(rows - 1, j + d)), lw); if (rr() < 0.9) seg(P2(i, j), P2(i, j + 1), lw); } }
  g.restore();
}
