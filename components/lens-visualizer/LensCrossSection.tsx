"use client";

import { useMemo } from "react";
import Image from "next/image";
import { frameBoundaryDistance, surfacePointAt, type MaterialComparisonResult } from "@/lib/optical/geometry";

const COLORS = ["#2e766d", "#a97548", "#765b99", "#cc8c26", "#4d6f91", "#8c4f64"];
const PATIENT_COLORS: Record<string, { solid: string; glow: string }> = {
  Plastic: { solid: "#78958f", glow: "rgba(120,149,143,0.34)" },
  Poly: { solid: "#648ba1", glow: "rgba(100,139,161,0.34)" },
  "1.60": { solid: "#9a7e5b", glow: "rgba(154,126,91,0.34)" },
  "1.67": { solid: "#2e766d", glow: "rgba(46,118,109,0.38)" },
  "1.74": { solid: "#a97548", glow: "rgba(169,117,72,0.38)" },
  "1.76": { solid: "#007ca8", glow: "rgba(0,124,168,0.42)" },
};

function materialLabel(name: string) {
  if (name === "1.76") return "Tokai 1.76";
  if (name === "Plastic") return "Standard plastic · 1.50";
  if (name === "Poly") return "Polycarbonate · 1.59";
  if (name.match(/^1\.(60|67|74)$/)) return `Hi-Index ${name}`;
  return name;
}

