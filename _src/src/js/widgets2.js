import { clamp, lerp, smooth, $, $$, h, s, svgRoot, fmt, bindRange, segmented, onVisible, verdict, cssVar, onTheme, mulberry32, stripS } from './util.js';

// ------------------------------------------------------------------ fill history
export function history() {
  const box = $('#histBox'); if (!box) return;
  const W = 900, H = 380; const svg = svgRoot(W, H); box.append(svg);
  const steps = [
    ['1930', 'Agyagbányászat', 'A téglagyár kitermeli az agyagot: mély gödör marad vissza. Ilyen gödrök, kavics- és homokbányák, várárkok kerültek később feltöltésre.'],
    ['1945', 'Háborús törmelék', 'Budapesten a II. világháború után nagy mennyiségű törmeléket kellett elhelyezni: tégla, beton, habarcs, betonvas került a gödörbe.'],
    ['1960', 'Salak, hamu', 'Égési termékek: salakhányók, kazánhamu. Tömörségük és összetételük helyről helyre változik.'],
    ['1975', 'Házi szemét', 'Kommunális hulladék: műanyag, üveg, fém és sok szerves anyag, amely bomlik, gázt termel és tovább süllyed. A legveszélyesebb feltöltés.'],
    ['1990', 'Földtakarás', 'Vékony termőföld kerül a tetejére, füvesítik. A felszínen semmi sem látszik.'],
    ['2005', 'Új lakóház', 'Az új tulajdonos egy szép, rendezett telket lát. Az egyik alap 6 m feltöltésen, a másik termett talajon áll.'],
  ];
  let step = 0, shown = 0;
  const seg = $('#histSeg');
  const btns = steps.map(([y, t], i) => { const b = h('button', { type: 'button', 'aria-pressed': i === 0 ? 'true' : 'false' }, y + ' · ' + t); b.addEventListener('click', () => go(i)); seg.append(b); return b; });
  const lay = [ // [topDepth, bottomDepth, fill, label]
    null,
    [4.2, 6, '#8f5b45', 'törmelék'],
    [2.8, 4.2, '#3b3936', 'salak, hamu'],
    [0.6, 2.8, '#4a3a2a', 'házi szemét'],
    [0, 0.6, '#3a2b1e', 'termőföld'],
  ];
  const mpx = 40, gy = 112, px0 = 120, px1 = 720; // pit
  const pitX = (d) => [px0 + d * 1.0 * mpx, px1 - d * 1.0 * mpx];
  function render() {
    svg.innerHTML = '';
    svg.append(s('rect', { x: 0, y: gy, width: W, height: H - gy, fill: 'url(#hatch-clay)', opacity: 0.55 }));
    svg.append(s('rect', { x: 0, y: 0, width: W, height: gy, fill: 'var(--surface2)' }));
    // pit void
    const [a0, b0] = pitX(0), [a6, b6] = pitX(6);
    svg.append(s('path', { d: `M${a0} ${gy} L${a6} ${gy + 6 * mpx} L${b6} ${gy + 6 * mpx} L${b0} ${gy} Z`, fill: 'var(--surface)', stroke: 'var(--ink)', 'stroke-width': 2 }));
    const rnd = mulberry32(3);
    for (let i = 1; i <= Math.min(shown, 4); i++) {
      const [t, b, c, lbl] = lay[i];
      const [ta, tb] = pitX(t), [ba, bb] = pitX(b);
      const gEl = s('g', {});
      gEl.append(s('path', { d: `M${ta} ${gy + t * mpx} L${ba} ${gy + b * mpx} L${bb} ${gy + b * mpx} L${tb} ${gy + t * mpx} Z`, fill: c }));
      // debris
      const cols = i === 1 ? ['#b35a3a', '#a8a59e', '#d0ccc4'] : i === 2 ? ['#1d1c1b', '#6d6a66', '#9d9a96'] : i === 3 ? ['#2a6fd0', '#d8402a', '#e8c83a', '#f0f0f0', '#3f8f5a'] : ['#5b4532'];
      const n = i === 4 ? 0 : 70;
      for (let k = 0; k < n; k++) { const dd = t + rnd() * (b - t); const [xa, xb] = pitX(dd); const x = xa + 6 + rnd() * (xb - xa - 12); const y = gy + dd * mpx; gEl.append(s('rect', { x, y: y - 3, width: 4 + rnd() * 10, height: 3 + rnd() * 4, fill: cols[k % cols.length], transform: `rotate(${(rnd() - 0.5) * 70} ${x} ${y})` })); }
      svg.append(gEl);
      svg.append(s('text', { x: (ta + tb) / 2, y: gy + (t + b) / 2 * mpx + 5, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 800, fill: '#fff', 'font-family': 'Archivo, sans-serif', text: lbl }));
    }
    if (shown >= 4) svg.append(s('rect', { x: 0, y: gy - 4, width: W, height: 6, fill: '#5e7a3a' }));
    if (shown >= 5) {
      const hx0 = 470, hx1 = 690;
      svg.append(s('rect', { x: hx0, y: 50, width: hx1 - hx0, height: gy - 54, fill: 'var(--surface)', stroke: 'var(--ink)', 'stroke-width': 2 }));
      svg.append(s('path', { d: `M${hx0 - 14} 54 L${(hx0 + hx1) / 2} 12 L${hx1 + 14} 54 Z`, fill: '#8a3e2b' }));
      for (const x of [hx0, hx1]) svg.append(s('rect', { x: x - 10, y: gy - 4, width: 20, height: 0.9 * mpx, fill: '#bdbab3', stroke: 'var(--ink)' }));
      const dL = 6, xr = (px1 - hx1) / mpx; const dR = Math.max(0, Math.min(6, xr));
      svg.append(s('line', { x1: hx0, x2: hx0, y1: gy + 0.9 * mpx, y2: gy + 6 * mpx, stroke: 'var(--bad)', 'stroke-width': 3 }));
      svg.append(s('text', { x: hx0 - 10, y: gy + 4 * mpx, 'text-anchor': 'end', 'font-size': 15, 'font-weight': 800, fill: '#fff', text: '≈ 6 m feltöltés' }));
      svg.append(s('line', { x1: hx1, x2: hx1, y1: gy + 0.9 * mpx, y2: gy + dR * mpx, stroke: 'var(--bad)', 'stroke-width': 3 }));
      svg.append(s('text', { x: hx1 + 8, y: gy + 1.8 * mpx, 'font-size': 15, 'font-weight': 800, fill: 'var(--bad)', text: '≈ ' + fmt(dR, 1) + ' m' }));
    }
    svg.append(s('text', { x: 16, y: 40, 'text-anchor': 'start', 'font-size': 34, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: 'var(--acc)', text: steps[step][0] }));
    $('#histText').textContent = steps[step][2];
  }
  function go(i) { step = i; shown = i; btns.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false')); render(); }
  render();
  let played = false;
  onVisible(box, (v) => { if (v && !played) { played = true; let i = 0; const tm = setInterval(() => { i++; if (i > 5) { clearInterval(tm); return; } go(i); }, 1500); } }, 0.5);
}

// ------------------------------------------------------------------ fill danger sort game
export function sortGame() {
  const box = $('#sortGame'); if (!box) return;
  const cats = [['no', 'Nagyon veszélyes'], ['mid', 'Óvatosan, vizsgálni kell'], ['ok', 'Kedvezőbb']];
  const items = [
    ['Kommunális hulladéklerakó, 25 éve lezárva', 'no', 'A házi szemét (kommunális hulladék) a jegyzet szerint mindig nagyon veszélyes: bomlik, gázt termel, sokáig süllyed.'],
    ['Tömörítetlen építési törmelék, 5 éves', 'no', 'A 8–10 évnél frissebb, tömörítetlen feltöltés nagyon veszélyes, és roskadhat is.'],
    ['Meddőhányó anyaga, 15% szervesanyag-tartalommal', 'no', 'A 10%-nál nagyobb szerves tartalmú anyag bomlik, a süllyedése hosszú ideig tart.'],
    ['Salak és hamu, 40 éves, ismeretlen tömörség', 'mid', 'Égési termék: kora miatt kevésbé aktív, de tömörsége és összenyomhatósága tág határok között változhat.'],
    ['Kevert talaj és tégladarabok, 60 éves', 'mid', 'Régi, de ismeretlen összetételű és tömörségű: feltárással és vizsgálattal kell igazolni.'],
    ['Rétegesen, ellenőrzötten tömörített homokos kavics, 20 éves', 'ok', 'Szemcsés, ellenőrzötten tömörített feltöltés: a kedvezőbb eset, de vizsgálni ekkor is kell.'],
  ];
  let right = 0, done = 0;
  items.forEach(([t, ans, exp]) => {
    const fb = h('p', { class: 'small muted' });
    const opts = h('div', { class: 'det-opts' });
    const card = h('div', { class: 'sort-item' }, h('b', {}, t), opts, fb);
    const bs = cats.map(([k, l]) => { const b = h('button', { type: 'button' }, l); b.addEventListener('click', () => {
      if (card.dataset.done) return; card.dataset.done = '1'; done++;
      if (k === ans) { b.classList.add('right'); right++; } else { b.classList.add('wrong'); bs[cats.findIndex(c => c[0] === ans)].classList.add('right'); }
      fb.textContent = exp; score();
    }); opts.append(b); return b; });
    box.append(card);
  });
  function score() { const el = $('#sortScore'); el.innerHTML = ''; el.append(h('span', {}, `${right} / ${items.length} helyes`), h('div', { class: 'bar' }, h('i', { style: `width:${right / items.length * 100}%` }))); }
  score();
}

// ------------------------------------------------------------------ statistics
export function stats() {
  const b = $('#statBars'); if (!b) return;
  const W = 520, H = 230; const svg = svgRoot(W, H); b.append(svg);
  const rows = [['Padozatok', 70], ['Válaszfalak', 57], ['Szerkezeti elemek', 40]];
  let k = 0;
  function render() {
    svg.innerHTML = '';
    rows.forEach(([n, v], i) => {
      const y = 20 + i * 70;
      svg.append(s('text', { x: 0, y: y + 14, 'font-size': 16, 'font-weight': 700, fill: 'var(--ink)', 'font-family': 'Archivo, sans-serif', text: n }));
      svg.append(s('rect', { x: 0, y: y + 24, width: W - 70, height: 22, rx: 6, fill: 'var(--line)' }));
      svg.append(s('rect', { x: 0, y: y + 24, width: (W - 70) * v / 100 * smooth(k), height: 22, rx: 6, fill: i === 0 ? 'var(--bad)' : i === 1 ? 'var(--warn)' : 'var(--acc)' }));
      svg.append(s('text', { x: W - 4, y: y + 41, 'text-anchor': 'end', 'font-size': 20, 'font-weight': 500, fill: 'var(--ink)', 'font-family': 'IBM Plex Mono, monospace', text: Math.round(v * smooth(k)) + '%' }));
    });
  }
  render();
  const d = $('#waterDonut'); const W2 = 520, H2 = 230; const svg2 = svgRoot(W2, H2); d.append(svg2);
  function render2() {
    svg2.innerHTML = '';
    const cx = 110, cy = 115, r = 82, sw = 30; const C = 2 * Math.PI * r; const v = 0.87 * smooth(k);
    svg2.append(s('circle', { cx, cy, r, fill: 'none', stroke: 'var(--line)', 'stroke-width': sw }));
    svg2.append(s('circle', { cx, cy, r, fill: 'none', stroke: 'var(--water)', 'stroke-width': sw, 'stroke-dasharray': `${C * v} ${C}`, transform: `rotate(-90 ${cx} ${cy})`, 'stroke-linecap': 'butt' }));
    svg2.append(s('text', { x: cx, y: cy + 12, 'text-anchor': 'middle', 'font-size': 38, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: 'var(--ink)', text: Math.round(v * 100) + '%' }));
    ['csatornatörés', 'tetővíz', 'nyomócsőtörés', 'felszíni víz'].forEach((t, i) => {
      svg2.append(s('rect', { x: 240, y: 46 + i * 38, width: 14, height: 14, rx: 3, fill: 'var(--water)', opacity: 1 - i * 0.18 }));
      svg2.append(s('text', { x: 264, y: 58 + i * 38, 'font-size': 16, fill: 'var(--ink)', text: t }));
    });
  }
  render2();
  let played = false;
  onVisible(b, (v) => { if (v && !played) { played = true; const st = performance.now(); const step = (now) => { k = clamp((now - st) / 1400); render(); render2(); if (k < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); } }, 0.4);
}

// ------------------------------------------------------------------ methane gauge
export function gas() {
  const box = $('#gasGauge'); if (!box) return;
  const W = 620, H = 330; const svg = svgRoot(W, H); box.append(svg);
  const mix = $('#gasMix'); const svg2 = svgRoot(360, 90); mix.append(svg2);
  // composition bar (ATSDR: ~45–60% CH4, ~40–60% CO2)
  const comp = [['CH₄ 45–60%', 52, 'var(--c4s)'], ['CO₂ 40–60%', 44, '#9aa3a8'], ['egyéb', 4, 'var(--warn)']];
  let x = 0; svg2.append(s('text', { x: 0, y: 14, 'font-size': 13, fill: 'var(--muted)', text: 'Hulladéklerakó-gáz jellemző összetétele (ATSDR)' }));
  comp.forEach(([t, v, c]) => { svg2.append(s('rect', { x: x * 3.5, y: 24, width: v * 3.5 - 2, height: 30, rx: 4, fill: c })); svg2.append(s('text', { x: x * 3.5 + 6, y: 74, 'font-size': 12, fill: 'var(--ink)', text: t })); x += v; });
  let c = 3, tt = 0, visible = false;
  bindRange('gasC', (v) => { c = v; upd(); }, (v) => fmt(v, 1) + ' tf%');
  function upd() {
    const v = $('#gasVerdict');
    if (c < 5) verdict(v, c < 1 ? 'ok' : 'mid', c < 1 ? 'Kis koncentráció' : 'Az alsó robbanási határ alatt', 'A gáz még nem robbanóképes, de a jelenléte figyelmeztető: a koncentráció a zárt térben növekedhet.');
    else if (c <= 15) verdict(v, 'no', 'Robbanóképes elegy (5–15 tf%)', 'Egy szikra, gyújtóláng vagy villanykapcsoló is berobbanthatja.');
    else verdict(v, 'mid', 'Túl dús elegy (> 15 tf%)', 'Önmagában nem robban, de oxigénhiányos, és szellőzéskor, levegővel hígulva újra a robbanóképes tartományba kerül.');
  }
  upd();
  function draw() {
    svg.innerHTML = '';
    // cellar drawing
    const gx = 20, gy = 30, gw = 300, gh = 240;
    svg.append(s('rect', { x: gx, y: gy, width: gw, height: gh, fill: 'var(--surface2)', stroke: 'var(--ink)', 'stroke-width': 2 }));
    svg.append(s('rect', { x: gx - 10, y: gy + gh, width: gw + 20, height: 30, fill: 'url(#hatch-fill)' }));
    svg.append(s('text', { x: gx + 10, y: gy + 22, 'font-size': 13, fill: 'var(--muted)', text: 'pince' }));
    const rnd = mulberry32(7); const n = Math.round(c * 7);
    const zone = c < 5 ? 0 : c <= 15 ? 1 : 2;
    for (let i = 0; i < n; i++) { const px = gx + 10 + rnd() * (gw - 20); const ph = rnd(); const py = gy + gh - 10 - ((ph * 200 + tt * 30 * (0.5 + rnd())) % (gh - 20)); svg.append(s('circle', { cx: px + Math.sin(tt + i) * 3, cy: py, r: 3 + rnd() * 4, fill: zone === 1 ? 'var(--bad)' : 'var(--c4s)', opacity: 0.55 })); }
    // crack in floor
    svg.append(s('path', { d: `M${gx + 120} ${gy + gh} l10 -12 l8 6 l12 -10`, stroke: 'var(--ink)', 'stroke-width': 2, fill: 'none' }));
    // boiler
    svg.append(s('rect', { x: gx + gw - 70, y: gy + gh - 110, width: 50, height: 100, rx: 4, fill: '#d8dcdf', stroke: 'var(--ink)' }));
    svg.append(s('circle', { cx: gx + gw - 45, cy: gy + gh - 40, r: 6, fill: zone === 1 ? '#ff6a10' : '#f0a33a' }));
    if (zone === 1) svg.append(s('text', { x: gx + gw / 2, y: gy + gh / 2, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: 'var(--bad)', text: 'ROBBANÁSVESZÉLY' }));
    // gauge scale
    const sx = 350, sy = 40, sh = 240, sw2 = 46;
    const Y = (v) => sy + sh - v / 40 * sh;
    svg.append(s('rect', { x: sx, y: Y(40), width: sw2, height: sh, rx: 8, fill: 'var(--line)' }));
    svg.append(s('rect', { x: sx, y: Y(15), width: sw2, height: Y(5) - Y(15), fill: 'var(--bad)', opacity: 0.85 }));
    svg.append(s('rect', { x: sx, y: Y(40), width: sw2, height: Y(15) - Y(40), fill: 'var(--warn)', opacity: 0.45 }));
    svg.append(s('rect', { x: sx, y: Y(5), width: sw2, height: Y(0) - Y(5), fill: 'var(--good)', opacity: 0.45 }));
    [0, 5, 15, 40].forEach(v => svg.append(s('text', { x: sx + sw2 + 8, y: Y(v) + 4, 'font-size': 12, fill: 'var(--muted)', 'font-family': 'IBM Plex Mono, monospace', text: v + '%' })));
    svg.append(s('text', { x: sx + sw2 + 44, y: Y(10) + 4, 'font-size': 13, 'font-weight': 700, fill: 'var(--bad)', text: 'robbanóképes' }));
    svg.append(s('text', { x: sx + sw2 + 44, y: Y(2.5) + 4, 'font-size': 13, fill: 'var(--muted)', text: 'alsó határ alatt' }));
    svg.append(s('text', { x: sx + sw2 + 44, y: Y(28) + 4, 'font-size': 13, fill: 'var(--muted)', text: 'túl dús' }));
    svg.append(s('path', { d: `M${sx - 14} ${Y(c)} l12 -8 v16 z`, fill: 'var(--ink)' }));
    svg.append(s('line', { x1: sx - 2, x2: sx + sw2, y1: Y(c), y2: Y(c), stroke: 'var(--ink)', 'stroke-width': 3 }));
  }
  onVisible(box, (v) => { visible = v; if (v) loop(); });
  function loop() { if (!visible) return; tt += 0.02; draw(); setTimeout(() => requestAnimationFrame(loop), 40); }
  draw();
}

// ------------------------------------------------------------------ improvement method selector
export function improve() {
  const box = $('#impChart'); if (!box) return;
  const W = 640, H = 420; const svg = svgRoot(W, H); box.append(svg);
  let D = 2.5, GW = 3, type = 'coarse';
  const M = [ // name, from, to, deep?, condition note
    ['Vibrolap', 0.1, 0.3, 'surf'],
    ['Vibrohenger', 0.3, 0.5, 'surf'],
    ['Ejtett döngölőlap', 2, 4, 'surf'],
    ['Vibroflotáció', 0, 9, 'deep'],
    ['Talajkiszorításos cölöp', 0, 9, 'deep'],
    ['Robbantás', 0, 9, 'deep'],
    ['Cementinjektálás + kevés bentonit', 0, 9, 'inj-c'],
    ['Vízüveges injektálás', 0, 9, 'inj-w'],
    ['Talajcsere (részleges / teljes)', 0, 9, 'rep'],
  ];
  segmented($('#impSeg'), [['coarse', 'Durva, szemcsés feltöltés'], ['fine', 'Finomabb, sűrű feltöltés']], 'coarse', (k) => { type = k; render(); });
  bindRange('impD', (v) => { D = v; render(); }, (v) => fmt(v, 1) + ' m');
  bindRange('impGW', (v) => { GW = v; render(); }, (v) => fmt(v, 1) + ' m');
  function suit(m) {
    const [n, a, b, kind] = m;
    if (kind === 'surf') return D <= b ? ['ok', `${fmt(a, 1)}–${fmt(b, 1)} m réteg tömöríthető`] : D <= b * 1.5 ? ['mid', 'rétegenként, vagy csak a felső részt javítja'] : ['no', `csak ${fmt(b, 1)} m-ig hat`];
    if (kind === 'deep') return D >= 2 ? ['ok', 'laza és vastag feltöltés esetén' + (n.startsWith('Talajk') ? '; egyben merevítő elem is' : n === 'Robbantás' ? '; roskadást idéz elő' : '')] : ['mid', 'vékony feltöltésre gazdaságtalan'];
    if (kind === 'inj-c') return type === 'coarse' ? ['ok', 'felülről lefelé injektálva'] : ['no', 'finom, sűrű anyagba nem hatol be'];
    if (kind === 'inj-w') return type === 'fine' ? ['ok', 'sűrű anyagban alkalmazható'] : ['mid', 'durva anyagban a cementes injektálás az elterjedt'];
    if (kind === 'rep') return D <= GW ? ['ok', 'a talajvízszint felett elvégezhető'] : ['no', `csak a talajvízszint felett (${fmt(GW, 1)} m-ig)`];
  }
  function render() {
    svg.innerHTML = '';
    const L = 216, Rr = 44, T = 30, B = 20; const maxD = 9;
    const Y = (d) => T + d / maxD * (H - T - B);
    // depth grid
    for (let d = 0; d <= maxD; d++) { svg.append(s('line', { x1: L, x2: W - Rr, y1: Y(d), y2: Y(d), stroke: 'var(--line)' })); svg.append(s('text', { x: W - 2, y: Y(d) + 4, 'text-anchor': 'end', 'font-size': 11, fill: 'var(--faint)', text: d + ' m' })); }
    // GW and required depth
    svg.append(s('rect', { x: L, y: Y(GW), width: W - L - Rr, height: Y(maxD) - Y(GW), fill: 'var(--waters)', opacity: 0.12 }));
    svg.append(s('line', { x1: L, x2: W - Rr, y1: Y(GW), y2: Y(GW), stroke: 'var(--water)', 'stroke-width': 2.5 }));
    svg.append(s('text', { x: L + 4, y: Y(GW) + 15, 'font-size': 12, 'font-weight': 700, fill: 'var(--water)', text: 'talajvízszint' }));
    svg.append(s('rect', { x: L, y: Y(0), width: W - L - Rr, height: Y(D) - Y(0), fill: 'var(--acc)', opacity: 0.08 }));
    svg.append(s('line', { x1: L, x2: W - Rr, y1: Y(D), y2: Y(D), stroke: 'var(--acc)', 'stroke-width': 2.5, 'stroke-dasharray': '7 5' }));
    svg.append(s('text', { x: W - Rr - 60, y: Y(D) + 15, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: 'var(--acc)', text: 'javítandó mélység' }));
    const colW = (W - L - Rr) / M.length;
    M.forEach((m, i) => {
      const [n, a, b, kind] = m; const [st] = suit(m);
      const x = L + i * colW + colW * 0.2, w = colW * 0.6;
      const col = st === 'ok' ? 'var(--good)' : st === 'mid' ? 'var(--warn)' : 'var(--bad)';
      if (kind === 'surf') svg.append(s('rect', { x, y: Y(0), width: w, height: Y(b) - Y(0), rx: 4, fill: col, opacity: 0.85 }));
      else if (kind === 'rep') svg.append(s('rect', { x, y: Y(0), width: w, height: Y(Math.min(GW, maxD)) - Y(0), rx: 4, fill: col, opacity: 0.85 }));
      else { svg.append(s('rect', { x, y: Y(0), width: w, height: Y(maxD) - Y(0), rx: 4, fill: col, opacity: 0.35 })); svg.append(s('text', { x: x + w / 2, y: Y(maxD) - 8, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--ink)', text: '↓' })); }
      svg.append(s('text', { x: x + w / 2, y: T - 8, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 800, fill: 'var(--ink)', text: i + 1 }));
    });
    // left legend list in SVG
    M.forEach((m, i) => { const [st] = suit(m); svg.append(s('text', { x: 0, y: T + 12 + i * 40, 'font-size': 13, 'font-weight': 700, fill: 'var(--ink)', text: (i + 1) + '. ' + (m[0].length > 26 ? m[0].slice(0, 25) + '…' : m[0]) })); svg.append(s('text', { x: 14, y: T + 28 + i * 40, 'font-size': 11, fill: st === 'ok' ? 'var(--good)' : st === 'mid' ? 'var(--warn)' : 'var(--bad)', text: st === 'ok' ? 'alkalmas' : st === 'mid' ? 'feltételesen' : 'nem alkalmas' })); });
    // list
    const list = $('#impList'); list.innerHTML = '';
    M.forEach((m) => { const [st, why] = suit(m); list.append(h('div', { class: 'rule' + (st === 'ok' ? ' on' : ''), style: 'cursor:default;grid-template-columns:minmax(0,1fr)' }, h('div', {}, h('b', { html: m[0] + ` <span class="chip ${st}" style="float:right">${st === 'ok' ? '✓' : st === 'mid' ? '~' : '✕'}</span>` }), h('span', {}, why)))); });
  }
}

// ------------------------------------------------------------------ Holme Fen
export function holme() {
  const box = $('#holmeBox'); if (!box) return;
  const W = 900, H = 360; const svg = svgRoot(W, H); box.append(svg);
  const drop = (y) => 4.05 * (1 - Math.pow(1 - clamp((y - 1851) / (2024 - 1851)), 1.8));
  function render(year) {
    svg.innerHTML = '';
    const mpx = 34, y0 = 90; const dr = drop(year);
    const surf = y0 + dr * mpx, clayTop = y0 + 6.2 * mpx;
    svg.append(s('rect', { x: 0, y: 0, width: W, height: H, fill: 'var(--surface2)' }));
    // peat
    svg.append(s('rect', { x: 0, y: surf, width: W, height: clayTop - surf, fill: 'url(#hatch-peat)' }));
    svg.append(s('rect', { x: 0, y: surf, width: W, height: Math.min(0.9 * mpx, clayTop - surf), fill: '#7a6a55', opacity: 0.55 }));
    svg.append(s('rect', { x: 0, y: clayTop, width: W, height: H - clayTop, fill: '#7d8890' }));
    svg.append(s('text', { x: 20, y: clayTop + 24, 'font-size': 14, 'font-weight': 700, fill: '#fff', text: 'agyag' }));
    svg.append(s('text', { x: 20, y: (surf + clayTop) / 2 + 5, 'font-size': 14, 'font-weight': 700, fill: '#e9e2d4', text: 'tőzeg' }));
    // grass line
    svg.append(s('rect', { x: 0, y: surf - 5, width: W, height: 6, fill: '#5e7a3a' }));
    // GW line
    svg.append(s('line', { x1: 0, x2: W, y1: surf + 0.9 * mpx, y2: surf + 0.9 * mpx, stroke: 'var(--waters)', 'stroke-width': 2 }));
    // original level
    svg.append(s('line', { x1: 0, x2: W, y1: y0, y2: y0, stroke: 'var(--acc)', 'stroke-width': 2.5, 'stroke-dasharray': '10 7' }));
    svg.append(s('text', { x: 20, y: y0 - 10, 'font-size': 14, 'font-weight': 700, fill: 'var(--acc)', text: '1851-es terepszint' }));
    // post
    const px = 520;
    svg.append(s('rect', { x: px - 7, y: y0 - 4, width: 14, height: clayTop + 1.5 * mpx - y0, fill: '#2e3430' }));
    svg.append(s('rect', { x: px - 12, y: y0 - 8, width: 24, height: 7, rx: 2, fill: '#2e3430' }));
    if (dr > 0.15) {
      svg.append(s('line', { x1: px + 40, x2: px + 40, y1: y0, y2: surf, stroke: 'var(--ink)', 'stroke-width': 2.5 }));
      svg.append(s('line', { x1: px + 32, x2: px + 48, y1: y0, y2: y0, stroke: 'var(--ink)', 'stroke-width': 2.5 }));
      svg.append(s('line', { x1: px + 32, x2: px + 48, y1: surf, y2: surf, stroke: 'var(--ink)', 'stroke-width': 2.5 }));
      svg.append(s('text', { x: px + 56, y: (y0 + surf) / 2 + 8, 'font-size': 26, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: 'var(--ink)', text: (year >= 2024 ? '> 4' : fmt(dr, 2)) + ' m' }));
    }
    // trees and a house that sink with the land
    for (const tx of [150, 300, 640, 720]) { svg.append(s('rect', { x: tx - 3, y: surf - 48, width: 6, height: 44, fill: '#5a4030' })); svg.append(s('circle', { cx: tx, cy: surf - 56, r: 20, fill: '#4f7a2c' })); }
    svg.append(s('text', { x: W - 20, y: 44, 'text-anchor': 'end', 'font-size': 40, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: 'var(--ink)', text: year }));
  }
  bindRange('holmeY', (v) => render(v), (v) => String(v));
}

// ------------------------------------------------------------------ peat recognition game
export function peatGame() {
  const box = $('#peatGame'); if (!box) return;
  const S = [
    ['A', '#d9bf7f', 'Sárgásbarna, porózus, mészkonkréciós; függőleges falban megáll', 'γ ≈ 15–17 kN/m³ (száraz, laza)', 'w ≈ 12%', false, 'Ez lösz: roskadékony, de nem szerves talaj.'],
    ['B', '#1f1a14', 'Fekete, szálas-rostos, növényi maradványokkal; kinyomva víz folyik belőle', 'γ ≈ 10–11 kN/m³', 'w ≈ 450%', true, 'Tőzeg: sötét, könnyű, rostos, óriási víztartalmú.'],
    ['C', '#6d6a64', 'Szürke, kövér, plasztikus; száradáskor mozaikosan repedezik', 'γ ≈ 19–20 kN/m³', 'w ≈ 32%', false, 'Kövér agyag: térfogatváltozó lehet, de nem szerves.'],
    ['D', '#3a3934', 'Sötétszürke, finomszemcsés, szerves szagú; kézben kenhető', 'γ ≈ 14–15 kN/m³', 'w ≈ 95%', true, 'Szerves iszap: a jegyzet szerint szintén kedvezőtlen.'],
  ];
  const picked = new Set(); let checked = false;
  S.forEach(([id, col, desc, gam, w, org]) => {
    const card = h('button', { type: 'button', class: 'card', style: 'text-align:left;cursor:pointer;border-width:2px', 'aria-pressed': 'false' },
      h('div', { style: `height:70px;border-radius:10px;margin-bottom:12px;background:${col};background-image:radial-gradient(rgba(255,255,255,.12) 1px,transparent 1.5px);background-size:9px 9px` }),
      h('span', { class: 'k' }, id + ' minta'), h('p', { style: 'color:var(--ink);font-size:15px' }, desc), h('p', { class: 'mono small', style: 'margin-top:8px' }, gam + ' · ' + w));
    card.addEventListener('click', () => { if (checked) return; if (picked.has(id)) picked.delete(id); else picked.add(id); card.setAttribute('aria-pressed', picked.has(id) ? 'true' : 'false'); card.style.borderColor = picked.has(id) ? 'var(--acc)' : ''; });
    card.dataset.id = id; box.append(card);
  });
  const fb = $('#peatGameFb');
  const btn = h('button', { class: 'btn acc small', type: 'button', style: 'margin-top:12px' }, 'Ellenőrzés: ezek a szerves talajok');
  fb.append(btn);
  btn.addEventListener('click', () => {
    checked = true; let ok = true;
    $$('#peatGame .card').forEach((c, i) => { const org = S[i][5]; const p = picked.has(S[i][0]); if (org !== p) ok = false; c.style.borderColor = org ? 'var(--good)' : p ? 'var(--bad)' : ''; c.append(h('p', { class: 'small', style: `margin-top:8px;font-weight:700;color:${org ? 'var(--good)' : 'var(--muted)'}` }, S[i][6])); });
    const v = h('div'); fb.append(v);
    verdict(v, ok ? 'ok' : 'mid', ok ? 'Pontosan: a B és a D minta szerves talaj' : 'Majdnem: a B (tőzeg) és a D (szerves iszap) a szerves talaj', 'A szerves iszap és agyag is kedvezőtlen, nem csak a tőzeg.');
    btn.remove();
  });
}

// ------------------------------------------------------------------ w & Eoed bars
export function peatBars() {
  const a = $('#wBars'); if (!a) return;
  const W = 520, H = 250; const svg = svgRoot(W, H); a.append(svg);
  const rows = [['Homok', 10, 25, 'var(--c2s)'], ['Kövér agyag', 20, 45, 'var(--c1s)'], ['Szerves talaj, alsó határ', 50, 70, 'var(--c4s)'], ['Tőzeg, gyakori', 200, 700, 'var(--c4s)'], ['Rostos tőzeg, akár', 700, 2000, 'var(--c4s)']];
  const X = (v) => 170 + v / 2000 * (W - 190);
  rows.forEach(([n, lo, hi, c], i) => { const y = 16 + i * 44; svg.append(s('text', { x: 0, y: y + 16, 'font-size': 13.5, fill: 'var(--ink)', text: n })); svg.append(s('rect', { x: X(0), y: y + 4, width: W - 190, height: 16, rx: 4, fill: 'var(--line)' })); svg.append(s('rect', { x: X(lo), y: y + 4, width: Math.max(3, X(hi) - X(lo)), height: 16, rx: 4, fill: c })); svg.append(s('text', { x: X(0), y: y + 36, 'font-size': 12, 'font-family': 'IBM Plex Mono, monospace', fill: 'var(--muted)', text: lo + '–' + hi + '%' })); });
  const b = $('#eBars'); const svg2 = svgRoot(W, H); b.append(svg2);
  const r2 = [['Tőzeg (jegyzet)', 300, 2000, 'var(--c4s)'], ['Közepesen tömör homok', 20000, 50000, 'var(--c2s)'], ['Tömör homokos kavics', 50000, 150000, '#9aa3a8']];
  const lx = (v) => 170 + (Math.log10(v) - 2) / 3.3 * (W - 190);
  [100, 1000, 10000, 100000].forEach(v => { svg2.append(s('line', { x1: lx(v), x2: lx(v), y1: 10, y2: 170, stroke: 'var(--line)' })); svg2.append(s('text', { x: lx(v), y: 188, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--faint)', 'font-family': 'IBM Plex Mono, monospace', text: v >= 1000 ? v / 1000 + ' MPa' : v + ' kPa' })); });
  r2.forEach(([n, lo, hi, c], i) => { const y = 20 + i * 52; svg2.append(s('text', { x: 0, y: y + 16, 'font-size': 13.5, fill: 'var(--ink)', text: n })); svg2.append(s('rect', { x: lx(lo), y: y + 4, width: lx(hi) - lx(lo), height: 18, rx: 4, fill: c })); });
  svg2.append(s('text', { x: 170, y: 228, 'font-size': 13, 'font-weight': 700, fill: 'var(--bad)', text: 'ugyanarra a terhelésre ~10–100-szoros süllyedés' }));
}

// ------------------------------------------------------------------ settlement calculator
export function settle() {
  const box = $('#settleBox'); if (!box) return;
  const W = 600, H = 340; const svg = svgRoot(W, H); box.append(svg);
  let hh = 2, ds = 100, E = 500;
  const upd = () => {
    const sp = ds * hh / E, ssd = ds * hh / 30000;
    $('#stP').textContent = fmt(sp * 100, 1) + ' cm'; $('#stSand').textContent = fmt(ssd * 1000, 1) + ' mm'; $('#stRatio').textContent = fmt(sp / ssd, 0) + '×';
    svg.innerHTML = '';
    const mpx = 40, base = 300;
    const draw = (x, label, s0, comp, pat, txt) => {
      const top = base - hh * mpx;
      const exag = Math.min(comp * mpx, hh * mpx * 0.8);
      svg.append(s('rect', { x, y: top, width: 150, height: hh * mpx, fill: 'none', stroke: 'var(--line2)', 'stroke-dasharray': '5 4' }));
      svg.append(s('rect', { x, y: top + exag, width: 150, height: hh * mpx - exag, fill: `url(#${pat})`, stroke: 'var(--ink)', 'stroke-width': 1.5 }));
      svg.append(s('rect', { x: x - 6, y: top + exag - 14, width: 162, height: 14, fill: '#8a9096' }));
      for (let k = 0; k < 4; k++) svg.append(s('path', { d: `M${x + 20 + k * 37} ${top + exag - 60} v40 m-7 -10 l7 10 l7 -10`, stroke: 'var(--ink)', 'stroke-width': 2.5, fill: 'none' }));
      svg.append(s('text', { x: x + 75, y: base + 24, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: 'var(--ink)', 'font-family': 'Archivo, sans-serif', text: label }));
      svg.append(s('text', { x: x + 75, y: top + exag - 70, 'text-anchor': 'middle', 'font-size': 14, fill: 'var(--bad)', 'font-family': 'IBM Plex Mono, monospace', text: txt }));
    };
    draw(60, 'Homok', 0, ssd, 'hatch-loess', 's = ' + fmt(ssd * 1000, 1) + ' mm');
    draw(340, 'Tőzeg', 0, sp, 'hatch-peat', 's = ' + fmt(sp * 100, 1) + ' cm');
    svg.append(s('line', { x1: 20, x2: W - 20, y1: base, y2: base, stroke: 'var(--ink)', 'stroke-width': 2 }));
  };
  bindRange('stH', (v) => { hh = v; upd(); }, (v) => fmt(v, 1) + ' m');
  bindRange('stS', (v) => { ds = v; upd(); }, (v) => v + ' kPa');
  bindRange('stE', (v) => { E = v; upd(); }, (v) => v + ' kPa');
}

// ------------------------------------------------------------------ time-settlement (log t)
export function timeCurve() {
  const box = $('#timeChart'); if (!box) return;
  const W = 900, H = 320; const svg = svgRoot(W, H); box.append(svg);
  let kk = 0.35, ca = 0.55;
  function U(Tv) { // Terzaghi average degree of consolidation approx
    if (Tv < 0.217) return Math.sqrt(4 * Tv / Math.PI);
    return 1 - (8 / (Math.PI * Math.PI)) * Math.exp(-Math.PI * Math.PI * Tv / 4);
  }
  function render() {
    svg.innerHTML = '';
    const L = 100, R = 30, T = 40, B = 44;
    const lt0 = Math.log10(1), lt1 = Math.log10(36500); // days: 1 day .. 100 years
    const X = (d) => L + (Math.log10(d) - lt0) / (lt1 - lt0) * (W - L - R);
    const sMax = 1.6; const Y = (sv) => T + sv / sMax * (H - T - B);
    const t90 = Math.pow(10, lerp(4.1, 1.3, kk)); // days
    const tp = t90 * 1.1;
    const cS = lerp(0.05, 0.35, ca);
    const peat = (d) => { const Tv = 0.848 * d / t90; let v = U(Tv); if (d > tp) v += cS * Math.log10(d / tp); return v; };
    const sand = (d) => 0.06 * U(0.848 * d / 0.05);
    [[1, '1 nap'], [30, '1 hónap'], [365, '1 év'], [3650, '10 év'], [36500, '100 év']].forEach(([d, t]) => { svg.append(s('line', { x1: X(d), x2: X(d), y1: T, y2: H - B, stroke: 'var(--line)' })); svg.append(s('text', { x: X(d), y: H - B + 18, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--muted)', text: t })); });
    svg.append(s('line', { x1: L, x2: W - R, y1: T, y2: T, stroke: 'var(--line2)', 'stroke-width': 2 }));
    svg.append(s('text', { x: L - 10, y: H - B, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--muted)', text: 'süllyedés ↓' }));
    svg.append(s('text', { x: W - R, y: T - 12, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--muted)', text: 'idő (log) →' }));
    const path = (f, c, wd, dash) => { let d = ''; for (let i = 0; i <= 200; i++) { const day = Math.pow(10, lt0 + i / 200 * (lt1 - lt0)); d += (i ? 'L' : 'M') + X(day).toFixed(1) + ' ' + Y(Math.min(f(day), sMax)).toFixed(1); } svg.append(s('path', { d, fill: 'none', stroke: c, 'stroke-width': wd, 'stroke-dasharray': dash || '' })); };
    path(sand, 'var(--c2s)', 3);
    path(peat, 'var(--acc)', 4.5);
    svg.append(s('line', { x1: X(tp), x2: X(tp), y1: T, y2: H - B, stroke: 'var(--acc)', 'stroke-dasharray': '5 5' }));
    svg.append(s('text', { x: X(tp) + 6, y: H - B - 8, 'font-size': 12, fill: 'var(--acc)', 'font-weight': 700, text: 'elsődleges konszolidáció vége' }));
    svg.append(s('text', { x: X(2), y: Y(sand(2)) + 18, 'font-size': 12, fill: 'var(--ink)', text: 'homok: gyors, kicsi' }));
    svg.append(s('text', { x: X(Math.min(30000, tp * 6)), y: Y(peat(Math.min(30000, tp * 6))) + 26, 'text-anchor': 'end', 'font-size': 12, 'font-weight': 700, fill: 'var(--ink)', text: 'másodlagos kompresszió' }));
    [[365, '1 év'], [3650, '10 év'], [18250, '50 év']].forEach(([d, t]) => { const v = peat(d); svg.append(s('circle', { cx: X(d), cy: Y(Math.min(v, sMax)), r: 5, fill: 'var(--surface)', stroke: 'var(--ink)', 'stroke-width': 2 })); });
    $('#tKo').textContent = 't₉₀ ≈ ' + (t90 < 365 ? Math.round(t90 / 30) + ' hónap' : fmt(t90 / 365, 1) + ' év');
    $('#tCao').textContent = ca < 0.33 ? 'kicsi' : ca < 0.66 ? 'közepes' : 'nagy';
  }
  bindRange('tK', (v) => { kk = v / 100; render(); });
  bindRange('tCa', (v) => { ca = v / 100; render(); });
}

// ------------------------------------------------------------------ stress bulb (canvas)
export function bulb() {
  const cv = $('#bulbCv'); if (!cv) return;
  const g = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const mpx = 80, x0 = W / 2, D = 0.9, peatH = 2.6;
  let B = 0.6, C = 2.2, img = g.createImageData(W, H);
  function render() {
    const b = B / 2;
    const pal = (v) => v > 0.6 ? [255, 64, 38] : v > 0.4 ? [255, 140, 51] : v > 0.2 ? [255, 217, 77] : [77, 230, 204];
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (document.documentElement.getAttribute('data-theme') !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
    const d = img.data;
    for (let py = 0; py < H; py++) {
      const depth = py / mpx;
      for (let px = 0; px < W; px++) {
        const x = (px - x0) / mpx; let c;
        if (depth < 0.35) c = [74, 58, 40];
        else if (depth < C) c = [196, 165, 112];
        else if (depth < C + peatH) c = [52, 42, 32];
        else c = [140, 132, 118];
        // texture noise
        const n = ((px * 73856093 ^ py * 19349663) & 255) / 255 * 14 - 7;
        c = [c[0] + n, c[1] + n, c[2] + n];
        const z = depth - D;
        if (z > 0.01) {
          const v = stripS(x, z, b);
          if (v > 0.1) { const p = pal(v); const a = 0.42; c = [lerp(c[0], p[0], a), lerp(c[1], p[1], a), lerp(c[2], p[2], a)]; }
        }
        const i = (py * W + px) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // isolines via marching (sample along vertical lines) — draw contour by scanning
    const levels = [0.8, 0.6, 0.4, 0.2];
    levels.forEach(lv => {
      g.strokeStyle = lv === 0.2 ? '#ffffff' : 'rgba(255,240,200,0.8)'; g.lineWidth = lv === 0.2 ? 3 : 1.5;
      for (const side of [-1, 1]) {
        g.beginPath(); let started = false;
        for (let zz = 0.02; zz < 8; zz += 0.02) {
          // find x where stripS = lv on this side
          let lo = 0, hi = 4, f0 = stripS(0, zz, b);
          if (f0 < lv) break;
          for (let it = 0; it < 22; it++) { const mid = (lo + hi) / 2; if (stripS(mid, zz, b) > lv) lo = mid; else hi = mid; }
          const px = x0 + side * lo * mpx, py = (D + zz) * mpx;
          if (!started) { g.moveTo(x0 + side * b * mpx, D * mpx); g.lineTo(px, py); started = true; } else g.lineTo(px, py);
        }
        // close to axis at max depth
        let zMax = 0.02; while (stripS(0, zMax, b) >= lv && zMax < 10) zMax += 0.01;
        g.lineTo(x0, (D + zMax) * mpx);
        g.stroke();
      }
    });
    // footing + wall
    g.fillStyle = '#c8c5be'; g.strokeStyle = '#222'; g.lineWidth = 2;
    g.fillRect(x0 - b * mpx, 0.35 * mpx, b * 2 * mpx, (D - 0.35) * mpx); g.strokeRect(x0 - b * mpx, 0.35 * mpx, b * 2 * mpx, (D - 0.35) * mpx);
    g.fillStyle = '#e8e2d4'; g.fillRect(x0 - 0.2 * mpx, 0, 0.4 * mpx, 0.35 * mpx); g.strokeRect(x0 - 0.2 * mpx, 0, 0.4 * mpx, 0.35 * mpx);
    // labels
    g.font = '700 16px Archivo, sans-serif'; g.fillStyle = '#fff';
    g.fillText('homok fedőréteg', 14, (0.35 + C) / 2 * mpx + 6);
    g.fillText('tőzeg', 14, (C + peatH / 2) * mpx + 6);
    g.fillStyle = '#1b1b1b'; g.fillText('teherbíró réteg', 14, (C + peatH + 0.4) * mpx + 6);
    // frost depth marker
    g.strokeStyle = '#fff'; g.setLineDash([6, 5]); g.beginPath(); g.moveTo(x0 + 2.2 * mpx, 0); g.lineTo(x0 + 2.2 * mpx, D * mpx); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#fff'; g.font = '600 14px "Atkinson Hyperlegible", sans-serif'; g.fillText('fagyhatár', x0 + 2.2 * mpx + 8, D * mpx / 2 + 14);
    // readouts
    const zP = C - D; const sigP = stripS(0, zP, b);
    let z02 = 0.02; while (stripS(0, z02, b) >= 0.2 && z02 < 12) z02 += 0.01;
    $('#bOut').textContent = fmt(sigP, 2) + ' q';
    $('#bDepth').textContent = fmt(D + z02, 2) + ' m';
    const v = $('#bVerdict');
    if (D + z02 <= C) verdict(v, 'ok', 'A 0,2 q izobár a homokban marad', 'Keskeny, sekély alap: a jelentős feszültségek a fedőrétegben maradnak, a tőzegre csak kis feszültség jut.');
    else if (D + z02 <= C + 0.8) verdict(v, 'mid', 'A hagyma éppen eléri a tőzeget', 'Ellenőrizni kell, hogy a tőzeg összenyomódásából adódó teljes süllyedés megengedhető-e.');
    else verdict(v, 'no', 'A feszültség-hagyma mélyen a tőzegbe hatol', 'Széles alap vagy vékony fedőréteg: nagy süllyedés várható. Keskenyebb alap, talajcsere vagy mélyített alap kell.');
    void dark;
  }
  bindRange('bB', (v) => { B = v; render(); }, (v) => fmt(v, 2) + ' m');
  bindRange('bC', (v) => { C = v; render(); }, (v) => fmt(v, 1) + ' m');
}

// ------------------------------------------------------------------ peat decision tree
export function peatTree() {
  const box = $('#peatTree'); if (!box) return;
  const N = {
    q1: ['Van jó állapotú, teherbíró fedőréteg (pl. homok) a szerves réteg felett?', [['Igen', 'q2'], ['Nem, a tőzeg a felszín közelében van', 'q3']]],
    q2: ['Elég vastag a fedőréteg ahhoz, hogy a fagyhatár alá helyezett keskeny alap alatt is maradjon homok?', [['Igen', 'r1'], ['Nem', 'q3']]],
    q3: ['Milyen vastag a szerves réteg az alapozási sík alatt?', [['Vékony', 'q4'], ['Vastag', 'r3']]],
    q4: ['Választhatunk merev, a süllyedéskülönbségekre nem érzékeny szerkezetet?', [['Igen', 'r4'], ['Nem', 'r2']]],
    r1: ['Kis mélységű, keskeny síkalap a fedőrétegben', 'A fedőréteg teherbírását minél jobban kihasználjuk, az alaptest minél keskenyebb legyen. Ellenőrizd, hogy a teljes süllyedés a megengedett alatt marad-e.'],
    r2: ['(Részleges) talajcsere', 'A szerves réteget kiemeljük, és jól tömöríthető szemcsés anyagot építünk be rétegenként tömörítve, a teherbíró rétegig.'],
    r3: ['Mélyített síkalap a teherbíró rétegre', 'A szerves réteg alatti megfelelő teherbírású talajra alapozunk. Ha ez gazdaságtalan, mélyalapozás jön szóba (lásd: Védekezés a káros süllyedések ellen).'],
    r4: ['Merev, süllyedésre nem érzékeny építmény', 'Vékony szerves réteg esetén kellő merevségű és szilárdságú szerkezet építhető, amely egy tömbként, egyenletesen süllyed.'],
  };
  function show(path) {
    box.innerHTML = '';
    path.forEach((key, i) => {
      const n = N[key];
      if (key.startsWith('q')) {
        const step = h('div', { class: 'tree-step' }, h('p', {}, n[0]));
        const opts = h('div', { class: 'seg', style: 'margin-top:10px' });
        n[1].forEach(([lab, nxt]) => { const b = h('button', { type: 'button', 'aria-pressed': path[i + 1] === nxt ? 'true' : 'false' }, lab); b.addEventListener('click', () => show(path.slice(0, i + 1).concat(nxt))); opts.append(b); });
        step.append(opts); box.append(step);
      } else {
        box.append(h('div', { class: 'tree-res' }, h('span', { class: 'eyebrow' }, 'Javaslat'), h('h4', { style: 'font-size:20px;margin-top:4px' }, n[0]), h('p', { style: 'margin-top:6px' }, n[1]),
          h('p', { class: 'small muted', style: 'margin-top:8px' }, 'Minden esetben: zárt alaprajz, térbeli merevítés, rugalmas közműcsatlakozás. Kerüld a részleges alápincézést, a melléépítést, a rezgést és a talajvízszint-ingadozást.')));
      }
    });
  }
  show(['q1']);
}
