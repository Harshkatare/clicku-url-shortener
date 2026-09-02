import type { CSSProperties } from "react";

interface LogoProps {
  size?: number;
  variant?: "standard" | "slim" | "tilt" | "wide" | "steep" | "vertical" | "light" | "badge" | "badgeDark";
  color?: "gradient" | "solid" | "white";
  className?: string;
  style?: CSSProperties;
}

const GEOMETRY: Record<string, { angle: number; rx: number; ry: number; stroke: number; rotate?: number; vertical?: boolean }> = {
  standard: { angle: 30, rx: 11.5, ry: 16, stroke: 8 },
  slim: { angle: 30, rx: 10.5, ry: 17.5, stroke: 8 },
  tilt: { angle: 30, rx: 11.5, ry: 16, stroke: 8, rotate: 15 },
  wide: { angle: 20, rx: 11.5, ry: 16, stroke: 8 },
  steep: { angle: 40, rx: 11.5, ry: 16, stroke: 8 },
  vertical: { angle: 60, rx: 11.5, ry: 16, stroke: 8, vertical: true },
  light: { angle: 30, rx: 11.5, ry: 16, stroke: 7 },
};

export function Logo({ size = 32, variant = "standard", color = "gradient", className, style }: LogoProps) {
  const isBadge = variant === "badge" || variant === "badgeDark";
  const markColor = isBadge ? "#fff" : color === "white" ? "#fff" : color === "gradient" ? "url(#sl-grad)" : "currentColor";
  const g = isBadge ? GEOMETRY.standard : GEOMETRY[variant] ?? GEOMETRY.standard;
  const half = g.angle;
  const stroke = g.stroke;
  const a1 = -half;
  const a2 = half;

  const ellipses = g.vertical
    ? [
        { cx: 32, cy: 25, r: `rotate(60 32 25)` },
        { cx: 32, cy: 39, r: `rotate(120 32 39)` },
      ]
    : [
        { cx: 25, cy: 32, r: `rotate(${a1} 25 32)` },
        { cx: 39, cy: 32, r: `rotate(${a2} 39 32)` },
      ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      style={style}
      role="img"
      aria-label="ShortLynk"
    >
      <defs>
        <linearGradient id="sl-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      {isBadge && (
        <rect width="64" height="64" rx="15" fill={variant === "badge" ? "url(#sl-grad)" : "#0f172a"} />
      )}
      <g
        fill="none"
        stroke={markColor}
        strokeWidth={stroke}
        transform={
          isBadge
            ? "translate(32 32) scale(0.72) translate(-32 -32)"
            : g.rotate
              ? `rotate(${g.rotate} 32 32)`
              : undefined
        }
      >
        {ellipses.map((e, i) => (
          <ellipse key={i} cx={e.cx} cy={e.cy} rx={g.rx} ry={g.ry} transform={e.r} />
        ))}
      </g>
    </svg>
  );
}
