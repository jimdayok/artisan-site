"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { finishedLensGeometry, surfacePointAt, type MaterialComparisonResult } from "@/lib/optical/geometry";
import { frameShapeContainsNormalized } from "@/lib/optical/calculations";

const MATERIAL_COLORS: Record<string, string> = {
  Plastic: "#78958f",
  Poly: "#648ba1",
  "1.60": "#9a7e5b",
  "1.67": "#43d6a7",
  "1.74": "#f1ad55",
  "1.76": "#26bfff",
};

function MetalMaterial() {
  return <meshStandardMaterial color="#c9b28b" metalness={0.94} roughness={0.18} envMapIntensity={1.35} />;
}

function visualBoundaryDistance(
  input: MaterialComparisonResult["geometry"]["input"],
  origin: { x: number; y: number },
  angleDegrees: number,
) {
  const angle = (angleDegrees * Math.PI) / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const halfA = Math.max(input.aSize / 2, 0.001);
  const halfB = Math.max(input.bSize / 2, 0.001);
  let low = 0;
  let high = Math.max(input.aSize, input.bSize) * 2;
  for (let iteration = 0; iteration < 36; iteration += 1) {
    const middle = (low + high) / 2;
    const x = (origin.x + dx * middle) / halfA;
    const y = (origin.y + dy * middle) / halfB;
    if (frameShapeContainsNormalized(input.frameShape, x, y)) low = middle;
    else high = middle;
  }
  return low;
}

function buildPerimeterTube(
  comparison: MaterialComparisonResult,
  enhancement: number,
  surface: "front" | "back" | "midpoint",
  radius: number,
) {
  const { geometry } = comparison;
  const points = Array.from({ length: 96 }, (_, angleIndex) => {
    const angleDegrees = (angleIndex / 96) * 360;
    const angleRadians = (angleDegrees * Math.PI) / 180;
    const boundary = visualBoundaryDistance(geometry.input, geometry.opticalCenter, angleDegrees);
    const x = geometry.opticalCenter.x + Math.cos(angleRadians) * boundary;
    const y = geometry.opticalCenter.y + Math.sin(angleRadians) * boundary;
    const point = surfacePointAt(geometry, x, y, enhancement);
    const z = surface === "midpoint" ? (point.front + point.back) / 2 : point[surface];
    return new THREE.Vector3(x / 10, y / 10, z / 10);
  });
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points, true, "centripetal"), 144, radius, 8, true);
}

function buildLensMesh(comparison: MaterialComparisonResult, enhancement: number) {
  const { geometry } = comparison;
  const angleSegments = 80;
  const radialSegments = 18;
  const vertices: number[] = [];
  const indices: number[] = [];
  const vertex = (surface: number, ring: number, angle: number) =>
    surface * (radialSegments + 1) * angleSegments + ring * angleSegments + (angle % angleSegments);

  for (const surface of ["front", "back"] as const) {
    for (let ring = 0; ring <= radialSegments; ring += 1) {
      for (let angleIndex = 0; angleIndex < angleSegments; angleIndex += 1) {
        const angleDegrees = (angleIndex / angleSegments) * 360;
        const angleRadians = (angleDegrees * Math.PI) / 180;
        const boundary = visualBoundaryDistance(geometry.input, geometry.opticalCenter, angleDegrees);
        const radius = boundary * (ring / radialSegments);
        const x = geometry.opticalCenter.x + Math.cos(angleRadians) * radius;
        const y = geometry.opticalCenter.y + Math.sin(angleRadians) * radius;
        const point = surfacePointAt(geometry, x, y, enhancement);
        vertices.push(x / 10, y / 10, point[surface] / 10);
      }
    }
  }

  for (let surface = 0; surface < 2; surface += 1) {
    for (let ring = 0; ring < radialSegments; ring += 1) {
      for (let angle = 0; angle < angleSegments; angle += 1) {
        const next = (angle + 1) % angleSegments;
        const a = vertex(surface, ring, angle);
        const b = vertex(surface, ring + 1, angle);
        const c = vertex(surface, ring + 1, next);
        const d = vertex(surface, ring, next);
        if (surface === 0) indices.push(a, b, c, a, c, d);
        else indices.push(a, c, b, a, d, c);
      }
    }
  }

  for (let angle = 0; angle < angleSegments; angle += 1) {
    const next = (angle + 1) % angleSegments;
    const frontA = vertex(0, radialSegments, angle);
    const frontB = vertex(0, radialSegments, next);
    const backA = vertex(1, radialSegments, angle);
    const backB = vertex(1, radialSegments, next);
    indices.push(frontA, backA, backB, frontA, backB, frontB);
  }

  const mesh = new THREE.BufferGeometry();
  mesh.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  mesh.setIndex(indices);
  mesh.computeVertexNormals();
  mesh.computeBoundingSphere();
  return mesh;
}

