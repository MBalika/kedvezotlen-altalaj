    const drain = new Group();
    {
      const gm = new MeshStandardMaterial({ color: 7040882, roughness: 0.35, metalness: 0.6 });
      const kg = new MeshStandardMaterial({ color: 13132078, roughness: 0.55, metalness: 0 });
      const dp = new Mesh(pipeSweep([[5.63, 3.12, 0], [5.63, 2.9, 0], [5.1, 2.42, 0], [5.1, 0.36, 0]], 0.055, 0.14), gm);
      const sock = new Mesh(new CylinderGeometry(0.088, 0.088, 0.22, 20), kg);
      sock.position.set(5.1, 0.33, 0);
      const ug = new Mesh(pipeSweep([[5.1, 0.42, 0], [5.1, -0.55, 0], [6.2, -0.6, 0], [24, -0.85, 0]], 0.07, 0.35, 16), kg);
      drain.add(dp, sock, ug);
      for (const y of [0.8, 1.6, 2.25]) {
        const ring = new Mesh(new TorusGeometry(0.064, 0.013, 8, 20), gm);
        ring.rotation.x = Math.PI / 2;
        ring.position.set(5.1, y, 0);
        const rod = new Mesh(new BoxGeometry(0.05, 0.024, 0.024), gm);
        rod.position.set(5.03, y, 0);
        drain.add(ring, rod);
      }
    }
