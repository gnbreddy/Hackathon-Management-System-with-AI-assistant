import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, User, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data);
            navigate('/dashboard');
        } catch (error) {
            alert('Login failed. Check credentials.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md animate-slide-up z-10">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-4xl font-bold tracking-tight text-textMain mb-2">Welcome Back</h1>
                    <p className="text-textMuted">Sign in to your EHub account to continue.</p>
                </div>

                <form onSubmit={handleLogin} className="glass-card p-8 sm:p-10">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textMain/80 pl-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                                <input
                                    type="text"
                                    placeholder="Enter your username"
                                    className="mac-input pl-12"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-textMain/80 pl-1">Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="mac-input pl-12"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="mac-button w-full mt-4 group"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                            {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-textMuted">
                        Don't have an account?{' '}
                        <a href="/register" className="text-primary hover:text-primaryHover font-medium transition-colors">
                            Create one now
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}