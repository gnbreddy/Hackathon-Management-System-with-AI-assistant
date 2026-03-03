import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data);
            navigate('/dashboard'); // Redirect after login
        } catch (error) {
            alert('Login failed. Check credentials.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md w-96">
                <h2 className="mb-4 text-2xl font-bold">Login to EHub</h2>
                <input type="text" placeholder="Username" className="w-full p-2 mb-4 border rounded" 
                       value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" className="w-full p-2 mb-4 border rounded" 
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">
                    Login
                </button>
            </form>
        </div>
    );
}