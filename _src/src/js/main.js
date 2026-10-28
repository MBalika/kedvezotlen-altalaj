import { $, $$, h, fireTheme } from './util.js';
import { heroCores, compare, clayMicro, criteria, season, storeys, rules, loessMicro, oedometer } from './widgets1.js';
import { history, sortGame, stats, gas, improve, holme, peatGame, peatBars, settle, timeCurve, bulb, peatTree } from './widgets2.js';
import { quizzes, detective, trueFalse } from './quiz.js';
import { QUIZ, DETECTIVE, TF } from './data.js';
import { initSims } from './sim3d.js';
import { startFormatting } from './guard.js';

// Link of the separate "Védekezés a káros süllyedések ellen" page (set when it is deployed)
const VEDEKEZES_URL = window.VEDEKEZES_URL || 'https://vedekezesakarossullyedesekellen.vercel.app';

const VIDEOS = {
  1: { file: 'videok/1_Terfogatvaltozo_agyagok_video.html?v=20261028', poster: 'assets/p1.jpg?v=20261028', dur: '2:56', title: 'Térfogatváltozó agyagok', parts: ['Aszály egy alföldi faluban', 'Mi történik az agyagban?', 'Az épület évszakos mozgása', 'Felismerés és határértékek', 'Tervezési szabályok'] },
  2: { file: 'videok/2_Roskadekony_talajok_video.html?v=20261028', poster: 'assets/p2.jpg?v=20261028', dur: '3:07', title: 'Roskadékony talajok', parts: ['Löszvidék, pincesor', 'A lösz szemcseszinten', 'A három feltétel', 'Csőtörés és roskadás', 'Ödométer, iᵣ', 'Védekezés és talajjavítás'] },
  3: { file: 'videok/3_Feltoltesek_video.html?v=20261028', poster: 'assets/p3.jpg?v=20261028', dur: '2:57', title: 'Feltöltések', parts: ['Egy telek története', 'Miből áll a feltöltés?', 'Károk és statisztika', 'Víz és gázok', 'Irányelvek', 'Javítási módszerek'] },
  4: { file: 'videok/4_Szerves_talajok_video.html?v=20261028', poster: 'assets/p4.jpg?v=20261028', dur: '2:51', title: 'Szerves talajok', parts: ['Holme Fen: a talaj, amely eltűnik', 'Keletkezés', 'Felismerés a laborban', 'Tulajdonságok', 'Károk', 'Alapozás és irányelvek'] },
};

function videos() {
  $$('.video[data-video]').forEach(el => {
    const v = VIDEOS[el.dataset.video]; if (!v) return;
    const poster = h('button', { class: 'video-poster', type: 'button', 'aria-label': 'Animáció lejátszása: ' + v.title, style: `background-image:url('${v.poster}')` },
      h('span', { class: 'play', html: '<svg viewBox="0 0 24 24" fill="#111"><path d="M6 4l14 8-14 8z"/></svg>' }), h('span', { class: 'dur' }, v.dur));
    poster.addEventListener('click', () => openVideo(v));
    const info = h('div', { class: 'video-info' }, h('span', { class: 'k' }, 'Animáció · ' + el.dataset.video + '. rész'), h('h4', {}, v.title),
      h('p', {}, '3D animációs magyarázó videó narrációs feliratokkal. Teljes képernyőn is nézhető.'), h('ol', {}, ...v.parts.map(p => h('li', {}, p))));
    el.append(poster, info);
  });
}
function openVideo(v) {
  const close = h('button', { class: 'modal-close', type: 'button', 'aria-label': 'Bezárás' }, '✕');
  const inner = h('div', { class: 'modal-in' });
  const msg = h('div', { class: 'modal-msg' }, 'Animáció betöltése…');
  inner.append(msg);
  const frame = h('iframe', { src: v.file + '#autoplay', title: v.title, allow: 'fullscreen; autoplay', allowfullscreen: true, webkitallowfullscreen: true });
  frame.addEventListener('load', () => msg.remove());
  inner.append(frame);
  const modal = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': v.title }, inner, close);
  const shut = () => { modal.remove(); document.removeEventListener('keydown', esc); removeEventListener('message', onMsg); };
  const esc = (e) => { if (e.key === 'Escape') shut(); };
  // a videó teljes képernyő gombja: valódi teljes képernyő, vagy (iPhone) a modális ablak tölti ki a képernyőt
  const toggleMax = () => { const fe = document.fullscreenElement || document.webkitFullscreenElement;
    if (fe) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (modal.classList.contains('max')) { modal.classList.remove('max'); return; }
    const req = frame.requestFullscreen || frame.webkitRequestFullscreen;
    if (!req) { modal.classList.add('max'); return; }
    try { const pr = req.call(frame); if (pr && pr.catch) pr.catch(() => modal.classList.add('max')); } catch (e) { modal.classList.add('max'); } };
  const onMsg = (e) => { if (e.data === 'ka-close-video') shut(); else if (e.data === 'vfs') toggleMax(); };
  addEventListener('message', onMsg);
  close.addEventListener('click', shut); modal.addEventListener('click', (e) => { if (e.target === modal) shut(); });
  document.addEventListener('keydown', esc);
  document.body.append(modal); close.focus();
}

