'use client';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiGrid, FiInbox, FiMap, FiLogOut, FiSettings } from 'react-icons/fi';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Overview', path: '/admin', icon: FiGrid },
    { name: 'Requests', path: '/admin/requests', icon: FiInbox, badge: 3 },
    { name: 'Map Editor', path: '/admin/map-editor', icon: FiMap },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r flex flex-col" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' }}>
              <FiSettings className="text-white text-sm" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>ADMIN PANEL</h2>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>v2.0 System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <motion.div 
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-colors"
                  style={{ 
                    background: isActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(34, 211, 238, 0.2)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-lg" style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-tertiary)' }} />
                    <span className="font-medium text-sm" style={{ color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)' }}>
                      {item.name}
                    </span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-lg" style={{ background: 'var(--accent-purple)' }}>
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button 
            onClick={() => router.push('/admin/login')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 transition-colors group"
          >
            <FiLogOut className="text-red-400 group-hover:text-red-500" />
            <span className="font-medium text-sm text-red-400 group-hover:text-red-500">Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto relative p-8">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
