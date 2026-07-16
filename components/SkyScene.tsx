"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type SkySceneProps = {
  active: boolean;
  selected: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
};

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

const vertexShader = `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vPulse;
  uniform float uTime;
  uniform float uActive;

  void main() {
    vec3 p = position;
    float pulse = 0.76 + sin(uTime * 1.7 + aPhase) * 0.24;
    p.x += sin(uTime * 0.09 + aPhase) * 0.055 * uActive;
    p.y += cos(uTime * 0.07 + aPhase) * 0.055 * uActive;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * pulse * (180.0 / max(2.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
    vColor = aColor;
    vPulse = pulse;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vPulse;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float d = length(center);
    float core = smoothstep(0.18, 0.0, d);
    float halo = smoothstep(0.5, 0.0, d) * 0.58;
    float ring = smoothstep(0.37, 0.32, d) - smoothstep(0.29, 0.24, d);
    float alpha = core + halo + ring * 0.5;
    if (alpha < 0.015) discard;
    gl_FragColor = vec4(vColor * (1.0 + core * 1.9), alpha * vPulse);
  }
`;

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
    scene.fog = new THREE.FogExp2(0x020506, 0.035);

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 130);
    camera.position.set(0, 0.4, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x020405, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-label", "Interactive three-dimensional UAP evidence field");
    renderer.domElement.setAttribute("role", "img");
    mount.appendChild(renderer.domElement);

    const field = new THREE.Group();
    scene.add(field);

    const count = 161;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const important = new Set([66, 80, 140]);

    for (let i = 0; i < count; i += 1) {
      const radius = 4.6 + Math.pow(random(), 0.68) * 13;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      const flatten = 0.7 + random() * 0.42;
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * flatten;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta) * 0.78;

      const isImportant = important.has(i);
      const isRedacted = i % 3 !== 0;
      const color = isImportant
        ? new THREE.Color(0xa9fff2)
        : isRedacted
          ? new THREE.Color(0xc7a56e)
          : new THREE.Color(0x8ca6a4);
      colors.set([color.r, color.g, color.b], i * 3);
      sizes[i] = isImportant ? 11 + random() * 5 : 3.1 + random() * 5.2;
      phases[i] = random() * Math.PI * 2;
    }

    const contactGeometry = new THREE.BufferGeometry();
    contactGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    contactGeometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    contactGeometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    contactGeometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

    const contactMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uActive: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const contacts = new THREE.Points(contactGeometry, contactMaterial);
    field.add(contacts);

    const linePositions: number[] = [];
    for (let i = 0; i < count; i += 1) {
      if (i % 4 !== 0) continue;
      const next = (i * 13 + 17) % count;
      linePositions.push(
        positions[i * 3],
        positions[i * 3 + 1],
        positions[i * 3 + 2],
        positions[next * 3],
        positions[next * 3 + 1],
        positions[next * 3 + 2],
      );
    }
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(
      lineGeometry,
      new THREE.LineBasicMaterial({
        color: 0x73918d,
        transparent: true,
        opacity: 0.085,
        blending: THREE.AdditiveBlending,
      }),
    );
    field.add(lines);

    const starCount = 1200;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      const radius = 18 + random() * 58;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.cos(phi);
      starPositions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const stars = new THREE.Points(
      starGeometry,
      new THREE.PointsMaterial({
        color: 0x77918d,
        size: 0.052,
        transparent: true,
        opacity: 0.48,
        depthWrite: false,
      }),
    );
    scene.add(stars);

    const anomalyGroup = new THREE.Group();
    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(2.35, 2),
      new THREE.MeshBasicMaterial({
        color: 0x80a7a0,
        wireframe: true,
        transparent: true,
        opacity: 0.055,
        blending: THREE.AdditiveBlending,
      }),
    );
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.21, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xd8fff8, transparent: true, opacity: 0.75 }),
    );
    anomalyGroup.add(shell, core);
    anomalyGroup.position.set(-1.2, 0.3, -1.5);
    field.add(anomalyGroup);

    const pointer = new THREE.Vector2(4, 4);
    const pointerTarget = new THREE.Vector2(0, 0);
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 0.78;
    let hovered: number | null = null;
    let frameId = 0;
    const clock = new THREE.Clock();
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
      renderer.domElement.style.cursor = "default";
    };

    const onClick = () => {
      if (activeRef.current && hovered !== null) selectRef.current(hovered);
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      const activity = activeRef.current ? 1 : 0;
      const selectedNow = selectedRef.current !== null;
      pointer.lerp(pointerTarget, reduceMotion ? 0.03 : 0.065);

      contactMaterial.uniforms.uTime.value = elapsed;
      contactMaterial.uniforms.uActive.value = THREE.MathUtils.lerp(
        contactMaterial.uniforms.uActive.value,
        activity,
        0.03,
      );

      const targetZ = selectedNow ? 18.5 : activity ? 17.2 : 28;
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, selectedNow ? 0.055 : 0.022);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 2.15, 0.024);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, pointer.y * 1.35 + 0.25, 0.024);
      camera.lookAt(pointer.x * 0.48, pointer.y * 0.28, -1.2);

      if (!reduceMotion) {
        field.rotation.y += activeRef.current ? 0.00048 : 0.00016;
        field.rotation.x = Math.sin(elapsed * 0.08) * 0.04;
        stars.rotation.y -= 0.00004;
        anomalyGroup.rotation.x = elapsed * 0.05;
        anomalyGroup.rotation.y = elapsed * 0.08;
        const coreScale = 1 + Math.sin(elapsed * 1.8) * 0.18;
        core.scale.setScalar(coreScale);
      }

      if (activeRef.current && !selectedNow) {
        raycaster.setFromCamera(pointer, camera);
        const intersections = raycaster.intersectObject(contacts);
        const nextHovered = intersections.length ? (intersections[0].index ?? null) : null;
        if (nextHovered !== hovered) {
          hovered = nextHovered;
          hoverRef.current(hovered);
          renderer.domElement.style.cursor = hovered === null ? "crosshair" : "pointer";
        }
      } else if (hovered !== null) {
        hovered = null;
        hoverRef.current(null);
      }

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
      contactGeometry.dispose();
      contactMaterial.dispose();
      lineGeometry.dispose();
      (lines.material as THREE.Material).dispose();
      starGeometry.dispose();
      (stars.material as THREE.Material).dispose();
      shell.geometry.dispose();
      (shell.material as THREE.Material).dispose();
      core.geometry.dispose();
      (core.material as THREE.Material).dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="sky-scene" aria-hidden="true" />;
}
