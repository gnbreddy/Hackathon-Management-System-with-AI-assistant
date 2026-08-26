import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import api from '../api/axios';
import PhaseBanner from '../components/PhaseBanner';
import TeamCard from '../components/TeamCard';
import ScoreCard from '../components/ScoreCard';
import Toast from '../components/Toast';
import {
  Users,
  PlusCircle,
  KeyRound,
  Search,
  Github,
  Link as LinkIcon,
  FileText,
  Send,
  Sparkles,
  Layers,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Lock,
  Globe
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { activeEvent } = useEvent();

  // State
  const [myTeam, setMyTeam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [matchmakingTeams, setMatchmakingTeams] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [toast, setToast] = useState(null);

  // Forms State
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSkills, setNewTeamSkills] = useState('');
  const [newTeamIsPublic, setNewTeamIsPublic] = useState(true);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  
  // Submission Form State
  const [githubUrl, setGithubUrl] = useState('');
  const [commitHash, setCommitHash] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [description, setDescription] = useState('');

  const fetchDashboardData = useCallback(async () => {
    if (!activeEvent) return;

    try {
      setLoading(true);

      // 1. Fetch My Team
      try {
        const teamRes = await api.get(`/teams/my-team/${activeEvent.id}`);
        if (teamRes.status === 200 && teamRes.data) {
          setMyTeam(teamRes.data);
          
          // 2. Fetch Submission for team
          try {
            const subRes = await api.get(`/submissions/team/${teamRes.data.id}`);
            if (subRes.status === 200 && subRes.data) {
              setSubmission(subRes.data);
              setGithubUrl(subRes.data.githubUrl || '');
              setCommitHash(subRes.data.commitHash || '');
              setDemoUrl(subRes.data.demoUrl || '');
              setDescription(subRes.data.description || '');
            } else {
              setSubmission(null);
            }
          } catch (subErr) {
            setSubmission(null);
          }
        } else {
          setMyTeam(null);
          setSubmission(null);
        }
      } catch (err) {
        setMyTeam(null);
        setSubmission(null);
      }

      // 3. Fetch Matchmaking Teams
      try {
        const matchRes = await api.get(`/teams/matchmaking/${activeEvent.id}`, {
          params: { skill: searchSkill, onlyOpen: true }
        });
        setMatchmakingTeams(matchRes.data);
      } catch (matchErr) {
        console.error('Failed to fetch matchmaking teams', matchErr);
      }

    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [activeEvent, searchSkill]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Polling for evaluating submission updates
  useEffect(() => {
    if (submission && (submission.status === 'PENDING' || submission.status === 'EVALUATING')) {
      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/submissions/${submission.id}`);
          if (res.data && res.data.status === 'EVALUATED') {
            setSubmission(res.data);
            setToast({ message: `AI evaluation complete! Total Score: ${res.data.totalScore}/100`, type: 'success' });
            clearInterval(interval);
          }
        } catch (e) {
          // ignore
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [submission]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      setToast({ message: 'Team name is required.', type: 'error' });
      return;
    }

    try {
      const res = await api.post('/teams', {
        name: newTeamName,
        eventId: activeEvent.id,
        skillsRequired: newTeamSkills,
        isPublic: newTeamIsPublic
      });
      setMyTeam(res.data);
      setNewTeamName('');
      setNewTeamSkills('');
      setNewTeamIsPublic(true);
      setToast({ message: `Team '${res.data.name}' created! Share join code: ${res.data.joinCode}`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create team.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleToggleTeamVisibility = async (teamId, targetPublic) => {
    try {
      const res = await api.patch(`/teams/${teamId}/visibility`, { isPublic: targetPublic });
      setMyTeam(res.data);
      setToast({
        message: `Team is now ${targetPublic ? 'PUBLIC (open for matchmaking)' : 'PRIVATE (code-only squad)'}!`,
        type: 'success'
      });
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update visibility.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleJoinTeam = async (codeToJoin) => {
    const code = codeToJoin || joinCodeInput;
    if (!code) {
      setToast({ message: 'Please enter a join code.', type: 'error' });
      return;
    }

    try {
      const res = await api.post('/teams/join', { joinCode: code });
      setMyTeam(res.data);
      setJoinCodeInput('');
      setToast({ message: `Successfully joined team '${res.data.name}'!`, type: 'success' });
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join team.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleLeaveTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;
    try {
      await api.post(`/teams/${teamId}/leave`);
      setMyTeam(null);
      setSubmission(null);
      setToast({ message: 'You have left the team.', type: 'info' });
      fetchDashboardData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not leave team.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleSubmitProject = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      setToast({ message: 'GitHub repository URL is required.', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/submissions', {
        teamId: myTeam.id,
        githubUrl,
        commitHash,
        demoUrl,
        description
      });
      setSubmission(res.data);
      setToast({ message: 'Project submitted! AI evaluation pipeline triggered.', type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit repository.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReEvaluate = async () => {
    if (!submission) return;
    try {
      setEvaluating(true);
      const res = await api.post(`/submissions/${submission.id}/evaluate`);
      setSubmission(res.data);
      setToast({ message: 'AI re-evaluation queued...', type: 'info' });
    } catch (err) {
      setToast({ message: 'Failed to trigger re-evaluation.', type: 'error' });
    } finally {
      setEvaluating(false);
    }
  };

  if (!activeEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Active Hackathon Selected</h2>
        <p className="text-sm text-slate-400 mt-1">Please select an event from the top switcher or unlock with a code.</p>
      </div>
    );
  }

  const isCodingPhase = activeEvent.currentPhase === 'CODING' || activeEvent.currentPhase === 'JUDGING';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Global Phase Tracker Banner */}
      <PhaseBanner />

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Team & Matchmaking Hub */}
        <div className="lg:col-span-5 space-y-6">
          
          {myTeam ? (
            /* User's Existing Team Card */
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Your Team Roster
                </h2>
              </div>
              <TeamCard
                team={myTeam}
                isMyTeam={true}
                currentUser={user}
                onLeave={handleLeaveTeam}
                onToggleVisibility={handleToggleTeamVisibility}
              />
            </div>
          ) : (
            /* Team Formation & Join Hub */
            <div className="space-y-6">
              
              {/* Create Team Box */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-cyan-400" />
                  Create a New Team
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Form a squad and become team leader. Max capacity: {activeEvent.maxTeamSize} members.
                </p>

                <form onSubmit={handleCreateTeam} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Team Name
                    </label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. CyberVanguard"
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-semibold"
                      required
                    />
                  </div>

                  {/* Public vs Private Team Visibility Selector */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1.5">
                      Team Access Modifier
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTeamIsPublic(true)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          newTeamIsPublic
                            ? 'bg-cyan-500/15 border-cyan-500/60 text-white shadow-glow-sm'
                            : 'bg-surface-100/60 border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                          <Globe className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Public Team</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block leading-tight">Visible in skill matchmaking</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNewTeamIsPublic(false)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          !newTeamIsPublic
                            ? 'bg-purple-500/15 border-purple-500/60 text-white shadow-glow-purple'
                            : 'bg-surface-100/60 border-white/10 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                          <Lock className="w-3.5 h-3.5 text-purple-400" />
                          <span>Private Squad</span>
                        </div>
                        <span className="text-[9px] text-slate-400 block leading-tight">Friends join via Team Code</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Desired Matchmaking Skills
                    </label>
                    <input
                      type="text"
                      value={newTeamSkills}
                      onChange={(e) => setNewTeamSkills(e.target.value)}
                      placeholder="e.g. React, Spring Boot, PyTorch, UI/UX"
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-glow-sm hover:shadow-glow transition-all"
                  >
                    Form Team & Generate Code
                  </button>
                </form>
              </div>

              {/* Join with Code Box */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-400" />
                  Join Existing Team
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Have an invite code from your teammate? Enter it below:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="E-ABC123"
                    className="flex-1 glass-input rounded-xl px-3.5 py-2 text-xs font-mono font-bold tracking-wider"
                  />
                  <button
                    onClick={() => handleJoinTeam()}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-glow-purple transition-all"
                  >
                    Join
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* Skill Matchmaking Discovery Explorer */}
          {!myTeam && (
            <div className="glass-card rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-4 h-4 text-cyan-400" />
                  Find Public Teams Seeking Talent
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {matchmakingTeams.length} Open
                </span>
              </div>

              {/* Search by Skill Input */}
              <div className="relative mb-4">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchSkill}
                  onChange={(e) => setSearchSkill(e.target.value)}
                  placeholder="Filter by skill: AI, React, Cloud..."
                  className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2 text-xs"
                />
              </div>

              {matchmakingTeams.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {matchmakingTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      onJoin={handleJoinTeam}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs text-slate-400">No public open teams matching your search.</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Submission Portal & Live AI Scorecard */}
        <div className="lg:col-span-7 space-y-6">
          
          {myTeam ? (
            <>
              {/* Submission Portal Form */}
              <div className="glass-card rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">Repository Submission Portal</h2>
                      <p className="text-xs text-slate-400">
                        {isCodingPhase
                          ? 'Submit your project repository for autonomous Gemini AI grading'
                          : 'Submission window is active during CODING phase'}
                      </p>
                    </div>
                  </div>

                  {submission && (
                    <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
                      submission.status === 'EVALUATED'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {submission.status}
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmitProject} className="space-y-4">
                  
                  {/* GitHub Repo URL */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      GitHub Repository URL *
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/organization/project-name"
                        className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono font-medium"
                        required
                        disabled={!isCodingPhase}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Commit Hash */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                        Target Branch / Commit
                      </label>
                      <input
                        type="text"
                        value={commitHash}
                        onChange={(e) => setCommitHash(e.target.value)}
                        placeholder="main or 7-digit hash"
                        className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono"
                        disabled={!isCodingPhase}
                      />
                    </div>

                    {/* Live Demo URL */}
                    <div>
                      <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                        Live Demo URL (Optional)
                      </label>
                      <div className="relative">
                        <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="url"
                          value={demoUrl}
                          onChange={(e) => setDemoUrl(e.target.value)}
                          placeholder="https://my-demo-app.vercel.app"
                          className="w-full glass-input rounded-xl pl-9 pr-3.5 py-2 text-xs font-mono"
                          disabled={!isCodingPhase}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                      Project Description & Architecture Highlights
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Briefly describe what problem this solves, key technical challenges, and tech stack used..."
                      className="w-full glass-input rounded-xl px-3.5 py-2 text-xs leading-relaxed"
                      disabled={!isCodingPhase}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !isCodingPhase}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white font-semibold text-xs shadow-glow hover:shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>{submission ? 'Update Submission & Re-Score' : 'Submit Repository for AI Grading'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Scorecard Display */}
              {submission ? (
                <ScoreCard
                  submission={submission}
                  onReEvaluate={handleReEvaluate}
                  isEvaluating={evaluating || submission.status === 'EVALUATING'}
                />
              ) : (
                <div className="glass-card rounded-2xl p-8 border border-dashed border-white/10 text-center">
                  <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
                  <h3 className="text-sm font-bold text-slate-300">Awaiting Submission</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Submit your GitHub repo above. EHub's AI Engine will parse the codebase, evaluate against system rubrics, and generate a scorecard.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="glass-card rounded-2xl p-10 border border-white/10 text-center">
              <Users className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Join or Create a Team First</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                In order to submit projects and receive AI rubric evaluations, you must be part of a registered team for this hackathon.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
