'use client';
import { motion } from 'framer-motion';
import { FiUsers, FiMapPin, FiActivity, FiArrowUpRight } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const statCards = [
  { title: 'Total Users', value: '2,845', change: '+12.5%', icon: FiUsers, color: 'var(--accent-blue)' },
  { title: 'Path Searches', value: '14,230', change: '+8.2%', icon: FiMapPin, color: 'var(--accent-purple)' },
  { title: 'Active Sessions', value: '432', change: '+24.1%', icon: FiActivity, color: '#10b981' },
];

const trafficData = [
  { name: 'Mon', searches: 4000 },
  { name: 'Tue', searches: 3000 },
  { name: 'Wed', searches: 2000 },
  { name: 'Thu', searches: 2780 },
  { name: 'Fri', searches: 1890 },
  { name: 'Sat', searches: 2390 },
  { name: 'Sun', searches: 3490 },
];

export default function AdminDashboardOverview() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard Overview</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Real-time statistics and system performance</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl glass-card relative overflow-hidden"
              style={{ border: '1px solid var(--border-color)' }}
            >
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Icon size={80} color={stat.color} />
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg" style={{ background: `${stat.color}20` }}>
                  <Icon style={{ color: stat.color }} className="text-xl" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  {stat.title}
                </h3>
              </div>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
                <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                  <FiArrowUpRight /> {stat.change}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Traffic Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 rounded-2xl glass-card" style={{ border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-semibold text-base mb-6" style={{ color: 'var(--text-primary)' }}>Weekly Search Traffic</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'var(--border-color)' }}
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="searches" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
           className="p-6 rounded-2xl glass-card" style={{ border: '1px solid var(--border-color)' }}
        >
          <h3 className="font-semibold text-base mb-4" style={{ color: 'var(--text-primary)' }}>System Status</h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
               <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>MongoDB Core</span>
               <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
             </div>
             <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
               <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Routing Engine</span>
               <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
             </div>
             <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
               <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Dijkstra Cache</span>
               <span className="flex h-3 w-3 relative"><span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span></span>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
