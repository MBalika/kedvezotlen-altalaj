# Ütemhelyes zene-terv az 1., 3., 4. videóhoz: tempó a vágásokhoz, egész ütemre eső szakaszok, ütésre eső becsapódások,
# effekthangok a látvány időpontjaira (a régi, saját forrású hangsávok effektidőiből).
import json, os, sys, numpy as np
OUT = os.path.dirname(os.path.abspath(__file__))
SPEC = {
 '1_Terfogatvaltozo_agyagok': dict(total=176.0, style='indiepop', lead='piano', key=50, seed=9,
   chap=[(0, 'intro'), (12.2, 'title'), (19.6, 'grooveA'), (37.8, 'build'), (44, 'grooveA2'), (70.5, 'half'), (86, 'drive'), (105, 'grooveB'),
         (115, 'half'), (128, 'drive'), (166, 'title'), (172.5, 'outro')],
   impacts=[8.0, 12.2, 38.0, 70.5, 100.0], risers=[(5.2, 2), (35.6, 2), (68.3, 1)],
   cuts=[37.8, 44, 86, 105, 115, 128, 166], slams=[1.2, 3.4, 10.2], steps=[128.4, 134.2, 140.2, 146.2, 154.2, 160.4] + [44 + k * 22 / 12 for k in range(13)],
   sfx=[('strain', 7.4, dict(dur=0.7, g=0.45)), ('strain', 8.3, dict(dur=0.7, g=0.5)), ('strain', 9.4, dict(dur=0.7, g=0.45)),
        ('rumble', 37.6, dict(dur=3.0, g=0.7)), ('water', 46.0, dict(dur=5.0, g=0.18)), ('water', 63.5, dict(dur=4.0, g=0.15)),
        ('strain', 88.2, dict(dur=0.7, g=0.4)), ('strain', 89.6, dict(dur=0.7, g=0.4)), ('strain', 91.0, dict(dur=0.7, g=0.4)), ('strain', 92.4, dict(dur=0.7, g=0.4)),
        ('creak', 95.8, dict(dur=2.4, g=0.45)), ('strain', 100.1, dict(dur=0.6, g=0.45)), ('creak', 118.0, dict(dur=1.5, g=0.3)),
        ('rumble', 129.5, dict(dur=1.6, g=0.35)), ('water', 148.5, dict(dur=5.5, g=0.25))]),
 '3_Feltoltesek': dict(total=177.0, style='acoustic', lead='gel', key=52, seed=3,
   chap=[(0, 'intro'), (12, 'title'), (19.5, 'grooveA'), (37, 'half'), (53, 'drive'), (65, 'grooveB'), (77, 'build'), (82.45, 'drop'), (87, 'half'),
         (99, 'grooveA2'), (119, 'drive'), (167, 'title'), (173.5, 'outro')],
   impacts=[7.0, 12.3, 82.45, 127.4, 130.0], risers=[(4.6, 2), (80.0, 1)],
   cuts=[19.5, 37, 53, 65, 77, 87, 99, 119, 167], slams=[1.0, 3.4], steps=[99.4, 103.6, 108.0, 112.1, 116.1, 160.2],
   sfx=[('zap', 6.3, dict(dur=0.8, g=0.5)), ('rumble', 7.0, dict(dur=2.0, g=0.6)),
        ('dump', 21.4, dict(dur=1.8, g=0.45)), ('dump', 25.1, dict(dur=1.8, g=0.45)), ('dump', 28.5, dict(dur=1.8, g=0.45)), ('dump', 32.0, dict(dur=1.8, g=0.45)),
        ('creak', 56.0, dict(dur=3.0, g=0.4)), ('rumble', 57.5, dict(dur=3.0, g=0.45)), ('strain', 58.6, dict(dur=0.8, g=0.45)), ('strain', 60.8, dict(dur=0.8, g=0.45)),
        ('creak', 66.2, dict(dur=3.0, g=0.4)), ('strain', 67.6, dict(dur=0.8, g=0.4)), ('strain', 69.2, dict(dur=0.8, g=0.4)),
        ('hiss', 78.0, dict(dur=6.0, g=0.25)), ('water', 78.2, dict(dur=6.0, g=0.3)), ('rumble', 82.45, dict(dur=3.0, g=0.85)),
        ('gas', 87.6, dict(dur=11.0, g=0.3)), ('impact', 93.0, dict(size=0.8, g=0.4)),
        ('vibro', 120.8, dict(dur=2.5, f=55, g=0.35)), ('engine', 123.2, dict(dur=2.5, f=38, g=0.35)),
        ('bigdrop', 127.4, dict(s=1.0, g=0.85)), ('bigdrop', 130.0, dict(s=1.0, g=0.85)), ('vibro', 131.6, dict(dur=5.9, f=72, g=0.35)),
        ('hammer', 137.9, dict(kind='drive', s=1, g=0.5)), ('hammer', 138.98, dict(kind='drive', s=1, g=0.5)), ('hammer', 140.06, dict(kind='drive', s=1, g=0.5)),
        ('hammer', 141.14, dict(kind='drive', s=1, g=0.5)), ('hammer', 142.22, dict(kind='drive', s=1, g=0.5)),
        ('pump', 145.6, dict(dur=7.8, g=0.4)), ('dump', 155.7, dict(dur=4.3, g=0.45))]),
 '4_Szerves_talajok': dict(total=171.0, style='brassy', lead='trumpet', key=53, seed=12,
   chap=[(0, 'intro'), (13, 'title'), (20, 'half'), (34, 'grooveA'), (52, 'grooveA2'), (72, 'drive'), (96, 'grooveB'), (112, 'drive'), (142, 'grooveA'),
         (160, 'title'), (167, 'outro')],
   impacts=[10.8, 13.3, 92.6, 133.0], risers=[(8.5, 1), (90.4, 1)],
   cuts=[20, 34, 52, 72, 96, 112, 142, 160], slams=[1.0, 3.0], steps=[96.4, 101.2, 106.8, 112.4, 122.4, 132.4, 142.4, 147.2, 152.2, 156.2],
   sfx=[('rumble', 3.0, dict(dur=3.5, g=0.4)), ('creak', 4.5, dict(dur=3.0, g=0.3)), ('rumble', 6.5, dict(dur=3.5, g=0.4)), ('creak', 8.0, dict(dur=3.0, g=0.3)),
        ('water', 20.2, dict(dur=11.0, g=0.2)), ('blip', 34.6, dict(g=0.5)), ('blip', 35.4, dict(g=0.4)), ('beep', 38.8, dict(g=0.4)),
        ('push', 43.6, dict(dur=2.4, g=0.4)), ('strain', 48.6, dict(dur=1.6, g=0.3)), ('impact', 53.8, dict(size=0.6, g=0.4)), ('creak', 54.3, dict(dur=3.6, g=0.35)),
        ('creak', 74.0, dict(dur=3.0, g=0.4)), ('rumble', 74.4, dict(dur=3.0, g=0.4)), ('strain', 75.6, dict(dur=0.8, g=0.4)), ('strain', 77.0, dict(dur=0.8, g=0.4)),
        ('pump', 79.2, dict(dur=6.6, g=0.3)), ('rumble', 82.0, dict(dur=3.0, g=0.45)), ('strain', 83.2, dict(dur=1.0, g=0.35)),
        ('vibro', 90.8, dict(dur=5.0, f=30, g=0.45)), ('strain', 92.6, dict(dur=0.6, g=0.45)),
        ('dump', 112.8, dict(dur=2.8, g=0.35))] + [('hammer', 116.4 + k * 0.4, dict(kind='drive', s=0.8, g=0.35)) for k in range(10)] +
       [('engine', 122.6, dict(dur=3.2, f=60, g=0.3)), ('pour', 125.8, dict(dur=4.0, g=0.45)), ('impact', 130.4, dict(size=0.8, g=0.4)),
        ('strain', 148.4, dict(dur=0.8, g=0.4)), ('rumble', 156.3, dict(dur=3.5, g=0.5))]),
}

