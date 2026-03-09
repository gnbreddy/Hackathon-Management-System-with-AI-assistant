import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../api/axios';

export default function VerifyOtp() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(3600); // 60 minutes

    useEffect(() => {
        if (!email) { navigate('/register'); return; }
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [email, navigate]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/verify-otp', { email, otp });
            navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
        } catch (err) {
            setError(err.response?.data || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-green-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
                <div className="text-5xl mb-4">📬</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h1>
                <p className="text-gray-500 text-sm mb-1">We sent a 6-digit OTP to:</p>
                <p className="text-blue-600 font-semibold mb-6 break-all">{email}</p>

                {secondsLeft === 0 ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
                        OTP expired. Please <Link to="/register" className="underline font-medium">register again</Link>.
                    </div>
                ) : (
                    <div className="mb-2 text-sm text-gray-500">
                        Expires in <span className={`font-mono font-bold ${secondsLeft < 300 ? 'text-red-500' : 'text-green-600'}`}>{formatTime(secondsLeft)}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleVerify} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                        required
                        disabled={secondsLeft === 0}
                    />
                    <button type="submit" disabled={loading || secondsLeft === 0}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>

                <p className="text-xs text-gray-400 mt-6">
                    Didn't receive it? Check your spam folder, or{' '}
                    <Link to="/register" className="text-blue-600 hover:underline">start over</Link>.
                </p>
            </div>
        </div>
    );
}
