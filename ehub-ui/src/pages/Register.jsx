import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    // Inside your Register component:
const [formData, setFormData] = useState({
    username: '', password: '', fullName: '', email: '', registrationNumber: ''
});

const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

const handleRegister = async (e) => {
    e.preventDefault();
    try {
        await api.post('/auth/register', formData);
        alert('Registration successful! Please login.');
        navigate('/login');
    } catch (error) {
        alert('Registration failed. Check if username/email already exists.');
    }
};

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { username, password });
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (error) {
            alert('Registration failed. Username might be taken.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleRegister} className="p-8 bg-white rounded shadow-md w-96">
                <h2 className="mb-4 text-2xl font-bold">Register for EHub</h2>
                <input type="text" placeholder="Username" className="w-full p-2 mb-4 border rounded" 
                       value={username} onChange={(e) => setUsername(e.target.value)} required />
                <input type="password" placeholder="Password" className="w-full p-2 mb-4 border rounded" 
                       value={password} onChange={(e) => setPassword(e.target.value)} required />
                       // Add these inputs to your form:
<input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
<input name="email" type="email" placeholder="Email ID" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
<input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
// ... keep existing username and password inputs
                <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">
                    Sign Up
                </button>
            </form>
        </div>
    );
}