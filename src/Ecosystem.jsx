import { useMemo, useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  TAU,
  random,
  surface,
  outline,
  landGeometry,
  rootsGeometry,
  contoursGeometry,
  waterGeometry,
  bladeGeometry,
} from "./sceneGeometry";

const lerp = THREE.MathUtils.lerp;
const smooth = (a, b, x) => THREE.MathUtils.smoothstep(x, a, b);

function Studio() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new THREE.PMREMGenerator(gl),
      room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.04);
    scene.environment = target.texture;
    scene.environmentIntensity = 0.3;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Meadow({ sector, compact, time }) {
  const grass = useRef(),
    seeds = useRef(),
    leaves = useRef();
  const count = compact ? 230 : 530;
  const blade = useMemo(bladeGeometry, []);
  const shader = useMemo(() => ({ time: { value: 0 } }), []);
  useEffect(() => {
    const rng = random(1283 + sector),
      dummy = new THREE.Object3D(),
      color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const a = ((sector + 0.03 + rng() * 0.94) * TAU) / 3,
        r = 0.42 + Math.sqrt(rng()) * (outline(a) - 0.53),
        p = surface(a, r);
      const h = 0.1 + rng() * 0.18 + (Math.sin(a * 7 + r * 4) + 1) * 0.07;
      dummy.position.copy(p);
      dummy.rotation.set(
        (rng() - 0.5) * 0.35,
        rng() * TAU,
        (rng() - 0.5) * 0.35,
      );
      dummy.scale.set(0.7 + rng() * 0.4, h, 0.7);
      dummy.updateMatrix();
      grass.current.setMatrixAt(i, dummy.matrix);
      color.setHSL(
        0.17 + rng() * 0.065,
        0.24 + rng() * 0.13,
        0.25 + rng() * 0.2,
        THREE.SRGBColorSpace,
      );
      grass.current.setColorAt(i, color);
    }
    for (let i = 0; i < 54; i++) {
      const a = ((sector + 0.1 + rng() * 0.8) * TAU) / 3,
        r = 0.6 + rng() * 0.95,
        p = surface(a, r);
      dummy.position.copy(p);
      dummy.position.y += 0.2 + rng() * 0.08;
      dummy.rotation.set(0.25, rng() * TAU, 0.4);
      dummy.scale.set(0.018, 0.054, 0.018);
      dummy.updateMatrix();
      seeds.current.setMatrixAt(i, dummy.matrix);
      color.setHSL(
        0.12 + rng() * 0.025,
        0.28,
        0.48 + rng() * 0.2,
        THREE.SRGBColorSpace,
      );
      seeds.current.setColorAt(i, color);
    }
    for (let i = 0; i < 70; i++) {
      const a = ((sector + 0.04 + rng() * 0.9) * TAU) / 3,
        r = 0.38 + rng() * 1.22,
        p = surface(a, r);
      dummy.position.copy(p);
      dummy.position.y += 0.035;
      dummy.rotation.set(-0.4 + rng() * 0.7, rng() * TAU, -0.2 + rng() * 0.4);
      dummy.scale.set(0.045 + rng() * 0.035, 0.022, 0.07 + rng() * 0.04);
      dummy.updateMatrix();
      leaves.current.setMatrixAt(i, dummy.matrix);
      color.setHSL(
        0.2 + rng() * 0.045,
        0.25,
        0.22 + rng() * 0.14,
        THREE.SRGBColorSpace,
      );
      leaves.current.setColorAt(i, color);
    }
    for (const ref of [grass, seeds, leaves]) {
      ref.current.instanceMatrix.needsUpdate = true;
      ref.current.instanceColor.needsUpdate = true;
      ref.current.computeBoundingSphere();
    }
  }, [sector, compact, count]);
  useEffect(() => () => blade.dispose(), [blade]);
  useFrame(() => {
    shader.time.value = time.current;
  });
  return (
    <>
      <instancedMesh
        ref={grass}
        args={[blade, null, count]}
        frustumCulled={false}
      >
        <meshStandardMaterial
          roughness={0.88}
          side={THREE.DoubleSide}
          onBeforeCompile={(s) => {
            s.uniforms.uMeadowTime = shader.time;
            s.vertexShader = "uniform float uMeadowTime;\n" + s.vertexShader;
            s.vertexShader = s.vertexShader.replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\ntransformed.x += sin(uMeadowTime*.7 + instanceMatrix[3].x*3. + instanceMatrix[3].z*4.) * .07 * pow(position.y, 2.);",
            );
          }}
        />
      </instancedMesh>
      <instancedMesh ref={seeds} args={[null, null, 54]}>
        <sphereGeometry args={[1, 5, 7]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={leaves} args={[null, null, 70]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.84} />
      </instancedMesh>
    </>
  );
}