function tubeThrough(points: Array<[number, number, number]>, radius: number) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)), false, "centripetal"),
    48,
    radius,
    8,
    false,
  );
}

function LensMesh({
  comparison,
  color,
  enhancement,
  offset,
  showFrame,
  showProductColors,
}: {
  comparison: MaterialComparisonResult;
  color: string;
  enhancement: number;
  offset: number;
  showFrame: boolean;
  showProductColors: boolean;
}) {
  const displayColor = showProductColors ? color : "#dceceb";
  const geometry = useMemo(() => buildLensMesh(comparison, enhancement), [comparison, enhancement]);
  const frontGlow = useMemo(() => buildPerimeterTube(comparison, enhancement, "front", 0.026), [comparison, enhancement]);
  const backGlow = useMemo(() => buildPerimeterTube(comparison, enhancement, "back", 0.026), [comparison, enhancement]);
  const metalRim = useMemo(() => buildPerimeterTube(comparison, enhancement, "midpoint", 0.07), [comparison, enhancement]);
  useEffect(() => () => {
    geometry.dispose();
    frontGlow.dispose();
    backGlow.dispose();
    metalRim.dispose();
  }, [backGlow, frontGlow, geometry, metalRim]);
  return (
    <group position={[offset, 0, 0]}>
      <mesh geometry={geometry} castShadow>
        <meshPhysicalMaterial
          color={showProductColors ? displayColor : "#e8f3f2"}
          transparent
          opacity={showProductColors ? 0.38 : 0.2}
          transmission={showProductColors ? 0.82 : 0.94}
          roughness={0.025}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.035}
          ior={comparison.geometry.refractiveIndex}
          thickness={0.8}
          attenuationColor={displayColor}
          attenuationDistance={showProductColors ? 3.2 : 8}
          envMapIntensity={1.7}
          reflectivity={0.72}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[frontGlow, backGlow].map((edgeGeometry, index) => (
        <mesh key={index} geometry={edgeGeometry}>
          <meshStandardMaterial color={displayColor} emissive={displayColor} emissiveIntensity={showProductColors ? 2.5 : 0.35} transparent opacity={showProductColors ? 0.96 : 0.42} toneMapped={false} />
        </mesh>
      ))}
      {showFrame ? (
        <mesh geometry={metalRim} castShadow receiveShadow>
          <meshStandardMaterial color="#c9b28b" metalness={0.92} roughness={0.2} envMapIntensity={1.25} />
        </mesh>
      ) : null}
    </group>
  );
}

function MetalFrameHardware({ eyeOffset, halfWidth, halfHeight }: { eyeOffset: number; halfWidth: number; halfHeight: number }) {
  const innerX = Math.max(0.48, eyeOffset - halfWidth);
  const outerX = eyeOffset + halfWidth;
  const bridgeY = Math.min(halfHeight * 0.38, 0.72);
  const hingeY = Math.min(halfHeight * 0.25, 0.58);
  const bridge = useMemo(() => tubeThrough([
    [-innerX, bridgeY, 0],
    [-innerX * 0.62, bridgeY + 0.28, -0.03],
    [0, bridgeY + 0.38, -0.07],
    [innerX * 0.62, bridgeY + 0.28, -0.03],
    [innerX, bridgeY, 0],
  ], 0.078), [bridgeY, innerX]);
  const leftTemple = useMemo(() => tubeThrough([
    [-outerX, hingeY, 0],
    [-outerX - 0.35, hingeY, -0.35],
    [-outerX - 0.5, hingeY - 0.08, -2.6],
    [-outerX - 0.42, hingeY - 0.28, -5.8],
    [-outerX - 0.22, hingeY - 0.82, -6.75],
  ], 0.075), [hingeY, outerX]);
  const rightTemple = useMemo(() => tubeThrough([
    [outerX, hingeY, 0],
    [outerX + 0.35, hingeY, -0.35],
    [outerX + 0.5, hingeY - 0.08, -2.6],
    [outerX + 0.42, hingeY - 0.28, -5.8],
    [outerX + 0.22, hingeY - 0.82, -6.75],
  ], 0.075), [hingeY, outerX]);
  const leftPadArm = useMemo(() => tubeThrough([[-innerX, 0.22, -0.02], [-innerX * 0.78, -0.04, -0.34], [-innerX * 0.62, -0.3, -0.5]], 0.032), [innerX]);
  const rightPadArm = useMemo(() => tubeThrough([[innerX, 0.22, -0.02], [innerX * 0.78, -0.04, -0.34], [innerX * 0.62, -0.3, -0.5]], 0.032), [innerX]);

  useEffect(() => () => {
    bridge.dispose();
    leftTemple.dispose();
    rightTemple.dispose();
    leftPadArm.dispose();
    rightPadArm.dispose();
  }, [bridge, leftPadArm, leftTemple, rightPadArm, rightTemple]);

  return (
    <group>
      {[bridge, leftTemple, rightTemple, leftPadArm, rightPadArm].map((geometry, index) => <mesh key={index} geometry={geometry} castShadow><MetalMaterial /></mesh>)}
      <mesh position={[-outerX, hingeY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.12, 0.12, 0.34, 20]} /><MetalMaterial /></mesh>
      <mesh position={[outerX, hingeY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.12, 0.12, 0.34, 20]} /><MetalMaterial /></mesh>
      <mesh position={[-innerX * 0.55, -0.34, -0.5]} rotation={[0.12, 0.22, -0.16]} scale={[0.18, 0.28, 0.09]}><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#f2eee3" transparent opacity={0.68} roughness={0.18} transmission={0.46} /></mesh>
      <mesh position={[innerX * 0.55, -0.34, -0.5]} rotation={[0.12, -0.22, 0.16]} scale={[0.18, 0.28, 0.09]}><sphereGeometry args={[1, 24, 16]} /><meshPhysicalMaterial color="#f2eee3" transparent opacity={0.68} roughness={0.18} transmission={0.46} /></mesh>
    </group>
  );
}

