// =============================================
// MVGR Campus Graph & Dijkstra Algorithm
// =============================================

export interface CampusNode {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'building' | 'intersection' | 'gate';
  category?: 'academic' | 'admin' | 'community' | 'infrastructure';
  className?: string;
  floors?: number;
  rooms?: string[];
}

export interface CampusEdge {
  from: string;
  to: string;
  weight: number;
}

export interface GraphResult {
  path: string[];
  distance: number;
  pathCoords: { x: number; y: number; id: string }[];
}

// MVGR Campus buildings & intersections (viewBox 0 0 1100 800)
export const campusNodes: CampusNode[] = [
  // === Buildings ===
  { id: 'main_gate', name: 'Main Gate', x: 1040, y: 550, type: 'gate', category: 'infrastructure' },
  { id: 'ground', name: 'College Ground', x: 740, y: 600, type: 'building', category: 'community' },
  { id: 'admin', name: 'Administration Block', x: 455, y: 540, type: 'building', category: 'admin', floors: 3,
    rooms: ['Principal Office', 'Dean Office', 'Exam Cell', 'Admin Office'] },
  { id: 'cse_block', name: 'CSE Department', x: 380, y: 640, type: 'building', category: 'academic', floors: 4,
    rooms: ['CSE-101', 'CSE-102', 'CSE-201', 'CSE-202', 'CSE-301', 'CSE Lab 1', 'CSE Lab 2', 'CSE Lab 3'] },
  { id: 'ece_block', name: 'ECE Department', x: 250, y: 640, type: 'building', category: 'academic', floors: 4,
    rooms: ['ECE-101', 'ECE-102', 'ECE-201', 'ECE-202', 'ECE-301', 'ECE Lab 1', 'ECE Lab 2'] },
  { id: 'mech_dept', name: 'Mechanical Department', x: 120, y: 640, type: 'building', category: 'academic', floors: 3,
    rooms: ['ME-101', 'ME-201', 'Workshop'] },
  { id: 'it_dept', name: 'IT Department', x: 380, y: 410, type: 'building', category: 'academic', floors: 3,
    rooms: ['IT-101', 'IT-201', 'IT Lab 1', 'IT Lab 2'] },
  { id: 'chem_lab', name: 'Chemistry Laboratory', x: 260, y: 410, type: 'building', category: 'academic' },
  { id: 'workshop', name: 'Workshop Laboratory', x: 140, y: 410, type: 'building', category: 'academic' },
  { id: 'civil_block', name: 'Civil Engineering', x: 420, y: 280, type: 'building', category: 'academic', floors: 3,
    rooms: ['CE-101', 'CE-201', 'CE Lab'] },
  { id: 'canteen', name: 'MVGR Canteen', x: 320, y: 220, type: 'building', category: 'community' },
  { id: 'bus_stand', name: 'Mvgr bus stand', x: 280, y: 120, type: 'building', category: 'infrastructure' },
  { id: 'library', name: 'Central Library', x: 600, y: 350, type: 'building', category: 'community', floors: 3,
    rooms: ['Reading Hall', 'Reference Section', 'Digital Library', 'Periodicals'] },
  { id: 'pond', name: 'Pond', x: 880, y: 300, type: 'building', category: 'community' },

  // === Road Intersections ===
  { id: 'i_gate', name: 'int', x: 1000, y: 550, type: 'intersection' },
  { id: 'i_mid', name: 'int', x: 830, y: 620, type: 'intersection' },
  { id: 'i_admin_f', name: 'int', x: 530, y: 540, type: 'intersection' },
  { id: 'i_admin_tr', name: 'int', x: 530, y: 470, type: 'intersection' },
  { id: 'i_admin_br', name: 'int', x: 530, y: 580, type: 'intersection' },
  { id: 'i_admin_tl', name: 'int', x: 400, y: 470, type: 'intersection' },
  { id: 'i_admin_bl', name: 'int', x: 400, y: 580, type: 'intersection' },
  { id: 'i_cse_top', name: 'int', x: 320, y: 470, type: 'intersection' },
  { id: 'i_cse_bot', name: 'int', x: 320, y: 580, type: 'intersection' },
  { id: 'i_mech_top', name: 'int', x: 180, y: 470, type: 'intersection' },
  { id: 'i_mech_bot', name: 'int', x: 180, y: 580, type: 'intersection' },
  { id: 'i_civil', name: 'int', x: 400, y: 330, type: 'intersection' },
  { id: 'i_canteen', name: 'int', x: 400, y: 220, type: 'intersection' },
  { id: 'i_bus', name: 'int', x: 350, y: 120, type: 'intersection' },
  { id: 'i_lib', name: 'int', x: 530, y: 350, type: 'intersection' },
];

