import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Hash,
  Shield,
  Code2,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ROLE_PARTICIPANT');
  
  // OTP Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [toast, setToast] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !registrationNumber || !password) {
      setToast({ message: 'All fields are required.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        registrationNumber: registrationNumber.trim().toUpperCase(),
        password,
        role
      });

      // Save token and prompt OTP verification modal
      login(res.data);
      setShowOtpModal(true);
      setToast({ message: 'Registration initiated! Please check your email for the 6-digit OTP.', type: 'info' });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check inputs.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setToast({ message: 'Please enter the 6-digit OTP sent to your email.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/verify-otp', {
        email: email.trim().toLowerCase(),
        otpCode: otpCode.trim()
      });
      login(res.data);
      setToast({ message: 'Account verified successfully!', type: 'success' });
      
      setTimeout(() => {
        if (role === 'ROLE_ORGANIZER') {
          navigate('/organizer');
        } else {
          navigate('/dashboard');
        }
      }, 500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP code.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResending(true);
      const res = await api.post('/auth/resend-otp', { email: email.trim().toLowerCase() });
      setToast({ message: res.data?.message || 'A new 6-digit OTP has been sent to your email.', type: 'info' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend OTP code.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Background ambient orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Top Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-glow mb-3">
            <div className="w-full h-full bg-[#090D16] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Create an <span className="gradient-text">EHub Account</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Join hackathons, assemble teams, and get AI-graded evaluations
          </p>
        </div>

        {/* Register Card */}
        <div className="glass-card rounded-3xl p-8 border border-white/10 shadow-2xl">
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alice Chen"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                Academic / University Email
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

            {/* Registration Number */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                Registration / Student ID Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value.toUpperCase())}
                  placeholder="22BCE1099"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1 font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  required
                />
              </div>
            </div>

            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 font-mono">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('ROLE_PARTICIPANT')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    role === 'ROLE_PARTICIPANT'
                      ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300 shadow-glow-cyan'
                      : 'border-white/10 bg-surface-100 text-slate-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <div className="text-left">
                    <span className="font-bold block">Participant</span>
                    <span className="text-[10px] text-slate-400">Join & build</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ROLE_ORGANIZER')}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    role === 'ROLE_ORGANIZER'
                      ? 'border-purple-500/60 bg-purple-500/10 text-purple-300 shadow-glow-purple'
                      : 'border-white/10 bg-surface-100 text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  <div className="text-left">
                    <span className="font-bold block">Organizer</span>
                    <span className="text-[10px] text-slate-400">Host & manage</span>
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-cyan transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 underline underline-offset-4">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Check Your Email</h3>
              <p className="text-xs text-slate-300 mt-1">
                We sent a 6-digit verification code to <span className="font-mono text-cyan-300">{email}</span>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.75em] text-2xl font-mono py-3 rounded-xl glass-input border-indigo-500/40 text-white font-bold"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-cyan transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Activate Account</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span>Code expires in 10 mins</span>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
