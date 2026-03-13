'use client';
import { useState } from 'react';
import { FiSave, FiPlus, FiNavigation, FiTrash2, FiEdit2 } from 'react-icons/fi';
import { campusNodes, CampusNode } from '@/lib/dijkstra';
import CampusMapSVG from '@/components/CampusMapSVG';

export default function MapEditorPage() {
  const [nodes, setNodes] = useState<CampusNode[]>(campusNodes.filter(n => n.type !== 'intersection'));
  const [routePath, setRoutePath] = useState<{ x: number; y: number; id: string }[] | undefined>();

  // Function to allow admins to edit a node's displayed name & implicitly update classes
  const handleNameChange = (id: string, newName: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id === id) {
         const slugClass = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
         return { ...n, name: newName, className: slugClass };
      }
      return n;
    }));
  };

  const overrideCampusNodes = [
     ...nodes, 
     ...campusNodes.filter(n => n.type === 'intersection') // Keep invisible intersections unchanged
  ];

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <header className="mb-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Map Editor</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Live edit map names, test Dijkstra routes, and manage structures.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 rounded-lg text-sm font-bold bg-gray-800 text-white border border-gray-700 flex items-center gap-2 hover:bg-gray-700 transition-colors">
            <FiPlus /> Add Block
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-bold text-white shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center gap-2 hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
            <FiSave /> Publish Map
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Settings Panel (Sidebar) */}
        <div className="glass-card rounded-2xl p-5 overflow-y-auto" style={{ border: '1px solid var(--border-color)' }}>
          <h3 className="font-semibold mb-4 pb-2 border-b border-gray-700" style={{ color: 'var(--text-primary)' }}>Campus Blocks ({nodes.length})</h3>
          <div className="space-y-3">
            {nodes.map((node) => (
              <div key={node.id} className="p-3 bg-gray-800/50 border border-gray-700 rounded-xl hover:border-cyan-500/50 transition-colors group">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] uppercase font-bold text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded flex items-center gap-1 w-fit mt-1">
                        <FiEdit2 /> ID: {node.id}
                     </span>
                     <button className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto"><FiTrash2 size={14} /></button>
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold mb-1 block">DISPLAY NAME (Live Edit)</label>
                    <input 
                      type="text" 
                      value={node.name} 
                      onChange={(e) => handleNameChange(node.id, e.target.value)}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white font-semibold outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] transition-all" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold mb-1 block">CSS CLASS NAME (Live Sync / Edit)</label>
                    <input 
                      type="text" 
                      value={node.className || node.id} 
                      onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, className: e.target.value } : n))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-xs text-cyan-400 font-mono outline-none focus:border-cyan-500 transition-all font-semibold" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold mb-1 block">CLASS TYPE (Hologram Color)</label>
                    <select
                      value={node.category || 'infrastructure'}
                      onChange={(e) => setNodes(prev => prev.map(n => n.id === node.id ? { ...n, category: e.target.value as any } : n))}
                      className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white font-semibold outline-none focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(0,255,255,0.1)] transition-all"
                    >
                      <option value="academic">Academic (Cyan)</option>
                      <option value="admin">Administration (Blue)</option>
                      <option value="community">Community (Green)</option>
                      <option value="infrastructure">Infrastructure (Orange)</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live SVG Graph Renderer */}
        <div className="lg:col-span-2 glass-card rounded-2xl border border-gray-700 relative overflow-hidden flex items-center justify-center p-2">
           <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-gray-900/80 backdrop-blur border border-gray-700 rounded-lg shadow-xl text-xs text-cyan-400 flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span>
              Live Sync Editor
           </div>
           
           <div className="w-full h-full relative cursor-crosshair">
              {/* Force CampusMapSVG to re-render using our local `nodes` array by dynamically mapping custom overrides inline if possible. (Note: Since CampusMapSVG currently hardcodes `campusNodes`, I will update it to accept overridden nodes via props securely next.) */}
              <CampusMapSVG routePath={routePath} overrideNodes={overrideCampusNodes} />
           </div>
        </div>
      </div>
    </div>
  );
}
