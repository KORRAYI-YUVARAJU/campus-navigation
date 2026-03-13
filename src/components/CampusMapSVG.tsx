'use client';
import { motion } from 'framer-motion';
import { campusNodes, campusEdges, CampusNode } from '@/lib/dijkstra';
import { useState, ReactNode } from 'react';

interface Props {
  routePath?: { x: number; y: number; id: string }[];
  selectedBuilding?: string | null;
  onBuildingClick?: (node: CampusNode) => void;
  highlightBuilding?: string | null;
  densityData?: Record<string, 'low' | 'medium' | 'high'>;
  overrideNodes?: CampusNode[]; // Enables the admin editor to inject live-edited names
}

const mapShapes: Record<string, ReactNode> = {
  admin: <path d="M420,490 L490,490 L490,600 L420,600 L420,570 L460,570 L460,520 L420,520 Z" />,
  ground: <polygon points="650,510 850,550 810,740 600,680" />,
  pond: <polygon points="820,250 940,270 910,380 770,350" />,
  cse_block: <rect x="340" y="600" width="80" height="80" rx="4" />,
  ece_block: <rect x="210" y="600" width="80" height="80" rx="4" />,
  mech_dept: <rect x="80" y="600" width="80" height="80" rx="4" />,
  it_dept: <rect x="340" y="370" width="80" height="80" rx="4" />,
  chem_lab: <rect x="220" y="370" width="80" height="80" rx="4" />,
  workshop: <rect x="80" y="370" width="100" height="80" rx="4" />,
  civil_block: <path d="M370,240 L470,240 L470,320 L370,320 Z M400,260 L440,260 L440,300 L400,300 Z" fillRule="evenodd" />,
  canteen: <rect x="290" y="200" width="60" height="40" rx="4" />,
  bus_stand: <polygon points="250,90 310,105 300,150 240,135" />,
  library: <path d="M570,300 L630,300 L630,330 L660,330 L660,370 L630,370 L630,400 L570,400 Z" />,
  main_gate: <circle cx="1040" cy="550" r="15" />
};

const catColors: Record<string, string> = {
  academic: '#06b6d4',      // Cyan glow
  admin: '#3b82f6',         // Blue glow
  community: '#34d399',     // Green glow
  infrastructure: '#f59e0b',// Orange glow
};

