# 4. videó (szerves talajok), a felhasználó kérései szerint (2026-11-20):
#  - rugalmas közműbekötés: nem rugó és nem az alap alatt – folytonos vezeték az alaptesten át, nagyobb átmérőjű védőcsőben, hézaggal;
#  - a „részleges alápincézés” és a „melléépítés” kikerül (147–152 s);
#  - térbeli merevség (most 147,2–151,8 s): VB. koszorú, födémtárcsa és TALPKOSZORÚ / vasalt alap az alapok szintjén;
#  - „különösen veszélyes” (rezgés, talajvíz-ingadozás) 152,2–159,8 s;
#  - új felirat 29,8–33,8 s: nem csak a tőzeg, a szerves iszap és a szerves agyag is veszélyes;
#  - a „Tervezési irányelvek” doboz a felirat méretére.
# A zenei ütemek (142,4 · 147,2 · 152,2 · 156,2 s) nem változnak.   Futtatás: python3 v4_iranyelvek.py <4. videó html> hu|en
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n, c=1):
    global s
    assert s.count(o) == c, (o[:90], s.count(o)); s = s.replace(o, n)
HU = lang == 'hu'
# --- közműbekötés védőcsővel az alapon át
rep('inner.position.set(4.3, -0.95, 0);', 'inner.position.set(4.3, PIPE_Y, 0);')
rep('outer.position.set(9.6, -0.95, 0);', 'outer.position.set(9.6, PIPE_Y, 0);')
rep('    const pipeM = new MeshStandardMaterial({ color: 10119752, roughness: 0.5, metalness: 0.1 });', '    const PIPE_Y = -0.5;   // a vezeték az alaptesten (0…−0,9 m) megy át, nem alatta\n    const pipeM = new MeshStandardMaterial({ color: 10119752, roughness: 0.5, metalness: 0.1 });')
rep('''    for (let k = 0; k < 7; k++) {
      const r = new Mesh(new TorusGeometry(0.13, 0.03, 8, 20), flexM);
      r.rotation.y = Math.PI / 2;
      r.position.x = k * 0.1;
      flex.add(r);
    }
''', '''    const sleeve = new Mesh(new CylinderGeometry(0.23, 0.23, 0.9, 28, 1, true), new MeshStandardMaterial({ color: 9212071, roughness: 0.45, metalness: 0.3, side: DoubleSide }));   // védőcső az alaptestben
    sleeve.rotation.z = Math.PI / 2;
    const collar = new Mesh(new TorusGeometry(0.23, 0.035, 8, 28), flexM), collar2 = collar.clone();
    collar.rotation.y = collar2.rotation.y = Math.PI / 2;
    const link = new Mesh(new CylinderGeometry(0.1, 0.1, 1, 20), pipeM);   // a folytonos vezeték a védőcsőben, hézaggal
    flex.add(sleeve, collar, collar2, link);
''')
rep('inner.position.y = -0.95 + houseY;', 'inner.position.y = PIPE_Y + houseY;')
rep('''        outer.position.x = 9.6;
        outer.scale.y = 1;
        flex.visible = false;''', '''        outer.position.x = 9.6;
        outer.scale.y = 1;
        inner.position.x = 4.3;
        inner.scale.y = 1;
        flex.visible = false;''')
rep('''        outer.position.x = 9.95;
        outer.scale.y = 8.3 / 9;
        flex.visible = true;
        flex.children.forEach((r, k) => {
          const u = k / 6;
          r.position.set(5.12 + u * 0.6, -0.95 + houseY * (1 - u), 0);
        });''', '''        outer.position.x = 9.8;
        outer.scale.y = 8.6 / 9;
        inner.position.x = 3.9;
        inner.scale.y = 0.8 / 1.6;
        flex.visible = true;
        sleeve.position.set(4.85, PIPE_Y + houseY, 0);
        collar.position.set(4.4, PIPE_Y + houseY, 0);
        collar2.position.set(5.3, PIPE_Y + houseY, 0);
        const dx = 1.2, dy = -houseY;   // (4,3; y+houseY) → (5,5; y): a vezeték követi a süllyedést, nem törik
        link.position.set(4.9, PIPE_Y + houseY / 2, 0);
        link.scale.y = Math.hypot(dx, dy);
        link.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;''')
