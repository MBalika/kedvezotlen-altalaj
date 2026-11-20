import sys
from soil_inject import inject, rep
s = open(sys.argv[1], encoding='utf-8').read()
s = inject(s, ['loess', 'topsoil', 'sand', 'mixed'])
s = rep(s, '''        vec3 col = vec3(0.56, 0.40, 0.21);
        col *= 0.9 + 0.2 * nz.r;
        col *= 0.95 + 0.07 * sin(y * 9.0 + nz.g * 5.0);''', '''        vec3 col = soilT(uTxLoess, vWPos.xy) * vec3(0.9, 0.9, 0.95);''')
s = rep(s, 'col = mix(col, col * 0.7, joint * 0.6);', 'col = mix(col, col * 0.7, joint * 0.4);')
s = rep(s, '        // paleosol band\n        float pTop = 3.3', '        speck *= 0.0; doll *= 0.0;   // a textúra tartalmazza a pórusokat és a löszbabákat\n        // paleosol band\n        float pTop = 3.3')
s = rep(s, 'vec3 ts = vec3(0.17, 0.125, 0.085) * (0.75 + 0.5 * nz3.r);', 'vec3 ts = soilT(uTxTop, vWPos.xy) * 2.8;')
# löszfal (mélyút, pincesor): valódi lösztextúra
s = rep(s, 'Object.assign(sh.uniforms, LU, { uNoise: { value: T2.noise }, uBase: { value: base } });', 'Object.assign(sh.uniforms, LU, { uNoise: { value: T2.noise }, uBase: { value: base }, uTxLoess: { value: __soilTex("loess") } });')
s = rep(s, 'varying vec3 vWPos; uniform sampler2D uNoise; uniform float uWallWet, uBase;', 'varying vec3 vWPos; uniform sampler2D uNoise; uniform sampler2D uTxLoess; uniform float uWallWet, uBase;')
s = rep(s, """        vec3 col = vec3(0.80, 0.68, 0.49) * (0.86 + 0.26 * n1.r);
        col *= 0.93 + 0.1 * n2.g;""", """        vec3 col = mix(texture2D(uTxLoess, p / vec2(4.0, 3.0)).rgb, texture2D(uTxLoess, p * 0.63 / vec2(4.0, 3.0) + 0.41).rgb, smoothstep(0.4, 0.6, n1.r)) * vec3(1.22, 1.3, 1.5);""")
s = rep(s, 'col = mix(col, vec3(0.95, 0.92, 0.85), d * 0.8);', 'col = mix(col, vec3(0.95, 0.92, 0.85), d * 0.0);')
s = rep(s, 'col = mix(col, vec3(0.2, 0.15, 0.1), pore * 0.7);', 'col = mix(col, vec3(0.2, 0.15, 0.1), pore * 0.0);')
# talajminták (1:46–1:56): valódi homok- és feltöltéstextúra a hengereken
s = rep(s, 'const tS = mkStand(0, () => sandM);', 'const tS = mkStand(0, () => new MeshStandardMaterial({ map: __soilMap("sand", 0.55, 0.2), roughness: 0.95 }));')
s = rep(s, 'const tF = mkStand(3.2, () => fillM);', 'const tF = mkStand(3.2, () => new MeshStandardMaterial({ map: __soilMap("mixed", 0.9, 0.34), roughness: 0.95 }));')
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('v2 ok', len(s))
