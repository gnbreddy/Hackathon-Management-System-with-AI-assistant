import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch data when the dashboard loads
        const fetchData = async () => {
            try {
                const eventsRes = await api.get('/events');
                const teamsRes = await api.get('/teams');
                setEvents(eventsRes.data);
                setTeams(teamsRes.data);
            } catch (error) {
                console.error("Failed to fetch data", error);
                // If unauthorized, token might be expired
                if (error.response?.status === 401) {
                    handleLogout();
                }
            }
        };
        fetchData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">EHub Dashboard</h1>
                <button 
                    onClick={handleLogout} 
                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Events Section */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-semibold border-b pb-2">Active Events</h2>
                    {events.length === 0 ? (
                        <p className="text-gray-500">No events found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {events.map(event => (
                                <li key={event.id} className="p-3 border rounded bg-gray-50">
                                    <strong className="block text-lg">{event.name}</strong>
                                    <span className="text-sm text-gray-600">{event.description}</span>
                                    <span className="block mt-2 text-xs font-bold text-blue-600 uppercase">
                                        Phase: {event.currentPhase}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Teams Section */}
                <div className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-semibold border-b pb-2">Registered Teams</h2>
                    {teams.length === 0 ? (
                        <p className="text-gray-500">No teams found.</p>
                    ) : (
                        <ul className="space-y-3">
                            {teams.map(team => (
                                <li key={team.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
                                    <div>
                                        <strong className="block">{team.name}</strong>
                                        <span className="text-xs text-gray-500">Event ID: {team.event?.id}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}