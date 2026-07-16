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
  };
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
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
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional UAP evidence archive");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const field = new THREE.Group();
    field.rotation.x = -0.04;
    scene.add(field);

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

    const documentGeometry = new THREE.PlaneGeometry(0.78, 1.04);
    const videoGeometry = new THREE.PlaneGeometry(1.16, 0.68);
    const imageGeometry = new THREE.PlaneGeometry(0.86, 0.86);
    const hitTargets: THREE.Mesh[] = [];
    const artifacts: Artifact[] = [];
    const positions: THREE.Vector3[] = [];
    const important = new Set([66, 80, 140]);

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
      };

      const forcedVideo = i === 66 || i === 80;
      const forcedDocument = i === 140;
      const kind = forcedVideo
        ? "video"
        : forcedDocument
          ? "document"
          : i < 119
            ? "document"
            : i < 147
              ? "video"
              : "image";
      const geometry = kind === "document" ? documentGeometry : kind === "video" ? videoGeometry : imageGeometry;
      const materialSet = kind === "document" ? documentMaterials : kind === "video" ? videoMaterials : imageMaterials;
      const mesh = new THREE.Mesh(geometry, materialSet[i % materialSet.length]);
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
        artifact.scale.setScalar(1.7);
        const beacon = new THREE.Mesh(
          new THREE.TorusGeometry(0.72, 0.008, 5, 72),
          new THREE.MeshBasicMaterial({ color: 0xa9fff2, transparent: true, opacity: 0.55 }),
        );
        beacon.position.z = 0.02;
        artifact.add(beacon);
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
        artifacts.forEach((artifact, index) => {
          artifact.position.y = artifact.userData.baseY + Math.sin(elapsed * artifact.userData.speed + artifact.userData.phase) * 0.085;
          artifact.rotation.z += (index % 2 === 0 ? 1 : -1) * 0.00018;
        });
      }

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
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="sky-scene" aria-hidden="true" />;
}
