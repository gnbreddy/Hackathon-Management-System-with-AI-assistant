import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const successMsg = location.state?.message;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🎯</div>
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
                    <p className="text-gray-500 mt-1 text-sm">Sign in to your EHub account</p>
                </div>

                {successMsg && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">✅ {successMsg}</div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" placeholder="Your username"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="Your password"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                            value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-600 hover:underline font-medium">Register here</Link>
                </p>
            </div>
        </div>
    );
}