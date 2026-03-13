'use client';
import { useRef, Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CampusNode } from '@/lib/dijkstra';
import { FiZoomIn, FiZoomOut, FiMove, FiRefreshCw } from 'react-icons/fi';

interface Props { building: CampusNode; targetFloor?: number; targetRoom?: string }

function Floor({ y, w, d, num, rooms, isTarget, targetRoom }: {
  y:number; w:number; d:number; num:number; rooms:string[]; isTarget:boolean; targetRoom?:string;
}) {
  return (
    <group position={[0,y,0]}>
      <mesh>
        <boxGeometry args={[w,.05,d]} />
        <meshPhongMaterial color={isTarget?'#22d3ee':'#60a5fa'} transparent opacity={isTarget?.5:.15} wireframe={!isTarget} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w,.05,d)]} />
        <lineBasicMaterial color={isTarget?'#22d3ee':'#60a5fa'} transparent opacity={.6} />
      </lineSegments>
      {rooms.map((room,i) => {
        const cols = Math.ceil(Math.sqrt(rooms.length));
        const row = Math.floor(i/cols), col = i%cols;
        const rw = (w-.4)/cols, rd = (d-.4)/2;
        const xp = -w/2+.2+col*rw+rw/2, zp = row===0?-d/4:d/4;
        const isR = room===targetRoom;
        return (
          <group key={room} position={[xp,.1,zp]}>
            <mesh>
              <boxGeometry args={[rw-.1,.8,rd-.1]} />
              <meshPhongMaterial color={isR?'#f43f5e':isTarget?'#22d3ee':'#60a5fa'} transparent opacity={isR?.6:.1} wireframe={!isR} />
            </mesh>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(rw-.1,.8,rd-.1)]} />
              <lineBasicMaterial color={isR?'#f43f5e':isTarget?'#22d3ee':'#60a5fa'} transparent opacity={isR?.9:.4} />
            </lineSegments>
            <Text position={[0,.5,0]} fontSize={.12} color={isR?'#f43f5e':'#60a5fa'} anchorX="center" anchorY="middle">{room}</Text>
          </group>
        );
      })}
      <Text position={[-w/2-.3,.1,0]} fontSize={.15} color={isTarget?'#22d3ee':'#60a5fa'} anchorX="right" anchorY="middle">{`F${num}`}</Text>
    </group>
  );
}

function Model({ building, targetFloor=-1, targetRoom }: Props) {
  const ref = useRef<THREE.Group>(null);
  const floors = building.floors||2, rooms = building.rooms||[];
  const rpf = Math.ceil(rooms.length/floors);
  useFrame(s => { if(ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime*.3)*.1 });
  const w=3, d=2, fh=1.2;
  return (
    <group ref={ref}>
      {Array.from({length:floors}).map((_,i) => {
        const fr = rooms.slice(i*rpf,(i+1)*rpf);
        if(targetFloor!==-1 && Math.abs(i-targetFloor)>1) return null;
        return <Floor key={i} y={i*fh} w={w} d={d} num={i+1} rooms={fr} isTarget={i===targetFloor} targetRoom={targetRoom} />;
      })}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w+.1,floors*fh,d+.1)]} />
        <lineBasicMaterial color="#60a5fa" transparent opacity={.15} />
      </lineSegments>
      <Text position={[0,floors*fh+.3,0]} fontSize={.2} color="#60a5fa" anchorX="center" anchorY="middle" fontWeight={700}>{building.name}</Text>
    </group>
  );
}

function ViewControls({ action, resetAction, panMode }: { action: string|null; resetAction: ()=>void; panMode: boolean; }) {
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
        camera.position.lerp(target, -0.2);
        controlsRef.current.update();
      } else if (action === 'reset') {
        camera.position.set(5, 4, 5);
        if (camera instanceof THREE.PerspectiveCamera) {
           camera.fov = 50;
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
      enableDamping
      dampingFactor={0.05}
      minDistance={2}
      maxDistance={30}
      mouseButtons={{
        LEFT: panMode ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN
      }}
    />
  );
}

export default function Building3DView({ building, targetFloor, targetRoom }: Props) {
  const [action, setAction] = useState<string | null>(null);
  const [panMode, setPanMode] = useState(false);
  const resetAction = useCallback(() => setAction(null), []);

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden relative" style={{ background:'var(--map-bg)' }}>
      {/* Overlay UI Controls */}
      <div className="absolute right-4 bottom-4 z-20 flex flex-col gap-2 p-2 rounded-xl shadow-lg" style={{ background:'rgba(30, 41, 59, 0.8)', backdropFilter:'blur(8px)', border:'1px solid var(--border-color)' }}>
        <button onClick={() => setAction('zoomIn')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Zoom In">
          <FiZoomIn size={20} />
        </button>
        <button onClick={() => setAction('zoomOut')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Zoom Out">
          <FiZoomOut size={20} />
        </button>
        <button onClick={() => setPanMode(!panMode)} className={`p-2 rounded-lg transition-colors ${panMode ? 'bg-blue-500 text-white' : 'hover:bg-white/10 text-white'}`} title="Pan Mode (Hand)">
          <FiMove size={20} />
        </button>
        <button onClick={() => setAction('reset')} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors" title="Reset Camera">
          <FiRefreshCw size={20} />
        </button>
      </div>

      <Suspense fallback={<div className="w-full h-full flex items-center justify-center" style={{color:'var(--text-secondary)'}}>Loading 3D…</div>}>
        <Canvas resize={{ offsetSize: true }}>
          <PerspectiveCamera makeDefault position={[5,4,5]} fov={50} />
          <ViewControls action={action} resetAction={resetAction} panMode={panMode} />
          <ambientLight intensity={.5} />
          <pointLight position={[10,10,10]} intensity={.8} />
          <pointLight position={[-10,5,-10]} intensity={.3} color="#a78bfa" />
          <Model building={building} targetFloor={targetFloor} targetRoom={targetRoom} />
          <gridHelper args={[20,20,'#1e293b','#1e293b']} position={[0,-.1,0]} />
        </Canvas>
      </Suspense>
    </div>
  );
}
