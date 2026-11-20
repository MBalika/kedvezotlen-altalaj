# 4. videó, bevezető (0–13 s, Holme Fen): érthető magyarázat – hol vagyunk, mi az oszlop, miért áll ki a földből.
#  - nyitó felirat: Holme Fen, Anglia, 1851: a lápot lecsapolják; vasoszlopot vernek a tőzegbe, a teteje a felszínen van;
#  - az oszlop címkéje: VASOSZLOP · a teteje 1851-ben a felszínen; a kiálló résznél: ENNYIT SÜLLYEDT A FELSZÍN;
#  - a második felirat kimondja az okot (a lecsapolt tőzeg kiszárad és lebomlik);
#  - az AGYAG címke nem lóg a feliratba; a szántás barázdái a távolban nem káprázó csíkok (moiré).
# Futtatás: python3 v4_bevezeto.py <4. videó html> hu|en
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n):
    global s
    assert s.count(o) == 1, (o[:90], s.count(o)); s = s.replace(o, n)
rep('float furrow = 0.5 + 0.5 * sin(xz.y * 7.85 + n2.r * 0.8);', 'float furrow = 0.5 + 0.5 * sin(xz.y * 7.85 + n2.r * 0.8);\n          furrow = mix(0.5, furrow, 1.0 - smoothstep(0.5, 1.9, fwidth(xz.y * 7.85)));   // távol a barázdák átlagszínre simulnak (nincs moiré)')
if lang == 'hu':
    rep('L(top, "HOLME FEN OSZLOP", win(t, 1, 5, 0.5, 0.4), { dx: 140, dy: -120 });', 'L(top, "VASOSZLOP", win(t, 1, 5.4, 0.5, 0.4), { dx: 140, dy: -120, sub: "a teteje 1851-ben a felsz\\xEDnen" });')
    rep('    [5.6, 10.4, "Az\\xF3ta", ["*4 m*-n\\xE9l t\\xF6bbet s\\xFCllyedt"]],',
        '    [0.5, 5.3, "Holme Fen, Anglia \\xB7 1851", ["A l\\xE1pot *lecsapolj\\xE1k*.", "Vasoszlopot vernek a t\\u0151zegbe: a teteje a *felsz\\xEDnen* van"]],\n'
        '    [5.6, 10.5, "A lecsapol\\xE1s \\xF3ta", ["A t\\u0151zeg kisz\\xE1rad \\xE9s lebomlik:", "a felsz\\xEDn *4 m*-n\\xE9l t\\xF6bbet s\\xFCllyedt"]],')
    AG, EX = 'AGYAG', 'ENNYIT S\\xDCLLYEDT A FELSZ\\xCDN'
else:
    import re
    m = re.search(r'L\(top, "([^"]+)", win\(t, 1, 5, 0\.5, 0\.4\), \{ dx: 140, dy: -120 \}\);', s); assert m
    s = s.replace(m.group(0), 'L(top, "IRON POST", win(t, 1, 5.4, 0.5, 0.4), { dx: 140, dy: -120, sub: "its top at ground level in 1851" });')
    rep('    [5.6, 10.4, "Since then", ["It has sunk more than *4 m*"]],',
        '    [0.5, 5.3, "Holme Fen, England \xb7 1851", ["The fen is *drained*.", "An iron post is driven into the peat: its top is at *ground level*"]],\n'
        '    [5.6, 10.5, "Since the drainage", ["The peat dries out and decomposes:", "the surface has sunk more than *4 m*"]],')
    AG, EX = 'CLAY', 'THE SURFACE HAS SUNK THIS MUCH'
rep('L(proj(...rel(FEN, -6.5, -6.6, 0)), "%s", sa * sub(sa, win(t, 2, 19.8, 0.5, 0.5)), { dx: -150, dy: 40, color: "#b8c4cc" });' % AG,
    'L(proj(...rel(FEN, 7.5, -6.6, 0)), "%s", sa * sub(sa, win(t, 2, 19.8, 0.5, 0.5)), { dx: 150, dy: 30, color: "#b8c4cc" });\n'
    '      if (drop > 1.2) L(proj(...rel(FEN, 0.7, -drop * 0.25, -0.42)), "%s", win(t, 6.4, 12.6, 0.5, 0.4), { dx: 170, dy: -90, color: C.accent });' % (AG, EX))
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
