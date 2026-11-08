  var MIN_T = "#E9B04C", MIN_O = "#2CAE8E", MIN_CAT = "#B88CFF", MIN_K = "#FF8FB1", MIN_W = "#F5454A";
  function minTet(g, x, yTop, w, hh, narrowDown, a) {
    const ins = hh * 0.62;
    g.beginPath();
    if (narrowDown) { g.moveTo(x, yTop); g.lineTo(x + w, yTop); g.lineTo(x + w - ins, yTop + hh); g.lineTo(x + ins, yTop + hh); }
    else { g.moveTo(x + ins, yTop); g.lineTo(x + w - ins, yTop); g.lineTo(x + w, yTop + hh); g.lineTo(x, yTop + hh); }
    g.closePath();
    const gr = g.createLinearGradient(0, yTop, 0, yTop + hh);
    gr.addColorStop(0, "#F6CB72");
    gr.addColorStop(1, "#C98E2E");
    g.fillStyle = gr;
    g.fill();
    g.strokeStyle = "rgba(255,240,205,0.85)";
    g.lineWidth = 1.4;
    g.stroke();
    g.save();
    g.clip();
    g.strokeStyle = "rgba(90,55,10,0.35)";
    g.lineWidth = 1;
    for (let k = x + 4; k < x + w; k += 9) { g.beginPath(); g.moveTo(k, yTop); g.lineTo(k + (narrowDown ? 4 : -4), yTop + hh); g.stroke(); }
    g.restore();
  }
  function minOct(g, x, y, w, hh) {
    const gr = g.createLinearGradient(0, y, 0, y + hh);
    gr.addColorStop(0, "#49CBA8");
    gr.addColorStop(1, "#1E8A6E");
    g.fillStyle = gr;
    g.beginPath();
    g.rect(x, y, w, hh);
    g.fill();
    g.strokeStyle = "rgba(205,255,240,0.8)";
    g.lineWidth = 1.4;
    g.stroke();
    g.save();
    g.clip();
    g.strokeStyle = "rgba(5,60,45,0.35)";
    g.lineWidth = 1;
    for (let k = x + 3; k < x + w + hh; k += 10) { g.beginPath(); g.moveTo(k, y); g.lineTo(k - hh, y + hh); g.stroke(); }
    g.restore();
  }
  function minBall(g, x, y, r, col) {
    const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
    gr.addColorStop(0, "#ffffff");
    gr.addColorStop(0.35, col);
    gr.addColorStop(1, "rgba(0,0,0,0.55)");
    g.fillStyle = gr;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  function minWater(g, x, y, s, rot) {
    for (const sg of [-1, 1]) { const an = rot + sg * 0.92; minBall(g, x + Math.sin(an) * s * 1.05, y - Math.cos(an) * s * 1.05, s * 0.6, "#F4F4F4"); }
    minBall(g, x, y, s, MIN_W);
  }
  function supText(g, base, sup, x, y) {
    g.fillText(base, x, y);
    const w = g.measureText(base).width;
    const f = g.font;
    const m = /(\d+(?:\.\d+)?)px/.exec(f);
    const sz = m ? +m[1] : 20;
    g.font = f.replace(/(\d+(?:\.\d+)?)px/, (sz * 0.62).toFixed(1) + "px");
    g.fillText(sup, x + w + 1, y - sz * 0.38);
    g.font = f;
  }
  function drawStruct(g, kind, x, y, w, h, gapK, t) {
    const T = 9, Oh = 12;
    g.save();
    if (kind === 0) {
      const U = T + Oh, gp = 6, n = 4, H = n * U + (n - 1) * gp, y0 = y + (h - H) / 2;
      for (let i = 0; i < n; i++) {
        const yy = y0 + i * (U + gp);
        minTet(g, x, yy, w, T, true);
        minOct(g, x + 1, yy + T, w - 2, Oh);
        if (i < n - 1) {
          g.strokeStyle = "rgba(255,255,255,0.6)";
          g.lineWidth = 1.5;
          for (let k = x + 10; k < x + w - 6; k += 14) { g.beginPath(); g.moveTo(k, yy + U + 1); g.lineTo(k, yy + U + gp - 1); g.stroke(); }
        }
      }
    } else {
      const U = 2 * T + Oh;
      const gp = kind === 1 ? 12 : 8 + 22 * gapK, n = 3, H = n * U + (n - 1) * gp, y0 = y + (h - H) / 2;
      for (let i = 0; i < n; i++) {
        const yy = y0 + i * (U + gp);
        minTet(g, x, yy, w, T, false);
        minOct(g, x + 1, yy + T, w - 2, Oh);
        minTet(g, x, yy + T + Oh, w, T, true);
        if (i < n - 1) {
          const ym = yy + U + gp / 2;
          if (kind === 1) {
            for (let k = 0; k < 7; k++) minBall(g, x + 14 + k * (w - 28) / 6, ym, 4.6, MIN_K);
          } else {
            const rows = Math.max(1, Math.min(4, Math.round((gp - 6) / 7)));
            for (let rI = 0; rI < rows; rI++) for (let k = 0; k < 9; k++) {
              const xx = x + 10 + k * (w - 20) / 8 + (rI % 2) * 6, yy2 = yy + U + (rI + 0.5) * gp / rows + Math.sin(t * 3 + k + rI) * 0.6;
              if ((k + rI * 4) % 5 === 2) minBall(g, xx, yy2, 4.2, MIN_CAT);
              else minWater(g, xx, yy2, 3, k * 1.3 + rI + t);
            }
          }
        }
      }
    }
    g.restore();
  }
  var __semCache = null;
  function semThumbs() {
    if (__semCache) return __semCache;
    const W = 440, H = 330;
    const r = mulberry32(31);
    const mk = () => { const c = document.createElement("canvas"); c.width = W; c.height = H; return c; };
    function bg(g, a = "#3c3c3c", b = "#0b0b0b") {
      const gr = g.createRadialGradient(W * 0.5, H * 0.45, 20, W * 0.5, H * 0.5, W * 0.72);
      gr.addColorStop(0, a);
      gr.addColorStop(1, b);
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
    }
    function finish(c) {
      const g = c.getContext("2d");
      const id = g.getImageData(0, 0, W, H), dd = id.data;
      for (let i = 0; i < dd.length; i += 4) {
        const n = (r() - 0.5) * 26 + (Math.floor(i / 4 / W) % 2 ? 2 : -2);
        const v = Math.max(0, Math.min(255, (dd[i] + dd[i + 1] + dd[i + 2]) / 3 + n));
        dd[i] = dd[i + 1] = dd[i + 2] = v;
      }
      g.putImageData(id, 0, 0);
      const vg = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.7);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.55)");
      g.fillStyle = vg;
      g.fillRect(0, 0, W, H);
      return c;
    }
    function plate(g, cx, cy, R, rot, sq, th, light) {
      const P = [];
      for (let k = 0; k < 6; k++) { const an = rot + k * Math.PI / 3; P.push([cx + R * Math.cos(an), cy + R * Math.sin(an) * sq]); }
      for (let k = 0; k < 6; k++) {
        const mid = rot + (k + 0.5) * Math.PI / 3;
        if (Math.sin(mid) <= 0.02) continue;
        const A = P[k], B = P[(k + 1) % 6];
        const sh = 0.25 + 0.4 * Math.abs(Math.cos(mid - 0.6));
        g.fillStyle = `rgb(${Math.round(90 * sh * light + 25)},${Math.round(90 * sh * light + 25)},${Math.round(90 * sh * light + 25)})`;
        g.beginPath();
        g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.lineTo(B[0], B[1] + th); g.lineTo(A[0], A[1] + th);
        g.closePath();
        g.fill();
        g.strokeStyle = "rgba(235,235,235,0.55)";
        g.lineWidth = 0.9;
        g.beginPath(); g.moveTo(A[0], A[1] + th); g.lineTo(B[0], B[1] + th); g.stroke();
      }
      const gr = g.createLinearGradient(cx - R, cy - R * sq, cx + R, cy + R * sq);
      gr.addColorStop(0, `rgb(${Math.round(205 * light)},${Math.round(205 * light)},${Math.round(205 * light)})`);
      gr.addColorStop(1, `rgb(${Math.round(120 * light)},${Math.round(120 * light)},${Math.round(120 * light)})`);
      g.fillStyle = gr;
      g.beginPath();
      P.forEach((p, k) => k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]));
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(255,255,255,0.9)";
      g.lineWidth = 1.6;
      g.stroke();
    }
    const kao = mk();
    {
      const g = kao.getContext("2d");
      bg(g);
      for (let i = 0; i < 12; i++) plate(g, 20 + r() * 400, 250 + r() * 80, 18 + r() * 16, r() * 1, 0.32, 3, 0.5);
      const book = (cx, cy, R, n, rot, light, bend) => {
        for (let i = 0; i < n; i++) plate(g, cx + Math.sin(i / n * 3.1) * bend + (r() - 0.5) * 2.5, cy - i * 5.4, R * (0.93 + 0.1 * r()), rot + (r() - 0.5) * 0.07, 0.34, 5.4, light * (0.88 + 0.12 * r()));
      };
      book(352, 150, 58, 16, 0.25, 0.68, 6);
      book(92, 196, 52, 13, 0.6, 0.72, -5);
      book(232, 312, 92, 30, 0.1, 1, 10);
    }
    const ill = mk();
    {
      const g = ill.getContext("2d");
      bg(g, "#343434", "#0a0a0a");
      for (let i = 0; i < 26; i++) {
        const cx = r() * W, cy = r() * H, ang = r() * Math.PI, L = 70 + r() * 150, wd = 6 + r() * 12, bend = (r() - 0.5) * 30;
        const light = 0.55 + 0.45 * (i / 26);
        g.save();
        g.translate(cx, cy);
        g.rotate(ang);
        g.beginPath();
        g.moveTo(-L / 2, -wd / 2);
        g.quadraticCurveTo(0, -wd / 2 + bend, L / 2, -wd / 2 * 0.6);
        g.lineTo(L / 2, wd / 2 * 0.6);
        g.quadraticCurveTo(0, wd / 2 + bend, -L / 2, wd / 2);
        g.closePath();
        const gr = g.createLinearGradient(0, -wd / 2, 0, wd / 2);
        gr.addColorStop(0, `rgba(240,240,240,${0.9 * light})`);
        gr.addColorStop(0.5, `rgba(150,150,150,${0.95 * light})`);
        gr.addColorStop(1, `rgba(60,60,60,${0.95 * light})`);
        g.fillStyle = gr;
        g.fill();
        g.strokeStyle = `rgba(255,255,255,${0.7 * light})`;
        g.lineWidth = 1;
        g.stroke();
        g.strokeStyle = `rgba(230,230,230,${0.55 * light})`;
        g.lineWidth = 0.7;
        for (let k = 0; k < 5; k++) { const sy = (r() - 0.5) * wd * 0.6; g.beginPath(); g.moveTo(L / 2, sy); g.quadraticCurveTo(L / 2 + 10 + r() * 14, sy + (r() - 0.5) * 10, L / 2 + 16 + r() * 24, sy + (r() - 0.5) * 18); g.stroke(); }
        g.restore();
      }
      g.strokeStyle = "rgba(225,225,225,0.4)";
      g.lineWidth = 0.6;
      for (let i = 0; i < 70; i++) { const x0 = r() * W, y0 = r() * H, an = r() * 6.28, L = 20 + r() * 50; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 + Math.cos(an + 0.4) * L * 0.5, y0 + Math.sin(an + 0.4) * L * 0.5, x0 + Math.cos(an) * L, y0 + Math.sin(an) * L); g.stroke(); }
    }
    const mon = mk();
    {
      const g = mon.getContext("2d");
      const id = g.createImageData(W, H), dd = id.data;
      const NS = 34, pts = [];
      for (let k = 0; k < NS; k++) pts.push([r() * W, r() * H, 0.6 + 0.4 * r()]);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const wx = x + 9 * Math.sin(y * 0.045 + Math.sin(x * 0.02) * 2) + 5 * Math.sin(y * 0.13 + x * 0.05);
        const wy = y + 9 * Math.cos(x * 0.04 + Math.sin(y * 0.025) * 2) + 5 * Math.cos(x * 0.11 - y * 0.04);
        let f1 = 1e9, f2 = 1e9, b1 = 0;
        for (let k = 0; k < NS; k++) { const dx = wx - pts[k][0], dy = (wy - pts[k][1]) * 1.25, dd2 = dx * dx + dy * dy; if (dd2 < f1) { f2 = f1; f1 = dd2; b1 = k; } else if (dd2 < f2) f2 = dd2; }
        const e = Math.sqrt(f2) - Math.sqrt(f1);
        const ridge = Math.exp(-e * e / 18);
        const rim2 = Math.exp(-Math.pow(e - 7, 2) / 10) * 0.35;
        const inner = Math.min(1, Math.sqrt(f1) / 70);
        const crease = 0.5 + 0.5 * Math.sin(wx * 0.09 + wy * 0.07 + b1);
        let v = 40 + 70 * pts[b1][2] * (1 - inner * 0.6) + 18 * crease + 175 * ridge + 60 * rim2;
        v = Math.max(0, Math.min(255, v));
        const o = (y * W + x) * 4;
        dd[o] = dd[o + 1] = dd[o + 2] = v;
        dd[o + 3] = 255;
      }
      g.putImageData(id, 0, 0);
    }
    __semCache = [finish(kao), finish(ill), finish(mon)];
    return __semCache;
  }
  function drawMineralPanel(O, p, a, gap = 0.62) {
    const g = O.g;
    const sem = semThumbs();
    g.save();
    g.globalAlpha = a;
    const x = 90, y = 196, w = 940, h = 724;
    g.fillStyle = "rgba(6,12,20,0.88)";
    O.rr(x, y, w, h, 18);
    g.fill();
    g.strokeStyle = "rgba(140,200,255,0.18)";
    g.lineWidth = 1.5;
    O.rr(x, y, w, h, 18);
    g.stroke();
    O.font(30, 700, FH);
    g.fillStyle = C.water;
    g.textBaseline = "alphabetic";
    g.fillText("MELYIK DUZZAD?", x + 36, y + 54);
    O.font(20, 600, FB);
    g.fillStyle = "rgba(247,244,238,0.6)";
    g.fillText("mikroszkóp alatt", x + 36, y + 96);
    const rows = [
      ["KAOLINIT", "alig duzzad", 15],
      ["ILLIT", "mérsékelten", 82],
      ["MONTMORILLONIT", "ERŐSEN duzzad", 770]
    ];
    const gapK = clamp2((gap - 0.12) / 1);
    rows.forEach(([n, s, v], i) => {
      const k = easeOut(clamp2((p - 0.3 - i * 0.5) / 0.8));
      const ra = clamp2((p - 0.2 - i * 0.5) / 0.4);
      const yy = y + 112 + i * 200;
      g.globalAlpha = a * ra;
      g.save();
      O.rr(x + 36, yy, 232, 174, 10);
      g.clip();
      g.drawImage(sem[i], x + 36, yy, 232, 174);
      g.restore();
      g.strokeStyle = "rgba(255,255,255,0.22)";
      g.lineWidth = 1.2;
      O.rr(x + 36, yy, 232, 174, 10);
      g.stroke();
      drawStruct(g, i, x + 296, yy + 4, 214, 166, i === 2 ? gapK : 0, p);
      if (i === 1) {
        O.font(20, 700, FB);
        g.fillStyle = MIN_K;
        supText(g, "K", "+", x + 296 + 214 + 8, yy + 4 + 83 + 7);
      }
      const tx = x + 560;
      O.font(40, 800, FH);
      g.fillStyle = i === 2 ? C.accent : C.white;
      g.fillText(n, tx, yy + 62);
      O.font(24, 500, FB);
      g.fillStyle = i === 2 ? C.white : C.dim;
      g.fillText(s, tx, yy + 98);
      const bw = 330 * (v / 840) * k;
      g.fillStyle = "rgba(255,255,255,0.08)";
      g.fillRect(tx, yy + 120, 330, 18);
      g.fillStyle = i === 2 ? C.accent : "rgba(140,200,255,0.8)";
      g.fillRect(tx, yy + 120, Math.max(bw, 4), 18);
    });
    g.restore();
  }
  function drawMicroLegend(O, t) {
    const a = win(t, 73.4, 78.4, 0.5, 0.5);
    if (a <= 0) return;
    const g = O.g;
    g.save();
    g.globalAlpha = a;
    const x = 96, y = 84, w = 300, h = 186;
    g.fillStyle = "rgba(6,12,20,0.78)";
    O.rr(x, y, w, h, 14);
    g.fill();
    const items = ["tetraéder", "oktaéder", "kation"];
    items.forEach((s, i) => {
      const k = clamp2((t - 73.4 - i * 0.35) / 0.4);
      g.globalAlpha = a * k;
      const cy = y + 40 + i * 54, cx = x + 42;
      if (i === 0) {
        g.beginPath(); g.moveTo(cx, cy - 18); g.lineTo(cx + 19, cy + 13); g.lineTo(cx - 19, cy + 13); g.closePath();
        g.fillStyle = MIN_T; g.fill();
        g.strokeStyle = "rgba(255,240,205,0.95)"; g.lineWidth = 1.6; g.stroke();
        g.beginPath(); g.moveTo(cx, cy - 18); g.lineTo(cx + 3, cy + 4); g.lineTo(cx + 19, cy + 13); g.moveTo(cx + 3, cy + 4); g.lineTo(cx - 19, cy + 13); g.stroke();
      } else if (i === 1) {
        g.beginPath(); g.moveTo(cx, cy - 21); g.lineTo(cx + 18, cy - 4); g.lineTo(cx + 10, cy + 20); g.lineTo(cx - 12, cy + 15); g.lineTo(cx - 18, cy - 6); g.closePath();
        g.fillStyle = MIN_O; g.fill();
        g.strokeStyle = "rgba(205,255,240,0.95)"; g.lineWidth = 1.6; g.stroke();
        g.beginPath(); g.moveTo(cx - 18, cy - 6); g.lineTo(cx + 18, cy - 4); g.moveTo(cx, cy - 21); g.lineTo(cx - 2, cy + 3); g.lineTo(cx + 10, cy + 20); g.moveTo(cx - 2, cy + 3); g.lineTo(cx - 12, cy + 15); g.stroke();
      } else minBall(g, cx, cy, 13, MIN_CAT);
      O.font(28, 600, FB);
      g.fillStyle = C.white;
      g.textBaseline = "middle";
      g.fillText(s, x + 82, cy + 1);
    });
    g.restore();
  }
