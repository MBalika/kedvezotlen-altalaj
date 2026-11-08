import sys, os
src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()

def between(s, a, b, new):
    i = s.find(a); j = s.find(b, i + len(a))
    assert s.count(a) == 1 and j > i, (a[:40], i, j)
    return s[:i] + new + s[j:]

def rep(s, old, new, n=1):
    assert s.count(old) == n, (old[:60], s.count(old))
    return s.replace(old, new)

# ---------------- 0:34–0:51 lösz szerkezete
s = between(s, '  function makeGrains() {', '\n  function ', open(os.path.join(here, 'new_grains.js'), encoding='utf-8').read().rstrip('\n') + '\n')
s = rep(s, '["Sz\\xE9l hordta k\\u0151zetliszt, *nagy* *p\\xF3rusokkal*"]', '["Sz\\xE9l hordta iszapos finomhomok, *nagy* *p\\xF3rusokkal*"]')
s = rep(s, 'L(proj(...rel(GR, -4.2, 2.6, 1.9)), "K\\u0150ZETLISZT-SZEMCS\\xC9K", la, { dx: -40, dy: -170 });',
        'L(proj(...GR.clone().add(R.grains.anchors.grain).toArray()), "KVARCSZEMCS\\xC9K", la, { dx: -60, dy: -170 });')
s = rep(s, 'L(proj(...rel(GR, 4.4, 0.4, 1.9)), "K\\xD6T\\u0150HIDAK",',
        'L(proj(...GR.clone().add(R.grains.anchors.bridge).toArray()), "M\\xC9SZ- \\xC9S AGYAGHIDAK",')
s = rep(s, 'L(proj(...rel(GR, 0.1, 0.6, 2.2)), "MAKROP\\xD3RUS",', 'L(proj(...GR.clone().add(R.grains.anchors.pore).toArray()), "MAKROP\\xD3RUS",')
s = rep(s, '{ t0: 33, t1: 51, base: GR, keys: [[33, [0.8, 1.6, 17.5], [0, 0.4, 0], 40], [42, [3, 1.8, 16.5], [0.4, 0.2, 0], 40], [51, [4.6, 1.2, 16.5], [0.6, -0.4, 0], 40]] },',
        '{ t0: 33, t1: 51, base: GR, keys: [[33, [2.6, 2, 8.8], [-0.5, 1, 1.3], 38], [37.6, [1.8, 2, 13.6], [-0.2, 0.6, 0], 40], [42, [3, 1.8, 16.5], [0.4, 0.2, 0], 40], [51, [4.6, 1.2, 16.5], [0.6, -0.4, 0], 40]] },')

# ---------------- 2:02–2:08 lefolyó + zárt csatorna, végig zárt cső
sweep = open(os.path.join(here, 'pipesweep.js'), encoding='utf-8').read().rstrip('\n') + '\n'
s = rep(s, '  function buildHouse({ clip, T: T2, front = false }) {', sweep + '  function buildHouse({ clip, T: T2, front = false }) {')
s = between(s, '    const drain = new Group();', '    drain.visible = false;', open(os.path.join(here, 'new_drain.js'), encoding='utf-8').read().rstrip('\n') + '\n')
s = rep(s, '''      [[ex + 0.08, ez + 0.08], [-ex - 0.08, ez + 0.08], [ex + 0.08, -ez - 0.08], [-ex - 0.08, -ez - 0.08]].forEach(([x, z]) => {
        const p = new CylinderGeometry(0.055, 0.055, 3.2, 10);
        p.translate(x, 1.6, z);
        gu.push(p);
      });''', '''      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => {
        gu.push(pipeSweep([[sx * (ex + 0.08), ry - 0.08, sz * (ez + 0.08)], [sx * (ex + 0.08), ry - 0.32, sz * (ez + 0.08)], [sx * 5.08, ry - 0.86, sz * 4.58], [sx * 5.08, -0.3, sz * 4.58]], 0.055, 0.14, 12));
        const bt = new CylinderGeometry(0.08, 0.08, 0.34, 14);
        bt.translate(sx * 5.08, 0.03, sz * 4.58);
        gu.push(bt);
        for (const y of [0.75, 1.65]) {
          const tr = new TorusGeometry(0.064, 0.013, 6, 16);
          tr.rotateX(Math.PI / 2);
          tr.translate(sx * 5.08, y, sz * 4.58);
          gu.push(tr);
          const rd = new BoxGeometry(0.06, 0.024, 0.024);
          rd.rotateY(sx * sz > 0 ? -Math.PI / 4 : Math.PI / 4);
          rd.translate(sx * 5.025, y, sz * 4.525);
          gu.push(rd);
        }
      });''')
