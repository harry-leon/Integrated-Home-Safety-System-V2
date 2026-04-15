import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MAX_TRAIL  = 80;
const UPDATE_EVERY = 2;

// Trail segment boundaries (fraction of total trail length)
const SEG_HEAD = 0.30; // last 30 % → brightest
const SEG_MID  = 0.65; // middle 35 %
//                       remaining 35 % → tail (faintest)

// Tube radii per segment
const R_HEAD_IN  = 0.030;
const R_HEAD_OUT = 0.090;
const R_MID_IN   = 0.020;
const R_MID_OUT  = 0.068;
const R_TAIL_IN  = 0.010;
const R_TAIL_OUT = 0.048;

const SEGS = 7; // radial segments

// Color palette: oscillate between two cyber hues (HSL)
// hue 185° = electric cyan, hue 270° = violet
const HUE_A = 185;
const HUE_B = 270;

const TubesCursor = () => {
  const ready = useRef(false);

  useEffect(() => {
    if (ready.current) return;
    ready.current = true;

    /* ── renderer ───────────────────────────────────────────────── */
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    const el = renderer.domElement;
    Object.assign(el.style, {
      position: 'fixed', top: 0, left: 0,
      width: '100vw', height: '100vh',
      pointerEvents: 'none', zIndex: 99999,
    });
    document.body.appendChild(el);

    /* ── scene / orthographic camera ───────────────────────────── */
    const scene = new THREE.Scene();
    const H = 10;
    const aspect = () => window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(
      -H * aspect(), H * aspect(), H, -H, 0.1, 50
    );
    camera.position.z = 10;

    function toWorld(cx, cy) {
      return new THREE.Vector3(
        ((cx / window.innerWidth)  * 2 - 1) * H * aspect(),
        (-(cy / window.innerHeight) * 2 + 1) * H,
        0
      );
    }

    /* ── helper: hue → THREE.Color ─────────────────────────────── */
    function hslColor(hDeg, s, l) {
      return new THREE.Color().setHSL(hDeg / 360, s, l);
    }

    /* ── materials: three inner + three outer + dot + flash ─────── */
    // inner (bright core)
    const mkInner = (hDeg, opacity) => new THREE.MeshBasicMaterial({
      color: hslColor(hDeg, 1.0, 0.72),
      transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    // outer (soft halo)
    const mkOuter = (hDeg, opacity) => new THREE.MeshBasicMaterial({
      color: hslColor(hDeg, 0.9, 0.45),
      transparent: true, opacity,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.BackSide,
    });

    const mHeadIn  = mkInner(HUE_A, 0.95);
    const mHeadOut = mkOuter(HUE_A, 0.45);
    const mMidIn   = mkInner(HUE_A, 0.55);
    const mMidOut  = mkOuter(HUE_A, 0.22);
    const mTailIn  = mkInner(HUE_A, 0.22);
    const mTailOut = mkOuter(HUE_A, 0.10);

    // cursor dot: small bright sphere
    const mDot = new THREE.MeshBasicMaterial({
      color: hslColor(HUE_A, 1.0, 0.88),
      transparent: true, opacity: 1,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });

    // cursor ring around dot
    const mRing = new THREE.MeshBasicMaterial({
      color: hslColor(HUE_A, 1.0, 0.72),
      transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    });

    // click flash: inner ring
    const mFlashA = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    });
    // click flash: outer ring
    const mFlashB = new THREE.MeshBasicMaterial({
      color: hslColor(HUE_A, 1.0, 0.72),
      transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false,
      side: THREE.DoubleSide,
    });

    /* ── cursor meshes ──────────────────────────────────────────── */
    const dotMesh  = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), mDot);
    const ringMesh = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.20, 40), mRing);
    const flashA   = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.30, 40), mFlashA);
    const flashB   = new THREE.Mesh(new THREE.RingGeometry(0.32, 0.38, 40), mFlashB);
    scene.add(dotMesh, ringMesh, flashA, flashB);

    /* ── trail meshes ───────────────────────────────────────────── */
    let meshes = { headIn: null, headOut: null, midIn: null, midOut: null, tailIn: null, tailOut: null };

    function dropMesh(key) {
      if (meshes[key]) {
        scene.remove(meshes[key]);
        meshes[key].geometry.dispose();
        meshes[key] = null;
      }
    }

    function buildTube(pts, rInner, rOuter, matIn, matOut, keyIn, keyOut) {
      dropMesh(keyIn);
      dropMesh(keyOut);
      if (pts.length < 2) return;
      const curve  = new THREE.CatmullRomCurve3(pts);
      const steps  = Math.max(pts.length * 3, 20);
      meshes[keyIn]  = new THREE.Mesh(new THREE.TubeGeometry(curve, steps, rInner, SEGS, false), matIn);
      meshes[keyOut] = new THREE.Mesh(new THREE.TubeGeometry(curve, steps, rOuter, SEGS, false), matOut);
      scene.add(meshes[keyIn], meshes[keyOut]);
    }

    function rebuildTrail(pts) {
      if (pts.length < 2) {
        Object.keys(meshes).forEach(dropMesh);
        return;
      }
      const n    = pts.length;
      const iMid = Math.floor(n * (1 - SEG_HEAD));       // start of HEAD segment
      const iTail = Math.floor(n * (1 - SEG_MID));       // start of MID segment

      const headPts = pts.slice(iMid);
      const midPts  = pts.slice(iTail, iMid + 1);
      const tailPts = pts.slice(0, iTail + 1);

      buildTube(headPts, R_HEAD_IN, R_HEAD_OUT, mHeadIn, mHeadOut, 'headIn', 'headOut');
      buildTube(midPts,  R_MID_IN,  R_MID_OUT,  mMidIn,  mMidOut,  'midIn',  'midOut');
      buildTube(tailPts, R_TAIL_IN, R_TAIL_OUT, mTailIn, mTailOut, 'tailIn', 'tailOut');
    }

    /* ── state ──────────────────────────────────────────────────── */
    const trail  = [];
    const mouse  = new THREE.Vector3(99999, 99999, 0);
    let frame = 0, flashT = 0, rafId;

    /* ── color oscillation ──────────────────────────────────────── */
    function setHue(hDeg) {
      mHeadIn.color  = hslColor(hDeg, 1.0, 0.72);
      mHeadOut.color = hslColor(hDeg, 0.9, 0.45);
      mMidIn.color   = hslColor(hDeg, 1.0, 0.65);
      mMidOut.color  = hslColor(hDeg, 0.9, 0.40);
      mTailIn.color  = hslColor(hDeg, 1.0, 0.55);
      mTailOut.color = hslColor(hDeg, 0.9, 0.35);
      mDot.color     = hslColor(hDeg, 1.0, 0.88);
      mRing.color    = hslColor(hDeg, 1.0, 0.72);
      mFlashB.color  = hslColor(hDeg, 1.0, 0.72);
    }

    /* ── animation loop ─────────────────────────────────────────── */
    function tick() {
      rafId = requestAnimationFrame(tick);
      frame++;

      // oscillate hue between HUE_A and HUE_B every ~3 s (180 frames)
      const t   = (Math.sin(frame * (Math.PI / 180)) + 1) / 2; // 0..1
      const hue = HUE_A + (HUE_B - HUE_A) * t;
      setHue(hue);

      if (frame % UPDATE_EVERY === 0) rebuildTrail(trail);

      dotMesh.position.copy(mouse);
      ringMesh.position.copy(mouse);
      flashA.position.copy(mouse);
      flashB.position.copy(mouse);

      // cursor ring slow spin
      ringMesh.rotation.z += 0.018;

      // click flash animation
      if (flashT > 0) {
        flashT = Math.max(0, flashT - 0.042);
        const progress = 1 - flashT;
        flashA.scale.setScalar(1 + progress * 3.2);
        flashB.scale.setScalar(1 + progress * 2.0);
        mFlashA.opacity = flashT * 0.85;
        mFlashB.opacity = flashT * 0.55;
      } else {
        mFlashA.opacity = 0;
        mFlashB.opacity = 0;
      }

      renderer.render(scene, camera);
    }
    tick();

    /* ── events ─────────────────────────────────────────────────── */
    function onMove(e) {
      const wp = toWorld(e.clientX, e.clientY);
      mouse.copy(wp);
      const last = trail[trail.length - 1];
      if (!last || last.distanceTo(wp) > 0.015) {
        trail.push(wp.clone());
        if (trail.length > MAX_TRAIL) trail.shift();
      }
    }

    function onResize() {
      const w = window.innerWidth, h = window.innerHeight;
      const a = w / h;
      camera.left = -H * a; camera.right = H * a;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }

    document.documentElement.style.cursor = 'none';
    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', () => { flashT = 1; });
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('click', () => {});
      document.documentElement.style.cursor = '';
      document.body.removeChild(el);
      renderer.dispose();
      [mHeadIn, mHeadOut, mMidIn, mMidOut, mTailIn, mTailOut,
       mDot, mRing, mFlashA, mFlashB].forEach(m => m.dispose());
      Object.keys(meshes).forEach(dropMesh);
      ready.current = false;
    };
  }, []);

  return null;
};

export default TubesCursor;
