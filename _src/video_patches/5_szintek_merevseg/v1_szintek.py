# 1. videó, „Hány szintes házak károsodnak?” jelenet (105–115 s): két felirat egymás után.
#   1) Miért? – a könnyű házat fel tudja emelni az agyag (a „kis talpfeszültség / > 100 kPa” nyilakkal együtt)
#   2) Több szint – minél több szintes a ház, annál merevebb a szerkezete, és jobban bírja a mozgáskülönbséget
# Futtatás: python3 v1_szintek.py <1. videó html> [hu|en]   (a fájlt helyben javítja; már javított fájlon hibát jelez)
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n):
    global s
    assert s.count(o) == 1, (o[:80], s.count(o)); s = s.replace(o, n)
# a nyilak és címkéik csak az első felirattal együtt látszanak (különben belelógnak a kétsoros második feliratba)
rep('const pa = win(t, 110.8, 115, 0.5, 0.4);', 'const pa = win(t, 106.8, 110.0, 0.5, 0.4);')   # a második felirat előtt elhalványulnak
if lang == 'hu':
    rep('[110.6, 115, "Mi\\xE9rt?", ["A k\\xF6nny\\u0171 h\\xE1zat felemeli az agyag"]],',
        '[106.8, 109.9, "Mi\\xE9rt?", ["A *k\\xF6nny\\u0171* h\\xE1zat fel tudja emelni az agyag"]],\n'
        '    [110.1, 115, "T\\xF6bb szint", ["Min\\xE9l t\\xF6bb szintes a h\\xE1z, ann\\xE1l *merevebb* a szerkezete,", "\\xE9s jobban b\\xEDrja a mozg\\xE1sk\\xFCl\\xF6nbs\\xE9get"]],')
else:
    rep('[110.6, 115, "Why?", ["The clay lifts the light house"]],',
        '[106.8, 109.9, "Why?", ["The clay can lift a *light* house"]],\n'
        '    [110.1, 115, "More storeys", ["The more storeys a house has, the *stiffer* its structure,", "and the better it copes with differential movement"]],')
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
