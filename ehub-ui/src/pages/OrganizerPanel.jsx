import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import api from '../api/axios';
import Toast from '../components/Toast';
import ScoreCard from '../components/ScoreCard';
import {
  Shield,
  Layers,
  PlusCircle,
  PlayCircle,
  CheckCircle2,
  Users,
  Award,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Code2,
  BrainCircuit,
  Eye,
  X,
  AlertTriangle
} from 'lucide-react';

const phases = [
  { id: 'REGISTRATION', label: '1. Registration Phase', desc: 'Accept team formations & participant signups' },
  { id: 'CODING', label: '2. Coding Window', desc: 'Allow GitHub repository submissions' },
  { id: 'JUDGING', label: '3. AI Judging & Review', desc: 'Run Gemini AI rubric evaluation engine' },
  { id: 'FINISHED', label: '4. Finished / Awards', desc: 'Publish final standings and conclude event' },
];

export default function OrganizerPanel() {
  const { user } = useAuth();
  const { events, activeEvent, setActiveEvent, refreshEvents } = useEvent();

  const [submissions, setSubmissions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [inspectSubmission, setInspectSubmission] = useState(null);
  const [bulkGrading, setBulkGrading] = useState(false);

  // Create Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventBanner, setNewEventBanner] = useState('');
  const [newEventMinTeam, setNewEventMinTeam] = useState(1);
  const [newEventMaxTeam, setNewEventMaxTeam] = useState(4);
  const [creating, setCreating] = useState(false);

  const fetchOrganizerData = useCallback(async () => {
    if (!activeEvent) return;

    try {
      setLoading(true);

      const [subRes, teamRes] = await Promise.all([
        api.get(`/submissions/event/${activeEvent.id}`),
        api.get(`/teams/event/${activeEvent.id}`)
      ]);

      setSubmissions(subRes.data);
      setTeams(teamRes.data);
    } catch (err) {
      console.error('Error loading organizer data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeEvent]);

  useEffect(() => {
    fetchOrganizerData();
  }, [fetchOrganizerData]);

  const handleAdvancePhase = async (targetPhase) => {
    if (!window.confirm(`Are you sure you want to transition event lifecycle to: ${targetPhase}?`)) {
      return;
    }

    try {
      const res = await api.patch(`/events/${activeEvent.id}/phase`, { targetPhase });
      setActiveEvent(res.data);
      refreshEvents();
      setToast({ message: `Lifecycle advanced to ${targetPhase}!`, type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update phase.';
      setToast({ message: msg, type: 'error' });
    }
  };

  const handleBulkEvaluate = async () => {
    try {
      setBulkGrading(true);
      const res = await api.post(`/submissions/bulk-evaluate/${activeEvent.id}`);
      setToast({ message: res.data.message || 'Queued bulk AI evaluation!', type: 'success' });
      
      // Reload after brief delay
      setTimeout(() => {
        fetchOrganizerData();
      }, 2000);
    } catch (err) {
      setToast({ message: 'Failed to trigger bulk evaluation.', type: 'error' });
    } finally {
      setBulkGrading(false);
    }
  };

  const handleSingleEvaluate = async (subId) => {
    try {
      await api.post(`/submissions/${subId}/evaluate`);
      setToast({ message: 'AI evaluation re-triggered.', type: 'info' });
      setTimeout(fetchOrganizerData, 1500);
    } catch (err) {
      setToast({ message: 'Evaluation request failed.', type: 'error' });
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      setToast({ message: 'Title is required.', type: 'error' });
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/events', {
        title: newEventTitle,
        description: newEventDesc,
        bannerUrl: newEventBanner || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        minTeamSize: Number(newEventMinTeam),
        maxTeamSize: Number(newEventMaxTeam)
      });

      refreshEvents();
      setActiveEvent(res.data);
      setShowCreateModal(false);
      setNewEventTitle('');
      setNewEventDesc('');
      setToast({ message: `Event '${res.data.title}' created successfully!`, type: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create event.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const currentPhaseIndex = phases.findIndex(p => p.id === activeEvent?.currentPhase);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ⚡ Organizer Command Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hackathon Lifecycle & Administration
          </h1>
          <p className="text-sm text-slate-400">
            Control lifecycle state machines, manage submissions, and execute AI evaluation pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-glow-purple hover:shadow-glow transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Hackathon</span>
          </button>
        </div>
      </div>

      {activeEvent && (
        <>
          {/* State Machine Controller Card */}
          <div className="glass-card rounded-2xl p-6 border border-purple-500/30 bg-purple-950/10 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <BrainCircuit className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">Event State Machine Progression</h2>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                CURRENT: {activeEvent.currentPhase}
              </span>
            </div>

            {/* Step Progression Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {phases.map((phase, idx) => {
                const isCurrent = phase.id === activeEvent.currentPhase;
                const isPassed = idx < currentPhaseIndex;
                const isNext = idx === currentPhaseIndex + 1;

                return (
                  <div
                    key={phase.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrent
                        ? 'bg-purple-900/40 border-purple-500/60 shadow-glow-purple ring-1 ring-purple-500/50'
                        : isPassed
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300'
                        : 'bg-surface-100/60 border-white/5 text-slate-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">{phase.label}</span>
                        {isPassed && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mb-3">
                        {phase.desc}
                      </p>
                    </div>

                    {isNext && (
                      <button
                        onClick={() => handleAdvancePhase(phase.id)}
                        className="w-full py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-glow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>Advance to {phase.id}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    {isCurrent && (
                      <span className="text-[10px] font-mono text-purple-300 font-semibold text-center block py-1 bg-purple-500/20 rounded-lg">
                        Active State
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submissions & Bulk Grading Section */}
          <div className="glass-card rounded-2xl p-6 border border-white/10 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-cyan-400" />
                  Incoming Project Submissions ({submissions.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Inspect codebases and execute automated Gemini rubric grading.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchOrganizerData}
                  className="p-2 rounded-xl bg-surface-100 hover:bg-surface-hover text-slate-300 border border-white/10 text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={handleBulkEvaluate}
                  disabled={bulkGrading || submissions.length === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-glow-cyan transition-all disabled:opacity-50"
                >
                  <BrainCircuit className={`w-4 h-4 ${bulkGrading ? 'animate-spin' : ''}`} />
                  <span>{bulkGrading ? 'Batch Scoring...' : 'Run Bulk AI Grading'}</span>
                </button>
              </div>
            </div>

            {/* Submissions Table */}
            {submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider">
                      <th className="py-3 px-3">Team</th>
                      <th className="py-3 px-3">Repository</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Quality</th>
                      <th className="py-3 px-3 text-center">Complete</th>
                      <th className="py-3 px-3 text-center">Docs</th>
                      <th className="py-3 px-3 text-center">Innov</th>
                      <th className="py-3 px-3 text-right">Total</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-white">
                          {sub.teamName}
                        </td>
                        <td className="py-3.5 px-3">
                          <a
                            href={sub.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center gap-1 max-w-[200px] truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{sub.githubUrl.replace('https://github.com/', '')}</span>
                          </a>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-md border ${
                            sub.status === 'EVALUATED'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {sub.codeQualityScore ? sub.codeQualityScore.toFixed(1) : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {sub.completenessScore ? sub.completenessScore.toFixed(1) : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {sub.documentationScore ? sub.documentationScore.toFixed(1) : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                          {sub.innovationScore ? sub.innovationScore.toFixed(1) : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-indigo-300 text-sm">
                          {sub.totalScore ? `${sub.totalScore.toFixed(1)}/100` : '-'}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setInspectSubmission(sub)}
                              className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 hover:text-white border border-white/10"
                              title="Inspect AI Scorecard"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleSingleEvaluate(sub.id)}
                              className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30"
                              title="Trigger AI Evaluation"
                            >
                              <BrainCircuit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-white/10 rounded-xl">
                <p className="text-xs text-slate-400">No submissions uploaded for this event yet.</p>
              </div>
            )}
          </div>

          {/* Registered Teams Overview */}
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Registered Teams ({teams.length})
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((t) => (
                <div key={t.id} className="p-4 rounded-xl bg-surface-100/60 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-white text-sm">{t.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {t.joinCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2">Leader: {t.leaderName}</p>
                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="font-semibold text-[11px] text-slate-400">Members ({t.members?.length || 0}):</div>
                    {t.members?.map(m => (
                      <div key={m.id} className="text-[11px] text-slate-300 flex justify-between">
                        <span>• {m.fullName}</span>
                        <span className="font-mono text-slate-500">{m.registrationNumber}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Inspect Scorecard Modal */}
      {inspectSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl relative my-8">
            <button
              onClick={() => setInspectSubmission(null)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-surface-100 hover:bg-surface-hover text-white border border-white/20 shadow-xl"
            >
              <X className="w-4 h-4" />
            </button>
            <ScoreCard
              submission={inspectSubmission}
              onReEvaluate={() => handleSingleEvaluate(inspectSubmission.id)}
            />
          </div>
        </div>
      )}

      {/* Create Hackathon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Hackathon Event</h3>
                  <p className="text-xs text-slate-400">Initialize a new event state machine</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Autonomous AI Buildathon 2026"
                  className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Description & Prompt
                </label>
                <textarea
                  rows={3}
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  placeholder="Describe theme, guidelines, and tracks..."
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Banner Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={newEventBanner}
                  onChange={(e) => setNewEventBanner(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newEventMinTeam}
                    onChange={(e) => setNewEventMinTeam(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newEventMaxTeam}
                    onChange={(e) => setNewEventMaxTeam(e.target.value)}
                    className="w-full glass-input rounded-xl px-3.5 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-glow-purple hover:shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Launch Hackathon in REGISTRATION Phase</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
