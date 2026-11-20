import sys
from soil_inject import inject, rep
s = open(sys.argv[1], encoding='utf-8').read()
s = inject(s, ['peat', 'peatdry', 'sand', 'gravel', 'silt', 'topsoil'])
def body(s, head, nxt, new):
    a = s.index(head); b = s.index(nxt, a + len(head)); assert s.count(head) == 1; return s[:a] + new + s[b:]
s = body(s, 'vec3 peat(vec2 p, float D, vec4 nz, float wet, float dried){', 'vec3 sand(vec2 p, vec4 nz, vec4 nz3){', '''vec3 peat(vec2 p, float D, vec4 nz, float wet, float dried){
  vec2 q = vec2(p.x, -D) * 0.75;
  vec3 col = soilT(uTxPeat, q) * 3.2;
  col = mix(col, col * vec3(0.8, 0.88, 1.05) + vec3(0.0, 0.01, 0.02), wet * 0.6);
  vec3 dcol = soilT(uTxPeatDry, q) * 2.1;
  return mix(col, dcol, dried);
}
''')
s = body(s, 'vec3 sand(vec2 p, vec4 nz, vec4 nz3){', 'vec3 gravel(vec2 p, vec4 nz, vec4 nz3){', 'vec3 sand(vec2 p, vec4 nz, vec4 nz3){ return soilT(uTxSand, p) * vec3(1.0, 1.05, 1.2); }\n')
s = body(s, 'vec3 gravel(vec2 p, vec4 nz, vec4 nz3){', 'vec3 clayB(vec2 p, vec4 nz){', 'vec3 gravel(vec2 p, vec4 nz, vec4 nz3){ return soilT(uTxGravel, p) * 1.15; }\n')
s = rep(s, 'vec3 clayB(vec2 p, vec4 nz){ return vec3(0.27, 0.30, 0.34) * (0.85 + 0.25 * nz.r) * (0.94 + 0.06 * sin(p.y * 14.0 + nz.g * 4.0)); }', 'vec3 clayB(vec2 p, vec4 nz){ return soilT(uTxSilt, p) * vec3(1.05, 1.32, 1.9); }')
s = rep(s, 'col = vec3(0.16, 0.12, 0.08) * (0.75 + 0.5 * nz3.r);', 'col = soilT(uTxTop, vWPos.xy) * 2.5;', 3)
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('v4 ok', len(s))
