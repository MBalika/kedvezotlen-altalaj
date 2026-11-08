import sys, os
src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()

def between(s, a, b, new):
    i = s.find(a); j = s.find(b, i + len(a))
    assert i >= 0 and j > i and s.count(a) == 1, (a, i, j)
    return s[:i] + new + s[j:]

def rep(s, old, new):
    assert s.count(old) == 1, (old, s.count(old))
    return s.replace(old, new)

micro = open(os.path.join(here, 'new_micro.js'), encoding='utf-8').read()
panel = open(os.path.join(here, 'new_panel.js'), encoding='utf-8').read()
s = between(s, '  function makeMicro() {', '  function makeLab(T2) {', micro)
s = between(s, '  function drawMineralPanel(O, p, a) {', '\n  // assets/grass.jpg', panel)

old_keys = '''    { t0: 70.5, t1: 86, base: MICRO, keys: [
      [70.5, [4.2, 1, 7.2], [0, 0.1, 0], 42],
      [76.5, [7.2, 2.2, 11.2], [0, 0.2, 0], 38],
      [79.5, [5, 2.6, 13], [-4.4, 0.4, 0], 38],
      [86, [6, 3.2, 14], [-4.8, 0.3, 0], 36]
    ] },'''
new_keys = open(os.path.join(here, 'keys.txt'), encoding='utf-8').read().rstrip('\n')
s = rep(s, old_keys, new_keys)
s = rep(s, '      const ra = win(t, 73.2, 82.5, 0.5, 0.5);', '      const ra = win(t, 76, 82.5, 0.5, 0.5);')
s = rep(s, '      if (pa > 0) drawMineralPanel(O, t - 78.6, pa);', '      if (pa > 0) drawMineralPanel(O, t - 78.6, pa, st.gap);\n      drawMicroLegend(O, t);')
open(out, 'w', encoding='utf-8').write(s)
print('ok', len(s))
