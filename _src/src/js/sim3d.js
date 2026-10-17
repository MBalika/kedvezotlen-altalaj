import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { clamp, lerp, smooth, $, $$, h, fmt, bindRange, mulberry32, stripS, cssVar } from './util.js';

// ====================================================================== constants
const BX = 15, BD = 8, BZ = 6;          // block half-width (x), depth (y), half-depth (z)
const PXM = 50;                          // section canvas px per metre
const CW = BX * 2 * PXM, CH = BD * PXM;  // 1500 x 400
const HX0 = -6, HX1 = 2, HZ0 = -2.4, HZ1 = 5.6; // house footprint
const XL = -5.75, XR = 1.75;             // wall / footing centre lines
const HL = HX1 - HX0;                    // house length (m)

// ====================================================================== soil models
const MODELS = {
  clay: {
    name: 'Térfogatváltozó agyag', ch: 1, ex: 20,
    controls: [
      ['season', 'range', 'Nedvességi állapot', 0, 100, 1, 18, (v) => v < 30 ? 'aszályos ősz' : v < 45 ? 'száraz nyár' : v < 56 ? 'átlagos' : v < 75 ? 'nedves tél' : 'csapadékos tavasz'],
      ['tree', 'range', 'Nyárfa távolsága a háztól', 1.5, 13, 0.5, 4, (v) => v >= 13 ? 'nincs fa' : fmt(v, 1) + ' m'],
      ['D', 'range', 'Alapozási mélység', 0.6, 3.0, 0.05, 0.8, (v) => fmt(v, 2) + ' m'],
      ['n', 'range', 'Szintek száma', 1, 3, 1, 1, (v) => v + ' szint'],
    ],
    compute(p) {
      const s = (p.season - 50) / 50; const za = 2.25;
      const treeOn = p.tree < 13;
      const fT = (d) => treeOn ? clamp(1 - d / 12) : 0;
      const fR = fT(p.tree), fL = fT(p.tree + HL);
      const q = [50, 95, 140][p.n - 1], ps = 150;
      const one = (f) => {
        const zt = za + 2.4 * f;
        let mm = 0;
        if (s > 0) mm = -30 * s * Math.max(0, za - p.D) * Math.max(0, 1 - q / ps) * (1 - 0.6 * f);
        else mm = 40 * (-s) * Math.max(0, za - p.D);
        mm += 28 * f * Math.max(0, zt - p.D) * (s < 0 ? 0.6 + 0.4 * -s : 0.35);
        return mm;
      };
      const sL = one(fL), sR = one(fR);
      return { sL, sR, q, za, zt: za + 2.4 * fR, fR, treeOn, s };
    },
    verdict(r, p) {
      const out = [];
      if (p.D >= 2.25 && r.fR < 0.25) out.push(['ok', 'Az alapsík a meteorológiai határmélység (2–2,5 m) alatt van: a szezonális mozgás gyakorlatilag megszűnik.']);
      else if (p.D >= 2.25) out.push(['mid', 'Az alapsík elég mély, de a közeli nyárfa gyökérzete ennél mélyebben is kiszárítja az agyagot!']);
      else out.push(['no', `Az alapsík ${fmt(p.D, 2)} m: a 2–2,5 m-es meteorológiai határmélység fölött van, az épület évszakosan mozog.`]);
      if (r.treeOn && p.tree < 8) out.push(['no', 'Nagy vízigényű fa a ház közelében: egyenlőtlen süllyedés a fa felőli oldalon.']);
      if (r.s > 0.2 && p.n === 1 && p.D < 2) out.push(['mid', 'Kis talpfeszültség: a duzzadási nyomás (>100 kPa) megemeli a könnyű házat.']);
      return out;
    },
  },
  loess: {
    name: 'Roskadékony lösz', ch: 2, ex: 12,
    controls: [
      ['water', 'range', 'Csőtörés: átázott zóna', 0, 100, 1, 0, (v) => v === 0 ? 'nincs víz' : 'r ≈ ' + fmt(0.3 + 4.2 * v / 100, 1) + ' m'],
      ['q', 'range', 'Talpfeszültség', 20, 200, 5, 90, (v) => v + ' kPa'],
      ['ir', 'range', 'Roskadási tényező iᵣ', 0, 0.08, 0.002, 0.045, (v) => fmt(v, 3)],
      ['pipe', 'toggle', 'Védőcső + zárt csatorna (a víz nem jut a löszbe)', 0, 0, 0, 0],
      ['stiff', 'toggle', 'Vb. koszorú + vasalt gerendarács alap', 0, 0, 0, 0],
    ],
    compute(p) {
      const W = p.pipe ? 0 : p.water / 100;
      const r = 0.3 + 4.2 * W, cx = -8.6, cd = 1.3;
      const chord = (xf) => { const dx = Math.abs(xf - cx); if (dx >= r || W === 0) return 0; const half = Math.sqrt(r * r - dx * dx); const top = Math.max(0.9, cd - half), bot = cd + half; return Math.max(0, bot - top); };
      const wL = chord(XL), wR = chord(XR);
      const loadF = 0.35 + 0.65 * Math.min(1, p.q / 150);
      const coll = (w) => p.ir > 0.01 ? p.ir * w * loadF * 1000 : p.ir * w * 200;
      let sL = coll(wL), sR = coll(wR);
      if (p.stiff) { const avg = (sL + sR) / 2; sL = avg + (sL - avg) * 0.35; sR = avg + (sR - avg) * 0.35; }
      return { sL, sR, r, cx, cd, W, wL, wR, cond: [p.ir > 0.01, p.q > 0, W > 0 && (wL > 0 || wR > 0)] };
    },
    verdict(r, p) {
      const out = [];
      const [c1, c2, c3] = r.cond;
      if (c1 && c2 && c3) out.push(['no', 'Mindhárom feltétel teljesül: roskadás! A süllyedés hirtelen és visszafordíthatatlan.']);
      else if (!c1) out.push(['ok', 'iᵣ ≤ 0,01: a talaj nem roskadásveszélyes.']);
      else if (p.pipe) out.push(['ok', 'A víz nem jut a löszbe: nincs roskadás.']);
      else if (!c3) out.push(['ok', 'A víz még nem érte el az alapok alatti talajt.']);
      if (p.stiff && c1 && c3) out.push(['mid', 'A merev szerkezet nem akadályozza meg a roskadást, de egyenletesebbé teszi a süllyedést, így kisebb a kár.']);
      return out;
    },
  },
  fill: {
    name: 'Feltöltés', ch: 3, ex: 10,
    controls: [
      ['edge', 'range', 'A feltöltött gödör széle', -8, 6, 0.1, 0, (v) => v <= -6.5 ? 'a ház mellett' : v >= 3 ? 'túl a házon' : 'a ház alatt'],
      ['Hmax', 'range', 'A gödör mélysége', 2, 7, 0.1, 5, (v) => fmt(v, 1) + ' m'],
      ['age', 'range', 'A feltöltés kora', 1, 60, 1, 6, (v) => v + ' év'],
      ['mat', 'seg', 'Anyag', 0, 0, 0, 'rubble', [['rubble', 'Talaj, törmelék'], ['slag', 'Salak, hamu'], ['waste', 'Házi szemét']]],
      ['q', 'range', 'Talpfeszültség', 50, 250, 5, 120, (v) => v + ' kPa'],
      ['wet', 'toggle', 'Átázás (csőtörés, tetővíz)', 0, 0, 0, 0],
    ],
    compute(p) {
      const depth = (x) => clamp((p.edge - x) * 1.0, 0, p.Hmax);
      const HfL = depth(XL), HfR = depth(XR);
      const baseE = { rubble: 6000, slag: 5000, waste: 1500 }[p.mat];
      const E = baseE * (0.45 + 0.55 * Math.min(1, p.age / 30));
      const D = 1.0, b = 0.35;
      const one = (Hf) => {
        if (Hf <= D) return 0;
        let sum = 0; const n = 24; const dz = (Hf - D) / n;
        for (let i = 0; i < n; i++) { const z = (i + 0.5) * dz; sum += p.q * stripS(0, z, b) * dz; }
        let mm = sum / E * 1000;
        if (p.wet) mm += (Hf - D) * (p.age < 10 ? 25 : p.mat === 'rubble' ? 6 : 10);
        if (p.mat === 'waste') mm += (Hf - D) * 22 * (1 - Math.min(1, p.age / 60));
        return mm;
      };
      return { sL: one(HfL), sR: one(HfR), HfL, HfR, E };
    },
    verdict(r, p) {
      const out = [];
      out.push(p.q <= 150 ? ['ok', `Talpfeszültség ${p.q} kPa ≤ 150–200 kPa.`] : p.q <= 200 ? ['mid', `Talpfeszültség ${p.q} kPa: a 150–200 kPa-os határ felső részén.`] : ['no', `Talpfeszültség ${p.q} kPa > 200 kPa: túl nagy feltöltésre.`]);
      out.push(Math.abs(r.HfL - r.HfR) <= 0.5 ? ['ok', 'Az alapok alatt közel azonos vastagságú a feltöltés.'] : ['no', `Eltérő feltöltésvastagság: ${fmt(r.HfL, 1)} m és ${fmt(r.HfR, 1)} m az alapok alatt.`]);
      if (p.mat === 'waste') out.push(['no', 'Házi szemét: bomlik, gázt termel, sokáig süllyed. Nagyon veszélyes!']);
      else if (p.age < 10 && (r.HfL > 1 || r.HfR > 1)) out.push(['no', '8–10 évnél fiatalabb, tömörítetlen feltöltés: nagyon veszélyes, átázva roskad.']);
      if (p.wet && (r.HfL > 1 || r.HfR > 1)) out.push(['mid', 'A víz a károk 87%-ának kiváltója: tartsuk távol!']);
      return out;
    },
  },
  peat: {
    name: 'Szerves talaj (tőzeg)', ch: 4, ex: 5,
    controls: [
      ['hc', 'range', 'Homok fedőréteg', 0.5, 3, 0.1, 2.4, (v) => fmt(v, 1) + ' m'],
      ['hp', 'range', 'Tőzeg vastagsága (bal oldalon)', 0.5, 5, 0.1, 3, (v) => fmt(v, 1) + ' m'],
      ['B', 'range', 'Alapszélesség B', 0.4, 2.5, 0.05, 0.5, (v) => fmt(v, 2) + ' m'],
      ['q', 'range', 'Talpfeszültség', 50, 250, 5, 120, (v) => v + ' kPa'],
      ['E', 'range', 'Tőzeg Eoed', 300, 2000, 50, 600, (v) => v + ' kPa'],
      ['gw', 'range', 'Talajvízszint-süllyedés', 0, 2, 0.1, 0, (v) => v === 0 ? 'nincs' : fmt(v, 1) + ' m'],
    ],
    compute(p) {
      const D = 0.9, gw0 = 1.2;
      const hpR = p.hp * 0.55;
      const one = (hp) => {
        const top = Math.max(p.hc, D), bot = p.hc + hp;
        let sum = 0; const n = 30; const dz = Math.max(0, bot - top) / n;
        for (let i = 0; i < n; i++) { const z = top + (i + 0.5) * dz - D; sum += p.q * stripS(0, Math.max(z, 0.01), p.B / 2) * dz; }
        const cons = sum / p.E; const sAvg = hp > 0 ? sum / Math.max(0.01, bot - top) : 0;
        const gwN = gw0 + p.gw;
        const drained = clamp(gwN - p.hc, 0, hp) - clamp(gw0 - p.hc, 0, hp);
        const gwS = 0.12 * drained + 10 * p.gw * Math.max(0, hp - drained) / p.E;
        const sec = 0.03 * Math.max(0, bot - top) * Math.min(1, sAvg / 30);
        return { cons: cons * 1000, gw: gwS * 1000, sec: sec * 1000, tot: (cons + gwS + sec) * 1000 };
      };
      const L = one(p.hp), R = one(hpR);
      const z02 = (() => { let z = 0.02; while (stripS(0, z, p.B / 2) >= 0.2 && z < 15) z += 0.02; return D + z; })();
      return { sL: L.tot, sR: R.tot, L, R, hpR, z02, inPeat: p.hc < D };
    },
    verdict(r, p) {
      const out = [];
      if (r.inPeat) out.push(['no', 'A fedőréteg vékonyabb a fagyhatárnál: az alap a tőzegbe kerül! Talajcsere vagy mélyített síkalap kell.']);
      else if (r.z02 <= p.hc) out.push(['ok', 'A 0,2 q izobár a homokban marad: keskeny, sekély alap, kis feszültség jut a tőzegre.']);
      else out.push(['mid', 'A feszültség-hagyma eléri a tőzeget: keskenyebb alap vagy kisebb talpfeszültség kedvezőbb.']);
      out.push(r.L.tot <= 50 ? ['ok', `A becsült teljes süllyedés ${fmt(r.L.tot / 10, 1)} cm (EC7 H melléklet: ~5 cm gyakran elfogadható).`] : ['no', `A becsült teljes süllyedés ${fmt(r.L.tot / 10, 1)} cm: jóval több, mint ami általában elfogadható.`]);
      if (p.gw > 0.3) out.push(['no', 'A talajvízszint süllyedése kiszárítja a tőzeget: zsugorodik és lebomlik.']);
      return out;
    },
  },
};

