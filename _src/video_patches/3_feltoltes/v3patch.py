import sys, os
src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
LO = os.path.join(here, '..', 'loess')
s = open(src, encoding='utf-8').read()

def between(s, a, b, new):
    i = s.find(a); j = s.find(b, i + len(a))
    assert s.count(a) == 1 and j > i, (a[:40], i, j)
    return s[:i] + new + s[j:]

def rep(s, old, new):
    assert s.count(old) == 1, (old[:70], s.count(old))
    return s.replace(old, new)

# ---------------- 0:37–0:53 a feltöltések anyaga: valószerű szelvényfal (rézsútos lerakási rétegek, törmelék, salak, szemét)
s = between(s, '  function makeDebrisBlock(T2) {', '  function makeFalling(', open(os.path.join(here, 'new_block.js'), encoding='utf-8').read().rstrip('\n') + '\n')

# ---------------- 1:27–1:39 gáz csak a háztartási hulladékból
s = rep(s, '        const y = -3.6 + k * 3.7;', '''        const wb2 = 0.85 + 0.06 * (x0 + 6) + 0.15 * Math.sin(x0 * 0.7), wb3 = 2.6 + 0.08 * (x0 + 6) + 0.2 * Math.sin(x0 * 0.5 + 1);
        const ys = -(wb2 + (wb3 - wb2) * (0.12 + 0.76 * (a * 3.7 % 1)));
        const y = ys + k * (-ys + 0.1);''')
s = rep(s, '    uFill: { value: 6 },', '    uFill: { value: 6 },\n    uWasteHL: { value: 0 },')
s = rep(s, 'uniform float uFoundD, uLiftL, uLiftR, uRebar, uFill, uEra, uPitHL,', 'uniform float uWasteHL;\nuniform float uFoundD, uLiftL, uLiftR, uRebar, uFill, uEra, uPitHL,')
s = rep(s, 'if (shown > uEra + 0.5) col = natural * (0.18 + 0.12 * (d / 6.0));', '''if (shown > uEra + 0.5) col = natural * (0.18 + 0.12 * (d / 6.0));
              if (uWasteHL > 0.001) {
                float inW = step(b2, d) * step(d, b3);
                col = mix(col, col * vec3(0.95, 1.2, 0.62) + vec3(0.04, 0.07, 0.0), inW * uWasteHL * (0.55 + 0.25 * sin(uSTime * 4.0)));
                float wl = clamp((1.0 - smoothstep(0.0, 0.035, abs(d - b2))) + (1.0 - smoothstep(0.0, 0.035, abs(d - b3))), 0.0, 1.0);
                col = mix(col, vec3(0.78, 0.94, 0.42), wl * uWasteHL);
                emis += vec3(0.12, 0.2, 0.02) * inW * uWasteHL + vec3(0.3, 0.45, 0.05) * wl * uWasteHL * 0.6;
              }''')
s = rep(s, '    R.gas.update(t, inn(t, "gas") ? smooth(seg(t, 87.3, 88.5)) * (1 - smooth(seg(t, 98.4, 99))) : 0);',
        '    R.gas.update(t, inn(t, "gas") ? smooth(seg(t, 87.3, 88.5)) * (1 - smooth(seg(t, 98.4, 99))) : 0);\n    SU.uWasteHL.value = inn(t, "gas") ? smooth(seg(t, 87.6, 88.6)) * (1 - smooth(seg(t, 98.4, 99))) : 0;')
s = rep(s, 'L(proj(-9, -3, 0.2), "CI\\xC1N",', 'L(proj(-9, -1.6, 0.2), "CI\\xC1N",')
s = rep(s, '      const ca = win(t, 88.4, 98.8, 0.5, 0.5);', '''      L(proj(-6.2, -1.75, 0.2), "H\\xC1ZTART\\xC1SI HULLAD\\xC9K", win(t, 88.8, 98.8, 0.5, 0.5), { dx: 190, dy: 200, color: GAS, sub: "csak ebb\\u0151l fejl\\u0151dik g\\xE1z" });
      const ca = win(t, 88.4, 98.8, 0.5, 0.5);''')

# ---------------- 1:44–1:48 lefolyó + végig zárt csatorna, a ház sarkain is a falhoz rögzített lefolyó
sweep = open(os.path.join(LO, 'pipesweep.js'), encoding='utf-8').read().rstrip('\n') + '\n'
s = rep(s, '  function buildHouse({ clip, T: T2, front = false }) {', sweep + '  function buildHouse({ clip, T: T2, front = false }) {')
s = between(s, '    const drain = new Group();', '    drain.visible = false;', open(os.path.join(LO, 'new_drain.js'), encoding='utf-8').read().rstrip('\n') + '\n')
s = rep(s, '''      [[ex + 0.08, ez + 0.08], [-ex - 0.08, ez + 0.08], [ex + 0.08, -ez - 0.08], [-ex - 0.08, -ez - 0.08]].forEach(([x, z]) => {
        const p = new CylinderGeometry(0.055, 0.055, 3.2, 10);
        p.translate(x, 1.6, z);
        gu.push(p);
      });''', open(os.path.join(LO, 'corner_pipes.js'), encoding='utf-8').read().rstrip('\n'))
s = rep(s, 'L(proj(10.5, -0.72, 0.1), "Z\\xC1RT CSATORNA", da, { dx: 60, dy: 120, color: C.water });',
        'L(proj(10.5, -0.66, 0.1), "Z\\xC1RT CSATORNA", da, { dx: 60, dy: 120, color: C.water });')
s = rep(s, 'const p0 = proj(6.6, -0.6, 0.1), p1 = proj(12.8, -0.78, 0.1);', 'const p0 = proj(6.6, -0.6, 0.1), p1 = proj(12.8, -0.69, 0.1);')

# ---------------- 1:17–1:18 a bekötő cső a csőtörés előtt folyamatos
s = rep(s, '      leakPipe.add(a, b);', '      const c = new Mesh(new CylinderGeometry(0.08, 0.08, 0.97, 20), pipeMat);\n      c.rotation.z = Math.PI / 2;\n      c.position.set(-7.525, -1, 0);\n      leakPipe.add(a, b, c);')
s = rep(s, '    R.leakPipe.visible = inn(t, "water") || inn(t, "gas");', '    R.leakPipe.visible = inn(t, "water") || inn(t, "gas");\n    R.leakPipe.children[2].visible = t < 78;')
open(out, 'w', encoding='utf-8').write(s)
print('v3 ok', len(s))
