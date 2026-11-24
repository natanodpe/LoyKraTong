import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  createKrathongMesh,
  createSkyLanterns,
  createTempleSkyline
} from '../utils/threeModels';

export default function River3DCanvas({
  krathongs = [],
  onSelectKrathong,
  focusKrathongId = null,
  graphicsQuality = 'high'
}) {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const krathongMeshesRef = useRef(new Map());
  const lanternsRef = useRef(null);
  const waterMeshRef = useRef(null);
  const reqIdRef = useRef(null);

  // Target camera positions for smooth animations
  const cameraTargetPos = useRef(new THREE.Vector3(0, 4.5, 9));
  const cameraLookAtTarget = useRef(new THREE.Vector3(0, 0.5, -4));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060c18); // Deep midnight blue
    scene.fog = new THREE.FogExp2(0x071120, 0.018);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(0, 4.5, 9);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: graphicsQuality !== 'low',
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(
      graphicsQuality === 'high' ? Math.min(window.devicePixelRatio, 2) : 1
    );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x182a4d, 1.4);
    scene.add(ambientLight);

    // Moonlight
    const moonLight = new THREE.DirectionalLight(0xa5c4f5, 1.2);
    moonLight.position.set(-20, 30, -10);
    scene.add(moonLight);

    // Golden warm horizon river glow
    const warmRiverLight = new THREE.PointLight(0xf59e0b, 1.0, 70, 1.5);
    warmRiverLight.position.set(0, 2, -25);
    scene.add(warmRiverLight);

    // 5. Twinkling Starfield in night sky
    const starsCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160;
      starPos[i + 1] = 10 + Math.random() * 50;
      starPos[i + 2] = -20 - Math.random() * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.28,
      transparent: true,
      opacity: 0.85
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 6. River Water Surface
    const waterGeo = new THREE.PlaneGeometry(160, 160, 48, 48);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x081528,
      roughness: 0.18,
      metalness: 0.75,
      flatShading: false
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0;
    scene.add(water);
    waterMeshRef.current = water;

    // 7. Temple Skyline (Wat Arun style spires on far bank)
    const templeSkyline = createTempleSkyline();
    scene.add(templeSkyline);

    // 8. Floating Sky Lanterns (โคมลอย)
    const lanterns = createSkyLanterns(42);
    scene.add(lanterns);
    lanternsRef.current = lanterns;

    // 9. Interactive Drag Orbit / Pan Controls
    let isMouseDown = false;
    let prevMousePos = { x: 0, y: 0 };
    let spherical = { radius: 10, theta: 0, phi: Math.PI / 3.8 };

    const onPointerDown = (e) => {
      isMouseDown = true;
      prevMousePos = {
        x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
        y: e.clientY || (e.touches && e.touches[0].clientY) || 0
      };
    };

    const onPointerMove = (e) => {
      if (!isMouseDown) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
      const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
      const deltaX = clientX - prevMousePos.x;
      const deltaY = clientY - prevMousePos.y;

      spherical.theta -= deltaX * 0.003;
      // Clamp phi to prevent going below water or flipping
      spherical.phi = Math.max(0.4, Math.min(Math.PI / 2.2, spherical.phi - deltaY * 0.002));

      prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius = Math.max(4, Math.min(24, spherical.radius + e.deltaY * 0.01));
    };

    // 10. Raycasting Click/Tap on Krathong
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const handleClick = (e) => {
      if (Math.abs(e.clientX - prevMousePos.x) > 5 || Math.abs(e.clientY - prevMousePos.y) > 5) {
        return; // was dragging
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (let hit of intersects) {
        let curr = hit.object;
        while (curr && curr.parent) {
          if (curr.userData && curr.userData.krathongId) {
            const foundId = curr.userData.krathongId;
            const clickedItem = krathongs.find((k) => k.krathong_id === foundId);
            if (clickedItem && onSelectKrathong) {
              onSelectKrathong(clickedItem);
            }
            return;
          }
          curr = curr.parent;
        }
      }
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('click', handleClick);

    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // 11. Main Render Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Camera position interpolation based on spherical orbit
      if (isMouseDown) {
        cameraTargetPos.current.x = cameraLookAtTarget.current.x + spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);
        cameraTargetPos.current.y = cameraLookAtTarget.current.y + spherical.radius * Math.cos(spherical.phi);
        cameraTargetPos.current.z = cameraLookAtTarget.current.z + spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);
      }

      camera.position.lerp(cameraTargetPos.current, 0.05);
      camera.lookAt(cameraLookAtTarget.current);

      // Animate Water ripples (gentle wave sinusoidal vertex displacement)
      const positions = waterGeo.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const u = positions.getX(i);
        const v = positions.getY(i);
        const wave = Math.sin(u * 0.15 + elapsedTime * 1.2) * 0.08 +
                     Math.cos(v * 0.2 + elapsedTime * 1.5) * 0.06;
        positions.setZ(i, wave);
      }
      positions.needsUpdate = true;
      waterGeo.computeVertexNormals();

      // Animate Krathongs floating downstream + bobbing
      krathongMeshesRef.current.forEach((mesh, id) => {
        const seed = mesh.userData.bobSeed || 0;
        const bob = Math.sin(elapsedTime * 2 + seed) * 0.045;
        const tiltX = Math.cos(elapsedTime * 1.5 + seed) * 0.025;
        const tiltZ = Math.sin(elapsedTime * 1.8 + seed) * 0.02;

        mesh.position.y = bob;
        mesh.rotation.x = tiltX;
        mesh.rotation.z = tiltZ;

        // Drift slowly downstream (towards -Z / +X subtle river current)
        const speed = mesh.userData.speed || 0.015;
        mesh.position.z -= speed * 0.02;
        // subtle sway
        mesh.position.x += Math.sin(elapsedTime * 0.5 + seed) * 0.002;

        // Candle flame flicker
        if (mesh.userData.flame) {
          const flicker = 0.9 + Math.random() * 0.2;
          mesh.userData.flame.scale.set(flicker, flicker, flicker);
        }
        if (mesh.userData.candleLight) {
          mesh.userData.candleLight.intensity = 1.4 + Math.random() * 0.6;
        }
      });

      // Animate Sky Lanterns rising & swaying
      if (lanternsRef.current) {
        lanternsRef.current.children.forEach((lantern) => {
          lantern.position.y += lantern.userData.speedY;
          lantern.position.x += Math.sin(elapsedTime * lantern.userData.swaySpeed + lantern.userData.swaySeed) * 0.03;

          // Recycle lantern when too high
          if (lantern.position.y > 65) {
            lantern.position.y = 10;
            lantern.position.x = (Math.random() - 0.5) * 120;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('mousedown', onPointerDown);
      dom.removeEventListener('wheel', onWheel);
      dom.removeEventListener('click', handleClick);
      dom.removeEventListener('touchstart', onPointerDown);
      renderer.dispose();
    };
  }, [graphicsQuality]);

  // Sync Krathongs with 3D Meshes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentMap = krathongMeshesRef.current;
    const incomingIds = new Set(krathongs.map((k) => k.krathong_id));

    // Remove meshes no longer in list
    currentMap.forEach((mesh, id) => {
      if (!incomingIds.has(id)) {
        scene.remove(mesh);
        currentMap.delete(id);
      }
    });

    // Add or update meshes
    krathongs.forEach((k, index) => {
      if (!currentMap.has(k.krathong_id)) {
        const mesh = createKrathongMesh(
          k.krathong_model_type,
          k.color,
          k.scanned_texture,
          k.sender_name
        );
        mesh.userData.krathongId = k.krathong_id;
        mesh.userData.speed = k.speed || 0.02;

        const posX = k.position?.x ?? ((index % 6) - 2.5) * 2.5;
        const posY = 0;
        const posZ = k.position?.z ?? -4 - index * 3.5;

        mesh.position.set(posX, posY, posZ);
        scene.add(mesh);
        currentMap.set(k.krathong_id, mesh);
      }
    });
  }, [krathongs]);

  // Focus Camera to a specific Krathong when requested (e.g. from MyKrathongs or click)
  useEffect(() => {
    if (!focusKrathongId) return;
    const mesh = krathongMeshesRef.current.get(focusKrathongId);
    if (mesh) {
      cameraLookAtTarget.current.set(
        mesh.position.x,
        mesh.position.y + 0.3,
        mesh.position.z
      );
      cameraTargetPos.current.set(
        mesh.position.x,
        mesh.position.y + 2.5,
        mesh.position.z + 4.5
      );
    }
  }, [focusKrathongId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
}