// ====================================================================== textures
function canvasTex(w, hgt) { const c = document.createElement('canvas'); c.width = w; c.height = hgt; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return { c, g: c.getContext('2d'), t }; }

function noiseFill(g, w, hgt, base, amp, seed, n = 9000, size = [2, 6]) {
  g.fillStyle = base; g.fillRect(0, 0, w, hgt);
  const r = mulberry32(seed);
  for (let i = 0; i < n; i++) { const v = (r() - 0.5) * amp; g.fillStyle = v > 0 ? `rgba(255,255,255,${v / 255})` : `rgba(0,0,0,${-v / 255})`; g.fillRect(r() * w, r() * hgt, size[0] + r() * size[1], size[0] + r() * size[1]); }
}

// ====================================================================== the simulator
export function initSims() {
  const slots = $$('.sim[data-soil]'); if (!slots.length) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { renderer = null; }
  // build DOM for every slot
  const S = {};
  let world = null, active = null;
  slots.forEach(el => {
    const soil = el.dataset.soil, M = MODELS[soil];
    el.setAttribute('data-ch', M.ch);
    const stage = h('div', { class: 'sim-stage' }, h('div', { class: 'ph' }, renderer ? 'A 3D nézet akkor töltődik be, amikor ide görgetsz.' : 'Ez a böngésző nem támogatja a WebGL-t, ezért a 3D nézet nem jeleníthető meg. A számított értékek jobb oldalt ekkor is működnek.'));
    const hud = h('div', { class: 'sim-hud' }, h('span', { class: 'chip' }, M.name), h('span', { class: 'chip' }, 'mozgás ×' + M.ex + ' nagyítva'), h('span', { class: 'chip mid', 'data-hint': '1' }, { clay: 'Tipp: húzd az évszakot tavaszig, majd vissza', loess: 'Tipp: növeld az átázott zónát!', fill: 'Tipp: told a gödör szélét a ház alá', peat: 'Tipp: szélesítsd az alapot, süllyeszd a talajvizet' }[soil]));
    const legend = h('div', { class: 'sim-legend' }, 'Forgatás: húzás · Nagyítás: görgő / csípés');
    const resetBtn = h('button', { class: 'btn small sim-reset', type: 'button' }, 'Nézet');
    stage.append(hud, legend, resetBtn);
    const side = h('div', { class: 'sim-side' });
    const ctrls = h('div', { class: 'ctl' });
    const params = {};
    M.controls.forEach(([k, type, label, min, max, step, val, f]) => {
      const id = `sim_${soil}_${k}`;
      if (type === 'range') {
        const wrap = h('div', { class: 'slider' }, h('label', { for: id }, label, h('output', { id: id + 'o' })), h('input', { type: 'range', id, min, max, step, value: val }));
        ctrls.append(wrap); params[k] = val;
      } else if (type === 'toggle') {
        const cb = h('input', { type: 'checkbox', id }); ctrls.append(h('label', { class: 'toggle', for: id }, cb, label)); params[k] = false;
        cb.addEventListener('change', () => { params[k] = cb.checked; update(soil); });
      } else if (type === 'seg') {
        const segEl = h('div', { class: 'seg' }); ctrls.append(h('div', { class: 'small', style: 'font-weight:700' }, label), segEl);
        params[k] = val;
        const opts = f; const btns = opts.map(([kk, l]) => { const b = h('button', { type: 'button', 'aria-pressed': kk === val ? 'true' : 'false' }, l); b.addEventListener('click', () => { btns.forEach(x => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); params[k] = kk; update(soil); }); segEl.append(b); return b; });
      }
    });
    const ro = h('div', { class: 'readout' });
    const vd = h('div', {});
    const extra = h('div', {});
    side.append(h('h5', {}, 'Beállítások'), ctrls, h('h5', {}, 'Eredmény'), ro, extra, vd);
    let resetColl = null;
    if (soil === 'loess') { resetColl = h('button', { class: 'btn small', type: 'button' }, 'Új ház (visszaállítás)'); side.append(resetColl); }
    const top = h('div', { class: 'sim-top' }, h('h4', {}, h('span', { class: 'badge3d' }, '3D'), 'Talajlabor: ' + M.name), h('span', { class: 'small muted' }, 'Szemléltető modell, tájékoztató értékekkel'));
    el.append(top, h('div', { class: 'sim-grid' }, stage, side));
    S[soil] = { el, stage, side, ro, vd, extra, params, M, res: null, maxColl: { L: 0, R: 0 }, resetBtn };
    const hint = hud.querySelector('[data-hint]');
    const hideHint = () => { if (!hint || hint.dataset.gone) return; hint.dataset.gone = '1'; setTimeout(() => { hint.style.transition = 'opacity .6s, transform .6s'; hint.style.opacity = '0'; hint.style.transform = 'translateY(-6px)'; setTimeout(() => hint.remove(), 650); }, 2500); };
    side.addEventListener('input', hideHint); side.addEventListener('change', hideHint); ctrls.addEventListener('click', (e) => { if (e.target.closest('button')) hideHint(); });
    M.controls.forEach(([k, type, label, min, max, step, val, f]) => { if (type === 'range') bindRange(`sim_${soil}_${k}`, (v) => { S[soil].params[k] = v; update(soil); }, f); });
    if (resetColl) resetColl.addEventListener('click', () => { S[soil].maxColl = { L: 0, R: 0 }; S[soil].params.water = 0; const w = document.getElementById('sim_loess_water'); if (w) { w.value = 0; w.dispatchEvent(new Event('input')); } update(soil); });
  });

  function readouts(soil) {
    const st = S[soil], r = st.res, p = st.params;
    const ro = st.ro; ro.innerHTML = '';
    const add = (lab, val) => ro.append(h('div', { class: 'ro' }, h('span', {}, lab), h('b', {}, val)));
    const mm = (v) => (v < 0 ? '+' + fmt(-v, 0) : fmt(v, 0)) + ' mm';
    add('Bal sarok', (r.sL < 0 ? '↑ ' : '↓ ') + mm(r.sL).replace('+', ''));
    add('Jobb sarok', (r.sR < 0 ? '↑ ' : '↓ ') + mm(r.sR).replace('+', ''));
    const beta = Math.abs(r.sR - r.sL) / (HL * 1000);
    add('Szögtorzulás', beta < 1e-5 ? '≈ 0' : '1/' + fmt(1 / beta, 0));
    const sev = beta > 1 / 300 ? ['no', 'súlyos repedések'] : beta > 1 / 500 ? ['mid', 'látható repedések'] : beta > 1 / 1000 ? ['mid', 'hajszálrepedések'] : ['ok', 'nincs repedés'];
    ro.append(h('div', { class: 'ro' }, h('span', {}, 'Várható kár'), h('b', { style: 'font-size:15px;font-family:var(--f-body);font-weight:700;color:' + (sev[0] === 'ok' ? 'var(--good)' : sev[0] === 'mid' ? 'var(--warn)' : 'var(--bad)') }, sev[1])));
    st.extra.innerHTML = '';
    if (soil === 'loess') st.extra.append(h('div', { class: 'venn3' }, ...['roskadékony talaj', 'terhelés', 'víz az alap alatt'].map((t, i) => h('span', { class: 'chip ' + (r.cond[i] ? 'no' : 'ok') }, (r.cond[i] ? '● ' : '○ ') + t))));
    if (soil === 'peat') st.extra.append(h('div', { class: 'small muted' }, `Bal oldal: konszolidáció ${fmt(r.L.cons / 10, 1)} cm · talajvíz ${fmt(r.L.gw / 10, 1)} cm · másodlagos (50 év) ${fmt(r.L.sec / 10, 1)} cm`));
    if (soil === 'fill') st.extra.append(h('div', { class: 'small muted' }, `Feltöltés az alapok alatt: bal ${fmt(r.HfL, 1)} m, jobb ${fmt(r.HfR, 1)} m · E ≈ ${fmt(r.E / 1000, 1)} MPa`));
    if (soil === 'clay') st.extra.append(h('div', { class: 'small muted' }, `Talpfeszültség ≈ ${r.q} kPa (duzzadási nyomás ~150 kPa) · kiszáradó zóna a fa felőli oldalon: ${fmt(r.zt, 1)} m`));
    st.vd.innerHTML = '';
    st.M.verdict(r, p).forEach(([c, t]) => st.vd.append(h('div', { class: 'verdict ' + c, style: 'margin-top:8px' }, h('span', {}, c === 'ok' ? '✓' : c === 'mid' ? '!' : '✕'), h('div', { style: 'font-weight:600' }, t))));
    st.sev = beta;
  }

  function update(soil) {
    const st = S[soil]; let r = st.M.compute(st.params);
    if (soil === 'loess') { st.maxColl.L = Math.max(st.maxColl.L, r.sL); st.maxColl.R = Math.max(st.maxColl.R, r.sR); r = { ...r, sL: st.maxColl.L, sR: st.maxColl.R }; }
    st.res = r; readouts(soil);
    if (active === soil && world) world.setDirty();
  }

  // ------------------------------------------------------------------ 3D world (lazy)
  function ensureWorld() { if (!world && renderer) world = buildWorld(renderer, S); return world; }

  // activation by visibility
  const vis = new Map();
  const io = new IntersectionObserver((es) => {
    es.forEach(e => vis.set(e.target.dataset.soil, e.intersectionRatio));
    let best = null, bv = 0.12; for (const [k, v] of vis) if (v > bv) { bv = v; best = k; }
    if (best && best !== active) activate(best);
    if (world) world.setRunning([...vis.values()].some(v => v > 0.02));
  }, { threshold: [0, 0.02, 0.12, 0.25, 0.5, 0.75, 1] });
  slots.forEach(el => io.observe(el));
  function activate(soil) {
    if (!renderer) return;
    const w = ensureWorld(); active = soil;
    const st = S[soil];
    st.stage.querySelector('.ph') && (st.stage.querySelector('.ph').style.display = 'none');
    Object.values(S).forEach(o => { const ph = o.stage.querySelector('.ph'); if (o !== st && ph) ph.style.display = ''; });
    st.stage.prepend(renderer.domElement);
    w.setPreset(soil);
    st.resetBtn.onclick = () => w.resetView();
  }
  Object.keys(S).forEach(update);
}

