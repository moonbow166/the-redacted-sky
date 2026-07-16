"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type SkySceneProps = {
  active: boolean;
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
  };
};

type Morphology = THREE.Group & {
  userData: {
    home: THREE.Vector3;
    exit: THREE.Vector3;
    phase: number;
    introScale: number;
    fieldScale: number;
  };
};

const featuredVideoTargets = new Map<number, THREE.Vector3>([
  [105, new THREE.Vector3(0.2, 2.65, 6.4)],
  [85, new THREE.Vector3(-4.6, 0.65, 4.2)],
  [102, new THREE.Vector3(4.8, 0.95, 3.8)],
  [86, new THREE.Vector3(-2.7, -2.45, 5.25)],
  [80, new THREE.Vector3(3.15, -2.35, 4.7)],
]);

const livePreviewUrls = new Map<number, string>([
  [105, "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111689168/DOD_111689168-1024x576-2000k.mp4"],
  [85, "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111688954/DOD_111688954-1024x576-2000k.mp4"],
  [102, "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111689133/DOD_111689133-1024x576-2000k.mp4"],
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

export default function SkyScene({ active, selected, onHover, onSelect }: SkySceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const selectedRef = useRef(selected);
  const selectRef = useRef(onSelect);
  const hoverRef = useRef(onHover);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

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

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 150);
    camera.position.set(0, 0.4, 31);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.setClearColor(0x020405, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional UAP evidence archive");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const field = new THREE.Group();
    field.rotation.x = -0.04;
    scene.add(field);

    const ambient = new THREE.HemisphereLight(0x9fffee, 0x030608, 1.15);
    scene.add(ambient);
    const cyanLight = new THREE.PointLight(0x8effed, 18, 34, 1.8);
    cyanLight.position.set(8, 3, 17);
    scene.add(cyanLight);
    const amberLight = new THREE.PointLight(0xc7a56e, 9, 28, 1.8);
    amberLight.position.set(3, -5, 14);
    scene.add(amberLight);

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
        metalness: 0.92,
        roughness: 0.29,
        clearcoat: 0.72,
        clearcoatRoughness: 0.16,
        iridescence: 0.18,
        iridescenceIOR: 1.34,
        transparent: true,
        opacity: 0.98,
        emissive: 0x061817,
        emissiveIntensity: 0.38,
        side: THREE.DoubleSide,
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
    ) => {
      const morphology = model as Morphology;
      morphology.position.copy(home);
      morphology.scale.setScalar(introScale);
      morphology.userData = { home, exit, phase, introScale, fieldScale };
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
    registerMorphology(orb, new THREE.Vector3(4.9, 3.7, 11.2), new THREE.Vector3(-7.2, 3.5, -1.5), 0.2, 1.2, 0.86);

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
    registerMorphology(ticTac, new THREE.Vector3(9.6, 3.0, 10.2), new THREE.Vector3(7.1, 4.1, -1.8), 1.4, 1.18, 0.82);

    const disk = new THREE.Group();
    const diskMaterial = makeSkin(0x374b49);
    const diskProfile = [
      new THREE.Vector2(0.02, -0.4),
      new THREE.Vector2(0.82, -0.38),
      new THREE.Vector2(1.55, -0.26),
      new THREE.Vector2(2.28, -0.09),
      new THREE.Vector2(2.62, 0),
      new THREE.Vector2(2.3, 0.09),
      new THREE.Vector2(1.45, 0.28),
      new THREE.Vector2(0.58, 0.43),
      new THREE.Vector2(0.02, 0.46),
    ];
    const diskBody = new THREE.Mesh(new THREE.LatheGeometry(diskProfile, 96), diskMaterial);
    diskBody.rotation.x = Math.PI / 2;
    disk.add(diskBody);
    const domeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x456c69,
      metalness: 0.28,
      roughness: 0.12,
      transmission: 0.52,
      thickness: 0.8,
      transparent: true,
      opacity: 0.72,
      clearcoat: 1,
      iridescence: 0.48,
    });
    morphologyMaterials.push(domeMaterial);
    const diskDome = new THREE.Mesh(new THREE.SphereGeometry(0.82, 64, 36), domeMaterial);
    diskDome.scale.z = 0.42;
    diskDome.position.z = 0.34;
    disk.add(diskDome);
    const aperture = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.68, 0.2, 64), makeSkin(0x172422));
    aperture.rotation.x = Math.PI / 2;
    aperture.position.z = -0.38;
    disk.add(aperture);
    const rimGlow = new THREE.Mesh(new THREE.TorusGeometry(2.16, 0.022, 8, 160), makeGlow(0x9fffee, 0.68));
    disk.add(rimGlow);
    for (let i = 0; i < 28; i += 1) {
      const angle = (i / 28) * Math.PI * 2;
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.045, 0.035),
        i % 7 === 0 ? makeGlow(0xc7a56e, 0.72) : makeGlow(0x86b8b1, 0.3),
      );
      panel.position.set(Math.cos(angle) * 1.82, Math.sin(angle) * 1.82, -0.24);
      panel.rotation.z = angle;
      disk.add(panel);
    }
    const diskHalo = new THREE.Mesh(new THREE.TorusGeometry(2.95, 0.012, 6, 180), makeGlow(0xa9fff2, 0.18));
    disk.add(diskHalo);
    registerMorphology(disk, new THREE.Vector3(7.1, 0.25, 10.4), new THREE.Vector3(7.2, -3.2, 0.5), 2.2, 1.82, 0.82);

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
    registerMorphology(triangle, new THREE.Vector3(9.25, -1.65, 11), new THREE.Vector3(-7.2, -3.25, -2), 3.1, 1.22, 0.82);

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
    registerMorphology(cylinder, new THREE.Vector3(5.9, -3.15, 11.6), new THREE.Vector3(-2.4, 5.2, -4.5), 4.2, 1.18, 0.78);

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
    registerMorphology(boomerang, new THREE.Vector3(10.4, -3.55, 9.4), new THREE.Vector3(2.8, -5.2, -4.5), 5.1, 1.08, 0.74);

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
    const important = new Set(featuredVideoTargets.keys());

    for (let i = 0; i < 161; i += 1) {
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
      };

      const forcedVideo = important.has(i);
      const kind = forcedVideo
        ? "video"
        : i < 119
            ? "document"
            : i < 147
              ? "video"
              : "image";
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
      edge.scale.setScalar(1.03);
      artifact.add(edge);

      if (important.has(i)) {
        artifact.scale.setScalar(1.12);
        const beacon = new THREE.Mesh(
          new THREE.TorusGeometry(0.72, 0.008, 5, 72),
          new THREE.MeshBasicMaterial({ color: 0xa9fff2, transparent: true, opacity: 0.55 }),
        );
        beacon.position.z = 0.02;
        artifact.add(beacon);
        const outerBeacon = new THREE.Mesh(
          new THREE.TorusGeometry(0.94, 0.006, 4, 84),
          new THREE.MeshBasicMaterial({ color: 0xc7a56e, transparent: true, opacity: 0.32 }),
        );
        outerBeacon.position.z = -0.01;
        artifact.add(outerBeacon);
      } else {
        artifact.scale.setScalar(0.68 + random() * 0.7);
      }

      artifacts.push(artifact);
      field.add(artifact);
    }

    const networkPositions: number[] = [];
    for (let i = 0; i < 161; i += 1) {
      if (i % 3 !== 0) continue;
      const next = (i * 29 + 11) % 161;
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
      new THREE.MeshBasicMaterial({ color: 0xa9fff2, wireframe: true, transparent: true, opacity: 0 }),
    );
    scene.add(focusFrame);

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
      renderer.domElement.style.cursor = "default";
    };

    const onClick = () => {
      if (activeRef.current && hovered !== null) selectRef.current(hovered);
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startedAt) / 1000;
      const activity = activeRef.current ? 1 : 0;
      const selectedNow = selectedRef.current !== null;
      pointer.lerp(pointerTarget, reduceMotion ? 0.025 : 0.055);

      if (activeRef.current && !videosStarted) {
        videosStarted = true;
        liveVideos.forEach((video) => {
          void video.play().catch(() => undefined);
        });
      }

      const targetZ = selectedNow ? 21 : activity ? 18.2 : 31;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, selectedNow ? 0.055 : 0.022);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 3.1, 0.022);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 1.8 + 0.25, 0.022);
      camera.lookAt(pointer.x * 0.75, pointer.y * 0.42, -2.4);

      if (!reduceMotion) {
        field.rotation.y += activeRef.current ? 0.00034 : 0.0001;
        field.rotation.x = -0.04 + Math.sin(elapsed * 0.06) * 0.022;
        dust.rotation.y -= 0.000025;
        observatory.rotation.z = elapsed * 0.017;
        scanner.rotation.y = elapsed * 0.085;
        scanner.rotation.z = Math.sin(elapsed * 0.11) * 0.08;
        trajectoryGroup.rotation.y = Math.sin(elapsed * 0.045) * 0.1;
        morphologies.forEach((morphology, index) => {
          morphology.rotation.x += 0.00055 + index * 0.00008;
          morphology.rotation.y += (index % 2 ? -1 : 1) * (0.001 + index * 0.00011);
        });
        artifacts.forEach((artifact, index) => {
          artifact.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.00018;
        });
      }

      morphologies.forEach((morphology, index) => {
        const home = morphology.userData.home;
        const destination = (activeRef.current ? morphology.userData.exit : home).clone();
        destination.y += Math.sin(elapsed * 0.45 + morphology.userData.phase) * (activeRef.current ? 0.24 : 0.16);
        morphology.position.lerp(destination, activeRef.current ? 0.045 : 0.028);
        const targetScale = activeRef.current ? morphology.userData.fieldScale : morphology.userData.introScale;
        const currentScale = morphology.scale.x;
        const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, activeRef.current ? 0.035 : 0.028);
        morphology.scale.setScalar(nextScale);
      });

      morphologyMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activeRef.current ? 0.78 : 0.98, 0.035);
      });
      edgeMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activeRef.current ? 0.26 : 0.48, 0.035);
      });
      glowMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activeRef.current ? 0.5 : 0.72, 0.03);
      });

      artifacts.forEach((artifact) => {
        const target = featuredVideoTargets.get(artifact.userData.index);
        if (target) {
          const destination = activeRef.current ? target : artifact.userData.home;
          artifact.position.lerp(destination, activeRef.current ? 0.036 : 0.018);
          artifact.position.y += Math.sin(elapsed * artifact.userData.speed + artifact.userData.phase) * 0.0025;
          const targetScale = activeRef.current ? 2.1 : 1.12;
          const nextScale = THREE.MathUtils.lerp(artifact.scale.x, targetScale, 0.035);
          artifact.scale.setScalar(nextScale);
        } else {
          artifact.position.y = artifact.userData.baseY + Math.sin(elapsed * artifact.userData.speed + artifact.userData.phase) * 0.085;
        }
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
          const material = focusFrame.material as THREE.MeshBasicMaterial;
          material.opacity = THREE.MathUtils.lerp(material.opacity, 0.45, 0.18);
          focusFrame.rotation.z += 0.004;
        } else {
          const material = focusFrame.material as THREE.MeshBasicMaterial;
          material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.18);
        }
      } else {
        const material = focusFrame.material as THREE.MeshBasicMaterial;
        material.opacity = THREE.MathUtils.lerp(material.opacity, 0, 0.18);
        if (hovered !== null) {
          hovered = null;
          hoverRef.current(null);
        }
      }

      const fade = THREE.MathUtils.lerp(materials[0].opacity, activity ? 0.58 : 0.22, 0.018);
      documentMaterials.forEach((material) => { material.opacity = fade; });
      videoMaterials.forEach((material) => { material.opacity = Math.min(0.78, fade + 0.16); });
      imageMaterials.forEach((material) => { material.opacity = Math.min(0.7, fade + 0.08); });
      liveMaterials.forEach((material) => {
        material.opacity = THREE.MathUtils.lerp(material.opacity, activity ? 0.92 : 0.08, 0.045);
      });
      renderer.render(scene, camera);
    };

    resize();
    animate();
    window.addEventListener("resize", resize);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("click", onClick);
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
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="sky-scene" aria-hidden="true" />;
}
