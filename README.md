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


## Angol változat (`/en`)

- **Élő oldal:** https://kedvezotlen-altalaj.vercel.app/en („Foundations on unfavourable ground”) – brit angol, EC7-szóhasználat; a fejléc HU | EN váltója a választást megjegyzi (`localStorage 'alap-lang'`), és a másik nyelvű oldalon ugyanannál a fejezetnél folytat.
- A `python3 build.py` (a `_src`-ben) a magyar `index.html` mellett az `en.html`-t is elkészíti, és mindkettőt a gyökérbe másolja. Előfeltétel egyszer: `npm install` és `cd i18n && npm install`.
- Fordítás: `_src/i18n/apply.mjs` + `_src/i18n/en_k01–k08.tsv` (a magyar szöveg sha1-éhez rendelt angol párok); ha a magyar szöveg változik, a build leáll, a hiányzók a `_src/missing.tsv`-be kerülnek. Tizedespont (`i18n/numfix_js.mjs`), angol tördelési szabályok és en-gb elválasztás (`vendor/hyphenopoly/patterns/en-gb.wasm`).
- Az angol oldal az angol videókat játssza: `videok/en/1_Expansive_clays_EN_video.html` … `5_Underpinning_on_expansive_clay_EN_video.html` (ugyanaz a kép, időzítés és zene, angol feliratok). A videók angol változata a kész magyar HTML-ből készül szövegcserével (forrás: D:, `Claude videók\_forras\kedvezotlen_en_forras.zip`).

## Videók zenéje

A videók zenéje (2026-11) valódi hangszerek felvett mintáiból készült – zongora, vonósok, akusztikus és elektromos gitár, basszusgitár, fúvósok, akusztikus dob –, ütemre igazítva a képhez; a gép- és effekthangok a korábbi hangkönyvtárból vannak. Hangminták: Salamander Grand Piano (Alexander Holm, CC BY 3.0); tonejs-instruments (nbrosowsky; VSCO2, Karoryfer, Iowa, Freesound – CC BY 3.0); Tone.js dobminták.
