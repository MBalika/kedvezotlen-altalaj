# Vibrálás (régi): a fűfotó-textúra fűszálai a kamera közelében, mozgás közben „hullámzanak” (a képpontnyi részletek ki-be kapcsolnak).
# A fű mintavétele egy kicsit (0,8 mipszinttel) elmosódottabb – a fű távolról ugyanúgy néz ki, közelről nem villog.
# Használat: python3 grass_lod.py <videó.html> (helyben módosít; csak egyszer futtatható)
import sys, re
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    s, n = re.subn(r'texture2D\(uGrass, (xz / (?:3\.2|11\.0 \+ 0\.37))\)', r'texture2D(uGrass, \1, 0.8)', s)
    assert n >= 2, (f, n)
    open(f, 'w', encoding='utf-8').write(s); print('grass ok', n, f.split('/')[-1])
