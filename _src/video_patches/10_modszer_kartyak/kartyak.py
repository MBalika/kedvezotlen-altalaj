# Videókon belüli átjárás a módszerek részletes videóira (2026-11-20).
# A javítási / alapozási jelenetek alatt a kép jobb felső sarkában bélyegképes, kattintható kártya jelenik meg
# („Nézd meg részletesen”): megállítja a videót, és megnyitja a módszer videóját – a weboldalba ágyazva a szülőoldal
# lejátszóablakában (postMessage: {kaMethod: kulcs}), önálló fájlként új lapon. Az MP4-exportba nem kerül bele.
# Futtatás: python3 kartyak.py <videó html> <2|3|4> hu|en <assets/mv mappa>
import sys, base64, io, json
from PIL import Image
f, vid, lang, mv = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
EN = lang == 'en'
s = open(f, encoding='utf-8').read()
assert 'id="mvk"' not in s and "mvk" not in s[-6000:], 'már javítva'
WIN = {'2': [[153, 159.8, 'dong'], [163.2, 167.8, 'tj7']],
       '3': [[125.2, 130.8, 'dong'], [131.8, 137.4, 'vibro'], [137.8, 144.6, 'fdp'], [145.6, 154.6, 'inj'], [156, 166.6, 'tj1']],
       '4': [[112.4, 121.8, 'tj1'], [122.4, 131.8, 'mv1']]}[vid]
VED, MEL = 'https://vedekezesakarossullyedesekellen.vercel.app', 'https://melyalapozasok.vercel.app'
YT = 'https://www.youtube.com/watch?v='
D = {  # kulcs: (magyar név, angol név, magyar forrás, angol forrás, magyar cím, angol cím)
 'dong': ('Ejtett döngölés', 'Dynamic compaction', 'valós felvétel · BME · YouTube', 'real footage · Geotech Project', YT + 'LtSalNj4ByQ', YT + 'VNDEW8acU_0'),
 'vibro': ('Vibroflotáció', 'Vibroflotation', 'valós felvétel · BME · YouTube', 'real footage · Geotech Project', YT + 'Gca4PGhTC5o', YT + 'I1M6afZLrxo'),
 'fdp': ('Talajkiszorításos cölöp', 'Displacement piles', 'valós felvétel · BME · YouTube', 'real footage · Geotech Project', YT + 'hwP8iZzAq6I', YT + 'Mps1k494kSo'),
 'inj': ('Injektálás', 'Grouting', 'valós felvétel · BME · YouTube', 'real footage · Geotech Project', YT + 'CgKwZBWn_xM', YT + 'bVTljbQcE6U'),
 'tj1': ('Talajcsere', 'Soil replacement', 'animáció · Védekezés app', 'animation · Protection app', VED + '/video/tj1.html', VED + '/video/en/tj1.html'),
 'tj7': ('Előterhelés', 'Preloading', 'animáció · Védekezés app', 'animation · Protection app', VED + '/video/tj7.html', VED + '/video/en/tj7.html'),
 'mv1': ('Mélyalapozás', 'Deep foundations', 'animáció · Mélyalapozások app', 'animation · Deep foundations app', MEL + '/video/v1.html', MEL + '/video/en/v1.html'),
}
def thumb(k):
    p = '%s/%s%s.webp' % (mv, k, '_en' if EN else ''); im = Image.open(p).convert('RGB').resize((352, 198), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=72, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
data = {k: {'n': D[k][1 if EN else 0], 's': D[k][3 if EN else 2], 'u': D[k][5 if EN else 4], 'yt': D[k][4].startswith(YT), 'img': thumb(k)} for _, _, k in WIN}
def rep(o, n, c=None):
    global s
    k = s.count(o); assert k >= 1 and (c is None or k == c), (o, k); s = s.replace(o, n)
rep('  function renderAt(t) {', '  function renderAt(t) {\n    window.__vt = t;', 1)
rep('playing = true;', 'playing = window.__vplay = true;')
rep('playing = false;', 'playing = window.__vplay = false;')
HEAD = 'Watch in detail' if EN else 'Nézd meg részletesen'
inj = '''<style>
#mvk{position:absolute;right:56px;top:56px;width:380px;padding:12px 12px 14px;border:0;border-radius:18px;background:rgba(8,10,12,.82);color:#fff;font:600 22px/1.25 Inter,Arial,sans-serif;text-align:left;cursor:pointer;z-index:4;opacity:0;transform:translateY(-14px);transition:opacity .45s,transform .45s;pointer-events:none;box-shadow:0 14px 34px rgba(0,0,0,.45)}
#mvk.on{opacity:1;transform:none;pointer-events:auto}#mvk:hover{background:rgba(20,24,28,.92)}
#mvk i{display:block;font:700 15px/1 Inter,Arial,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#f0a33a;margin:2px 4px 10px}
#mvk span.th{display:block;position:relative;aspect-ratio:16/9;border-radius:10px;background-size:cover;background-position:center;overflow:hidden}
#mvk span.pl{position:absolute;left:50%;top:50%;width:72px;height:50px;margin:-25px 0 0 -36px;border-radius:14px;background:#f0a33a;display:grid;place-items:center}
#mvk.yt span.pl{background:#ff1f1f}#mvk span.pl:after{content:"";border-left:20px solid #111;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:5px}
#mvk.yt span.pl:after{border-left-color:#fff}
#mvk b{display:block;margin:11px 4px 2px;font-size:25px}#mvk small{display:block;margin:0 4px;font:500 16px/1.3 Inter,Arial,sans-serif;color:#c9d2ce}
</style>
<script>(function(){
  var W=@@W@@,D=@@D@@,wrap=document.getElementById("wrap");if(!wrap||/[?&]render=1/.test(location.search))return;
  var el=document.createElement("button");el.id="mvk";el.type="button";wrap.appendChild(el);var cur=null;
  function show(k){cur=k;if(!k){el.className="";return}var d=D[k];el.innerHTML='<i>@@H@@</i><span class="th" style="background-image:url('+d.img+')"><span class="pl"></span></span><b></b><small></small>';
    el.querySelector("b").textContent=d.n;el.querySelector("small").textContent=d.s;el.className="on"+(d.yt?" yt":"")}
  setInterval(function(){var t=window.__vt||0,k=null;for(var i=0;i<W.length;i++)if(t>=W[i][0]&&t<W[i][1])k=W[i][2];if(k!==cur)show(k)},200);
  el.addEventListener("click",function(e){e.stopPropagation();if(!cur)return;var pp=document.getElementById("pp");if(window.__vplay&&pp)pp.click();
    if(window.parent&&window.parent!==window){try{window.parent.postMessage({kaMethod:cur},"*");return}catch(x){}}window.open(D[cur].u,"_blank","noopener")});
})();</script>
'''.replace('@@W@@', json.dumps(WIN)).replace('@@D@@', json.dumps(data, ensure_ascii=False)).replace('@@H@@', HEAD)
assert s.rstrip().endswith('</script></body></html>')
i = s.rindex('</body></html>'); s = s[:i] + inj + s[i:]
open(f, 'w', encoding='utf-8').write(s); print('ok', f, len(inj) // 1024, 'KB')
