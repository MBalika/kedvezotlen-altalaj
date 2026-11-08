# Vibrálás-javítás az 5. videóhoz (más, tömörített lejátszó): a 3D kép utófeldolgozó (bloom) láncának rendercéljai
# eddig élsimítás nélkül készültek -> 4x MSAA; a kép a tényleges megjelenítési felbontásban készül (nincs CSS-kicsinyítés);
# pontosabb mélység (közeli vágósík 0,05 -> 0,12). A lombozatot a leaf_mip.py javítja (mind az 5 videóban).
import sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(s, old, new):
    assert s.count(old) == 1, (old[:70], s.count(old)); return s.replace(old, new)
s = rep(s, 'n=new $e(40,Aa/Ys,.05,6e3)', 'n=new $e(40,Aa/Ys,.12,6e3)')
s = rep(s, 'sin(uWind*4.0 + rnd*30.0)*0.03;', 'sin(uWind*4.0 + rnd*30.0)*0.012;')
s = rep(s, 'let D=new z0(e);D.setPixelRatio(1),D.setSize(Aa,Ys),D.addPass(new X0(t,n));',
        'let D=new z0(e);D.setPixelRatio(1),D.setSize(Aa,Ys),D.renderTarget1.samples=4,D.renderTarget2.samples=4,'
        'window.__setRes=k=>{if(Math.round(Aa*k)===e.domElement.width)return;e.setPixelRatio(k),D.setPixelRatio(k)},D.addPass(new X0(t,n));')
s = rep(s, 'r.style.transform=`scale(${iA}) translate(-50%,-50%)`,r.style.width="1920px",r.style.height="1080px"}',
        'r.style.transform=`scale(${iA}) translate(-50%,-50%)`,r.style.width="1920px",r.style.height="1080px",'
        '!E&&window.__setRes&&window.__setRes(Math.min(1,Math.max(.34,iA*(window.devicePixelRatio||1))))}')
s = rep(s, 'k(),E=!0,AA=!1,D.style.display="flex";try{await mA()}catch(iA){console.error(iA),alert("Export hiba: "+iA.message)}E=!1,D.style.display="none"}',
        'k(),E=!0,AA=!1,D.style.display="flex",window.__setRes&&window.__setRes(1);try{await mA()}catch(iA){console.error(iA),alert("Export hiba: "+iA.message)}E=!1,D.style.display="none",f()}')
open(out, 'w', encoding='utf-8').write(s)
print('v5 fix ok', len(s))
