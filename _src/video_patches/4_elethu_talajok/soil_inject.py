# Valósághű talajtextúrák a videók metszet-shaderében (2026-11-20).
# A csempék (assets/tex/*.webp, 4 × 3 m, ismételhetők) base64-ben kerülnek a videó HTML-jébe; a lejátszó csak a betöltésük után indul.
import base64, os, re
TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'assets', 'tex')
UNI = {'clay': 'uTxClay', 'loess': 'uTxLoess', 'peat': 'uTxPeat', 'peatdry': 'uTxPeatDry', 'gyttja': 'uTxGyttja', 'rubble': 'uTxRubble', 'slag': 'uTxSlag', 'waste': 'uTxWaste',
       'mixed': 'uTxMixed', 'topsoil': 'uTxTop', 'sand': 'uTxSand', 'gravel': 'uTxGravel', 'silt': 'uTxSilt', 'natural': 'uTxNatural', 'grass': 'uTxGrass', 'grassdry': 'uTxGrassDry'}
def rep(s, old, new, n=1):
    assert s.count(old) == n, (old[:80], s.count(old)); return s.replace(old, new)
def inject(s, kinds):
    data = ',\n'.join('    %s: "data:image/webp;base64,%s"' % (k, base64.b64encode(open(os.path.join(TEX, k + '.webp'), 'rb').read()).decode()) for k in kinds)
    js = ('''
  var __SOILSRC = {
%s
  };
  var __soilImg = {}, __soilTexC = {};
  function __soilLoad() { return Promise.all(Object.keys(__SOILSRC).map((k) => new Promise((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = __SOILSRC[k]; __soilImg[k] = im; }))); }
  function __soilTex(k) { if (__soilTexC[k]) return __soilTexC[k]; const t = new Texture(__soilImg[k]); t.wrapS = t.wrapT = RepeatWrapping; t.colorSpace = SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; return __soilTexC[k] = t; }
  function __soilMap(k, rx, ry) { const t = __soilTex(k).clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return t; }
  function __soilUniforms() { const u = {}; for (const k of Object.keys(__SOILSRC)) u[__SOILUNI[k]] = { value: __soilTex(k) }; return u; }
  var __SOILUNI = %s;
''' % (data, repr({k: UNI[k] for k in kinds}).replace("'", '"')))
    s = rep(s, '<script>(() => {\n', '<script>(() => {\n' + js)
    s = rep(s, '  init().catch((e) => {', '  __soilLoad().then(init).catch((e) => {')
    # a metszet-shader: mintavevők + ismétlődést oldó kettős mintavétel
    glsl = ''.join('uniform sampler2D %s;\n' % UNI[k] for k in kinds) + '''vec3 soilT(sampler2D t, vec2 p){
  vec3 a = texture2D(t, p / vec2(4.0, 3.0)).rgb;
  vec3 b = texture2D(t, p * 0.71 / vec2(4.0, 3.0) + vec2(0.37, 0.21)).rgb;
  float k = smoothstep(0.38, 0.62, texture2D(uNoise, p * 0.045 + 0.13).g);
  return mix(a, b, k);
}
'''
    s = rep(s, 'varying vec3 vWPos;\nuniform sampler2D uNoise;\n', 'varying vec3 vWPos;\nuniform sampler2D uNoise;\n' + glsl)
    s = rep(s, 'Object.assign(sh.uniforms, SU, { uNoise: { value: T2.noise } });', 'Object.assign(sh.uniforms, SU, { uNoise: { value: T2.noise } }, __soilUniforms());')
    return s
