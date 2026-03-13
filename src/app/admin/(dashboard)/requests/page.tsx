'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiCheck, FiX, FiClock, FiMessageSquare } from 'react-icons/fi';

const initialRequests = [
  { id: 'REQ-01', user: '21331A0567', type: 'Map Correction', target: 'Library Route', status: 'Pending', time: '2 hours ago', priority: 'High' },
  { id: 'REQ-02', user: 'Admin-Sub', type: 'Add Feature', target: 'New Parking Lot', status: 'Pending', time: '5 hours ago', priority: 'Medium' },
  { id: 'REQ-03', user: '22331A0512', type: 'Bug Report', target: '3D Canvas Glitch', status: 'Pending', time: '1 day ago', priority: 'High' },
];

export default function RequestsPage() {
  const [requests, setRequests] = useState(initialRequests);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setRequests(reqs => reqs.filter(r => r.id !== id));
  };

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>User Requests</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Manage incoming feedback, map corrections, and system reports.</p>
        </div>
        <div className="px-4 py-2 rounded-lg text-sm font-bold bg-blue-500/10 text-cyan-400 border border-blue-500/20 shadow-[0_0_15px_rgba(0,255,255,0.1)]">
          {requests.length} Pending
        </div>
      </header>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl border border-dashed border-gray-600">
            <FiCheck className="text-4xl text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>All caught up!</h3>
            <p style={{ color: 'var(--text-tertiary)' }}>There are no pending requests right now.</p>
          </div>
        ) : (
          requests.map((req, i) => (
            <motion.div 
              key={req.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="p-5 rounded-2xl glass-card flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ border: '1px solid var(--border-color)', borderLeft: `4px solid ${req.priority === 'High' ? '#ef4444' : '#f59e0b'}` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-800" style={{ color: 'var(--text-secondary)' }}>{req.id}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{req.type}</span>
                  {req.priority === 'High' && <span className="text-[10px] uppercase font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">URGENT</span>}
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--accent-blue)' }}>Target: {req.target}</p>
                <div className="flex items-center gap-4 text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
                  <span className="flex items-center gap-1"><FiMessageSquare /> By: {req.user}</span>
                  <span className="flex items-center gap-1"><FiClock /> {req.time}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => handleAction(req.id, 'reject')} className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors flex items-center gap-1">
                  <FiX /> Reject
                </button>
                <button onClick={() => handleAction(req.id, 'approve')} className="px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-colors flex items-center gap-1">
                  <FiCheck /> Approve & Resolve
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
