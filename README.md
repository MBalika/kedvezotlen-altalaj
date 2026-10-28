# Alapozás kedvezőtlen altalajon – interaktív segédanyag

Egyoldalas, statikus oktatási weboldal négy kedvezőtlen talajtípusról:

1. **Térfogatváltozó (duzzadó–zsugorodó) agyagok**
2. **Roskadékony talajok (lösz)**
3. **Feltöltések**
4. **Szerves talajok (tőzeg, szerves iszap)**

Tartalom: részletes magyarázatok, ábrák, interaktív kísérletek (ödométer, Venn-diagram, konszolidációs görbe, feszültségi hagymák…), fejezetenként egy 3D szimulátor csúszkákkal, animációs videók, kvízek, talajdetektív és igaz/hamis teszt.

- `index.html` – a teljes oldal (CSS és JS beágyazva, a three.js r169 is)
- `assets/` – videóposzterek
- `videok/` – a négy animációs videó önálló HTML-ként
- `vendor/hyphenopoly/` – magyar elválasztás (Hyphenopoly, saját tárhelyről)

Építés nélküli statikus oldal; a Vercel közvetlenül a repo gyökeréből szolgálja ki.

## Forrás és újraépítés

A szerkeszthető forrás a `_src/` mappában van (a Vercel nem teszi ki):

```
cd _src
npm install
python3 build.py          # → _src/dist/index.html
cp dist/index.html ../index.html
```

- `src/body.html` – az oldal szövege és szerkezete
- `src/style.css` – megjelenés (világos/sötét téma)
- `src/js/` – interaktív elemek (`widgets1.js`, `widgets2.js`), 3D szimulátor (`sim3d.js`), kvízek (`data.js`, `quiz.js`)
- A „Védekezés” oldal címe a `src/js/main.js` elején (`VEDEKEZES_URL`).
- `src/js/guard.js` – formázás: sorkizárás, magyar elválasztás, nem törő egységek (szám + mértékegység, névelő, szakkifejezés), lyukas sorkizárásnál balra zárt tartalék (`.rag`)
