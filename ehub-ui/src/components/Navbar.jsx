import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import {
  Trophy,
  LayoutDashboard,
  Shield,
  LogOut,
  Sparkles,
  ChevronDown,
  Layers,
  UserCheck
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isOrganizer, logout } = useAuth();
  const { events, activeEvent, setActiveEvent } = useEvent();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090D16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-glow-sm group-hover:shadow-glow transition-all duration-300">
                <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  EHub
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    AI 2.0
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono -mt-0.5">Hackathon Engine</span>
              </div>
            </Link>

            {/* Event Switcher Dropdown */}
            {events.length > 0 && (
              <div className="relative hidden md:block">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100/80 border border-white/10 text-xs">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <select
                    value={activeEvent?.id || ''}
                    onChange={(e) => {
                      const selected = events.find(ev => ev.id === Number(e.target.value));
                      if (selected) setActiveEvent(selected);
                    }}
                    className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer pr-4"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id} className="bg-slate-900 text-slate-100">
                        {ev.title} ({ev.currentPhase})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          {isAuthenticated ? (
            <nav className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/dashboard')
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/leaderboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive('/leaderboard')
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Leaderboard</span>
              </Link>

              {isOrganizer && (
                <Link
                  to="/organizer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive('/organizer')
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="hidden sm:inline">Organizer Panel</span>
                </Link>
              )}
            </nav>
          ) : null}

          {/* Auth Actions / Profile */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden lg:flex flex-col items-end">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{user?.fullName}</span>
                    {user?.verified && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {user?.role === 'ROLE_ORGANIZER' ? '⚡ Organizer' : `🎓 ${user?.registrationNumber || 'Participant'}`}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold shadow-glow-sm hover:shadow-glow transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
