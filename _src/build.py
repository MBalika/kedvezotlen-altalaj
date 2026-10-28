import subprocess, os, sys
root = os.path.dirname(os.path.abspath(__file__))
os.chdir(root)
r = subprocess.run(['npx', 'esbuild', 'src/js/main.js', '--bundle', '--format=iife', '--minify', '--target=es2019', '--outfile=dist/app.js', '--log-level=warning'], capture_output=True, text=True)
if r.returncode: print(r.stderr); sys.exit(1)
css = open('src/style.css').read()
body = open('src/body.html').read()
js = open('dist/app.js').read().replace('</script', '<\\/script')
TITLE = 'Alapozás kedvezőtlen altalajon'
DESC = 'Interaktív segédanyag: térfogatváltozó agyag, roskadékony lösz, feltöltés és szerves talaj — 3D szimulátorokkal, animációkkal, kvízekkel.'
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,400..900&family=Atkinson+Hyperlegible:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap">'
head_common = f'<title>{TITLE}</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n<style>\n{css}\n</style>\n'
full = f'''<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="{DESC}">
<meta property="og:title" content="{TITLE}">
<meta property="og:description" content="{DESC}">
<meta property="og:image" content="assets/p2.jpg">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 26'%3E%3Crect x='7' y='1' width='12' height='24' rx='3' fill='%23222'/%3E%3Crect x='8.5' y='2.5' width='9' height='5' fill='%23f0a33a'/%3E%3Crect x='8.5' y='7.5' width='9' height='5' fill='%23ebc25c'/%3E%3Crect x='8.5' y='12.5' width='9' height='5' fill='%23b4a6ff'/%3E%3Crect x='8.5' y='17.5' width='9' height='6' fill='%2345d6b4'/%3E%3C/svg%3E">
<script src="vendor/hyphenopoly/Hyphenopoly_Loader.js"></script>
<script>Hyphenopoly.config({{ require: {{ "hu": "FORCEHYPHENOPOLY" }}, setup: {{ hide: "none", selectors: {{ ".hyphenate": {{ minWordLength: 6, compound: "auto" }} }} }} }});</script>
{head_common}</head>
<body>
{body}
<script>{js}</script>
</body>
</html>
'''
open('dist/index.html', 'w').write(full)
art = head_common + body + f'\n<script>{js}</script>\n'
open('dist/artifact.html', 'w').write(art)
print('ok', len(full) // 1024, 'KB')