rep('-0.95 + SU2.uLiftR.value * 0.5, 0.1)', '-0.5 + SU2.uLiftR.value * 0.5, 0.1)')
# --- irányelvek: időrend és tartalom
rep('const ma = win(t, 147.6, 151.8, 0.3, 0.3);', 'const ma = 0;   // a részleges alápincézés és a melléépítés kikerült')
rep('HU.uAnnex.value = smooth(seg(t, 147.8, 149.6));', 'HU.uAnnex.value = 0;')
rep('{ t0: 147, t1: 152, keys: [[147, [8.5, 2.2, 15], [6, 0.8, 1], 42], [152, [9.5, 2.4, 14.5], [6.2, 0.8, 1], 42]] },', '{ t0: 147, t1: 152, keys: [[147, [1.5, 3.8, 19.5], [0.5, 2, 0], 42], [152, [0.6, 3.6, 19], [0.3, 1.9, 0], 42]] },')
rep('''    { t0: 152, t1: 156, keys: [[152, [1.5, 3.8, 19.5], [0.5, 2, 0], 42], [156, [0.5, 3.6, 19], [0.3, 2, 0], 42]] },
    { t0: 156, t1: 160, keys: [[156, [2, 1.6, 26.5], [2, -2.2, 0], 46], [160, [2.5, 1.6, 26], [2.4, -2.2, 0], 46]] },''',
    '''    { t0: 152, t1: 160, keys: [[152, [2, 1.6, 26.5], [2, -2.2, 0], 46], [160, [2.6, 1.6, 25.8], [2.4, -2.2, 0], 46]] },''')
rep('142, 147, 152, 156, 160];', '142, 147, 152, 160];')
rep('const ringK = inn(t, "rules") ? win(t, 152.3, 155.9, 0.5, 0.4) : 0;', 'const ringK = inn(t, "rules") ? win(t, 147.4, 151.8, 0.5, 0.4) : 0;')
rep('    R.ring.userData.mat.opacity = 0.85 * ringK;\n', '    R.ring.userData.mat.opacity = 0.85 * ringK;\n    const tkK = inn(t, "rules") ? win(t, 149.2, 151.8, 0.5, 0.4) : 0;   // talpkoszorú / vasalt alap\n    R.ring2.visible = tkK > 0.01;\n    R.ring2.userData.mat.opacity = 0.85 * tkK;\n')
rep('''    ring.visible = false;
    scene.add(ring);
''', '''    ring.visible = false;
    scene.add(ring);
    const ring2 = new Group();   // talpkoszorú: körbefutó vasbeton merevítés az alapok tetején
    {
      const rm = new MeshStandardMaterial({ color: 16747066, emissive: 16738832, emissiveIntensity: 0.9, transparent: true, opacity: 0.85 });
      [[-4.85, 0.12, -0.01, 0.5, 0.36, 0.02], [4.85, 0.12, -0.01, 0.5, 0.36, 0.02], [0, 0.12, -4.35, 10.2, 0.36, 0.34], [-4.85, 0.12, -2.2, 0.34, 0.36, 4.3], [4.85, 0.12, -2.2, 0.34, 0.36, 4.3]].forEach(([x, y, z, sx, sy, sz]) => {
        const b = new Mesh(new BoxGeometry(sx, sy, sz), rm);
        b.position.set(x, y, z);
        ring2.add(b);
      });
      ring2.userData.mat = rm;
    }
    ring2.visible = false;
    scene.add(ring2);
''')
rep('drain, ring, spray }', 'drain, ring, ring2, spray }')
rep('if (t >= 156) {', 'if (t >= 152) {')
rep('win(t, 156.3, 159.8, 0.4, 0.4)', 'win(t, 152.3, 159.8, 0.4, 0.4)', 3)
rep('Math.sin((t - 156) * 2.4)', 'Math.sin((t - 152) * 2.4)')
rep('const da = win(t, 156.4, 159.8, 0.4, 0.4);', 'const da = win(t, 152.4, 159.8, 0.4, 0.4);')
rep('[156.2, 159.8, "",', '[152.2, 159.8, "",')
rep('const ra = win(t, 152.4, 155.9, 0.5, 0.4);', 'const ra = win(t, 147.6, 151.8, 0.5, 0.4);')
RB, SD, TK, TKS = ('VB. KOSZOR\\xDA', 'F\\xD6D\\xC9MT\\xC1RCSA', 'TALPKOSZOR\\xDA', 'vagy vasalt alap') if HU else ('RC RING BEAM', 'SLAB DIAPHRAGM', 'FOUNDATION RING BEAM', 'or reinforced footings')
rep('L(proj(-4.85, 3.02, 0), "%s", ra, { dx: -60, dy: -150, color: "#ff8a3a" });' % RB, 'L(proj(-4.85, 3.02, 0), "%s", ra, { dx: 70, dy: -165, color: "#ff8a3a" });' % RB)
rep('L(proj(1.5, 3.1, 0), "%s", ra * sub(ra, win(t, 153, 155.9, 0.4, 0.4)), { dx: 120, dy: -120, color: "#ff8a3a" });' % SD,
    'L(proj(1.5, 3.1, 0), "%s", ra * sub(ra, win(t, 148.2, 151.8, 0.4, 0.4)), { dx: 120, dy: -120, color: "#ff8a3a" });\n'
    '      L(proj(4.85, 0.12, 0), "%s", win(t, 149.4, 151.8, 0.4, 0.4), { dx: 150, dy: 80, color: "#ff8a3a", sub: "%s" });' % (SD, TK, TKS))
