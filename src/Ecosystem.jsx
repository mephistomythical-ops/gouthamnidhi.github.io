import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A sculptural food-system cross-section: cultivated terrain, water, soil and flows.
function terrain(radius = 2, depth = 0.35, seed = 0) {
  const n = 112,
    rings = 16,
    vertices = [],
    indices = [],
    colors = [];
  const color = new THREE.Color();
  for (let j = 0; j <= rings; j++)
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2,
        f = j / rings;
      const edge =
        radius *
        (1 + 0.075 * Math.sin(a * 3 + 0.7) + 0.055 * Math.cos(a * 5 + seed));
      const x = Math.cos(a) * edge * f,
        z = Math.sin(a) * edge * f * 0.74;
      const h =
        (Math.sin(x * 2.6 + seed) * 0.12 + Math.cos(z * 3 + x) * 0.075) *
        Math.sin(f * Math.PI * 0.7);
      vertices.push(x, h, z);
      const shade =
        0.4 + 0.12 * Math.sin(x * 9 + z * 1.4) + 0.12 * Math.sin(z * 3);
      color.setHSL(0.21 + 0.02 * Math.sin(x * 3), 0.24, shade);
      colors.push(color.r, color.g, color.b);
      if (j < rings && i < n) {
        const k = j * (n + 1) + i;
        indices.push(k, k + 1, k + n + 1, k + 1, k + n + 2, k + n + 1);
      }
    }
  // Organic edge falls to a second surface, giving the specimen real depth.
  const rim = vertices.length / 3;
  for (let i = 0; i <= n; i++) {
    const k = (rings * (n + 1) + i) * 3;
    vertices.push(
      vertices[k] * 0.98,
      vertices[k + 1] - depth,
      vertices[k + 2] * 0.98,
    );
    colors.push(0.3, 0.25, 0.18);
    if (i < n) {
      const t = rings * (n + 1) + i;
      indices.push(t, rim + i, t + 1, t + 1, rim + i, rim + i + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
function tube(points, radius = 0.018) {
  return new THREE.TubeGeometry(
    new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))),
    72,
    radius,
    6,
    false,
  );
}
function Specimen({ progress, focus, paused, compact }) {
  const root = useRef(),
    land = useRef(),
    water = useRef(),
    soil = useRef(),
    threads = useRef();
  const geos = useMemo(() => {
    const ridges = [];
    for (let k = -8; k <= 8; k++) {
      const z = k * 0.137,
        width = Math.sqrt(Math.max(0.1, 1 - (z / 1.28) ** 2)) * 1.68;
      const points = [];
      for (let i = 0; i <= 35; i++) {
        const x = -width + (2 * width * i) / 35;
        points.push([
          x,
          0.09 + Math.sin(x * 2.6) * 0.12 + Math.cos(z * 3 + x) * 0.075,
          z + 0.025 * Math.sin(x * 2),
        ]);
      }
      ridges.push(tube(points, 0.022));
    }
    const flows = [];
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2;
      flows.push(
        tube(
          [
            [Math.cos(a) * 1.5, 0.03, Math.sin(a) * 1],
            [Math.cos(a + 0.3) * 1.7, -0.45, Math.sin(a + 0.3) * 1.2],
            [Math.cos(a - 0.25) * 1.3, -0.92, Math.sin(a - 0.25) * 0.9],
            [Math.cos(a) * 0.5, -1.18, Math.sin(a) * 0.4],
          ],
          0.008,
        ),
      );
    }
    const orbit = tube(
      Array.from({ length: 81 }, (_, i) => {
        const a = (i / 80) * Math.PI * 2;
        return [
          Math.cos(a) * 2.6,
          Math.sin(a * 2) * 0.22 - 0.2,
          Math.sin(a) * 1.9,
        ];
      }),
      0.006,
    );
    return {
      top: terrain(1.97, 0.22, 0),
      bottom: terrain(1.88, 0.3, 1),
      water: terrain(2.04, 0.045, 2),
      ridges,
      flows,
      orbit,
    };
  }, []);
  useEffect(
    () => () => {
      Object.values(geos)
        .flat()
        .forEach((g) => g.dispose());
    },
    [geos],
  );
  useFrame((state, delta) => {
    if (!root.current) return;
    const t = state.clock.elapsedTime,
      ease = 1 - Math.exp(-delta * 3),
      p = progress.current;
    root.current.rotation.y = THREE.MathUtils.lerp(
      root.current.rotation.y,
      -0.4 +
        (!paused ? Math.sin(t * 0.11) * 0.13 : 0) +
        state.pointer.x * 0.08 +
        p * 0.65,
      ease,
    );
    root.current.rotation.x = THREE.MathUtils.lerp(
      root.current.rotation.x,
      0.24 + state.pointer.y * 0.025,
      ease,
    );
    root.current.position.y = paused ? 0 : Math.sin(t * 0.5) * 0.045;
    const separation =
      Math.min(p * 1.3, 1) * 0.75 + (focus === "all" ? 0 : 0.24);
    land.current.position.y = THREE.MathUtils.lerp(
      land.current.position.y,
      0.45 + separation + (focus === "food" ? 0.18 : 0),
      ease,
    );
    water.current.position.y = THREE.MathUtils.lerp(
      water.current.position.y,
      -0.04 + (focus === "environment" ? 0.12 : 0),
      ease,
    );
    soil.current.position.y = THREE.MathUtils.lerp(
      soil.current.position.y,
      -0.52 - separation + (focus === "people" ? 0.12 : 0),
      ease,
    );
    threads.current.scale.y = 1 + separation * 0.8;
  });
  return (
    <group ref={root} scale={compact ? 0.87 : 1}>
      <group ref={land} position={[0, 0.45, 0]}>
        <mesh geometry={geos.top}>
          <meshStandardMaterial
            vertexColors
            roughness={0.86}
            side={THREE.DoubleSide}
          />
        </mesh>
        {geos.ridges.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial
              color={i % 3 === 0 ? "#c7bb79" : "#8f9c62"}
              roughness={0.9}
            />
          </mesh>
        ))}
        {Array.from({ length: 28 }, (_, i) => {
          const a = i * 2.399,
            r = 0.34 + Math.sqrt(i / 28) * 1.3;
          return (
            <group
              key={i}
              position={[Math.cos(a) * r, 0.13, Math.sin(a) * r * 0.69]}
            >
              <mesh position={[0, 0.12, 0]} scale={[0.025, 0.14, 0.025]}>
                <cylinderGeometry args={[0.8, 1, 1, 5]} />
                <meshStandardMaterial color="#91856a" />
              </mesh>
              <mesh position={[0, 0.27, 0]} scale={[0.1, 0.18, 0.09]}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial
                  color={i % 2 ? "#647451" : "#879261"}
                  roughness={1}
                />
              </mesh>
            </group>
          );
        })}
      </group>
      <group ref={water} position={[0, -0.04, 0]}>
        <mesh geometry={geos.water}>
          <meshPhysicalMaterial
            color="#7fa8b4"
            metalness={0.27}
            roughness={0.13}
            transparent
            opacity={0.72}
            clearcoat={1}
            side={THREE.DoubleSide}
          />
        </mesh>
        {[1.2, 1.45, 1.7].map((r, i) => (
          <mesh
            key={r}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0.035, 0]}
            scale={[1, 0.73, 1]}
          >
            <torusGeometry args={[r, 0.009, 6, 80]} />
            <meshStandardMaterial
              color="#dce8e2"
              transparent
              opacity={0.6 - i * 0.1}
            />
          </mesh>
        ))}
      </group>
      <group ref={soil} position={[0, -0.52, 0]}>
        <mesh geometry={geos.bottom}>
          <meshStandardMaterial
            color="#806653"
            roughness={0.94}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          geometry={geos.bottom}
          position={[0, -0.2, 0]}
          scale={[0.9, 1, 0.9]}
        >
          <meshStandardMaterial
            color="#b0a18a"
            roughness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
      <group ref={threads} position={[0, 0.35, 0]}>
        {geos.flows.map((g, i) => (
          <mesh key={i} geometry={g}>
            <meshStandardMaterial
              color={i % 2 ? "#b9a472" : "#b4c6bc"}
              metalness={0.45}
              roughness={0.4}
            />
          </mesh>
        ))}
      </group>
      <mesh geometry={geos.orbit} rotation={[0, 0, -0.18]}>
        <meshBasicMaterial color="#9eac9d" transparent opacity={0.6} />
      </mesh>
      {[
        [2.45, 0.23, 0.5],
        [-2.1, -0.6, -0.8],
        [1, -0.5, 1.6],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshStandardMaterial
            color={i === 1 ? "#c5ad72" : "#90a89d"}
            metalness={0.3}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}
export default function Ecosystem({ progress, focus, paused, onError }) {
  const [compact, setCompact] = useState(() => window.innerWidth < 760);
  useEffect(() => {
    const handler = () => setCompact(window.innerWidth < 760);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return (
    <Canvas
      dpr={[1, compact ? 1.15 : 1.5]}
      camera={{ position: [0, 3.7, 6.8], fov: 37 }}
      gl={{ alpha: true, antialias: !compact, powerPreference: "low-power" }}
      frameloop={paused ? "demand" : "always"}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", onError, {
          once: true,
        });
        gl.setClearColor("#f5f3eb", 0);
      }}
    >
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#f8f5e9", "#8b8977", 1.1]} />
      <directionalLight position={[3, 6, 4]} intensity={2.7} color="#fff7de" />
      <directionalLight
        position={[-4, 2, -3]}
        intensity={0.8}
        color="#c5dbe8"
      />
      <Specimen
        progress={progress}
        focus={focus}
        paused={paused}
        compact={compact}
      />
    </Canvas>
  );
}
