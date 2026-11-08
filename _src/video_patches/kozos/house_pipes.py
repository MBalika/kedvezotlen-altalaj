# A ház sarkain lévő lefolyók a falhoz rögzítve, hattyúnyakkal futnak le, és csatlakozóval a földbe vezetnek (nem lógnak a levegőben).
import sys, os
src, out = sys.argv[1], sys.argv[2]; here = os.path.dirname(os.path.abspath(__file__))
s = open(src, encoding='utf-8').read()
def rep(s, old, new):
    assert s.count(old) == 1, (old[:60], s.count(old)); return s.replace(old, new)
s = rep(s, '  function buildHouse({ clip, T: T2, front = false }) {', open(os.path.join(here, 'pipesweep.js')).read().rstrip('\n') + '\n  function buildHouse({ clip, T: T2, front = false }) {')
s = rep(s, '''      [[ex + 0.08, ez + 0.08], [-ex - 0.08, ez + 0.08], [ex + 0.08, -ez - 0.08], [-ex - 0.08, -ez - 0.08]].forEach(([x, z]) => {
        const p = new CylinderGeometry(0.055, 0.055, 3.2, 10);
        p.translate(x, 1.6, z);
        gu.push(p);
      });''', open(os.path.join(here, 'corner_pipes.js')).read().rstrip('\n'))
open(out, 'w', encoding='utf-8').write(s); print('house pipes ok', os.path.basename(out))
