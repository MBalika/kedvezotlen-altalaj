  function pipeSweep(pts, r, br = 0.16, rs = 14) {
    const P = pts.map((a) => new Vector3(a[0], a[1], a[2])), path = [P[0].clone()];
    for (let i = 1; i < P.length - 1; i++) {
      const a = P[i - 1], b = P[i], c = P[i + 1];
      const din = b.clone().sub(a), dout = c.clone().sub(b);
      const li = din.length(), lo = dout.length();
      din.normalize();
      dout.normalize();
      const d = Math.min(br, li * 0.45, lo * 0.45);
      const p0 = b.clone().addScaledVector(din, -d), p2 = b.clone().addScaledVector(dout, d);
      for (let k = 0; k <= 8; k++) { const u = k / 8; path.push(new Vector3().addScaledVector(p0, (1 - u) * (1 - u)).addScaledVector(b, 2 * u * (1 - u)).addScaledVector(p2, u * u)); }
    }
    path.push(P[P.length - 1].clone());
    const n = path.length, pos = [], nor = [], uv = [], idx = [];
    const T = new Vector3(), Bn = new Vector3(), Nn = new Vector3();
    let N0 = null, len = 0;
    for (let i = 0; i < n; i++) {
      T.copy(path[Math.min(n - 1, i + 1)]).sub(path[Math.max(0, i - 1)]).normalize();
      if (!N0) N0 = new Vector3().crossVectors(T, Math.abs(T.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)).normalize();
      else N0.addScaledVector(T, -N0.dot(T)).normalize();
      Bn.crossVectors(T, N0).normalize();
      if (i > 0) len += path[i].distanceTo(path[i - 1]);
      for (let j = 0; j <= rs; j++) {
        const an = j / rs * Math.PI * 2;
        Nn.copy(N0).multiplyScalar(Math.cos(an)).addScaledVector(Bn, Math.sin(an));
        pos.push(path[i].x + Nn.x * r, path[i].y + Nn.y * r, path[i].z + Nn.z * r);
        nor.push(Nn.x, Nn.y, Nn.z);
        uv.push(j / rs, len);
      }
    }
    for (let i = 0; i < n - 1; i++) for (let j = 0; j < rs; j++) {
      const a = i * (rs + 1) + j, b = a + rs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("normal", new Float32BufferAttribute(nor, 3));
    g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }
