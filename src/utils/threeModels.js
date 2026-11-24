import * as THREE from 'three';

// Generates canvas texture for name label above krathong
export function createNameLabelTexture(name) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  // Background pill with soft blur border
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.beginPath();
  ctx.roundRect(10, 8, 236, 48, 24);
  ctx.fill();

  ctx.strokeStyle = 'rgba(253, 224, 71, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Thai text with golden drop shadow
  ctx.font = 'bold 24px "Noto Sans Thai", "Prompt", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(name.length > 14 ? name.substring(0, 14) + '...' : name, 128, 32);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Procedural Krathong Builder
export function createKrathongMesh(type = 'preset_a', colorHex = '#15803d', textureUrl = null, name = '') {
  const krathongGroup = new THREE.Group();
  krathongGroup.userData = { type, isKrathong: true };

  // 1. Base Trunk (Sliced Banana Tree Trunk / Circular Base)
  const baseRadius = 0.85;
  const baseHeight = 0.28;
  const baseGeo = new THREE.CylinderGeometry(baseRadius, baseRadius * 0.95, baseHeight, 24);
  const baseMat = new THREE.MeshStandardMaterial({
    color: type === 'preset_c' ? 0x4a2e18 : 0x1e3a1e, // coconut husk or banana trunk
    roughness: 0.8,
    metalness: 0.1
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = baseHeight / 2;
  baseMesh.receiveShadow = true;
  krathongGroup.add(baseMesh);

  // 2. Petals / Leaves per style
  const primaryColor = new THREE.Color(colorHex || '#15803d');

  if (textureUrl) {
    // Custom Scanned Image Mode: Fallback photogrammetry disc + outer leaves
    const loader = new THREE.TextureLoader();
    loader.load(textureUrl, (tex) => {
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      const scanGeo = new THREE.CylinderGeometry(baseRadius * 0.9, baseRadius * 0.9, 0.05, 32);
      const scanMat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.4
      });
      const scanMesh = new THREE.Mesh(scanGeo, scanMat);
      scanMesh.position.y = baseHeight + 0.03;
      krathongGroup.add(scanMesh);
    });
  }

  if (type === 'preset_a') {
    // Classic Banana Leaf folded petals (2 layers of triangular banana folds)
    const petalCount = 14;
    const leafGeo = new THREE.ConeGeometry(0.24, 0.65, 4);
    leafGeo.scale(1, 1, 0.35); // flatten into leaf shape
    const leafMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.6,
      metalness: 0.1
    });

    for (let i = 0; i < petalCount; i++) {
      const angle = (i / petalCount) * Math.PI * 2;
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.x = Math.cos(angle) * (baseRadius * 0.88);
      leaf.position.z = Math.sin(angle) * (baseRadius * 0.88);
      leaf.position.y = baseHeight + 0.15;
      leaf.rotation.y = -angle + Math.PI / 2;
      leaf.rotation.x = 0.45;
      krathongGroup.add(leaf);
    }

    // Inner Marigold Flowers (Golden spheres cluster)
    const flowerGeo = new THREE.DodecahedronGeometry(0.14, 1);
    const marigoldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
      emissive: 0xd97706,
      emissiveIntensity: 0.25
    });
    for (let i = 0; i < 9; i++) {
      const flower = new THREE.Mesh(flowerGeo, marigoldMat);
      const r = 0.42 * Math.sqrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      flower.position.set(r * Math.cos(theta), baseHeight + 0.12, r * Math.sin(theta));
      krathongGroup.add(flower);
    }
  } else if (type === 'preset_b') {
    // Lotus Petal Blossom (3 layers of elegant curved lotus petals)
    const layers = [
      { count: 12, radius: baseRadius * 0.95, y: baseHeight + 0.12, scale: 1.1, rot: 0.55 },
      { count: 10, radius: baseRadius * 0.72, y: baseHeight + 0.20, scale: 0.95, rot: 0.4 },
      { count: 8, radius: baseRadius * 0.48, y: baseHeight + 0.26, scale: 0.78, rot: 0.25 }
    ];

    const petalGeo = new THREE.ConeGeometry(0.26, 0.75, 5);
    petalGeo.scale(1.2, 1, 0.4);
    const lotusMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.4,
      metalness: 0.15
    });

    layers.forEach((layer, layerIdx) => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + (layerIdx * 0.3);
        const petal = new THREE.Mesh(petalGeo, lotusMat);
        petal.scale.set(layer.scale, layer.scale, layer.scale);
        petal.position.x = Math.cos(angle) * layer.radius;
        petal.position.z = Math.sin(angle) * layer.radius;
        petal.position.y = layer.y;
        petal.rotation.y = -angle + Math.PI / 2;
        petal.rotation.x = layer.rot;
        krathongGroup.add(petal);
      }
    });

    // Lotus center seed head
    const centerGeo = new THREE.CylinderGeometry(0.28, 0.2, 0.15, 16);
    const centerMat = new THREE.MeshStandardMaterial({ color: 0x84cc16, roughness: 0.6 });
    const centerMesh = new THREE.Mesh(centerGeo, centerMat);
    centerMesh.position.y = baseHeight + 0.12;
    krathongGroup.add(centerMesh);
  } else if (type === 'preset_c') {
    // Modern Eco Coconut Husk with Pastel Orchids
    const huskGeo = new THREE.SphereGeometry(baseRadius * 0.95, 24, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);
    const huskMat = new THREE.MeshStandardMaterial({
      color: 0x5c3818,
      roughness: 0.9,
      side: THREE.DoubleSide
    });
    const huskMesh = new THREE.Mesh(huskGeo, huskMat);
    huskMesh.rotation.x = Math.PI;
    huskMesh.position.y = baseHeight + 0.35;
    krathongGroup.add(huskMesh);

    // Orchid flowers
    const orchidGeo = new THREE.TorusGeometry(0.12, 0.05, 8, 16);
    const orchidMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.3,
      emissive: 0xec4899,
      emissiveIntensity: 0.2
    });
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const orchid = new THREE.Mesh(orchidGeo, orchidMat);
      orchid.position.x = Math.cos(angle) * (baseRadius * 0.65);
      orchid.position.z = Math.sin(angle) * (baseRadius * 0.65);
      orchid.position.y = baseHeight + 0.18;
      orchid.rotation.x = Math.PI / 2;
      krathongGroup.add(orchid);
    }
  } else {
    // Style D: Golden Minimalist Candle Lantern Boat
    const lanternGeo = new THREE.CylinderGeometry(baseRadius * 0.8, baseRadius * 0.6, 0.45, 8, 1, true);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.7,
      roughness: 0.25,
      side: THREE.DoubleSide,
      emissive: 0xd97706,
      emissiveIntensity: 0.35
    });
    const lanternMesh = new THREE.Mesh(lanternGeo, lanternMat);
    lanternMesh.position.y = baseHeight + 0.22;
    krathongGroup.add(lanternMesh);

    // Decorative golden lotus rim
    const rimGeo = new THREE.TorusGeometry(baseRadius * 0.82, 0.04, 8, 24);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xffe066, metalness: 0.9, roughness: 0.1 });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.y = baseHeight + 0.45;
    krathongGroup.add(rimMesh);
  }

  // 3. Candle (Centerpiece with warm flame & PointLight)
  const candleHeight = 0.5;
  const candleGeo = new THREE.CylinderGeometry(0.065, 0.07, candleHeight, 16);
  const candleMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    roughness: 0.3
  });
  const candle = new THREE.Mesh(candleGeo, candleMat);
  candle.position.set(0, baseHeight + candleHeight / 2 + 0.05, 0);
  krathongGroup.add(candle);

  // Flame Mesh
  const flameGeo = new THREE.ConeGeometry(0.06, 0.18, 12);
  const flameMat = new THREE.MeshBasicMaterial({
    color: 0xffdd44
  });
  const flame = new THREE.Mesh(flameGeo, flameMat);
  flame.position.set(0, baseHeight + candleHeight + 0.12, 0);
  krathongGroup.add(flame);

  // Warm Candle Light
  const candleLight = new THREE.PointLight(0xffb020, 1.8, 6.5, 1.2);
  candleLight.position.set(0, baseHeight + candleHeight + 0.15, 0);
  krathongGroup.add(candleLight);

  // 4. Three Incense Sticks (ธูป 3 ดอก)
  const incenseMat = new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 });
  const tipMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });

  [-0.1, 0, 0.1].forEach((offset, idx) => {
    const stickGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.65, 6);
    const stick = new THREE.Mesh(stickGeo, incenseMat);
    stick.position.set(offset, baseHeight + 0.3, -0.15 - (idx === 1 ? 0.03 : 0));
    stick.rotation.x = -0.15 + (Math.random() - 0.5) * 0.05;
    stick.rotation.z = (offset) * 0.3;
    krathongGroup.add(stick);

    // Incense glowing red tip
    const tipGeo = new THREE.SphereGeometry(0.018, 6, 6);
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.set(stick.position.x + Math.sin(stick.rotation.z) * 0.32, baseHeight + 0.62, stick.position.z);
    krathongGroup.add(tip);
  });

  // 5. Name Label Sprite (Floating above the Krathong)
  if (name) {
    const labelTex = createNameLabelTexture(name);
    const spriteMat = new THREE.SpriteMaterial({
      map: labelTex,
      transparent: true,
      depthWrite: false
    });
    const labelSprite = new THREE.Sprite(spriteMat);
    labelSprite.scale.set(1.4, 0.35, 1);
    labelSprite.position.set(0, baseHeight + candleHeight + 0.55, 0);
    labelSprite.userData = { isLabel: true };
    krathongGroup.add(labelSprite);
  }

  // Animation references
  krathongGroup.userData.flame = flame;
  krathongGroup.userData.candleLight = candleLight;
  krathongGroup.userData.bobSeed = Math.random() * 100;

  return krathongGroup;
}

