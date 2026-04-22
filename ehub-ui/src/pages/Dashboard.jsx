import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';
import {
    CalendarDays, Users, Github, BrainCircuit, Trophy, LogOut,
    RefreshCw, Plus, Link as LinkIcon, UserPlus, UserMinus,
    Star, MessageSquare, ChevronDown, ChevronUp, X, Bot, Award
} from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [reviewsMap, setReviewsMap] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Leaderboard state (per event)
    const [leaderboardEventId, setLeaderboardEventId] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    // Organizer team details
    const [expandedEvent, setExpandedEvent] = useState(null);
    const [expandedTeam, setExpandedTeam] = useState(null);

    // AI assistant
    const [aiAssistant, setAiAssistant] = useState({ open: false, subId: '', result: null, loading: false });

    // Forms
    const [newEvent, setNewEvent] = useState({ name: '', description: '', problemStatement: '', imageUrl: '', venue: '', eventDate: '', maxTeamSize: 4 });
    const [imageFile, setImageFile] = useState(null);
    const [newTeam, setNewTeam] = useState({ name: '', eventId: '' });
    const [newSubmission, setNewSubmission] = useState({ teamId: '', githubUrl: '', projectTitle: '', problemStatement: '', projectDescription: '', reviewRound: 1 });
    const [memberReg, setMemberReg] = useState({ teamId: '', regNo: '' });
    const [removeReg, setRemoveReg] = useState({ teamId: '', regNo: '' });
    const [reviewForm, setReviewForm] = useState({});  // keyed by submissionId

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [evRes, teamRes, subRes] = await Promise.all([
                api.get('/events'), api.get('/teams'), api.get('/submissions')
            ]);
            setEvents(evRes.data); setTeams(teamRes.data); setSubmissions(subRes.data);
        } catch (err) {
            if (err.response?.status === 401) handleLogout();
        } finally { setTimeout(() => setIsRefreshing(false), 400); }
    };

    const fetchReviews = async (submissionId) => {
        try {
            const res = await api.get(`/reviews/submission/${submissionId}`);
            setReviewsMap(prev => ({ ...prev, [submissionId]: res.data }));
        } catch (_) { }
    };

    const fetchLeaderboard = async (eventId, isOrganizer) => {
        if (!eventId) return;
        setLeaderboardLoading(true);
        try {
            const res = await api.get(`/events/${eventId}/leaderboard?organizerView=${isOrganizer}`);
            setLeaderboard(res.data);
        } catch (_) { setLeaderboard([]); } finally { setLeaderboardLoading(false); }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }
        try { const d = jwtDecode(token); setCurrentUser({ username: d.sub, role: d.role, id: d.id }); }
        catch { handleLogout(); }
        fetchData();
    }, []);

    useEffect(() => {
        submissions.forEach(s => fetchReviews(s.id));
    }, [submissions]);

    useEffect(() => {
        if (leaderboardEventId && currentUser) {
            fetchLeaderboard(leaderboardEventId, currentUser.role === 'ORGANIZER');
        }
    }, [leaderboardEventId]);

    // -------- Actions --------
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        try {
            let uploadedUrl = newEvent.imageUrl;
            if (imageFile) {
                const formData = new FormData();
                formData.append('file', imageFile);
                const res = await api.post('/events/upload-image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                uploadedUrl = res.data.url;
            }

            await api.post('/events', { ...newEvent, imageUrl: uploadedUrl, maxTeamSize: parseInt(newEvent.maxTeamSize) });
            setNewEvent({ name: '', description: '', problemStatement: '', imageUrl: '', venue: '', eventDate: '', maxTeamSize: 4 });
            setImageFile(null);
            fetchData();
            alert('Hackathon created!');
        } catch (err) { alert(err.response?.data?.error || err.response?.data || 'Failed to create hackathon'); }
    };

    const handleAdvancePhase = async (eventId) => {
        try { await api.patch(`/events/${eventId}/phase`); fetchData(); }
        catch (err) { alert(err.response?.data || 'Cannot advance phase'); }
    };

    const handlePublishLeaderboard = async (eventId, round) => {
        try {
            await api.post(`/events/${eventId}/publish-leaderboard?round=${round}`);
            fetchLeaderboard(eventId, true);
            alert(`Leaderboard published for Round ${round}! Participants can now see it.`);
        } catch { alert('Failed to publish leaderboard'); }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/teams?username=${currentUser.username}`, { ...newTeam, tags: [] });
            setNewTeam({ name: '', eventId: '' }); fetchData();
        } catch (err) { alert(err.response?.data || 'Failed to create team'); }
    };

    const handleJoinTeam = async (teamId) => {
        try { await api.post(`/teams/${teamId}/join?username=${currentUser.username}`); fetchData(); }
        catch (err) { alert(err.response?.data || 'Failed to join team'); }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/teams/${memberReg.teamId}/add-member?requesterUsername=${currentUser.username}&registrationNumber=${memberReg.regNo}`);
            setMemberReg({ teamId: '', regNo: '' }); fetchData();
        } catch (err) { alert(err.response?.data || 'Failed to add member'); }
    };

    const handleRemoveMember = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/teams/${removeReg.teamId}/remove-member?requesterUsername=${currentUser.username}&registrationNumber=${removeReg.regNo}`);
            setRemoveReg({ teamId: '', regNo: '' }); fetchData();
        } catch (err) { alert(err.response?.data || 'Failed to remove member'); }
    };

    const handleSubmitProject = async (e) => {
        e.preventDefault();
        try {
            await api.post('/submissions', { ...newSubmission, reviewRound: parseInt(newSubmission.reviewRound) });
            setNewSubmission({ teamId: '', githubUrl: '', projectTitle: '', problemStatement: '', projectDescription: '', reviewRound: 1 });
            fetchData(); alert('Project submitted!');
        } catch (err) { alert(err.response?.data || 'Failed to submit'); }
    };

    const handleSaveReview = async (submissionId) => {
        const form = reviewForm[submissionId] || {};
        try {
            await api.post('/reviews', {
                submissionId,
                roundNumber: parseInt(form.roundNumber) || 1,
                assignedComponents: form.assignedComponents || '',
                feedback: form.feedback || '',
                organizerScore: parseInt(form.organizerScore) || 0
            });
            fetchReviews(submissionId);
            // Refresh leaderboard if it's open
            if (leaderboardEventId) fetchLeaderboard(leaderboardEventId, true);
            alert('Review saved!');
        } catch { alert('Failed to save review'); }
    };

    const handleUpdateReview = async (reviewId, submissionId, updates) => {
        try {
            await api.put(`/reviews/${reviewId}`, updates);
            fetchReviews(submissionId);
            if (leaderboardEventId) fetchLeaderboard(leaderboardEventId, true);
        } catch { alert('Failed to update review'); }
    };

    const handleRunAiScore = async (reviewId, submissionId) => {
        try {
            await api.post(`/reviews/${reviewId}/ai-score`);
            alert('AI scoring started! Refresh in a few seconds.');
            setTimeout(() => fetchReviews(submissionId), 4000);
        } catch { alert('AI score failed'); }
    };

    const handleDisqualify = async (teamId, round) => {
        if (!window.confirm('Disqualify this team? They will not be able to submit further.')) return;
        try { await api.post(`/teams/${teamId}/disqualify?round=${round}`); fetchData(); }
        catch { alert('Failed to disqualify'); }
    };

    const myTeams = teams.filter(t => t.members?.some(m => m.id === currentUser?.id));

    const phaseColors = {
        REGISTRATION: 'bg-blue-100 text-blue-700',
        REVIEW_1: 'bg-amber-100 text-amber-700',
        CODING: 'bg-purple-100 text-purple-700',
        REVIEW_2: 'bg-orange-100 text-orange-700',
        FINISHED: 'bg-green-100 text-green-700'
    };

    if (!currentUser) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">EHub</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Logged in as <span className="font-semibold text-blue-600">{currentUser.username}</span> ·{' '}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentUser.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{currentUser.role}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium shadow-sm transition-colors">
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                    <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium shadow-sm transition-colors">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-8">
                {/* ═══════════════ ORGANIZER VIEW ═══════════════ */}
                {currentUser.role === 'ORGANIZER' && (
                    <>
                        {/* Create Hackathon */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-500" /> Create Hackathon</h2>
                            <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Hackathon Name*" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} required />
                                <input className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Venue" value={newEvent.venue} onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })} />
                                <input type="datetime-local" className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newEvent.eventDate} onChange={e => setNewEvent({ ...newEvent, eventDate: e.target.value })} />
                                <input type="number" className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Max Team Size" min="1" value={newEvent.maxTeamSize} onChange={e => setNewEvent({ ...newEvent, maxTeamSize: e.target.value })} required />
                                <div className="md:col-span-2 flex flex-col gap-2">
                                    <input className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" placeholder="Banner Image URL (Optional)" value={newEvent.imageUrl} onChange={e => setNewEvent({ ...newEvent, imageUrl: e.target.value })} disabled={!!imageFile} />
                                    <div className="flex items-center gap-2 px-2">
                                        <span className="text-sm font-semibold text-gray-500">OR Upload Image:</span>
                                        <input type="file" accept="image/*" className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" onChange={e => {
                                            setImageFile(e.target.files[0]);
                                            if (e.target.files[0]) setNewEvent({ ...newEvent, imageUrl: '' });
                                        }} />
                                    </div>
                                </div>
                                <textarea className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 resize-none h-20" placeholder="Description / Theme" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                                <textarea className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2 resize-none h-24" placeholder="Problem Statement*" value={newEvent.problemStatement} onChange={e => setNewEvent({ ...newEvent, problemStatement: e.target.value })} required />
                                <button type="submit" className="md:col-span-2 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                                    <Plus className="w-4 h-4" /> Create Hackathon
                                </button>
                            </form>
                        </section>

                        {/* Hackathons + Teams + Reviews */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-purple-500" /> Hackathons & Team Reviews</h2>
                            {events.length === 0 ? <p className="text-gray-400 text-sm">No hackathons yet.</p> : (
                                <div className="space-y-4">
                                    {events.map(ev => (
                                        <div key={ev.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                            {/* Event header */}
                                            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 bg-gray-50" onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}>
                                                <div className="flex items-center gap-3">
                                                    {ev.imageUrl && <img src={ev.imageUrl} className="w-12 h-12 rounded-lg object-cover" alt="" onError={e => e.target.style.display = 'none'} />}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{ev.name}</p>
                                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${phaseColors[ev.currentPhase] || 'bg-gray-100 text-gray-600'}`}>{ev.currentPhase}</span>
                                                            {ev.venue && <span className="text-xs text-gray-400">📍 {ev.venue}</span>}
                                                            {ev.eventDate && (
                                                                <>
                                                                    <span className="text-xs text-gray-400">🗓 {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                    <span className="text-xs text-gray-400">⏰ {new Date(ev.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={e => { e.stopPropagation(); handleAdvancePhase(ev.id); }} className="px-3 py-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors whitespace-nowrap">
                                                        Advance Phase →
                                                    </button>
                                                    {expandedEvent === ev.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                </div>
                                            </div>

                                            {expandedEvent === ev.id && (
                                                <div className="p-4 space-y-4">
                                                    {/* Event details */}
                                                    {ev.problemStatement && <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-xl"><span className="font-semibold">📋 Problem Statement:</span> {ev.problemStatement}</p>}
                                                    {ev.description && <p className="text-sm text-gray-600"><span className="font-semibold">ℹ️ Description:</span> {ev.description}</p>}

                                                    {/* Teams for this event */}
                                                    <div>
                                                        <p className="font-semibold text-gray-800 mb-2 text-sm">👥 Teams ({teams.filter(t => t.event?.id === ev.id).length})</p>
                                                        {teams.filter(t => t.event?.id === ev.id).length === 0
                                                            ? <p className="text-gray-400 text-xs">No teams yet.</p>
                                                            : (
                                                                <div className="space-y-4">
                                                                    {teams.filter(t => t.event?.id === ev.id).map(team => {
                                                                        const teamSubs = submissions.filter(s => s.team?.id === team.id);
                                                                        const isExpanded = expandedTeam === team.id;
                                                                        return (
                                                                            <div key={team.id} className={`rounded-xl border ${team.disqualified ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
                                                                                {/* Team header */}
                                                                                <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 rounded-xl" onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                                                                                    <div>
                                                                                        <p className="font-semibold text-gray-900 text-sm">{team.name} {team.disqualified && <span className="text-red-500 text-xs ml-1">DISQUALIFIED</span>}</p>
                                                                                        <p className="text-xs text-gray-400">Leader: {team.leader?.username} · {team.members?.length || 0} member(s)</p>
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2">
                                                                                        {!team.disqualified && (
                                                                                            <button onClick={e => { e.stopPropagation(); handleDisqualify(team.id, ev.currentPhase === 'REVIEW_1' ? 1 : 2); }} className="px-2 py-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-600 rounded-lg">
                                                                                                <UserMinus className="w-3 h-3 inline mr-1" />Disqualify
                                                                                            </button>
                                                                                        )}
                                                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Full Team Detail */}
                                                                                {isExpanded && (
                                                                                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                                                                                        {/* Members list */}
                                                                                        <div className="pt-3">
                                                                                            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Members</p>
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {team.members?.map(m => (
                                                                                                    <span key={m.id} className="px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-full text-gray-600">
                                                                                                        {m.username}{m.id === team.leader?.id ? ' 👑' : ''}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Submissions per round */}
                                                                                        {[1, 2].map(round => {
                                                                                            const sub = teamSubs.find(s => s.reviewRound === round);
                                                                                            const reviews = sub ? (reviewsMap[sub.id] || []).filter(r => r.roundNumber === round) : [];
                                                                                            const existingReview = reviews[0];
                                                                                            const formKey = sub ? sub.id : `${team.id}-${round}`;
                                                                                            const form = reviewForm[formKey] || {};

                                                                                            return (
                                                                                                <div key={round} className="bg-gray-50 rounded-xl p-4 space-y-3">
                                                                                                    <p className="text-sm font-bold text-gray-700">Round {round} {round === 1 ? '— Idea Submission' : '— Implementation'}</p>

                                                                                                    {/* Submission details */}
                                                                                                    {sub ? (
                                                                                                        <div className="text-sm space-y-1 text-gray-700">
                                                                                                            <p><span className="font-medium">📌 Title:</span> {sub.projectTitle || '—'}</p>
                                                                                                            <p><span className="font-medium">🎯 Problem:</span> {sub.problemStatement || '—'}</p>
                                                                                                            <p><span className="font-medium">💡 Description:</span> {sub.projectDescription || '—'}</p>
                                                                                                            <p><span className="font-medium">🐙 GitHub:</span> <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{sub.githubUrl}</a></p>
                                                                                                        </div>
                                                                                                    ) : (
                                                                                                        <p className="text-gray-400 text-xs italic">No submission yet for Round {round}.</p>
                                                                                                    )}

                                                                                                    {/* Existing review (read + edit score inline) */}
                                                                                                    {existingReview && (
                                                                                                        <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                                                                                                            <div className="flex items-center gap-3">
                                                                                                                <span className="text-xs font-bold text-purple-700">Saved Review</span>
                                                                                                                {existingReview.organizerScore != null && <span className="font-bold text-gray-800 text-sm">⭐ {existingReview.organizerScore}/100</span>}
                                                                                                                {existingReview.aiScore != null && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">🤖 AI: {existingReview.aiScore}</span>}
                                                                                                            </div>
                                                                                                            {existingReview.assignedComponents && <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg"><span className="font-semibold">Assigned:</span> {existingReview.assignedComponents}</p>}
                                                                                                            {existingReview.feedback && <p className="text-xs text-gray-600"><span className="font-semibold">Feedback:</span> {existingReview.feedback}</p>}
                                                                                                            {/* Inline quick score update */}
                                                                                                            <div className="flex items-center gap-2 pt-1">
                                                                                                                <input type="number" min="0" max="100" placeholder="Update score" className="w-32 px-2 py-1 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                                                                                                    value={form[`score_${existingReview.id}`] ?? existingReview.organizerScore ?? ''}
                                                                                                                    onChange={e => setReviewForm({ ...reviewForm, [formKey]: { ...form, [`score_${existingReview.id}`]: e.target.value } })}
                                                                                                                />
                                                                                                                <button onClick={() => handleUpdateReview(existingReview.id, sub?.id, { organizerScore: parseInt(form[`score_${existingReview.id}`]) })}
                                                                                                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg">Update Score</button>
                                                                                                                <button onClick={() => handleRunAiScore(existingReview.id, sub?.id)} className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                                                                                                                    <BrainCircuit className="w-3 h-3" /> AI Score
                                                                                                                </button>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* Add / Edit Review form */}
                                                                                                    {sub && (
                                                                                                        <div className="space-y-2">
                                                                                                            <p className="text-xs font-semibold text-gray-500">{existingReview ? 'Update Review' : 'Add Review'}</p>
                                                                                                            <div className="grid grid-cols-2 gap-2">
                                                                                                                <input type="number" min="0" max="100" placeholder="Score (0–100)" className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
                                                                                                                    value={form.organizerScore || ''}
                                                                                                                    onChange={e => setReviewForm({ ...reviewForm, [formKey]: { ...form, roundNumber: round, organizerScore: e.target.value } })} />
                                                                                                            </div>
                                                                                                            {round === 1 && (
                                                                                                                <textarea placeholder="Assigned Extra Components (participants will see this)" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm resize-none h-16"
                                                                                                                    value={form.assignedComponents || ''}
                                                                                                                    onChange={e => setReviewForm({ ...reviewForm, [formKey]: { ...form, roundNumber: round, assignedComponents: e.target.value } })} />
                                                                                                            )}
                                                                                                            <textarea placeholder="Feedback / Comments" className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm resize-none h-20"
                                                                                                                value={form.feedback || ''}
                                                                                                                onChange={e => setReviewForm({ ...reviewForm, [formKey]: { ...form, roundNumber: round, feedback: e.target.value } })} />
                                                                                                            <button onClick={() => handleSaveReview(sub.id)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg">
                                                                                                                <Star className="w-4 h-4" /> Save Review
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Leaderboard (Organizer) */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard</h2>
                            <div className="flex flex-wrap gap-3 mb-4 items-center">
                                <select className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={leaderboardEventId} onChange={e => setLeaderboardEventId(e.target.value)}>
                                    <option value="">Select Hackathon…</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                                {leaderboardEventId && (
                                    <>
                                        <button onClick={() => fetchLeaderboard(leaderboardEventId, true)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4" /> Refresh
                                        </button>
                                        <button onClick={() => handlePublishLeaderboard(leaderboardEventId, 1)} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Publish Round 1
                                        </button>
                                        <button onClick={() => handlePublishLeaderboard(leaderboardEventId, 2)} className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2">
                                            <Award className="w-4 h-4" /> Publish Round 2
                                        </button>
                                    </>
                                )}
                            </div>
                            {leaderboardLoading ? (
                                <div className="flex items-center justify-center h-20 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…</div>
                            ) : leaderboard.length === 0 ? (
                                <p className="text-gray-400 text-sm">Select a hackathon to view the leaderboard. Scores are based on organizer reviews.</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="p-4 text-left">Rank</th>
                                            <th className="p-4 text-left">Team</th>
                                            <th className="p-4 text-left">Members</th>
                                            <th className="p-4 text-right">Total Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, i) => (
                                            <tr key={entry.teamId} className="border-t border-gray-50 hover:bg-gray-50">
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-transparent text-gray-400'}`}>#{i + 1}</span>
                                                </td>
                                                <td className="p-4 font-medium text-gray-900">{entry.teamName}</td>
                                                <td className="p-4 text-gray-500">{entry.memberCount}</td>
                                                <td className="p-4 text-right font-mono font-bold text-gray-900 text-lg">{entry.totalScore}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </>
                )}

                {/* ═══════════════ PARTICIPANT VIEW ═══════════════ */}
                {currentUser.role === 'PARTICIPANT' && (
                    <>
                        {/* Active Hackathons */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-500" /> Active Hackathons</h2>
                            {events.length === 0 ? <p className="text-gray-400 text-sm">No hackathons available.</p> : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {events.map(ev => {
                                        const alreadyInTeamForEvent = myTeams.some(t => t.event?.id === ev.id);
                                        return (
                                            <div key={ev.id} className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer" onClick={() => setExpandedEvent(expandedEvent === ev.id ? null : ev.id)}>
                                                {ev.imageUrl && <img src={ev.imageUrl} className="w-full h-36 object-cover" alt={ev.name} onError={e => e.target.style.display = 'none'} />}
                                                <div className="p-4">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-semibold text-gray-900">{ev.name}</p>
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${phaseColors[ev.currentPhase] || 'bg-gray-100 text-gray-600'}`}>{ev.currentPhase}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 space-y-0.5">
                                                        {ev.venue && <p>📍 {ev.venue}</p>}
                                                        {ev.eventDate && (
                                                            <div className="flex items-center gap-3">
                                                                <p>🗓 {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                                <p>⏰ {new Date(ev.eventDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                                                            </div>
                                                        )}
                                                        {alreadyInTeamForEvent && <p className="text-green-600 font-medium">✅ You have a team in this hackathon</p>}
                                                    </div>
                                                    {expandedEvent === ev.id && (
                                                        <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 space-y-2">
                                                            {ev.problemStatement && <p><span className="font-semibold">Problem:</span> {ev.problemStatement}</p>}
                                                            {ev.description && <p><span className="font-semibold">Description:</span> {ev.description}</p>}
                                                            <p className="text-xs text-gray-400">Max team size: {ev.maxTeamSize}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* My Team */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> My Team</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                {/* Create Team */}
                                <form onSubmit={handleCreateTeam} className="space-y-3 bg-purple-50 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-purple-800">Create Team</p>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" placeholder="Team name" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} required />
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" value={newTeam.eventId} onChange={e => setNewTeam({ ...newTeam, eventId: e.target.value })} required>
                                        <option value="">Select Hackathon…</option>
                                        {events.filter(ev => !myTeams.some(t => t.event?.id === ev.id)).map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                    </select>
                                    <button type="submit" className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"><Plus className="w-4 h-4" /> Create</button>
                                </form>
                                {/* Add Member */}
                                <form onSubmit={handleAddMember} className="space-y-3 bg-green-50 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-green-800">Add Member (Leader only)</p>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" placeholder="Registration number" value={memberReg.regNo} onChange={e => setMemberReg({ ...memberReg, regNo: e.target.value })} required />
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" value={memberReg.teamId} onChange={e => setMemberReg({ ...memberReg, teamId: e.target.value })} required>
                                        <option value="">Select your team…</option>
                                        {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button type="submit" className="w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1"><UserPlus className="w-4 h-4" /> Add</button>
                                </form>
                                {/* Remove Member */}
                                <form onSubmit={handleRemoveMember} className="space-y-3 bg-red-50 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-red-800">Remove Member (Leader only)</p>
                                    <input className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" placeholder="Registration number to remove" value={removeReg.regNo} onChange={e => setRemoveReg({ ...removeReg, regNo: e.target.value })} required />
                                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm" value={removeReg.teamId} onChange={e => setRemoveReg({ ...removeReg, teamId: e.target.value })} required>
                                        <option value="">Select your team…</option>
                                        {myTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <button type="submit" className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-1"><UserMinus className="w-4 h-4" /> Remove</button>
                                </form>
                            </div>

                            {/* Team list + disqualification + Review 1 assigned components */}
                            {myTeams.map(team => {
                                const teamSubs = submissions.filter(s => s.team?.id === team.id);
                                const allReviews = teamSubs.flatMap(s => reviewsMap[s.id] || []);
                                const round1Review = allReviews.find(r => r.roundNumber === 1);
                                return (
                                    <div key={team.id} className={`p-4 rounded-xl border mb-3 ${team.disqualified ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-gray-900">{team.name}
                                                    {team.disqualified && <span className="text-red-600 text-xs font-bold ml-2">DISQUALIFIED (Round {team.qualificationRound})</span>}
                                                </p>
                                                <p className="text-xs text-gray-400">Event: {team.event?.name} · Leader: {team.leader?.username}</p>
                                            </div>
                                        </div>
                                        {team.disqualified && (
                                            <div className="mt-3 p-3 bg-red-100 rounded-xl text-sm text-red-800 font-medium">
                                                🚫 The hackathon has ended for your team. Thank you for participating! 🎉
                                                <p className="text-xs font-normal mt-1 text-red-600">You can still view the leaderboard below.</p>
                                            </div>
                                        )}
                                        {!team.disqualified && round1Review?.assignedComponents && (
                                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
                                                <p className="font-semibold mb-1">🎯 Assigned for Round 2 (by Organizer):</p>
                                                <p className="whitespace-pre-line">{round1Review.assignedComponents}</p>
                                            </div>
                                        )}
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {team.members?.map(m => (
                                                <span key={m.id} className="px-2 py-1 text-xs bg-white border border-gray-200 rounded-full text-gray-600">
                                                    {m.username}{m.id === team.leader?.id ? ' 👑' : ''}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </section>

                        {/* Submit Project */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Github className="w-5 h-5 text-gray-700" /> Submit Project</h2>
                            <form onSubmit={handleSubmitProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Project Title*" value={newSubmission.projectTitle} onChange={e => setNewSubmission({ ...newSubmission, projectTitle: e.target.value })} required />
                                <input type="url" className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="GitHub URL*" value={newSubmission.githubUrl} onChange={e => setNewSubmission({ ...newSubmission, githubUrl: e.target.value })} required />
                                <select className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" value={newSubmission.teamId} onChange={e => setNewSubmission({ ...newSubmission, teamId: e.target.value })} required>
                                    <option value="">Select Your Team*</option>
                                    {myTeams.filter(t => !t.disqualified).map(t => <option key={t.id} value={t.id}>{t.name} — {t.event?.name}</option>)}
                                </select>
                                <select className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500" value={newSubmission.reviewRound} onChange={e => setNewSubmission({ ...newSubmission, reviewRound: e.target.value })}>
                                    <option value={1}>Round 1 — Idea</option>
                                    <option value={2}>Round 2 — Implementation</option>
                                </select>
                                <textarea className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 resize-none h-20 md:col-span-2" placeholder="Problem Statement — What problem are you solving?" value={newSubmission.problemStatement} onChange={e => setNewSubmission({ ...newSubmission, problemStatement: e.target.value })} />
                                <textarea className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 resize-none h-28 md:col-span-2" placeholder="Project Description — Explain your solution" value={newSubmission.projectDescription} onChange={e => setNewSubmission({ ...newSubmission, projectDescription: e.target.value })} />
                                <button type="submit" className="md:col-span-2 flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors">
                                    <LinkIcon className="w-4 h-4" /> Submit Project
                                </button>
                            </form>
                        </section>

                        {/* Organizer Feedback */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-orange-500" /> Organizer Feedback</h2>
                            {submissions.filter(s => myTeams.some(t => t.id === s.team?.id)).length === 0 ? <p className="text-gray-400 text-sm">No submissions yet.</p> : (
                                <div className="space-y-4">
                                    {submissions.filter(s => myTeams.some(t => t.id === s.team?.id)).map(sub => {
                                        const reviews = reviewsMap[sub.id] || [];
                                        return (
                                            <div key={sub.id} className="border border-gray-100 rounded-xl p-4 space-y-3">
                                                <p className="font-semibold text-gray-900">{sub.projectTitle || 'Untitled'} <span className="text-xs text-gray-400">— Round {sub.reviewRound}</span></p>
                                                {reviews.length === 0 ? <p className="text-gray-400 text-xs">No review yet.</p> : reviews.map(r => (
                                                    <div key={r.id} className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm space-y-2">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">Round {r.roundNumber}</span>
                                                            {r.organizerScore != null && <span className="font-bold text-gray-800">⭐ {r.organizerScore}/100</span>}
                                                        </div>
                                                        {r.assignedComponents && (
                                                            <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                                                                <p className="text-xs font-semibold text-amber-800">🎯 Assigned for next round:</p>
                                                                <p className="text-amber-900 mt-1">{r.assignedComponents}</p>
                                                            </div>
                                                        )}
                                                        {r.feedback && <p className="text-gray-700"><span className="font-medium">Comment:</span> {r.feedback}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* Leaderboard (Participant) */}
                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Leaderboard <span className="text-xs text-gray-400 font-normal ml-auto">View only</span></h2>
                            <div className="flex gap-3 mb-4">
                                <select className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={leaderboardEventId} onChange={e => setLeaderboardEventId(e.target.value)}>
                                    <option value="">Select Hackathon…</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                                {leaderboardEventId && (
                                    <button onClick={() => fetchLeaderboard(leaderboardEventId, false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4" /> Refresh
                                    </button>
                                )}
                            </div>
                            {leaderboardLoading ? (
                                <div className="flex items-center justify-center h-20 text-gray-400"><RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading…</div>
                            ) : leaderboard.length === 0 ? (
                                <p className="text-gray-400 text-sm">{leaderboardEventId ? 'Scores haven\'t been published yet. Check back after your review round is complete.' : 'Select a hackathon to view the leaderboard.'}</p>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="p-4 text-left">Rank</th>
                                            <th className="p-4 text-left">Team</th>
                                            <th className="p-4 text-right">Total Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaderboard.map((entry, i) => {
                                            const isMyTeam = myTeams.some(t => t.id === entry.teamId);
                                            return (
                                                <tr key={entry.teamId} className={`border-t border-gray-50 ${isMyTeam ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-transparent text-gray-400'}`}>#{i + 1}</span>
                                                    </td>
                                                    <td className="p-4 font-medium text-gray-900">{entry.teamName} {isMyTeam && <span className="text-blue-500 text-xs ml-1">← You</span>}</td>
                                                    <td className="p-4 text-right font-mono font-bold text-gray-900 text-lg">{entry.totalScore}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </section>
                    </>
                )}
            </div>

            {/* AI Floating Assistant (Organizer only) */}
            {currentUser.role === 'ORGANIZER' && (
                <>
                    {aiAssistant.open && (
                        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-white">
                                    <BrainCircuit className="w-5 h-5" />
                                    <span className="font-semibold text-sm">AI Code Assistant</span>
                                </div>
                                <button onClick={() => setAiAssistant(p => ({ ...p, open: false }))} className="text-white/80 hover:text-white"><X className="w-4 h-4" /></button>
                            </div>
                            <div className="p-4 space-y-3">
                                <p className="text-xs text-gray-500">Enter a Submission ID to analyze the GitHub project for code quality and frontend-backend integration.</p>
                                <input className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Submission ID (e.g. 1)" value={aiAssistant.subId}
                                    onChange={e => setAiAssistant(p => ({ ...p, subId: e.target.value }))} />
                                <button onClick={async () => {
                                    if (!aiAssistant.subId) return;
                                    setAiAssistant(p => ({ ...p, loading: true, result: null }));
                                    try { const r = await api.post(`/submissions/${aiAssistant.subId}/evaluate`); setAiAssistant(p => ({ ...p, result: r.data, loading: false })); }
                                    catch (err) { setAiAssistant(p => ({ ...p, result: err.response?.data || 'Failed', loading: false })); }
                                }} disabled={aiAssistant.loading || !aiAssistant.subId}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2">
                                    {aiAssistant.loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing…</> : <><BrainCircuit className="w-4 h-4" /> Analyze Project</>}
                                </button>
                                {aiAssistant.result && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">{aiAssistant.result}</div>
                                )}
                            </div>
                        </div>
                    )}
                    <button onClick={() => setAiAssistant(p => ({ ...p, open: !p.open }))}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 hover:scale-110 text-white rounded-full shadow-xl flex items-center justify-center transition-all z-50">
                        <Bot className="w-7 h-7" />
                    </button>
                </>
            )}
        </div>
    );
}