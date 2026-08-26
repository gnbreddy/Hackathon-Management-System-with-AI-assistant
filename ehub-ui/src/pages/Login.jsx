import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  KeyRound,
  CheckCircle2,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Forgot Password / Reset Account Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP
  const [resetLoading, setResetLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please enter both email and password.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password
      });
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

  const handleSendResetOtp = async (e) => {
    e?.preventDefault();
    if (!resetEmail) {
      setToast({ message: 'Please enter your registered email address.', type: 'error' });
      return;
    }

    try {
      setResetLoading(true);
      const res = await api.post('/auth/forgot-password', {
        email: resetEmail.trim().toLowerCase()
      });
      setResetStep(2);
      setToast({ message: res.data?.message || '6-digit OTP sent to your email!', type: 'info' });
    } catch (err) {
      const msg = err.response?.data?.message || 'No account found with this email.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e) => {
    e?.preventDefault();
    if (!resetOtp || resetOtp.length !== 6) {
      setToast({ message: 'Please enter the 6-digit OTP code.', type: 'error' });
      return;
    }

    try {
      setResetLoading(true);
      const res = await api.post('/auth/reset-account-verify', {
        email: resetEmail.trim().toLowerCase(),
        otpCode: resetOtp.trim()
      });

      setShowForgotModal(false);
      setToast({
        message: res.data?.message || 'Account reset verified! You can now create your fresh password.',
        type: 'success'
      });

      // Redirect to register page after short delay
      setTimeout(() => {
        navigate('/register');
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code. Credentials preserved.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendResetOtp = async () => {
    try {
      setResending(true);
      const res = await api.post('/auth/forgot-password', {
        email: resetEmail.trim().toLowerCase()
      });
      setToast({ message: res.data?.message || 'A new 6-digit OTP has been sent.', type: 'info' });
    } catch (err) {
      setToast({ message: 'Failed to resend OTP code.', type: 'error' });
    } finally {
      setResending(false);
    }
  };

  const openForgotModal = () => {
    setResetEmail(email || '');
    setResetOtp('');
    setResetStep(1);
    setShowForgotModal(true);
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Password
                </label>
                <button
                  type="button"
                  onClick={openForgotModal}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                >
                  Forgot Password?
                </button>
              </div>
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

      {/* Forgot Password / Reset Account Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Reset Account & Password</h3>
              <p className="text-xs text-slate-300 mt-1">
                {resetStep === 1
                  ? 'Enter your registered academic email to receive a 6-digit verification code.'
                  : `We sent a 6-digit OTP to ${resetEmail}. Verify to reset your credentials.`}
              </p>
            </div>

            {/* Step 1: Request OTP */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                    Registered Academic Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="student@vitapstudent.ac.in"
                      className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: Verify OTP & Reset */}
            {resetStep === 2 && (
              <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Upon successful OTP verification, your old password and credentials will be cleared so you can re-register freshly.
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full text-center tracking-[0.75em] text-2xl font-mono py-3 rounded-xl glass-input border-indigo-500/40 text-white font-bold"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || resetOtp.length !== 6}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resetLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Reset Account</span>
                    </>
                  )}
                </button>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setResetStep(1)}
                    className="text-slate-400 hover:text-white"
                  >
                    ← Change Email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendResetOtp}
                    disabled={resending}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                    <span>Resend OTP</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
