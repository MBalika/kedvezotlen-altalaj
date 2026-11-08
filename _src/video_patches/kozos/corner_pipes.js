      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => {
        gu.push(pipeSweep([[sx * (ex + 0.08), ry - 0.08, sz * (ez + 0.08)], [sx * (ex + 0.08), ry - 0.32, sz * (ez + 0.08)], [sx * 5.08, ry - 0.86, sz * 4.58], [sx * 5.08, -0.3, sz * 4.58]], 0.055, 0.14, 12));
        const bt = new CylinderGeometry(0.08, 0.08, 0.34, 14);
        bt.translate(sx * 5.08, 0.03, sz * 4.58);
        gu.push(bt);
        for (const y of [0.75, 1.65]) {
          const tr = new TorusGeometry(0.064, 0.013, 6, 16);
          tr.rotateX(Math.PI / 2);
          tr.translate(sx * 5.08, y, sz * 4.58);
          gu.push(tr);
          const rd = new BoxGeometry(0.06, 0.024, 0.024);
          rd.rotateY(sx * sz > 0 ? -Math.PI / 4 : Math.PI / 4);
          rd.translate(sx * 5.025, y, sz * 4.525);
          gu.push(rd);
        }
      });
