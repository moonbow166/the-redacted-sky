"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type SkySceneProps = {
  active: boolean;
  stage: number;
  recordKinds: string[];
  featuredIndexes: number[];
  selected: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
};

type Artifact = THREE.Group & {
  userData: {
    baseY: number;
    phase: number;
    speed: number;
    index: number;
    home: THREE.Vector3;
    baseScale: number;
    kind: "video" | "image" | "document";
  };
};

type Morphology = THREE.Group & {
  userData: {
    home: THREE.Vector3;
    exit: THREE.Vector3;
    phase: number;
    introScale: number;
    fieldScale: number;
    aspectX: number;
  };
};

const featuredVideoTargets = new Map<number, THREE.Vector3>([
  [206, new THREE.Vector3(0.2, 2.65, 6.4)],
  [207, new THREE.Vector3(-4.6, 0.65, 4.2)],
  [215, new THREE.Vector3(4.8, 0.95, 3.8)],
]);

const livePreviewUrls = new Map<number, string>([
  [206, "https://d34w7g4gy10iej.cloudfront.net/video/2607/DOD_111830027/DOD_111830027.mp4"],
  [207, "https://d34w7g4gy10iej.cloudfront.net/video/2607/DOD_111830030/DOD_111830030.mp4"],
  [215, "https://d34w7g4gy10iej.cloudfront.net/video/2607/DOD_111830133/DOD_111830133.mp4"],
]);

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function makeHullTexture(kind: "color" | "roughness") {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const image = ctx.createImageData(size, size);
  const random = seededRandom(kind === "color" ? 1947 : 2004);
  for (let i = 0; i < image.data.length; i += 4) {
    const grain = Math.floor(random() * (kind === "color" ? 22 : 78));
    if (kind === "color") {
      image.data[i] = 58 + grain;
      image.data[i + 1] = 70 + grain;
      image.data[i + 2] = 68 + grain;
    } else {
      image.data[i] = 84 + grain;
      image.data[i + 1] = 84 + grain;
      image.data[i + 2] = 84 + grain;
    }
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  ctx.strokeStyle = kind === "color" ? "rgba(174,206,199,.16)" : "rgba(220,220,220,.28)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= size; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(size, y + 0.5);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.anisotropy = 8;
  return texture;
}

function makeEvidenceTexture(kind: "document" | "video" | "image", variant: number) {
  const width = kind === "document" ? 384 : 512;
  const height = kind === "document" ? 512 : kind === "video" ? 300 : 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = kind === "document" ? "rgba(205,214,206,.09)" : "rgba(80,112,108,.07)";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = variant % 3 === 0 ? "rgba(199,165,110,.55)" : "rgba(169,255,242,.38)";
  ctx.lineWidth = 2;
  ctx.strokeRect(4, 4, width - 8, height - 8);
  ctx.font = `${Math.max(11, width * 0.027)}px monospace`;
  ctx.fillStyle = "rgba(220,228,222,.7)";
  ctx.fillText(kind === "document" ? "DECLASSIFIED // UAP" : kind === "video" ? "IR SENSOR // RECORD" : "IMAGE EVIDENCE", 22, 38);

  if (kind === "video") {
    ctx.strokeStyle = "rgba(169,255,242,.48)";
    ctx.beginPath();
    ctx.moveTo(width / 2 - 34, height / 2);
    ctx.lineTo(width / 2 + 34, height / 2);
    ctx.moveTo(width / 2, height / 2 - 34);
    ctx.lineTo(width / 2, height / 2 + 34);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 46 + variant * 2, 0, Math.PI * 2);
    ctx.stroke();
    const gradient = ctx.createRadialGradient(width * 0.58, height * 0.44, 2, width * 0.58, height * 0.44, 54);
    gradient.addColorStop(0, "rgba(255,255,255,.9)");
    gradient.addColorStop(0.12, "rgba(169,255,242,.45)");
    gradient.addColorStop(1, "rgba(169,255,242,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (kind === "image") {
    const gradient = ctx.createRadialGradient(width * 0.52, height * 0.48, 6, width * 0.52, height * 0.48, 150);
    gradient.addColorStop(0, "rgba(235,245,240,.86)");
    gradient.addColorStop(0.08, "rgba(169,255,242,.4)");
    gradient.addColorStop(0.5, "rgba(169,255,242,.04)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(220,228,222,.24)";
    for (let ring = 1; ring < 4; ring += 1) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, ring * 58, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = "rgba(220,228,222,.24)";
    for (let row = 0; row < 15; row += 1) {
      const lineWidth = width * (0.42 + ((row * 17 + variant * 9) % 44) / 100);
      ctx.fillRect(22, 70 + row * 24, lineWidth, 3);
    }
    ctx.fillStyle = "rgba(0,0,0,.92)";
    ctx.fillRect(46 + variant * 7, 118 + variant * 14, width * 0.66, 17);
    ctx.fillRect(24, 286 - variant * 9, width * 0.46, 14);
    if (variant % 2 === 0) ctx.fillRect(126, 370, width * 0.52, 16);
    ctx.strokeStyle = "rgba(199,165,110,.5)";
    ctx.strokeRect(22, height - 64, 104, 31);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

export default function SkyScene({ active, stage, recordKinds, featuredIndexes, selected, onHover, onSelect }: SkySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const stageRef = useRef(stage);
  const selectedRef = useRef(selected);
  const selectRef = useRef(onSelect);
  const hoverRef = useRef(onHover);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    selectRef.current = onSelect;
    hoverRef.current = onHover;
  }, [onHover, onSelect]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const random = seededRandom(1969);
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020506, 0.028);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);
    camera.position.set(0, 0.4, 31);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0x020405, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional UAP evidence archive");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnvironment = new RoomEnvironment();
    const environmentTarget = pmrem.fromScene(roomEnvironment, 0.04);
    scene.environment = environmentTarget.texture;

    const field = new THREE.Group();
    field.rotation.x = -0.04;
    scene.add(field);

    const ambient = new THREE.HemisphereLight(0xc8d5d2, 0x030404, 0.38);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xd8e3e1, 4.8);
    keyLight.position.set(-7, 11, 15);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 55;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    const rimLight = new THREE.PointLight(0xc79f68, 5.2, 30, 1.7);
    rimLight.position.set(12, -6, 4);
    scene.add(rimLight);
    const coldFill = new THREE.PointLight(0x789892, 3.2, 34, 2);
    coldFill.position.set(2, 5, 19);
    scene.add(coldFill);

    const fleet = new THREE.Group();
    scene.add(fleet);
    const hullColorTexture = makeHullTexture("color");
    const hullRoughnessTexture = makeHullTexture("roughness");
    const morphologyMaterials: THREE.MeshPhysicalMaterial[] = [];
    const makeSkin = (tint = 0x61716f) => {
      const material = new THREE.MeshPhysicalMaterial({
        color: tint,
        map: hullColorTexture,
        roughnessMap: hullRoughnessTexture,
        bumpMap: hullRoughnessTexture,
        bumpScale: 0.012,
        metalness: 0.76,
        roughness: 0.36,
        clearcoat: 0.18,
        clearcoatRoughness: 0.32,
        iridescence: 0.035,
        iridescenceIOR: 1.34,
        emissive: 0x030706,
        emissiveIntensity: 0.08,
      });
      morphologyMaterials.push(material);
      return material;
    };
    const edgeMaterials: THREE.LineBasicMaterial[] = [];
    const addEdges = (mesh: THREE.Mesh, opacity = 0.7) => {
      const material = new THREE.LineBasicMaterial({
        color: 0xb9fff5,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      });
      edgeMaterials.push(material);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry), material);
      edges.scale.setScalar(1.012);
      edges.rotation.copy(mesh.rotation);
      edges.position.copy(mesh.position);
      mesh.parent?.add(edges);
    };
    const morphologies: Morphology[] = [];
    const registerMorphology = (
      model: THREE.Group,
      home: THREE.Vector3,
      exit: THREE.Vector3,
      phase: number,
      introScale: number,
      fieldScale = introScale * 0.72,
      aspectX = 1,
    ) => {
      const morphology = model as Morphology;
      morphology.position.copy(home);
      morphology.scale.set(introScale * aspectX, introScale, introScale);
      morphology.userData = { home, exit, phase, introScale, fieldScale, aspectX };
      morphologies.push(morphology);
      fleet.add(morphology);
      return morphology;
    };

    const glowMaterials: THREE.MeshBasicMaterial[] = [];
    const makeGlow = (color = 0xa9fff2, opacity = 0.72) => {
      const material = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      glowMaterials.push(material);
      return material;
    };

    const orb = new THREE.Group();
    const orbCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 4), makeSkin(0x405c59));
    orb.add(orbCore);
    addEdges(orbCore, 0.18);
    const orbEnergy = new THREE.Mesh(new THREE.IcosahedronGeometry(0.36, 2), makeGlow(0xc8fff8, 0.92));
    orb.add(orbEnergy);
    const orbShellMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x91bbb5,
      metalness: 0.08,
      roughness: 0.08,
      transmission: 0.72,
      thickness: 0.7,
      transparent: true,
      opacity: 0.28,
      clearcoat: 1,
    });
    morphologyMaterials.push(orbShellMaterial);
    orb.add(new THREE.Mesh(new THREE.SphereGeometry(0.88, 64, 48), orbShellMaterial));
    [0, Math.PI / 2].forEach((rotation) => {
      const meridian = new THREE.Mesh(new THREE.TorusGeometry(1.04, 0.009, 6, 128), makeGlow(0xa9fff2, 0.42));
      meridian.rotation.y = rotation;
      orb.add(meridian);
    });
    registerMorphology(orb, new THREE.Vector3(12.8, 4.8, 1), new THREE.Vector3(-6.7, 3.25, 5.5), 0.2, 0.28, 1.12);

    const ticTac = new THREE.Group();
    const ticMaterial = makeSkin(0x89918e);
    const ticBody = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.9, 64), ticMaterial);
    ticBody.rotation.z = Math.PI / 2;
    ticTac.add(ticBody);
    const ticEndA = new THREE.Mesh(new THREE.SphereGeometry(0.5, 48, 32), ticMaterial);
    const ticEndB = ticEndA.clone();
    ticEndA.position.x = -0.95;
    ticEndB.position.x = 0.95;
    ticTac.add(ticEndA, ticEndB);
    for (const x of [-0.72, 0.72]) {
      const seam = new THREE.Mesh(new THREE.TorusGeometry(0.505, 0.012, 8, 64), makeGlow(0x688f8a, 0.48));
      seam.rotation.y = Math.PI / 2;
      seam.position.x = x;
      ticTac.add(seam);
    }
    for (let i = 0; i < 4; i += 1) {
      const port = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.035, 0.018), makeGlow(0xc7a56e, 0.6));
      port.position.set(-0.3 + i * 0.2, -0.49, 0.08);
      ticTac.add(port);
    }
    registerMorphology(ticTac, new THREE.Vector3(11.5, -4.2, 3), new THREE.Vector3(6.4, 3.45, 4.2), 1.4, 0.34, 1.18);

    // Hero reconstruction: a broad, asymmetric black-manta form. It is intentionally
    // unlike a conventional saucer and reads as one massive continuous hull.
    const disk = new THREE.Group();
    const mantaShape = new THREE.Shape();
    mantaShape.moveTo(0.15, 2.7);
    mantaShape.bezierCurveTo(-0.8, 1.8, -3.25, 0.65, -4.15, -1.28);
    mantaShape.bezierCurveTo(-2.2, -0.85, -1.1, -1.35, 0, -2.15);
    mantaShape.bezierCurveTo(1.18, -1.32, 2.5, -0.72, 4.35, -1.08);
    mantaShape.bezierCurveTo(3.15, 0.72, 0.92, 1.75, 0.15, 2.7);
    mantaShape.closePath();

    const mantaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111817,
      map: hullColorTexture,
      roughnessMap: hullRoughnessTexture,
      bumpMap: hullRoughnessTexture,
      bumpScale: 0.016,
      metalness: 0.87,
      roughness: 0.31,
      clearcoat: 0.28,
      clearcoatRoughness: 0.42,
      iridescence: 0.07,
      iridescenceIOR: 1.4,
    });
    morphologyMaterials.push(mantaMaterial);
    const mantaBody = new THREE.Mesh(new THREE.ExtrudeGeometry(mantaShape, {
      depth: 0.38,
      bevelEnabled: true,
      bevelSize: 0.18,
      bevelThickness: 0.16,
      bevelSegments: 7,
      curveSegments: 32,
    }), mantaMaterial);
    mantaBody.geometry.center();
    disk.add(mantaBody);

    const undersideMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x050706,
      metalness: 0.72,
      roughness: 0.54,
      emissive: 0x060b0a,
      emissiveIntensity: 0.14,
    });
    morphologyMaterials.push(undersideMaterial);
    const centralLens = new THREE.Mesh(new THREE.SphereGeometry(1.05, 64, 32), undersideMaterial);
    centralLens.scale.set(1.42, 0.48, 0.22);
    centralLens.position.set(0.08, -0.15, 0.42);
    disk.add(centralLens);

    const spine = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 3.05, 12, 32), undersideMaterial);
    spine.rotation.z = -0.08;
    spine.position.set(0.06, 0.28, 0.47);
    spine.scale.x = 0.52;
    disk.add(spine);

    const panelMaterial = new THREE.LineBasicMaterial({
      color: 0x6c8883,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending,
    });
    edgeMaterials.push(panelMaterial);
    [-1, 1].forEach((direction) => {
      for (let i = 0; i < 4; i += 1) {
        const points = [
          new THREE.Vector3(direction * (0.62 + i * 0.52), 0.8 - i * 0.2, 0.48),
          new THREE.Vector3(direction * (1.3 + i * 0.55), -0.65 - i * 0.07, 0.48),
        ];
        disk.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), panelMaterial));
      }
    });

    [[0.05, 1.36, 0xc7a56e], [-2.58, -0.72, 0x91fff3], [2.7, -0.58, 0x91fff3]].forEach(([x, y, color]) => {
      const well = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.1, 40), undersideMaterial);
      well.rotation.x = Math.PI / 2;
      well.position.set(x, y, 0.54);
      disk.add(well);
      const light = new THREE.Mesh(new THREE.CircleGeometry(0.145, 40), makeGlow(color, color === 0xc7a56e ? 0.58 : 0.4));
      light.position.set(x, y, 0.6);
      disk.add(light);
    });

    const scar = new THREE.Mesh(
      new THREE.TorusGeometry(1.95, 0.018, 6, 90, Math.PI * 0.7),
      new THREE.MeshPhysicalMaterial({ color: 0x6a5540, metalness: 0.64, roughness: 0.62 }),
    );
    scar.scale.y = 0.54;
    scar.position.set(-0.36, -0.08, 0.51);
    scar.rotation.z = 2.72;
    disk.add(scar);
    registerMorphology(disk, new THREE.Vector3(7.7, 0.05, 9.6), new THREE.Vector3(-12, 6.5, -10), 2.2, 1.72, 0.42, 1.12);

    const triangle = new THREE.Group();
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 1.35);
    triangleShape.lineTo(-1.22, -0.86);
    triangleShape.lineTo(1.22, -0.86);
    triangleShape.closePath();
    const triangleBody = new THREE.Mesh(
      new THREE.ExtrudeGeometry(triangleShape, { depth: 0.16, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.06, bevelSegments: 4 }),
      makeSkin(0x182826),
    );
    triangleBody.geometry.center();
    triangle.add(triangleBody);
    addEdges(triangleBody, 0.5);
    const triangleInner = new THREE.Mesh(new THREE.RingGeometry(0.36, 0.47, 3), makeGlow(0x6d9f99, 0.38));
    triangleInner.rotation.z = Math.PI / 2;
    triangleInner.position.z = 0.16;
    triangle.add(triangleInner);
    [[0, 0.9], [-0.78, -0.52], [0.78, -0.52]].forEach(([x, y], i) => {
      const light = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.035, 24), makeGlow(i === 0 ? 0xc7a56e : 0xa9fff2, 0.92));
      light.rotation.x = Math.PI / 2;
      light.position.set(x, y, 0.17);
      triangle.add(light);
    });
    registerMorphology(triangle, new THREE.Vector3(13, -2, 0), new THREE.Vector3(-5.9, -3.1, 3.1), 3.1, 0.32, 1.2);

    const cylinder = new THREE.Group();
    const cylinderAssembly = new THREE.Group();
    cylinderAssembly.rotation.z = Math.PI / 2.7;
    cylinder.add(cylinderAssembly);
    const cylinderMaterial = makeSkin(0x626b68);
    const cylinderBody = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.3, 64), cylinderMaterial);
    cylinderAssembly.add(cylinderBody);
    for (const y of [-1.08, -0.62, 0, 0.62, 1.08]) {
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.39, 0.017, 8, 64), makeGlow(y === 0 ? 0xc7a56e : 0x7aa8a2, 0.48));
      band.rotation.x = Math.PI / 2;
      band.position.y = y;
      cylinderAssembly.add(band);
    }
    const capA = new THREE.Mesh(new THREE.SphereGeometry(0.38, 40, 24), cylinderMaterial);
    const capB = capA.clone();
    capA.scale.y = 0.48;
    capB.scale.y = 0.48;
    capA.position.y = -1.17;
    capB.position.y = 1.17;
    cylinderAssembly.add(capA, capB);
    registerMorphology(cylinder, new THREE.Vector3(5.5, -5.5, 0), new THREE.Vector3(-1.8, 4.4, 0.3), 4.2, 0.3, 1.02);

    const boomerang = new THREE.Group();
    const boomShape = new THREE.Shape();
    boomShape.moveTo(-2.05, 0.68);
    boomShape.lineTo(-0.24, -0.18);
    boomShape.lineTo(0, -0.58);
    boomShape.lineTo(0.24, -0.18);
    boomShape.lineTo(2.05, 0.68);
    boomShape.lineTo(1.9, 0.02);
    boomShape.lineTo(0.38, -0.84);
    boomShape.lineTo(0, -0.98);
    boomShape.lineTo(-0.38, -0.84);
    boomShape.lineTo(-1.9, 0.02);
    boomShape.closePath();
    const boomBody = new THREE.Mesh(
      new THREE.ExtrudeGeometry(boomShape, { depth: 0.14, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.05, bevelSegments: 3 }),
      makeSkin(0x203a37),
    );
    boomBody.geometry.center();
    boomerang.add(boomBody);
    addEdges(boomBody, 0.45);
    for (const x of [-1.45, -0.78, 0, 0.78, 1.45]) {
      const node = new THREE.Mesh(new THREE.SphereGeometry(0.065, 18, 12), makeGlow(x === 0 ? 0xc7a56e : 0x9fffee, 0.86));
      node.position.set(x, 0.05 + Math.abs(x) * 0.25, 0.18);
      boomerang.add(node);
    }
    registerMorphology(boomerang, new THREE.Vector3(10, 5, -2), new THREE.Vector3(4.2, -4.15, 2.2), 5.1, 0.26, 1.08);

    fleet.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    const textures = {
      documents: Array.from({ length: 5 }, (_, index) => makeEvidenceTexture("document", index)),
      videos: Array.from({ length: 4 }, (_, index) => makeEvidenceTexture("video", index)),
      images: Array.from({ length: 3 }, (_, index) => makeEvidenceTexture("image", index)),
    };
    const materials: THREE.MeshBasicMaterial[] = [];
    const buildMaterials = (source: THREE.Texture[], opacity: number) =>
      source.map((map) => {
        const material = new THREE.MeshBasicMaterial({
          map,
          transparent: true,
          opacity,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });
        materials.push(material);
        return material;
      });
    const documentMaterials = buildMaterials(textures.documents, 0.58);
    const videoMaterials = buildMaterials(textures.videos, 0.72);
    const imageMaterials = buildMaterials(textures.images, 0.64);

    const liveVideos: HTMLVideoElement[] = [];
    const liveTextures: THREE.VideoTexture[] = [];
    const liveMaterials = new Map<number, THREE.MeshBasicMaterial>();
    livePreviewUrls.forEach((src, index) => {
      const video = document.createElement("video");
      video.src = src;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.preload = "metadata";
      const texture = new THREE.VideoTexture(video);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      liveVideos.push(video);
      liveTextures.push(texture);
      liveMaterials.set(index, material);
    });

    const documentGeometry = new THREE.PlaneGeometry(0.78, 1.04);
    const videoGeometry = new THREE.PlaneGeometry(1.16, 0.68);
    const imageGeometry = new THREE.PlaneGeometry(0.86, 0.86);
    const hitTargets: THREE.Mesh[] = [];
    const artifacts: Artifact[] = [];
    const positions: THREE.Vector3[] = [];
    const important = new Set(featuredIndexes);

    for (let i = 0; i < recordKinds.length; i += 1) {
      const radius = 4.7 + Math.pow(random(), 0.62) * 15.8;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const position = new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta) * 1.14,
        radius * Math.cos(phi) * (0.58 + random() * 0.26),
        radius * Math.sin(phi) * Math.sin(theta) * 0.78,
      );
      positions.push(position);

      const artifact = new THREE.Group() as Artifact;
      artifact.position.copy(position);
      artifact.rotation.set((random() - 0.5) * 0.75, (random() - 0.5) * 1.15, (random() - 0.5) * 0.42);
      artifact.userData = {
        baseY: position.y,
        phase: random() * Math.PI * 2,
        speed: 0.28 + random() * 0.38,
        index: i,
        home: position.clone(),
        baseScale: 1,
        kind: "document",
      };

      const sourceKind = recordKinds[i];
      const kind = sourceKind === "video" ? "video" : sourceKind === "image" ? "image" : "document";
      artifact.userData.kind = kind;
      const geometry = kind === "document" ? documentGeometry : kind === "video" ? videoGeometry : imageGeometry;
      const materialSet = kind === "document" ? documentMaterials : kind === "video" ? videoMaterials : imageMaterials;
      const mesh = new THREE.Mesh(geometry, liveMaterials.get(i) ?? materialSet[i % materialSet.length]);
      mesh.userData.index = i;
      artifact.add(mesh);
      hitTargets.push(mesh);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({
          color: important.has(i) ? 0xa9fff2 : kind === "document" ? 0x8b7960 : 0x729b95,
          transparent: true,
          opacity: important.has(i) ? 0.72 : 0.17,
          blending: THREE.AdditiveBlending,
        }),
      );
      edge.userData.role = "artifact-edge";
      edge.userData.baseOpacity = important.has(i) ? 0.72 : 0.17;
      edge.scale.setScalar(1.03);
      artifact.add(edge);

      if (important.has(i)) {
        artifact.userData.baseScale = 1.12;
        artifact.scale.setScalar(artifact.userData.baseScale);
        const beacon = new THREE.Mesh(
          new THREE.TorusGeometry(0.72, 0.008, 5, 72),
          new THREE.MeshBasicMaterial({ color: 0xa9fff2, transparent: true, opacity: 0.55 }),
        );
        beacon.userData.role = "beacon";
        beacon.userData.baseOpacity = 0.55;
        beacon.position.z = 0.02;
        artifact.add(beacon);
        const outerBeacon = new THREE.Mesh(
          new THREE.TorusGeometry(0.94, 0.006, 4, 84),
          new THREE.MeshBasicMaterial({ color: 0xc7a56e, transparent: true, opacity: 0.32 }),
        );
        outerBeacon.userData.role = "beacon";
        outerBeacon.userData.baseOpacity = 0.32;
        outerBeacon.position.z = -0.01;
        artifact.add(outerBeacon);
      } else {
        artifact.userData.baseScale = 0.68 + random() * 0.7;
        artifact.scale.setScalar(artifact.userData.baseScale);
      }

      artifacts.push(artifact);
      field.add(artifact);
    }

    const networkPositions: number[] = [];
    for (let i = 0; i < recordKinds.length; i += 1) {
      if (i % 3 !== 0) continue;
      const next = (i * 29 + 11) % recordKinds.length;
      const a = positions[i];
      const b = positions[next];
      networkPositions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
    const networkGeometry = new THREE.BufferGeometry();
    networkGeometry.setAttribute("position", new THREE.Float32BufferAttribute(networkPositions, 3));
    const network = new THREE.LineSegments(
      networkGeometry,
      new THREE.LineBasicMaterial({
        color: 0x54736f,
        transparent: true,
        opacity: 0.075,
        blending: THREE.AdditiveBlending,
      }),
    );
    field.add(network);

    const trajectoryGroup = new THREE.Group();
    for (let i = 0; i < 7; i += 1) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-18 + random() * 4, -7 + random() * 14, -10 + random() * 8),
        new THREE.Vector3(-6 + random() * 6, -4 + random() * 8, -4 + random() * 5),
        new THREE.Vector3(2 + random() * 5, -3 + random() * 6, -2 + random() * 4),
        new THREE.Vector3(15 + random() * 5, -7 + random() * 14, -11 + random() * 9),
      ]);
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(90));
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
          color: i % 3 === 0 ? 0xc7a56e : 0xa9fff2,
          transparent: true,
          opacity: 0.075 + (i % 2) * 0.035,
          blending: THREE.AdditiveBlending,
        }),
      );
      trajectoryGroup.add(line);
    }
    field.add(trajectoryGroup);

    const observatory = new THREE.Group();
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xa9fff2,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    for (let i = 0; i < 5; i += 1) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.2 + i * 1.18, 0.009, 4, 128), ringMaterial);
      ring.rotation.set(Math.PI / 2 + i * 0.09, i * 0.31, i * 0.22);
      observatory.add(ring);
    }
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(4.7, 13, 42, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x83a9a3,
        wireframe: true,
        transparent: true,
        opacity: 0.032,
        side: THREE.DoubleSide,
        depthWrite: false,
      }),
    );
    cone.rotation.x = -Math.PI / 2;
    cone.position.z = -4.8;
    observatory.add(cone);
    observatory.position.set(-0.5, 0.2, -1.8);
    field.add(observatory);

    const scanner = new THREE.Mesh(
      new THREE.PlaneGeometry(30, 21),
      new THREE.MeshBasicMaterial({
        color: 0xa9fff2,
        transparent: true,
        opacity: 0.016,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    scanner.position.z = -3;
    field.add(scanner);

    const slabGeometry = new THREE.BoxGeometry(3.6, 0.18, 0.07);
    const slabMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.96 });
    for (let i = 0; i < 21; i += 1) {
      const slab = new THREE.Mesh(slabGeometry, slabMaterial);
      slab.position.set((random() - 0.5) * 27, (random() - 0.5) * 14, -2 - random() * 18);
      slab.rotation.set((random() - 0.5) * 0.4, (random() - 0.5) * 1.5, (random() - 0.5) * 0.45);
      slab.scale.x = 0.45 + random() * 1.4;
      field.add(slab);
    }

    const dustCount = 1500;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i += 1) {
      const radius = 18 + random() * 64;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      dustPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      dustPositions[i * 3 + 1] = radius * Math.cos(phi);
      dustPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const dustGeometry = new THREE.BufferGeometry();
    dustGeometry.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({ color: 0x78908c, size: 0.038, transparent: true, opacity: 0.42, depthWrite: false }),
    );
    scene.add(dust);

    const focusFrame = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 1.8),
      new THREE.MeshBasicMaterial({
        color: 0xa9fff2,
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
      }),
    );
    focusFrame.renderOrder = 20;
    scene.add(focusFrame);

    const focusHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.92, 0.945, 72),
      new THREE.MeshBasicMaterial({
        color: 0xc7a56e,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthTest: false,
      }),
    );
    focusHalo.renderOrder = 21;
    scene.add(focusHalo);

    const pointer = new THREE.Vector2(4, 4);
    const pointerTarget = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    let hovered: number | null = null;
    let frameId = 0;
    let videosStarted = false;
    const startedAt = performance.now();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerTarget.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerLeave = () => {
      pointerTarget.set(0, 0);
      pointer.set(4, 4);
      hovered = null;
      hoverRef.current(null);
      (focusFrame.material as THREE.MeshBasicMaterial).opacity = 0;
      (focusHalo.material as THREE.MeshBasicMaterial).opacity = 0;
      renderer.domElement.style.cursor = "default";
    };

    const onClick = (event: PointerEvent) => {
      if (!activeRef.current) return;
      if (event.pointerType === "touch") return;
      const eventTarget = event.target;
      if (eventTarget instanceof Element && eventTarget.closest("button, a, video, input")) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const clickPointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(clickPointer, camera);
      const intersections = raycaster.intersectObjects(hitTargets, false);
      if (intersections.length) selectRef.current(intersections[0].object.userData.index as number);
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startedAt) / 1000;
      const activity = activeRef.current ? 1 : 0;
      const stageNow = stageRef.current;
      const selectedNow = selectedRef.current !== null;
      pointer.lerp(pointerTarget, reduceMotion ? 0.025 : 0.055);
      field.visible = stageNow === 1;
      fleet.visible = stageNow <= 1;

      if (activeRef.current && !videosStarted) {
        videosStarted = true;
        liveVideos.forEach((video) => {
          void video.play().catch(() => undefined);
        });
      }

      const targetZ = selectedNow ? 21 : activity ? 18.2 : stageNow === 1 ? 29 : 31;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, selectedNow ? 0.055 : 0.022);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * (activeRef.current ? 3.1 : stageNow === 1 ? 0.9 : 0.55), 0.022);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * (activeRef.current ? 1.8 : stageNow === 1 ? 0.7 : 0.38) + 0.25, 0.022);
      camera.lookAt(pointer.x * (activeRef.current ? 0.75 : 0.18), pointer.y * (activeRef.current ? 0.42 : 0.12), -2.4);

      if (!reduceMotion) {
        field.rotation.y += activeRef.current ? 0.00034 : 0.0001;
        field.rotation.x = -0.04 + Math.sin(elapsed * 0.06) * 0.022;
        dust.rotation.y -= stageNow === 1 ? 0.00032 : 0.000025;
        dust.rotation.x += stageNow === 1 ? 0.00009 : 0.000006;
        observatory.rotation.z = elapsed * 0.017;
        scanner.rotation.y = elapsed * 0.085;
        scanner.rotation.z = Math.sin(elapsed * 0.11) * 0.08;
        trajectoryGroup.rotation.y = Math.sin(elapsed * 0.045) * 0.1;
        morphologies.forEach((morphology, index) => {
          if (index === 2) return;
          morphology.rotation.x += 0.00009 + index * 0.00002;
          morphology.rotation.y += (index % 2 ? -1 : 1) * (0.00016 + index * 0.000025);
        });
        artifacts.forEach((artifact, index) => {
          artifact.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.00018;
        });
      }

      const correctionPhase = elapsed % 11.4;
      const correction = correctionPhase > 11.15
        ? Math.sin(((correctionPhase - 11.15) / 0.25) * Math.PI) * 0.042
        : 0;
      disk.rotation.x = -0.24 + Math.sin(elapsed * 0.09) * 0.008 + pointer.y * 0.012;
      disk.rotation.y = 0.13 + pointer.x * 0.024 + correction;
      disk.rotation.z = -0.075 + Math.sin(elapsed * 0.055) * 0.006;

      morphologies.forEach((morphology) => {
        const home = morphology.userData.home;
        let destination = home.clone();
        let targetScale = morphology.userData.introScale;
        if (morphology === disk) {
          if (stageNow >= 2) {
            destination = new THREE.Vector3(-12, 6.5, -10);
            targetScale = 0.32;
          } else if (stageNow === 1) {
            destination = new THREE.Vector3(2.6, -1.35, -7.4);
            targetScale = 0.58;
          }
        } else if (activeRef.current || stageNow >= 1) {
          destination = morphology.userData.exit.clone();
          targetScale = morphology.userData.fieldScale;
        }
        destination.y += Math.sin(elapsed * 0.45 + morphology.userData.phase) * (stageNow === 1 ? 0.3 : 0.16);
        morphology.position.lerp(destination, stageNow === 1 ? 0.032 : activeRef.current ? 0.045 : 0.028);
        const currentScale = morphology.scale.y;
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, stageNow === 1 ? 0.03 : activeRef.current ? 0.035 : 0.028);
        morphology.scale.set(nextScale * morphology.userData.aspectX, nextScale, nextScale);
      });

      edgeMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activeRef.current ? 0.2 : stageNow === 0 ? 0.18 : 0.05, 0.035);
      });
      glowMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activeRef.current ? 0.28 : stageNow === 0 ? 0.24 : 0.08, 0.03);
      });

      artifacts.forEach((artifact) => {
        const target = featuredVideoTargets.get(artifact.userData.index);
        const isHovered = hovered === artifact.userData.index && activeRef.current && !selectedNow;
        const hoverLift = isHovered && artifact.userData.kind === "video" ? 1.45 : isHovered ? 0.55 : 0;
        if (target) {
          const destination = (activeRef.current ? target : artifact.userData.home).clone();
          destination.z += hoverLift;
          artifact.position.lerp(destination, activeRef.current ? 0.036 : 0.018);
          artifact.position.y += Math.sin(elapsed * artifact.userData.speed + artifact.userData.phase) * 0.0025;
          const targetScale = activeRef.current ? (isHovered ? 2.82 : 2.1) : artifact.userData.baseScale;
          const nextScale = THREE.MathUtils.lerp(artifact.scale.x, targetScale, 0.035);
          artifact.scale.setScalar(nextScale);
        } else {
          artifact.position.y = artifact.userData.baseY + Math.sin(elapsed * artifact.userData.speed + artifact.userData.phase) * 0.085;
          const targetZ = artifact.userData.home.z + hoverLift;
          artifact.position.z = THREE.MathUtils.lerp(artifact.position.z, targetZ, 0.075);
          const hoverScale = artifact.userData.kind === "video" ? 1.52 : 1.24;
          const targetScale = artifact.userData.baseScale * (isHovered ? hoverScale : 1);
          const nextScale = THREE.MathUtils.lerp(artifact.scale.x, targetScale, isHovered ? 0.12 : 0.06);
          artifact.scale.setScalar(nextScale);
        }

        artifact.children.forEach((child) => {
          if (child.userData.role !== "artifact-edge" && child.userData.role !== "beacon") return;
          const material = (child as THREE.Mesh).material as THREE.Material & { opacity: number };
          const baseOpacity = child.userData.baseOpacity as number;
          const hoverOpacity = artifact.userData.kind === "video" ? 1 : 0.82;
          material.opacity = THREE.MathUtils.lerp(material.opacity, isHovered ? hoverOpacity : baseOpacity, 0.16);
        });
      });

      if (activeRef.current && !selectedNow) {
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObjects(hitTargets, false);
        const nextHovered = intersections.length ? (intersections[0].object.userData.index as number) : null;
        if (nextHovered !== hovered) {
          hovered = nextHovered;
          hoverRef.current(hovered);
          renderer.domElement.style.cursor = hovered === null ? "crosshair" : "pointer";
        }
        if (hovered !== null) {
          const target = artifacts[hovered];
          const worldPosition = target.getWorldPosition(new THREE.Vector3());
          focusFrame.position.copy(worldPosition);
          focusFrame.quaternion.copy(camera.quaternion);
          focusHalo.position.copy(worldPosition);
          focusHalo.quaternion.copy(camera.quaternion);
          const material = focusFrame.material as THREE.MeshBasicMaterial;
          const isVideo = target.userData.kind === "video";
          material.opacity = THREE.MathUtils.lerp(material.opacity, isVideo ? 0.9 : 0.62, 0.18);
          const pulse = 1 + Math.sin(elapsed * 5.8) * 0.065;
          focusFrame.scale.setScalar((isVideo ? 1.24 : 1) * pulse);
          focusFrame.rotation.z += isVideo ? 0.012 : 0.005;
          const haloMaterial = focusHalo.material as THREE.MeshBasicMaterial;
          haloMaterial.opacity = THREE.MathUtils.lerp(haloMaterial.opacity, isVideo ? 0.72 : 0.32, 0.18);
          focusHalo.scale.setScalar((isVideo ? 1.48 : 1.12) * (2 - pulse));
          focusHalo.rotation.z -= 0.009;
        } else {
          const material = focusFrame.material as THREE.MeshBasicMaterial;
          material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.18);
          const haloMaterial = focusHalo.material as THREE.MeshBasicMaterial;
          haloMaterial.opacity = THREE.MathUtils.lerp(haloMaterial.opacity, 0, 0.18);
        }
      } else {
        const material = focusFrame.material as THREE.MeshBasicMaterial;
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.18);
        const haloMaterial = focusHalo.material as THREE.MeshBasicMaterial;
        haloMaterial.opacity = THREE.MathUtils.lerp(haloMaterial.opacity, 0, 0.18);
        if (hovered !== null) {
          hovered = null;
          hoverRef.current(null);
        }
      }

      const fade = THREE.MathUtils.lerp(materials[0].opacity, activity ? 0.42 : 0.16, 0.018);
      documentMaterials.forEach((material) => { material.opacity = fade; });
      videoMaterials.forEach((material) => { material.opacity = Math.min(0.78, fade + 0.16); });
      imageMaterials.forEach((material) => { material.opacity = Math.min(0.7, fade + 0.08); });
      liveMaterials.forEach((material, index) => {
        const isHovered = hovered === index && activeRef.current && !selectedNow;
        material.opacity = THREE.MathUtils.lerp(material.opacity, isHovered ? 1 : activity ? 0.84 : 0.06, 0.065);
      });
      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onClick);
      documentGeometry.dispose();
      videoGeometry.dispose();
      imageGeometry.dispose();
      networkGeometry.dispose();
      dustGeometry.dispose();
      slabGeometry.dispose();
      textures.documents.concat(textures.videos, textures.images).forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      liveVideos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      liveTextures.forEach((texture) => texture.dispose());
      liveMaterials.forEach((material) => material.dispose());
      hullColorTexture.dispose();
      hullRoughnessTexture.dispose();
      morphologyMaterials.forEach((material) => material.dispose());
      edgeMaterials.forEach((material) => material.dispose());
      glowMaterials.forEach((material) => material.dispose());
      environmentTarget.dispose();
      roomEnvironment.dispose();
      pmrem.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [featuredIndexes, recordKinds]);

  return <div ref={mountRef} className="sky-scene" aria-hidden="true" />;
}
