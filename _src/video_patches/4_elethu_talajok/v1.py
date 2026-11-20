import sys
from soil_inject import inject, rep
s = open(sys.argv[1], encoding='utf-8').read()
s = inject(s, ['clay', 'topsoil', 'gravel'])
s = rep(s, '''        vec3 col = mix(clayWet, clayDry, dryAmt);
        col *= 0.88 + 0.24 * nz.r;
        col *= 0.94 + 0.12 * sin(y * 5.0 + nz.g * 6.0);
        float mott = smoothstep(0.66, 0.78, nz2.g);
        col = mix(col, col * vec3(1.35, 0.97, 0.62), mott * 0.38);''',
'''        vec3 col = soilT(uTxClay, vWPos.xy) * mix(vec3(0.9, 0.98, 1.1), vec3(2.3, 2.5, 2.8), dryAmt);
        col = mix(vec3(dot(col, vec3(0.3, 0.59, 0.11))), col, 0.74);''')
s = rep(s, '''          vec3 ts = mix(vec3(0.12, 0.09, 0.065), vec3(0.30, 0.24, 0.17), clamp(uDry * 0.9, 0.0, 1.0));
          ts *= 0.75 + 0.5 * nz3.r;''', '''          vec3 ts = soilT(uTxTop, vWPos.xy) * mix(2.2, 5.0, clamp(uDry * 0.9, 0.0, 1.0));''')
s = rep(s, 'if (gravel > 0.5) { col = mix(vec3(0.5, 0.48, 0.44), vec3(0.75, 0.72, 0.66), step(0.55, nz3.g)) * (0.8 + 0.3 * nz3.r); }', 'if (gravel > 0.5) { col = texture2D(uTxGravel, vWPos.xy / vec2(1.6, 1.2)).rgb * 1.35; }')
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('v1 ok', len(s))
