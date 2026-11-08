# Közös vibrálás-javítás az 1–4. videóhoz: a 3D kép a tényleges megjelenítési felbontásban készül (nincs CSS-kicsinyítési
# villódzás), a lombozat élsimított (alpha-to-coverage) és nyugodtabb, a kamera közeli vágósíkja pontosabb mélységet ad.
import sys
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def rep(s, old, new):
    assert s.count(old) == 1, (old[:70], s.count(old)); return s.replace(old, new)
s = rep(s, "const m = new MeshStandardMaterial({ map: tex, alphaTest: 0.42, side: DoubleSide, vertexColors: true, roughness: 0.78, metalness: 0 });",
        "const m = new MeshStandardMaterial({ map: tex, alphaTest: 0.42, alphaToCoverage: true, side: DoubleSide, vertexColors: true, roughness: 0.78, metalness: 0 });")
s = rep(s, "sin(uWind*4.0 + rnd*30.0)*0.03;", "sin(uWind*4.0 + rnd*30.0)*0.012;")
s = rep(s, "var camera = new PerspectiveCamera(40, W / H2, 0.05, 6e3);", "var camera = new PerspectiveCamera(40, W / H2, 0.12, 6e3);")
s = rep(s, """      const k = Math.min(innerWidth / W2, innerHeight / H3);
      wrap.style.transform = `scale(${k}) translate(-50%,-50%)`;""", """      const k = Math.min(innerWidth / W2, innerHeight / H3);
      wrap.style.transform = `scale(${k}) translate(-50%,-50%)`;
      if (!exporting) setRes(Math.min(1, Math.max(0.34, k * (window.devicePixelRatio || 1))));""")
s = rep(s, """    addEventListener("resize", fit);
    fit();""", """    function setRes(kd) {
      const w = Math.round(W2 * kd), h = Math.round(H3 * kd);
      if (c3d.width === w && c3d.height === h) return;
      renderer.setSize(w, h, false);
      if (typeof playing !== "undefined" && !playing) renderAt2(tNow);
    }
    addEventListener("resize", fit);
    fit();""")
s = rep(s, """        await exportMP4();
      } catch (e) {""", """        setRes(1);
        await exportMP4();
      } catch (e) {""")
s = rep(s, """      exporting = false;
      ex.style.display = "none";
    };""", """      exporting = false;
      ex.style.display = "none";
      fit();
    };""")
open(out, 'w', encoding='utf-8').write(s)
print('common ok', out)
