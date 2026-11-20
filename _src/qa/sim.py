# A négy 3D talajlabor és néhány kiemelt elem fényképe: python3 _src/qa/sim.py <mappa> [url] [szélesség]
import asyncio, sys, os
from playwright.async_api import async_playwright
out = sys.argv[1]; url = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:8850/'; W = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
os.makedirs(out, exist_ok=True)
ARGS = ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']
SEL = sys.argv[4:] or ['.hero', '.sim@@0', '.sim@@1', '.sim@@2', '.sim@@3']
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=ARGS); pg = await b.new_page(viewport={'width': W, 'height': 1000}, device_scale_factor=1)
        pg.on('pageerror', lambda e: print('PAGEERR', str(e)[:300])); pg.on('console', lambda m: print('CONSOLE', m.text[:300]) if m.type == 'error' else None)
        await pg.goto(url, wait_until='networkidle'); await pg.wait_for_timeout(1500)
        for i, sel in enumerate(SEL):
            s, n = (sel.split('@@') + ['0'])[:2]; el = pg.locator(s).nth(int(n))
            if await el.count() == 0: print('nincs', sel); continue
            await el.evaluate('e=>e.scrollIntoView({block:"center"})'); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'{out}/{i:02d}.jpg', type='jpeg', quality=82, animations='disabled')
        await b.close()
asyncio.run(main())
