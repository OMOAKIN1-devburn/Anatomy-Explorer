import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ComponentRef, ErrorInfo, ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, useAnimations, useGLTF, useProgress } from '@react-three/drei';
import { Box3, Group, MathUtils, Vector3 } from 'three';
import type { Mesh, MeshStandardMaterial } from 'three';
import type { Hotspot, SpeciesRecord } from '@/data/species';
import { clone as cloneModel } from 'three/examples/jsm/utils/SkeletonUtils.js';

// Camera limits shared by the mouse wheel and the +/- buttons.
const MIN_DISTANCE = 2.1;
const MAX_DISTANCE = 8;
// Every model is scaled so its longest side is about this many scene units.
const MODEL_TARGET_SIZE = 2.6;
// The floor of the model sits at this height so it appears to stand on the stage.
const GROUND_Y = -1.15;

// Set to true only while fine-tuning dots: clicking the model copies a position line.
const HOTSPOT_PLACEMENT_MODE = false;

export type ViewerCommandType = 'zoomIn' | 'zoomOut' | 'reset';
/** The id changes on every click so pressing the same button twice still fires. */
export type ViewerCommand = { type: ViewerCommandType; id: number } | null;

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>;

type SpecimenViewerProps = {
  species: SpeciesRecord;
  command: ViewerCommand;
  attempt: number;
  selectedId: string | null;
  onSelect: (hotspotId: string) => void;
  onRetry: () => void;
};

export function SpecimenViewer({ species, command, attempt, selectedId, onSelect, onRetry }: SpecimenViewerProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = wrapRef.current;
    if (!element) return;
    // A plain mouse wheel scrolls the page. Hold Ctrl to zoom the model.
    const block = (event: WheelEvent) => {
      if (!event.ctrlKey) event.stopPropagation();
    };
    element.addEventListener('wheel', block, { capture: true });
    return () => element.removeEventListener('wheel', block, { capture: true });
  }, [species.id, attempt]);
  const handleReset = () => {
    // useGLTF caches results, even failed ones, so clear the cache before retrying.
    if (species.modelPath) useGLTF.clear(species.modelPath);
    onRetry();
  };
  const selected = species.hotspots?.find((hotspot) => hotspot.id === selectedId);

  return (
    <ViewerErrorBoundary key={`${species.id}-${attempt}`} species={species} onReset={handleReset}>
      <div ref={wrapRef} className="absolute inset-0 z-[1]">
        <ModelCanvas species={species} command={command} selectedId={selectedId} onSelect={onSelect} />
        {selected && (
          <div className="absolute left-3 top-3 z-10 max-w-[250px] rounded-lg border border-[#e5ad59]/40 bg-[#0c0f18]/90 px-3 py-2 text-xs leading-5 text-[#e9e2d5]">
            <strong className="text-[#e8b56c]">{selected.name}.</strong> {selected.note}
          </div>
        )}
      </div>
    </ViewerErrorBoundary>
  );
}

