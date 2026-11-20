# 4. videó, ÚJ bevezető (0–13 s): a Holme Fen-oszlop és a „> 4 m” teljesen kikerül (a felhasználó kérése).
# Helyette: mi a tőzeg, és miért nyomódik össze – tőzegminta, amelynek a térfogata nagyrészt víz; teher alatt a víz
# kiszorul, a minta szivacsként összenyomódik. A háttér a tőzegszelvény marad (oszlop és süllyedő felszín nélkül).
# A v4_bevezeto.py UTÁN futtatandó: python3 v4_bevezeto2.py <4. videó html> hu|en
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n, c=1):
    global s
    assert s.count(o) == c, (o[:90], s.count(o)); s = s.replace(o, n)
HU = lang == 'hu'
T = dict(samp='T\\u0150ZEGMINTA', water='V\\xCDZ', solid='SZIL\\xC1RD R\\xC9SZ', wp='kb. 90 %', sp='kb. 10 %', load='TEHER', orig='eredeti magass\\xE1g',
         out='a v\\xEDz kiszorul', big='\\xDAgy viselkedik, mint a szivacs') if HU else dict(samp='PEAT SAMPLE', water='WATER', solid='SOLIDS', wp='about 90%', sp='about 10%',
         load='LOAD', orig='original height', out='water is squeezed out', big='It behaves like a sponge')
