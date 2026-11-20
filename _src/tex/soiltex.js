// Valósághű, eljárással rajzolt talajtextúrák (vászon). Egy csempe 1024 × 768 px = 4 × 3 m (256 px/m),
// mindkét irányban ismételhető. A függvények csak a document-et használják, így a videókba is beilleszthetők.
// soilCanvas(fajta) -> canvas (gyorsítótárazva) · soilPattern(g, fajta, lépték) -> CanvasPattern · soilURL(fajta, w, h) -> data-URL
const TW = 1024, TH = 768;
const cache = {};
let lastBase = null;

function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const shade = (c, k) => [Math.max(0, Math.min(255, c[0] * k)), Math.max(0, Math.min(255, c[1] * k)), Math.max(0, Math.min(255, c[2] * k))];

// ismételhető értékzaj (px, py rácsperiódus)
function noiseGrid(seed, px, py) { const r = rng(seed); const a = new Float32Array(px * py); for (let i = 0; i < a.length; i++) a[i] = r(); return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy); const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px, y0 = ((yi % py) + py) % py, y1 = (y0 + 1) % py; const v00 = a[y0 * px + x0], v10 = a[y0 * px + x1], v01 = a[y1 * px + x0], v11 = a[y1 * px + x1]; return v00 + (v10 - v00) * fx + (v01 - v00) * fy + (v00 - v10 - v01 + v11) * fx * fy; }; }
// fbm: fx, fy = az első oktáv celláinak száma a csempén
function fbm(seed, fx, fy, oct = 4) { const ns = []; for (let o = 0; o < oct; o++) ns.push(noiseGrid(seed + o * 17, fx << o, fy << o)); return (u, v) => { let s = 0, a = 0.5, n = 0; for (let o = 0; o < oct; o++) { s += a * ns[o](u * (fx << o), v * (fy << o)); n += a; a *= 0.5; } return s / n; }; }

// alap: képpontonként színátmenet több szín között + finom szemcsezaj
function base(g, seed, stops, o = {}) {
  const { fx = 4, fy = 3, oct = 5, grain = 10, warp = 0, fx2 = 9, fy2 = 7, tint = null, tintAmt = 0.35 } = o;
  const img = g.createImageData(TW, TH), d = img.data; const n1 = fbm(seed, fx, fy, oct), n2 = fbm(seed + 91, fx2, fy2, 3), n3 = tint ? fbm(seed + 173, 3, 2, 4) : null; const r = rng(seed + 5);
  const cs = stops.map(hex), tc = tint ? hex(tint) : null;
  for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
    let u = x / TW, v = y / TH; if (warp) { const w = n2(u, v) - 0.5; u += w * warp; v += w * warp * 0.6; }
    let t = n1(u, v); t = Math.max(0, Math.min(0.9999, (t - 0.28) / 0.44)) * (cs.length - 1); const i = Math.floor(t); let c = mix(cs[i], cs[i + 1], t - i);
    if (tc) { const k = Math.max(0, (n3(u, v) - 0.5) * 2.4); c = mix(c, tc, Math.min(1, k) * tintAmt); }
    const gr = (r() - 0.5) * grain + (n2(u, v) - 0.5) * grain * 1.2; const p = (y * TW + x) * 4; d[p] = c[0] + gr; d[p + 1] = c[1] + gr; d[p + 2] = c[2] + gr; d[p + 3] = 255;
  }
  g.putImageData(img, 0, 0); lastBase = img;
}
// zárómenet: (1) porfátyol – az alapanyag foltokban rátelepszik a darabokra, (2) domborzat – a kép fényessége és finom zaj
// magasságként, bal felső megvilágítással (ettől lesz érdes, fényképszerű a felület), (3) ismételhető marad
function finish(g, seed, o = {}) {
  const { veil = 0.25, relief = 1.1, hf = 0.5, lum = 1, contrast = 1.04 } = o;
  const img = g.getImageData(0, 0, TW, TH), d = img.data, b = lastBase.data; const nv = fbm(seed + 301, 7, 6, 4), nh = fbm(seed + 302, 40, 30, 3); const r = rng(seed + 303);
  const H = new Float32Array(TW * TH);
  for (let y = 0, p = 0, i = 0; y < TH; y++) for (let x = 0; x < TW; x++, p += 4, i++) {
    const u = x / TW, v = y / TH; const k = Math.max(0, Math.min(1, (nv(u, v) - 0.38) * 3.2)) * veil;
    d[p] += (b[p] - d[p]) * k; d[p + 1] += (b[p + 1] - d[p + 1]) * k; d[p + 2] += (b[p + 2] - d[p + 2]) * k;
    H[i] = (0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2]) / 255 * lum + nh(u, v) * hf + r() * hf * 0.35;
  }
  for (let y = 0, p = 0; y < TH; y++) { const ym = (y + TH - 1) % TH, yp = (y + 1) % TH; for (let x = 0; x < TW; x++, p += 4) { const xm = (x + TW - 1) % TW, xp = (x + 1) % TW; const sh = (H[ym * TW + xm] - H[yp * TW + xp]) * 0.8 + (H[ym * TW + x] - H[yp * TW + x]) * 0.5 + (H[y * TW + xm] - H[y * TW + xp]) * 0.3; const k = 1 + Math.max(-0.5, Math.min(0.5, sh * relief)); for (let c = 0; c < 3; c++) { let vv = d[p + c] * k; vv = (vv - 128) * contrast + 128; d[p + c] = vv; } } }
  g.putImageData(img, 0, 0);
}
// ismétlődő rajz: a csempe szélén átlógó elem a túloldalon is megjelenik
function wrap(g, x, y, rad, fn) { for (const dx of [0, -TW, TW]) for (const dy of [0, -TH, TH]) { if (x + dx + rad < 0 || x + dx - rad > TW || y + dy + rad < 0 || y + dy - rad > TH) continue; g.save(); g.translate(x + dx, y + dy); fn(g); g.restore(); } }
// szabálytalan (tört vagy kopott) darab körvonala
function blobPath(g, r, rad, n = 9, jit = 0.35, sy = 1) { const a0 = r() * 6.28; g.beginPath(); for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, k = rad * (1 - jit + r() * jit * 2 * 0.6); const px = Math.cos(a) * k, py = Math.sin(a) * k * sy; if (i) g.lineTo(px, py); else g.moveTo(px, py); } g.closePath(); }
function roundBlob(g, r, rad, sy = 1) { const n = 10, a0 = r() * 6.28, pts = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * 6.283, k = rad * (0.82 + r() * 0.3); pts.push([Math.cos(a) * k, Math.sin(a) * k * sy]); } g.beginPath(); for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; if (!i) { const p0 = pts[n - 1]; g.moveTo((p0[0] + p[0]) / 2, (p0[1] + p[1]) / 2); } g.quadraticCurveTo(p[0], p[1], m[0], m[1]); } g.closePath(); }
// megvilágított darab: árnyék alul-jobbra, fény felül-balra
function lit(g, col, rad, path, o = {}) {
  const { shadow = 0.5, rim = 0.2, speck = null, r = null } = o;
  g.save(); g.translate(rad * 0.1, rad * 0.14); path(); g.fillStyle = `rgba(0,0,0,${shadow})`; g.fill(); g.restore();
  path(); g.fillStyle = rgb(col); g.fill();
  g.save(); path(); g.clip(); const gr = g.createLinearGradient(-rad, -rad, rad, rad); gr.addColorStop(0, `rgba(255,255,255,${rim})`); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.32)'); g.fillStyle = gr; g.fillRect(-rad * 2, -rad * 2, rad * 4, rad * 4);
  if (speck && r) for (let i = 0; i < speck.n; i++) { g.fillStyle = rgb(hex(speck.cols[(r() * speck.cols.length) | 0]), 0.35 + r() * 0.5); const s = speck.s * (0.5 + r()); g.fillRect((r() * 2 - 1) * rad, (r() * 2 - 1) * rad, s, s * (0.6 + r() * 0.8)); }
  g.restore();
}
const pick = (r, a) => a[(r() * a.length) | 0];
function scatter(g, seed, n, minR, maxR, fn, o = {}) { const r = rng(seed); const pw = o.pow || 2.2; for (let i = 0; i < n; i++) { const x = r() * TW, y = r() * TH, rad = minR + Math.pow(r(), pw) * (maxR - minR); wrap(g, x, y, rad * 1.6, (gg) => fn(gg, r, rad, x, y)); } }
function dots(g, seed, n, cols, s0, s1, a0 = 0.3, a1 = 0.8) { const r = rng(seed); for (let i = 0; i < n; i++) { g.fillStyle = rgb(hex(pick(r, cols)), a0 + r() * (a1 - a0)); const s = s0 + r() * (s1 - s0); g.fillRect(r() * TW, r() * TH, s, s * (0.6 + r() * 0.8)); } }
// hajszálrepedés / gyökér: tört vonal, ismételve
function strand(g, r, x, y, len, ang, wob, lw, col) { const n = Math.max(3, (len / 9) | 0); const pts = [[0, 0]]; let a = ang, px = 0, py = 0; for (let i = 0; i < n; i++) { a += (r() - 0.5) * wob; px += Math.cos(a) * len / n; py += Math.sin(a) * len / n; pts.push([px, py]); } wrap(g, x, y, len, (gg) => { gg.strokeStyle = col; gg.lineWidth = lw; gg.lineCap = 'round'; gg.lineJoin = 'round'; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); }); return pts; }

