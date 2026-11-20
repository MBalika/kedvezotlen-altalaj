# Szövegdobozok középre zárásának ellenőrzése (2026-11-20).
# Minden keretes / háttérrel kiemelt dobozban (kártya, kvízválasz, gomb, csempe, szabály) a cím és a szöveg
# vízszintesen középen legyen: soronként mérjük a bal és a jobb oldali szabad helyet a doboz tartalomterületén belül.
# A hosszú, folyó szöveges dobozok (5 sornál több) külön listába kerülnek: ott a sorkizárás maradhat.
# Használat: python3 boxcenter.py <url> [szélesség=1440] [--click 'szelektor' …]   → kiírja a nem középre zárt dobozokat.
import asyncio, sys, json
from playwright.async_api import async_playwright

JS = r"""
() => {
  const out = [], seen = new Set();
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity !== 0; };
  const opaque = (c) => c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c);
  const isBox = (e) => {
    if (e.closest('svg,canvas,select,textarea,input,.modal,header,footer,nav,.topbar')) return false;
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.width < 70 || r.width > 1000 || r.height < 26) return false;
    const bw = ['Top','Right','Bottom','Left'].filter(s => parseFloat(cs['border' + s + 'Width']) > 0 && opaque(cs['border' + s + 'Color'])).length;
    const bg = opaque(cs.backgroundColor) && cs.backgroundColor !== getComputedStyle(e.parentElement || e).backgroundColor;
    const sh = cs.boxShadow && cs.boxShadow !== 'none';
    return bw >= 3 || bg || sh || e.tagName === 'BUTTON';
  };
  const textRects = (box) => {
    const rects = []; const w = document.createTreeWalker(box, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) {
      if (!n.nodeValue.trim()) continue; const p = n.parentElement; if (!p || !vis(p)) continue;
      if (p.closest('table')) continue;   // táblázatban marad a balra zárás
      { let a = p, abs = false; while (a && a !== box) { if (/absolute|fixed/.test(getComputedStyle(a).position)) { abs = true; break; } a = a.parentElement; } if (abs) continue; }   // sarokba tett címke, időtartam
      let q = p, nested = false; while (q && q !== box) { if (q.matches && q.matches('svg,canvas,button,input,label.rule input') || (q !== box && isBox(q) && q.getBoundingClientRect().width < box.getBoundingClientRect().width - 4)) { nested = true; break; } q = q.parentElement; }
      if (nested) continue;
      const rg = document.createRange(); rg.selectNodeContents(n); for (const r of rg.getClientRects()) if (r.width > 1) rects.push(r);
    }
    return rects;
  };
  for (const e of document.querySelectorAll('main *, body > section *, .hero *, #app *')) {
    if (seen.has(e) || !vis(e) || !isBox(e)) continue;
    const rects = textRects(e); if (!rects.length) continue;
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    const L = r.left + parseFloat(cs.borderLeftWidth) + parseFloat(cs.paddingLeft), R = r.right - parseFloat(cs.borderRightWidth) - parseFloat(cs.paddingRight);
    const lines = []; for (const t of rects.sort((a, b) => a.top - b.top || a.left - b.left)) { const l = lines.find(x => Math.abs(x.top - t.top) < t.height * 0.5); if (l) { l.left = Math.min(l.left, t.left); l.right = Math.max(l.right, t.right); } else lines.push({ top: t.top, left: t.left, right: t.right, h: t.height }); }
    // a dobozban lévő ikon/jelölőnégyzet helyét levonjuk a bal oldalból
    let icon = 0; for (const c of e.querySelectorAll('input[type=checkbox], input[type=radio], svg, img')) { const cr = c.getBoundingClientRect(); if (cr.width && cr.left < L + 60 && cr.right > L) icon = Math.max(icon, cr.right - L + 6); }
    const bad = lines.filter(l => { const gl = l.left - L - icon, gr = R - l.right; return (gl + gr) > 16 && Math.abs(gl - gr) > Math.max(10, 0.12 * (gl + gr)); });
    const txt = (e.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 70);
    const cls = e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
    if (bad.length) out.push({ cls, txt, lines: lines.length, bad: bad.length, long: lines.length > 5, ta: cs.textAlign });
  }
  return out;
}
"""

async def main():
    url = sys.argv[1]; w = int(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2].isdigit() else 1440
    clicks = [sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == '--click' and i + 1 < len(sys.argv)]
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': w, 'height': 1000})
        await pg.goto(url); await pg.wait_for_timeout(2500)
        for c in clicks:
            try: await pg.locator(c).first.click(timeout=3000); await pg.wait_for_timeout(400)
            except Exception as ex: print('kattintás sikertelen:', c)
        await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); await pg.wait_for_timeout(800)
        res = await pg.evaluate(JS)
        agg = {}
        for r in res:
            k = (r['cls'], r['long']); a = agg.setdefault(k, {'n': 0, 'ex': r['txt'], 'ta': r['ta']}); a['n'] += 1
        short = [(k, v) for k, v in agg.items() if not k[1]]; long_ = [(k, v) for k, v in agg.items() if k[1]]
        print(f'{url} @ {w}px: {sum(v["n"] for k, v in short)} rövid szövegű doboz nincs középen ({len(short)} fajta); hosszú szövegű: {sum(v["n"] for k, v in long_)}')
        for (c, _), v in sorted(short, key=lambda x: -x[1]['n']): print(f'  {v["n"]:3d}×  {c[:70]:70s} [{v["ta"]}]  „{v["ex"][:50]}”')
        if '--long' in sys.argv:
            for (c, _), v in long_: print(f'  hosszú {v["n"]:3d}×  {c[:60]}  „{v["ex"][:40]}”')
        await b.close()
asyncio.run(main())
