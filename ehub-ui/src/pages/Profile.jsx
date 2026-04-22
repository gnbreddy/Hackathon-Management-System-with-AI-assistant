import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { User, Mail, Hash, Shield, Activity, ArrowLeft, Loader2 } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/users/profile');
                setProfile(res.data);
            } catch (err) {
                setError('Failed to load profile details');
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <p className="text-red-500 font-medium mb-4">{error}</p>
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:underline flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto">
                <button 
                    onClick={() => navigate('/')}
                    className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-blue-600 h-32 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                                <User className="w-12 h-12 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-16 pb-8 px-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">{profile.fullName}</h1>
                            <p className="text-gray-500 flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${profile.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                    {profile.role}
                                </span>
                                • Joined as {profile.status.toLowerCase()} member
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <User className="w-3 h-3" /> Username
                                </p>
                                <p className="text-gray-900 font-semibold">{profile.username}</p>
                            </div>

                            <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> Email Address
                                </p>
                                <p className="text-gray-900 font-semibold">{profile.email}</p>
                            </div>

                            <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> Registration ID
                                </p>
                                <p className="text-gray-900 font-semibold">{profile.registrationNumber}</p>
                            </div>

                            <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Account Role
                                </p>
                                <p className="text-gray-900 font-semibold capitalize">{profile.role.toLowerCase()}</p>
                            </div>

                            <div className="space-y-1 p-4 bg-gray-50 rounded-2xl border border-gray-100 md:col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                    <Activity className="w-3 h-3" /> Account Status
                                </p>
                                <p className="text-gray-900 font-semibold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    {profile.status}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <p className="text-center text-gray-400 text-xs mt-8 italic">
                    All registration details are sourced from your secure institutional record.
                </p>
            </div>
        </div>
    );
}