s = rep(s, 'L(proj(10.5, -0.72, 0.1), "Z\\xC1RT CSATORNA", da, { dx: 60, dy: 120, color: C.water });',
        'L(proj(10.5, -0.66, 0.1), "Z\\xC1RT CSATORNA", da, { dx: 60, dy: 120, color: C.water });')
s = rep(s, 'const p0 = proj(6.6, -0.6, 0.1), p1 = proj(12.8, -0.78, 0.1);', 'const p0 = proj(6.6, -0.6, 0.1), p1 = proj(12.8, -0.69, 0.1);')
s = rep(s, 'L(proj(5.66, 2.2, -0.1), "LEFOLY\\xD3",', 'L(proj(5.1, 1.7, 0.06), "LEFOLY\\xD3",')

# ---------------- 1:01–1:04 a bekötő cső a csőtörés előtt folyamatos
s = rep(s, "leakPipe.add(a, b);", "const c = new Mesh(new CylinderGeometry(0.08, 0.08, 0.82, 20), pipeMat);\n      c.rotation.z = Math.PI / 2;\n      c.position.set(-6.4, -0.9, 0);\n      leakPipe.add(a, b, c);")
s = rep(s, 'R.leakPipe.visible = inn(t, "field") && t > 61.5;', 'R.leakPipe.visible = inn(t, "field") && t > 61.5;\n    R.leakPipe.children[2].visible = t < 64;')
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))

# ---------------- vibrálás: apró, képpontnál kisebb minták elhalványítása, lombozat élsimítása, mélységpontosság
s = open(out, encoding='utf-8').read()
s = rep(s, "float speck = step(0.955, mh) * (1.0 - smoothstep(0.14, 0.24, length((mcf - vec2(0.3 + 0.4 * h1(mci + 3.1), 0.5)) * vec2(1.0, 0.55))));",
        "float speck = step(0.955, mh) * (1.0 - smoothstep(0.14, 0.24, length((mcf - vec2(0.3 + 0.4 * h1(mci + 3.1), 0.5)) * vec2(1.0, 0.55))));\n        speck *= 1.0 - smoothstep(0.1, 0.28, fwidth(mc.x));")
s = rep(s, "float doll = step(0.86, lh) * (1.0 - smoothstep(0.1, 0.16, length((lcf - h2(lci) * 0.6 - 0.2) * vec2(1.0, 0.75 + 0.5 * lh))));",
        "float doll = step(0.86, lh) * (1.0 - smoothstep(0.1, 0.16, length((lcf - h2(lci) * 0.6 - 0.2) * vec2(1.0, 0.75 + 0.5 * lh))));\n        doll *= 1.0 - smoothstep(0.05, 0.14, fwidth(lc.x));")
s = rep(s, "float d = step(0.9, hh(c)) * (1.0 - smoothstep(0.1, 0.17, length(f - 0.5)));",
        "float d = step(0.9, hh(c)) * (1.0 - smoothstep(0.1, 0.17, length(f - 0.5)));\n        d *= 1.0 - smoothstep(0.05, 0.14, fwidth(p.x * 2.4));")
s = rep(s, "float pore = step(0.9, hh(c2 + 3.0)) * (1.0 - smoothstep(0.1, 0.2, length((f2 - 0.5) * vec2(1.0, 0.4))));",
        "float pore = step(0.9, hh(c2 + 3.0)) * (1.0 - smoothstep(0.1, 0.2, length((f2 - 0.5) * vec2(1.0, 0.4))));\n        pore *= 1.0 - smoothstep(0.1, 0.28, fwidth(p.x * 18.0));")
open(out, 'w', encoding='utf-8').write(s)
print('flicker fixes ok')