function theme() {
  const btn = $('#themeBtn'); const root = document.documentElement;
  try { const t = localStorage.getItem('ka-theme'); if (t) root.setAttribute('data-theme', t); } catch (e) {}
  btn.addEventListener('click', () => {
    const cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', nx);
    try { localStorage.setItem('ka-theme', nx); } catch (e) {}
    fireTheme();
  });
}

function navigation() {
  const links = $$('.navlinks a'); const railLinks = $$('#railLog a');
  const secs = links.map(a => document.getElementById(a.dataset.nav)).filter(Boolean);
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { const id = e.target.id; links.forEach(a => a.classList.toggle('on', a.dataset.nav === id)); railLinks.forEach(a => a.classList.toggle('on', a.dataset.rail === id)); } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => io.observe(s));
  const marker = $('#railMarker'), depth = $('#railDepth'), log = $('#railLog');
  const a = $('#terfogatvaltozo'), b = $('#osszevetes');
  const onScroll = () => {
    if (!a || !b || !marker) return;
    const y = window.scrollY + window.innerHeight * 0.4;
    const t = Math.min(1, Math.max(0, (y - a.offsetTop) / (b.offsetTop - a.offsetTop)));
    marker.style.top = (t * (log.clientHeight - 3)) + 'px';
    depth.textContent = (t * 20).toFixed(1).replace('.', ',') + ' m';
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
}

function counts() {
  const nW = $$('.widget').length + $$('.sim').length + $$('.sort, .det, #peatGame').length;
  const nQ = Object.values(QUIZ).reduce((a, q) => a + q.length, 0) + DETECTIVE.length + TF.length + 6 + 1;
  const a = $('#statInter'); if (a) a.textContent = nW;
  const b = $('#statQ'); if (b) b.textContent = nQ;
}

function vedekezes() {
  const a = $('#vedekezesLink'); if (!a) return;
  if (VEDEKEZES_URL) a.href = VEDEKEZES_URL;
  else { a.removeAttribute('target'); a.href = '#tovabb'; const sp = a.querySelector('span'); if (sp) sp.textContent = 'Külön interaktív oldal: hamarosan itt lesz a link'; }
}

function safe(fn, name) { try { fn(); } catch (e) { console.error('widget hiba: ' + name, e); } }

theme();
[['cores', heroCores], ['compare', compare], ['videos', videos], ['clayMicro', clayMicro], ['criteria', criteria], ['season', season], ['storeys', storeys], ['rules', rules],
  ['loessMicro', loessMicro], ['oedometer', oedometer], ['history', history], ['sortGame', sortGame], ['stats', stats], ['gas', gas], ['improve', improve],
  ['holme', holme], ['peatGame', peatGame], ['peatBars', peatBars], ['settle', settle], ['timeCurve', timeCurve], ['bulb', bulb], ['peatTree', peatTree],
  ['quizzes', quizzes], ['detective', detective], ['trueFalse', trueFalse], ['sims', initSims], ['nav', navigation], ['counts', counts], ['vedekezes', vedekezes]].forEach(([n, f]) => safe(f, n));
startFormatting();   // sorkizárás + magyar elválasztás + nem törő egységek (formázás skill)
window.__ready = true;