def plan(name, sp):
    chap_t = [c[0] for c in sp['chap'] if c[0] > 0]
    hits = sp['impacts'] + sp['cuts']
    best = None
    for bpm in np.arange(104, 117.01, 0.25):
        beat = 60 / bpm; bar = 4 * beat
        d = lambda t, u: min((t / u) % 1, 1 - (t / u) % 1) * u
        cost = np.sqrt(np.mean([d(t, bar) ** 2 for t in chap_t])) + np.sqrt(np.mean([d(t, beat) ** 2 for t in hits]))
        if best is None or cost < best[0]: best = (cost, bpm)
    bpm = float(best[1]); beat = 60 / bpm; bar = 4 * beat
    nb = sp['total'] / bar
    secs = []
    for i, (t, nm) in enumerate(sp['chap']):
        b0 = int(round(t / bar))
        b1 = int(round(sp['chap'][i + 1][0] / bar)) if i + 1 < len(sp['chap']) else int(np.ceil(nb)) + 1
        if b1 > b0: secs.append([b0, b1, nm])
    q = lambda t: round(t / beat) / 4
    mu = {'key': sp['key'], 'seed': sp['seed'], 'sections': secs,
          'transitions': {'risers': [[q(t), L] for t, L in sp['risers']], 'impacts': [q(t) for t in sp['impacts']], 'downs': [], 'revcym': []},
          'live': {'style': sp['style'], 'seed': sp['seed'], 'lead': sp['lead'], 'key': sp['key']}}
    ev = {'bpm': bpm, 'total': sp['total'], 'cuts': sp['cuts'], 'slams': [{'t': t, 'kind': 'word'} for t in sp['slams']], 'steps': sp['steps'],
          'sfx': [dict(type=ty, t=t, **kw) for ty, t, kw in sp['sfx']]}
    d = os.path.join(OUT, name); os.makedirs(d, exist_ok=True)
    json.dump(ev, open(f'{d}/events.json', 'w'), indent=1); json.dump(mu, open(f'{d}/music.json', 'w'), indent=1)
    print(name, 'bpm', bpm, 'cost', round(best[0], 3), 'sections', [(s[0], round(s[0] * bar, 1), s[2]) for s in secs])

for k, v in SPEC.items():
    if len(sys.argv) < 2 or sys.argv[1] in k: plan(k, v)
