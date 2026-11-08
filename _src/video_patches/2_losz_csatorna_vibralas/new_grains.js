  function makeGrains() {
    const group = new Group();
    group.position.copy(GR);
    const bd = new Mesh(new SphereGeometry(80, 32, 16), makeBackdrop());
    bd.material.uniforms.uTop.value.set(3811864);
    bd.material.uniforms.uBot.value.set(657156);
    bd.material.uniforms.uMid.value.set(6965796);
    group.add(bd);
    const rnd = mulberry32(17);
    const grains = [];
    const s = 0.95;
    for (let ix = 0; ix < 13; ix++) for (let iy = 0; iy < 7; iy++) for (let iz = 0; iz < 5; iz++) {
      const x = -5.7 + ix * s + (rnd() - 0.5) * 0.5, y = -3 + iy * s * 0.9 + (rnd() - 0.5) * 0.45, z = -1.9 + iz * s + (rnd() - 0.5) * 0.5;
      const u = rnd();
      const kind = u < 0.62 ? 0 : u < 0.76 ? 1 : u < 0.86 ? 2 : u < 0.94 ? 3 : 4;
      const r = kind === 3 ? 0.4 + rnd() * 0.12 : 0.3 + rnd() * 0.22 + (rnd() < 0.12 ? 0.08 : 0);
      grains.push({ dense: new Vector3(x, y, z), r, kind, v: Math.floor(rnd() * 5), sc: new Vector3(0.82 + rnd() * 0.36, 0.78 + rnd() * 0.3, 0.82 + rnd() * 0.36), rot: new Euler(rnd() * 6, rnd() * 6, rnd() * 6), rot2: new Euler(rnd() * 6, rnd() * 6, rnd() * 6), tint: 0.9 + rnd() * 0.18 });
    }
    const channels = [[-2.3, 1.25, 1.05], [3.1, -0.4, 0.85]];
    for (const g of grains) {
      const o = g.dense.clone();
      o.y = -3 + (o.y + 3) * 1.2 + (rnd() - 0.5) * 0.3;
      o.x *= 1.04;
      o.z *= 1.04;
      o.x += (rnd() - 0.5) * 0.22;
      for (const [cx, cz, cr2] of channels) {
        const dx = o.x - cx, dz = o.z - cz, dd = Math.hypot(dx, dz);
        if (dd < cr2 + g.r * 0.6) {
          const k = (cr2 + g.r * 0.7) / Math.max(dd, 0.05);
          o.x = cx + dx * k;
          o.z = cz + dz * k;
        }
      }
      g.open = o;
      if (Math.abs(o.x) > 6.3 || Math.abs(o.z) > 2.45) g.drop = true;
    }
    for (let i = grains.length - 1; i >= 0; i--) if (grains[i].drop) grains.splice(i, 1);
    for (let pass = 0; pass < 2; pass++) for (let i = grains.length - 1; i >= 0; i--) {
      const g = grains[i];
      let nn = 1e9;
      grains.forEach((h, j) => { if (j !== i) nn = Math.min(nn, g.open.distanceTo(h.open) / (g.r + h.r)); });
      if (nn > 1.28) grains.splice(i, 1);
    }
    const N = grains.length;
    function angular(seed, detail, amp) {
      const gg = new IcosahedronGeometry(1, detail);
      const p = gg.attributes.position, r2 = mulberry32(seed), disp = new Map(), v = new Vector3();
      const dirs = Array.from({ length: 7 }, () => new Vector3(r2() - 0.5, r2() - 0.5, r2() - 0.5).normalize());
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const key = v.x.toFixed(3) + "," + v.y.toFixed(3) + "," + v.z.toFixed(3);
        if (!disp.has(key)) {
          let f = 1 + (r2() - 0.5) * amp;
          for (const d of dirs) { const c = v.dot(d); if (c > 0.82) f *= 1 - (c - 0.82) * 1.6; }
          disp.set(key, f);
        }
        v.multiplyScalar(disp.get(key));
        p.setXYZ(i, v.x, v.y, v.z);
      }
      gg.computeVertexNormals();
      return gg;
    }
    const VAR = [angular(3, 1, 0.34), angular(11, 1, 0.3), angular(29, 0, 0.42), angular(41, 1, 0.38), angular(57, 0, 0.36)];
    const PAL = [[0.86, 0.74, 0.52], [0.84, 0.62, 0.48], [0.95, 0.91, 0.82], [0.66, 0.58, 0.44], [0.4, 0.31, 0.23]];
    const gmat = new MeshStandardMaterial({ roughness: 0.42, metalness: 0.02, flatShading: true });
    const cmat = new MeshStandardMaterial({ roughness: 0.85, metalness: 0, flatShading: true });
    const fmat = new MeshStandardMaterial({ roughness: 0.25, metalness: 0.35 });
    const ims = VAR.map((geo, vi) => {
      const list = grains.map((g, i) => i).filter((i) => grains[i].kind !== 3 && grains[i].v === vi);
      const im = new InstancedMesh(geo, vi === 2 ? cmat : gmat, Math.max(list.length, 1));
      im.count = list.length;
      im.castShadow = true;
      im.receiveShadow = true;
      group.add(im);
      return { im, list };
    });
    const flakeList = grains.map((g, i) => i).filter((i) => grains[i].kind === 3);
    const flk = { im: new InstancedMesh(new CylinderGeometry(1, 1, 0.14, 6), fmat, Math.max(flakeList.length, 1)), list: flakeList };
    flk.im.count = flakeList.length;
    flk.im.castShadow = true;
    group.add(flk.im);
    const allIms = [...ims, flk];
    const lime = new Color(0.95, 0.92, 0.84);
    const baseCol = grains.map((g) => {
      const c = PAL[g.kind], cc = new Color(c[0] * g.tint, c[1] * g.tint, c[2] * g.tint);
      let k = 0;
      for (const [cx, cz, cr2] of channels) { const dd = Math.hypot(g.open.x - cx, g.open.z - cz); k = Math.max(k, 1 - smooth(clamp2((dd - cr2 - g.r * 0.4) / 0.55))); }
      return cc.lerp(lime, 0.75 * k);
    });
    const br = [];
    const cnt = new Array(N).fill(0);
    for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) {
      if (cnt[i] >= 4 || cnt[j] >= 4) continue;
      const a = grains[i].open, b = grains[j].open;
      const d = a.distanceTo(b);
      if (d < (grains[i].r + grains[j].r) * 1.32 && d > (grains[i].r + grains[j].r) * 0.6) {
        br.push([i, j, rnd() < 0.62 ? 0 : 1, 0.75 + rnd() * 0.45]);
        cnt[i]++;
        cnt[j]++;
      }
    }
    const neck = (() => {
      const RS = 14, YS = 10, pos = [], idx = [];
      for (let k = 0; k <= YS; k++) {
        const yy = k / YS - 0.5, rr = 0.5 + 1.5 * yy * yy;
        for (let j = 0; j <= RS; j++) { const an = j / RS * Math.PI * 2; pos.push(Math.cos(an) * rr, yy, Math.sin(an) * rr); }
      }
      for (let k = 0; k < YS; k++) for (let j = 0; j < RS; j++) { const a = k * (RS + 1) + j, b = a + RS + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    })();
    const bmat = new MeshStandardMaterial({ roughness: 0.8, metalness: 0 });
    const bim = new InstancedMesh(neck, bmat, br.length);
    const BRC = [new Color(0.5, 0.33, 0.2), new Color(0.9, 0.85, 0.72)];
    br.forEach(([i, j, kind], n) => bim.setColorAt(n, BRC[kind]));
    group.add(bim);
    const wmat = new MeshStandardMaterial({ color: 4170968, transparent: true, opacity: 0.24, roughness: 0.05, metalness: 0.1, depthWrite: false, emissive: 1194560, emissiveIntensity: 0.6 });
    const water = new Mesh(new BoxGeometry(13.4, 1, 5.6), wmat);
    water.position.set(0, -3.2, 0);
    group.add(water);
    const surf = new Mesh(new PlaneGeometry(13.4, 5.6), new MeshStandardMaterial({ color: 10541055, transparent: true, opacity: 0.35, roughness: 0.02, metalness: 0.2, depthWrite: false, emissive: 2789000, emissiveIntensity: 0.5 }));
    surf.rotation.x = -Math.PI / 2;
    group.add(surf);
    const M = new Matrix4(), q = new Quaternion(), S = new Vector3(), P = new Vector3(), up = new Vector3(0, 1, 0), A = new Vector3(), B = new Vector3(), D = new Vector3();
    const tmpE = new Euler(), wetC = new Color(0.42, 0.5, 0.58), col = new Color();
    const curPos = grains.map((g) => g.open.clone());
    const curQ = grains.map(() => new Quaternion());
    const pick = (fn) => { let bi = 0, bv = 1e9; grains.forEach((g, i) => { const v = fn(g, i); if (v < bv) { bv = v; bi = i; } }); return bi; };
    const gA = pick((g) => (g.kind === 0 ? 0 : 50) + g.open.distanceTo(new Vector3(-0.9, 1.9, 2.1)) - g.r);
    let bA = 0, bv = 1e9;
    br.forEach(([i, j], n) => { const m = grains[i].open.clone().add(grains[j].open).multiplyScalar(0.5); const v = m.distanceTo(new Vector3(1.7, 0.9, 2.1)); if (v < bv) { bv = v; bA = n; } });
    const anchors = { grain: grains[gA].open.clone().add(new Vector3(0, 0, grains[gA].r * 0.8)), bridge: null, pore: new Vector3(channels[0][0], 0.9, Math.min(2.2, channels[0][1] + channels[0][2])) };
    { const [i, j] = br[bA]; anchors.bridge = grains[i].open.clone().add(grains[j].open).multiplyScalar(0.5); }
    function update(t, level, kStart) {
      for (let i = 0; i < N; i++) {
        const g = grains[i];
        const wetT = clamp2((level - g.open.y) / 1.2);
        const k = easeIn(clamp2((wetT - 0.25) / 0.75)) * kStart;
        P.lerpVectors(g.open, g.dense, k);
        P.x += Math.sin(t * 2 + i) * 0.01;
        P.y += Math.cos(t * 1.7 + i) * 8e-3;
        curPos[i].copy(P);
        tmpE.set(lerp2(g.rot.x, g.rot2.x, k * 0.3), lerp2(g.rot.y, g.rot2.y, k * 0.3), lerp2(g.rot.z, g.rot2.z, k * 0.3));
        curQ[i].setFromEuler(tmpE);
      }
      for (const { im, list } of allIms) {
        list.forEach((gi, n) => {
          const g = grains[gi];
          if (g.kind === 3) S.set(g.r * 1.35, g.r * 1.35, g.r * 1.35);
          else S.set(g.r * g.sc.x, g.r * g.sc.y, g.r * g.sc.z);
          M.compose(curPos[gi], curQ[gi], S);
          im.setMatrixAt(n, M);
          const wet = smooth(clamp2((level - curPos[gi].y + 0.2) / 0.5));
          col.copy(baseCol[gi]).lerp(col.clone().copy(baseCol[gi]).multiply(wetC), wet * 0.75);
          im.setColorAt(n, col);
        });
        im.instanceMatrix.needsUpdate = true;
        if (im.instanceColor) im.instanceColor.needsUpdate = true;
      }
      br.forEach(([i, j, kind, w], n) => {
        A.copy(curPos[i]);
        B.copy(curPos[j]);
        D.copy(B).sub(A);
        const dist = D.length();
        D.normalize();
        const ri = grains[i].r * 0.62, rj = grains[j].r * 0.62;
        const a0 = A.clone().addScaledVector(D, ri), b0 = B.clone().addScaledVector(D, -rj);
        const len = Math.max(b0.distanceTo(a0), 0.02) + 0.22;
        const mid = a0.add(b0).multiplyScalar(0.5);
        const wet = smooth(clamp2((level - mid.y) / 0.7));
        const life = kind === 0 ? (1 + 0.35 * smooth(wet * 2.2)) * (1 - smooth(clamp2((wet - 0.35) / 0.65))) : 1 - smooth(clamp2(wet / 0.7));
        const rad = (kind === 0 ? 0.13 : 0.1) * w * Math.min(grains[i].r, grains[j].r) / 0.36 * life;
        q.setFromUnitVectors(up, D);
        S.set(Math.max(rad, 1e-4), len, Math.max(rad, 1e-4));
        M.compose(mid, q, S);
        bim.setMatrixAt(n, M);
      });
      bim.instanceMatrix.needsUpdate = true;
      const h = Math.max(level + 3.2, 1e-3);
      water.scale.y = h;
      water.position.y = -3.2 + h / 2;
      water.visible = level > -3.15;
      surf.position.y = level + 0.01;
      surf.visible = water.visible && level < 4.3;
      let top = -10;
      for (const p of curPos) top = Math.max(top, p.y);
      return top;
    }
    return { group, update, grains, anchors };
  }