function Eyeglasses({
  comparisons,
  enhancement,
  showFrame,
  showProductColors,
}: {
  comparisons: MaterialComparisonResult[];
  enhancement: number;
  showFrame: boolean;
  showProductColors: boolean;
}) {
  const leftSource = comparisons[0];
  const rightSource = comparisons[1] ?? comparisons[0];
  const eyeOffset = (rightSource.geometry.input.aSize + rightSource.geometry.input.dbl) / 20;
  const halfWidth = rightSource.geometry.input.aSize / 20;
  const halfHeight = rightSource.geometry.input.bSize / 20;
  const leftComparison = useMemo<MaterialComparisonResult>(() => ({
    ...leftSource,
    geometry: finishedLensGeometry(leftSource.geometry.input, { side: "left" }),
  }), [leftSource]);
  const leftColor = MATERIAL_COLORS[leftSource.material.name] ?? "#69b6aa";
  const rightColor = MATERIAL_COLORS[rightSource.material.name] ?? "#d7aa70";
  return (
    <group scale={0.82}>
      <group position={[-eyeOffset, 0, 0]}>
        <LensMesh comparison={leftComparison} color={leftColor} enhancement={enhancement} offset={0} showFrame={showFrame} showProductColors={showProductColors} />
      </group>
      <group position={[eyeOffset, 0, 0]}>
        <LensMesh comparison={rightSource} color={rightColor} enhancement={enhancement} offset={0} showFrame={showFrame} showProductColors={showProductColors} />
      </group>
      {showFrame ? <MetalFrameHardware eyeOffset={eyeOffset} halfWidth={halfWidth} halfHeight={halfHeight} /> : null}
    </group>
  );
}

function Scene({ comparisons, rotation, zoom, enhancement, showFrame, showProductColors }: { comparisons: MaterialComparisonResult[]; rotation: [number, number, number]; zoom: number; enhancement: number; showFrame: boolean; showProductColors: boolean }) {
  return (
    <>
      <ambientLight intensity={1.45} />
      <directionalLight position={[7, 8, 12]} intensity={2.6} castShadow />
      <directionalLight position={[-8, -4, 6]} intensity={1.1} color="#d4c09a" />
      <pointLight position={[0, 1, 8]} intensity={1.8} color="#b8f4ea" />
      <group rotation={rotation} scale={zoom}>
        <Eyeglasses comparisons={comparisons.slice(0, 2)} enhancement={enhancement} showFrame={showFrame} showProductColors={showProductColors} />
      </group>
    </>
  );
}

export default function Lens3DScene(props: {
  comparisons: MaterialComparisonResult[];
  rotation: [number, number, number];
  zoom: number;
  enhancement: number;
  showFrame: boolean;
  showProductColors: boolean;
}) {
  return (
    <Canvas orthographic camera={{ position: [0, 0, 20], zoom: 48 }} dpr={[1, 1.7]} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
      <Scene {...props} />
    </Canvas>
  );
}