rep('    group.add(post);', '    post.visible = false;   // az új bevezetőben nincs oszlop\n    group.add(post);')
rep('  var fenDrop = (t) => 4 * (1 - Math.pow(1 - seg(t, 2.6, 10.6), 1.8));', '  var fenDrop = (t) => 0;   // a felszín nem süllyed (az új bevezető a tőzegmintát mutatja)')
rep('R.fen.update(SU.uFen.value, smooth(seg(t, 3, 4.2)));', 'R.fen.update(SU.uFen.value, 0);')
rep('float post = step(abs(xf), 0.16);', 'float post = 0.0;   // nincs oszlop a metszetben sem')
INTRO = '''  function introPeat(O, t) {   // tőzegminta: nagyrészt víz; teher alatt a víz kiszorul, a minta összenyomódik
    const a = win(t, 0.8, 12.8, 0.6, 0.5); if (a <= 0) return;
    const g = O.g, X = 1150, Y = 150, W = 640, H = 640, sx = X + 70, sw = 250, base = Y + H - 70, H0 = 380;
    const k = smooth(seg(t, 6.6, 9.8)), hh = H0 * (1 - 0.3 * k), top = base - hh;
    g.save(); g.globalAlpha = a * 0.9; g.fillStyle = "rgba(8,10,12,0.82)"; O.rr(X, Y, W, H, 18); g.fill(); g.globalAlpha = a;
    O.font(26, 700, FH); g.fillStyle = C.accent; g.textAlign = "left"; g.fillText("@samp@", X + 40, Y + 52);
    g.fillStyle = "#4a2f1c"; g.fillRect(sx, top, sw, hh);
    let r = 7; const rnd = () => (r = (r * 16807) % 2147483647) / 2147483647;
    g.save(); g.beginPath(); g.rect(sx, top, sw, hh); g.clip(); g.lineWidth = 2;
    for (let i = 0; i < 150; i++) { const x = sx + rnd() * sw, y = top + rnd() * hh, l = 14 + rnd() * 34, an = (rnd() - 0.5) * 0.9;
      g.strokeStyle = rnd() > 0.5 ? "rgba(214,160,92,0.75)" : "rgba(120,78,40,0.9)"; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(an) * l, y + Math.sin(an) * l * (1 - 0.3 * k)); g.stroke(); }
    const wA = 0.42 * (1 - 0.75 * k) * clamp2((t - 1.6) / 1.2);
    g.fillStyle = `rgba(90,170,235,${wA})`; g.fillRect(sx, top, sw, hh); g.restore();
    g.strokeStyle = "rgba(255,255,255,0.55)"; g.lineWidth = 2; g.strokeRect(sx, top, sw, hh);
    g.fillStyle = "#3a3f44"; g.fillRect(sx - 14, base, sw + 28, 12);
    const ba = clamp2((t - 2.2) / 0.8) * (1 - smooth(seg(t, 5.6, 6.4)));   // összetétel-sáv: víz / szilárd rész
    if (ba > 0) { const bx = sx + sw + 70, bw = 46; g.globalAlpha = a * ba;
      g.fillStyle = C.water; g.fillRect(bx, base - H0, bw, H0 * 0.9); g.fillStyle = "#b9834a"; g.fillRect(bx, base - H0 * 0.1, bw, H0 * 0.1);
      O.font(30, 800, FH); g.fillStyle = C.white; g.fillText("@water@", bx + bw + 18, base - H0 * 0.6); g.fillText("@solid@", bx + bw + 18, base - H0 * 0.1 + 8);
      O.font(24, 500, FB); g.fillStyle = C.dim; g.fillText("@wp@", bx + bw + 18, base - H0 * 0.6 + 32); g.fillText("@sp@", bx + bw + 18, base - H0 * 0.1 + 40); g.globalAlpha = a; }
    const la = smooth(seg(t, 5.8, 6.6));   // teher
    if (la > 0) { const ly = top - 74 - (1 - la) * 60; g.globalAlpha = a * la; g.fillStyle = "#8d9399"; g.fillRect(sx + 20, ly, sw - 40, 60);
      O.font(26, 800, FH); g.fillStyle = "#14181b"; g.textAlign = "center"; g.fillText("@load@", sx + sw / 2, ly + 40); g.textAlign = "left"; g.globalAlpha = a;
      O.arrow(sx + sw / 2, ly - 70, sx + sw / 2, ly - 8, a * la, C.accent, 9, 26); }
    if (k > 0.02) { g.globalAlpha = a * k; g.setLineDash([10, 8]); g.strokeStyle = C.accent; g.lineWidth = 3; g.beginPath(); g.moveTo(sx - 20, base - H0); g.lineTo(sx + sw + 190, base - H0); g.stroke(); g.setLineDash([]);
      O.font(24, 500, FB); g.fillStyle = C.accent; g.fillText("@orig@", sx + sw + 24, base - H0 - 12);
      const ph = (t * 1.3) % 1; [-1, 1].forEach((d) => [0.35, 0.6, 0.85].forEach((u, i) => { const y = top + hh * u, x0 = d < 0 ? sx - 6 : sx + sw + 6, q = (ph + i * 0.33) % 1;
        O.arrow(x0 + d * q * 26, y, x0 + d * (q * 26 + 44), y + 10, a * k * Math.sin(q * Math.PI), C.water, 6, 16); }));
      g.globalAlpha = a * k; O.font(24, 600, FB); g.fillStyle = C.water; g.fillText("@out@", sx + sw + 70, top + hh * 0.62); }
    g.restore();
    O.bigLine("@big@", t - 10.8, win(t, 10.8, 13, 0.4, 0.4), 930, 80, C.white, { under: C.accent });
  }
'''
for k_, v in T.items(): INTRO = INTRO.replace('@%s@' % k_, v)
rep('  function drawOverlay(O, t, ctx) {', INTRO + '  function drawOverlay(O, t, ctx) {')
rep('    if (t < 20.2) {\n      const drop = SU2.uFen.value;', '    if (t < 20.2) introPeat(O, t);\n    if (false) {\n      const drop = SU2.uFen.value;', 1 if s.count('    if (t < 20.2) {\n      const drop = SU2.uFen.value;') == 1 else 2)
if HU:
    rep('[0.5, 5.3, "Holme Fen, Anglia \\xB7 1851", ["A l\\xE1pot *lecsapolj\\xE1k*.", "Vasoszlopot vernek a t\\u0151zegbe: a teteje a *felsz\\xEDnen* van"]],',
        '[0.6, 5.4, "Mi a t\\u0151zeg?", ["Elhalt n\\xF6v\\xE9nyek *rostos* marad\\xE9ka,", "a t\\xE9rfogat\\xE1nak nagy r\\xE9sze *v\\xEDz*"]],')
    rep('[5.6, 10.5, "A lecsapol\\xE1s \\xF3ta", ["A t\\u0151zeg kisz\\xE1rad \\xE9s lebomlik:", "a felsz\\xEDn *4 m*-n\\xE9l t\\xF6bbet s\\xFCllyedt"]],',
        '[5.8, 10.5, "Terhel\\xE9s alatt", ["A v\\xEDz *kiszorul*, a laza v\\xE1z *\\xF6sszenyom\\xF3dik*:", "sokkal jobban, mint az \\xE1sv\\xE1nyi talajok"]],')
else:
    rep('[0.5, 5.3, "Holme Fen, England \xb7 1851", ["The fen is *drained*.", "An iron post is driven into the peat: its top is at *ground level*"]],',
        '[0.6, 5.4, "What is peat?", ["The *fibrous* remains of dead plants;", "most of its volume is *water*"]],')
    rep('[5.6, 10.5, "Since the drainage", ["The peat dries out and decomposes:", "the surface has sunk more than *4 m*"]],',
        '[5.8, 10.5, "Under load", ["The water is *squeezed out* and the loose skeleton *compresses*:", "far more than mineral soils"]],')
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
