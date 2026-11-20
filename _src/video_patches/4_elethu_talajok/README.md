# Élethű talajok a videókban (2026-11-20)

A videók metszetében a talajok eddig a shaderben számolt, egyszínű-pöttyös kitöltések voltak. Most ugyanazokat a
valósághű csempéket használják, mint a weboldal (`assets/tex/*.webp`, 4 × 3 m, ismételhető; a `_src/tex/soiltex.js` rajzolja).

- `soil_inject.py` – közös rész: a csempék base64-ben a videó HTML-jébe kerülnek, a lejátszó csak a betöltésük után indul
  (`__soilLoad().then(init)`), a metszet-shader `soilT()` függvénye kettős mintavétellel oldja az ismétlődést.
- `v1.py` … `v4.py` – videónként, mit vált ki a textúra (agyag, lösz + löszfal + talajminták, feltöltésrétegek, tőzeg–homok–kavics).
- `v5.py` – az 5. videó tömörített csomagjában a metszet három vászontextúráját cseréli.
- `apply_all.sh <kimeneti mappa>` – mind a 10 videó (magyar + angol) a `videok/` mappa akkori fájljaiból. A szkriptek kódhoz
  kötött cseréket végeznek, ezért az angol videókra változtatás nélkül futnak. Már javított fájlra nem futtathatók újra.

A kép időzítése, a feliratok és a zene nem változott.
