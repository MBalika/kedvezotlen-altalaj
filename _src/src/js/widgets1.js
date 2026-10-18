import { clamp, lerp, smooth, $, h, s, svgRoot, fmt, bindRange, segmented, onVisible, verdict, cssVar, onTheme, mulberry32 } from './util.js';

// ------------------------------------------------------------------ hero core samples
export function heroCores() {
  const box = $('#heroCores'); if (!box) return;
  const items = [
    ['terfogatvaltozo', 'hatch-clay', 'Térfogatváltozó agyag', 'duzzad · zsugorodik', 'var(--c1s)', 'clay'],
    ['roskadekony', 'hatch-loess', 'Roskadékony lösz', 'átázva roskad', 'var(--c2s)', 'loess'],
    ['feltoltes', 'hatch-fill', 'Feltöltés', 'törmelék · szemét', 'var(--c3s)', 'fill'],
    ['szerves', 'hatch-peat', 'Szerves talaj', 'tőzeg · iszap', 'var(--c4s)', 'peat'],
  ];
  items.forEach(([id, pat, name, sub, col, kind], i) => {
    const H = 300 + [0, 30, -20, 15][i];
    const svg = svgRoot(110, H + 40);
    const gid = 'coreShade' + i;
    svg.append(s('defs', {}, s('linearGradient', { id: gid, x1: 0, x2: 1, y1: 0, y2: 0 },
      s('stop', { offset: '0', 'stop-color': '#000', 'stop-opacity': '0.38' }), s('stop', { offset: '0.35', 'stop-color': '#fff', 'stop-opacity': '0.16' }),
      s('stop', { offset: '0.7', 'stop-color': '#000', 'stop-opacity': '0.05' }), s('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '0.45' }))));
    const top = 20;
    svg.append(s('rect', { x: 10, y: top, width: 90, height: H, rx: 12, fill: `url(#${pat})` }));
    // details per soil
    const g = s('g', { 'clip-path': '' });
    const r = mulberry32(i + 3);
    if (kind === 'clay') for (let k = 0; k < 5; k++) { let x = 20 + r() * 70, y = top + 10 + r() * (H - 40); let d = `M${x} ${y}`; for (let j = 0; j < 4; j++) { x += (r() - 0.5) * 14; y += 8 + r() * 10; d += ` L${x} ${y}`; } g.append(s('path', { d, stroke: '#3b230e', 'stroke-width': 1.6, fill: 'none', opacity: 0.8 })); }
    if (kind === 'loess') for (let k = 0; k < 9; k++) { const x = 18 + r() * 74, y = top + 10 + r() * (H - 30); g.append(s('ellipse', { cx: x, cy: y, rx: 2.2, ry: 5, fill: '#5f4718', opacity: 0.55 })); }
    if (kind === 'fill') for (let k = 0; k < 14; k++) { const x = 16 + r() * 70, y = top + 8 + r() * (H - 26); const c = ['#9a4b33', '#d8d4cc', '#2a6fd0', '#3f8f5a', '#2a2826', '#e8c83a'][k % 6]; g.append(s('rect', { x, y, width: 6 + r() * 12, height: 3 + r() * 6, fill: c, transform: `rotate(${(r() - 0.5) * 60} ${x} ${y})`, opacity: 0.95 })); }
    if (kind === 'peat') for (let k = 0; k < 16; k++) { const x = 16 + r() * 76, y = top + 10 + r() * (H - 30); g.append(s('path', { d: `M${x} ${y} q ${6 + r() * 6} ${-3 + r() * 6} ${12 + r() * 10} ${r() * 4}`, stroke: '#b89a6a', 'stroke-width': 1.2, fill: 'none', opacity: 0.8 })); }
    svg.append(g);
    svg.append(s('rect', { x: 10, y: top, width: 90, height: H, rx: 12, fill: `url(#${gid})` }));
    svg.append(s('ellipse', { cx: 55, cy: top + 2, rx: 45, ry: 9, fill: col, opacity: 0.95 }));
    svg.append(s('ellipse', { cx: 55, cy: top + 2, rx: 45, ry: 9, fill: '#fff', opacity: 0.15 }));
    // depth ticks
    for (let m = 0; m <= 5; m++) { const y = top + m * (H / 5); svg.append(s('line', { x1: 102, x2: 108, y1: y, y2: y, stroke: 'currentColor', 'stroke-width': 1, opacity: 0.5 })); }
    const short = ['Agyag', 'Lösz', 'Feltöltés', 'Tőzeg'][i];
    const a = h('a', { class: 'core', href: '#' + id, 'data-ch': String(i + 1), 'aria-label': name }, svg, h('b', { class: 'long' }, name), h('b', { class: 'short' }, short), h('small', {}, sub));
    box.append(a);
  });
}

// ------------------------------------------------------------------ comparison cards
export function compare() {
  const seg = $('#cmpSeg'), cards = $('#cmpCards'); if (!seg) return;
  const soils = [['Térfogatváltozó agyag', 'var(--c1s)'], ['Roskadékony talaj', 'var(--c2s)'], ['Feltöltés', 'var(--c3s)'], ['Szerves talaj', 'var(--c4s)']];
  const data = {
    ok: ['A víztartalom változása: aszály, fák vízelvonása, csapadékos tél és tavasz.', 'Átázás terhelés alatt: csőtörés, tetővíz, felszíni víz.', 'Nagy és változó összenyomhatóság, átázás, a szerves anyag bomlása.', 'Kicsi modulus, lassú konszolidáció, talajvízszint-süllyedés, hő.'],
    move: ['Ciklikus: tavasszal emel, ősszel süllyeszt. Évről évre ismétlődik.', 'Hirtelen, egyszeri és visszafordíthatatlan süllyedés.', 'Egyenlőtlen süllyedés, amely a feltöltés vastagságát követi.', 'Nagy, lassú, évtizedekig tartó süllyedés.'],
    when: ['Nagy nyári szárazság után, főleg több száraz év sorozatában.', 'Napokkal-hetekkel a víz megjelenése után, akár évtizedekkel az építés után.', 'Már az építés után, és újra minden átázáskor.', 'Folyamatosan; felgyorsul, ha süllyed a talajvíz.'],
    rec: ['I_p > 30–35%, montmorillonit, száraz időben mozaikosan repedezett felszín.', 'Sárgás, porózus lösz, amely függőleges falban megáll; i_r > 0,01.', 'Tégla, beton, salak, üveg, műanyag a fúrásban; ismeretlen kor.', 'Sötét, könnyű, rostos, w > 50–70%.'],
  };
  const render = (k) => {
    cards.innerHTML = '';
    soils.forEach(([n, c], i) => cards.append(h('div', { class: 'card', style: `border-top:5px solid ${c}` }, h('h4', {}, n), h('p', {}, data[k][i].replace(/I_p/g, 'Iₚ').replace(/i_r/g, 'iᵣ')))));
  };
  segmented(seg, [['ok', 'Mi váltja ki?'], ['move', 'Milyen a mozgás?'], ['when', 'Mikor jelentkezik?'], ['rec', 'Hogyan ismerem fel?']], 'ok', render);
}

// ------------------------------------------------------------------ clay minerals (canvas)
export function clayMicro() {
  const cv = $('#clayMicro'); if (!cv) return;
  const g = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const M = { kao: { name: 'Kaolinit', d0: 0.72, dd: 0.0, sw: 0.06, col: '#c9b48e' }, ill: { name: 'Illit', d0: 1.0, dd: 0.08, sw: 0.18, col: '#b49a76' }, mon: { name: 'Montmorillonit', d0: 0.96, dd: 1.05, sw: 0.42, col: '#a7836a' } };
  let mineral = 'mon', w = 0.35, cur = 0.35, visible = false;
  segmented($('#mineralSeg'), [['kao', 'Kaolinit'], ['ill', 'Illit'], ['mon', 'Montmorillonit']], 'mon', (k) => { mineral = k; upd(); });
  bindRange('microW', (v) => { w = v / 100; upd(); }, (v) => v + '%');
  function upd() {
    const m = M[mineral]; const d = m.d0 + m.dd * w;
    $('#microD').textContent = fmt(d, 2) + ' nm';
    $('#microV').textContent = '+' + fmt(m.sw * w * 100, 0) + '%';
  }
  const rnd = mulberry32(5); const mol = Array.from({ length: 260 }, () => [rnd(), rnd(), rnd() * 6.28]);
  function draw(t) {
    cur += (w - cur) * 0.08;
    const m = M[mineral];
    const ink = cssVar('--ink'), muted = cssVar('--muted');
    g.clearRect(0, 0, W, H);
    const n = 6, plate = 16;
    const gap = 6 + (m.dd > 0.5 ? 58 : m.dd > 0 ? 14 : 2) * cur + (mineral === 'mon' ? 6 : 0);
    const total = n * plate + (n - 1) * gap; const y0 = (H - total) / 2 + 10;
    // swelling envelope
    g.fillStyle = 'rgba(92,194,242,0.08)'; g.fillRect(60, y0 - 8, W - 200, total + 16);
    for (let i = 0; i < n; i++) {
      const y = y0 + i * (plate + gap);
      // tetrahedral-octahedral sheet look
      const gr = g.createLinearGradient(0, y, 0, y + plate); gr.addColorStop(0, m.col); gr.addColorStop(0.5, '#e8dcc6'); gr.addColorStop(1, m.col);
      g.fillStyle = gr; roundRect(g, 70, y, W - 220, plate, 6); g.fill();
      g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 1; g.stroke();
      for (let k = 0; k < 26; k++) { g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.arc(84 + k * 20, y + plate / 2, 2, 0, 7); g.fill(); }
      if (i < n - 1 && gap > 4) {
        // water molecules in the interlayer
        const cnt = Math.floor(gap * 1.6);
        for (let k = 0; k < cnt; k++) { const mm = mol[(k + i * 37) % mol.length]; const x = 74 + mm[0] * (W - 228); const yy = y + plate + 3 + mm[1] * (gap - 6) + Math.sin(t * 0.002 + mm[2]) * 1.5;
          g.fillStyle = '#4aa8de'; g.beginPath(); g.arc(x, yy, 3.2, 0, 7); g.fill(); g.fillStyle = '#e8f6ff'; g.beginPath(); g.arc(x - 3, yy - 2, 1.5, 0, 7); g.arc(x + 3, yy - 2, 1.5, 0, 7); g.fill(); }
      }
    }
    // dimension
    g.strokeStyle = ink; g.lineWidth = 2; g.beginPath(); g.moveTo(W - 120, y0); g.lineTo(W - 120, y0 + total); g.moveTo(W - 128, y0); g.lineTo(W - 112, y0); g.moveTo(W - 128, y0 + total); g.lineTo(W - 112, y0 + total); g.stroke();
    g.fillStyle = ink; g.font = '700 16px Archivo, sans-serif'; g.fillText('térfogat', W - 104, y0 + total / 2);
    g.fillStyle = muted; g.font = '500 14px "IBM Plex Mono", monospace'; g.fillText(m.name.toLowerCase() + ' · ' + (m.dd > 0.5 ? 'duzzadó rácsközök' : m.dd > 0 ? 'részben kötött K⁺' : 'merev, H-kötések'), 70, H - 18);
    g.fillStyle = '#4aa8de'; g.beginPath(); g.arc(78, 22, 4, 0, 7); g.fill(); g.fillStyle = muted; g.fillText('vízmolekula', 90, 27);
  }
  function roundRect(c, x, y, w2, h2, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w2, y, x + w2, y + h2, r); c.arcTo(x + w2, y + h2, x, y + h2, r); c.arcTo(x, y + h2, x, y, r); c.arcTo(x, y, x + w2, y, r); c.closePath(); }
  onVisible(cv, (v) => { visible = v; if (v) loop(); });
  function loop(t = 0) { if (!visible) return; draw(t); requestAnimationFrame(loop); }
  draw(0);
}

// ------------------------------------------------------------------ expansive clay criteria
export function criteria() {
  const ctl = $('#critCtl'); if (!ctl) return;
  const C = [
    ['ip', 'Plaszticitási index Iₚ', '%', 0, 80, 1, 30, 35, (v) => v > 35 ? 2 : v > 30 ? 1 : 0, '> 30–35%'],
    ['zsl', 'Lineáris zsugorodás z_sl', '%', 0, 15, 0.1, 5, 5, (v) => v > 5 ? 2 : 0, '> 5%'],
    ['dv', 'Max. fajlagos térfogatváltozás', '%', 0, 40, 0.5, 15, 15, (v) => v > 15 ? 2 : 0, '> 15%'],
    ['ps', 'Duzzadási nyomás', 'kPa', 0, 400, 5, 100, 100, (v) => v > 100 ? 2 : 0, '> 100 kPa'],
    ['dd', 'Fajlagos duzzadás δ_d', '', 0, 0.15, 0.005, 0.04, 0.04, (v) => v > 0.04 ? 2 : 0, '> 0,04'],
  ];
  const presets = { fat: [45, 8, 22, 180, 0.07], mid: [31, 4.6, 12, 85, 0.035], silt: [8, 1.5, 3, 15, 0.01] };
  const segBox = h('div', { class: 'seg' }); ctl.append(h('div', { class: 'small muted' }, 'Minta-előbeállítások:'), segBox);
  const vals = {}; const ranges = {};
  C.forEach(([k, name, unit, min, max, step]) => {
    const id = 'crit_' + k;
    const lab = name.replace('z_sl', 'z').replace('δ_d', 'δ');
    const wrap = h('div', { class: 'slider' }, h('label', { for: id }, h('span', { html: name.replace('z_sl', 'z<sub>sl</sub>').replace('δ_d', 'δ<sub>d</sub>') }), h('output', { id: id + 'o' })), h('input', { type: 'range', id, min, max, step, value: min }));
    ctl.append(wrap);
    ranges[k] = bindRange(id, (v) => { vals[k] = v; render(); }, (v) => (k === 'dd' ? fmt(v, 3) : fmt(v, step < 1 ? 1 : 0)) + (unit ? ' ' + unit : ''));
    void lab;
  });
  segmented(segBox, [['fat', 'Kövér agyag'], ['mid', 'Közepes agyag'], ['silt', 'Iszap']], 'fat', (p) => { C.forEach(([k], i) => ranges[k] && ranges[k].set(presets[p][i])); });
  function render() {
    const bars = $('#critBars'); if (!bars) return; bars.innerHTML = '';
    let score = 0, n = 0;
    C.forEach(([k, name, unit, min, max, step, thLo, thHi, test, thTxt]) => {
      const v = vals[k]; if (v === undefined) return; n++;
      const res = test(v); score += res === 2 ? 1 : res === 1 ? 0.5 : 0;
      const p = (v - min) / (max - min) * 100, tp = (thHi - min) / (max - min) * 100;
      const row = h('div', { class: 'rule', style: 'cursor:default;grid-template-columns:minmax(0,1fr);' + (res === 2 ? 'border-color:var(--bad);background:var(--badbg)' : res === 1 ? 'border-color:var(--warn);background:var(--warnbg)' : '') },
        h('div', {}, h('b', { html: name.replace('z_sl', 'z<sub>sl</sub>').replace('δ_d', 'δ<sub>d</sub>') + ` <span class="chip ${res === 2 ? 'no' : res === 1 ? 'mid' : 'ok'}" style="float:right">${res === 2 ? 'kritikus' : res === 1 ? 'határon' : 'rendben'}</span>` }),
          h('div', { style: `position:relative;height:10px;border-radius:99px;background:var(--line);margin-top:8px` },
            h('i', { style: `position:absolute;left:0;top:0;bottom:0;width:${p}%;border-radius:99px;background:${res === 2 ? 'var(--bad)' : res === 1 ? 'var(--warn)' : 'var(--good)'}` }),
            h('i', { style: `position:absolute;left:${tp}%;top:-4px;bottom:-4px;width:2px;background:var(--ink)` })),
          h('span', {}, 'határ: ' + thTxt)));
      bars.append(row);
    });
    const v = $('#critVerdict'); if (!v || !n) return;
    if (score >= 4) verdict(v, 'no', 'Térfogatváltozó agyag', 'Az alapsík ne legyen 2–2,5 m-nél közelebb a terepszinthez, és tartsd be a tervezési szabályokat.');
    else if (score >= 2) verdict(v, 'mid', 'Mérsékelten térfogatváltozó, gyanús', 'Több jellemző a határ közelében van. Érdemes óvatosan, a szabályok szerint alapozni.');
    else verdict(v, 'ok', 'Nem térfogatváltozó', 'A jellemzők a határértékek alatt maradnak.');
  }
}

// ------------------------------------------------------------------ seasonal movement chart
export function season() {
  const box = $('#seasonChart'); if (!box) return;
  const W = 900, H = 330, L = 92, R = 210, T = 26, B = 46;
  const svg = svgRoot(W, H); box.append(svg);
  let t = 0.69, D = 0.8, dry = 0.6;
  const months = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const monthsLong = ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'];
  const YEARS = 3, N = YEARS * 12;
  const za = 2.25;
  function amp() { return clamp((za - D) / (za - 0.5)); }
  function mv(m) { // m in months from start; mm
    const dryK = 1 + 1.4 * dry * Math.exp(-Math.pow((m - 21.5) / 3.2, 2)) + 0.5 * dry * Math.exp(-Math.pow((m - 33.5) / 3.2, 2));
    const ph = 2 * Math.PI * (m - 3.5) / 12; // peak heave in mid-April, minimum in mid-October
    const c = Math.cos(ph);
    const v = c > 0 ? 9 * c : 14 * c * dryK;
    return v * amp() + (D < za ? 0 : 0);
  }
  const X = (m) => L + m / N * (W - L - R), Y = (v) => T + (H - T - B) / 2 - v * 3.2;
  function render() {
    svg.innerHTML = '';
    const ink = 'var(--ink)', mut = 'var(--muted)';
    // seasons background
    for (let y = 0; y < YEARS; y++) {
      svg.append(s('rect', { x: X(y * 12 + 2), y: T, width: X(5) - X(0), height: H - T - B, fill: 'var(--waters)', opacity: 0.09 }));
      svg.append(s('rect', { x: X(y * 12 + 7), y: T, width: X(4) - X(0), height: H - T - B, fill: 'var(--c1s)', opacity: 0.1 }));
      svg.append(s('text', { x: X(y * 12 + 6), y: H - 8, 'text-anchor': 'middle', 'font-size': 13, fill: mut, 'font-family': 'IBM Plex Mono, monospace', text: y === 1 ? (dry > 0.05 ? (y + 1) + '. év · aszályos' : (y + 1) + '. év') : (y + 1) + '. év' }));
    }
    for (let m = 0; m <= N; m++) { if (m % 12 === 0) svg.append(s('line', { x1: X(m), x2: X(m), y1: T, y2: H - B, stroke: 'var(--line2)' })); if (m < N) svg.append(s('text', { x: X(m + 0.5), y: H - B + 16, 'text-anchor': 'middle', 'font-size': 10, fill: 'var(--faint)', text: months[m % 12] })); }
    svg.append(s('line', { x1: L, x2: W - R, y1: Y(0), y2: Y(0), stroke: 'var(--line2)', 'stroke-dasharray': '4 4' }));
    svg.append(s('text', { x: L - 8, y: Y(14), 'text-anchor': 'end', 'font-size': 12, fill: mut, text: 'emelkedés' }));
    svg.append(s('text', { x: L - 8, y: Y(-20), 'text-anchor': 'end', 'font-size': 12, fill: mut, text: 'süllyedés' }));
    let d = ''; for (let i = 0; i <= 360; i++) { const m = i / 360 * N; d += (i ? 'L' : 'M') + X(m).toFixed(1) + ' ' + Y(mv(m)).toFixed(1); }
    svg.append(s('path', { d, fill: 'none', stroke: 'var(--acc)', 'stroke-width': 3.5, 'stroke-linejoin': 'round' }));
    // cursor
    const m = t * N, v = mv(m);
    svg.append(s('line', { x1: X(m), x2: X(m), y1: T, y2: H - B, stroke: ink, 'stroke-width': 1.5 }));
    svg.append(s('circle', { cx: X(m), cy: Y(v), r: 7, fill: 'var(--surface)', stroke: ink, 'stroke-width': 3 }));
    // house glyph on the right with cracks
    const hx = W - R + 40, hy = 120;
    const lift = v * 1.6; const crack = Math.max(0, -v) * 0.55;
    const gH = s('g', { transform: `translate(${hx},${hy - lift})` });
    gH.append(s('path', { d: 'M0 70 L0 20 L60 -16 L120 20 L120 70 Z', fill: 'var(--surface2)', stroke: ink, 'stroke-width': 2 }));
    gH.append(s('rect', { x: 18, y: 32, width: 22, height: 20, fill: 'none', stroke: mut, 'stroke-width': 1.5 }));
    gH.append(s('rect', { x: 78, y: 32, width: 22, height: 20, fill: 'none', stroke: mut, 'stroke-width': 1.5 }));
    if (crack > 0.2) { gH.append(s('path', { d: `M4 ${22} l8 10 l-4 8 l9 12 l-3 9`, stroke: 'var(--bad)', 'stroke-width': crack, fill: 'none', 'stroke-linecap': 'round' })); gH.append(s('path', { d: `M116 ${22} l-8 10 l4 8 l-9 12 l3 9`, stroke: 'var(--bad)', 'stroke-width': crack, fill: 'none', 'stroke-linecap': 'round' })); }
    svg.append(gH);
    svg.append(s('rect', { x: hx - 20, y: hy + 70 + 4, width: 160, height: 26, fill: 'url(#hatch-clay)', opacity: 0.9 }));
    const mm = Math.floor(m) % 12;
    svg.append(s('text', { x: hx + 60, y: hy + 128, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: ink, 'font-family': 'Archivo, sans-serif', text: monthsLong[mm] }));
    svg.append(s('text', { x: hx + 60, y: hy + 148, 'text-anchor': 'middle', 'font-size': 13, fill: v >= 0 ? 'var(--water)' : 'var(--bad)', 'font-family': 'IBM Plex Mono, monospace', text: (v >= 0 ? '+' : '') + fmt(v, 0) + ' mm' }));
    svg.append(s('text', { x: hx + 60, y: hy + 166, 'text-anchor': 'middle', 'font-size': 12, fill: mut, text: crack > 0.2 ? 'repedések nyitva' : 'repedések zárva' }));
    if (amp() < 0.05) svg.append(s('text', { x: (L + W - R) / 2, y: T + 20, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: 'var(--good)', text: 'Az alapsík a meteorológiai határmélység alatt van: az épület nyugalomban' }));
    const out = $('#seasonTo'); if (out) out.textContent = (Math.floor(m / 12) + 1) + '. év, ' + monthsLong[mm];
  }
  bindRange('seasonT', (v) => { t = v / 1000; render(); });
  bindRange('seasonD', (v) => { D = v / 100; render(); }, (v) => fmt(v / 100, 2) + ' m' + (v / 100 >= 2 ? ' ✓' : ''));
  bindRange('seasonDry', (v) => { dry = v / 100; render(); }, (v) => v < 15 ? 'enyhe' : v < 60 ? 'közepes' : 'erős');
  // autoplay when first visible
  let played = false;
  onVisible(box, (vis) => { if (vis && !played) { played = true; const el = $('#seasonT'); let k = 0; const st = performance.now(); const step = (now) => { k = (now - st) / 5200; if (k > 1) return; el.value = Math.round(k * 690); el.dispatchEvent(new Event('input')); requestAnimationFrame(step); }; requestAnimationFrame(step); } }, 0.4);
}

// ------------------------------------------------------------------ storeys vs swelling pressure
export function storeys() {
  const box = $('#storeyChart'); if (!box) return;
  const W = 520, H = 250; const svg = svgRoot(W, H); box.append(svg);
  const q = [0, 50, 95, 140], share = [0, 83, 13, 4];
  function render(n) {
    svg.innerHTML = '';
    const ps = 150, maxV = 200, x0 = 40, x1 = W - 20, yb = 200;
    const Y = (v) => yb - v / maxV * 160;
    svg.append(s('rect', { x: x0, y: Y(maxV), width: x1 - x0, height: Y(100) - Y(maxV), fill: 'var(--bad)', opacity: 0.08 }));
    svg.append(s('line', { x1: x0, x2: x1, y1: Y(100), y2: Y(100), stroke: 'var(--bad)', 'stroke-dasharray': '6 5', 'stroke-width': 2 }));
    svg.append(s('text', { x: x0 + 4, y: Y(100) - 8, 'text-anchor': 'start', 'font-size': 13, fill: 'var(--bad)', 'font-weight': 700, text: 'duzzadási nyomás > 100 kPa' }));
    for (let i = 1; i <= 3; i++) {
      const bx = x0 + 30 + (i - 1) * 150, on = i === n;
      svg.append(s('rect', { x: bx, y: Y(q[i]), width: 70, height: yb - Y(q[i]), rx: 6, fill: on ? 'var(--acc)' : 'var(--line2)' }));
      svg.append(s('text', { x: bx + 35, y: Y(q[i]) - 8, 'text-anchor': 'middle', 'font-size': 14, 'font-family': 'IBM Plex Mono, monospace', fill: 'var(--ink)', text: '~' + q[i] + ' kPa' }));
      svg.append(s('text', { x: bx + 35, y: yb + 20, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)', text: i + ' szint' }));
      svg.append(s('text', { x: bx + 35, y: yb + 40, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: 'var(--bad)', 'font-family': 'Archivo, sans-serif', text: 'kár ' + share[i] + '%' }));
    }
    svg.append(s('text', { x: x0, y: 14, 'font-size': 12, fill: 'var(--muted)', text: 'talpfeszültség (tájékoztató értékek)' }));
  }
  bindRange('storeyN', (v) => render(v), (v) => v + ' szint');
}

// ------------------------------------------------------------------ design rules checker with a drawing
export function rules() {
  const list = $('#rulesList'), box = $('#rulesHouse'); if (!list) return;
  const R = [
    ['depth', 'Alapsík legalább 2–2,5 m mélyen', 'meteorológiai határmélység: alatta már nem változik a víztartalom', 3],
    ['cellar', 'Teljes alápincézés (nem részleges)', 'a részleges alápincézés a legrosszabb megoldás', 2],
    ['stress', 'A teherbírás kihasználása: nagy talpfeszültség', 'hogy a duzzadási nyomás ne tudja megemelni', 2],
    ['rebar', 'Vasalt, erősített alap', 'ne a felszerkezetet, hanem inkább az alapot erősítsük', 1],
    ['terrain', 'Rendezett terep, elvezetett csapadékvíz', 'ne álljon meg a víz a ház mellett', 1],
    ['roof', 'Tetővíz gondos elvezetése', 'zárt csatornában, a háztól távol', 1],
    ['walk', '1,0–1,5 m széles, kifelé lejtő járda', 'az épület körül', 1],
    ['annex', 'Nincs kinyúló, kis terhelésű épületrész', 'vagy azt is kellő mélységben alapozzuk', 1],
    ['tree', 'Nincs nagy vízigényű fa a ház közelében', 'pl. nyárfa, nyírfa: gyökere kiszívja a vizet az alapok alól', 2],
    ['pipe', '„Vizes” közművek merőlegesen, ovális nyílással, védőcsőben', 'biztosítva a vezeték és a fal relatív elmozdulását', 1],
  ];
  const st = {}; R.forEach(([k]) => st[k] = false);
  R.forEach(([k, t, d], i) => {
    const cb = h('input', { type: 'checkbox', id: 'rule_' + k });
    const row = h('label', { class: 'rule', for: 'rule_' + k }, cb, h('div', {}, h('b', {}, (i + 1) + '. ' + t), h('span', {}, d)));
    cb.addEventListener('change', () => { st[k] = cb.checked; row.classList.toggle('on', cb.checked); draw(); });
    list.append(row);
  });
  const W = 640, H = 430; const svg = svgRoot(W, H); box.append(svg);
  function draw() {
    svg.innerHTML = '';
    const ink = 'var(--ink)', mut = 'var(--muted)';
    const gy = 170; // ground level
    const mpx = 62; // px per metre (depth)
    // soil
    svg.append(s('rect', { x: 0, y: gy, width: W, height: H - gy, fill: 'url(#hatch-clay)', opacity: 0.55 }));
    // active zone band
    svg.append(s('rect', { x: 0, y: gy, width: W, height: 2.25 * mpx, fill: 'var(--c1s)', opacity: 0.18 }));
    svg.append(s('line', { x1: 0, x2: W, y1: gy + 2.25 * mpx, y2: gy + 2.25 * mpx, stroke: 'var(--acc)', 'stroke-dasharray': '7 6', 'stroke-width': 2 }));
    svg.append(s('text', { x: 8, y: gy + 2.25 * mpx - 8, 'font-size': 12, fill: 'var(--acc)', 'font-weight': 700, text: 'meteorológiai határmélység ≈ 2–2,5 m' }));
    // terrain / puddle
    if (!st.terrain) svg.append(s('ellipse', { cx: 70, cy: gy + 2, rx: 46, ry: 6, fill: 'var(--waters)', opacity: 0.8 }));
    svg.append(s('line', { x1: 0, x2: W, y1: gy, y2: gy, stroke: '#5e7a3a', 'stroke-width': 4 }));
    // house
    const hx0 = 170, hx1 = 450;
    const fd = st.depth ? 2.4 : 0.8; const fw = st.stress ? 30 : 64;
    // cellar
    if (st.cellar) svg.append(s('rect', { x: hx0, y: gy, width: hx1 - hx0, height: fd * mpx - 14, fill: 'var(--surface2)', stroke: ink, 'stroke-width': 2 }));
    else if (st.depth) { svg.append(s('rect', { x: hx0, y: gy, width: (hx1 - hx0) * 0.45, height: fd * mpx - 14, fill: 'var(--surface2)', stroke: 'var(--bad)', 'stroke-width': 2, 'stroke-dasharray': '6 4' })); svg.append(s('text', { x: hx0 + 6, y: gy + 22, 'font-size': 12, fill: 'var(--bad)', 'font-weight': 700, text: 'részleges pince' })); }
    for (const x of [hx0, hx1]) {
      svg.append(s('rect', { x: x - fw / 2, y: gy, width: fw, height: fd * mpx, fill: '#bdbab3', stroke: ink, 'stroke-width': 1.5 }));
      if (st.rebar) for (let k = 0; k < 3; k++) svg.append(s('circle', { cx: x - fw / 2 + 7 + k * (fw - 14) / 2, cy: gy + fd * mpx - 8, r: 3, fill: '#7a3a1c' }));
    }
    svg.append(s('rect', { x: hx0 - 8, y: 60, width: hx1 - hx0 + 16, height: gy - 60, fill: 'var(--surface)', stroke: ink, 'stroke-width': 2 }));
    svg.append(s('path', { d: `M${hx0 - 26} 64 L${(hx0 + hx1) / 2} 8 L${hx1 + 26} 64 Z`, fill: '#8a3e2b', stroke: ink, 'stroke-width': 2 }));
    for (const x of [hx0 + 40, hx1 - 90]) svg.append(s('rect', { x, y: 92, width: 50, height: 42, fill: 'var(--surface2)', stroke: mut, 'stroke-width': 1.5 }));
    // roof water
    svg.append(s('line', { x1: hx1 + 14, x2: hx1 + 14, y1: 66, y2: gy - (st.roof ? 0 : 20), stroke: '#6b6f72', 'stroke-width': 5 }));
    if (st.roof) { svg.append(s('path', { d: `M${hx1 + 14} ${gy} L${hx1 + 14} ${gy + 40} L${W - 10} ${gy + 52}`, stroke: '#6b6f72', 'stroke-width': 7, fill: 'none' })); }
    else for (let k = 0; k < 6; k++) svg.append(s('line', { x1: hx1 + 14, y1: gy - 20, x2: hx1 + 4 + k * 5, y2: gy - 2, stroke: 'var(--waters)', 'stroke-width': 2 }));
    // walkway
    if (st.walk) for (const [a, b] of [[hx0 - 80, hx0 - 8], [hx1 + 8, hx1 + 80]]) svg.append(s('path', { d: `M${a} ${gy - (a < hx0 ? 0 : 6)} L${b} ${gy - (a < hx0 ? 6 : 0)} L${b} ${gy + 4} L${a} ${gy + 4} Z`, fill: '#a9a6a0', stroke: ink, 'stroke-width': 1 }));
    // annex (terrace)
    const ax0 = hx0 - 110, ax1 = hx0 - 8;
    if (!st.annex) { svg.append(s('rect', { x: ax0, y: gy - 12, width: ax1 - ax0, height: 12, fill: '#c9c4ba', stroke: 'var(--bad)', 'stroke-width': 2 })); svg.append(s('rect', { x: ax0 + 4, y: gy, width: 16, height: 0.5 * mpx, fill: '#bdbab3', stroke: 'var(--bad)' })); svg.append(s('text', { x: ax0, y: gy - 18, 'font-size': 12, fill: 'var(--bad)', 'font-weight': 700, text: 'sekély terasz' })); }
    // tree
    const tx = st.tree ? W - 30 : hx1 + 70;
    svg.append(s('rect', { x: tx - 5, y: 30, width: 10, height: gy - 30, fill: '#6b4a2a' }));
    svg.append(s('ellipse', { cx: tx, cy: 50, rx: 18, ry: 48, fill: '#4f7a2c' }));
    const rootD = st.tree ? 1.4 : 3.6;
    for (let k = -3; k <= 3; k++) svg.append(s('path', { d: `M${tx} ${gy} q ${k * 18} ${rootD * mpx * 0.4} ${k * 34} ${rootD * mpx}`, stroke: '#6b4a2a', 'stroke-width': 2, fill: 'none', opacity: 0.7 }));
    if (!st.tree) svg.append(s('text', { x: tx - 60, y: gy + rootD * mpx + 16, 'font-size': 12, fill: 'var(--bad)', 'font-weight': 700, text: 'kiszárított zóna az alap alatt' }));
    // utility pipe
    const py = gy + 0.9 * mpx;
    svg.append(s('line', { x1: 0, x2: hx0 - fw / 2, y1: py + (st.pipe ? 0 : 18), y2: py, stroke: '#3a7ab0', 'stroke-width': 7 }));
    if (st.pipe) svg.append(s('ellipse', { cx: hx0, cy: py, rx: fw / 2 + 2, ry: 12, fill: 'none', stroke: 'var(--good)', 'stroke-width': 3 }));
    // risk meter
    const tot = R.reduce((a, r) => a + r[3], 0), got = R.reduce((a, r) => a + (st[r[0]] ? r[3] : 0), 0);
    const risk = 1 - got / tot;
    const col = risk > 0.6 ? 'var(--bad)' : risk > 0.25 ? 'var(--warn)' : 'var(--good)';
    svg.append(s('rect', { x: 20, y: H - 30, width: W - 40, height: 12, rx: 6, fill: 'var(--line)' }));
    svg.append(s('rect', { x: 20, y: H - 30, width: (W - 40) * risk, height: 12, rx: 6, fill: col }));
    svg.append(s('text', { x: 20, y: H - 38, 'font-size': 13, 'font-weight': 700, fill: ink, text: 'Kárkockázat: ' + (risk > 0.6 ? 'magas' : risk > 0.25 ? 'közepes' : 'alacsony') }));
    const hint = $('#rulesHint'); if (hint) hint.textContent = `${R.filter(r => st[r[0]]).length} / ${R.length} szabály teljesül`;
  }
  draw();
}

// ------------------------------------------------------------------ loess micro + Venn
export function loessMicro() {
  const cv = $('#loessMicro'); if (!cv) return;
  const g = cv.getContext('2d'); const W = cv.width, H = cv.height;
  const rnd = mulberry32(9); const grains = [];
  // open (macroporous) arrangement
  for (let i = 0; i < 70; i++) {
    let x, y, r, ok, tries = 0;
    do { r = 14 + rnd() * 10; x = 40 + rnd() * (W - 80); y = 120 + rnd() * (H - 190); ok = grains.every(g2 => Math.hypot(g2.x - x, g2.y - y) > g2.r + r + 9); tries++; } while (!ok && tries < 400);
    if (ok) grains.push({ x, y, r, c: rnd() });
  }
  // collapsed targets: compress downwards
  const bottom = H - 50;
  grains.sort((a, b) => b.y - a.y);
  grains.forEach(gr => { gr.ty = bottom - (bottom - gr.y) * 0.66 + (rnd() - 0.5) * 6; gr.tx = gr.x + (rnd() - 0.5) * 10; });
  const bridges = [];
  for (let i = 0; i < grains.length; i++) for (let j = i + 1; j < grains.length; j++) { const a = grains[i], b = grains[j]; const d = Math.hypot(a.x - b.x, a.y - b.y); if (d < a.r + b.r + 22) bridges.push([i, j]); }
  let k = 0, target = 0, wet = 0, visible = false;
  const st = { soil: true, load: true, water: false };
  const elS = $('#lcSoil'), elL = $('#lcLoad'), elW = $('#lcWater');
  const vennBox = $('#vennBox'); const vsvg = svgRoot(300, 210); vennBox.append(vsvg);
  function upd() {
    st.soil = elS.checked; st.load = elL.checked; st.water = elW.checked;
    target = st.soil && st.load && st.water ? 1 : 0;
    drawVenn();
    const v = $('#lcVerdict');
    if (target) verdict(v, 'no', 'Roskadás!', 'Mindhárom feltétel teljesül: a víz meggyengíti a mész- és agyaghidakat, a szemcsék a pórusokba csúsznak. Hirtelen térfogatcsökkenés.');
    else if (!st.soil) verdict(v, 'ok', 'Nincs roskadás', 'Tömör, nem makropórusos talajban a víz és a terhelés sem okoz roskadást.');
    else if (!st.water) verdict(v, 'ok', 'Nincs roskadás', 'Szárazon a lösz szilárd, függőleges falban is megáll.');
    else verdict(v, 'mid', 'Átázott, de terheletlen', 'A roskadáshoz terhelés is kell. A mélyebb rétegekben azonban a felette lévő talaj súlya is terhelés: a telített lösz már a puszta terhelés hatására roskad.');
  }
  function drawVenn() {
    vsvg.innerHTML = '';
    const C = [[150, 78, 'TALAJ', st.soil, 'var(--c2s)'], [108, 142, 'TERHELÉS', st.load, 'var(--muted)'], [192, 142, 'VÍZ', st.water, 'var(--waters)']];
    C.forEach(([x, y, t, on, c]) => { vsvg.append(s('circle', { cx: x, cy: y, r: 58, fill: c, 'fill-opacity': on ? 0.38 : 0.06, stroke: c, 'stroke-width': on ? 2.5 : 1.2, 'stroke-dasharray': on ? '' : '5 4' })); });
    C.forEach(([x, y, t, on], i) => vsvg.append(s('text', { x: x + [0, -34, 34][i], y: y + [-30, 22, 22][i], 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 800, 'font-family': 'Archivo, sans-serif', fill: 'var(--ink)', opacity: on ? 1 : 0.45, text: t })));
    const all = st.soil && st.load && st.water;
    vsvg.append(s('text', { x: 150, y: 125, 'text-anchor': 'middle', 'font-size': all ? 15 : 12, 'font-weight': 900, 'font-family': 'Archivo, sans-serif', fill: all ? 'var(--bad)' : 'var(--faint)', text: all ? 'ROSKADÁS' : '?' }));
  }
  [elS, elL, elW].forEach(e => e.addEventListener('change', upd)); upd();
  function draw(t) {
    k += ((target ? 1 : 0) - k) * (target ? 0.06 : 0.04);
    wet += ((st.water ? 1 : 0) - wet) * 0.05;
    const kk = smooth(k);
    g.clearRect(0, 0, W, H);
    // water fill
    if (wet > 0.01) { g.fillStyle = `rgba(92,194,242,${0.28 * wet})`; g.fillRect(20, H - 40 - (H - 120) * wet, W - 40, (H - 120) * wet); }
    // load plate
    const topY = grains.reduce((m, gr) => Math.min(m, lerp(gr.y, gr.ty, kk) - gr.r), 1e9);
    if (st.load) {
      g.fillStyle = '#8a9096'; g.fillRect(30, topY - 24, W - 60, 16);
      g.fillStyle = cssVar('--ink'); g.font = '700 16px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('terhelés', W / 2, topY - 34); g.textAlign = 'left';
      for (let x = 80; x < W - 60; x += 90) { if (Math.abs(x - W / 2) < 60) continue; g.strokeStyle = cssVar('--ink'); g.lineWidth = 3; g.beginPath(); g.moveTo(x, topY - 58); g.lineTo(x, topY - 30); g.stroke(); g.beginPath(); g.moveTo(x - 7, topY - 38); g.lineTo(x, topY - 28); g.lineTo(x + 7, topY - 38); g.stroke(); }
    }
    // bridges
    if (st.soil) bridges.forEach(([i, j]) => {
      const a = grains[i], b = grains[j]; const ax = lerp(a.x, a.tx, kk), ay = lerp(a.y, a.ty, kk), bx = lerp(b.x, b.tx, kk), by = lerp(b.y, b.ty, kk);
      const alpha = (1 - kk) * (1 - 0.5 * wet);
      g.strokeStyle = `rgba(214,200,160,${0.9 * alpha})`; g.lineWidth = 5; g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
    });
    grains.forEach(gr => {
      const x = st.soil ? lerp(gr.x, gr.tx, kk) : gr.tx, y = st.soil ? lerp(gr.y, gr.ty, kk) : gr.ty;
      const base = st.soil ? [202, 170, 102] : [190, 176, 150];
      const grd = g.createRadialGradient(x - gr.r * 0.3, y - gr.r * 0.3, 2, x, y, gr.r);
      grd.addColorStop(0, `rgb(${base[0] + 40},${base[1] + 40},${base[2] + 40})`); grd.addColorStop(1, `rgb(${base[0] - 40 * gr.c},${base[1] - 40 * gr.c},${base[2] - 30 * gr.c})`);
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, gr.r, 0, 7); g.fill();
    });
    // volume bracket
    const bot = H - 46; const top0 = grains.reduce((m, gr) => Math.min(m, (st.soil ? lerp(gr.y, gr.ty, kk) : gr.ty) - gr.r), 1e9);
    g.strokeStyle = cssVar('--acc'); g.lineWidth = 3; g.beginPath(); g.moveTo(W - 22, top0); g.lineTo(W - 12, top0); g.lineTo(W - 12, bot); g.lineTo(W - 22, bot); g.stroke();
    g.fillStyle = cssVar('--muted'); g.font = '500 13px "IBM Plex Mono", monospace';
    g.fillText(st.soil ? (kk > 0.5 ? 'összeroskadt váz' : 'makropórusos váz, mész- és agyaghidak') : 'tömör, szemcsés váz', 24, H - 14);
  }
  onVisible(cv, (v) => { visible = v; if (v) loop(); });
  function loop(t = 0) { if (!visible) return; draw(t); requestAnimationFrame(loop); }
  draw(0);
}

// ------------------------------------------------------------------ oedometer with flooding
export function oedometer() {
  const box = $('#oedBox'); if (!box) return;
  const W = 640, H = 360; const svg = svgRoot(W, H); box.append(svg);
  const types = { loess: ['Lösz (Mezőföld)', 0.065], weak: ['Gyengén roskadó lösz', 0.016], dense: ['Tömör, régi lösz', 0.006] };
  let type = 'loess', sig = 200, flooded = false, sigF = 0, anim = 1;
  const h0 = 20; // mm
  const epsD = (sg) => 0.055 * (1 - Math.exp(-sg / 160));
  const gF = (sg) => sg / (sg + 70);
  const irAt = (sg) => types[type][1] * gF(sg) / gF(200);
  const epsW = (sg) => epsD(sg) + irAt(sg);
  function eps() { if (!flooded) return epsD(sig); const drop = irAt(sigF) * smooth(anim); if (sig <= sigF) return epsD(sig) + drop; return epsD(sigF) + drop + (epsW(sig) - epsW(sigF)); }
  segmented($('#oedSeg'), Object.entries(types).map(([k, v]) => [k, v[0]]), 'loess', (k) => { type = k; flooded = false; render(); });
  bindRange('oedS', (v) => { sig = v; render(); }, (v) => v + ' kPa');
  $('#oedFlood').addEventListener('click', () => { if (flooded) return; flooded = true; sigF = sig; anim = 0; const st = performance.now(); const step = (now) => { anim = clamp((now - st) / 900); render(); if (anim < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); });
  $('#oedReset').addEventListener('click', () => { flooded = false; anim = 1; render(); });
  function render() {
    svg.innerHTML = '';
    const e = eps(); const hh = h0 * (1 - e);
    // cell drawing
    const cx = 40, cy = 70, cw = 170, scale = 9; // px per mm
    const hpx = hh * scale;
    const base = cy + h0 * scale + 20;
    svg.append(s('rect', { x: cx - 14, y: cy - 4, width: cw + 28, height: h0 * scale + 44, rx: 6, fill: 'var(--surface2)', stroke: 'var(--line2)' }));
    if (flooded) svg.append(s('rect', { x: cx - 10, y: cy, width: cw + 20, height: h0 * scale + 36, fill: 'var(--waters)', opacity: 0.25 * smooth(anim) + 0.1 }));
    svg.append(s('rect', { x: cx, y: base - 16, width: cw, height: 16, fill: '#9aa3a8' }));
    svg.append(s('rect', { x: cx, y: base - 16 - hpx, width: cw, height: hpx, fill: 'url(#hatch-loess)', stroke: 'var(--ink)', 'stroke-width': 1 }));
    svg.append(s('rect', { x: cx, y: base - 32 - hpx, width: cw, height: 16, fill: '#9aa3a8' }));
    svg.append(s('rect', { x: cx + 30, y: base - 32 - hpx - 26, width: cw - 60, height: 26, fill: '#565c62' }));
    svg.append(s('text', { x: cx + cw / 2, y: base - 32 - hpx - 8, 'text-anchor': 'middle', 'font-size': 13, fill: '#fff', 'font-family': 'IBM Plex Mono, monospace', text: sig + ' kPa' }));
    svg.append(s('text', { x: cx + cw / 2, y: H - 14, 'text-anchor': 'middle', 'font-size': 13, fill: 'var(--muted)', text: flooded ? 'elárasztva' : 'természetes víztartalom' }));
    // graph
    const gx = 280, gy = 40, gw = 330, gh = 270;
    const X = (sg) => gx + sg / 400 * gw, Y = (ep) => gy + ep / 0.13 * gh;
    svg.append(s('line', { x1: gx, x2: gx + gw, y1: gy, y2: gy, stroke: 'var(--line2)', 'stroke-width': 2 }));
    svg.append(s('line', { x1: gx, x2: gx, y1: gy, y2: gy + gh, stroke: 'var(--line2)', 'stroke-width': 2 }));
    svg.append(s('text', { x: gx + gw, y: gy + 18, 'text-anchor': 'end', 'font-size': 13, fill: 'var(--muted)', text: 'σ [kPa] →' }));
    svg.append(s('text', { x: gx - 8, y: gy + gh, 'text-anchor': 'end', 'font-size': 13, fill: 'var(--muted)', text: 'ε ↓' }));
    for (let v = 100; v <= 400; v += 100) svg.append(s('text', { x: X(v), y: gy - 10, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--faint)', text: v }));
    let d = ''; for (let i = 0; i <= 80; i++) { const sg = i / 80 * 400; d += (i ? 'L' : 'M') + X(sg) + ' ' + Y(epsD(sg)); }
    svg.append(s('path', { d, fill: 'none', stroke: 'var(--c2s)', 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: 0.8 }));
    let d2 = ''; for (let i = 0; i <= 80; i++) { const sg = i / 80 * 400; d2 += (i ? 'L' : 'M') + X(sg) + ' ' + Y(epsW(sg)); }
    svg.append(s('path', { d: d2, fill: 'none', stroke: 'var(--water)', 'stroke-width': 2, 'stroke-dasharray': '5 5', opacity: 0.7 }));
    svg.append(s('text', { x: X(395), y: Y(epsD(395)) - 8, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--acc)', text: 'természetes víztartalmon' }));
    svg.append(s('text', { x: X(395), y: Y(epsW(395)) + 18, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--water)', text: 'telítetten' }));
    // actual path
    let p = ''; const sMax = flooded ? sigF : sig;
    for (let i = 0; i <= 60; i++) { const sg = i / 60 * sMax; p += (i ? 'L' : 'M') + X(sg) + ' ' + Y(epsD(sg)); }
    if (flooded) { p += 'L' + X(sigF) + ' ' + Y(epsD(sigF) + irAt(sigF) * smooth(anim)); if (sig > sigF && anim >= 1) for (let i = 1; i <= 30; i++) { const sg = sigF + i / 30 * (sig - sigF); p += 'L' + X(sg) + ' ' + Y(epsD(sigF) + irAt(sigF) + epsW(sg) - epsW(sigF)); } }
    svg.append(s('path', { d: p, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 3.5 }));
    svg.append(s('circle', { cx: X(sig), cy: Y(e), r: 7, fill: 'var(--acc)', stroke: 'var(--ink)', 'stroke-width': 2 }));
    if (flooded && anim > 0.5) { svg.append(s('text', { x: X(sigF) + 10, y: Y(epsD(sigF) + irAt(sigF) / 2) + 4, 'font-size': 14, 'font-weight': 800, fill: 'var(--bad)', 'font-family': 'Archivo, sans-serif', text: 'roskadás Δh' })); }
    // readouts
    const dh = flooded ? irAt(sigF) * h0 * smooth(anim) : NaN;
    $('#oedH').textContent = fmt(hh, 2); $('#oedDh').textContent = flooded ? fmt(dh, 2) + ' mm' : '–'; $('#oedIr').textContent = flooded ? fmt(dh / h0, 3) : '–';
    const v = $('#oedVerdict');
    if (!flooded) verdict(v, 'mid', 'Terheld a mintát, majd áraszd el', 'A roskadási tényezőt a választott terhelésen, elárasztással határozzuk meg.');
    else if (anim >= 1) { const ir = irAt(sigF); if (ir > 0.01) verdict(v, 'no', 'Roskadásveszélyes: iᵣ = ' + fmt(ir, 3) + ' > 0,01', 'A minta elárasztáskor ' + fmt(ir * 100, 1) + '%-ot roskadt.'); else verdict(v, 'ok', 'Nem roskadásveszélyes: iᵣ = ' + fmt(ir, 3) + ' ≤ 0,01', 'Az elárasztás csak kis többletösszenyomódást okozott.'); }
  }
}
