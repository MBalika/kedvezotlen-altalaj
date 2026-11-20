import sys, re
from soil_inject import inject, rep
s = open(sys.argv[1], encoding='utf-8').read()
s = inject(s, ['natural', 'rubble', 'slag', 'waste', 'mixed', 'topsoil'])
s = rep(s, '''vec3 natural = vec3(0.46, 0.36, 0.25) * (0.88 + 0.24 * nz.r) * (0.95 + 0.06 * sin(y * 6.0 + nz.g * 4.0));
        natural = mix(natural, natural * vec3(1.25, 0.95, 0.65), smoothstep(0.66, 0.76, nz2.g) * 0.4);''', 'vec3 natural = soilT(uTxNatural, vWPos.xy) * vec3(1.2, 1.25, 1.35);')
s = rep(s, 'col = debris(p, 0.0, vec3(0.43, 0.38, 0.32) * (0.85 + 0.3 * nz2.r), nz3);', 'col = soilT(uTxRubble, p) * 1.5;')
s = rep(s, 'col = debris(p, 1.0, vec3(0.27, 0.26, 0.25) * (0.85 + 0.3 * nz2.r), nz3);', 'col = soilT(uTxSlag, p) * 3.0;')
s = rep(s, 'col = debris(p, 2.0, vec3(0.24, 0.19, 0.14) * (0.85 + 0.3 * nz2.r), nz3);', 'col = soilT(uTxWaste, p) * 3.2;')
s = rep(s, 'col = debris(p, 3.0, vec3(0.4, 0.33, 0.25) * (0.85 + 0.3 * nz2.r), nz3);', 'col = soilT(uTxMixed, p) * 1.7;')
s = rep(s, 'col = vec3(0.17, 0.13, 0.09) * (0.75 + 0.5 * nz3.r);', 'col = soilT(uTxTop, vWPos.xy) * 2.6;', 2)
s = rep(s, 'if (d < 0.35) col = vec3(0.30, 0.25, 0.19) * (0.8 + 0.4 * nz3.r);', 'if (d < 0.35) col = soilT(uTxTop, vWPos.xy) * 3.2;')
s = rep(s, 'col = debris(p, lay, mtx * (0.85 + 0.3 * nz2.r), nz3);', 'col = lay < 0.5 ? soilT(uTxRubble, p) * 1.5 : (lay < 1.5 ? soilT(uTxSlag, p) * 3.0 : (lay < 2.5 ? soilT(uTxWaste, p) * 3.2 : soilT(uTxMixed, p) * 1.7));')
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('v3 ok', len(s))
