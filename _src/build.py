"""Összeállítja a magyar (index.html) és az angol (en.html → /en) oldalt a src/ forrásból, és a repó gyökerébe másolja.

Használat:  cd _src && npm install && (cd i18n && npm install) && python3 build.py
Az angol változat a magyar forrásból készül: az i18n/apply.mjs a fordítási egységeket (HTML-szövegek, attribútumok,
JS-karakterláncok) az i18n/en_*.tsv párjai szerint cseréli (.en/ mappába), és abból épül az en.html.
Hiányzó fordításnál az angol build leáll, a hiányzó egységek a missing.tsv-be kerülnek.
"""
import subprocess, os, sys, re, shutil, glob
root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)
SITE = 'https://kedvezotlen-altalaj.vercel.app'
FILES = ['body.html', 'js/data.js', 'js/guard.js', 'js/main.js', 'js/quiz.js', 'js/sim3d.js', 'js/util.js', 'js/widgets1.js', 'js/widgets2.js']
META = {
  'hu': ('Alapozás kedvezőtlen altalajon', 'Interaktív segédanyag: térfogatváltozó agyag, roskadékony lösz, feltöltés és szerves talaj — 3D szimulátorokkal, animációkkal, kvízekkel.', 'hu'),
  'en-GB': ('Foundations on unfavourable ground', 'Interactive learning module: expansive clay, collapsible loess, made ground and organic soil — with 3D simulators, animations and quizzes.', 'en-gb'),
}
ALT = f'<link rel="alternate" hreflang="hu" href="{SITE}/">\n<link rel="alternate" hreflang="en" href="{SITE}/en">\n<link rel="alternate" hreflang="x-default" href="{SITE}/">\n'
REDIR = "<script>/*nyelv*/try{if(localStorage.getItem('alap-lang')==='en'&&!/[?&]hu\\b/.test(location.search))location.replace('en'+location.hash)}catch(e){}</script>\n"


def build(src, out, lang):
    r = subprocess.run(['npx', 'esbuild', f'{src}/js/main.js', '--bundle', '--format=iife', '--minify', '--target=es2019', f'--outfile={out}.js', '--log-level=warning'], capture_output=True, text=True)
    if r.returncode: print(r.stderr); sys.exit(1)
    css = open(f'{src}/style.css').read()
    body = open(f'{src}/body.html').read()
    if lang != 'hu':   # a nyelvváltó a magyar oldalra mutat
        a = 'id="langSw" href="en" hreflang="en" lang="en"'; assert body.count(a) == 1
        body = body.replace(a, 'id="langSw" href="./" hreflang="hu" lang="hu"')
    js = open(f'{out}.js').read().replace('</script', '<\\/script')
    TITLE, DESC, HY = META[lang]
    fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">'
    head_common = f'<title>{TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n<style>\n{css}\n</style>\n'
    full = f'''<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{DESC}">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:image" content="assets/p2.jpg">
{ALT}{REDIR if lang == 'hu' else ''}<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 26'%3E%3Crect x='7' y='1' width='12' height='24' rx='3' fill='%23222'/%3E%3Crect x='8.5' y='2.5' width='9' height='5' fill='%23f0a33a'/%3E%3Crect x='8.5' y='7.5' width='9' height='5' fill='%23ebc25c'/%3E%3Crect x='8.5' y='12.5' width='9' height='5' fill='%23b4a6ff'/%3E%3Crect x='8.5' y='17.5' width='9' height='6' fill='%2345d6b4'/%3E%3C/svg%3E">
<script src="vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>
<script>Hyphenopoly.config({{ require: {{ "{HY}": "FORCEHYPHENOPOLY" }}, setup: {{ hide: "none", selectors: {{ ".hyphenate": {{ minWordLength: 6, compound: "auto" }} }} }} }});</script>
{head_common}</head>
<body>
{body}
<script>{js}</script>
</body>
</html>
'''
    open(f'{out}.html', 'w').write(full)
    if lang == 'hu': open('dist/artifact.html', 'w').write(head_common + body + f'\n<script>{js}</script>\n')
    print(os.path.basename(out) + '.html', len(full) // 1024, 'KB')


os.makedirs('dist', exist_ok=True)
build('src', 'dist/index', 'hu')
shutil.copy('dist/index.html', '../index.html')

# ---- angol változat ----
EN = '.en'
shutil.rmtree(EN, ignore_errors=True); os.makedirs(EN + '/js')
shutil.copy('src/style.css', EN + '/style.css')
tsv = ','.join(sorted(glob.glob('i18n/en_*.tsv')))
r = subprocess.run(['node', 'i18n/apply.mjs', 'src', EN, tsv, *FILES], capture_output=True, text=True, env={**os.environ, 'STRICT': '1', 'NUMFIX': '1'})
print(r.stdout.strip())
if r.returncode:
    print(r.stderr[-2500:]); print('Az angol változat nem készült el (a hiányzók: _src/missing.tsv).'); sys.exit(1)
if os.path.exists('missing.tsv'): os.remove('missing.tsv')
# tizedesvessző → pont: a HTML-szövegben (címkék között) és a JS-literálokban (acorn)
p = EN + '/body.html'; t = open(p).read()
open(p, 'w').write(re.sub(r'>([^<]*)<', lambda m: '>' + re.sub(r'(?<=\d),(?=\d)', '.', m.group(1)) + '<', t))
r = subprocess.run(['node', 'i18n/numfix_js.mjs', *[f'{EN}/{f}' for f in FILES if f.endswith('.js')]], capture_output=True, text=True, env={**os.environ, 'MODULE': '1'})
print(r.stdout.strip().replace('\n', ' · '))
if r.returncode: print(r.stderr); sys.exit(1)
build(EN, 'dist/en', 'en-GB')
shutil.copy('dist/en.html', '../en.html')
