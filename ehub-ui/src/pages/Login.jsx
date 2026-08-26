import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Code2,
  Cpu
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      login(res.data);
      setToast({ message: 'Login successful! Redirecting...', type: 'success' });
      
      setTimeout(() => {
        if (res.data.role === 'ROLE_ORGANIZER') {
          navigate('/organizer');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'ORGANIZER') {
      setEmail('organizer@vitap.ac.in');
      setPassword('Organizer123!');
    } else if (role === 'PARTICIPANT_SOLO') {
      setEmail('ethan@vitapstudent.ac.in');
      setPassword('Password123!');
    } else {
      setEmail('alice@vitapstudent.ac.in');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Toast Alert */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background ambient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Top Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-glow mb-3">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Sign In to <span className="gradient-text">EHub</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous Hackathon Management & AI Evaluation
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@vitapstudent.ac.in"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-purple transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate & Enter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Presets for Instant Demo Testing */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-2 text-center">
              ⚡ Instant Demo Access
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('PARTICIPANT')}
                className="p-2.5 rounded-xl bg-surface-100/80 hover:bg-indigo-950/40 border border-white/10 hover:border-indigo-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-indigo-300">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  In Team
                </div>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Alice Chen</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PARTICIPANT_SOLO')}
                className="p-2.5 rounded-xl bg-surface-100/80 hover:bg-cyan-950/40 border border-white/10 hover:border-cyan-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-cyan-300">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  Solo / Open
                </div>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Ethan Walker</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ORGANIZER')}
                className="p-2.5 rounded-xl bg-surface-100/80 hover:bg-purple-950/40 border border-white/10 hover:border-purple-500/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover:text-purple-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  Organizer
                </div>
                <span className="text-[10px] text-slate-400 block font-mono mt-0.5">Prof. Vikram</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 underline underline-offset-4">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