// ====================================================================== world builder
function buildWorld(renderer, S) {
  let preset = 'clay', running = false, dirty = 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 16 / 10, 0.1, 500);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = 0.08; controls.enablePan = false;
  controls.minDistance = 20; controls.maxDistance = 80; controls.maxPolarAngle = 1.5; controls.minPolarAngle = 0.15;
  const HOME = { pos: new THREE.Vector3(15.5, 9.5, 29), tgt: new THREE.Vector3(-1.5, -2.4, 0) };
  function resetView() { camera.position.copy(HOME.pos); controls.target.copy(HOME.tgt); controls.update(); dirty = 2; }
  resetView();

  scene.add(new THREE.HemisphereLight(0xe6f1ff, 0x5a4a3a, 1.1));
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.6); sun.position.set(14, 30, 22); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 24, bottom: -24, near: 1, far: 90 }); sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xbfd8ff, 0.6); fill.position.set(-20, 8, 30); scene.add(fill);

  // soft ground shadow under the floating block
  { const t = canvasTex(256, 256); const gr = t.g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, 'rgba(0,0,0,0.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); t.g.fillStyle = gr; t.g.fillRect(0, 0, 256, 256); t.t.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(52, 26), new THREE.MeshBasicMaterial({ map: t.t, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = -BD - 0.6; scene.add(m); }

  // ---------------- soil block with canvas faces
  const front = canvasTex(CW, CH), sideR = canvasTex(BZ * 2 * PXM, CH), sideL = canvasTex(BZ * 2 * PXM, CH), topT = canvasTex(1024, 410);
  const darkM = new THREE.MeshStandardMaterial({ color: 0x3a2e24, roughness: 1 });
  const frontM = new THREE.MeshStandardMaterial({ map: front.t, roughness: 0.92 });
  const sideRM = new THREE.MeshStandardMaterial({ map: sideR.t, roughness: 0.95 });
  const sideLM = new THREE.MeshStandardMaterial({ map: sideL.t, roughness: 0.95 });
  const topM = new THREE.MeshStandardMaterial({ map: topT.t, roughness: 0.95 });
  const block = new THREE.Mesh(new THREE.BoxGeometry(BX * 2, BD, BZ * 2), [sideRM, sideLM, topM, darkM, frontM, darkM]);
  block.position.y = -BD / 2; block.receiveShadow = true; scene.add(block);
  // edge highlight
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(block.geometry), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 })); edges.position.copy(block.position); scene.add(edges);

  // ---------------- house
  const pivot = new THREE.Group(); pivot.position.x = (HX0 + HX1) / 2; scene.add(pivot);
  const house = new THREE.Group(); house.position.x = -(HX0 + HX1) / 2; pivot.add(house);
  const wallT = canvasTex(800, 300), sideWallT = canvasTex(800, 300);
  function paintWall(t, cracks, seed, window2) {
    const g = t.g, w = t.c.width, hh = t.c.height;
    noiseFill(g, w, hh, '#e6dcc4', 18, seed, 6000, [1, 3]);
    g.fillStyle = '#9a8f7c'; g.fillRect(0, hh - 40, w, 40); // plinth
    if (cracks > 0.01) {
      const r = mulberry32(seed + 7);
      g.strokeStyle = `rgba(40,30,20,${Math.min(1, 0.4 + cracks)})`; g.lineCap = 'round';
      const paths = [[0.04, 0.05, 1], [0.96, 0.05, -1], [0.33, 0.55, 1], [0.66, 0.55, -1]];
      paths.forEach(([sx, sy, dir], i) => {
        if (cracks < [0.0, 0.0, 0.35, 0.35][i] + 0.02) return;
        let x = sx * w, y = sy * hh; g.lineWidth = 1 + cracks * 5; g.beginPath(); g.moveTo(x, y);
        const steps = 6 + Math.floor(cracks * 6);
        for (let k = 0; k < steps; k++) { x += dir * (8 + r() * 16); y += 12 + r() * 14; g.lineTo(x, y); }
        g.stroke();
      });
    }
    t.t.needsUpdate = true;
  }
  paintWall(wallT, 0, 3); paintWall(sideWallT, 0, 9);
  const wallFront = new THREE.MeshStandardMaterial({ map: wallT.t, roughness: 0.9 });
  const wallSide = new THREE.MeshStandardMaterial({ map: sideWallT.t, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(HL, 3, HZ1 - HZ0), [wallSide, wallSide, wallSide, wallSide, wallFront, wallSide]);
  body.position.set((HX0 + HX1) / 2, 1.5, (HZ0 + HZ1) / 2); body.castShadow = true; body.receiveShadow = true; house.add(body);
  const roofG = new THREE.ConeGeometry((HL / 2 + 0.6) * Math.SQRT2, 3.2, 4, 1); roofG.rotateY(Math.PI / 4);
  const roof = new THREE.Mesh(roofG, new THREE.MeshStandardMaterial({ color: 0x9a4a32, roughness: 0.75, flatShading: true }));
  roof.position.set((HX0 + HX1) / 2, 3 + 1.6, (HZ0 + HZ1) / 2); roof.castShadow = true; house.add(roof);
  const chim = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.8, 0.6), new THREE.MeshStandardMaterial({ color: 0x8a5a44, roughness: 0.9 })); chim.position.set(HX0 + 2, 4.6, 0.5); chim.castShadow = true; house.add(chim);
  const winM = new THREE.MeshStandardMaterial({ color: 0x2b3a46, roughness: 0.15, metalness: 0.4 });
  const frameM = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.6 });
  [[HX0 + 1.6, 1.7], [HX1 - 1.6, 1.7]].forEach(([x, y]) => { const f = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.3, 0.08), frameM); f.position.set(x, y, HZ1 + 0.02); const w = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.1, 0.1), winM); w.position.set(x, y, HZ1 + 0.03); house.add(f, w); });
  { const d = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.1, 0.1), new THREE.MeshStandardMaterial({ color: 0x6b3f28, roughness: 0.7 })); d.position.set((HX0 + HX1) / 2, 1.05, HZ1 + 0.03); house.add(d); }
  [[HX1 + 0.02, 1.7, 0.5], [HX1 + 0.02, 1.7, 3.5]].forEach(([x, y, z]) => { const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 1.3), winM); w.position.set(x, y, z); house.add(w); });
  house.traverse(o => { if (o.isMesh) o.castShadow = true; });

  // ---------------- tree (poplar)
  const tree = new THREE.Group(); scene.add(tree);
  { const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 7, 10), new THREE.MeshStandardMaterial({ color: 0x5a4433, roughness: 0.9 })); trunk.position.y = 3.5; trunk.castShadow = true; tree.add(trunk);
    const leaf = new THREE.MeshStandardMaterial({ color: 0x4f7a2c, roughness: 0.85, flatShading: true });
    const r = mulberry32(4);
    for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + r() * 0.5, 1), leaf); m.position.set((r() - 0.5) * 1.2, 4.2 + i * 0.85, (r() - 0.5) * 1.2); m.scale.set(1, 1.5, 1); m.castShadow = true; tree.add(m); } }
  tree.position.z = 1.0;

  // ---------------- puddle (loess) and gas (fill)
  const puddle = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshStandardMaterial({ color: 0x3e6f8f, roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.8 }));
  puddle.rotation.x = -Math.PI / 2; puddle.position.set(-8.6, 0.02, 3.6); scene.add(puddle);
  const dustN = 120; const dustG = new THREE.BufferGeometry(); const dustP = new Float32Array(dustN * 3); dustG.setAttribute('position', new THREE.BufferAttribute(dustP, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ color: 0xd9c49a, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false })); dust.frustumCulled = false; scene.add(dust);
  const dustSeed = mulberry32(2); const dustV = Array.from({ length: dustN }, () => [dustSeed() * 6.28, dustSeed(), dustSeed()]);
  let dustAge = 99;

  // ---------------- state
  const disp = { yL: 0, yR: 0 };
  let lastSec = '';

  function setPreset(p) { preset = p; dirty = 2; lastSec = ''; resize(); if (!running) frame(); }
  function setDirty() { dirty = 2; }

  // ---------------- section drawing
  const X = (x) => (x + BX) * PXM, Y = (d) => d * PXM;
  function drawSection(g, w, hgt, soil, p, r, sideView) {
    const rr = mulberry32(11);
    g.clearRect(0, 0, w, hgt);
    const layerBand = (d0, d1, base, amp, seed) => { g.save(); g.beginPath(); g.rect(0, Y(d0), w, Y(d1) - Y(d0)); g.clip(); noiseFill(g, w, hgt, base, amp, seed, 5000, [2, 5]); g.restore(); };
    const label = (txt, x, y, col = '#fff', size = 22) => { size = Math.round(size * 1.45); g.font = `800 ${size}px Archivo, Arial, sans-serif`; g.lineWidth = 4; g.strokeStyle = 'rgba(0,0,0,0.45)'; g.strokeText(txt, x, y); g.fillStyle = col; g.fillText(txt, x, y); };
    const yL = disp.yL, yR = disp.yR; // metres, positive = down (visual, exaggerated)
    const footing = (xc, D, B, dy) => {
      g.fillStyle = '#c9c6bf'; g.strokeStyle = '#2a2a2a'; g.lineWidth = 2;
      const x0 = X(xc - B / 2), x1 = X(xc + B / 2);
      g.fillRect(x0, Y(dy), x1 - x0, Y(D)); g.strokeRect(x0, Y(dy), x1 - x0, Y(D));
    };
    if (soil === 'clay') {
      layerBand(0, 0.3, '#3d2f22', 40, 1); layerBand(0.3, BD, '#8c6a4c', 34, 2);
      const za = 2.25; const s = r.s;
      // moisture of the active zone
      g.fillStyle = s > 0 ? `rgba(40,60,90,${0.25 * s})` : `rgba(255,230,180,${0.25 * -s})`; g.fillRect(0, Y(0.3), w, Y(za) - Y(0.3));
      // tree desiccation zone
      if (r.treeOn && !sideView) { const tx = X(XR + 0.25 + p.tree); const grd = g.createRadialGradient(tx, Y(0.5), 10, tx, Y(0.5), Y(r.zt) + 60); grd.addColorStop(0, 'rgba(255,225,170,0.55)'); grd.addColorStop(1, 'rgba(255,225,170,0)'); g.fillStyle = grd; g.fillRect(0, 0, w, hgt);
        g.strokeStyle = 'rgba(70,45,25,0.85)'; g.lineWidth = 2.2; for (let k = 0; k < 14; k++) { const a = -1.2 + k / 13 * 2.4; g.beginPath(); g.moveTo(tx, Y(0.3)); let x = tx, y = Y(0.3); const L = (r.zt + 0.6) * PXM; for (let j = 0; j < 8; j++) { x += Math.sin(a) * L / 8 * 1.6 + (rr() - 0.5) * 10; y += Math.cos(a) * L / 8 * 0.9 + rr() * 4; g.lineTo(x, y); } g.stroke(); } }
      // desiccation cracks
      if (s < 0) { g.strokeStyle = '#2b1d12'; for (let k = 0; k < 46; k++) { const x = rr() * w; const dep = (0.4 + rr() * 1.2) * -s * PXM; g.lineWidth = 1 + rr() * 2.5 * -s; g.beginPath(); g.moveTo(x, Y(0.3)); g.lineTo(x + (rr() - 0.5) * 8, Y(0.3) + dep); g.stroke(); } }
      g.setLineDash([14, 10]); g.strokeStyle = '#ffd08a'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, Y(za)); g.lineTo(w, Y(za)); g.stroke(); g.setLineDash([]);
      label('meteorológiai határmélység ≈ 2–2,5 m', 14, Y(za) - 10, '#ffd08a', 20);
      label('kövér agyag', 14, Y(4.6), '#fff', 26);
      g.strokeStyle = '#5cc2f2'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, Y(7.2)); g.lineTo(w, Y(7.2)); g.stroke(); label('talajvíz mélyen', 14, Y(7.2) - 8, '#9fdcff', 18);
      if (!sideView) { footing(XL, p.D, 0.6, yL); footing(XR, p.D, 0.6, yR); }
    } else if (soil === 'loess') {
      layerBand(0, 0.3, '#3d2f22', 40, 1); layerBand(0.3, BD, '#c9a862', 30, 3);
      g.strokeStyle = 'rgba(110,80,30,0.35)'; g.lineWidth = 1.5; for (let k = 0; k < 400; k++) { const x = rr() * w, y = Y(0.3) + rr() * (hgt - Y(0.3)); g.beginPath(); g.moveTo(x, y); g.lineTo(x + (rr() - 0.5) * 2, y + 6 + rr() * 8); g.stroke(); }
      if (!sideView && r.W > 0) { const cx = X(r.cx), cy = Y(r.cd); const grd = g.createRadialGradient(cx, cy, 5, cx, cy, r.r * PXM); grd.addColorStop(0, 'rgba(40,110,170,0.75)'); grd.addColorStop(0.85, 'rgba(60,140,200,0.45)'); grd.addColorStop(1, 'rgba(60,140,200,0)'); g.fillStyle = grd; g.beginPath(); g.arc(cx, cy, r.r * PXM, 0, 7); g.fill();
        g.strokeStyle = 'rgba(160,220,255,0.9)'; g.setLineDash([8, 6]); g.lineWidth = 2.5; g.beginPath(); g.arc(cx, cy, r.r * PXM * 0.97, 0, 7); g.stroke(); g.setLineDash([]); label('átázott lösz', cx - 60, cy + r.r * PXM * 0.6, '#d8f1ff', 20); }
      if (!sideView) {
        g.fillStyle = '#7d8790'; g.fillRect(0, Y(1.2), X(-8.4), 0.22 * PXM); label('vízvezeték', 10, Y(1.2) - 8, '#fff', 18);
        if (!p.pipe && p.water > 0) { g.fillStyle = '#5cc2f2'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(X(-8.5) + (rr() - 0.5) * 30, Y(1.4) + rr() * 30, 4, 0, 7); g.fill(); } label('csőtörés', X(-8.4) - 30, Y(1.2) + 46, '#9fdcff', 18); }
        if (p.pipe) { g.strokeStyle = '#62d394'; g.lineWidth = 3; g.strokeRect(0, Y(1.2) - 6, X(-8.4), 0.22 * PXM + 12); label('védőcsőben', 10, Y(1.2) + 40, '#a6f0c4', 18); }
        // collapsed zones under footings
        [[XL, r.sL], [XR, r.sR]].forEach(([xc, sv]) => { if (sv > 5) { g.fillStyle = `rgba(80,55,20,${Math.min(0.6, sv / 200)})`; g.fillRect(X(xc - 1.2), Y(1.0), 2.4 * PXM, Y(4.5)); g.strokeStyle = '#ff8a6a'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { const x = X(xc - 0.8 + k * 0.8); g.beginPath(); g.moveTo(x, Y(1.6)); g.lineTo(x, Y(3.2)); g.lineTo(x - 8, Y(3.0)); g.moveTo(x, Y(3.2)); g.lineTo(x + 8, Y(3.0)); g.stroke(); } } });
        footing(XL, 1.0, 0.6, yL); footing(XR, 1.0, 0.6, yR);
      }
      label('lösz (makropórusos)', 14, Y(5.6), '#fff', 26);
    } else if (soil === 'fill') {
      layerBand(0, 0.3, '#3d2f22', 40, 1); layerBand(0.3, BD, '#8a7458', 30, 4);
      const depth = (x) => clamp((p.edge - x) * 1.0, 0, p.Hmax);
      // fill polygon
      g.save(); g.beginPath(); g.moveTo(0, Y(0.3)); for (let x = -BX; x <= BX; x += 0.1) g.lineTo(X(x), Y(Math.max(0.3, depth(x)))); g.lineTo(w, Y(0.3)); g.closePath(); g.clip();
      const base = { rubble: '#7e6a5a', slag: '#3b3936', waste: '#3f3326' }[p.mat];
      noiseFill(g, w, hgt, base, 40, 6, 4000, [2, 5]);
      const cols = { rubble: ['#b35a3a', '#a8a59e', '#d0ccc4', '#6a5a4a'], slag: ['#1d1c1b', '#6d6a66', '#9d9a96', '#b35a3a'], waste: ['#2a6fd0', '#d8402a', '#e8c83a', '#f0f0f0', '#3f8f5a', '#111'] }[p.mat];
      for (let k = 0; k < 900; k++) { const x = rr() * w, y = Y(0.3) + rr() * (hgt - Y(0.3)); g.fillStyle = cols[k % cols.length]; g.save(); g.translate(x, y); g.rotate(rr() * 3); g.fillRect(-4 - rr() * 8, -2 - rr() * 3, 8 + rr() * 14, 4 + rr() * 6); g.restore(); }
      if (p.wet) { g.fillStyle = 'rgba(60,140,200,0.35)'; g.fillRect(0, 0, w, hgt); }
      g.restore();
      g.strokeStyle = '#ffffff'; g.lineWidth = 2.5; g.setLineDash([10, 7]); g.beginPath(); for (let x = -BX; x <= BX; x += 0.1) { const d = depth(x); if (d > 0.3) g.lineTo(X(x), Y(d)); else g.moveTo(X(x), Y(0.3)); } g.stroke(); g.setLineDash([]);
      if (p.mat === 'waste' && !sideView) { g.fillStyle = 'rgba(200,255,120,0.8)'; for (let k = 0; k < 40; k++) { const x = rr() * X(p.edge); const dd = depth(-BX + x / PXM); g.beginPath(); g.arc(x, Y(0.3) + rr() * Y(Math.max(0.4, dd - 0.3)), 3 + rr() * 3, 0, 7); g.fill(); } label('metán', 20, Y(1.0), '#d8ff8a', 20); }
      label('feltöltés', 16, Y(Math.min(p.Hmax, 6) * 0.55 + 0.4), '#fff', 26);
      label('termett talaj', w - 210, Y(5.8), '#fff', 24);
      if (!sideView) { footing(XL, 1.0, 0.7, yL); footing(XR, 1.0, 0.7, yR);
        [[XL, r.HfL], [XR, r.HfR]].forEach(([xc, hf]) => { if (hf > 1.05) { g.strokeStyle = '#ffd36a'; g.lineWidth = 3; g.beginPath(); g.moveTo(X(xc + 0.7), Y(1.0)); g.lineTo(X(xc + 0.7), Y(hf)); g.stroke(); label(fmt(hf, 1) + ' m', X(xc + 0.85), Y((1 + hf) / 2) + 8, '#ffd36a', 20); } }); }
    } else if (soil === 'peat') {
      const hpAt = (x) => lerp(p.hp, r.hpR, smooth((x - XL) / (XR - XL)));
      layerBand(0, BD, '#8c8473', 26, 8);
      // sand cover
      layerBand(0.3, p.hc, '#c4a470', 30, 5);
      // peat lens
      g.save(); g.beginPath(); g.moveTo(0, Y(p.hc)); for (let x = -BX; x <= BX; x += 0.2) g.lineTo(X(x), Y(p.hc + hpAt(clamp(x, XL - 4, XR + 4)))); g.lineTo(w, Y(p.hc)); g.closePath(); g.clip();
      noiseFill(g, w, hgt, '#2e241a', 30, 9, 3000, [2, 4]);
      g.strokeStyle = 'rgba(190,160,110,0.5)'; g.lineWidth = 1.4; for (let k = 0; k < 600; k++) { const x = rr() * w, y = rr() * hgt; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y - 2 + rr() * 4, x + 12 + rr() * 10, y + (rr() - 0.5) * 3); g.stroke(); }
      // dried peat above lowered GW
      const gwN = 1.2 + p.gw; if (gwN > p.hc) { g.fillStyle = 'rgba(160,135,105,0.55)'; g.fillRect(0, Y(p.hc), w, Y(gwN) - Y(p.hc)); g.strokeStyle = '#1a120b'; g.lineWidth = 2; for (let k = 0; k < 40; k++) { const x = rr() * w; g.beginPath(); g.moveTo(x, Y(p.hc)); g.lineTo(x + 3, Y(gwN)); g.stroke(); } }
      g.restore();
      layerBand(0, 0.3, '#3d2f22', 40, 1);
      // stress isobars under both footings
      if (!sideView) {
        const img = g.getImageData(0, 0, w, hgt); const d = img.data; const b = p.B / 2; const D = 0.9;
        for (let py = Math.floor(Y(D)); py < hgt; py += 1) { const z = py / PXM - D - (yL + yR) / 2; if (z <= 0.01) continue;
          for (let px = Math.floor(X(XL - 4)); px < X(XR + 4); px++) { const x = px / PXM - BX; const v = stripS(x - XL, z, b) + stripS(x - XR, z, b);
            if (v < 0.1) continue; const i = (py * w + px) * 4; const c = v > 0.6 ? [255, 64, 38] : v > 0.4 ? [255, 140, 51] : v > 0.2 ? [255, 217, 77] : [77, 230, 204]; const a = Math.abs(v - 0.2) < 0.008 ? 1 : 0.38;
            const cc = Math.abs(v - 0.2) < 0.008 ? [255, 255, 255] : c; d[i] = lerp(d[i], cc[0], a); d[i + 1] = lerp(d[i + 1], cc[1], a); d[i + 2] = lerp(d[i + 2], cc[2], a); } }
        g.putImageData(img, 0, 0);
      }
      g.strokeStyle = '#5cc2f2'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, Y(gwN)); g.lineTo(w, Y(gwN)); g.stroke(); label(p.gw > 0 ? 'süllyedő talajvíz' : 'talajvíz', w - 230, Y(gwN) - 8, '#9fdcff', 18);
      label('homok fedőréteg', 14, Y((0.3 + p.hc) / 2) + 9, '#fff', Math.min(22, 10 + p.hc * 8));
      label('tőzeg', 14, Y(p.hc + Math.max(0.5, hpAt(-BX)) / 2) + 9, '#cfe9df', 24);
      label('teherbíró réteg', 14, Y(Math.min(BD - 0.3, p.hc + p.hp + 0.9)), '#fff', 22);
      if (!sideView) { footing(XL, 0.9, p.B, yL); footing(XR, 0.9, p.B, yR); }
    }
  }
  function drawSide(g, w, hgt, soil, p, r, isLeft) {
    const Yd = (d) => d * PXM;
    const band = (d0, d1, base, amp, seed) => { g.save(); g.beginPath(); g.rect(0, Yd(d0), w, Yd(d1) - Yd(d0)); g.clip(); noiseFill(g, w, hgt, base, amp, seed, 2500, [2, 5]); g.restore(); };
    g.clearRect(0, 0, w, hgt);
    if (soil === 'clay') { band(0, 0.3, '#3d2f22', 40, 1); band(0.3, BD, '#8c6a4c', 34, 2); }
    else if (soil === 'loess') { band(0, 0.3, '#3d2f22', 40, 1); band(0.3, BD, '#c9a862', 30, 3); }
    else if (soil === 'fill') { band(0, BD, '#8a7458', 30, 4); const hf = isLeft ? clamp((p.edge + BX), 0, p.Hmax) : clamp(p.edge - BX, 0, p.Hmax); if (hf > 0.3) band(0.3, hf, { rubble: '#7e6a5a', slag: '#3b3936', waste: '#3f3326' }[p.mat], 50, 6); band(0, 0.3, '#3d2f22', 40, 1); }
    else if (soil === 'peat') { band(0, BD, '#8c8473', 26, 8); band(0.3, p.hc, '#c4a470', 30, 5); band(p.hc, p.hc + (isLeft ? p.hp : r.hpR), '#2e241a', 30, 9); band(0, 0.3, '#3d2f22', 40, 1); }
  }
  function drawTop(soil, p, r) {
    const g = topT.g, w = topT.c.width, hh = topT.c.height;
    let grass = '#6f8f3e';
    if (soil === 'clay' && r.s < 0) grass = '#a39a5a';
    if (soil === 'peat') grass = '#5e7a3a';
    noiseFill(g, w, hh, grass, 50, 21, 14000, [2, 4]);
    if (soil === 'clay' && r.s < -0.2) { const rr = mulberry32(5); g.strokeStyle = `rgba(60,40,20,${-r.s * 0.7})`; g.lineWidth = 1.5; for (let k = 0; k < 140; k++) { let x = rr() * w, y = rr() * hh; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 4; j++) { x += (rr() - 0.5) * 40; y += (rr() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); } }
    // path to the door
    g.fillStyle = 'rgba(170,165,150,0.9)'; g.fillRect(((HX0 + HX1) / 2 + BX) / (2 * BX) * w - 18, (HZ1 + BZ) / (2 * BZ) * hh, 36, hh);
    topT.t.needsUpdate = true;
  }

  // ---------------- per-frame
  const clock = new THREE.Clock();
  function updateScene(dt) {
    const st = S[preset]; const r = st.res, p = st.params; const M = st.M;
    // displacement targets (m, visual)
    const tL = r.sL / 1000 * M.ex, tR = r.sR / 1000 * M.ex;
    const k = preset === 'loess' ? 0.18 : 0.08;
    const ddL = tL - disp.yL, ddR = tR - disp.yR;
    if (preset === 'loess' && (ddL > 0.25 || ddR > 0.25) && dustAge > 1.5) dustAge = 0;
    disp.yL += ddL * k; disp.yR += ddR * k;
    const moving = Math.abs(ddL) + Math.abs(ddR) > 0.002;
    // house transform: tilt about the footprint
    const mid = (disp.yL + disp.yR) / 2; const tilt = Math.atan2(disp.yR - disp.yL, XR - XL);
    pivot.position.y = -mid; pivot.rotation.z = -tilt;
    // tree
    tree.visible = preset === 'clay' && p.tree < 13; if (tree.visible) { tree.position.x = XR + 0.25 + p.tree; tree.rotation.z = Math.sin(performance.now() * 0.0008) * 0.01; }
    puddle.visible = preset === 'loess' && p.water > 0 && !p.pipe; if (puddle.visible) puddle.scale.setScalar(0.4 + 2.4 * p.water / 100);
    // dust
    if (dustAge < 2.5) { dustAge += dt; dust.visible = true; for (let i = 0; i < dustN; i++) { const [a, r1, r2] = dustV[i]; const kk = 1 - Math.exp(-dustAge * (1.5 + r2)); dustP[i * 3] = XL + Math.cos(a) * (1 + 4 * r1) * kk; dustP[i * 3 + 1] = 0.2 + 2.5 * r2 * kk; dustP[i * 3 + 2] = 4 + Math.sin(a) * 2 * kk; } dustG.attributes.position.needsUpdate = true; dust.material.opacity = 0.7 * (1 - dustAge / 2.5); } else dust.visible = false;
    // textures: redraw section when needed
    const key = preset + JSON.stringify(p) + fmt(disp.yL, 2) + fmt(disp.yR, 2);
    if (key !== lastSec && (moving || dirty)) {
      drawSection(front.g, CW, CH, preset, p, r, false); front.t.needsUpdate = true;
      drawSide(sideR.g, sideR.c.width, CH, preset, p, r, false); sideR.t.needsUpdate = true;
      drawSide(sideL.g, sideL.c.width, CH, preset, p, r, true); sideL.t.needsUpdate = true;
      if (!moving || dirty) drawTop(preset, p, r);
      lastSec = key;
    }
    // cracks on the house walls
    const sev = clamp((st.sev || 0) * 400);
    const ck = Math.round(sev * 12) / 12;
    if (ck !== wallT.lastCk) { paintWall(wallT, ck, 3); paintWall(sideWallT, ck * 0.8, 9); wallT.lastCk = ck; }
    return moving || dustAge < 2.5 || preset === 'clay';
  }
  function frame() {
    const dt = Math.min(0.05, clock.getDelta());
    const animating = updateScene(dt);
    controls.update();
    renderer.render(scene, camera);
    if (dirty > 0) dirty--;
    return animating;
  }
  let raf = 0;
  function loop() { raf = 0; if (!running) return; frame(); raf = requestAnimationFrame(loop); }
  function setRunning(on) { if (on === running) return; running = on; if (on && !raf) { clock.getDelta(); raf = requestAnimationFrame(loop); } }
  function resize() {
    const el = renderer.domElement.parentElement; if (!el) return;
    const w = el.clientWidth, hh = el.clientHeight; if (!w || !hh) return;
    renderer.setSize(w, hh, false); camera.aspect = w / hh;
    camera.fov = w / hh < 1.2 ? 46 : 34; camera.updateProjectionMatrix(); dirty = 2;
  }
  window.addEventListener('resize', resize);
  controls.addEventListener('change', () => { dirty = 2; });
  return { setPreset, setDirty, setRunning, resetView, resize };
}
