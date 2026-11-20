# 3. videó, „Tervezési irányelvek” (99–119 s), a felhasználó kérései szerint (2026-11-20):
#  - a zárt csatorna (lefolyó + földbe fektetett cső + nyíl) a ház FELTÖLTÉS felőli (bal) oldalára kerül, és a vizet a feltöltésen túlra vezeti;
#  - az „Azonos vastagság” irányelv kikerül (adottság, nem tervezési eszköz): felirat, 6 m / 0 m címkék, vastagságvonalak;
#  - a térbeli merevség 108–116 s között: VB. koszorú + födémtárcsa, majd 112,1 s-tól TALPKOSZORÚ az alapok szintjén;
#    átszámozás: 3 · Térbeli merevség, 4 · Kerülendő; a „VB. koszorú” felirat nem lóg ki a képből;
#  - a „Tervezési irányelvek” üres, nagy doboza a felirat méretére zsugorodik.
# A zenei ütemek (99,4 · 103,6 · 108 · 112,1 · 116,1 s) és a vágások nem változnak.
# Futtatás: python3 v3_iranyelvek.py <3. videó html> hu|en   (helyben javít; már javított fájlon hibát jelez)
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n, c=1):
    global s
    assert s.count(o) == c, (o[:90], s.count(o)); s = s.replace(o, n)
# --- zárt csatorna a bal (feltöltés felőli) oldalon
rep('pipeSweep([[5.63, 3.12, 0], [5.63, 2.9, 0], [5.1, 2.42, 0], [5.1, 0.36, 0]], 0.055, 0.14)', 'pipeSweep([[-5.63, 3.12, 0], [-5.63, 2.9, 0], [-5.1, 2.42, 0], [-5.1, 0.36, 0]], 0.055, 0.14)')
rep('sock.position.set(5.1, 0.33, 0);', 'sock.position.set(-5.1, 0.33, 0);')
rep('pipeSweep([[5.1, 0.42, 0], [5.1, -0.55, 0], [6.2, -0.6, 0], [24, -0.85, 0]], 0.07, 0.35, 16)', 'pipeSweep([[-5.1, 0.42, 0], [-5.1, -0.55, 0], [-6.2, -0.6, 0], [-24, -0.85, 0]], 0.07, 0.35, 16)')
rep('ring.position.set(5.1, y, 0);', 'ring.position.set(-5.1, y, 0);')
rep('rod.position.set(5.03, y, 0);', 'rod.position.set(-5.03, y, 0);')
CL = 'Z\\xC1RT CSATORNA' if lang == 'hu' else 'CLOSED DRAIN'
rep('L(proj(10.5, -0.66, 0.1), "%s", da, { dx: 60, dy: 120, color: C.water });' % CL,
    'L(proj(-10.2, -0.66, 0.1), "%s", da, { dx: 40, dy: -120, color: C.water });' % CL)
rep('const p0 = proj(6.6, -0.6, 0.1), p1 = proj(12.8, -0.69, 0.1);', 'const p0 = proj(-6.6, -0.6, 0.1), p1 = proj(-12.4, -0.69, 0.1);')
# --- „Azonos vastagság” ki
rep('const ta = win(t, 108.3, 111.9, 0.4, 0.4);', 'const ta = 0;   // az „azonos vastagság” irányelv kikerült (adottság)')
rep('inn(t, "guide") ? win(t, 108.2, 112, 0.5, 0.4) : 0;', '0;')
if lang == 'hu':
    rep('    [108, 111.9, "3", ["Azonos vastags\\xE1g"]],\n', '')
    rep('    [112.1, 115.9, "4", ["T\\xE9rbeli merevs\\xE9g"]],', '    [108, 115.9, "3  \\xB7  T\\xE9rbeli merevs\\xE9g", ["Vasbeton *koszor\\xFA*, *f\\xF6d\\xE9mt\\xE1rcsa* \\xE9s *talpkoszor\\xFA*"]],')
    rep('[116.1, 118.9, "5", ["*Ker\\xFClend\\u0151*"]', '[116.1, 118.9, "4", ["*Ker\\xFClend\\u0151*"]')
    RB, SD, TK = 'VB. KOSZOR\\xDA', 'F\\xD6D\\xC9MT\\xC1RCSA', 'TALPKOSZOR\\xDA'
else:
    rep('    [108, 111.9, "3", ["Uniform thickness"]],\n', '')
    rep('    [112.1, 115.9, "4", ["Three-dimensional stiffness"]],', '    [108, 115.9, "3  \xb7  Three-dimensional stiffness", ["RC *ring beam*, *slab diaphragm* and *foundation ring beam*"]],')
    rep('[116.1, 118.9, "5", ["*Avoid*"]', '[116.1, 118.9, "4", ["*Avoid*"]')
    RB, SD, TK = 'RC RING BEAM', 'SLAB DIAPHRAGM', 'FOUNDATION RING BEAM'
# --- térbeli merevség: 108 s-tól koszorú + födémtárcsa, 112,1 s-tól talpkoszorú
rep('const ra = win(t, 112.4, 115.9, 0.5, 0.4);', 'const ra = win(t, 108.4, 115.9, 0.5, 0.4);')
rep('L(proj(-4.85, 3.02, 0), "%s", ra, { dx: -60, dy: -150, color: "#ff8a3a" });' % RB,
    'L(proj(-4.85, 3.02, 0), "%s", ra, { dx: 70, dy: -165, color: "#ff8a3a" });' % RB)
