# 2. videó, „További módszerek” jelenet (152–168 s): elárasztás + előterhelés helyesen.
# Korábban: kis keretes medence és mellette külön földdomb. Most: nagy terület alacsony, rézsűs földgátak között;
# elárasztják (160,2–162,6 s), majd tolólap tolja rá a töltést a víz fölé (162,8–165,4 s), és a terhelés alatt az
# egész terület megroskad (165,4–167,4 s). Feliratok: ELÁRASZTÁS, ELŐTERHELÉS, ROSKADÁS + két felirat egymás után.
# Futtatás: python3 v2_elarasztas.py <2. videó html> hu|en   (helyben javít; már javított fájlon hibát jelez)
import sys
f, lang = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else 'hu')
s = open(f, encoding='utf-8').read()
def rep(o, n):
    global s
    assert s.count(o) == 1, (o[:90], s.count(o)); s = s.replace(o, n)

OLD_BUILD = '''    const pond = new Group();
    pond.position.set(26, 0, -6);
    group.add(pond);
    [[0, 0.5, -6, 16, 1, 1], [0, 0.5, 6, 16, 1, 1], [-8, 0.5, 0, 1, 1, 12], [8, 0.5, 0, 1, 1, 12]].forEach(([x, y, z, sx, sy, sz]) => {
      const b = new Mesh(new BoxGeometry(sx, sy, sz), berm);
      b.position.set(x, y, z);
      b.castShadow = b.receiveShadow = true;
      pond.add(b);
    });
    const pw = new Mesh(new PlaneGeometry(15, 11), new MeshStandardMaterial({ color: 4878214, metalness: 0.7, roughness: 0.08, transparent: true, opacity: 0.9 }));
    pw.rotation.x = -Math.PI / 2;
    pond.add(pw);
    const mound = new Mesh(new SphereGeometry(7, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), berm);
    mound.scale.set(1.3, 0.45, 1);
    mound.position.set(26, 0, 14);
    mound.castShadow = mound.receiveShadow = true;
    group.add(mound);
'''
NEW_BUILD = '''    // elárasztás + előterhelés: nagy terület alacsony földgátak között; elárasztják, majd töltést tolnak rá, és a terhelés alatt megroskad
    const pond = new Group();
    pond.position.set(POND.x, 0, POND.z);
    group.add(pond);
    const trap = (w, h, len, sx, sz) => {   // rézsűs hasáb: a felső csúcsok befelé húzva (oldalt sx, a végeken sz méterrel)
      const gm = new BoxGeometry(w, h, len);
      const pa = gm.attributes.position;
      for (let i = 0; i < pa.count; i++) if (pa.getY(i) > 0) {
        pa.setX(i, Math.sign(pa.getX(i)) * Math.max(0.2, Math.abs(pa.getX(i)) - sx));
        pa.setZ(i, Math.sign(pa.getZ(i)) * Math.max(0.2, Math.abs(pa.getZ(i)) - sz));
      }
      gm.translate(0, h / 2, 0);
      gm.computeVertexNormals();
      const nr = gm.attributes.normal, uv = gm.attributes.uv;   // méterhez igazított mintázás (a csempe 4 × 3 m), hogy ne nyúljon meg
      for (let i = 0; i < pa.count; i++) {
        const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
        if (Math.abs(nr.getY(i)) > 0.6) uv.setXY(i, x / 4, z / 3);
        else if (Math.abs(nr.getX(i)) >= Math.abs(nr.getZ(i))) uv.setXY(i, z / 4, y / 3);
        else uv.setXY(i, x / 4, y / 3);
      }
      uv.needsUpdate = true;
      return gm;
    };
    const dikeM = new MeshStandardMaterial({ map: __soilMap("loess", 1, 1), color: 14075556, roughness: 0.96 });
    const PW = POND.w, PD = POND.d, DH = 0.7, DW = 3.4;
    // a sarkokban a két gát nem eshet egy síkba (z-harc): a végük 0,3 m-rel rövidebb, a keresztirányú 1,2 cm-rel alacsonyabb
    const dikeX = trap(DW, DH, PW + 2 * DW - 0.6, 1.15, 1.15), dikeZ = trap(DW, DH - 0.012, PD + 2 * DW - 0.6, 1.15, 1.15);
    [[0, -(PD + DW) / 2, Math.PI / 2, dikeX], [0, (PD + DW) / 2, Math.PI / 2, dikeX], [-(PW + DW) / 2, 0, 0, dikeZ], [(PW + DW) / 2, 0, 0, dikeZ]].forEach(([x, z, ry, gm]) => {
      const b = new Mesh(gm, dikeM);
      b.rotation.y = ry;
      b.position.set(x, 0, z);
      b.castShadow = b.receiveShadow = true;
      pond.add(b);
    });
    const pw = new Mesh(new PlaneGeometry(PW + 1.8, PD + 1.8), new MeshStandardMaterial({ color: 4878214, metalness: 0.7, roughness: 0.08, transparent: true, opacity: 0.9 }));
    pw.rotation.x = -Math.PI / 2;
    pond.add(pw);
    const fillM = new MeshStandardMaterial({ map: __soilMap("mixed", 1, 1), roughness: 0.97 });
    const fillG = trap(PW - 0.6, POND.h, PD - 0.6, 2.6, 2.6);
    fillG.translate((PW - 0.6) / 2, 0, 0);   // a bal széléről nő
    const mound = new Mesh(fillG, fillM);
    mound.position.set(-(PW - 0.6) / 2, 0, 0);
    mound.castShadow = mound.receiveShadow = true;
    pond.add(mound);
    const dozer = new Group();
    const dz1 = new Mesh(new BoxGeometry(3.6, 0.9, 0.9), blk), dz2 = dz1.clone();
    dz1.position.set(0, 0.45, -1.1);
    dz2.position.set(0, 0.45, 1.1);
    const dzb = new Mesh(new BoxGeometry(2.8, 1.2, 2.2), yel);
    dzb.position.set(-0.2, 1.4, 0);
    const dzc = new Mesh(new BoxGeometry(1.3, 1.2, 1.6), new MeshStandardMaterial({ color: 10466240, metalness: 0.6, roughness: 0.1 }));
    dzc.position.set(-0.7, 2.6, 0);
    const dzl = new Mesh(new BoxGeometry(0.25, 1.3, 3.6), new MeshStandardMaterial({ color: 5592405, metalness: 0.5, roughness: 0.5 }));
    dzl.position.set(2.3, 0.75, 0);
    [dz1, dz2, dzb, dzc, dzl].forEach((m) => {
      m.castShadow = true;
      dozer.add(m);
    });
    pond.add(dozer);
'''
rep(OLD_BUILD, NEW_BUILD)
rep('''      pw.position.y = 0.05 + 0.85 * floodK;
      pw.visible = floodK > 0.01;
      mound.scale.y = 0.45 * Math.max(moundK, 1e-3);
      mound.visible = moundK > 0.01;
''', '''      const lvl = 0.05 + 0.45 * floodK - 0.38 * moundK;   // a töltés alatt a víz beszivárog
      pw.position.y = lvl;
      pw.visible = floodK > 0.01 && lvl > 0.07;
      mound.scale.x = Math.max(moundK, 1e-3);
      fillM.map.repeat.x = Math.max(moundK, 1e-3);   // a mintázat a terephez rögzül, nem nyúlik a töltéssel
      fillM.map.offset.x = (moundK - 1) * (POND.w - 0.6) / 8;
      mound.visible = moundK > 0.01;
      const fx = -(POND.w - 0.6) / 2 + (POND.w - 0.6) * moundK;   // a töltés eleje
      dozer.visible = moundK > 0.01 && moundK < 0.995;
      dozer.position.set(Math.max(fx - 4.2, -(POND.w - 0.6) / 2 + 1.5), POND.h, -2);
      pond.position.y = -POND.s * settleK;   // roskadás a terhelés alatt
''')
rep('function update(t, t0, period = 3, nShown = 8, floodK = 0, moundK = 0) {', 'function update(t, t0, period = 3, nShown = 8, floodK = 0, moundK = 0, settleK = 0) {')
rep('R.ind.update(t, 152.4, 3, 9, smooth(seg(t, 160.2, 163.5)), smooth(seg(t, 163.2, 166)));',
    'R.ind.update(t, 152.4, 3, 9, smooth(seg(t, 160.2, 162.6)), smooth(seg(t, 162.8, 165.4)), smooth(seg(t, 165.4, 167.4)));')