export default function LensCrossSection({
  comparisons,
  enhancement = 1,
  patient = false,
}: {
  comparisons: MaterialComparisonResult[];
  enhancement?: number;
  patient?: boolean;
}) {
  const profiles = useMemo(() => comparisons.map((comparison, comparisonIndex) => {
    const { geometry } = comparison;
    const cutAngle = geometry.maximumEdgeLocation.angleDegrees;
    const forward = frameBoundaryDistance(geometry.input, geometry.opticalCenter, cutAngle);
    const backward = frameBoundaryDistance(geometry.input, geometry.opticalCenter, (cutAngle + 180) % 360);
    const radians = (cutAngle * Math.PI) / 180;
    const rawPoints = Array.from({ length: 101 }, (_, index) => {
      const distance = -backward + ((forward + backward) * index) / 100;
      const x = geometry.opticalCenter.x + Math.cos(radians) * distance;
      const y = geometry.opticalCenter.y + Math.sin(radians) * distance;
      return { distance, ...surfacePointAt(geometry, x, y, enhancement) };
    });
    const first = rawPoints[0];
    const last = rawPoints.at(-1) ?? first;
    const firstMidpoint = (first.front + first.back) / 2;
    const lastMidpoint = (last.front + last.back) / 2;
    const span = Math.max(last.distance - first.distance, 1);
    const points = rawPoints.map((point) => {
      const progress = (point.distance - first.distance) / span;
      const framePlane = firstMidpoint + (lastMidpoint - firstMidpoint) * progress;
      return {
        ...point,
        front: point.front - framePlane,
        back: point.back - framePlane,
      };
    });
    return { comparison, points, color: patient ? (PATIENT_COLORS[comparison.material.name]?.solid ?? COLORS[comparisonIndex % COLORS.length]) : COLORS[comparisonIndex % COLORS.length] };
  }), [comparisons, enhancement, patient]);

  const allPoints = profiles.flatMap((profile) => profile.points);
  const minDistance = Math.min(...allPoints.map((point) => point.distance));
  const maxDistance = Math.max(...allPoints.map((point) => point.distance));
  const minZ = Math.min(...allPoints.map((point) => point.back));
  const maxZ = Math.max(...allPoints.map((point) => point.front));
  const width = 760;
  const height = 370;
  const paddingLeft = 76;
  const paddingRight = 30;
  const paddingTop = 28;
  const paddingBottom = 64;
  const scaleX = (value: number) => paddingLeft + ((value - minDistance) / Math.max(maxDistance - minDistance, 1)) * (width - paddingLeft - paddingRight);
  const scaleY = (value: number) => height - paddingBottom - ((value - minZ) / Math.max(maxZ - minZ, 1)) * (height - paddingTop - paddingBottom);
  const xTicks = Array.from({ length: 7 }, (_, index) => minDistance + ((maxDistance - minDistance) * index) / 6);
  const yTicks = Array.from({ length: 5 }, (_, index) => minZ + ((maxZ - minZ) * index) / 4);
  const pathFor = (points: typeof allPoints, surface: "front" | "back") =>
    points.map((point, index) => `${index === 0 ? "M" : "L"}${scaleX(point.distance).toFixed(2)},${scaleY(point[surface]).toFixed(2)}`).join(" ");

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8c6a8] bg-[#fcfaf6]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadfce] px-4 py-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#8a7654]">{patient ? "Measured cross section" : "Shared scale overlay"}</p>
          <p className="mt-1 text-sm text-[#625b53]">Thickest-edge meridian · Front base curve {comparisons[0].geometry.input.baseCurve.toFixed(2)} D.</p>
        </div>
        <span className="rounded-full bg-[#172a28] px-3 py-1 text-xs font-semibold text-white">
          {enhancement === 1 ? "Actual thickness" : `${enhancement}× thickness difference`}
        </span>
      </div>
      <svg
        role="img"
        aria-label={`Cross-section overlay for ${comparisons.map((entry) => entry.material.name).join(", ")}. ${enhancement === 1 ? "Actual thickness scale." : `Thickness differences visually enhanced ${enhancement} times.`}`}
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
      >
        <rect width={width} height={height} fill="#fcfaf6" />
        {xTicks.map((tick) => <g key={`x-${tick}`}><line x1={scaleX(tick)} x2={scaleX(tick)} y1={paddingTop} y2={height - paddingBottom} stroke="#d8c6a8" strokeWidth="0.8" opacity="0.6" /><text x={scaleX(tick)} y={height - paddingBottom + 19} fill="#7b7064" fontFamily="sans-serif" fontSize="10" textAnchor="middle">{tick.toFixed(0)}</text></g>)}
        {yTicks.map((tick) => <g key={`y-${tick}`}><line x1={paddingLeft} x2={width - paddingRight} y1={scaleY(tick)} y2={scaleY(tick)} stroke="#d8c6a8" strokeWidth="0.8" opacity="0.6" /><text x={paddingLeft - 10} y={scaleY(tick) + 3} fill="#7b7064" fontFamily="sans-serif" fontSize="10" textAnchor="end">{tick.toFixed(1)}</text></g>)}
        <line x1={paddingLeft} x2={width - paddingRight} y1={height - paddingBottom} y2={height - paddingBottom} stroke="#8a7654" strokeWidth="1.1" />
        <line x1={paddingLeft} x2={paddingLeft} y1={paddingTop} y2={height - paddingBottom} stroke="#8a7654" strokeWidth="1.1" />
        <text x={(paddingLeft + width - paddingRight) / 2} y={height - 12} fill="#625b53" fontFamily="sans-serif" fontSize="11" textAnchor="middle">Position across lens (mm)</text>
        <text x="17" y={(paddingTop + height - paddingBottom) / 2} fill="#625b53" fontFamily="sans-serif" fontSize="11" textAnchor="middle" transform={`rotate(-90 17 ${(paddingTop + height - paddingBottom) / 2})`}>Surface depth (mm)</text>
        <line x1={paddingLeft} x2={width - paddingRight} y1={scaleY(0)} y2={scaleY(0)} stroke="#8a7654" strokeDasharray="5 5" opacity="0.72" />
        {profiles.map(({ comparison, points, color }) => (
          <g key={comparison.material.name}>
            <path d={pathFor(points, "front")} fill="none" stroke={color} strokeWidth="3" />
            <path d={pathFor(points, "back")} fill="none" stroke={color} strokeWidth="3" strokeDasharray="8 4" />
            <line
              x1={scaleX(points[0].distance)}
              x2={scaleX(points[0].distance)}
              y1={scaleY(points[0].front)}
              y2={scaleY(points[0].back)}
              stroke={color}
              strokeWidth="2"
            />
            <line
              x1={scaleX(points.at(-1)?.distance ?? 0)}
              x2={scaleX(points.at(-1)?.distance ?? 0)}
              y1={scaleY(points.at(-1)?.front ?? 0)}
              y2={scaleY(points.at(-1)?.back ?? 0)}
              stroke={color}
              strokeWidth="2"
            />
          </g>
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#eadfce] px-4 py-3 text-xs font-semibold text-[#625b53]">
        {profiles.map(({ comparison, color }) => (
          <span key={comparison.material.name} className="inline-flex items-center gap-2">
            <span className="h-2.5 w-6 rounded-full" style={{ backgroundColor: color }} />
            {comparison.material.name === "1.76" ? <Image src="/tokai-logo.png" alt="" width={20} height={20} className="h-5 w-5 object-contain" /> : null}
            {materialLabel(comparison.material.name)}
          </span>
        ))}
        <span className="ml-auto">Solid: front · dashed: back · fine dash: frame plane</span>
      </div>
    </div>
  );
}