// Generates Floating Sky Lanterns (โคมลอย)
export function createSkyLanterns(count = 45) {
  const group = new THREE.Group();
  const lanternGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.75, 12, 1, true);
  const lanternMat = new THREE.MeshBasicMaterial({
    color: 0xffe6a3,
    side: THREE.DoubleSide
  });

  const glowGeo = new THREE.SphereGeometry(0.2, 8, 8);
  const glowMat = new THREE.MeshBasicMaterial({ color: 0xff9900 });

  for (let i = 0; i < count; i++) {
    const lantern = new THREE.Group();
    const mesh = new THREE.Mesh(lanternGeo, lanternMat);
    lantern.add(mesh);

    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.y = -0.2;
    lantern.add(glow);

    // Random sky placement
    lantern.position.set(
      (Math.random() - 0.5) * 120,
      12 + Math.random() * 35,
      -30 - Math.random() * 70
    );

    lantern.userData = {
      speedY: 0.02 + Math.random() * 0.03,
      swaySeed: Math.random() * 100,
      swaySpeed: 0.5 + Math.random() * 0.8
    };

    group.add(lantern);
  }

  return group;
}

// Generates Distant Thai Temple Skyline (วัดอรุณ / พระบรมมหาราชวัง silhouette with warm night lights)
export function createTempleSkyline() {
  const group = new THREE.Group();
  group.position.set(0, 0, -65);

  const silhouetteMat = new THREE.MeshStandardMaterial({
    color: 0x071120,
    roughness: 0.95
  });
  const goldSpireMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    emissive: 0xb45309,
    emissiveIntensity: 0.45,
    roughness: 0.3
  });

  // Central Prang (Wat Arun style main spire)
  const mainSpireGeo = new THREE.ConeGeometry(3.5, 24, 8);
  const mainSpire = new THREE.Mesh(mainSpireGeo, goldSpireMat);
  mainSpire.position.set(0, 12, 0);
  group.add(mainSpire);

  // Base platform
  const baseGeo = new THREE.BoxGeometry(22, 4, 10);
  const base = new THREE.Mesh(baseGeo, silhouetteMat);
  base.position.set(0, 2, 0);
  group.add(base);

  // Flanking small spires
  [-7, 7, -14, 14, -22, 22].forEach((x, idx) => {
    const height = 12 - Math.abs(x) * 0.25;
    const spireGeo = new THREE.ConeGeometry(1.8, height, 8);
    const spire = new THREE.Mesh(spireGeo, idx % 2 === 0 ? goldSpireMat : silhouetteMat);
    spire.position.set(x, height / 2 + 1, (Math.random() - 0.5) * 4);
    group.add(spire);
  });

  // Distant riverside trees silhouette
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x050d18 });
  for (let i = -60; i <= 60; i += 6) {
    if (Math.abs(i) < 25) continue;
    const treeGeo = new THREE.SphereGeometry(2.5 + Math.random() * 1.5, 6, 6);
    const tree = new THREE.Mesh(treeGeo, treeMat);
    tree.position.set(i + (Math.random() - 0.5) * 3, 2, (Math.random() - 0.5) * 5);
    group.add(tree);
  }

  // Riverside Warm Glowing Golden Lights along the bank
  for (let x = -50; x <= 50; x += 10) {
    const warmLight = new THREE.PointLight(0xffaa22, 1.2, 18, 1.8);
    warmLight.position.set(x, 1.2, 2);
    group.add(warmLight);
  }

  return group;
}
