  function makeMicro() {
    const group = new Group();
    group.position.copy(MICRO);
    const bd = new Mesh(new SphereGeometry(80, 32, 16), makeBackdrop());
    group.add(bd);
    const d = 0.5, hT = d * Math.SQRT1_2, hO = d * Math.sqrt(2 / 3), thick = 2 * hT + hO;
    const NL = 3, RH = 4.3, S3 = Math.sqrt(3);
    const A1 = [d, 0], A2 = [d / 2, d * S3 / 2];
    const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]];
    const mod3 = (n) => (n % 3 + 3) % 3;
    const vec = (i, j) => [i * A1[0] + j * A2[0], i * A1[1] + j * A2[1]];
    const colT = new Color(15315020), colO = new Color(2928270);
    function outline(x, z, seed) {
      const ang = Math.atan2(z, x), sec = Math.PI / 3;
      const aa = (ang % sec + sec) % sec - sec / 2;
      return RH * Math.cos(Math.PI / 6) / Math.cos(aa) + 0.3 * Math.sin(ang * 5 + seed * 1.7) + 0.16 * Math.sin(ang * 13 + seed * 2.9);
    }
    function buildLayer(seed) {
      const pos = [], nor = [], col = [], bar = [];
      const r = mulberry32(seed * 977 + 13);
      const N = Math.ceil(RH / d * 1.4) + 3;
      const y0 = -thick / 2, yb = y0 + hT, yt = yb + hO, ytop = yt + hT;
      const jit = (c) => { const k = 0.86 + 0.26 * r(); return [c.r * k, c.g * k, c.b * k]; };
      function tri(a, b, c, cen, cc) {
        let nx = (b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]);
        let ny = (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]);
        let nz = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        const fx = (a[0] + b[0] + c[0]) / 3 - cen[0], fy = (a[1] + b[1] + c[1]) / 3 - cen[1], fz = (a[2] + b[2] + c[2]) / 3 - cen[2];
        if (nx * fx + ny * fy + nz * fz < 0) { const t = b; b = c; c = t; nx = -nx; ny = -ny; nz = -nz; }
        const L = Math.hypot(nx, ny, nz) || 1;
        for (const p of [a, b, c]) { pos.push(p[0], p[1], p[2]); nor.push(nx / L, ny / L, nz / L); col.push(cc[0], cc[1], cc[2]); }
        bar.push(1, 0, 0, 0, 1, 0, 0, 0, 1);
      }
      function tet(sx, sz, yBase, yApex, nb) {
        const cc = jit(colT);
        const B = nb.map(([vx, vz]) => [sx + vx * 0.5, yBase, sz + vz * 0.5]);
        const Ap = [sx, yApex, sz], cen = [sx, (3 * yBase + yApex) / 4, sz];
        tri(B[0], B[1], B[2], cen, cc);
        tri(B[0], B[1], Ap, cen, cc);
        tri(B[1], B[2], Ap, cen, cc);
        tri(B[2], B[0], Ap, cen, cc);
      }
      function oct(Tv, Bv) {
        const cc = jit(colO);
        const cen = [(Tv[0][0] + Tv[1][0] + Tv[2][0]) / 3, (Tv[0][1] + Bv[0][1]) / 2, (Tv[0][2] + Tv[1][2] + Tv[2][2]) / 3];
        tri(Tv[0], Tv[1], Tv[2], cen, cc);
        tri(Bv[0], Bv[1], Bv[2], cen, cc);
        tri(Tv[0], Tv[1], Bv[2], cen, cc);
        tri(Tv[1], Tv[2], Bv[0], cen, cc);
        tri(Tv[2], Tv[0], Bv[1], cen, cc);
        tri(Bv[0], Bv[1], Tv[2], cen, cc);
        tri(Bv[1], Bv[2], Tv[0], cen, cc);
        tri(Bv[2], Bv[0], Tv[1], cen, cc);
      }
      const third = [(A1[0] + A2[0]) / 3, (A1[1] + A2[1]) / 3];
      for (let i = -N; i <= N; i++) for (let j = -N; j <= N; j++) {
        const m = mod3(i - j);
        const [px, pz] = vec(i, j);
        if (m !== 0) {
          const nb = DIRS.filter(([di, dj]) => mod3(i + di - (j + dj)) !== 0).map(([di, dj]) => vec(di, dj));
          if (Math.hypot(px, pz) < outline(px, pz, seed) - 0.15) tet(px, pz, ytop, yt, nb);
          const lx = px + 2 * third[0], lz = pz + 2 * third[1];
          if (Math.hypot(lx, lz) < outline(lx, lz, seed) - 0.15) tet(lx, lz, y0, yb, nb);
        }
        if (m !== 2) {
          const qx = px + third[0], qz = pz + third[1];
          if (Math.hypot(qx, qz) < outline(qx, qz, seed) - 0.3) {
            const Tv = [[px, yt, pz], [px + A1[0], yt, pz + A1[1]], [px + A2[0], yt, pz + A2[1]]];
            oct(Tv, Tv.map((v) => [2 * qx - v[0], yb, 2 * qz - v[2]]));
          }
        }
      }
      const g = new BufferGeometry();
      g.setAttribute("position", new Float32BufferAttribute(pos, 3));
      g.setAttribute("normal", new Float32BufferAttribute(nor, 3));
      g.setAttribute("color", new Float32BufferAttribute(col, 3));
      g.setAttribute("aBary", new Float32BufferAttribute(bar, 3));
      g.computeBoundingSphere();
      return g;
    }
    const mat = new MeshStandardMaterial({ vertexColors: true, roughness: 0.3, metalness: 0.06 });
    mat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec3 aBary;\nvarying vec3 vBary;").replace("#include <begin_vertex>", "#include <begin_vertex>\nvBary = aBary;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vBary;").replace("#include <dithering_fragment>", `#include <dithering_fragment>
      { float e = min(min(vBary.x, vBary.y), vBary.z);
        float fw = max(fwidth(e), 1e-4);
        float ln = 1.0 - smoothstep(fw * 0.6, fw * 1.9, e);
        float glow = 1.0 - smoothstep(0.0, 0.24, e);
        gl_FragColor.rgb += vColor.rgb * glow * 0.2;
        gl_FragColor.rgb = mix(gl_FragColor.rgb, vColor.rgb * 0.45 + vec3(0.6), ln * 0.85); }`);
    };
    const layers = [];
    const LU = [[0.16, -0.1, 0], [-0.2, 0.15, 0.2], [0.1, -0.18, -0.11], [-0.12, 0.08, 0.31]];
    for (let i = 0; i < NL; i++) {
      const L = new Group();
      L.add(new Mesh(buildLayer(i + 1), mat));
      L.userData.dx = LU[i][0];
      L.userData.dz = LU[i][1];
      L.userData.rot = LU[i][2];
      group.add(L);
      layers.push(L);
    }
    const rnd = mulberry32(42);
    const disc = (rmax) => { const rr = rmax * Math.sqrt(rnd()), th = rnd() * Math.PI * 2; return [rr * Math.cos(th), rr * Math.sin(th)]; };
    const NC = 15 * (NL - 1);
    const cat = new InstancedMesh(new SphereGeometry(0.13, 20, 14), new MeshStandardMaterial({ color: 12094719, emissive: 7028704, emissiveIntensity: 0.75, roughness: 0.22 }), NC);
    const catData = [];
    for (let i = 0; i < NC; i++) { const [x, z] = disc(RH * 0.8); catData.push({ k: i % (NL - 1), x, z, f: rnd() }); }
    group.add(cat);
    const WL = 5, PER = 66, WLH = 0.42, GDRY = 0.42, GCRY = GDRY + 3 * WLH, GMAX = 3;
    const NIN = (NL - 1) * WL * PER, NOUT = 170, NW = NIN + NOUT;
    const mOx = new InstancedMesh(new SphereGeometry(0.1, 14, 10), new MeshStandardMaterial({ color: 16074058, roughness: 0.28, emissive: 5900040, emissiveIntensity: 0.45 }), NW);
    const mH = new InstancedMesh(new SphereGeometry(0.058, 10, 8), new MeshStandardMaterial({ color: 16250871, roughness: 0.3, emissive: 3684408, emissiveIntensity: 0.35 }), NW * 2);
    group.add(mOx, mH);
    const wData = [];
    for (let i = 0; i < NW; i++) {
      const inside = i < NIN;
      const k = i % (NL - 1), j = Math.floor(i / (NL - 1)) % WL;
      const [tx, tz] = disc(RH * 0.8);
      const side = rnd() < 0.55 ? 1 : -1;
      const ea = (side > 0 ? -0.8 : Math.PI + 0.6) + (rnd() - 0.5) * 1.3;
      const er = RH + 0.6 + rnd() * 4;
      wData.push({
        k, j, inside, tx, tz,
        sx: Math.cos(ea) * er, sy: (rnd() - 0.5) * 6, sz: Math.sin(ea) * er,
        ex: Math.cos(ea) * RH * 0.92, ez: Math.sin(ea) * RH * 0.92,
        delay: rnd(), ph: rnd() * 6.28, jy: (rnd() - 0.5) * 0.12,
        ax: new Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), ang: rnd() * 6.28
      });
    }
    const M = new Matrix4(), q = new Quaternion(), S1 = new Vector3(1, 1, 1), P = new Vector3(), H1 = new Vector3(), H2 = new Vector3();
    const hOff1 = new Vector3(0.088, 0.07, 0), hOff2 = new Vector3(-0.088, 0.07, 0);
    function realGap(gap) {
      if (gap <= 0.62) return GDRY + (gap - 0.12) / 0.5 * (GCRY - GDRY);
      return GCRY + (gap - 0.62) / 0.5 * (GMAX - GCRY);
    }
    function layerY(i, gap) {
      return (i - (NL - 1) / 2) * (thick + realGap(gap));
    }
    function update(time, fill, gap, flow = 1) {
      const g = Math.max(realGap(gap), GDRY * 0.9);
      const pitch = thick + g;
      const ly = (i) => (i - (NL - 1) / 2) * pitch;
      for (let i = 0; i < NL; i++) {
        const L = layers[i];
        L.position.set(L.userData.dx, ly(i), L.userData.dz);
        L.rotation.y = L.userData.rot;
      }
      const capA = [];
      let nl = 0;
      for (let j = 0; j < WL; j++) { const a = smooth(clamp2((g - (GDRY + (j + 0.55) * WLH)) / (0.5 * WLH))); capA.push(a); nl += a; }
      const nlE = Math.max(nl, 1);
      for (let i = 0; i < NC; i++) {
        const c = catData[i];
        const y = (ly(c.k) + ly(c.k + 1)) / 2 + Math.sin(time * 2 + c.f * 6) * 0.03;
        M.makeTranslation(c.x, y, c.z);
        cat.setMatrixAt(i, M);
      }
      cat.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NW; i++) {
        const w = wData[i];
        const bottom = ly(w.k) + thick / 2, ymid = bottom + g / 2;
        let a = 0;
        if (w.inside) a = Math.min(capA[w.j], smooth(clamp2((fill * 1.3 - w.delay * 0.95) / 0.3)));
        const ty = bottom + g * (w.j + 0.5) / nlE + w.jy;
        const sx = w.sx + Math.sin(time * 0.7 + w.ph) * 0.4, sy = w.sy + Math.cos(time * 0.5 + w.ph) * 0.3, sz = w.sz;
        if (a <= 0) P.set(sx, sy, sz);
        else if (a < 0.5) { const u = smooth(a * 2); P.set(sx + (w.ex - sx) * u, sy + (ymid - sy) * u, sz + (w.ez - sz) * u); }
        else { const u = smooth((a - 0.5) * 2); P.set(w.ex + (w.tx - w.ex) * u, ymid + (ty - ymid) * u, w.ez + (w.tz - w.ez) * u); }
        P.x += Math.sin(time * 3.1 + w.ph) * 0.025;
        P.y += Math.cos(time * 2.7 + w.ph) * 0.015;
        const sc = Math.max(a > 0 ? 1 : flow, 1e-4);
        q.setFromAxisAngle(w.ax, w.ang + time * (1.5 + i % 5 * 0.3));
        S1.setScalar(sc);
        M.compose(P, q, S1);
        mOx.setMatrixAt(i, M);
        H1.copy(hOff1).applyQuaternion(q).multiplyScalar(sc).add(P);
        H2.copy(hOff2).applyQuaternion(q).multiplyScalar(sc).add(P);
        M.compose(H1, q, S1);
        mH.setMatrixAt(i * 2, M);
        M.compose(H2, q, S1);
        mH.setMatrixAt(i * 2 + 1, M);
      }
      mOx.instanceMatrix.needsUpdate = true;
      mH.instanceMatrix.needsUpdate = true;
    }
    return { group, update, layerY, NL, thick };
  }
