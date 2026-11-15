import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ComponentRef, ErrorInfo, ReactNode, RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Box3, Group, MathUtils, Vector3 } from 'three';
import type { Hotspot, SpeciesRecord } from '@/data/species';

// Camera limits shared by the mouse wheel (OrbitControls) and the +/- buttons.
const MIN_DISTANCE = 2.1;
const MAX_DISTANCE = 8;
// Every model is scaled so its longest side is about this many scene units.
const MODEL_TARGET_SIZE = 2.6;
// The floor of the model sits at this height so it appears to stand on the stage.
const GROUND_Y = -1.15;

// Set to true while placing dots: click the model and the browser console prints
// a position and normal you can paste into species.ts. Set back to false when done.
const HOTSPOT_PLACEMENT_MODE = true;

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

/**
 * Owns the 3D canvas and its recovery boundary, so a WebGL or GLB error
 * cannot take down the rest of the museum interface.
 */
export function SpecimenViewer({ species, command, attempt, selectedId, onSelect, onRetry }: SpecimenViewerProps) {
  const handleReset = () => {
    // useGLTF caches results, even failed ones, so clear the cache before retrying.
    if (species.modelPath) useGLTF.clear(species.modelPath);
    onRetry();
  };

  const selected = species.hotspots?.find((h) => h.id === selectedId);
  return (
    // The key remounts the whole viewer when the species changes or a retry happens.
    <ViewerErrorBoundary key={`${species.id}-${attempt}`} species={species} onReset={handleReset}>
      <div className="absolute inset-0 z-[1]">
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

/** Loads the species' GLB, fits it on the stage, and places the clickable dots on it. */
function SpecimenModel({ species, selectedId, onSelect }: { species: SpeciesRecord; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  // The viewer is only rendered once modelPath has been checked, so the "!" is safe.
  const { scene, animations } = useGLTF(species.modelPath!);
  const { actions } = useAnimations(animations, scene);
  const groupRef = useRef<Group>(null);

  // Play the clip by its authored name. If the file has no such clip the model simply stays still.
  useEffect(() => {
    const clip = actions[species.idleClip ?? 'idle'];
    clip?.reset().fadeIn(0.25).play();
    return () => { clip?.fadeOut(0.2); };
  }, [actions, species.idleClip]);

  // Measure the model once and work out the scale and offset that fit it on the
  // stage. The box is kept because dot positions are stored as fractions of it.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene, species.hotspotSpace === 'model');
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
  }, [scene]);

  // Placement helper: turns a click on the model into numbers for species.ts.
  const handleModelClick = (event: ThreeEvent<MouseEvent>) => {
  if (!HOTSPOT_PLACEMENT_MODE || !groupRef.current || !event.face) return;
  event.stopPropagation();
  const local = groupRef.current.worldToLocal(event.point.clone());
  const size = fit.box.getSize(new Vector3());
  const round = (value: number) => Math.round(value * 10000) / 10000;
  const exact = species.hotspotSpace === 'model';
  const position = exact
    ? [local.x, local.y, local.z]
    : [
        (local.x - fit.box.min.x) / size.x,
        (local.y - fit.box.min.y) / size.y,
        (local.z - fit.box.min.z) / size.z,
      ];
  const normal = event.face.normal.clone().transformDirection(event.object.matrixWorld);
  const line = `position: [${position.map(round).join(', ')}], normal: [${[normal.x, normal.y, normal.z].map(round).join(', ')}],`;
  console.log(`[${species.id}] ${line}`);
  navigator.clipboard?.writeText(line).catch(() => {});
};
return (
  <group ref={groupRef} position={fit.position} scale={fit.scale}>
    <primitive object={scene} onClick={handleModelClick} />
    <HotspotPins hotspots={species.hotspots ?? []} box={fit.box} exact={species.hotspotSpace === 'model'} selectedId={selectedId} onSelect={onSelect} />
  </group>
);
}

/**
 * Draws one pin per hotspot. Pins live inside the model's group, so they turn
 * with it. Every frame, a pin whose surface faces away from the camera is hidden.
 */
function HotspotPins({ hotspots, box, exact, selectedId, onSelect }: { hotspots: Hotspot[]; box: Box3; exact: boolean; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  const camera = useThree((state) => state.camera);
  const groupRef = useRef<Group>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scratch = useMemo(() => ({ world: new Vector3(), toCamera: new Vector3() }), []);

  const pins = useMemo(() => {
    const size = box.getSize(new Vector3());
    return hotspots.map((hotspot) => ({
      hotspot,
      position: exact
        ? new Vector3(...hotspot.position)
        : new Vector3(
            box.min.x + size.x * hotspot.position[0],
            box.min.y + size.y * hotspot.position[1],
            box.min.z + size.z * hotspot.position[2],
          ),
      normal: new Vector3(...hotspot.normal).normalize(),
    }));
  }, [hotspots, box, exact]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    for (const pin of pins) {
      const element = pinRefs.current[pin.hotspot.id];
      if (!element) continue;
      group.localToWorld(scratch.world.copy(pin.position));
      scratch.toCamera.copy(camera.position).sub(scratch.world);
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
      {pins.map(({ hotspot, position }) => {
        const selected = selectedId === hotspot.id;
        return (
          <Html key={hotspot.id} position={position} center zIndexRange={[20, 0]}>
            <button
              type="button"
              ref={(element) => { pinRefs.current[hotspot.id] = element; }}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onSelect(hotspot.id)}
              aria-label={`${hotspot.name}: show explanation`}
              title={hotspot.name}
              className="grid h-10 w-10 cursor-pointer place-items-center transition-opacity"
            >
              {selected && <span className="absolute h-7 w-7 animate-ping rounded-full bg-[#e5ad59]/40" />}
              <span className={`relative rounded-full border-2 border-[#151a1b] ${selected ? 'h-4 w-4 bg-white' : 'h-3.5 w-3.5 bg-[#e5ad59]'}`} />
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
      controls.update(); // applies it immediately, so nothing keeps drifting
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

function ModelCanvas({ species, command, selectedId, onSelect }: { species: SpeciesRecord; command: ViewerCommand; selectedId: string | null; onSelect: (hotspotId: string) => void }) {
  const controlsRef = useRef<OrbitControlsHandle>(null);

  return (
    // Canvas creates the WebGL renderer. OrbitControls turns pointer drag and
    // the scroll wheel into camera rotation and distance.
    <Canvas camera={{ position: [0, 1.2, 5.4], fov: 38 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} />
      <directionalLight position={[-4, 1, -2]} intensity={0.45} color="#d49a53" />
      <Suspense
        fallback={
          <Html center>
            <div className="whitespace-nowrap rounded-md border border-white/10 bg-[#111617]/90 px-3 py-2 text-xs text-[#d8d1c2]">
              <i className="fa-solid fa-circle-notch fa-spin mr-2" aria-hidden="true" />Preparing specimen…
            </div>
          </Html>
        }
      >
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
    // A browser may lack WebGL even when the local GLB file is perfectly valid.
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
            {/* aria-hidden because the text below carries the meaning. */}
            <i className="fa-solid fa-circle-exclamation text-[20px]" aria-hidden="true" />
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