function Spores({ compact, time, phase, pointer }) {
  const positions = useMemo(() => {
    const rng = random(69),
      v = [];
    for (let i = 0; i < (compact ? 45 : 100); i++) {
      const a = rng() * TAU,
        r = 1.6 + rng() * 1.2;
      v.push(Math.cos(a) * r, (rng() - 0.35) * 2, Math.sin(a) * r * 0.75);
    }
    return new Float32Array(v);
  }, [compact]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPhase: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uDpr: { value: Math.min(devicePixelRatio, 1.5) },
    }),
    [],
  );
  useFrame(() => {
    uniforms.uTime.value = time.current;
    uniforms.uPhase.value = phase.current;
    uniforms.uPointer.value.copy(pointer.current);
  });
  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        transparent
        depthWrite={false}
        vertexShader={
          "uniform float uTime,uPhase,uDpr; uniform vec2 uPointer; varying float vAlpha; void main(){vec3 p=position; p.y+=sin(uTime*.18+p.x*2.)*.09; p.x+=cos(uTime*.13+p.z)*.045; vec2 d=p.xy-uPointer*vec2(2.8,1.8); p.xy+=normalize(d+.001)*exp(-dot(d,d)*1.5)*.13; p*=1.+sin(uPhase*.8)*.07; vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=clamp(13./-mv.z,1.3,3.)*uDpr;vAlpha=.22+.16*sin(position.x*8.+position.z*5.);}"
        }
        fragmentShader={
          "varying float vAlpha;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.39,.46,.32,vAlpha*(1.-smoothstep(.2,.5,d)));}"
        }
      />
    </points>
  );
}

