export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

// Hungarian number format: decimal comma, thin-space thousands
export function fmt(v, d = 1) {
  if (!isFinite(v)) return '–';
  const s = Math.abs(v).toFixed(d).split('.');
  s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (v < 0 ? '−' : '') + s.join(',');
}

export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(String(k)));
  return e;
}

const SVGNS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs = {}, ...kids) {
  const e = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs || {})) { if (v === null || v === undefined) continue; if (k === 'text') e.textContent = v; else e.setAttribute(k, v); }
  for (const k of kids.flat()) if (k) e.append(k);
  return e;
}
export function svgRoot(w, hgt, cls = '') { return s('svg', { viewBox: `0 0 ${w} ${hgt}`, width: w, height: hgt, class: (cls + (w >= 800 ? ' wide' : '')).trim(), role: 'img' }); }

// css var reader (resolved per theme)
export function cssVar(name, el = document.documentElement) { return getComputedStyle(el).getPropertyValue(name).trim(); }

// slider helper: keeps --p for the filled track and calls fn on input
export function bindRange(id, fn, outFmt) {
  const el = document.getElementById(id); if (!el) return null;
  const out = document.getElementById(id + 'o');
  const upd = () => {
    const v = parseFloat(el.value);
    const p = (v - parseFloat(el.min)) / (parseFloat(el.max) - parseFloat(el.min)) * 100;
    el.style.setProperty('--p', p + '%');
    if (out && outFmt) out.textContent = outFmt(v);
    fn && fn(v);
  };
  el.addEventListener('input', upd); upd();
  return { el, get: () => parseFloat(el.value), set: (v) => { el.value = v; upd(); }, upd };
}

export function segmented(container, items, initial, onChange) {
  const btns = items.map(([key, label]) => {
    const b = h('button', { type: 'button', 'aria-pressed': key === initial ? 'true' : 'false' }, label);
    b.addEventListener('click', () => { btns.forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); onChange(key); });
    container.append(b); return b;
  });
  onChange(initial);
  return btns;
}

export function onVisible(el, fn, threshold = 0.15) {
  const io = new IntersectionObserver((es) => es.forEach(e => fn(e.isIntersecting, e)), { threshold });
  io.observe(el); return io;
}

// theme change notification
const themeListeners = [];
export function onTheme(fn) { themeListeners.push(fn); }
export function fireTheme() { themeListeners.forEach(f => f()); }

export function verdict(el, cls, title, text) {
  el.innerHTML = '';
  el.append(h('div', { class: 'verdict ' + cls }, h('span', {}, cls === 'ok' ? '✓' : cls === 'mid' ? '!' : '✕'), h('div', {}, h('div', {}, title), text ? h('p', {}, text) : null)));
}

export function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// Boussinesq strip load: sigma_z / q at (x, z) for half-width b
export function stripS(x, z, b) {
  if (z <= 1e-6) return Math.abs(x) <= b ? 1 : 0;
  const a1 = Math.atan((x + b) / z), a2 = Math.atan((x - b) / z);
  const al = a1 - a2; return (al + Math.sin(al) * Math.cos(al + 2 * a2)) / Math.PI;
}
