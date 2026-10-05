import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export const TAU = Math.PI * 2;
export function random(seed) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}
export function elevation(x, z) {
  return (
    0.1 +
    Math.sin(x * 2.1 + z) * 0.16 +
    Math.cos(z * 3.4 - x * 0.7) * 0.1 +
    Math.sin(x * 7 + z * 5) * 0.035 +
    Math.cos(x * 17 - z * 11) * 0.008
  );
}
export function outline(a) {
  return (
    1.77 +
    Math.sin(a * 3 + 0.8) * 0.18 +
    Math.cos(a * 5 - 0.3) * 0.085 +
    Math.sin(a * 9) * 0.025
  );
}
export function surface(a, radius) {
  const x = Math.cos(a) * radius,
    z = Math.sin(a) * radius * 0.83;
  return new THREE.Vector3(x, elevation(x, z), z);
}

// Closed, tapered lobes expose soil and roots when the living specimen opens.
export function landGeometry(sector) {
  const around = 64,
    across = 22,
    positions = [],
    colors = [],
    indices = [];
  const a0 = (sector * TAU) / 3 + 0.015,
    a1 = ((sector + 1) * TAU) / 3 - 0.015;
  const color = new THREE.Color();
  for (let layer = 0; layer < 2; layer++) {
    for (let j = 0; j <= across; j++)
      for (let i = 0; i <= around; i++) {
        const a = a0 + ((a1 - a0) * i) / around,
          f = j / across;
        const inner = 0.27 + Math.sin(a * 4) * 0.085;
        const r = inner + (outline(a) - inner) * f;
        const p = surface(a, r);
        if (layer) {
          p.x *= 0.79;
          p.z *= 0.79;
          p.y -= 0.48 + 0.23 * Math.sin(f * Math.PI) + 0.06 * Math.cos(a * 13);
        }
        positions.push(p.x, p.y, p.z);
        if (!layer) {
          const variation =
            Math.sin(p.x * 14 + p.z * 8) * 0.035 +
            Math.sin(p.z * 27 - p.x * 9) * 0.018;
          color.setHSL(
            0.205 + 0.025 * Math.sin(a * 2),
            0.2,
            0.31 + variation + 0.07 * f,
            THREE.SRGBColorSpace,
          );
        } else
          color.setHSL(
            0.083,
            0.23,
            0.22 + 0.07 * f + 0.015 * Math.sin(a * 21),
            THREE.SRGBColorSpace,
          );
        colors.push(color.r, color.g, color.b);
        if (j < across && i < around) {
          const k = layer * (across + 1) * (around + 1) + j * (around + 1) + i;
          if (layer)
            indices.push(
              k,
              k + around + 1,
              k + 1,
              k + 1,
              k + around + 1,
              k + around + 2,
            );
          else
            indices.push(
              k,
              k + 1,
              k + around + 1,
              k + 1,
              k + around + 2,
              k + around + 1,
            );
        }
      }
  }
  const size = (across + 1) * (around + 1);
  const bridge = (a, b) => indices.push(a, a + size, b, b, a + size, b + size);
  for (let i = 0; i < around; i++) {
    bridge(i, i + 1);
    bridge(across * (around + 1) + i + 1, across * (around + 1) + i);
  }
  for (let j = 0; j < across; j++) {
    bridge((j + 1) * (around + 1), j * (around + 1));
    bridge(j * (around + 1) + around, (j + 1) * (around + 1) + around);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}
export function tube(points, radius = 0.01, segments = 48) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points),
    segments,
    radius,
    5,
    false,
  );
}
export function rootsGeometry(sector) {
  const rng = random(919 + sector),
    parts = [];
  for (let i = 0; i < 15; i++) {
    const a = ((sector + (i + 0.3) / 15) * TAU) / 3,
      r = 0.6 + rng() * 0.9,
      p = surface(a, r);
    p.y -= 0.2;
    const length = 0.5 + rng() * 0.75;
    const points = [
      p,
      new THREE.Vector3(p.x * 0.87, p.y - 0.28, p.z * 0.93),
      new THREE.Vector3(
        p.x * 0.58 + 0.12 * Math.sin(a * 5),
        p.y - length * 0.68,
        p.z * 0.7,
      ),
      new THREE.Vector3(p.x * 0.3 + 0.11, p.y - length, p.z * 0.34 - 0.08),
    ];
    parts.push(tube(points, 0.02 - rng() * 0.01, 26));
    for (let b = 0; b < 3; b++) {
      const q = points[1].clone().lerp(points[2], b / 3),
        sign = b % 2 ? 1 : -1;
      parts.push(
        tube(
          [
            q,
            q.clone().add(new THREE.Vector3(0.13 * sign, -0.12, 0.05)),
            q.clone().add(new THREE.Vector3(0.22 * sign, -0.33, rng() * 0.14)),
          ],
          0.005,
          12,
        ),
      );
    }
  }
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}
export function contoursGeometry(sector) {
  const parts = [];
  for (let n = 0; n < 12; n++) {
    const r = 0.56 + n * 0.103,
      pts = [];
    for (let j = 0; j <= 64; j++) {
      const a = ((sector + 0.06 + (j / 64) * 0.87) * TAU) / 3;
      if (r < outline(a) - 0.08) {
        const p = surface(a, r);
        p.y += 0.012;
        pts.push(p);
      }
    }
    if (pts.length > 2) parts.push(tube(pts, n % 3 === 0 ? 0.009 : 0.004, 50));
  }
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  return merged;
}

// Refractive folded water ribbons pass between the landscape and its roots.
export function waterGeometry(sector) {
  const positions = [],
    indices = [],
    uv = [],
    segments = 130,
    across = 8;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments,
      a = (sector * TAU) / 3 + t * TAU * 0.62;
    const r = 1.24 + 0.48 * Math.sin(t * Math.PI) + 0.13 * Math.cos(t * TAU);
    const y = -0.18 + Math.sin(t * TAU - 0.9) * 0.48;
    const width = Math.sin(t * Math.PI) * 0.18 + 0.018;
    for (let j = 0; j <= across; j++) {
      const side = (j / across - 0.5) * 2,
        rad = r + side * width;
      positions.push(
        Math.cos(a) * rad,
        y + side * 0.1 * Math.sin(a * 2) + (1 - side * side) * width * 0.48,
        Math.sin(a) * rad * 0.83,
      );
      uv.push(t * 3, j / across);
    }
    if (i < segments) {
      for (let j = 0; j < across; j++) {
        const k = i * (across + 1) + j;
        indices.push(k, k + across + 1, k + 1, k + 1, k + across + 1, k + across + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
export function bladeGeometry() {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        -0.035, 0, 0, 0.035, 0, 0, -0.025, 0.45, 0.04, 0.025, 0.45, 0.04, 0, 1,
        0.19,
      ],
      3,
    ),
  );
  g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4]);
  g.computeVertexNormals();
  return g;
}
