import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);

    const [newEvent, setNewEvent] = useState({ name: '', maxTeamSize: 4 });
    const [newTeam, setNewTeam] = useState({ name: '', eventId: '' });
    const [newSubmission, setNewSubmission] = useState({ teamId: '', githubUrl: '' });
    const [leaderboard, setLeaderboard] = useState([]);
    const navigate = useNavigate();

   const fetchData = async () => {
    try {
        const [eventsRes, teamsRes, subRes, leaderRes] = await Promise.all([
            api.get('/events'),
            api.get('/teams'),
            api.get('/submissions'),
            api.get('/submissions/leaderboard') // New endpoint
        ]);
        setEvents(eventsRes.data);
        setTeams(teamsRes.data);
        setSubmissions(subRes.data);
        setLeaderboard(leaderRes.data);
    } catch (error) {
            if (error.response?.status === 401) handleLogout();
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', newEvent);
            setNewEvent({ name: '', maxTeamSize: 4 });
            fetchData();
        } catch (err) { alert("Failed to create event"); }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teams', { ...newTeam, tags: [] });
            setNewTeam({ name: '', eventId: '' });
            fetchData();
        } catch (err) { alert("Failed to create team"); }
    };

    const handleJoinTeam = async (teamId) => {
        const username = prompt("Enter your registered username to join:");
        if (!username) return;
        try {
            await api.post(`/teams/${teamId}/join?username=${username}`);
            alert("Joined successfully!");
            fetchData();
        } catch (err) { alert(err.response?.data || "Failed to join team"); }
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/submissions', newSubmission);
            setNewSubmission({ teamId: '', githubUrl: '' });
            alert("Project submitted successfully!");
            fetchData();
        } catch (err) { alert("Failed to submit project"); }
    };

    const handleEvaluate = async (submissionId) => {
        try {
            await api.post(`/submissions/${submissionId}/evaluate`);
            alert("Evaluation triggered in background! Refresh shortly to see results.");
        } catch (err) { alert("Failed to trigger evaluation"); }
    };

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-800">EHub Dashboard</h1>
                <div>
                    <button onClick={fetchData} className="px-4 py-2 mr-4 text-white bg-blue-500 rounded hover:bg-blue-600">Refresh Data</button>
                    <button onClick={handleLogout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">Logout</button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {/* 1. Create Event */}
                <form onSubmit={handleCreateEvent} className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-semibold">1. Organize Event</h2>
                    <input type="text" placeholder="Event Name" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} className="w-full p-2 mb-2 border rounded" required />
                    <input type="number" placeholder="Max Team Size" value={newEvent.maxTeamSize} onChange={e => setNewEvent({...newEvent, maxTeamSize: e.target.value})} className="w-full p-2 mb-4 border rounded" required min="1"/>
                    <button type="submit" className="w-full p-2 text-white bg-purple-500 rounded hover:bg-purple-600">Create Event</button>
                </form>

                {/* 2. Create Team */}
                <form onSubmit={handleCreateTeam} className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-semibold">2. Register Team</h2>
                    <input type="text" placeholder="Team Name" value={newTeam.name} onChange={e => setNewTeam({...newTeam, name: e.target.value})} className="w-full p-2 mb-2 border rounded" required />
                    <select value={newTeam.eventId} onChange={e => setNewTeam({...newTeam, eventId: e.target.value})} className="w-full p-2 mb-4 border rounded" required>
                        <option value="">Select Event...</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                    <button type="submit" className="w-full p-2 text-white bg-blue-500 rounded hover:bg-blue-600">Create Team</button>
                </form>

                {/* 3. Submit Project */}
                <form onSubmit={handleSubmitProject} className="p-6 bg-white rounded-lg shadow">
                    <h2 className="mb-4 text-xl font-semibold">3. Submit Project</h2>
                    <input type="url" placeholder="GitHub Repository URL" value={newSubmission.githubUrl} onChange={e => setNewSubmission({...newSubmission, githubUrl: e.target.value})} className="w-full p-2 mb-2 border rounded" required />
                    <select value={newSubmission.teamId} onChange={e => setNewSubmission({...newSubmission, teamId: e.target.value})} className="w-full p-2 mb-4 border rounded" required>
                        <option value="">Select Your Team...</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <button type="submit" className="w-full p-2 text-white bg-green-500 rounded hover:bg-green-600">Submit GitHub Link</button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Active Events List */}
                <div className="p-6 bg-white rounded-lg shadow h-64 overflow-y-auto">
                    <h2 className="mb-4 text-xl font-semibold border-b pb-2">Active Events</h2>
                    <ul className="space-y-3">
                        {events.map(event => (
                            <li key={event.id} className="p-3 border rounded bg-gray-50">
                                <strong className="block text-lg">{event.name}</strong>
                                <span className="text-sm text-gray-600">Max Team Size: {event.maxTeamSize}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Teams List */}
                <div className="p-6 bg-white rounded-lg shadow h-64 overflow-y-auto">
                    <h2 className="mb-4 text-xl font-semibold border-b pb-2">Registered Teams</h2>
                    <ul className="space-y-3">
                        {teams.map(team => (
                            <li key={team.id} className="p-3 border rounded bg-gray-50 flex justify-between items-center">
                                <div>
                                    <strong className="block">{team.name}</strong>
                                    <span className="text-xs text-gray-500">Members: {team.members?.length || 0} / {team.event?.maxTeamSize || 'N/A'}</span>
                                </div>
                                <button onClick={() => handleJoinTeam(team.id)} className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">Join</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Submissions & AI Evaluations List */}
            <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="mb-4 text-xl font-semibold border-b pb-2">Project Submissions & AI Evaluation</h2>
                <ul className="space-y-4">
                    {submissions.length === 0 ? <p className="text-gray-500">No projects submitted yet.</p> : submissions.map(sub => (
                        <li key={sub.id} className="p-4 border rounded bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1">
                                <strong className="block text-lg">Team ID: {sub.team?.id || 'Unknown'}</strong>
                                <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm break-all">{sub.githubUrl}</a>
                                <div className="mt-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded ${sub.status === 'EVALUATED' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {sub.status}
                                    </span>
                                    {sub.aiScore && <span className="ml-3 font-bold text-purple-700">AI Score: {sub.aiScore}/100</span>}
                                </div>
                                {sub.aiSummary && <p className="mt-2 text-sm text-gray-700 bg-white p-2 border rounded italic">"{sub.aiSummary}"</p>}
                            </div>
                            {sub.status !== 'EVALUATED' && (
                                <button onClick={() => handleEvaluate(sub.id)} className="px-4 py-2 text-white bg-indigo-500 rounded hover:bg-indigo-600 whitespace-nowrap">
                                    Run AI Evaluation
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-8 p-6 bg-white rounded-lg shadow">
    <h2 className="mb-4 text-2xl font-bold text-purple-800 border-b pb-2">🏆 Global Leaderboard</h2>
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-100">
                    <th className="p-3">Rank</th>
                    <th className="p-3">Team</th>
                    <th className="p-3">Project</th>
                    <th className="p-3 text-right">AI Score</th>
                </tr>
            </thead>
            <tbody>
                {leaderboard.map((sub, index) => (
                    <tr key={sub.id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-bold">#{index + 1}</td>
                        <td className="p-3">{sub.team?.name || 'Unknown Team'}</td>
                        <td className="p-3"><a href={sub.githubUrl} className="text-blue-500 hover:underline">Link</a></td>
                        <td className="p-3 text-right font-mono text-purple-700 font-bold">{sub.aiScore}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>
        </div>
    );
}