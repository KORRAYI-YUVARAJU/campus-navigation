'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import { useRouter } from 'next/navigation';
import { FiUser, FiUsers, FiLock, FiMail, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

export default function ExplorePage() {
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [roll, setRoll] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const router = useRouter();

  const onVisitor = () => router.push('/dashboard?mode=visitor');

  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setErr('');
    try {
      await new Promise(r => setTimeout(r, 1500));
      if (roll && pw) router.push('/dashboard?mode=insider');
      else setErr('Please fill in all fields');
    } catch { setErr('Login failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center pt-20">
      {/* Blurred Spline Map bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-x-0 bottom-0 top-[20%] flex items-center justify-center opacity-30" style={{ filter: 'blur(8px)', mixBlendMode: 'screen' }}>
          <Spline scene="https://prod.spline.design/qTdzlCwJAPfMm3ji/scene.splinecode" />
        </div>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center,transparent 30%,var(--bg-primary) 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 0 20px rgba(59,130,246,.3)' }}>
              <FiLock className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome to CampusNav</h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Sign in to navigate as an insider</p>
          </div>
          
          <form onSubmit={onLogin} className="space-y-4">
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-tertiary)' }} />
              <input type="text" placeholder="Roll Number" value={roll} onChange={e => setRoll(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-shadow focus:shadow-md"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
            </div>
            
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--text-tertiary)' }} />
              <input type={showPw ? 'text' : 'password'} placeholder="Password" value={pw} onChange={e => setPw(e.target.value)}
                className="w-full pl-11 pr-12 py-3 rounded-xl text-sm outline-none transition-shadow focus:shadow-md"
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white transition-colors" style={{ color: 'var(--text-tertiary)' }}>
                {showPw ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-blue-500" />
                <span className="text-xs group-hover:text-blue-400 transition-colors" style={{ color: 'var(--text-secondary)' }}>Remember me</span>
              </label>
              <button type="button" className="text-xs font-medium hover:underline" style={{ color: 'var(--accent-blue)' }}>Forgot password?</button>
            </div>
            
            {err && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 text-center">{err}</motion.p>}
            
            <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: .98 }} disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 4px 15px rgba(59,130,246,.3)' }}>
              {loading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                : <>Sign In <FiArrowRight /></>}
            </motion.button>
          </form>

          {/* ── Or Visitors ── */}
          <div className="mt-6 text-center">
            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: 'var(--border-color)' }} /></div>
              <span className="relative px-3 text-xs" style={{ background: 'var(--card-bg)', color: 'var(--text-tertiary)' }}>OR</span>
            </div>
            <motion.button whileHover={{ scale: 1.02, background: 'var(--bg-tertiary)' }} whileTap={{ scale: .98 }} onClick={onVisitor}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border transition-colors"
              style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)', background: 'var(--bg-primary)' }}>
              <FiUsers className="text-lg" style={{ color: 'var(--accent-purple)' }}/>
              Continue as Visitor
            </motion.button>
            <p className="text-[11px] mt-3" style={{ color: 'var(--text-tertiary)' }}>For guests, parents, and event participants</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
