import { Component, Suspense, useEffect, useMemo, useRef } from 'react';
import type { ComponentRef, ErrorInfo, ReactNode, RefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Html, OrbitControls, useAnimations, useGLTF } from '@react-three/drei';
import { Box3, MathUtils, Vector3 } from 'three';
import type { SpeciesRecord } from '@/data/species';

// Camera limits shared by the mouse wheel (OrbitControls) and the +/- buttons.
const MIN_DISTANCE = 2.1;
const MAX_DISTANCE = 8;
// Every model is scaled so its longest side is about this many scene units.
const MODEL_TARGET_SIZE = 2.6;
// The floor of the model sits at this height so it appears to stand on the stage.
const GROUND_Y = -1.15;

export type ViewerCommandType = 'zoomIn' | 'zoomOut' | 'reset';
/** The id changes on every click so pressing the same button twice still fires. */
export type ViewerCommand = { type: ViewerCommandType; id: number } | null;

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>;

type SpecimenViewerProps = {
  species: SpeciesRecord;
  command: ViewerCommand;
  attempt: number;
  onSelectRegion: (regionId: string) => void;
  onRetry: () => void;
};

/**
 * Owns the 3D canvas and its recovery boundary, so a WebGL or GLB error
 * cannot take down the rest of the museum interface.
 */
export function SpecimenViewer({ species, command, attempt, onSelectRegion, onRetry }: SpecimenViewerProps) {
  const handleReset = () => {
    // useGLTF caches results, even failed ones, so clear the cache before retrying.
    if (species.modelPath) useGLTF.clear(species.modelPath);
    onRetry();
  };

  return (
    // The key remounts the whole viewer when the species changes or a retry happens.
    <ViewerErrorBoundary key={`${species.id}-${attempt}`} species={species} onReset={handleReset}>
      <div className="absolute inset-0 z-[1]">
        <ModelCanvas species={species} command={command} onSelectRegion={onSelectRegion} />
      </div>
    </ViewerErrorBoundary>
  );
}

/**
 * Loads the species' GLB and uses its named rig joints only to identify
 * approximate exterior regions. The rig is never displayed as anatomy.
 */
function SpecimenModel({ species, onSelectRegion }: { species: SpeciesRecord; onSelectRegion: (regionId: string) => void }) {
  // The viewer is only rendered once modelPath has been checked, so the "!" is safe.
  const { scene, animations } = useGLTF(species.modelPath!);
  const { actions } = useAnimations(animations, scene);

  // Play the clip by its authored name. If the file has no such clip the model simply stays still.
  useEffect(() => {
    const clip = actions[species.idleClip ?? 'idle'];
    clip?.reset().fadeIn(0.25).play();
    return () => { clip?.fadeOut(0.2); };
  }, [actions, species.idleClip]);

  // TEMPORARY: print the name of every part in the model to the browser console (F12)
  // so we can see what this specific file contains. Remove it once the names are noted.
  useEffect(() => {
    const names: string[] = [];
    scene.traverse((object) => {
      if (object.name) names.push(`${object.type}: ${object.name}`);
    });
    console.log(`[${species.id}] parts in model:`, names);
  }, [scene, species.id]);

  // Measure the model once and work out the scale and offset that fit it on the
  // stage, so models of very different sizes all appear centred and similar in size.
  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const longestSide = Math.max(size.x, size.y, size.z) || 1;
    const scale = MODEL_TARGET_SIZE / longestSide;
    const position: [number, number, number] = [
      -center.x * scale,
      GROUND_Y - box.min.y * scale,
      -center.z * scale,
    ];
    return { scale, position };
  }, [scene]);

  const handleModelClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Find the region whose rig joint is nearest to the click point. This does
    // not claim the GLB has a separate mesh for each region.
    scene.updateWorldMatrix(true, true);
    let nearestRegionId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const region of species.regions ?? []) {
      const bone = scene.getObjectByName(region.boneName);
      if (!bone) continue; // The bone name may not exist in this file; skip it.
      const distance = bone.getWorldPosition(new Vector3()).distanceTo(event.point);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestRegionId = region.id;
      }
    }
    // If no joint was found, select nothing rather than guessing a region.
    if (nearestRegionId) onSelectRegion(nearestRegionId);
  };

  return (
    <group position={fit.position} scale={fit.scale}>
      <primitive object={scene} onClick={handleModelClick} />
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
      controls.reset(); // Back to the camera position the viewer started with.
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

function ModelCanvas({ species, command, onSelectRegion }: { species: SpeciesRecord; command: ViewerCommand; onSelectRegion: (regionId: string) => void }) {
  const controlsRef = useRef<OrbitControlsHandle>(null);

  return (
    // Canvas creates the WebGL renderer. OrbitControls turns pointer drag and
    // the scroll wheel into camera rotation and distance.
    <Canvas camera={{ position: [0, 1.1, 4.7], fov: 38 }} dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} />
      <directionalLight position={[-4, 1, -2]} intensity={1.15} color="#d49a53" />
      <Suspense
        fallback={
          <Html center>
            <div className="whitespace-nowrap rounded-md border border-white/10 bg-[#111617]/90 px-3 py-2 text-xs text-[#d8d1c2]">
              <i className="fa-solid fa-circle-notch fa-spin mr-2" aria-hidden="true" />Preparing specimen…
            </div>
          </Html>
        }
      >
        <SpecimenModel species={species} onSelectRegion={onSelectRegion} />
      </Suspense>
      <OrbitControls ref={controlsRef} enablePan={false} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} target={[0, 0, 0]} />
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
              : `Check that ${species.modelPath} is a valid glTF binary, then try again.`}
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