function LivingSystem({ progress, paused, compact }) {
  const root = useRef(),
    lobes = useRef([]),
    waters = useRef([]),
    waterMaterials = useRef([]),
    paths = useRef(),
    beads = useRef([]),
    light = useRef(),
    rim = useRef();
  const clock = useRef(0),
    phase = useRef(0),
    pointer = useRef(new THREE.Vector2()),
    targetPointer = useRef(new THREE.Vector2());
  const { camera, gl } = useThree();
  const asset = useMemo(
    () => ({
      terrain: [0, 1, 2].map(landGeometry),
      roots: [0, 1, 2].map(rootsGeometry),
      contours: [0, 1, 2].map(contoursGeometry),
      ribbons: [0, 1, 2].map(waterGeometry),
    }),
    [],
  );
  const curvePoints = useMemo(() => new Float32Array(6 * 33 * 3), []);
  const nodes = useMemo(
    () => Array.from({ length: 6 }, () => new THREE.Vector3()),
    [],
  );
  const aim = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const move = (e) => {
      if (!fine.matches) return;
      const r = gl.domElement.getBoundingClientRect();
      targetPointer.current.set(
        THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1),
        THREE.MathUtils.clamp(1 - ((e.clientY - r.top) / r.height) * 2, -1, 1),
      );
    };
    const leave = () => targetPointer.current.set(0, 0);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [gl]);
  useEffect(
    () => () => {
      Object.values(asset)
        .flat()
        .forEach((x) => x.dispose());
    },
    [asset],
  );
  useFrame((_, dt) => {
    if (paused) return;
    const delta = Math.min(dt, 0.05),
      ease = 1 - Math.exp(-delta * 3.2);
    clock.current += delta;
    phase.current = lerp(phase.current, progress.current, ease);
    const p = phase.current,
      t = clock.current;
    const environment = smooth(1, 2, p),
      people = smooth(2, 3, p),
      cycle = smooth(3, 4, p);
    pointer.current.lerp(targetPointer.current, ease * 0.8);
    const px = pointer.current.x,
      py = pointer.current.y;
    root.current.rotation.set(
      0.03 + py * 0.028,
      -0.3 + environment * 0.3 - people * 0.22 + cycle * 0.2 + px * 0.055,
      0.02 - people * 0.03,
    );
    root.current.position.y = Math.sin(t * 0.38) * 0.025;
    root.current.scale.setScalar(
      (compact ? 0.88 : 1) *
        (1 - environment * 0.09 + people * 0.02 - cycle * 0.04),
    );
    camera.position.lerp(
      aim.set(
        0.15 + environment * 0.48 - people * 0.65 + px * 0.12,
        3.25 - environment * 0.5 - people * 0.3 + cycle * 0.55,
        6.85 + environment * 0.3 + people * 0.15,
      ),
      ease,
    );
    camera.lookAt(0, -0.08 + py * 0.025, 0);
    for (let i = 0; i < 3; i++) {
      const a = ((i + 0.5) * TAU) / 3,
        spread = environment * 0.43 - people * 0.12 + cycle * 0.28;
      const l = lobes.current[i];
      l.position.set(
        Math.cos(a) * spread,
        0.28 +
          (i === 1 ? 0.07 : 0) +
          environment * (i === 1 ? 0.32 : -0.1) +
          people * (i === 0 ? 0.22 : -0.12) +
          cycle * Math.sin(a) * 0.43,
        Math.sin(a) * spread * 0.8,
      );
      l.rotation.set(
        environment * 0.05 * Math.sin(a) + cycle * 0.09,
        environment * (i - 1) * 0.055,
        environment * 0.04 * Math.cos(a),
      );
      l.scale.setScalar(1 - cycle * 0.15);
      const w = waters.current[i];
      w.rotation.y = environment * 0.12 + cycle * 0.65;
      w.rotation.z = people * 0.07 * Math.sin(a);
      w.position.y = environment * 0.12 - people * 0.08 + cycle * 0.16;
      w.scale.setScalar(1 + environment * 0.17 + cycle * 0.1);
      waterMaterials.current[i].roughness =
        0.13 - environment * 0.045 + people * 0.035;
      waterMaterials.current[i].envMapIntensity =
        0.45 + environment * 0.25 + Math.abs(px) * 0.1;
    }
    // The same six points become a human network, then a closed life-cycle path.
    for (let i = 0; i < 6; i++) {
      const a = (i * TAU) / 6 + 0.2;
      const x = Math.cos(a) * (2.05 + people * 0.16),
        y = Math.sin(a * 2) * 0.48 - 0.17,
        z = Math.sin(a) * 1.45;
      nodes[i].set(
        lerp(x, Math.cos(a) * 2.22, cycle),
        lerp(y, Math.sin(a) * 1.12, cycle),
        lerp(z, Math.sin(a) * 0.75, cycle),
      );
      beads.current[i].position.copy(nodes[i]);
      beads.current[i].scale.setScalar(0.032 + people * 0.022 + cycle * 0.012);
    }
    const pos = paths.current.geometry.attributes.position;
    for (let edge = 0; edge < 6; edge++)
      for (let j = 0; j < 33; j++) {
        const s = j / 32,
          start = nodes[edge],
          end = nodes[(edge + 1) % 6],
          k = (edge * 33 + j) * 3,
          bow = Math.sin(s * Math.PI);
        curvePoints[k] = lerp(start.x, end.x, s) * (1 + cycle * bow * 0.14);
        curvePoints[k + 1] =
          lerp(start.y, end.y, s) + bow * (0.3 + people * 0.12);
        curvePoints[k + 2] = lerp(start.z, end.z, s) - bow * 0.22;
      }
    pos.needsUpdate = true;
    paths.current.material.opacity = 0.13 + people * 0.28 + cycle * 0.15;
    light.current.position.set(3 + px * 0.65, 5 + py * 0.35, 3.5);
    light.current.intensity = 1.6 + environment * 0.25;
    rim.current.intensity = 0.7 + environment * 0.25 + cycle * 0.15;
  });
  return (
    <>
      <Studio />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={["#fff8e7", "#7e856d", 0.6]} />
      <directionalLight
        ref={light}
        position={[3, 5, 3.5]}
        intensity={2.3}
        color="#fff3d5"
      />
      <directionalLight
        ref={rim}
        position={[-3, 2, -4]}
        intensity={1.1}
        color="#c5dae0"
      />
      <group ref={root}>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            ref={(el) => (lobes.current[i] = el)}
            position={[0, 0.28, 0]}
          >
            <mesh geometry={asset.terrain[i]}>
              <meshStandardMaterial
                vertexColors
                roughness={0.92}
                metalness={0.025}
              />
            </mesh>
            <mesh geometry={asset.contours[i]}>
              <meshStandardMaterial color="#b7ab78" roughness={0.8} />
            </mesh>
            <mesh geometry={asset.roots[i]}>
              <meshStandardMaterial
                color="#9c8b65"
                roughness={0.62}
                metalness={0.12}
              />
            </mesh>
            <Meadow sector={i} compact={compact} time={clock} />
          </group>
        ))}
        {[0, 1, 2].map((i) => (
          <group key={i} ref={(el) => (waters.current[i] = el)}>
            <mesh geometry={asset.ribbons[i]}>
              <meshPhysicalMaterial
                ref={(el) => (waterMaterials.current[i] = el)}
                color="#91b1aa"
                roughness={0.13}
                metalness={0.08}
                transmission={compact ? 0.2 : 0.46}
                thickness={0.3}
                ior={1.33}
                clearcoat={1}
                clearcoatRoughness={0.08}
                side={THREE.DoubleSide}
                attenuationColor="#7b9b8f"
                attenuationDistance={0.9}
              />
            </mesh>
          </group>
        ))}
        <line ref={paths} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[curvePoints, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#8b9c80"
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </line>
        {nodes.map((_, i) => (
          <mesh key={i} ref={(el) => (beads.current[i] = el)} scale={0.04}>
            <sphereGeometry args={[1, 12, 12]} />
            <meshPhysicalMaterial
              color={i % 2 ? "#b5c8b4" : "#c9ba8d"}
              metalness={0.38}
              roughness={0.21}
              clearcoat={1}
            />
          </mesh>
        ))}
        <Spores
          compact={compact}
          time={clock}
          phase={phase}
          pointer={pointer}
        />
      </group>
    </>
  );
}

export default function Ecosystem({ progress, paused, onError }) {
  const [compact, setCompact] = useState(() => innerWidth < 760);
  useEffect(() => {
    const mq = matchMedia("(max-width: 760px)");
    const change = () => setCompact(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  return (
    <Canvas
      dpr={[1, compact ? 1 : 1.35]}
      camera={{ position: [0.15, 3.25, 6.85], fov: 37 }}
      gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
      frameloop={paused ? "never" : "always"}
      onCreated={({ gl }) => {
        gl.transmissionResolutionScale = 0.5;
        gl.setClearColor("#f5f3eb", 0);
        gl.domElement.addEventListener("webglcontextlost", onError, {
          once: true,
        });
      }}
    >
      <LivingSystem progress={progress} paused={paused} compact={compact} />
    </Canvas>
  );
}
