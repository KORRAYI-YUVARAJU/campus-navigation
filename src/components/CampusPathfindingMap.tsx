'use client';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Pathfinding, PathfindingHelper } from 'three-pathfinding';
import { FiZoomIn, FiZoomOut, FiMove, FiRefreshCw, FiMaximize, FiMinimize } from 'react-icons/fi';

const ZONE = 'campus';

function ViewControls({ action, resetAction, panMode }: { action: string | null; resetAction: () => void; panMode: boolean; }) {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    if (!action) return;
    if (controlsRef.current) {
      const target = controlsRef.current.target;
      if (action === 'zoomIn') {
        camera.position.lerp(target, 0.2);
        controlsRef.current.update();
      } else if (action === 'zoomOut') {
        const outPos = camera.position.clone().lerp(target, -0.2);
        // keep y slightly bounded if we want
        camera.position.copy(outPos);
        controlsRef.current.update();
      } else if (action === 'reset') {
        camera.position.set(-100, 250, -250);
        if (camera instanceof THREE.PerspectiveCamera) {
          camera.fov = 45;
          camera.updateProjectionMatrix();
        }
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
    resetAction();
  }, [action, camera, resetAction]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.05}
      maxPolarAngle={Math.PI / 2 - 0.05}
      mouseButtons={{
        LEFT: panMode ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  );
}

function PathfindingScene({ url, selectedBuilding }: { url: string; selectedBuilding?: string | null }) {
  const { scene } = useGLTF(url);
  const { camera, raycaster, pointer } = useThree();
  const [pathfinding] = useState(() => new Pathfinding());
  const helperRef = useRef<PathfindingHelper>(null);

  const [navMesh, setNavMesh] = useState<THREE.Mesh | null>(null);
  const [groupID, setGroupID] = useState<number | null>(null);

  const agentRef = useRef<THREE.Mesh>(null);
  const [path, setPath] = useState<THREE.Vector3[] | null>(null);
  const [agentPos, setAgentPos] = useState<THREE.Vector3>(new THREE.Vector3(0, 0.5, 0));

  // Speed
  const SPEED = 5;

  // Initialize pathfinding
  useEffect(() => {
    // 1. Orient the map correctly (lay it flat horizontally)
    scene.rotation.x = -Math.PI / 2;
    // Flip vertically (rotate 180 degrees in the new flat plane to face right-side up)
    scene.rotation.z = Math.PI;

    // Ensure all materials are double sided so they are always visible from any angle
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.side = THREE.DoubleSide;
      }
    });

    scene.updateMatrixWorld(true);

    let extractedNavMesh: THREE.Mesh | undefined;

    // Traverse the scene to find a navmesh. Look for an object named "NavMesh" or use the first mesh.
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // If the model has a specific navmesh
        if (child.name.toLowerCase().includes('navmesh')) {
          extractedNavMesh = child;
        }
      }
    });

    // If no explicit navmesh is found, fall back to the largest mesh or just combine them.
    // For simplicity, we are assuming there's a specific navMesh or we pick the first mesh as navmesh if none matched.
    if (!extractedNavMesh) {
      scene.traverse((child) => {
        if (!extractedNavMesh && child instanceof THREE.Mesh) {
          extractedNavMesh = child;
        }
      });
    }

    if (extractedNavMesh) {
      // Hide the navmesh physically if it was explicitly a navmesh
      if (extractedNavMesh.name.toLowerCase().includes('navmesh')) {
        extractedNavMesh.visible = false;
      }

      setNavMesh(extractedNavMesh);

      // Clone geometry and apply world matrix to bake the scene transformations for pathfinding
      extractedNavMesh.updateMatrixWorld(true);
      const worldGeo = extractedNavMesh.geometry.clone();
      worldGeo.applyMatrix4(extractedNavMesh.matrixWorld);

      const zone = Pathfinding.createZone(worldGeo);
      pathfinding.setZoneData(ZONE, zone);

      // Assume group ID is 0 for the first disconnected navmesh group
      setGroupID(0);
    }
  }, [scene, pathfinding]);

  // Navigate to selectedBuilding when it changes
  useEffect(() => {
    if (selectedBuilding && navMesh && groupID !== null) {
      let targetObj: THREE.Object3D | null = null;
      scene.traverse((child) => {
        // Ensure child name matches somewhat to the dest id
        if (child.name.toLowerCase().includes(selectedBuilding.toLowerCase().replace('_', ''))) {
          targetObj = child;
        }
      });

      if (targetObj) {
        const targetPosition = new THREE.Vector3();
        // @ts-ignore
        targetObj.getWorldPosition(targetPosition);

        const startPosition = agentRef.current ? agentRef.current.position.clone() : agentPos.clone();

        const closestTarget = pathfinding.getClosestNode(targetPosition, ZONE, groupID);
        const closestStart = pathfinding.getClosestNode(startPosition, ZONE, groupID);

        if (closestStart && closestTarget) {
          const calculatedPath = pathfinding.findPath(closestStart.centroid, closestTarget.centroid, ZONE, groupID);
          if (calculatedPath && calculatedPath.length > 0) {
            setPath(calculatedPath);
            if (helperRef.current) {
              helperRef.current.setPlayerPosition(startPosition);
              helperRef.current.setTargetPosition(targetPosition);
              helperRef.current.setPath(calculatedPath);
            }
          }
        }
      }
    }
  }, [selectedBuilding, navMesh, groupID, scene, pathfinding]);

  // Click to navigate
  const handlePointerDown = (e: THREE.Event) => {
    if (!navMesh || groupID === null) return;

    // Check intersection with navMesh
    const intersects = raycaster.intersectObject(navMesh);
    if (intersects.length > 0) {
      const targetPosition = intersects[0].point;
      const startPosition = agentPos.clone();

      // Find a valid point on the navmesh near the target
      const closestTarget = pathfinding.getClosestNode(targetPosition, ZONE, groupID);
      const closestStart = pathfinding.getClosestNode(startPosition, ZONE, groupID);

      if (closestStart && closestTarget) {
        const calculatedPath = pathfinding.findPath(closestStart.centroid, closestTarget.centroid, ZONE, groupID);
        if (calculatedPath && calculatedPath.length > 0) {
          setPath(calculatedPath);
          if (helperRef.current) {
            helperRef.current.setPlayerPosition(startPosition);
            helperRef.current.setTargetPosition(targetPosition);
            helperRef.current.setPath(calculatedPath);
          }
        }
      }
    }
  };

  // Animate the agent along the path
  useFrame((state, delta) => {
    if (path && path.length > 0 && agentRef.current) {
      const target = path[0];
      const currentPos = agentRef.current.position;
      const distance = currentPos.distanceTo(target);

      if (distance < 0.1) {
        // Reached the waypoint, go to the next
        setPath(currentPath => currentPath ? currentPath.slice(1) : null);
      } else {
        // Move towards waypoint
        const direction = new THREE.Vector3().subVectors(target, currentPos).normalize();
        currentPos.add(direction.multiplyScalar(SPEED * delta));
        setAgentPos(currentPos.clone());

        // Orient agent towards target
        const lookAtTarget = target.clone();
        lookAtTarget.y = currentPos.y; // Keep agent upright
        agentRef.current.lookAt(lookAtTarget);
      }
    }
  });

  return (
    <group>
      {/* The Map Scene */}
      <primitive object={scene} onPointerDown={handlePointerDown} />

      {/* Pathfinding Helper */}
      <mesh ref={helperRef as any} />

      {/* The Agent */}
      <mesh ref={agentRef} position={[agentPos.x, agentPos.y + 1, agentPos.z]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
        <meshStandardMaterial color="hotpink" />
      </mesh>
    </group>
  );
}

