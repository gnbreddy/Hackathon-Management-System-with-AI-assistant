import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', email: '', registrationNumber: ''
    });
    const [domainHint, setDomainHint] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'email') {
            if (value.endsWith('@vitap.ac.in')) setDomainHint('🎓 You will be registered as an Organizer');
            else if (value.endsWith('@vitapstudent.ac.in')) setDomainHint('🧑‍💻 You will be registered as a Participant');
            else if (value.includes('@')) setDomainHint('⚠️ Only @vitap.ac.in or @vitapstudent.ac.in emails are allowed');
            else setDomainHint('');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/auth/register', formData);
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="text-4xl mb-3">🚀</div>
                    <h1 className="text-3xl font-bold text-gray-900">Join EHub</h1>
                    <p className="text-gray-500 mt-1 text-sm">Use your institutional email to register</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input name="fullName" placeholder="Your full name" onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institutional Email</label>
                        <input name="email" type="email" placeholder="name@vitapstudent.ac.in" onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                        {domainHint && <p className={`text-xs mt-1 ${domainHint.startsWith('⚠️') ? 'text-amber-600' : 'text-green-600'}`}>{domainHint}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input name="username" placeholder="Choose a username" onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                        <input name="registrationNumber" placeholder="e.g. 21BCE0001" onChange={handleChange}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <input name="password" type={showPassword ? "text" : "password"} placeholder="Create a password" onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 pr-12" required />
                            <button type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>
                    <button type="submit" disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                        {loading ? 'Sending OTP...' : 'Register & Send OTP'}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