/** Loads the species' model, fits it on the stage, and places the clickable dots on it. */
function SpecimenModel({ species, selectedId, onSelect }: { species: SpeciesRecord; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  const { scene: cachedScene, animations } = useGLTF(species.modelPath!);
  const scene = useMemo(() => cloneModel(cachedScene), [cachedScene]);
  const { actions } = useAnimations(animations, scene);
  const groupRef = useRef<Group>(null);
  const [pinsReady, setPinsReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setPinsReady(true), 200);
    return () => clearTimeout(timer)
  }, []);

  // Play the clip by its authored name. If the file has no such clip the model simply stays still.
  useEffect(() => {
    const clip = actions[species.idleClip ?? 'idle'];
  // clip?.reset().fadeIn(0.25).play();
    return () => { clip?.fadeOut(0.2); };
  }, [actions, species.idleClip]);

  // Rigged models only: make shiny or glowing materials matte so colours show properly.
  // It also prints a material report in the F12 console to help find colour problems.
  useEffect(() => {
    if (!species.preciseFit) return;
    const report: Record<string, string | number | boolean>[] = [];
    scene.traverse((object) => {
      const mesh = object as Mesh;
      if (!mesh.isMesh) return;
      const list = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      for (const item of list) {
        const material = item as MeshStandardMaterial;
        report.push({
          mesh: mesh.name,
          material: material.name,
          hasTexture: Boolean(material.map),
          color: material.color ? material.color.getHexString() : 'none',
          metalness: material.metalness,
          roughness: material.roughness,
          transparent: material.transparent,
        });
        if (material.metalness !== undefined) material.metalness = Math.min(material.metalness, 0.1);
        if (material.roughness !== undefined) material.roughness = Math.max(material.roughness, 0.8);
        material.emissive?.set(0x000000);
        material.needsUpdate = true;
      }
    });
    console.log(`[materials] ${species.id}`, report);
  }, [scene, species.id, species.preciseFit]);

  // Turn the model to face the viewer, measure it, and work out the scale and
  // offset that fit it on the stage. Dot positions are fractions of this box.
  const fit = useMemo(() => {
    scene.rotation.y = species.rotationY ?? 0;
    scene.updateMatrixWorld(true);
    const box = new Box3().setFromObject(scene, species.preciseFit === true);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const longestSide = Math.max(size.x, size.y, size.z) || 1;
    const scale = MODEL_TARGET_SIZE / longestSide;
    const position: [number, number, number] = [
      -center.x * scale,
      GROUND_Y - box.min.y * scale,
      -center.z * scale,
    ];
    return { scale, position, box };
  }, [scene, species.rotationY, species.preciseFit]);

  // Placement helper: turns a click on the model into numbers for species.ts.
  const handleModelClick = (event: ThreeEvent<MouseEvent>) => {
    if (!HOTSPOT_PLACEMENT_MODE || !groupRef.current || !event.face) return;
    event.stopPropagation();
    const local = groupRef.current.worldToLocal(event.point.clone());
    const size = fit.box.getSize(new Vector3());
    const round = (value: number) => Math.round(value * 100) / 100;
    const position = [
      (local.x - fit.box.min.x) / size.x,
      (local.y - fit.box.min.y) / size.y,
      (local.z - fit.box.min.z) / size.z,
    ].map(round);
    const normal = event.face.normal.clone().transformDirection(event.object.matrixWorld);
    const line = `position: [${position.join(', ')}], normal: [${[normal.x, normal.y, normal.z].map(round).join(', ')}],`;
    console.log(`[${species.id}] ${line}`);
    navigator.clipboard?.writeText(line).catch(() => {});
  };

  return (
    <group ref={groupRef} position={fit.position} scale={fit.scale}>
      <primitive object={scene} onClick={handleModelClick} />
      {pinsReady && (
      <HotspotPins hotspots={species.hotspots ?? []} box={fit.box} selectedId={selectedId} onSelect={onSelect} />
      )}
    </group>
  );
}

/**
 * Draws the dots. A dot with mirror: true also appears on the other side of the
 * body. Every frame, a dot whose surface faces away from the camera is hidden.
 */
function HotspotPins({ hotspots, box, selectedId, onSelect }: { hotspots: Hotspot[]; box: Box3; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  const camera = useThree((state) => state.camera);
  const groupRef = useRef<Group>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scratch = useMemo(() => ({ world: new Vector3(), toCamera: new Vector3() }), []);

  const pins = useMemo(() => {
    const size = box.getSize(new Vector3());
    const place = (hotspot: Hotspot, flip: boolean) => {
      const [px, py, pz] = hotspot.position;
      const [nx, ny, nz] = hotspot.normal;
      return {
        key: flip ? `${hotspot.id}-mirror` : hotspot.id,
        hotspot,
        position: new Vector3(
          box.min.x + size.x * (flip ? 1 - px : px),
          box.min.y + size.y * py,
          box.min.z + size.z * pz,
        ),
        normal: new Vector3(flip ? -nx : nx, ny, nz).normalize(),
      };
    };
    return hotspots.flatMap((hotspot) =>
      hotspot.mirror ? [place(hotspot, false), place(hotspot, true)] : [place(hotspot, false)],
    );
  }, [hotspots, box]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    for (const pin of pins) {
      const element = pinRefs.current[pin.key];
      if (!element) continue;
      group.localToWorld(scratch.world.copy(pin.position));
      scratch.toCamera.copy(camera.position).sub(scratch.world);
      // Positive dot product means the surface faces the camera.
      const facing = scratch.toCamera.dot(pin.normal) > 0;
      const value = facing ? '1' : '0';
      if (element.dataset.visible !== value) {
        element.dataset.visible = value;
        element.style.opacity = value;
        element.style.pointerEvents = facing ? 'auto' : 'none';
      }
    }
  });

  return (
    <group ref={groupRef}>
      {pins.map(({ key, hotspot, position }) => {
        const selected = selectedId === hotspot.id;
        return (
          <Html key={key} position={position} center zIndexRange={[20, 0]}>
            <button
              type="button"
              ref={(element) => { pinRefs.current[key] = element; }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelect(hotspot.id)}
              aria-label={`${hotspot.name}: show explanation`}
              title={hotspot.name}
              className="hotspot-pin grid h-10 w-10 place-items-center transition-opacity"
            >
              {selected && <span className="absolute h-10 w-10 animate-ping rounded-full bg-[#e5ad59]/40" />}
              <span className={`relative rounded-full border-2 border-[#151a1b] ${selected ? 'h-6 w-6 bg-white' : 'h-5 w-5 bg-[#e5ad59]'}`} />
            </button>
          </Html>
        );
      })}
    </group>
  );
}