const P = {};
// ---------- termőtalaj (humuszos, morzsás, gyökerekkel)
P.topsoil = (g) => {
  base(g, 11, ['#241a12', '#33251a', '#3d2c1e', '#2b2017'], { fx: 6, fy: 5, grain: 16 });
  dots(g, 12, 5200, ['#1a120c', '#4a3626', '#5a4330', '#150f0a'], 1.5, 5, 0.25, 0.7);
  scatter(g, 13, 60, 3, 9, (gg, r, rad) => lit(gg, hex(pick(r, ['#8a8377', '#a39a88', '#6f685e'])), rad, () => roundBlob(gg, r, rad, 0.8), { shadow: 0.4 }));
  const r = rng(14); for (let i = 0; i < 150; i++) strand(g, r, r() * TW, r() * TH, 30 + r() * 90, 1.57 + (r() - 0.5) * 1.4, 0.9, 0.6 + r() * 1.3, rgb(hex(pick(r, ['#b79a6c', '#8f744c', '#d2bb8e'])), 0.55));
  finish(g, 15, { veil: 0.3, relief: 1.6, hf: 0.7 });
};
// ---------- kövér agyag: foltos szürkésbarna–sárgásbarna, sokszöges hasadozottság, fényes csúszási lapok, mészgöbecsek
P.clay = (g) => {
  base(g, 21, ['#6b5a45', '#7d6a50', '#8a7355', '#927856', '#7a6d58'], { fx: 3, fy: 3, grain: 7, warp: 0.05, tint: '#6f735f', tintAmt: 0.5 });
  // rozsdafoltok (vas-oxid) és szürke redukált erek
  const r = rng(22); g.save(); g.filter = 'blur(6px)';
  for (let i = 0; i < 90; i++) { const x = r() * TW, y = r() * TH, rad = 8 + r() * 26; wrap(g, x, y, rad * 2, (gg) => { gg.fillStyle = rgb(hex(pick(r, ['#a5672f', '#b0763a', '#8f5a2c'])), 0.16 + r() * 0.16); roundBlob(gg, r, rad, 0.6 + r() * 0.6); gg.fill(); }); }
  for (let i = 0; i < 26; i++) { strand(g, r, r() * TW, r() * TH, 80 + r() * 200, 1.57 + (r() - 0.5) * 1.2, 0.5, 5 + r() * 7, 'rgba(120,128,112,0.28)'); }
  g.restore();
  // tömbös-hasábos szerkezet: hasadékhálózat
  for (let i = 0; i < 150; i++) { const x = r() * TW, y = r() * TH, L = 50 + r() * 150, a = r() < 0.55 ? 1.57 + (r() - 0.5) * 0.5 : (r() - 0.5) * 0.6; const lw = 0.7 + r() * 1.2; const pts = strand(g, r, x, y, L, a, 0.55, lw + 1.4, 'rgba(255,240,215,0.06)'); wrap(g, x, y, L, (gg) => { gg.strokeStyle = 'rgba(38,28,20,0.5)'; gg.lineWidth = lw; gg.lineJoin = 'round'; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); }); }
  // fényes csúszási lapok
  for (let i = 0; i < 26; i++) { const x = r() * TW, y = r() * TH, L = 30 + r() * 60, a = -0.6 + r() * 0.5; wrap(g, x, y, L, (gg) => { gg.rotate(a); const gr = gg.createLinearGradient(0, -5, 0, 6); gr.addColorStop(0, 'rgba(255,250,235,0)'); gr.addColorStop(0.45, 'rgba(255,250,235,0.07)'); gr.addColorStop(1, 'rgba(0,0,0,0.05)'); gg.fillStyle = gr; gg.beginPath(); gg.ellipse(0, 0, L, 9 + r() * 8, 0, 0, 6.3); gg.fill(); }); }
  // mészgöbecsek
  scatter(g, 23, 30, 1.5, 5, (gg, rr, rad) => lit(gg, hex(pick(rr, ['#e6dcc6', '#d9cdb2', '#efe8d6'])), rad, () => roundBlob(gg, rr, rad, 0.85), { shadow: 0.35, rim: 0.3 }));
  dots(g, 24, 2600, ['#4a3c2e', '#a08a68', '#5b4d3c'], 1, 2.6, 0.15, 0.4);
  finish(g, 25, { veil: 0.3, relief: 1.5, hf: 0.45 });
};
// ---------- lösz: fakósárga, rétegzetlen, függőleges elválás, gyökércsatornák mészbevonattal, löszbabák, csigahéjak
P.loess = (g) => {
  base(g, 31, ['#c9ab74', '#d3b780', '#dbc18c', '#d6ba82', '#ccb07a'], { fx: 5, fy: 2, grain: 8, fx2: 14, fy2: 4 });
  const r = rng(32);
  // függőleges csíkosság (lefolyó csapadék, elválási lapok)
  g.save(); g.filter = 'blur(3px)'; for (let i = 0; i < 70; i++) { const x = r() * TW, y = r() * TH, L = 120 + r() * 420; strand(g, r, x, y, L, 1.57, 0.1, 4 + r() * 12, r() < 0.5 ? 'rgba(120,92,48,0.07)' : 'rgba(255,244,214,0.09)'); } g.restore();
  for (let i = 0; i < 9; i++) { const x = r() * TW, y = r() * TH; const L = 260 + r() * 420; const pts = strand(g, r, x, y, L, 1.57, 0.16, 1.1 + r() * 0.8, 'rgba(84,62,30,0.42)'); wrap(g, x + 1.6, y, L, (gg) => { gg.strokeStyle = 'rgba(255,246,220,0.22)'; gg.lineWidth = 1; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); }); }
  // gyökércsatornák: világos mészbevonat, sötét üreg
  for (let i = 0; i < 170; i++) { const x = r() * TW, y = r() * TH, L = 8 + Math.pow(r(), 2) * 80, a = 1.57 + (r() - 0.5) * 0.5, lw = 0.6 + r() * 1.1; const pts = strand(g, r, x, y, L, a, 0.5, lw + 2, 'rgba(244,236,214,0.4)'); wrap(g, x, y, L, (gg) => { gg.strokeStyle = 'rgba(84,62,34,0.6)'; gg.lineWidth = lw; gg.lineCap = 'round'; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); }); }
  // tűszúrásnyi pórusok
  for (let i = 0; i < 3400; i++) { const x = r() * TW, y = r() * TH, s = 0.5 + Math.pow(r(), 3) * 1.6; g.fillStyle = 'rgba(244,236,214,0.22)'; g.beginPath(); g.arc(x, y, s + 0.8, 0, 6.3); g.fill(); g.fillStyle = `rgba(86,64,34,${0.3 + r() * 0.35})`; g.beginPath(); g.arc(x, y, s, 0, 6.3); g.fill(); }
  // löszbabák (mészkonkréciók)
  scatter(g, 33, 9, 7, 18, (gg, rr, rad) => { lit(gg, hex(pick(rr, ['#e9dfc8', '#e2d6ba', '#efe7d2'])), rad, () => roundBlob(gg, rr, rad, 0.7 + rr() * 0.5), { shadow: 0.3, rim: 0.3, speck: { n: 14, cols: ['#c9b78f', '#f6f0e0'], s: 2 }, r: rr }); }, { pow: 1.4 });
  // csigahéjak
  for (let i = 0; i < 14; i++) { const x = r() * TW, y = r() * TH, s = 3 + r() * 3; wrap(g, x, y, s * 2, (gg) => { gg.rotate(r() * 6); gg.strokeStyle = 'rgba(250,246,236,0.9)'; gg.lineWidth = 1.4; gg.beginPath(); for (let t = 0; t < 9; t += 0.3) { const rr2 = s * t / 9; gg.lineTo(Math.cos(t) * rr2, Math.sin(t) * rr2); } gg.stroke(); }); }
  dots(g, 34, 1500, ['#f0e2bd', '#a88a54'], 1, 2.2, 0.15, 0.4);
  finish(g, 35, { veil: 0.35, relief: 1.3, hf: 0.35 });
};
// ---------- homok: finom szemcsék, halvány rétegzés, néhány kavics
P.sand = (g) => {
  base(g, 41, ['#b99a66', '#c7a871', '#d1b47e', '#c4a56f'], { fx: 3, fy: 9, grain: 22, fx2: 5, fy2: 22 });
  const r = rng(42); g.save(); g.filter = 'blur(1.5px)'; for (let i = 0; i < 46; i++) strand(g, r, r() * TW, r() * TH, 200 + r() * 500, (r() - 0.5) * 0.16, 0.06, 1 + r() * 3, r() < 0.5 ? 'rgba(110,80,40,0.16)' : 'rgba(255,240,205,0.16)'); g.restore();
  dots(g, 43, 16000, ['#8f744a', '#e6d2a4', '#6e5a3c', '#f3e6c4', '#a8a092'], 0.8, 2.2, 0.25, 0.7);
  scatter(g, 44, 34, 2.5, 8, (gg, rr, rad) => lit(gg, hex(pick(rr, ['#9a9388', '#c9bda6', '#7d766b', '#b08a6a'])), rad, () => roundBlob(gg, rr, rad, 0.75), { shadow: 0.35 }));
  finish(g, 45, { veil: 0.2, relief: 1.2, hf: 0.8 });
};
// ---------- homokos kavics: kopott, osztályozatlan kavicsok homok mátrixban
P.gravel = (g) => {
  base(g, 51, ['#8f7a58', '#a38b63', '#ad956c'], { fx: 5, fy: 4, grain: 20 });
  dots(g, 52, 9000, ['#6e5a3c', '#e6d2a4', '#a8a092'], 0.8, 2.4, 0.25, 0.7);
  const cols = ['#9a9388', '#b9b1a3', '#7d766b', '#c9bda6', '#a7896b', '#d8d2c6', '#8a6f58', '#6f6a64'];
  scatter(g, 53, 520, 4, 26, (gg, rr, rad) => lit(gg, hex(pick(rr, cols)), rad, () => roundBlob(gg, rr, rad, 0.6 + rr() * 0.3), { shadow: 0.45, rim: 0.28, speck: { n: 5, cols: ['#ffffff', '#55504a'], s: 1.6 }, r: rr }), { pow: 2.6 });
  finish(g, 55, { veil: 0.22, relief: 1.5, hf: 0.5 });
};
// ---------- szürke, iszapos-homokos teherbíró réteg (folyóvízi üledék)
P.silt = (g) => {
  base(g, 61, ['#77735f', '#868069', '#918a72', '#827c66'], { fx: 3, fy: 8, grain: 13, fx2: 4, fy2: 20 });
  const r = rng(62); g.save(); g.filter = 'blur(1.2px)'; for (let i = 0; i < 60; i++) strand(g, r, r() * TW, r() * TH, 250 + r() * 500, (r() - 0.5) * 0.1, 0.05, 1 + r() * 2.5, r() < 0.5 ? 'rgba(52,50,40,0.2)' : 'rgba(230,224,200,0.15)'); g.restore();
  g.save(); g.filter = 'blur(5px)'; for (let i = 0; i < 40; i++) { const x = r() * TW, y = r() * TH, rad = 8 + r() * 22; wrap(g, x, y, rad * 2, (gg) => { gg.fillStyle = 'rgba(160,104,52,0.16)'; roundBlob(gg, r, rad, 0.5); gg.fill(); }); } g.restore();
  dots(g, 63, 7000, ['#55523f', '#b3ad92', '#3f3d30'], 0.8, 2, 0.2, 0.5);
  finish(g, 65, { veil: 0.2, relief: 1.2, hf: 0.6 });
};
// ---------- termett (bolygatatlan) talaj: sárgásbarna homokos-iszapos agyag
P.natural = (g) => {
  base(g, 71, ['#7a6244', '#8a6f4c', '#967a54', '#86694a'], { fx: 3, fy: 5, grain: 12, warp: 0.03, tint: '#75705c', tintAmt: 0.3 });
  const r = rng(72); g.save(); g.filter = 'blur(2px)'; for (let i = 0; i < 30; i++) strand(g, r, r() * TW, r() * TH, 250 + r() * 500, (r() - 0.5) * 0.12, 0.06, 2 + r() * 5, r() < 0.5 ? 'rgba(60,44,26,0.14)' : 'rgba(230,205,160,0.12)'); g.restore();
  for (let i = 0; i < 26; i++) strand(g, r, r() * TW, r() * TH, 50 + r() * 120, 1.57 + (r() - 0.5) * 0.8, 0.5, 0.8 + r(), 'rgba(40,30,20,0.35)');
  dots(g, 73, 5000, ['#5b4832', '#b39a70', '#463726'], 0.8, 2.4, 0.2, 0.5);
  scatter(g, 74, 26, 2.5, 7, (gg, rr, rad) => lit(gg, hex(pick(rr, ['#b5ad9d', '#8c8478', '#d6ccb6'])), rad, () => roundBlob(gg, rr, rad, 0.8), { shadow: 0.35 }));
  finish(g, 75, { veil: 0.25, relief: 1.3, hf: 0.6 });
};
// ---------- tőzeg: sötétbarna–fekete, vízszintesen szálas-rostos, nád- és sásmaradványok, fadarabok
function peat(g, dry) {
  base(g, 81, dry ? ['#4a3523', '#5a412a', '#6a4c30', '#523a26'] : ['#1c130d', '#291b11', '#382414', '#23170f'], { fx: 4, fy: 9, grain: 9, fx2: 6, fy2: 26, tint: dry ? '#7a5a34' : '#4a2a14', tintAmt: 0.5 });
  const r = rng(82);
  // amorf, fekete (erősen lebomlott) lencsék
  g.save(); g.filter = 'blur(7px)'; for (let i = 0; i < 28; i++) { const x = r() * TW, y = r() * TH, rad = 30 + r() * 70; wrap(g, x, y, rad * 2, (gg) => { gg.fillStyle = dry ? 'rgba(40,26,14,0.3)' : 'rgba(8,5,3,0.42)'; gg.scale(1, 0.28); roundBlob(gg, r, rad); gg.fill(); }); } g.restore();
  // rostok: sok vékony, hullámos, közel vízszintes szál
  const fc = dry ? ['#b08a54', '#96703f', '#c9a56c', '#7a5830'] : ['#7a5630', '#5e3f22', '#93703f', '#a67c45', '#40291a'];
  for (let i = 0; i < 4200; i++) { const L = 14 + Math.pow(r(), 2) * 150; strand(g, r, r() * TW, r() * TH, L, (r() - 0.5) * 0.5, 0.55, 0.5 + r() * 1.3, rgb(hex(pick(r, fc)), 0.2 + r() * 0.4)); }
  // nád- és sásszárak: lapított, világos, hosszanti erezettel
  for (let i = 0; i < 26; i++) { const x = r() * TW, y = r() * TH, L = 24 + r() * 80, wd = 2 + r() * 4, a = (r() - 0.5) * 0.5; const c = hex(pick(r, dry ? ['#c8ab72', '#b89658'] : ['#a3824a', '#8c6c3a', '#b89a5e'])); wrap(g, x, y, L, (gg) => { gg.rotate(a); gg.fillStyle = 'rgba(0,0,0,0.35)'; gg.fillRect(-L / 2 + 1, -wd / 2 + 2, L, wd); gg.fillStyle = rgb(c, 0.6); gg.fillRect(-L / 2, -wd / 2, L, wd); gg.strokeStyle = rgb(shade(c, 0.6), 0.7); gg.lineWidth = 0.7; for (let k = 1; k < 3; k++) { gg.beginPath(); gg.moveTo(-L / 2, -wd / 2 + wd * k / 3); gg.lineTo(L / 2, -wd / 2 + wd * k / 3); gg.stroke(); } gg.fillStyle = rgb(shade(c, 0.5), 0.8); gg.fillRect(-L / 2 + L * r(), -wd / 2, 1.6, wd); }); }
  // fadarabok, ágak
  scatter(g, 83, 13, 12, 40, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 0.7); const c = hex(pick(rr, ['#6a3d20', '#7c4a26', '#55301a'])); lit(gg, c, rad, () => { gg.beginPath(); gg.ellipse(0, 0, rad, rad * (0.2 + rr() * 0.14), 0, 0, 6.3); }, { shadow: 0.5, rim: 0.22 }); gg.save(); gg.beginPath(); gg.ellipse(0, 0, rad, rad * 0.26, 0, 0, 6.3); gg.clip(); gg.strokeStyle = rgb(shade(c, 0.6), 0.7); gg.lineWidth = 0.9; for (let k = -4; k <= 4; k++) { gg.beginPath(); gg.moveTo(-rad, k * rad * 0.06); gg.quadraticCurveTo(0, k * rad * 0.06 + (rr() - 0.5) * 4, rad, k * rad * 0.06); gg.stroke(); } gg.restore(); }, { pow: 1.6 });
  if (!dry) { for (let i = 0; i < 520; i++) { g.fillStyle = `rgba(210,225,235,${0.1 + r() * 0.22})`; g.fillRect(r() * TW, r() * TH, 1 + r() * 2.4, 1); } }
  else { for (let i = 0; i < 16; i++) { const x = r() * TW, y = r() * TH, L = 160 + r() * 380; strand(g, r, x, y, L, 1.57, 0.3, 1.6 + r() * 2.6, 'rgba(20,12,6,0.75)'); } }
  dots(g, 84, 2600, dry ? ['#3a2817', '#c0a070'] : ['#0e0906', '#6a4a2a'], 0.8, 2.2, 0.2, 0.5);
  finish(g, 85, { veil: 0.4, relief: 2.2, hf: 0.35, lum: 1.6 });
}
P.peat = (g) => peat(g, false);
P.peatdry = (g) => peat(g, true);
// ---------- szerves iszap / tavi üledék (szürkésfekete, finom rétegzés, kagylóhéj-törmelék)
P.gyttja = (g) => {
  base(g, 91, ['#3c3a33', '#4a473e', '#56524a', '#434038'], { fx: 3, fy: 10, grain: 8, fx2: 4, fy2: 24, tint: '#5a5d4a', tintAmt: 0.4 });
  const r = rng(92); g.save(); g.filter = 'blur(1px)'; for (let i = 0; i < 90; i++) strand(g, r, r() * TW, r() * TH, 300 + r() * 500, (r() - 0.5) * 0.06, 0.04, 0.8 + r() * 2, r() < 0.55 ? 'rgba(18,17,13,0.3)' : 'rgba(190,186,165,0.14)'); g.restore();
  for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(232,228,214,${0.4 + r() * 0.4})`; g.lineWidth = 1; const x = r() * TW, y = r() * TH, s = 2 + r() * 3; g.beginPath(); g.arc(x, y, s, r() * 6, r() * 6 + 2); g.stroke(); }
  for (let i = 0; i < 300; i++) strand(g, r, r() * TW, r() * TH, 10 + r() * 40, (r() - 0.5) * 0.6, 0.6, 0.6 + r() * 0.8, 'rgba(110,84,50,0.35)');
  finish(g, 95, { veil: 0.3, relief: 1.6, hf: 0.4, lum: 1.3 });
};
// ---------- feltöltések
function brick(gg, r, L) { const H = L * (0.26 + r() * 0.06), c = hex(pick(r, ['#96503a', '#a35a40', '#874636', '#a9684c', '#7c4030', '#8f5a48'])); const rs = rng((r() * 1e9) | 0);
  // a körvonal egyszer rögzítve (ne változzon a kitöltés és a vágás között)
  const pts = []; { const j = () => (rs() - 0.5) * L * 0.05; const brk = rs() < 0.45 ? L * (0.15 + rs() * 0.3) : 0; pts.push([-L / 2 + j(), -H / 2 + j()], [L / 2 - brk + j(), -H / 2 + j()]); if (brk) pts.push([L / 2 - brk * 0.4, j()]); pts.push([L / 2 - (brk ? brk * 0.9 : 0) + j(), H / 2 + j()], [-L / 2 + j(), H / 2 + j()]); }
  const pp = () => { gg.beginPath(); pts.forEach((p, i) => i ? gg.lineTo(p[0], p[1]) : gg.moveTo(p[0], p[1])); gg.closePath(); };
  lit(gg, c, L / 2, pp, { shadow: 0.5, rim: 0.2, speck: { n: 22, cols: ['#7a3524', '#d08a60', '#5a2a1c'], s: 2 }, r });
  if (r() < 0.6) { gg.save(); pp(); gg.clip(); gg.fillStyle = 'rgba(214,208,194,0.8)'; const s = r() < 0.5 ? -1 : 1; gg.fillRect(-L / 2, s * H / 2 - (s > 0 ? H * 0.22 : 0), L * (0.4 + r() * 0.6), H * 0.22); gg.restore(); }
}
function concrete(gg, r, rad) { const sd = (r() * 1e9) | 0; const pp = () => blobPath(gg, rng(sd), rad, 6 + ((sd % 3)), 0.3, 0.6 + (sd % 7) / 14); lit(gg, hex(pick(r, ['#a9a79f', '#b8b5ab', '#98968f'])), rad, pp, { shadow: 0.5, rim: 0.25 }); gg.save(); pp(); gg.clip(); const cs = ['#7d776c', '#c9c2b2', '#8f8375', '#5f5a54', '#d6d0c4']; for (let i = 0; i < rad * 1.2; i++) { gg.fillStyle = rgb(hex(pick(r, cs)), 0.8); gg.beginPath(); gg.ellipse((r() * 2 - 1) * rad, (r() * 2 - 1) * rad, 1.5 + r() * rad * 0.09, 1.2 + r() * rad * 0.07, r() * 3, 0, 6.3); gg.fill(); } gg.restore(); }
function tipLines(g, seed, n, col) { const r = rng(seed); g.save(); g.filter = 'blur(2.5px)'; for (let i = 0; i < n; i++) strand(g, r, r() * TW, r() * TH, 300 + r() * 500, 0.18 + (r() - 0.5) * 0.16, 0.08, 3 + r() * 9, col(r)); g.restore(); }
// épülettörmelék
P.rubble = (g) => {
  base(g, 101, ['#6f6355', '#7f7262', '#8d806e', '#776b5c'], { fx: 5, fy: 5, grain: 18, tint: '#9a5a3c', tintAmt: 0.25 });
  tipLines(g, 102, 14, (r) => r() < 0.5 ? 'rgba(40,32,26,0.2)' : 'rgba(214,204,186,0.16)');
  dots(g, 103, 7000, ['#4a4038', '#c9c2b2', '#a6553a', '#d9d4c8'], 1, 3.4, 0.25, 0.7);
  const r = rng(104); for (let i = 0; i < 38; i++) { const x = r() * TW, y = r() * TH, rad = 5 + r() * 12; wrap(g, x, y, rad * 2, (gg) => { gg.fillStyle = 'rgba(14,10,8,0.6)'; blobPath(gg, r, rad, 7, 0.4, 0.5); gg.fill(); }); }
  scatter(g, 105, 150, 4, 12, (gg, rr, rad) => { gg.rotate(rr() * 6.3); lit(gg, hex(pick(rr, ['#96503a', '#a35a40', '#c9c2b2', '#d9d4c8', '#8f8a80', '#9c6248'])), rad, (() => { const sd = (rr() * 1e9) | 0; return () => blobPath(gg, rng(sd), rad, 5 + sd % 3, 0.35, 0.7); })(), { shadow: 0.45 }); });
  scatter(g, 106, 30, 26, 60, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 1.2 + 0.2); concrete(gg, rr, rad); }, { pow: 2 });
  scatter(g, 107, 74, 40, 64, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 1.1 + 0.2); brick(gg, rr, rad); }, { pow: 1 });
  // tetőcserép-szilánkok, vakolat, betonvas
  scatter(g, 108, 22, 16, 34, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 1.4); const c = hex(pick(rr, ['#b8623c', '#a35434'])); lit(gg, c, rad, () => { gg.beginPath(); gg.moveTo(-rad, -2); gg.quadraticCurveTo(0, -rad * 0.22, rad, -1); gg.lineTo(rad * 0.9, 4); gg.quadraticCurveTo(0, -rad * 0.22 + 6, -rad * 0.92, 4); gg.closePath(); }, { shadow: 0.5 }); });
  for (let i = 0; i < 5; i++) { const x = r() * TW, y = r() * TH, L = 90 + r() * 120; const pts = strand(g, r, x + 2, y + 3, L, 0.3 + (r() - 0.5), 0.25, 4, 'rgba(0,0,0,0.4)'); wrap(g, x, y, L, (gg) => { gg.lineCap = 'round'; gg.lineJoin = 'round'; gg.strokeStyle = '#5a3a2a'; gg.lineWidth = 3.4; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); gg.strokeStyle = 'rgba(190,120,80,0.6)'; gg.lineWidth = 1; gg.stroke(); }); }
  finish(g, 109, { veil: 0.5, relief: 1.5, hf: 0.6 });
};
// salak és hamu
P.slag = (g) => {
  base(g, 111, ['#262524', '#33312f', '#45423f', '#2d2b2a'], { fx: 5, fy: 6, grain: 16, tint: '#5a4038', tintAmt: 0.35 });
  const r = rng(112);
  // világosszürke hamulencsék
  g.save(); g.filter = 'blur(4px)'; for (let i = 0; i < 16; i++) { const x = r() * TW, y = r() * TH, rad = 90 + r() * 220; wrap(g, x, y, rad * 2, (gg) => { gg.rotate(0.15 + (r() - 0.5) * 0.1); gg.scale(1, 0.04 + r() * 0.05); gg.fillStyle = rgb(hex(pick(r, ['#a8a399', '#948e84', '#bdb7ab'])), 0.5); roundBlob(gg, r, rad); gg.fill(); }); } g.restore();
  tipLines(g, 113, 10, (rr) => rr() < 0.5 ? 'rgba(8,8,8,0.3)' : 'rgba(190,150,110,0.14)');
  dots(g, 114, 9000, ['#0e0e0e', '#8a8680', '#c9c4ba', '#6a3a2a', '#55524e'], 1, 3.2, 0.3, 0.8);
  // porózus salakrögök (klinker)
  scatter(g, 115, 150, 7, 34, (gg, rr, rad) => { const sd = (rr() * 1e9) | 0; const pp = () => blobPath(gg, rng(sd), rad, 9, 0.4, 0.8); const c = hex(pick(rr, ['#3a3836', '#4a4644', '#2a2928', '#4d3a36', '#5a5552'])); lit(gg, c, rad, pp, { shadow: 0.55, rim: 0.22 }); gg.save(); pp(); gg.clip(); for (let i = 0; i < rad * 1.4; i++) { const s = 0.8 + rr() * rad * 0.1; const px = (rr() * 2 - 1) * rad, py = (rr() * 2 - 1) * rad; gg.fillStyle = 'rgba(0,0,0,0.6)'; gg.beginPath(); gg.arc(px, py, s, 0, 6.3); gg.fill(); gg.fillStyle = 'rgba(255,255,255,0.14)'; gg.beginPath(); gg.arc(px + s * 0.5, py + s * 0.5, s * 0.6, 0, 6.3); gg.fill(); } if (rr() < 0.35) { gg.fillStyle = 'rgba(150,70,40,0.35)'; gg.fillRect(-rad, -rad, rad * 2, rad * 2); } gg.restore(); }, { pow: 2 });
  // fényes széndarabok, égett tégla
  scatter(g, 116, 46, 4, 11, (gg, rr, rad) => { const sd = (rr() * 1e9) | 0; lit(gg, [14, 14, 16], rad, () => blobPath(gg, rng(sd), rad, 5, 0.3, 0.8), { shadow: 0.4, rim: 0.55 }); });
  scatter(g, 117, 16, 16, 28, (gg, rr, rad) => { gg.rotate(rr() * 3); brick(gg, rr, rad); });
  finish(g, 119, { veil: 0.4, relief: 1.8, hf: 0.7, lum: 1.4 });
};
// házi szemét: sötét, lebomló mátrix, préselt fóliák, üveg, konzervdoboz, papír, textil, fa
P.waste = (g) => {
  base(g, 121, ['#1f1a15', '#2b241c', '#3a3024', '#262019'], { fx: 5, fy: 8, grain: 14, fx2: 6, fy2: 20, tint: '#3f4a30', tintAmt: 0.3 });
  const r = rng(122);
  tipLines(g, 123, 16, (rr) => rr() < 0.6 ? 'rgba(6,5,4,0.35)' : 'rgba(150,130,100,0.14)');
  dots(g, 124, 7000, ['#0c0a08', '#5a4a36', '#8a7a60', '#6a6a5a'], 1, 3, 0.25, 0.7);
  // préselt fóliák, zacskók: vékony, gyűrött sávok, fakult színekkel
  const fcol = ['#d8d6cf', '#c9d3d8', '#8fa9bf', '#b9c7a8', '#d6c98f', '#c79a8f', '#e8e6e0', '#7f93a8', '#9a9a9a', '#3d5f8a', '#b04a3a'];
  for (let i = 0; i < 170; i++) { const x = r() * TW, y = r() * TH, L = 14 + Math.pow(r(), 2) * 90, a = 0.16 + (r() - 0.5) * 0.7, lw = 1.2 + r() * 3.2; const c = hex(pick(r, fcol)); const pts = strand(g, r, x + 1, y + 2.5, L, a, 0.8, lw, 'rgba(0,0,0,0.4)'); wrap(g, x, y, L, (gg) => { gg.lineCap = 'butt'; gg.lineJoin = 'round'; gg.strokeStyle = rgb(mix(c, [70, 60, 48], 0.35), 0.75); gg.lineWidth = lw; gg.beginPath(); gg.moveTo(0, 0); for (const p of pts) gg.lineTo(p[0], p[1]); gg.stroke(); gg.strokeStyle = 'rgba(255,255,255,0.16)'; gg.lineWidth = Math.max(0.6, lw * 0.25); gg.stroke(); }); }
  // papír- és kartonrétegek
  for (let i = 0; i < 26; i++) { const x = r() * TW, y = r() * TH, L = 40 + r() * 90, a = 0.14 + (r() - 0.5) * 0.4; wrap(g, x, y, L, (gg) => { gg.rotate(a); for (let k = 0; k < 3 + r() * 4; k++) { gg.fillStyle = rgb(hex(pick(r, ['#b5a688', '#cfc3a6', '#9c8a68', '#d9d2bf'])), 0.85); gg.fillRect(-L / 2 + r() * 8, k * 3.2, L - r() * 14, 2.2); } }); }
  // fadarabok
  scatter(g, 125, 14, 16, 40, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 0.9 + 0.15); lit(gg, hex(pick(rr, ['#7a5a36', '#8f6c44', '#5f4428'])), rad, () => { gg.beginPath(); gg.rect(-rad, -rad * 0.14, rad * 2, rad * 0.28); }, { shadow: 0.5 }); gg.strokeStyle = 'rgba(40,26,14,0.5)'; gg.lineWidth = 0.8; for (let k = -1; k <= 1; k++) { gg.beginPath(); gg.moveTo(-rad, k * rad * 0.07); gg.lineTo(rad, k * rad * 0.07 + (rr() - 0.5) * 2); gg.stroke(); } });
  // konzervdobozok (lapított, rozsdás)
  scatter(g, 126, 20, 14, 22, (gg, rr, rad) => { gg.rotate((rr() - 0.5) * 1.2); const c = hex(pick(rr, ['#8a8d90', '#9a9c9e', '#7a6a5a'])); lit(gg, c, rad, () => { gg.beginPath(); gg.ellipse(0, 0, rad, rad * 0.42, 0, 0, 6.3); }, { shadow: 0.55, rim: 0.4 }); gg.save(); gg.beginPath(); gg.ellipse(0, 0, rad, rad * 0.42, 0, 0, 6.3); gg.clip(); gg.strokeStyle = 'rgba(40,40,44,0.5)'; gg.lineWidth = 1; for (let k = -3; k <= 3; k++) { gg.beginPath(); gg.moveTo(k * rad * 0.26, -rad); gg.lineTo(k * rad * 0.26, rad); gg.stroke(); } gg.fillStyle = 'rgba(150,74,36,0.55)'; for (let k = 0; k < 4; k++) { gg.beginPath(); gg.arc((rr() * 2 - 1) * rad, (rr() - 0.5) * rad * 0.6, 2 + rr() * rad * 0.3, 0, 6.3); gg.fill(); } gg.restore(); });
  // üvegcserepek és palackok
  scatter(g, 127, 34, 6, 18, (gg, rr, rad) => { gg.rotate(rr() * 6.3); const c = hex(pick(rr, ['#4f7a52', '#6d5a2c', '#9fc0b8', '#c9dcd8'])); const sd = (rr() * 1e9) | 0; const pp = () => blobPath(gg, rng(sd), rad, 4 + sd % 2, 0.3, 0.55); gg.save(); gg.translate(1.5, 2); pp(); gg.fillStyle = 'rgba(0,0,0,0.4)'; gg.fill(); gg.restore(); pp(); gg.fillStyle = rgb(c, 0.6); gg.fill(); gg.strokeStyle = 'rgba(240,255,250,0.75)'; gg.lineWidth = 1; gg.stroke(); gg.fillStyle = 'rgba(255,255,255,0.4)'; gg.fillRect(-rad * 0.4, -rad * 0.2, rad * 0.5, 1.4); });
  // textil
  for (let i = 0; i < 12; i++) { const x = r() * TW, y = r() * TH, rad = 14 + r() * 22; const c = hex(pick(r, ['#5a6a8a', '#8a5a5a', '#6a7a5a', '#a8a090'])); wrap(g, x, y, rad * 2, (gg) => { gg.rotate(0.2 + (r() - 0.5)); gg.scale(1, 0.3); gg.fillStyle = 'rgba(0,0,0,0.4)'; roundBlob(gg, r, rad * 1.05); gg.fill(); gg.fillStyle = rgb(c, 0.85); roundBlob(gg, r, rad); gg.fill(); gg.strokeStyle = rgb(shade(c, 0.6), 0.6); gg.lineWidth = 2; for (let k = -2; k <= 2; k++) { gg.beginPath(); gg.moveTo(-rad * 0.7, k * rad * 0.3); gg.quadraticCurveTo(0, k * rad * 0.3 + rad * 0.2, rad * 0.7, k * rad * 0.3); gg.stroke(); } }); }
  finish(g, 129, { veil: 0.6, relief: 1.8, hf: 0.6, lum: 1.4 });
};
// vegyes föld-feltöltés (kiemelt, visszatöltött talaj rögökkel, kevés törmelékkel)
P.mixed = (g) => {
  base(g, 131, ['#5f4d38', '#705b41', '#80694a', '#66533c'], { fx: 6, fy: 6, grain: 16, tint: '#8a7a5a', tintAmt: 0.4 });
  tipLines(g, 132, 12, (rr) => rr() < 0.5 ? 'rgba(30,22,14,0.22)' : 'rgba(210,190,150,0.14)');
  dots(g, 133, 8000, ['#3a2e20', '#a8946c', '#2a2016', '#c9b68e'], 1, 3.4, 0.25, 0.7);
  scatter(g, 134, 120, 8, 30, (gg, rr, rad) => { const sd = (rr() * 1e9) | 0; lit(gg, hex(pick(rr, ['#7a6648', '#8c7654', '#5e4c36', '#93806a', '#6f6a58'])), rad, () => blobPath(gg, rng(sd), rad, 8, 0.3, 0.75), { shadow: 0.4, rim: 0.14, speck: { n: 8, cols: ['#3a2e20', '#c9b68e'], s: 2 }, r: rr }); }, { pow: 2 });
  scatter(g, 135, 60, 3, 10, (gg, rr, rad) => lit(gg, hex(pick(rr, ['#a9a79f', '#c9bda6', '#7d766b'])), rad, () => roundBlob(gg, rr, rad, 0.8), { shadow: 0.4 }));
  scatter(g, 136, 10, 16, 26, (gg, rr, rad) => { gg.rotate(rr() * 3); brick(gg, rr, rad); });
  finish(g, 139, { veil: 0.4, relief: 1.5, hf: 0.7 });
};

// ---------- gyep felülnézetben (üde és kiszáradt)
function grass(g, dry) {
  base(g, dry ? 151 : 141, dry ? ['#8a7f4a', '#9c9058', '#aea066', '#93874f'] : ['#3f5a26', '#4c6b2c', '#5a7a34', '#476429'], { fx: 5, fy: 4, grain: 14, tint: dry ? '#7a5f3a' : '#6d7a36', tintAmt: 0.45 });
  const r = rng(dry ? 152 : 142); const cols = dry ? ['#c9bb7c', '#a89858', '#d8cc94', '#7f7440', '#8f6f44'] : ['#6f9440', '#3a5422', '#86a84e', '#55742f', '#a3b860', '#2f451c'];
  for (let i = 0; i < 9000; i++) { const x = r() * TW, y = r() * TH, L = 4 + r() * 9, a = -1.57 + (r() - 0.5) * 1.6; g.strokeStyle = rgb(hex(pick(r, cols)), 0.35 + r() * 0.5); g.lineWidth = 0.7 + r() * 0.9; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + (r() - 0.5) * 3, y + Math.sin(a) * L * 0.5, x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  g.save(); g.filter = 'blur(5px)'; for (let i = 0; i < 26; i++) { const x = r() * TW, y = r() * TH, rad = 16 + r() * 44; wrap(g, x, y, rad * 2, (gg) => { gg.fillStyle = dry ? 'rgba(110,84,52,0.3)' : 'rgba(40,58,22,0.3)'; roundBlob(gg, r, rad, 0.7); gg.fill(); }); } g.restore();
  if (!dry) dots(g, 143, 260, ['#f2f0e2', '#e8d85a'], 1.4, 2.6, 0.5, 0.9);
  finish(g, dry ? 155 : 145, { veil: 0.2, relief: 1.6, hf: 0.7 });
}
P.grass = (g) => grass(g, false);
P.grassdry = (g) => grass(g, true);

export const SOIL_KINDS = Object.keys(P);
export function soilCanvas(kind) {
  if (cache[kind]) return cache[kind];
  const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d', { willReadFrequently: false }); (P[kind] || P.natural)(g); cache[kind] = c; return c;
}
// minta egy 2D-vászonhoz; ppm = a célvászon képpont/méter léptéke (a csempe 256 px/m), ox/oy = eltolás képpontban
export function soilPattern(g, kind, ppm = 256, ox = 0, oy = 0) { const p = g.createPattern(soilCanvas(kind), 'repeat'); const k = ppm / 256; p.setTransform(new DOMMatrix([k, 0, 0, k, ox, oy])); return p; }
// kitöltés: az aktuális útvonalat (vagy téglalapot) talajjal tölti
export function soilFill(g, kind, ppm, x, y, w, h, ox = 0, oy = 0) { g.save(); g.fillStyle = soilPattern(g, kind, ppm, ox, oy); if (w !== undefined) g.fillRect(x, y, w, h); else g.fill(); g.restore(); }
// kicsinyített, ismételhető csempe data-URL-ként (SVG-mintákhoz, CSS-háttérhez)
const urls = {};
export function soilURL(kind, w = 512, h = 384, q = 0.82) { const key = kind + w; if (urls[key]) return urls[key]; const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(soilCanvas(kind), 0, 0, w, h); return (urls[key] = c.toDataURL('image/jpeg', q)); }
// repedezett, kiszáradt agyagfelszín felülnézetben (sokszöges száradási repedések) – k = 0…1 a kiszáradás mértéke
export function crackedTop(g, w, h, k, seed = 5, cell = 60) {
  const r = rng(seed); const cols = Math.ceil(w / cell) + 2, rows = Math.ceil(h / cell) + 2; const pt = [];
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) pt.push([(i - 0.5 + 0.15 + r() * 0.7) * cell, (j - 0.5 + 0.15 + r() * 0.7) * cell]);
  const P2 = (i, j) => pt[j * cols + i]; g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  const seg = (a, b, lw) => { const mx = (a[0] + b[0]) / 2 + (r() - 0.5) * cell * 0.22, my = (a[1] + b[1]) / 2 + (r() - 0.5) * cell * 0.22; g.lineWidth = lw; g.beginPath(); g.moveTo(a[0], a[1]); g.quadraticCurveTo(mx, my, b[0], b[1]); g.stroke(); };
  for (let pass = 0; pass < 2; pass++) { const rr = rng(seed + 3); g.strokeStyle = pass ? `rgba(22,15,9,${0.35 + 0.6 * k})` : `rgba(255,240,205,${0.25 * k})`; for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) { const lw = (0.6 + rr() * 2.2) * (0.3 + k * 1.3) * cell / 60 + (pass ? 0 : 2.4); if (rr() < 0.9) seg(P2(i, j), P2(i + 1, j + (rr() < 0.3 ? 1 : 0)), lw); if (rr() < 0.9) seg(P2(i, j), P2(i, j + 1), lw); } }
  g.restore();
}
