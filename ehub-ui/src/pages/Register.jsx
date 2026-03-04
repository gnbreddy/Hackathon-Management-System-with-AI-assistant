import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '', password: '', fullName: '', email: '', registrationNumber: ''
    });

    const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Registration successful!');
            navigate('/login');
        } catch (error) {
            alert('Registration failed.');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form onSubmit={handleRegister} className="p-8 bg-white rounded shadow-md w-96">
                <h2 className="mb-4 text-2xl font-bold">Register for EHub</h2>
                <input name="username" placeholder="Username" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input name="fullName" placeholder="Full Name" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input name="email" type="email" placeholder="Email ID" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <input name="registrationNumber" placeholder="Registration Number" onChange={handleChange} className="w-full p-2 mb-4 border rounded" required />
                <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">Sign Up</button>
            </form>
        </div>
    );
}