/**
 * Runs inside the Canvas so it can reach the camera. It reacts to the +/-/reset
 * buttons by moving the camera along its line to the orbit target.
 */
function CameraCommands({ command, controlsRef }: { command: ViewerCommand; controlsRef: RefObject<OrbitControlsHandle | null> }) {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!command || !controls) return;

    if (command.type === 'reset') {
      controls.reset();
      controls.update(); // applies the reset immediately, so nothing keeps drifting
      return;
    }

    const factor = command.type === 'zoomIn' ? 0.8 : 1.25;
    const offset = camera.position.clone().sub(controls.target);
    offset.setLength(MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE));
    camera.position.copy(controls.target).add(offset);
    controls.update();
  }, [command, camera, controlsRef]);

  return null;
}

function LoadingLabel() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="whitespace-nowrap rounded-md border border-white/10 bg-[#111617]/90 px-3 py-2 text-xs text-[#d8d1c2]">
        <i className="fa-solid fa-circle-notch fa-spin mr-2" aria-hidden="true" />Preparing specimen… {Math.round(progress)}%
      </div>
    </Html>
  );
}

function ModelCanvas({ species, command, selectedId, onSelect }: { species: SpeciesRecord; command: ViewerCommand; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  const controlsRef = useRef<OrbitControlsHandle>(null);
  const boost = species.lightBoost ?? 1;

  return (
    <Canvas camera={{ position: [0, 1.1, 4.8], fov: 38 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.55 * boost} />
      <directionalLight position={[3, 5, 4]} intensity={1.1 * boost} />
      <directionalLight position={[-4, 1, -2]} intensity={0.45 * boost} color="#d49a53" />
      {boost > 1 && <directionalLight position={[0, 2, 6]} intensity={0.6 * boost} />}
      <Suspense fallback={<LoadingLabel />}>
        <SpecimenModel species={species} selectedId={selectedId} onSelect={onSelect} />
      </Suspense>
      <OrbitControls ref={controlsRef} enablePan={false} enableDamping={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} target={[0, 0, 0]} />
      <CameraCommands command={command} controlsRef={controlsRef} />
    </Canvas>
  );
}

type BoundaryProps = { children: ReactNode; species: SpeciesRecord; onReset: () => void };
type BoundaryState = { failed: boolean; graphicsUnavailable: boolean };

class ViewerErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false, graphicsUnavailable: false };

  static getDerivedStateFromError(error: Error): BoundaryState {
    const graphicsUnavailable = /webgl|graphics context/i.test(error.message);
    return { failed: true, graphicsUnavailable };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // The panel below shows the learner a recovery message instead.
  }

  render() {
    if (this.state.failed) {
      const { species, onReset } = this.props;
      return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[#151a1b] px-6 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-[#714e43] bg-[#352622] text-[#e6a18c]">
            <i className="fa-solid fa-circle-exclamation text-[length:calc(20px*var(--phone-boost)*var(--text-scale))]" aria-hidden="true" />
          </div>
          <p className="text-sm font-semibold text-[#e9e2d5]">
            {this.state.graphicsUnavailable ? '3D graphics are unavailable' : 'This model could not be opened'}
          </p>
          <p className="max-w-xs text-xs leading-5 text-[#a9ada8]">
            {this.state.graphicsUnavailable
              ? 'This browser could not create a WebGL context. Try a browser with graphics acceleration enabled.'
              : `Check that ${species.modelPath} is a valid glTF file, then try again.`}
          </p>
          <button onClick={onReset} className="mt-1 rounded-md border border-white/15 px-3 py-2 text-xs hover:bg-white/5" data-testid="button-retry-model">
            <i className="fa-solid fa-rotate-right mr-2" aria-hidden="true" />Retry model
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}