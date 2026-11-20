# Élethű talajok a videókban (2026-11-20)

A videók metszetében a talajok eddig a shaderben számolt, egyszínű-pöttyös kitöltések voltak. Most ugyanazokat a
valósághű csempéket használják, mint a weboldal (`assets/tex/*.webp`, 4 × 3 m, ismételhető; a `_src/tex/soiltex.js` rajzolja).

- `soil_inject.py` – közös rész: a csempék base64-ben a videó HTML-jébe kerülnek, a lejátszó csak a betöltésük után indul
  (`__soilLoad().then(init)`), a metszet-shader `soilT()` függvénye kettős mintavétellel oldja az ismétlődést.
- `v1.py` … `v4.py` – videónként, mit vált ki a textúra (agyag, lösz + löszfal + talajminták, feltöltésrétegek, tőzeg–homok–kavics).
- `v5.py` – az 5. videó tömörített csomagjában a metszet három vászontextúráját cseréli.
- `grass_lod.py` – a fű textúráját enyhén elmosott mip-szintről veszi (gyors kameramozgásnál kevésbé szikrázik).
- `apply_all.sh <kimeneti mappa> [forrásmappa]` – mind a 10 videó (magyar + angol) a forrásmappa (alapból a `videok/`)
  textúrázás előtti fájljaiból (`git show eef43e0^:videok/…`). A szkriptek kódhoz kötött cseréket végeznek, ezért az angol
  videókra változtatás nélkül futnak. Már javított fájlra nem futtathatók újra.

## Vibrálás elleni javítások (2026-11-20, második kör)

- A talajcsempék mintavétele 1,0 mip-eltolással történik (`SOIL_LOD`): a hajszálvékony erek és pöttyök mozgó kameránál
  különben képpontról képpontra fel-felvillantak.
- 5. videó: a metszetfedlapok (DoubleSide, hátoldaluk a vágási felület színe) hátoldala egybeesett a szomszédos test
  előlapjával, és z-harcot vívott vele – csíkos, villódzó sáv a lábazat és a födém alatt. A hátlapok mélységét a `v5.py`
  lejtésarányosan előrébb húzza (`gl_FragDepth = gl_FragCoord.z − 2·fwidth(z)`), így a hátlap mindig az előlap mögött marad.
- Mérés: 3 egymást követő képkocka második különbsége és be-ki-be váltás 4 képkockán; az 5. videó betonozás-jelenetében
  4,3 % → 0,7 % (az eredeti, textúra előtti változat 1,9 % volt). A fák lombja és a kerítés gyors kameramozgásnál
  minimálisan még csillog (ez az eredeti videókban is így volt).

A kép időzítése, a feliratok és a zene nem változott.
