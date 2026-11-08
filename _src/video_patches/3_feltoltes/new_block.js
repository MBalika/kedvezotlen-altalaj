  function fillFaceTexture(Wm, LAY, seed, PX = 270) {
    const Hm = LAY.reduce((a, l) => a + l[1], 0);
    const cw = Math.round(Wm * PX), ch = Math.round(Hm * PX);
    const c = canvas(cw, ch), g = c.getContext("2d");
    const r = mulberry32(seed);
    const R = (a, b) => a + (b - a) * r();
    const pick = (arr) => arr[Math.floor(r() * arr.length)];
    const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return `rgb(${f(n >> 16 & 255)},${f(n >> 8 & 255)},${f(n & 255)})`; };
    const bnd = [0];
    let acc = 0;
    const tilt = [0, 0.05, -0.09, 0.07, -0.05];
    LAY.forEach((l, i) => { acc += l[1]; if (i < LAY.length - 1) bnd.push(acc); });
    const by = (k, x) => {
      if (k === 0) return 0;
      if (k >= LAY.length) return ch;
      const xm = x / PX;
      return (bnd[k] + 0.06 * Math.sin(xm * 1.7 + k * 2.1 + seed) + 0.035 * Math.sin(xm * 5.3 + k) + tilt[k] * (xm - Wm / 2) / Wm * 2) * PX;
    };
    function layerPath(k) {
      g.beginPath();
      g.moveTo(0, by(k, 0));
      for (let x = 0; x <= cw; x += 16) g.lineTo(x, by(k, x));
      for (let x = cw; x >= 0; x -= 16) g.lineTo(x, by(k + 1, x));
      g.closePath();
    }
    function speckle(n, cols, s0, s1, alpha) {
      for (let i = 0; i < n; i++) { g.globalAlpha = alpha * R(0.4, 1); g.fillStyle = pick(cols); const s = R(s0, s1); g.fillRect(R(0, cw), R(0, ch), s, s); }
      g.globalAlpha = 1;
    }
    function poly(x, y, rad, n, irr, rot = 0, sx = 1, sy = 1) {
      g.beginPath();
      for (let i = 0; i < n; i++) { const a = rot + i / n * Math.PI * 2 + R(-0.3, 0.3) * irr; const rr = rad * (1 - irr * 0.5 + irr * r()); const px = x + Math.cos(a) * rr * sx, py = y + Math.sin(a) * rr * sy; i ? g.lineTo(px, py) : g.moveTo(px, py); }
      g.closePath();
    }
    function chunk(x, y, rad, n, irr, col, rot = 0, sx = 1, sy = 1, hl = 1.25) {
      g.save(); g.translate(2.5, 3); poly(x, y, rad, n, irr, rot, sx, sy); g.fillStyle = "rgba(0,0,0,0.45)"; g.fill(); g.restore();
      poly(x, y, rad, n, irr, rot, sx, sy);
      const gr = g.createLinearGradient(x - rad, y - rad, x + rad, y + rad);
      gr.addColorStop(0, shade(col, hl)); gr.addColorStop(1, shade(col, 0.72));
      g.fillStyle = gr; g.fill();
      g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 1; g.stroke();
    }
    function brick(x, y, L, H, rot, col) {
      g.save(); g.translate(x, y); g.rotate(rot);
      g.fillStyle = "rgba(0,0,0,0.45)"; g.fillRect(-L / 2 + 3, -H / 2 + 3, L, H);
      const gr = g.createLinearGradient(0, -H / 2, 0, H / 2); gr.addColorStop(0, shade(col, 1.18)); gr.addColorStop(1, shade(col, 0.75));
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(-L / 2, -H / 2); g.lineTo(L / 2 - R(0, L * 0.25), -H / 2); g.lineTo(L / 2, H / 2 - R(0, H * 0.4)); g.lineTo(L / 2 - R(0, L * 0.2), H / 2); g.lineTo(-L / 2, H / 2); g.closePath(); g.fill();
      g.fillStyle = "rgba(205,196,178,0.75)"; g.fillRect(-L / 2, -H / 2, L * R(0.2, 0.6), Math.max(2, H * 0.14));
      for (let i = 0; i < 6; i++) { g.fillStyle = "rgba(60,20,10,0.35)"; g.fillRect(R(-L / 2, L / 2), R(-H / 2, H / 2), 2, 2); }
      g.restore();
    }
    function film(x, y, len, th, col) {
      const n = 10, amp = R(1, 5), ph = R(0, 6), tl = R(-0.12, 0.12);
      const pts = [];
      for (let i = 0; i <= n; i++) { const u = i / n; pts.push([x + u * len, y + Math.sin(u * 6 + ph) * amp + tl * u * len + R(-1, 1)]); }
      g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py));
      for (let i = n; i >= 0; i--) { const [px, py] = pts[i]; g.lineTo(px, py + th * (0.6 + 0.4 * Math.sin(i * 1.3 + ph))); }
      g.closePath(); g.fillStyle = col; g.globalAlpha = 0.92; g.fill(); g.globalAlpha = 1;
      g.beginPath(); pts.forEach(([px, py], i) => i ? g.lineTo(px, py) : g.moveTo(px, py)); g.strokeStyle = "rgba(255,255,255,0.35)"; g.lineWidth = 1; g.stroke();
    }
    const M = { top: "#2e241a", mixed: "#55412f", waste: "#2c2722", slag: "#2b2a29", rubble: "#544638" };
    LAY.forEach((l, k) => {
      const name = l[0];
      g.save(); layerPath(k); g.clip();
      g.fillStyle = M[name]; g.fillRect(0, 0, cw, ch);
      const y0 = Math.min(...[0, cw / 2, cw].map((x) => by(k, x))) - 10, y1 = Math.max(...[0, cw / 2, cw].map((x) => by(k + 1, x))) + 10;
      const RY = () => R(y0, y1), RX = () => R(-20, cw + 20);
      const area = cw * (y1 - y0) / (PX * PX);
      if (name === "top") {
        speckle(area * 5000, ["#2a1f15", "#4a3826", "#55412c"], 1, 3, 0.8);
        g.strokeStyle = "rgba(170,140,100,0.55)";
        for (let i = 0; i < area * 60; i++) { let x = RX(), y = y0 + 5; g.lineWidth = R(0.6, 1.6); g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 8; j++) { x += R(-6, 6); y += R(4, 12); g.lineTo(x, y); } g.stroke(); }
        for (let i = 0; i < area * 25; i++) chunk(RX(), RY(), R(3, 7), 6, 0.5, "#8a8378");
      } else if (name === "mixed") {
        speckle(area * 6000, ["#4a3828", "#6a5240", "#3e3024", "#7a6450"], 1, 3, 0.7);
        for (let i = 0; i < area * 14; i++) { g.fillStyle = pick(["rgba(120,88,60,0.5)", "rgba(80,56,38,0.5)"]); poly(RX(), RY(), R(12, 30), 9, 0.6); g.fill(); }
        for (let i = 0; i < area * 40; i++) chunk(RX(), RY(), R(4, 11), 6, 0.6, pick(["#8d877d", "#7a746a", "#a39d92"]));
        for (let i = 0; i < area * 18; i++) chunk(RX(), RY(), R(5, 13), 5, 0.7, pick(["#a4502e", "#b0603a", "#8e4426"]));
        for (let i = 0; i < area * 10; i++) { g.fillStyle = "#151210"; poly(RX(), RY(), R(2, 5), 5, 0.6); g.fill(); }
      } else if (name === "waste") {
        speckle(area * 5000, ["#1f1b17", "#3a332b", "#26211c"], 1, 3, 0.8);
        for (let i = 0; i < area * 10; i++) { g.fillStyle = "rgba(95,70,48,0.55)"; poly(RX(), RY(), R(18, 46), 10, 0.7, 0, 2.2, 0.6); g.fill(); }
        const FC = ["#d8d5cc", "#c9c6bd", "#b9bcbf", "#6f86a6", "#1c1c1c", "#2a2a2a", "#7d9a7a", "#a8a49a", "#9e4a40", "#e4e0d4"];
        for (let i = 0; i < area * 120; i++) film(RX() - 60, RY(), R(40, 210), R(2.5, 9), pick(FC));
        for (let i = 0; i < area * 14; i++) { g.fillStyle = "#b9a487"; g.globalAlpha = 0.85; for (let j = 0; j < 3; j++) film(RX(), RY(), R(30, 90), 2, "#b5a080"); g.globalAlpha = 1; }
        for (let i = 0; i < area * 8; i++) {
          const x = RX(), y = RY(), L = R(40, 70), H = R(14, 22), rot = R(-0.5, 0.5), col = pick(["#3d6b45", "#6b4626", "#4d7f6a", "#cfd8d0"]);
          g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "rgba(0,0,0,0.5)"; g.beginPath(); g.ellipse(3, 3, L / 2, H / 2, 0, 0, 7); g.fill();
          g.fillStyle = col; g.globalAlpha = 0.85; g.beginPath(); g.ellipse(0, 0, L / 2, H / 2, 0, 0, 7); g.fill(); g.globalAlpha = 1;
          g.fillStyle = "rgba(255,255,255,0.55)"; g.fillRect(-L * 0.35, -H * 0.3, L * 0.5, 2); g.restore();
        }
        for (let i = 0; i < area * 8; i++) {
          const x = RX(), y = RY(), L = R(22, 34), H = R(16, 22), rot = R(-1.2, 1.2);
          g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(-L / 2 + 3, -H / 2 + 3, L, H);
          const gr = g.createLinearGradient(0, -H / 2, 0, H / 2); gr.addColorStop(0, "#c9c9c4"); gr.addColorStop(0.5, "#8d8d88"); gr.addColorStop(1, "#5b5b58");
          g.fillStyle = gr; g.fillRect(-L / 2, -H / 2, L, H); g.fillStyle = "rgba(140,70,30,0.6)"; g.beginPath(); g.ellipse(R(-5, 5), R(-4, 4), L * 0.3, H * 0.25, 0, 0, 7); g.fill(); g.restore();
        }
        for (let i = 0; i < area * 6; i++) { brick(RX(), RY(), R(60, 140), R(8, 14), R(-0.4, 0.4), "#6e4a2c"); }
        for (let i = 0; i < area * 6; i++) { g.fillStyle = pick(["#5d3a3a", "#3a4a6a", "#6a6040"]); g.globalAlpha = 0.85; poly(RX(), RY(), R(14, 30), 9, 0.8, 0, 1.6, 0.7); g.fill(); g.globalAlpha = 1; }
        for (let i = 0; i < area * 10; i++) { g.fillStyle = "#14110e"; poly(RX(), RY(), R(8, 20), 8, 0.7, 0, 1.8, 0.6); g.fill(); }
      } else if (name === "slag") {
        speckle(area * 6000, ["#1c1c1c", "#3a3836", "#464442", "#121212"], 1, 3, 0.8);
        for (let i = 0; i < area * 10; i++) { g.fillStyle = pick(["rgba(140,135,128,0.55)", "rgba(110,106,100,0.5)", "rgba(165,160,150,0.45)"]); poly(RX(), RY(), R(30, 80), 12, 0.5, 0, 2.6, 0.32); g.fill(); }
        for (let i = 0; i < area * 70; i++) {
          const x = RX(), y = RY(), rad = R(5, 16);
          chunk(x, y, rad, 7, 0.7, pick(["#3a3836", "#4a4846", "#34363c", "#55565c"]), R(0, 6), 1, 0.85, 1.4);
          for (let j = 0; j < 4; j++) { g.fillStyle = "rgba(0,0,0,0.6)"; g.beginPath(); g.arc(x + R(-rad, rad) * 0.5, y + R(-rad, rad) * 0.5, R(0.8, 2.2), 0, 7); g.fill(); }
          if (r() < 0.4) { g.fillStyle = "rgba(150,170,190,0.5)"; g.fillRect(x - rad * 0.3, y - rad * 0.4, rad * 0.4, 1.5); }
        }
        for (let i = 0; i < area * 10; i++) chunk(RX(), RY(), R(3, 8), 6, 0.6, "#7a3a2a");
      } else if (name === "rubble") {
        speckle(area * 5000, ["#4a3d31", "#6a5a4a", "#3a2f26"], 1, 3, 0.8);
        for (let i = 0; i < area * 26; i++) { g.fillStyle = "#120e0b"; poly(RX(), RY(), R(8, 22), 7, 0.7); g.fill(); }
        for (let i = 0; i < area * 22; i++) chunk(RX(), RY(), R(14, 34), 6, 0.55, pick(["#8f8b84", "#9b978f", "#7f7b74"]), R(0, 6), R(0.8, 1.3), R(0.6, 1));
        for (let i = 0; i < area * 160; i++) { g.fillStyle = pick(["rgba(60,55,50,0.6)", "rgba(170,165,155,0.6)"]); g.fillRect(RX(), RY(), 2, 2); }
        for (let i = 0; i < area * 36; i++) brick(RX(), RY(), R(30, 70), R(14, 20), R(-0.9, 0.9), pick(["#a9512e", "#b8613a", "#9a4526", "#c06a44"]));
        for (let i = 0; i < area * 14; i++) chunk(RX(), RY(), R(6, 12), 6, 0.6, "#cfc8b8", 0, 1, 0.8, 1.1);
        for (let i = 0; i < area * 10; i++) brick(RX(), RY(), R(30, 50), R(4, 6), R(-0.6, 0.6), "#b0502c");
        g.strokeStyle = "#3a2a20"; g.lineWidth = 2.2;
        for (let i = 0; i < area * 3; i++) { const x = RX(), y = RY(), a = R(-0.6, 0.6), L = R(40, 110); g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + L * 0.5, y + R(-10, 10), x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
      }
      g.restore();
    });
    for (let k = 1; k < LAY.length; k++) { g.beginPath(); g.moveTo(0, by(k, 0)); for (let x = 0; x <= cw; x += 16) g.lineTo(x, by(k, x)); g.strokeStyle = "rgba(0,0,0,0.25)"; g.lineWidth = 2; g.stroke(); }
    const vg = g.createLinearGradient(0, 0, 0, ch); vg.addColorStop(0, "rgba(255,240,220,0.05)"); vg.addColorStop(1, "rgba(0,0,0,0.18)"); g.fillStyle = vg; g.fillRect(0, 0, cw, ch);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  function makeDebrisBlock(T2) {
    const group = new Group();
    group.position.copy(DB);
    const bd = new Mesh(new SphereGeometry(70, 32, 16), makeBackdrop());
    bd.material.uniforms.uTop.value.set(2827808);
    bd.material.uniforms.uBot.value.set(460293);
    bd.material.uniforms.uMid.value.set(4864810);
    group.add(bd);
    const rnd = mulberry32(5);
    const W2 = 7, Dz = 3;
    const layers = [["top", 0.35], ["mixed", 0.6], ["waste", 1.4], ["slag", 0.9], ["rubble", 1]];
    const Ht = layers.reduce((a, l) => a + l[1], 0);
    let y = 2.1;
    const L = {};
    for (const [name, th] of layers) { L[name] = [y - th, y]; y -= th; }
    const front = fillFaceTexture(W2, layers, 3), side = fillFaceTexture(Dz, layers, 11);
    const fm = new MeshStandardMaterial({ map: front, bumpMap: front, bumpScale: 2.2, roughness: 0.93 });
    const sm = new MeshStandardMaterial({ map: side, bumpMap: side, bumpScale: 2.2, roughness: 0.93 });
    const tm = new MeshStandardMaterial({ map: T2.grass, color: 10526880, roughness: 0.95 });
    const dm = new MeshStandardMaterial({ color: 2366486, roughness: 1 });
    const box = new Mesh(new BoxGeometry(W2, Ht, Dz), [sm, sm, tm, dm, fm, dm]);
    box.position.y = 2.1 - Ht / 2;
    box.castShadow = box.receiveShadow = true;
    group.add(box);
    const items = {};
    const M = new Matrix4(), q = new Quaternion(), S = new Vector3(), P = new Vector3(), E = new Euler();
    function scatter(name, layer, geo, mat, n, scaleFn, colorFn, depth = 0.05) {
      const im = new InstancedMesh(geo, mat, n);
      im.castShadow = true;
      im.receiveShadow = true;
      const [y0, y1] = L[layer];
      const pos = [];
      const col = new Color();
      for (let i = 0; i < n; i++) {
        P.set((rnd() - 0.5) * (W2 - 0.3), y0 + 0.08 + rnd() * (y1 - y0 - 0.16), Dz / 2 - depth + rnd() * depth * 0.6);
        E.set(rnd() * 6.28, rnd() * 6.28, rnd() * 6.28);
        q.setFromEuler(E);
        const s = scaleFn();
        S.set(s[0], s[1], s[2]);
        M.compose(P, q, S);
        im.setMatrixAt(i, M);
        pos.push(P.clone());
        if (colorFn) {
          col.copy(colorFn());
          im.setColorAt(i, col);
        }
      }
      group.add(im);
      items[name] = { im, pos };
      return im;
    }
    const brickM = new MeshStandardMaterial({ map: T2.brick, roughness: 0.85 });
    scatter("brick", "rubble", new BoxGeometry(0.25, 0.065, 0.12), brickM, 34, () => [1, 1, 1], () => new Color().setHSL(0.03 + rnd() * 0.02, 0.45, 0.38 + rnd() * 0.1), 0.06);
    const concG = jitterGeo(new IcosahedronGeometry(1, 0), 0.5, 3);
    scatter("concrete", "rubble", concG, new MeshStandardMaterial({ color: 10197908, roughness: 0.92, flatShading: true }), 18, () => {
      const s = 0.08 + rnd() * 0.1;
      return [s * 1.3, s, s];
    }, () => new Color(16777215).multiplyScalar(0.75 + rnd() * 0.2), 0.08);
    const slagG = jitterGeo(new IcosahedronGeometry(1, 1), 0.6, 7);
    scatter("slag", "slag", slagG, new MeshStandardMaterial({ color: 3355443, roughness: 0.6, metalness: 0.25 }), 46, () => {
      const s = 0.035 + rnd() * 0.06;
      return [s, s * 0.8, s];
    }, () => new Color(16777215).multiplyScalar(0.7 + rnd() * 0.4), 0.04);
    scatter("bottle", "waste", new CylinderGeometry(0.035, 0.035, 0.25, 14), new MeshStandardMaterial({ color: 3567685, roughness: 0.12, metalness: 0.1, transparent: true, opacity: 0.8 }), 5, () => [1, 1, 1], null, 0.03);
    scatter("can", "waste", new CylinderGeometry(0.033, 0.033, 0.12, 14), new MeshStandardMaterial({ color: 10132122, roughness: 0.45, metalness: 0.7 }), 5, () => [1, 1, 1], null, 0.03);
    scatter("tire", "waste", new TorusGeometry(0.28, 0.1, 12, 28), new MeshStandardMaterial({ color: 1315860, roughness: 0.85 }), 1, () => [1, 1, 1], null, 0.12);
    scatter("wood", "waste", new BoxGeometry(0.6, 0.035, 0.1), new MeshStandardMaterial({ map: T2.wood, color: 7029318, roughness: 0.85 }), 5, () => [0.6 + rnd(), 1, 1], null, 0.04);
    scatter("stone", "mixed", concG, new MeshStandardMaterial({ color: 8418938, roughness: 0.9, flatShading: true }), 14, () => {
      const s = 0.04 + rnd() * 0.05;
      return [s, s, s];
    }, null, 0.04);
    return { group, items, L };
  }
