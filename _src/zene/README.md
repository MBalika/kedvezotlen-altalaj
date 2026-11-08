# A videók zenéje (2026-11-08)

Hangmintás („élő”) zene a `kit/music_live2.py` motorral (a `_forras\zene_ujrakeveres_forras.zip`-ben), ütemhelyesen:
a tempót a jelenetvágásokhoz választottuk, a szakaszok egész ütemre, a becsapódások ütésre esnek, az effekthangok a látvány időpontjaira.

| Videó | Stílus | Tempó | Szóló |
|---|---|---|---|
| 1. Térfogatváltozó agyagok | indiepop | 114,25 | zongora |
| 2. Roskadékony talajok | indiepop | 110 | elektromos gitár |
| 3. Feltöltések | acoustic | 113,5 | elektromos gitár |
| 4. Szerves talajok | brassy | 106,5 | trombita |
| 5. Alapmegerősítés | indiepop | 100 | hegedű |

Újragenerálás: `python3 gen_specs.py` (1., 3., 4.), majd
`python3 kit/music_live2.py <dir>/events.json <dir>/music.json ki.wav` → `ffmpeg -i ki.wav -b:a 160k ki.mp3` → `tools/swap_audio.py`.