rep('O.rr(80, 48, 760, 140, 14);', 'O.rr(80, 48, 470, 76, 14);')
# --- feliratok
if HU:
    rep('[142.4, 146.8, "K\\xF6zm\\u0171csatlakoz\\xE1s", ["*Rugalmas* bek\\xF6t\\xE9s"], { kc: C.green, hc: C.green }],',
        '[142.4, 146.8, "K\\xF6zm\\u0171csatlakoz\\xE1s", ["*V\\xE9d\\u0151cs\\u0151ben*, h\\xE9zaggal az alapon \\xE1t"], { kc: C.green, hc: C.green }],\n'
        '    [147.2, 151.8, "T\\xE9rbeli merevs\\xE9g", ["*Koszor\\xFA*, *f\\xF6d\\xE9mt\\xE1rcsa*, *talpkoszor\\xFA* vagy vasalt alap"]],')
    rep('    [34.4, 37.9, "Felismer\\xE9s",', '    [29.8, 33.8, "Nem csak a t\\u0151zeg", ["A szerves *iszap* \\xE9s a szerves *agyag* is vesz\\xE9lyes"], { kc: C.red, hc: C.red }],\n    [34.4, 37.9, "Felismer\\xE9s",')
    L1, S1, L2, S2 = 'V\\xC9D\\u0150CS\\u0150', 'az alapon \\xE1t, h\\xE9zaggal', 'FOLYTONOS VEZET\\xC9K', 'k\\xF6veti a s\\xFCllyed\\xE9st'
else:
    rep('[142.4, 146.8, "Service connection", ["*Flexible* connection"], { kc: C.green, hc: C.green }],',
        '[142.4, 146.8, "Service connection", ["In a *sleeve* through the footing, with clearance"], { kc: C.green, hc: C.green }],\n'
        '    [147.2, 151.8, "Three-dimensional stiffness", ["*Ring beam*, *slab diaphragm*, *foundation ring beam* or reinforced footings"]],')
    rep('    [34.4, 37.9, "Recognition",', '    [29.8, 33.8, "Not only peat", ["Organic *silt* and organic *clay* are dangerous too"], { kc: C.red, hc: C.red }],\n    [34.4, 37.9, "Recognition",')
    L1, S1, L2, S2 = 'SLEEVE', 'through the footing, with clearance', 'CONTINUOUS PIPE', 'follows the settlement'
rep('const ma = 0;   // a részleges alápincézés és a melléépítés kikerült', '''{
        const ka = win(t, 143, 146.8, 0.4, 0.4);
        L(proj(4.85, -0.27 + SU2.uLiftR.value, 0.25), "%s", ka, { dx: -130, dy: -150, color: C.green, sub: "%s" });
        L(proj(7.6, -0.5, 0.1), "%s", ka * sub(ka, win(t, 143.8, 146.8, 0.4, 0.4)), { dx: 90, dy: 120, color: "#ff9a4a", sub: "%s" });
      }
      const ma = 0;   // a részleges alápincézés és a melléépítés kikerült''' % (L1, S1, L2, S2))
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
