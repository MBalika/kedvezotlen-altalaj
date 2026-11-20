# Talajtextúrák előállítása: python3 _src/tex/render.py assets/tex   (helyi szerver a repó gyökerében, 8850-es port)
import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width':1100,'height':800})
        pg.on('pageerror', lambda e: print('ERR', e)); pg.on('console', lambda m: print('CON', m.text) if m.type=='error' else None)
        await pg.goto('http://localhost:8850/_src/tex/test.html'); await pg.wait_for_function('window.ready', timeout=120000)
        print(await pg.evaluate('window.times'))
        for k in await pg.evaluate('[...document.querySelectorAll("canvas")].map(c=>c.id)'):
            import base64
            d = await pg.evaluate("k=>document.getElementById(k).toDataURL('image/webp',0.7)", k)
            open(f'{sys.argv[1]}/{k}.webp','wb').write(base64.b64decode(d.split(',')[1]))
        await b.close()
asyncio.run(main())