# a terület helye és mérete (a döngölt felülettől jobbra)
rep('  var IND = new Vector3(260, 0, -260);', '  var IND = new Vector3(260, 0, -260);\n  var POND = { x: 34, z: 3, w: 26, d: 19, h: 2.2, s: 0.5 };   // elárasztott terület: közép, belső méret, töltésmagasság, roskadás (m)')
# kamera: a jelenet végén az elárasztott területre néz
rep('[160, [-8, 12, 36], [8, 3, 0], 40], [168, [10, 15, 40], [20, 2, 2], 40]]', '[160, [-6, 14, 38], [14, 2, 2], 40], [168, [8, 19, 44], [30, 0.5, 3], 40]]')
# feliratok a 3D-ben
if lang == 'hu':
    OLDL = '''      L(proj(...rel(IND, 26, 0.9, -6)), "EL\\xC1RASZT\\xC1S", win(t, 160.8, 167.8, 0.5, 0.4), { dx: -40, dy: -170, color: C.water });
      L(proj(...rel(IND, 26, 3, 14)), "EL\\u0150TERHEL\\xC9S", win(t, 163.6, 167.8, 0.5, 0.4), { dx: 120, dy: -140, color: C.accent });'''
    T1, T2, T3 = 'EL\\xC1RASZT\\xC1S', 'EL\\u0150TERHEL\\xC9S', 'ROSKAD\\xC1S'
    SUB1, SUB2 = 'g\\xE1tak k\\xF6z\\xF6tt', 't\\xF6lt\\xE9s'
