import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * Interactive 3D Smart Home — React component
 * Ultimate Aesthetic Update: Perfect Alignment, Sci-Fi Materials, & Viewport Offset
 */
const House3D = ({ onInteract }) => {
  const mountRef = useRef(null);
  const onInteractRef = useRef(onInteract);
  const [isIdle, setIsIdle] = useState(true);
  const idleTimeoutRef = useRef(null);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  // Handle Idle State Reset
  const resetIdle = () => {
    setIsIdle(false);
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      setIsIdle(true);
    }, 2500); // Callout reappears after 2.5s of inactivity
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    /* ── Renderer ─────────────────────────────────────────────── */
    const R = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    R.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    R.setSize(container.clientWidth, container.clientHeight);
    R.setClearColor(0x020617, 0); // Transparent background
    container.appendChild(R.domElement);

    /* ── Scene / Camera ───────────────────────────────────────── */
    const S = new THREE.Scene();
    S.fog = new THREE.FogExp2(0x020617, 0.010);

    const aspect = container.clientWidth / container.clientHeight;
    const frustumSize = 40;
    const cam = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );

    function updateCameraOffset() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const aspect = w / h;
      cam.left = -frustumSize * aspect / 2;
      cam.right = frustumSize * aspect / 2;
      cam.top = frustumSize / 2;
      cam.bottom = -frustumSize / 2;
      cam.updateProjectionMatrix();
    }
    updateCameraOffset();

    /* ── Lighting ─────────────────────────────────────────────── */
    S.add(new THREE.AmbientLight(0xffffff, 1.2)); // Brighten base
    
    const sun = new THREE.DirectionalLight(0x38bdf8, 2.0);
    sun.position.set(-20, 40, 20);
    S.add(sun);
    
    const fill = new THREE.DirectionalLight(0xa855f7, 1.0);
    fill.position.set(20, 10, -20);
    S.add(fill);

    const accentLight = new THREE.PointLight(0x2dd4bf, 3, 60);
    accentLight.position.set(0, 10, 0);
    S.add(accentLight);

    /* ── Solid Isometric Materials & Glowing Edges ───────────────────────────── */
    const colorWall = 0x006699; // Deep teal/blue
    const colorEdge = 0x00e5ff; // Bright neon cyan
    const colorWindow = 0x00ffff; // Cyan glow

    const mSolid = new THREE.MeshPhysicalMaterial({
      color: colorWall,
      metalness: 0.3,
      roughness: 0.2,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
      clearcoat: 0.8
    });

    const mWindow = new THREE.MeshStandardMaterial({
      color: colorWindow,
      emissive: colorWindow,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.9
    });

    function createBlock(w, h, d, color = colorEdge) {
      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mSolid.clone());
      const edges = new THREE.EdgesGeometry(geo);
      const lines = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: 0.8,
        blending: THREE.AdditiveBlending
      }));
      const group = new THREE.Group();
      group.add(mesh, lines);
      return group;
    }

    function createWindow(w, h, d) {
      const geo = new THREE.BoxGeometry(w, h, d);
      return new THREE.Mesh(geo, mWindow);
    }

    /* ── Shield, Solar Panels & Antenna ───────────────────────── */
    // Shield
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.2);
    shieldShape.quadraticCurveTo(1.2, 1.2, 1.2, 0);
    shieldShape.quadraticCurveTo(1.2, -1.2, 0, -2.0);
    shieldShape.quadraticCurveTo(-1.2, -1.2, -1.2, 0);
    shieldShape.quadraticCurveTo(-1.2, 1.2, 0, 1.2);
    const extrudeSettings = { depth: 0.15, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05 };
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, extrudeSettings);
    const shieldMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, emissive: 0x1d4ed8, emissiveIntensity: 0.6, transparent: true, opacity: 0.9 });
    const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    const shieldEdges = new THREE.LineSegments(new THREE.EdgesGeometry(shieldGeo), new THREE.LineBasicMaterial({ color: colorWindow, blending: THREE.AdditiveBlending }));
    const shieldGroup = new THREE.Group();
    shieldGroup.add(shieldMesh, shieldEdges);
    shieldGroup.scale.set(0.6, 0.6, 0.6);

    // Solar Panel
    function createSolarPanel() {
      const pGeo = new THREE.BoxGeometry(3.5, 0.1, 2.5);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.1 });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      
      // Grid lines on panel
      const gridCanvas = document.createElement('canvas');
      gridCanvas.width = 128; gridCanvas.height = 128;
      const gctx = gridCanvas.getContext('2d');
      gctx.strokeStyle = '#22d3ee'; gctx.lineWidth = 2;
      for(let i=0; i<=128; i+=16) { gctx.beginPath(); gctx.moveTo(i, 0); gctx.lineTo(i, 128); gctx.stroke(); gctx.beginPath(); gctx.moveTo(0, i); gctx.lineTo(128, i); gctx.stroke(); }
      const gridTex = new THREE.CanvasTexture(gridCanvas);
      gridTex.wrapS = THREE.RepeatWrapping; gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(2, 2);
      const overlayGeo = new THREE.PlaneGeometry(3.4, 2.4);
      const overlayMat = new THREE.MeshBasicMaterial({ map: gridTex, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
      const overlay = new THREE.Mesh(overlayGeo, overlayMat);
      overlay.rotation.x = -Math.PI / 2;
      overlay.position.y = 0.06;
      
      const g = new THREE.Group();
      g.add(pMesh, overlay);
      return g;
    }

    /* ── Precise Isometric House Architecture ─────────────────── */
    const house = new THREE.Group();
    const f0 = new THREE.Group();   // Ground Floor & Carport
    const f1 = new THREE.Group();   // Upper Floor & Roof

    // ── GROUND FLOOR (Y: 0 to 4.5) ──
    const f0Main = createBlock(12, 4.5, 8);
    f0Main.position.set(0, 2.25, 0);
    
    // Windows on Left face (X = -6)
    const w0L1 = createWindow(0.1, 3, 0.6); w0L1.position.set(-6.05, 2.25, -2);
    const w0L2 = createWindow(0.1, 3, 0.6); w0L2.position.set(-6.05, 2.25, 0);
    const w0L3 = createWindow(0.1, 3, 0.6); w0L3.position.set(-6.05, 2.25, 2);
    
    // Windows on Front face (Z = 4)
    const w0F1 = createWindow(0.6, 3, 0.1); w0F1.position.set(-4, 2.25, 4.05);
    const w0F2 = createWindow(0.6, 3, 0.1); w0F2.position.set(-2, 2.25, 4.05);

    // Carport/Extension (Z: 4 to 10, X: 0 to 6)
    const carportRoof = createBlock(6, 0.8, 6);
    carportRoof.position.set(3, 4.1, 7);
    
    const carportWall = createBlock(0.8, 4.5, 6);
    carportWall.position.set(5.6, 2.25, 7);
    
    const carportPillar = createBlock(0.8, 4.5, 0.8);
    carportPillar.position.set(0.4, 2.25, 9.6);

    // Shield & Ring on Carport
    shieldGroup.position.set(3, 5.5, 7);
    const shieldRing = new THREE.Mesh(
      new THREE.RingGeometry(1.5, 1.8, 32),
      new THREE.MeshBasicMaterial({ color: colorWindow, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })
    );
    shieldRing.rotation.x = -Math.PI / 2;
    shieldRing.position.set(3, 4.55, 7);

    // Glowing Core inside
    const coreMat = new THREE.MeshStandardMaterial({ color: 0x2dd4bf, emissive: 0x2dd4bf, emissiveIntensity: 2.0, transparent: true, opacity: 0.9 });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 3.5, 32), coreMat);
    core.position.set(0, 2.25, 0);
    const coreLight = new THREE.PointLight(0x2dd4bf, 2, 20);
    coreLight.position.set(0, 2.25, 0);

    f0.add(f0Main, w0L1, w0L2, w0L3, w0F1, w0F2, carportRoof, carportWall, carportPillar, shieldGroup, shieldRing, core, coreLight);

    // ── UPPER FLOOR (Y: 4.5 to 8.0) ──
    const f1Main = createBlock(12, 3.5, 8);
    f1Main.position.set(0, 6.25, 0);

    // Windows on Left face
    const w1L1 = createWindow(0.1, 1.8, 5); w1L1.position.set(-6.05, 6.25, 0);

    // Windows on Front face
    const w1F1 = createWindow(3, 1.8, 0.1); w1F1.position.set(-3, 6.25, 4.05);
    const w1F2 = createWindow(3, 1.8, 0.1); w1F2.position.set(1.5, 6.25, 4.05);

    // Roof Parapet
    const p1 = createBlock(12, 0.4, 0.4); p1.position.set(0, 8.2, 3.8);
    const p2 = createBlock(12, 0.4, 0.4); p2.position.set(0, 8.2, -3.8);
    const p3 = createBlock(0.4, 0.4, 7.2); p3.position.set(5.8, 8.2, 0);
    const p4 = createBlock(0.4, 0.4, 7.2); p4.position.set(-5.8, 8.2, 0);

    // Solar Panels
    const panel1 = createSolarPanel();
    panel1.position.set(-2, 8.5, -1.5);
    panel1.rotation.x = Math.PI / 6;
    
    const panel2 = createSolarPanel();
    panel2.position.set(-2, 8.5, 1.5);
    panel2.rotation.x = Math.PI / 6;

    // Satellite Dish
    const dishBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 1.5), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    dishBase.position.set(3, 8.75, 1);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(1.2, 16, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf1f5f9, side: THREE.DoubleSide }));
    dish.position.set(3, 9.5, 1);
    dish.rotation.x = Math.PI / 6;
    dish.rotation.y = -Math.PI / 4;

    // Antenna
    const antPole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4), new THREE.MeshStandardMaterial({ color: 0xf1f5f9 }));
    antPole.position.set(4.5, 10, -2);
    const antBox = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.2, 0.4), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaaaaaa }));
    antBox.position.set(4.5, 10.5, -2);

    f1.add(f1Main, w1L1, w1F1, w1F2, p1, p2, p3, p4, panel1, panel2, dishBase, dish, antPole, antBox);

    // Data Pillar
    const columnGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
    const columnMat = new THREE.MeshBasicMaterial({ color: colorEdge, transparent: true, opacity: 0, blending: THREE.AdditiveBlending });
    const lightColumn = new THREE.Mesh(columnGeo, columnMat);
    
    house.add(f0, f1, lightColumn);
    // Align house to the base
    house.position.y = -2;
    S.add(house);

    /* ── Hotspot Anchor ───────────────────────────────────────── */
    const anchorCallout = new THREE.Object3D();
    anchorCallout.position.set(0, 9.0, 0); // Just above roof
    f1.add(anchorCallout);

    /* ── Environment ──────────────────────────────────────────── */
    const gGrid = new THREE.GridHelper(200, 100, 0x38bdf8, 0x1e3a8a);
    gGrid.position.y = -0.1;
    gGrid.material.transparent = true;
    gGrid.material.opacity = 0.25;
    S.add(gGrid);

    // Base glowing ring
    const baseRingGeo = new THREE.RingGeometry(12, 12.5, 64);
    const baseRingMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.rotation.x = -Math.PI / 2;
    baseRing.position.y = -1.9; // Just above house base
    S.add(baseRing);
    
    // PCB Lines on the ground
    const pcbGroup = new THREE.Group();
    const pcbMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.PI / 8);
      const points = [];
      points.push(new THREE.Vector3(Math.cos(angle) * 12.5, 0, Math.sin(angle) * 12.5));
      points.push(new THREE.Vector3(Math.cos(angle) * 17, 0, Math.sin(angle) * 17));
      points.push(new THREE.Vector3(Math.cos(angle + 0.15) * 22, 0, Math.sin(angle + 0.15) * 22));
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(lineGeo, pcbMat);
      pcbGroup.add(line);
      
      const nodeGeo = new THREE.CircleGeometry(0.5, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.rotation.x = -Math.PI / 2;
      node.position.set(Math.cos(angle + 0.15) * 22, 0, Math.sin(angle + 0.15) * 22);
      pcbGroup.add(node);
    }
    pcbGroup.position.y = -1.9;
    S.add(pcbGroup);

    // Data Particles
    const pCount = 350;
    const pArr = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pArr[i * 3] = (Math.random() - 0.5) * 80;
      pArr[i * 3 + 1] = Math.random() * 40;
      pArr[i * 3 + 2] = (Math.random() - 0.5) * 80;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x38bdf8, size: 0.25, transparent: true, opacity: 0.6,
      blending: THREE.AdditiveBlending, depthWrite: false,
    }));
    S.add(particles);

    /* ── Interaction & Camera Controls ────────────────────────── */
    let isExploded = false, explodeFactor = 0;
    let isDragging = false, pointerDown = false;
    let pX = 0, pY = 0;

    let targetRY = -Math.PI / 4, targetRX = Math.atan(1 / Math.sqrt(2)); // True Isometric angle
    let targetZoom = container.clientWidth < 768 ? 0.6 : 0.8;
    
    let currentRY = targetRY, currentRX = targetRX, currentZoom = targetZoom;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    const el = R.domElement;
    const isAuthCardEvent = (event) => event.target?.closest?.('[data-auth-card="true"]');

    const triggerInteraction = () => {
      onInteractRef.current?.();
      resetIdle();
    };

    const onPointerDown = (e) => {
      if (isAuthCardEvent(e)) return;
      triggerInteraction();
      pointerDown = true; isDragging = false;
      pX = e.clientX; pY = e.clientY;
      try { e.target?.setPointerCapture?.(e.pointerId); } catch {}
    };
    const onPointerMove = (e) => {
      if (pointerDown) {
        triggerInteraction();
        const dx = e.clientX - pX, dy = e.clientY - pY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging = true;
        targetRY -= dx * 0.005;
        targetRX = Math.max(0.05, Math.min(1.4, targetRX + dy * 0.005));
        pX = e.clientX; pY = e.clientY;
      } else {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, cam);
        document.body.style.cursor = isAuthCardEvent(e)
          ? ''
          : raycaster.intersectObject(house, true).length > 0 ? 'pointer' : 'grab';
      }
    };
    const onPointerUp = (e) => {
      if (!pointerDown) return;
      pointerDown = false;
      try { e.target?.releasePointerCapture?.(e.pointerId); } catch {}
      if (!isDragging) {
        const rect = el.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, cam);
        if (raycaster.intersectObject(house, true).length > 0) {
          triggerInteraction();
          isExploded = !isExploded;
        }
      }
      isDragging = false;
    };
    const onWheel = (e) => {
      if (isAuthCardEvent(e)) return;
      triggerInteraction();
      targetZoom = Math.max(0.3, Math.min(2.0, targetZoom - e.deltaY * 0.001));
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel, { passive: true });

    // Touch
    let initialPinch = null;
    const onTouchStart = (e) => {
      if (isAuthCardEvent(e)) return;
      triggerInteraction();
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinch = Math.sqrt(dx * dx + dy * dy);
      }
    };
    const onTouchMove = (e) => {
      if (isAuthCardEvent(e)) return;
      if (e.touches.length === 2 && initialPinch) {
        triggerInteraction();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const cur = Math.sqrt(dx * dx + dy * dy);
        targetZoom = Math.max(0.3, Math.min(2.0, targetZoom + (cur - initialPinch) * 0.005));
        initialPinch = cur;
      }
    };
    const onTouchEnd = (e) => { if (e.touches.length < 2) initialPinch = null; };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    /* ── Animation & UI Update ────────────────────────────────── */
    let rafId;
    const clock = new THREE.Clock();

    function updateHotspot(anchor, elementId) {
      const elHtml = document.getElementById(elementId);
      if (!elHtml) return;
      const vector = new THREE.Vector3();
      anchor.updateMatrixWorld();
      vector.setFromMatrixPosition(anchor.matrixWorld);
      vector.project(cam);
      
      if (vector.z > 1) {
        elHtml.style.display = 'none';
        return;
      }
      elHtml.style.display = 'flex';
      
      const widthHalf = 0.5 * container.clientWidth;
      const heightHalf = 0.5 * container.clientHeight;
      const x = (vector.x * widthHalf) + widthHalf;
      const y = -(vector.y * heightHalf) + heightHalf;
      
      elHtml.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`;
    }

    function tick() {
      rafId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (!isExploded && !pointerDown) targetRY += 0.0015;

      currentRY += (targetRY - currentRY) * 0.08;
      currentRX += (targetRX - currentRX) * 0.08;
      currentZoom += (targetZoom - currentZoom) * 0.08;

      cam.zoom = currentZoom;
      cam.updateProjectionMatrix();

      // For orthographic, distance doesn't affect size, just clipping planes.
      const dist = 100; 
      cam.position.x = Math.sin(currentRY) * Math.cos(currentRX) * dist;
      cam.position.y = Math.sin(currentRX) * dist;
      cam.position.z = Math.cos(currentRY) * Math.cos(currentRX) * dist;
      
      // Look at center (viewport offset handles the visual shift)
      cam.lookAt(0, 6, 0);

      // PERFECT Separation Explode Animation
      const target = isExploded ? 1 : 0;
      explodeFactor += (target - explodeFactor) * 0.08;
      
      f1.position.y = explodeFactor * 10.0; // Space out upper floor
      
      // Stretch light column perfectly between floors
      lightColumn.scale.y = explodeFactor * 10.0; // stretch
      lightColumn.position.y = 4.5 + (explodeFactor * 10.0) / 2; // center point
      lightColumn.material.opacity = explodeFactor * 0.8;

      // Inner Core Animations
      coreMat.emissiveIntensity = 1.5 + Math.sin(t * 4) * 0.5;
      coreLight.intensity = 2 + Math.sin(t * 4);
      
      // Shield Animation
      shieldGroup.position.y = 5.5 + Math.sin(t * 2) * 0.3;
      shieldGroup.rotation.y = Math.sin(t) * 0.2;
      shieldRing.scale.setScalar(1.0 + Math.sin(t * 4) * 0.05);

      // Particles
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pCount; i++) {
        pos[i * 3 + 1] += 0.03;
        if (pos[i * 3 + 1] > 40) pos[i * 3 + 1] = 0;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      R.render(S, cam);
      updateHotspot(anchorCallout, 'hotspot-callout');
    }
    tick();

    /* ── Resize ───────────────────────────────────────────────── */
    function onResize() {
      updateCameraOffset();
      R.setSize(container.clientWidth, container.clientHeight);
    }
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    /* ── Cleanup ──────────────────────────────────────────────── */
    return () => {
      cancelAnimationFrame(rafId);
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      document.body.style.cursor = '';
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      ro.disconnect();
      S.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      R.dispose();
      if (container.contains(R.domElement)) container.removeChild(R.domElement);
    };
  }, []);

  return (
    <>
      <div
        ref={mountRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ background: 'radial-gradient(circle at center, #1e1b4b 0%, #020617 100%)' }}
      />
      
      {/* 3D Space Overlay Hotspot */}
      <div 
        id="hotspots-container" 
        className={`absolute inset-0 pointer-events-none z-10 transition-all duration-700 ${isIdle ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      >
        <div id="hotspot-callout" className="absolute top-0 left-0 flex flex-col items-center will-change-transform pb-2">
          
          {/* The Callout Pill */}
          <div className="flex items-center gap-2 bg-[#020617]/90 px-4 py-2 rounded-full border border-[#38bdf8]/60 shadow-[0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-md animate-bounce-slow">
            <span className="material-symbols-outlined text-[14px] text-[#38bdf8]">touch_app</span>
            <span className="text-[#38bdf8] text-[9px] uppercase font-bold tracking-[0.2em] whitespace-nowrap">
              CLICK NHÀ ĐỂ TÁCH LỚP / KÉO ĐỂ XOAY
            </span>
          </div>

          {/* The Vertical Line */}
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#38bdf8]/80 to-transparent shadow-[0_0_8px_rgba(56,189,248,0.8)]" />

          {/* The Target Dot anchored to the roof */}
          <div className="w-4 h-4 rounded-full border border-[#38bdf8]/80 flex items-center justify-center -mt-2 shadow-[0_0_15px_rgba(56,189,248,0.5)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8] animate-pulse" />
          </div>

        </div>
      </div>

      <style>{`
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </>
  );
};

export default House3D;
