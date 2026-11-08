# Lombozat-vibrálás (1–5. videó): az alfa-tesztelt levélkártyák távolról ritkulnak és pixelenként ki-be kapcsolnak.
# Javítás: az alfát a mip-szint szerint felerősítjük (távolról is tömör, nyugodt lombkorona); az alpha-to-coverage
# a mérés szerint nem segített, ezért kikapcsoljuk.
import sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(s, old, new):
    assert s.count(old) == 1, (old[:70], s.count(old)); return s.replace(old, new)
GL = '#ifdef USE_MAP\\n      { vec2 dd = fwidth(vMapUv) * vec2(textureSize(map, 0)); diffuseColor.a *= 1.0 + 0.25 * max(0.0, log2(max(max(dd.x, dd.y), 1e-4))); }\\n      #endif\\n      #include <alphatest_fragment>'
if 'function foliageMaterial(tex)' in s:      # 1–4. videó (olvasható forrás)
    s = rep(s, 'alphaTest: 0.42, alphaToCoverage: true, side: DoubleSide', 'alphaTest: 0.42, side: DoubleSide')
    s = rep(s, '.replace("#include <normal_fragment_begin>", ShaderChunk.normal_fragment_begin.replace("normal *= faceDirection;", ""));\n    };\n    m.customProgramCacheKey = () => "leafcards";',
            '.replace("#include <alphatest_fragment>", "' + GL + '").replace("#include <normal_fragment_begin>", ShaderChunk.normal_fragment_begin.replace("normal *= faceDirection;", ""));\n    };\n    m.customProgramCacheKey = () => "leafcards";')
else:                                          # 5. videó (tömörített)
    s = s.replace('alphaTest:.42,alphaToCoverage:!0,side:Bg,vertexColors:!0', 'alphaTest:.42,side:Bg,vertexColors:!0')
    s = rep(s, '.replace("#include <normal_fragment_begin>",Rx.normal_fragment_begin.replace("normal *= faceDirection;",""))},A.customProgramCacheKey=()=>"leafcards"',
            '.replace("#include <alphatest_fragment>","' + GL + '").replace("#include <normal_fragment_begin>",Rx.normal_fragment_begin.replace("normal *= faceDirection;",""))},A.customProgramCacheKey=()=>"leafcards"')
open(out, 'w', encoding='utf-8').write(s)
print('leaf ok', out)
