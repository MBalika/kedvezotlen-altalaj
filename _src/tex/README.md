# Talajtextúrák

`soiltex.js` – eljárással rajzolt, mindkét irányban ismételhető talajcsempék (1024 × 768 px = 4 × 3 m): agyag, lösz, tőzeg
(nedves és kiszáradt), szerves iszap, épülettörmelék, salak-hamu, házi szemét, vegyes földfeltöltés, termőtalaj, homok,
homokos kavics, iszapos teherbíró réteg, termett talaj, gyep (üde és kiszáradt). A zárómenet (`finish`) porfátyolt és
domborzati megvilágítást ad, ettől fényképszerű a felület.

Újragyártás (helyi szerver a repó gyökerében a 8850-es porton): `python3 _src/tex/render.py assets/tex`.
Az oldal a kész képeket tölti be (`src/js/soil.js`: vászonminta, SVG-minta `#tex-<fajta>`), a videók base64-ben tartalmazzák.
Ha egy csempe változik, növeld a `soil.js` `V` verzióját és a `style.css` `?v=` jelzését.
