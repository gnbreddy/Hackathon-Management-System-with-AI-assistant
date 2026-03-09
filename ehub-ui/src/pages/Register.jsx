import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, Mail, Hash, ChevronRight } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', email: '', registrationNumber: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', formData);
            alert('Registration successful!');
            navigate('/login');
        } catch (error) {
            alert('Registration failed.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[128px] animate-pulse delay-1000"></div>

            <div className="w-full max-w-md animate-slide-up z-10 my-8">
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl font-bold tracking-tight text-textMain mb-2">Create Account</h1>
                    <p className="text-textMuted">Join EHub and start organizing Hackathons.</p>
                </div>

                <form onSubmit={handleRegister} className="glass-card p-8 space-y-5">

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-textMain/80 pl-1">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                            <input name="fullName" placeholder="David John" onChange={handleChange} className="mac-input pl-12" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-textMain/80 pl-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                            <input name="username" placeholder="djohn" onChange={handleChange} className="mac-input pl-12" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-textMain/80 pl-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                            <input name="email" type="email" placeholder="david@example.com" onChange={handleChange} className="mac-input pl-12" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-textMain/80 pl-1">Registration Number</label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                            <input name="registrationNumber" placeholder="Reg No." onChange={handleChange} className="mac-input pl-12" required />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-textMain/80 pl-1">Password</label>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                            <input name="password" type="password" placeholder="••••••••" onChange={handleChange} className="mac-input pl-12" required />
                        </div>
                    </div>


                    <button
                        type="submit"
                        disabled={isLoading}
                        className="mac-button w-full mt-6 group bg-primary hover:bg-primaryHover"
                    >
                        {isLoading ? 'Creating account...' : 'Sign Up'}
                        {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                    </button>

                    <div className="mt-6 text-center text-sm text-textMuted">
                        Already have an account?{' '}
                        <a href="/login" className="text-primary hover:text-primaryHover font-medium transition-colors">
                            Sign in here
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