else:
    OLDL = '''      L(proj(...rel(IND, 26, 0.9, -6)), "FLOODING", win(t, 160.8, 167.8, 0.5, 0.4), { dx: -40, dy: -170, color: C.water });
      L(proj(...rel(IND, 26, 3, 14)), "PRELOADING", win(t, 163.6, 167.8, 0.5, 0.4), { dx: 120, dy: -140, color: C.accent });'''
    T1, T2, T3 = 'FLOODING', 'PRELOADING', 'COLLAPSE'
    SUB1, SUB2 = 'between low dykes', 'fill placed on top'
NEWL = '''      {
        const fk = smooth(seg(t, 162.8, 165.4)), sk = smooth(seg(t, 165.4, 167.4)), y0 = -POND.s * sk;
        L(proj(...rel(IND, POND.x + POND.w * 0.3, 0.45 + y0, POND.z - 2)), "%s", win(t, 160.8, 164.6, 0.5, 0.4), { dx: 60, dy: -190, color: C.water, sub: "%s" });
        const fx = POND.x - POND.w / 2 + POND.w * fk * 0.32;
        L(proj(...rel(IND, fx, POND.h + y0, POND.z + 1)), "%s", win(t, 163.4, 167.8, 0.5, 0.4), { dx: -200, dy: -150, color: C.accent, sub: "%s" });
        const ra = win(t, 165.6, 167.8, 0.4, 0.3);
        if (ra > 0) {
          let tail = null;
          [0.06, 0.3].forEach((u) => {
            const p = proj(...rel(IND, POND.x + POND.w * u, POND.h + y0 + 0.15, POND.z + 1));
            O.arrow(p.x, p.y - 95, p.x, p.y - 6, ra, C.red, 9, 26);
            tail = { x: p.x, y: p.y - 95 };
          });
          L(tail, "%s", ra, { dx: 80, dy: -36, color: C.red });
        }
      }''' % (T1, SUB1, T2, SUB2, T3)
rep(OLDL, NEWL)
# a képaláírás két lépésben: előbb elárasztás, aztán előterhelés
if lang == 'hu':
    rep('[160.2, 168, "Tov\\xE1bbi m\\xF3dszerek", ["*El\\xE1raszt\\xE1s* *+* *el\\u0151terhel\\xE9s*: el\\u0151re roskad"], { kc: C.water, hc: C.water }],',
        '[160.2, 162.9, "Tov\\xE1bbi m\\xF3dszerek", ["*El\\xE1raszt\\xE1s* g\\xE1tak k\\xF6z\\xF6tt: \\xE1t\\xE1zik a l\\xF6sz"], { kc: C.water, hc: C.water }],\n'
        '    [163.1, 168, "Tov\\xE1bbi m\\xF3dszerek", ["*El\\u0151terhel\\xE9s*: t\\xF6lt\\xE9st hordanak r\\xE1, el\\u0151re megroskad"]],')
else:
    rep('[160.2, 168, "Further methods", ["*Flooding* *+* *preloading*: collapse in advance"], { kc: C.water, hc: C.water }],',
        '[160.2, 162.9, "Further methods", ["*Flooding* between low dykes: the loess is soaked"], { kc: C.water, hc: C.water }],\n'
        '    [163.1, 168, "Further methods", ["*Preloading*: fill is placed on top, it collapses in advance"]],')
open(f, 'w', encoding='utf-8').write(s); print('ok', f)
