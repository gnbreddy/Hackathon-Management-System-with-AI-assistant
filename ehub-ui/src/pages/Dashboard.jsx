import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Github, BrainCircuit, Trophy, LogOut, RefreshCw, Plus, Link as LinkIcon, UserPlus } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);

    const [newEvent, setNewEvent] = useState({ name: '', maxTeamSize: 4 });
    const [newTeam, setNewTeam] = useState({ name: '', eventId: '' });
    const [newSubmission, setNewSubmission] = useState({ teamId: '', githubUrl: '' });
    const [newMemberReg, setNewMemberReg] = useState({ teamId: '', regNo: '' });
    const [isRefreshing, setIsRefreshing] = useState(false);

    // User Session State
    const [currentUser, setCurrentUser] = useState(null);

    const navigate = useNavigate();

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [eventsRes, teamsRes, subRes, leaderRes] = await Promise.all([
                api.get('/events'),
                api.get('/teams'),
                api.get('/submissions'),
                api.get('/submissions/leaderboard')
            ]);
            setEvents(eventsRes.data);
            setTeams(teamsRes.data);
            setSubmissions(subRes.data);
            setLeaderboard(leaderRes.data);
        } catch (error) {
            if (error.response?.status === 401) handleLogout();
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setCurrentUser({
                    username: decoded.sub,
                    role: decoded.role,
                    id: decoded.id
                });
            } catch (err) {
                handleLogout();
            }
        }
        fetchData();
    }, []);

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
            await api.post(`/teams?username=${currentUser.username}`, { ...newTeam, tags: [] });
            setNewTeam({ name: '', eventId: '' });
            fetchData();
        } catch (err) { alert("Failed to create team: " + (err.response?.data || err.message)); }
    };

    const handleJoinTeam = async (teamId) => {
        try {
            await api.post(`/teams/${teamId}/join?username=${currentUser.username}`);
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

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberReg.teamId) {
            alert("Please select your team first");
            return;
        }
        try {
            await api.post(`/teams/${newMemberReg.teamId}/add-member?requesterUsername=${currentUser.username}&registrationNumber=${newMemberReg.regNo}`);
            setNewMemberReg({ teamId: '', regNo: '' });
            alert("Member added successfully!");
            fetchData();
        } catch (err) { alert(err.response?.data || "Failed to add member"); }
    };

    const handleEvaluate = async (submissionId) => {
        try {
            await api.post(`/submissions/${submissionId}/evaluate`);
            alert("Evaluation triggered gracefully! Refresh to see AI results.");
        } catch (err) { alert("Failed to trigger evaluation"); }
    };

    return (
        <div className="min-h-screen p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto animate-fade-in relative z-10">
            {/* Ambient Background Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none z-[-1]"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-300/30 rounded-full mix-blend-multiply filter blur-[100px] pointer-events-none z-[-1]"></div>

            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-textMain mb-2">EHub Space</h1>
                    <p className="text-textMuted text-lg">Manage hackathons, build teams, and evaluate projects.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="mac-button-secondary py-2 px-4 shadow-sm">
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Sync</span>
                    </button>
                    <button onClick={handleLogout} className="mac-button bg-red-500 hover:bg-red-600 text-white py-2 px-4 shadow-sm">
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </header>

            {/* Bento Box Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">

                {/* 1. Organize Event (ORGANIZER ONLY) */}
                {currentUser?.role === 'ORGANIZER' && (
                    <form onSubmit={handleCreateEvent} className="glass-card p-6 lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-100/50 rounded-xl text-blue-600"><CalendarDays className="w-6 h-6" /></div>
                            <h2 className="text-xl font-semibold text-textMain">Organize Event</h2>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Hackathon Name" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} className="mac-input" required />
                            <input type="number" placeholder="Max Team Size" value={newEvent.maxTeamSize} onChange={e => setNewEvent({ ...newEvent, maxTeamSize: e.target.value })} className="mac-input" required min="1" />
                            <button type="submit" className="mac-button w-full bg-blue-500 hover:bg-blue-600 mt-2 text-white">
                                <Plus className="w-4 h-4" /> Create Event
                            </button>
                        </div>
                    </form>
                )}

                {/* 2. Register Team */}
                <form onSubmit={handleCreateTeam} className="glass-card p-6 lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-100/50 rounded-xl text-purple-600"><Users className="w-6 h-6" /></div>
                        <h2 className="text-xl font-semibold text-textMain">Register Team</h2>
                    </div>
                    <div className="space-y-4">
                        <input type="text" placeholder="Awesome Team Name" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} className="mac-input" required />
                        <select value={newTeam.eventId} onChange={e => setNewTeam({ ...newTeam, eventId: e.target.value })} className="mac-input appearance-none bg-white/50" required>
                            <option value="" disabled>Select Event...</option>
                            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                        </select>
                        <button type="submit" className="mac-button w-full bg-purple-500 hover:bg-purple-600 mt-2 text-white">
                            <Plus className="w-4 h-4" /> Create Team
                        </button>
                    </div>
                </form>

                {/* 3. Submit Project (PARTICIPANT ONLY) */}
                {currentUser?.role === 'PARTICIPANT' && (
                    <form onSubmit={handleSubmitProject} className="glass-card p-6 lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-100/50 rounded-xl text-green-600"><Github className="w-6 h-6" /></div>
                            <h2 className="text-xl font-semibold text-textMain">Submit Project</h2>
                        </div>
                        <div className="space-y-4">
                            <input type="url" placeholder="https://github.com/..." value={newSubmission.githubUrl} onChange={e => setNewSubmission({ ...newSubmission, githubUrl: e.target.value })} className="mac-input" required />
                            <select value={newSubmission.teamId} onChange={e => setNewSubmission({ ...newSubmission, teamId: e.target.value })} className="mac-input appearance-none bg-white/50" required>
                                <option value="" disabled>Select Your Team...</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button type="submit" className="mac-button w-full bg-green-500 hover:bg-green-600 mt-2 text-white">
                                <LinkIcon className="w-4 h-4" /> Submit Repo
                            </button>
                        </div>
                    </form>
                )}

                {/* 4. Add Member (PARTICIPANT LEADER ONLY) */}
                {currentUser?.role === 'PARTICIPANT' && (
                    <form onSubmit={handleAddMember} className="glass-card p-6 lg:col-span-4 animate-slide-up" style={{ animationDelay: '0.35s' }}>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-100/50 rounded-xl text-orange-600"><UserPlus className="w-6 h-6" /></div>
                            <h2 className="text-xl font-semibold text-textMain">Manage Team</h2>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Peer Reg Number (e.g. 21BCE0001)" value={newMemberReg.regNo} onChange={e => setNewMemberReg({ ...newMemberReg, regNo: e.target.value })} className="mac-input" required />
                            <select value={newMemberReg.teamId} onChange={e => setNewMemberReg({ ...newMemberReg, teamId: e.target.value })} className="mac-input appearance-none bg-white/50" required>
                                <option value="" disabled>Select Your Team...</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                            <button type="submit" className="mac-button w-full bg-orange-500 hover:bg-orange-600 mt-2 text-white">
                                <Plus className="w-4 h-4" /> Add Member
                            </button>
                        </div>
                    </form>
                )}

                {/* Lists Area */}
                <div className="glass-card p-6 lg:col-span-6 flex flex-col h-[400px] animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h2 className="text-xl font-semibold text-textMain mb-4 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-textMuted" /> Active Events
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                        {events.length === 0 ? <p className="text-textMuted text-sm">No events running right now.</p> : events.map(event => (
                            <div key={event.id} className="p-4 bg-white/40 border border-surfaceBorder rounded-xl hover:bg-white/60 transition-colors">
                                <strong className="block text-lg font-medium text-textMain">{event.name}</strong>
                                <span className="text-sm text-textMuted">Max Group Size: {event.maxTeamSize}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card p-6 lg:col-span-6 flex flex-col h-[400px] animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h2 className="text-xl font-semibold text-textMain mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-textMuted" /> Registered Teams
                    </h2>
                    <div className="overflow-y-auto flex-1 pr-2 space-y-3">
                        {teams.length === 0 ? <p className="text-textMuted text-sm">No teams have registered yet.</p> : teams.map(team => (
                            <div key={team.id} className="p-4 bg-white/40 border border-surfaceBorder rounded-xl hover:bg-white/60 transition-colors flex justify-between items-center group">
                                <div>
                                    <strong className="block text-lg font-medium text-textMain">{team.name}</strong>
                                    <span className="text-sm text-textMuted">Members: {team.members?.length || 0}/{team.event?.maxTeamSize || '?'}</span>
                                </div>
                                {currentUser?.role === 'PARTICIPANT' && (
                                    <button onClick={() => handleJoinTeam(team.id)} className="mac-button-secondary py-1.5 px-4 text-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                        Join
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submissions & AI (ORGANIZER ONLY) */}
                {currentUser?.role === 'ORGANIZER' && (
                    <div className="glass-card p-6 lg:col-span-12 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                        <h2 className="text-xl font-semibold text-textMain mb-6 flex items-center gap-2">
                            <BrainCircuit className="w-5 h-5 text-primary" /> AI Evaluation HQ
                        </h2>
                        <div className="space-y-4">
                            {submissions.length === 0 ? <p className="text-textMuted">Awaiting project submissions...</p> : submissions.map(sub => (
                                <div key={sub.id} className="p-5 bg-white/50 border border-surfaceBorder rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-white/80 transition-all">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <strong className="text-lg font-medium">Team Repo: {sub.team?.name || `ID ${sub.team?.id}`}</strong>
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${sub.status === 'EVALUATED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {sub.status === 'EVALUATED' ? 'Scored' : 'Pending'}
                                            </span>
                                            {sub.aiScore && <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 shadow-sm border border-purple-200">
                                                Score: {sub.aiScore}/100
                                            </span>}
                                        </div>
                                        <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:text-primaryHover hover:underline text-sm font-medium flex items-center gap-1 w-fit">
                                            <Github className="w-4 h-4" /> {sub.githubUrl}
                                        </a>
                                        {sub.aiSummary && <p className="text-sm text-textMuted bg-white/60 p-3 rounded-xl mt-3 border border-surfaceBorder leading-relaxed">
                                            "{sub.aiSummary}"
                                        </p>}
                                    </div>
                                    {sub.status !== 'EVALUATED' && (
                                        <button onClick={() => handleEvaluate(sub.id)} className="mac-button py-2 px-5 whitespace-nowrap shadow-md text-black hover:text-white">
                                            <BrainCircuit className="w-4 h-4" /> Run AI Eval
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Global Leaderboard */}
                <div className="glass-card p-0 lg:col-span-12 overflow-hidden animate-slide-up" style={{ animationDelay: '0.7s' }}>
                    <div className="p-6 border-b border-surfaceBorder bg-white/40">
                        <h2 className="text-2xl font-bold text-textMain flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500/20" /> Hall of Fame Leaderboard
                        </h2>
                    </div>
                    {leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-textMuted">No evaluations completed yet to rank.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-surface/50 text-sm text-textMuted font-medium border-b border-surfaceBorder">
                                        <th className="p-4 pl-6 uppercase tracking-wider">Rank</th>
                                        <th className="p-4 uppercase tracking-wider">Team</th>
                                        <th className="p-4 uppercase tracking-wider">Project Link</th>
                                        <th className="p-4 text-right pr-6 uppercase tracking-wider">AI Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((sub, index) => (
                                        <tr key={sub.id} className="border-b last:border-0 border-surfaceBorder hover:bg-white/60 transition-colors group">
                                            <td className="p-4 pl-6 font-bold text-textMain">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-200 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-transparent text-textMuted'}`}>
                                                    #{index + 1}
                                                </div>
                                            </td>
                                            <td className="p-4 font-medium text-textMain">{sub.team?.name || 'Unknown Team'}</td>
                                            <td className="p-4">
                                                <a href={sub.githubUrl} className="text-primary hover:text-primaryHover inline-flex items-center gap-1 font-medium transition-colors">
                                                    View Source <LinkIcon className="w-3 h-3" />
                                                </a>
                                            </td>
                                            <td className="p-4 text-right pr-6 font-mono font-bold text-lg text-textMain">
                                                {sub.aiScore}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}