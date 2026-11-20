# 5. videó (tömörített csomag): a metszet három talajtextúrája (termőtalaj, agyag, mély agyag) a valósághű csempékre cserélve
import sys, base64, os
from soil_inject import rep, TEX
s = open(sys.argv[1], encoding='utf-8').read()
kinds = ['topsoil', 'clay']
data = ','.join('%s:"data:image/webp;base64,%s"' % (k, base64.b64encode(open(os.path.join(TEX, k + '.webp'), 'rb').read()).decode()) for k in kinds)
pre = '<script>var __SOILSRC={%s};var __soilImg={};function __soilLoad(){return Promise.all(Object.keys(__SOILSRC).map(function(k){return new Promise(function(res){var im=new Image();im.onload=im.onerror=function(){res()};im.src=__SOILSRC[k];__soilImg[k]=im})}))}</script>\n' % data
i = s.index('function Si(i,A,e,t=!0)'); j = s.rfind('<script', 0, i); s = s[:j] + pre + s[j:]
s = rep(s, 'try{await Vx(),await i.init(e)', 'try{await __soilLoad(),await Vx(),await i.init(e)')
s = rep(s, 'return t.colorSpace=Ci,{top:i,clay:A,deep:e,cracks:t}}',
        'return t.colorSpace=Ci,{top:Si(1024,768,g=>{g.filter="brightness(1.5)";g.drawImage(__soilImg.topsoil,0,0)}),clay:Si(1024,768,g=>{g.filter="brightness(1.12)";g.drawImage(__soilImg.clay,0,0)}),deep:Si(1024,768,g=>{g.filter="saturate(0.3) brightness(0.98)";g.drawImage(__soilImg.clay,0,0)}),cracks:t}}')
open(sys.argv[2], 'w', encoding='utf-8').write(s); print('v5 ok', len(s))
