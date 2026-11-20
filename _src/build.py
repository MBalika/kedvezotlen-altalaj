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
    fonts = '<link rel="preload" href="/fonts/archivo-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="/fonts/atkinson-hyperlegible-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin><style>@font-face{font-family:\'Archivo\';font-style:normal;font-weight:400 900;font-stretch:100% 125%;font-display:swap;src:url(fonts/archivo-latin-ext-standard-normal.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'Archivo\';font-style:normal;font-weight:400 900;font-stretch:100% 125%;font-display:swap;src:url(fonts/archivo-latin-standard-normal.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-ext-400-normal.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-400-normal.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-ext-700-normal.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:normal;font-weight:700;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-700-normal.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:italic;font-weight:400;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-ext-400-italic.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'Atkinson Hyperlegible\';font-style:italic;font-weight:400;font-display:swap;src:url(fonts/atkinson-hyperlegible-latin-400-italic.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:\'IBM Plex Mono\';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/ibm-plex-mono-latin-ext-400-normal.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'IBM Plex Mono\';font-style:normal;font-weight:400;font-display:swap;src:url(fonts/ibm-plex-mono-latin-400-normal.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}@font-face{font-family:\'IBM Plex Mono\';font-style:normal;font-weight:500;font-display:swap;src:url(fonts/ibm-plex-mono-latin-ext-500-normal.woff2) format(\'woff2\');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}@font-face{font-family:\'IBM Plex Mono\';font-style:normal;font-weight:500;font-display:swap;src:url(fonts/ibm-plex-mono-latin-500-normal.woff2) format(\'woff2\');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}</style>'
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
shutil.copy('src/js/soil.js', EN + '/js/soil.js')   # nincs benne fordítandó szöveg
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
# a védekezés- és a hatások-oldalnak is van angol változata: az angol oldal arra mutat
p = 'dist/en.html'; t = open(p).read()
for s in ['vedekezesakarossullyedesekellen', 'sikalapokaterohatasok']:
    t, k = re.subn(rf'"https://{s}\.vercel\.app/?(#[\w-]+)?"', lambda m, s=s: f'"https://{s}.vercel.app/en' + (m.group(1) or '') + '"', t); assert k, s
open(p, 'w').write(t)
shutil.copy('dist/en.html', '../en.html')