export default function CampusPathfindingMap({ selectedBuilding }: { selectedBuilding?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [action, setAction] = useState<string | null>(null);
  const [panMode, setPanMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const resetAction = useCallback(() => setAction(null), []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  return (
    <div ref={containerRef} className={`w-full ${isFullscreen ? 'h-screen' : 'h-[600px] rounded-2xl border border-gray-700'} overflow-hidden relative bg-gray-900`}>
      <Canvas camera={{ position: [-100, 250, -250], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[100, 100, 50]} intensity={1} castShadow />

        <Center top>
          <PathfindingScene url="/campus_map.glb" selectedBuilding={selectedBuilding} />
        </Center>

        <ViewControls action={action} resetAction={resetAction} panMode={panMode} />
      </Canvas>
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-3 rounded-lg text-white pointer-events-none text-sm">
        <p className="font-bold">3D Campus Map Navigation</p>
        <p>Click anywhere on the map to navigate.</p>
      </div>

      <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2 p-2 rounded-xl shadow-lg" style={{ background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={() => setAction('zoomIn')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Zoom In">
          <FiZoomIn size={20} />
        </button>
        <button onClick={() => setAction('zoomOut')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Zoom Out">
          <FiZoomOut size={20} />
        </button>
        <button onClick={() => setPanMode(!panMode)} className={`p-2 rounded-lg transition-colors ${panMode ? 'bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'hover:bg-white/10 text-white'}`} title="Pan Mode (Hand)">
          <FiMove size={20} />
        </button>
        <button onClick={() => setAction('reset')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Reset Camera">
          <FiRefreshCw size={20} />
        </button>
        <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Toggle Fullscreen">
          {isFullscreen ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
        </button>
      </div>
    </div>
  );
}