const calculateWeight = (fId: string, tId: string) => {
  const f = campusNodes.find(n => n.id === fId);
  const t = campusNodes.find(n => n.id === tId);
  if (!f || !t) return 0;
  return Math.sqrt(Math.pow(f.x - t.x, 2) + Math.pow(f.y - t.y, 2));
};

const rawEdges = [
  ['main_gate', 'i_gate'],
  ['i_gate', 'i_mid'],
  ['ground', 'i_mid'],
  ['i_mid', 'i_admin_br'],
  ['i_admin_br', 'i_admin_f'],
  ['i_admin_br', 'i_admin_bl'],
  ['i_admin_f', 'admin'],
  ['i_admin_f', 'i_admin_tr'],
  ['i_admin_tl', 'i_admin_tr'],
  ['i_admin_tl', 'i_admin_bl'],
  ['i_admin_bl', 'i_cse_bot'],
  ['i_admin_tl', 'i_cse_top'],
  ['i_cse_top', 'i_cse_bot'],
  ['i_cse_bot', 'cse_block'],
  ['i_cse_bot', 'ece_block'],
  ['i_cse_bot', 'i_mech_bot'],
  ['i_cse_top', 'it_dept'],
  ['i_cse_top', 'chem_lab'],
  ['i_cse_top', 'i_mech_top'],
  ['i_mech_top', 'i_mech_bot'],
  ['i_mech_bot', 'mech_dept'],
  ['i_mech_top', 'workshop'],
  ['i_admin_tl', 'i_civil'],
  ['i_civil', 'civil_block'],
  ['i_civil', 'i_canteen'],
  ['i_canteen', 'canteen'],
  ['i_canteen', 'i_bus'],
  ['i_bus', 'bus_stand'],
  ['i_admin_tr', 'i_lib'],
  ['i_lib', 'library'],
  ['i_lib', 'pond']
];

export const campusEdges: CampusEdge[] = rawEdges.map(([from, to]) => ({
  from, to, weight: Math.round(calculateWeight(from, to))
}));

export function dijkstra(start: string, end: string): GraphResult | null {
  const adj: Record<string, { node: string; weight: number }[]> = {};
  for (const e of campusEdges) {
    if (!adj[e.from]) adj[e.from] = [];
    if (!adj[e.to]) adj[e.to] = [];
    adj[e.from].push({ node: e.to, weight: e.weight });
    adj[e.to].push({ node: e.from, weight: e.weight });
  }

  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  const pq: { node: string; d: number }[] = [];

  for (const n of campusNodes) {
    dist[n.id] = Infinity;
    prev[n.id] = null;
  }
  dist[start] = 0;
  pq.push({ node: start, d: 0 });

  while (pq.length) {
    pq.sort((a, b) => a.d - b.d);
    const cur = pq.shift()!;
    if (visited.has(cur.node)) continue;
    visited.add(cur.node);
    if (cur.node === end) break;
    for (const nb of adj[cur.node] || []) {
      if (visited.has(nb.node)) continue;
      const nd = dist[cur.node] + nb.weight;
      if (nd < dist[nb.node]) {
        dist[nb.node] = nd;
        prev[nb.node] = cur.node;
        pq.push({ node: nb.node, d: nd });
      }
    }
  }

  if (dist[end] === undefined || dist[end] === Infinity) return null;

  const path: string[] = [];
  let c: string | null = end;
  while (c) { path.unshift(c); c = prev[c] || null; }

  const nodeMap = new Map(campusNodes.map(n => [n.id, n]));
  return {
    path,
    distance: dist[end],
    pathCoords: path.map(id => {
      const n = nodeMap.get(id);
      if (!n) return { x: 0, y: 0, id };
      return { x: n.x, y: n.y, id };
    }),
  };
}
