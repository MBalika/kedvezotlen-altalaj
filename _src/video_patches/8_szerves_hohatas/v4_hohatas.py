# 4. videó, „Hőhatás” jelenet (86–90 s): a talajban izzó cső + „KAZÁNHÁZ” címke helyett látható hőforrás.
# A szobában cserépkályha áll (a ház része, vele mozog); a jelenetben a hő lefelé terjed (nyilak), alatta a tőzeg kiszárad és zsugorodik.
# Futtatás: python3 v4_hohatas.py <4. videó html> hu|en
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n):
    global s
    assert s.count(o) == 1, (o[:90], s.count(o)); s = s.replace(o, n)
rep('    add(mergeGeometries(fu), mWoodPost, "furniture");\n', '''    add(mergeGeometries(fu), mWoodPost, "furniture");
    {   // cserépkályha a szobában (a hőhatás forrása)
      const mStove = plain({ color: 3043159, roughness: 0.3, metalness: 0.1 });
      const mStoveDark = plain({ color: 2763306, roughness: 0.6, metalness: 0.4 });
      const mFire = plain({ color: 16742938, emissive: 16734720, emissiveIntensity: 1.6 });
      const SX = 2.4, SZ = -1.3, FY = 0.45;
      const body = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {   // csempesorok
        const b = new BoxGeometry(0.29, 0.34, 0.62);
        b.translate(SX - 0.3 + c * 0.3, FY + 0.14 + 0.17 + r * 0.355, SZ);
        body.push(b);
      }
      add(mergeGeometries(body), mStove, "stove");
      const dk = [];
      { const b = new BoxGeometry(1.02, 0.14, 0.72); b.translate(SX, FY + 0.07, SZ); dk.push(b); }
      { const b = new BoxGeometry(1.02, 0.1, 0.72); b.translate(SX, FY + 0.14 + 4 * 0.355 + 0.05, SZ); dk.push(b); }
      { const b = new BoxGeometry(0.16, 1.02, 0.16); b.translate(SX, FY + 0.14 + 4 * 0.355 + 0.1 + 0.51, SZ - 0.1); dk.push(b); }
      { const b = new BoxGeometry(0.4, 0.34, 0.04); b.translate(SX, FY + 0.5, SZ + 0.32); dk.push(b); }
      add(mergeGeometries(dk), mStoveDark, "stoveTrim");
      { const b = new BoxGeometry(0.28, 0.2, 0.03); b.translate(SX, FY + 0.5, SZ + 0.345); add(b, mFire, "stoveFire", false, false); }
    }
''')
# a talajban nincs cső; a meleg a padló alól terjed lefelé
rep('float hr = length(vec2(x - 2.4, (d - 1.15) * 1.3));', 'float hr = length(vec2((x - 2.4) * 0.9, (d - 0.55) * 1.1));')
rep('float pipe = 1.0 - smoothstep(0.16, 0.19, length(vec2(x - 2.4, d - 1.15)));', 'float pipe = 0.0;')
if lang == 'hu':
    OLD, T1, S1, T2, S2 = 'KAZ\\xC1NH\\xC1Z', 'K\\xC1LYHA', 'tart\\xF3s h\\u0151', 'KISZ\\xC1RAD\\xD3 T\\u0150ZEG', 'zsugorodik'
    rep('[86.2, 89.8, "H\\u0151hat\\xE1s", ["*Helyi* kisz\\xE1rad\\xE1s"], { kc: C.red, hc: C.red }],',
        '[86.2, 89.8, "H\\u0151hat\\xE1s", ["A tart\\xF3s h\\u0151 alatt a t\\u0151zeg *kisz\\xE1rad* \\xE9s *zsugorodik*"], { kc: C.red, hc: C.red }],')
else:
    OLD, T1, S1, T2, S2 = 'BOILER ROOM', 'STOVE', 'long-term heat', 'DRYING PEAT', 'shrinks'
    rep('[86.2, 89.8, "Heat", ["*Local* drying"], { kc: C.red, hc: C.red }],',
        '[86.2, 89.8, "Heat", ["Under long-term heat the peat *dries out* and *shrinks*"], { kc: C.red, hc: C.red }],')
rep('L(proj(2.4, -1.15, 0), "%s", win(t, 86.6, 89.8, 0.4, 0.4), { dx: 140, dy: -150, color: "#ff9a4a" });' % OLD,
'''{
        const ha = win(t, 86.6, 89.8, 0.4, 0.4);
        if (ha > 0) {
          L(proj(2.85, 1.6, -1.0), "%s", ha, { dx: 150, dy: -110, color: "#ff9a4a", sub: "%s" });
          [1.75, 2.4, 3.05].forEach((x, i) => {   // lefelé terjedő hő
            const k = (t * 0.9 + i * 0.33) %% 1, p0 = proj(x, 0.15 - k * 0.5, 0.05), p1 = proj(x, -0.75 - k * 0.5, 0.05);
            O.arrow(p0.x, p0.y, p1.x, p1.y, ha * Math.sin(k * Math.PI) * 0.9, "#ff9a4a", 7, 20);
          });
          L(proj(2.4, -2.3, 0.05), "%s", ha * sub(ha, win(t, 87.4, 89.8, 0.4, 0.4)), { dx: 170, dy: 70, color: C.red, sub: "%s" });
        }
      }''' % (T1, S1, T2, S2))
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