rep('L(proj(1.5, 3.1, 0), "%s", ra * sub(ra, win(t, 113, 115.9, 0.4, 0.4)), { dx: 120, dy: -120, color: "#ff8a3a" });' % SD,
    'L(proj(1.5, 3.1, 0), "%s", ra * sub(ra, win(t, 109, 115.9, 0.4, 0.4)), { dx: 120, dy: -120, color: "#ff8a3a" });\n'
    '      L(proj(4.85, 0.12, 0), "%s", win(t, 112.4, 115.9, 0.5, 0.4), { dx: 150, dy: 80, color: "#ff8a3a" });' % (SD, TK))
rep('const ringK = inG ? win(t, 112.2, 116, 0.6, 0.4) : 0;', 'const ringK = inG ? win(t, 108.2, 116, 0.6, 0.4) : 0;')
rep('    R.ring.userData.mat.opacity = 0.85 * ringK;\n',
    '    R.ring.userData.mat.opacity = 0.85 * ringK;\n'
    '    const tkK = inG ? win(t, 112.1, 116, 0.6, 0.4) : 0;   // talpkoszorú az alapok szintjén\n'
    '    R.ring2.visible = tkK > 0.01;\n'
    '    R.ring2.userData.mat.opacity = 0.85 * tkK;\n')
rep('''    ring.visible = false;
    scene.add(ring);
''', '''    ring.visible = false;
    scene.add(ring);
    const ring2 = new Group();   // talpkoszorú: körbefutó vasbeton merevítés az alapok tetején (lábazat)
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
rep('leakPipe, drain, ring, spray,', 'leakPipe, drain, ring, ring2, spray,')
# --- kamera: 108 s-tól már a ház felé (a vastagság-nézet kimarad)
rep('[108, [0, 1.6, 24], [0, -2.4, 0], 46]', '[108, [1.3, 3.6, 20.4], [0.6, 1.8, 0], 42]')
# --- a „Tervezési irányelvek” doboz a felirat méretére
rep('O.rr(80, 48, 760, 140, 14);', 'O.rr(80, 48, 470, 76, 14);')
# --- melléépítés: a terasz + pergola helyett a házhoz épített deszkafalú, félnyeregtetős fészer (ez süllyed meg a 4. irányelvnél)
import re
rep('    const ts = new BoxGeometry(2.6, 0.3, 5.2);\n    ts.translate(6.3, 0.15, 1);\n', '    const ts = new BoxGeometry(2.6, 0.3, 6.6);\n    ts.translate(6.3, 0.15, 0.3);\n')
m = re.search(r'    const tp = \[\];\n.*?    add\(mergeGeometries\(tp\), mWoodPost, "pergola"\);\n', s, flags=re.S); assert m
SHED = """    {   // fészer: x 5,0–7,6 m, z −3,0…3,6 m; a tető a háztól kifelé lejt
      const mShedWood = plain({ map: T2.wood, color: 11569754, roughness: 0.8 });
      const mShedRoof = plain({ color: 7634302, roughness: 0.45, metalness: 0.5, side: DoubleSide });
      const roofY = (x) => 2.5 - (x - 5) * 0.16;
      const wd = [], dr = [];
      for (let k = 0; k < 30; k++) {   // külső fal (x = 7,5), ajtónyílással
        const z = -3 + k * 0.22 + 0.11;
        if (z > -1.32 && z < -0.38) continue;
        const b = new BoxGeometry(0.07, 1.78, 0.2);
        b.translate(7.5, 0.3 + 0.89, z);
        wd.push(b);
      }
      { const b = new BoxGeometry(0.07, 0.22, 0.98); b.translate(7.5, 1.97, -0.85); wd.push(b); }
      [-2.96, 3.56].forEach((z) => {   // két végfal, a tető lejtését követve
        for (let k = 0; k < 11; k++) {
          const x = 5.08 + k * 0.22 + 0.11, hh = roofY(x) - 0.36;
          const b = new BoxGeometry(0.2, hh, 0.07);
          b.translate(x, 0.3 + hh / 2, z);
          wd.push(b);
        }
      });
      [[7.5, -2.96], [7.5, 3.56]].forEach(([x, z]) => { const b = new BoxGeometry(0.12, 1.8, 0.12); b.translate(x, 0.3 + 0.9, z); wd.push(b); });
      { const b = new BoxGeometry(0.12, 0.12, 6.7); b.translate(7.5, 2.12, 0.3); wd.push(b); }
      add(mergeGeometries(wd), mShedWood, "pergola");
      { const b = new BoxGeometry(0.06, 1.72, 0.88); b.translate(7.47, 0.3 + 0.86, -0.85); dr.push(b);
        const hd = new BoxGeometry(0.08, 0.05, 0.14); hd.translate(7.53, 1.25, -0.55); dr.push(hd); }
      add(mergeGeometries(dr), mDoor, "shedDoor");
      const rf = [];
      { const sl = Math.atan(0.16), b = new BoxGeometry(2.86, 0.06, 6.95);
        rf.push(b);
        for (let k = 0; k < 20; k++) { const r = new BoxGeometry(2.86, 0.035, 0.07); r.translate(0, 0.045, -3.3 + k * 0.347); rf.push(r); }
        const g2 = mergeGeometries(rf);
        g2.rotateZ(-sl);
        g2.translate(6.5, roofY(6.5) + 0.05, 0.3);
        add(g2, mShedRoof, "shedRoof"); }
    }
"""
s = s[:m.start()] + SHED + s[m.end():]
rep('float ter = step(5.06, p.x) * step(p.y, 2.95) * step(-1.8, p.z) * step(p.z, 3.8);', 'float ter = step(5.06, p.x) * step(p.y, 2.95) * step(-3.2, p.z) * step(p.z, 3.8);')
rep('const p = proj(...deformJS(6.6, 0.3, 1));', 'const p = proj(...deformJS(6.5, 1.4, -1.4));')
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
