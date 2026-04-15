import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ── ribbon configs ───────────────────────────────────────────────── */
const RIBBONS = [
  { color: 0x1a5fff, emissive: 0x0a2fa0, y:  3.0, amp: 1.4, freq: 0.55, speed: 0.55, radius: 0.14, phase: 0.0 },
  { color: 0x4488ff, emissive: 0x1144bb, y:  1.0, amp: 1.8, freq: 0.45, speed: 0.42, radius: 0.10, phase: 1.3 },
  { color: 0x0033cc, emissive: 0x001266, y: -0.5, amp: 2.2, freq: 0.38, speed: 0.65, radius: 0.18, phase: 2.6 },
  { color: 0x2255dd, emissive: 0x0a2288, y: -2.0, amp: 1.6, freq: 0.60, speed: 0.48, radius: 0.09, phase: 0.8 },
  { color: 0xff6622, emissive: 0xaa2200, y: -3.5, amp: 1.0, freq: 0.70, speed: 0.35, radius: 0.07, phase: 4.1 },
  { color: 0x0055ff, emissive: 0x002299, y:  4.5, amp: 0.8, freq: 0.50, speed: 0.72, radius: 0.08, phase: 3.2 },
];

const POINTS_PER_RIBBON = 60;
const X_SPAN = 28; // wide enough to fill any viewport

function buildCurve(cfg, t) {
  const pts = [];
  for (let i = 0; i <= POINTS_PER_RIBBON; i++) {
    const u = (i / POINTS_PER_RIBBON) * X_SPAN - X_SPAN / 2;
    const y = cfg.y
      + Math.sin(u * cfg.freq + t * cfg.speed + cfg.phase) * cfg.amp
      + Math.cos(u * cfg.freq * 0.6 + t * cfg.speed * 0.7 + cfg.phase * 1.2) * cfg.amp * 0.4;
    const z = Math.sin(u * cfg.freq * 0.3 + t * 0.2) * 0.6;
    pts.push(new THREE.Vector3(u, y, z));
  }
  return new THREE.CatmullRomCurve3(pts);
}

const Ribbon3D = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* ── renderer ──────────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x060a12, 1);
    container.appendChild(renderer.domElement);

    /* ── scene / camera ────────────────────────────────────────────── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060a12, 0.045);

    const camera = new THREE.PerspectiveCamera(
      65, container.clientWidth / container.clientHeight, 0.1, 100,
    );
    camera.position.set(0, 0, 10);

    /* ── lights ────────────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x112244, 1.5));
    const ptLight = new THREE.PointLight(0x4488ff, 2.5, 30);
    ptLight.position.set(0, 3, 5);
    scene.add(ptLight);
    const ptLight2 = new THREE.PointLight(0xff6622, 1.2, 20);
    ptLight2.position.set(5, -3, 4);
    scene.add(ptLight2);

    /* ── ribbon meshes ─────────────────────────────────────────────── */
    const ribbonMeshes = RIBBONS.map((cfg) => {
      const mat = new THREE.MeshPhongMaterial({
        color: cfg.color,
        emissive: cfg.emissive,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      const curve = buildCurve(cfg, 0);
      const geo = new THREE.TubeGeometry(curve, POINTS_PER_RIBBON, cfg.radius, 8, false);
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);
      return { mesh, cfg };
    });

    /* ── mouse parallax ────────────────────────────────────────────── */
    const mouse = { x: 0, y: 0 };
    const camTarget = { x: 0, y: 0 };

    function onMouseMove(e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }
    window.addEventListener('mousemove', onMouseMove);

    /* ── animation ─────────────────────────────────────────────────── */
    const clock = new THREE.Clock();
    let frame = 0, rafId;

    function tick() {
      rafId = requestAnimationFrame(tick);
      frame++;
      const t = clock.getElapsedTime();

      /* camera parallax (smooth) */
      camTarget.x += (mouse.x * 1.2 - camTarget.x) * 0.04;
      camTarget.y += (mouse.y * 0.6 - camTarget.y) * 0.04;
      camera.position.x = camTarget.x;
      camera.position.y = camTarget.y;
      camera.lookAt(0, 0, 0);

      /* rebuild ribbon geometry every 3 frames */
      if (frame % 3 === 0) {
        ribbonMeshes.forEach(({ mesh, cfg }) => {
          mesh.geometry.dispose();
          mesh.geometry = new THREE.TubeGeometry(
            buildCurve(cfg, t),
            POINTS_PER_RIBBON, cfg.radius, 8, false,
          );
        });
      }

      /* pulsate emissive */
      ribbonMeshes.forEach(({ mesh, cfg }, i) => {
        mesh.material.emissiveIntensity = 0.5 + 0.5 * Math.sin(t * 1.2 + i * 1.1);
      });

      renderer.render(scene, camera);
    }
    tick();

    /* ── resize ────────────────────────────────────────────────────── */
    function onResize() {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      ro.disconnect();
      ribbonMeshes.forEach(({ mesh }) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
      });
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: '#060a12' }}
    />
  );
};

export default Ribbon3D;