export default function CampusMapSVG({ routePath, selectedBuilding, onBuildingClick, highlightBuilding, densityData, overrideNodes }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  
  // Use passed nodes if they exist (for Map Editor live syncing), else default to static Dijkstra import
  const activeNodes = overrideNodes || campusNodes;
  const buildings = activeNodes.filter(n => n.type !== 'intersection');

  // Draw roads cleanly by connecting intersections directly from graph topology
  const roadPaths = campusEdges.filter(e => {
    const fn = activeNodes.find(n => n.id === e.from);
    const tn = activeNodes.find(n => n.id === e.to);
    // Draw neon roads mainly for intersection/gate connections to mimic layout outline
    return fn && tn && (fn.type === 'intersection' || fn.type === 'gate') && (tn.type === 'intersection' || tn.type === 'gate');
  }).map(e => {
    const fn = activeNodes.find(n => n.id === e.from)!;
    const tn = activeNodes.find(n => n.id === e.to)!;
    return `M${fn.x},${fn.y} L${tn.x},${tn.y}`;
  });

  const polyline = routePath ? routePath.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ') : '';

  return (
    <div className="w-full h-full relative" style={{ background: '#0a0f1c' }}>
      <svg viewBox="0 0 1100 800" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="bGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Subtle grid pattern */}
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.5" opacity="0.6" />
          </pattern>
        </defs>

        {/* Background Overlay Image aligned precisely with shapes */}
        <image href="/images/maps.jpeg" x="-20" y="-20" width="1140" height="840" preserveAspectRatio="none" opacity="0.5" style={{ filter: 'brightness(0.7) contrast(1.1)' }} />

        {/* Subtle grid pattern */}
        <rect width="1100" height="800" fill="url(#grid)" />

        {/* Roads */}
        <g stroke="#1e3a8a" strokeWidth="3" fill="none" opacity="0.8" strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 6px #1e3a8a)' }}>
          {roadPaths.map((d, i) => <path key={i} d={d} />)}
        </g>

        {/* Outer boundary roadmap (decorative layer based on intersections) */}
        <g stroke="#2563eb" strokeWidth="1" fill="none" opacity="0.4" strokeLinecap="round">
          {roadPaths.map((d, i) => <path key={`dec-${i}`} d={d} />)}
        </g>

        {/* Density Data Nodes (Heatmap) */}
        {densityData && buildings.map(b => {
          const d = densityData[b.id]; if (!d) return null;
          return <circle key={`d-${b.id}`} cx={b.x} cy={b.y} r={45} style={{ filter: 'blur(20px)' }}
            className={d === 'low' ? 'density-low' : d === 'medium' ? 'density-medium' : 'density-high'} opacity=".4" />;
        })}

        {/* Buildings defined with SVG Geometries */}
        {buildings.map(b => {
          const shape = mapShapes[b.id];
          if (!shape) return null;
          const col = catColors[b.category || 'infrastructure'];
          const hl = hovered === b.id || selectedBuilding === b.id || highlightBuilding === b.id;

          return (
            <g key={b.id} className={`cursor-pointer group ${b.className || b.id}`}
              onClick={() => onBuildingClick?.(b)}
              onMouseEnter={() => setHovered(b.id)}
              onMouseLeave={() => setHovered(null)}>
              
              <g filter={hl ? 'url(#hGlow)' : 'url(#bGlow)'} fill="rgba(6, 182, 212, 0.05)" stroke={col} strokeWidth={hl ? 2.5 : 1.5}>
                {/* Dynamically bind properties into the map shape elements */}
                <motion.g animate={{ opacity: highlightBuilding === b.id ? [.6, 1, .6] : 1 }} transition={{ duration: 1.5, repeat: highlightBuilding === b.id ? Infinity : 0 }}>
                  {shape}
                </motion.g>
              </g>

              {/* Building Label Text overlayed directly over map structures */}
              <text x={b.x} y={b.y + (b.id==='ground' ? 60 : b.id==='admin' ? 80 : 0)} 
                textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Inter,sans-serif" fontWeight="600" 
                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
                {b.name}
              </text>

              {/* Hover highlight popup box */}
              {hovered === b.id && (
                <g>
                  <rect x={b.x - 70} y={b.y - 45} width="140" height="26" rx="6" fill="#0f172a" stroke={col} strokeWidth="1" opacity=".95" />
                  <text x={b.x} y={b.y - 27} textAnchor="middle" fill={col} fontSize="12" fontWeight="700">
                    {b.name}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Navigated Route Path Dijkstra Highlights */}
        {routePath && polyline && (
          <>
            <motion.path d={polyline} fill="none" stroke="rgba(34,211,238,.2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
            <motion.path d={polyline} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="15,8" filter="url(#rGlow)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
            <motion.path d={polyline} fill="none" stroke="#22d3ee" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="15,8" filter="url(#rGlow)"
              animate={{ strokeDashoffset: [-30, 0] }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
            
            {/* Draw nodes along the exact route path connecting them */}
            {routePath.map((p, i) => (
              <motion.circle key={i} cx={p.x} cy={p.y}
                r={i === 0 || i === routePath.length - 1 ? 8 : 4}
                fill={i === 0 ? '#22d3ee' : i === routePath.length - 1 ? '#f43f5e' : '#e0e7ff'}
                filter="url(#rGlow)"
                initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }}
                transition={{ delay: i * .2, duration: .4 }} />
            ))}
          </>
        )}

      </svg>
    </div>
  );
}
