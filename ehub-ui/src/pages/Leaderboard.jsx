import React, { useState, useEffect, useCallback } from 'react';
import { useEvent } from '../context/EventContext';
import api from '../api/axios';
import ScoreCard from '../components/ScoreCard';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  ExternalLink,
  Github,
  Eye,
  X,
  Sparkles,
  RefreshCw,
  Layers,
  Code2
} from 'lucide-react';

export default function Leaderboard() {
  const { activeEvent } = useEvent();
  const [standings, setStandings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [inspectSubmission, setInspectSubmission] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!activeEvent) return;

    try {
      setLoading(true);
      const res = await api.get(`/submissions/leaderboard/${activeEvent.id}`);
      setStandings(res.data);

      // Trigger celebratory confetti if there are submissions
      if (res.data.length > 0) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [activeEvent]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const filteredStandings = standings.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.teamName?.toLowerCase().includes(query) ||
      item.projectDescription?.toLowerCase().includes(query)
    );
  });

  const topThree = standings.slice(0, 3);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-glow font-bold font-mono">
            🥇
          </div>
        );
      case 2:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-300/20 text-slate-200 border border-slate-300/40 font-bold font-mono">
            🥈
          </div>
        );
      case 3:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-700/20 text-amber-600 border border-amber-700/40 font-bold font-mono">
            🥉
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-surface-100 text-slate-400 border border-white/10 font-bold font-mono text-xs">
            #{rank}
          </div>
        );
    }
  };

  if (!activeEvent) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">No Hackathon Selected</h2>
        <p className="text-sm text-slate-400 mt-1">Please select an event from the top switcher.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>Real-Time AI Evaluated Standings</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Hackathon <span className="gradient-text">Live Leaderboard</span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Projects analyzed and scored across code architecture, completeness, documentation, and innovation.
        </p>
      </div>

      {/* Top 3 Podium Cards */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="glass-card rounded-3xl p-6 border border-slate-300/20 bg-slate-900/40 relative order-2 md:order-1 transform hover:-translate-y-1 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-300/20 border border-slate-300/40 text-slate-200 text-xs font-bold font-mono">
                🥈 2nd Place
              </div>
              <div className="text-center pt-3">
                <h3 className="text-lg font-bold text-white mb-1">{topThree[1].teamName}</h3>
                <div className="text-3xl font-extrabold text-slate-200 font-mono my-2">
                  {topThree[1].totalScore?.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {topThree[1].projectDescription || 'High-performance hackathon build.'}
                </p>
                <button
                  onClick={() => setInspectSubmission(topThree[1])}
                  className="w-full py-2 rounded-xl bg-surface-100 hover:bg-surface-hover text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Scorecard</span>
                </button>
              </div>
            </div>
          )}

          {/* 1st Place (Gold Champion) */}
          {topThree[0] && (
            <div className="glass-card rounded-3xl p-7 border border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-surface-100/80 shadow-glow relative order-1 md:order-2 md:-translate-y-4 transform hover:-translate-y-5 transition-all">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 text-xs font-extrabold font-mono shadow-glow flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" />
                <span>CHAMPION</span>
              </div>
              <div className="text-center pt-3">
                <h3 className="text-xl font-extrabold text-white mb-1">{topThree[0].teamName}</h3>
                <div className="text-4xl font-extrabold text-amber-400 font-mono my-2">
                  {topThree[0].totalScore?.toFixed(1)} <span className="text-sm text-slate-500 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-slate-300 line-clamp-2 mb-5 leading-relaxed">
                  {topThree[0].projectDescription || 'Top-tier architecture and feature execution.'}
                </p>
                <button
                  onClick={() => setInspectSubmission(topThree[0])}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 text-xs font-bold shadow-glow hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>View Grand Scorecard</span>
                </button>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="glass-card rounded-3xl p-6 border border-amber-700/20 bg-slate-900/40 relative order-3 md:order-3 transform hover:-translate-y-1 transition-all">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-600 text-xs font-bold font-mono">
                🥉 3rd Place
              </div>
              <div className="text-center pt-3">
                <h3 className="text-lg font-bold text-white mb-1">{topThree[2].teamName}</h3>
                <div className="text-3xl font-extrabold text-amber-500/90 font-mono my-2">
                  {topThree[2].totalScore?.toFixed(1)} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {topThree[2].projectDescription || 'Solid engineering execution and technical depth.'}
                </p>
                <button
                  onClick={() => setInspectSubmission(topThree[2])}
                  className="w-full py-2 rounded-xl bg-surface-100 hover:bg-surface-hover text-slate-200 text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Scorecard</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Main Standings Table Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
        
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search standings by team name or keywords..."
              className="w-full glass-input rounded-xl pl-10 pr-4 py-2 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-100 hover:bg-surface-hover text-xs font-medium text-slate-300 border border-white/10 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Standings</span>
            </button>
          </div>
        </div>

        {/* Table */}
        {filteredStandings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-3 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Team & Overview</th>
                  <th className="py-3 px-3 text-center">Quality (25)</th>
                  <th className="py-3 px-3 text-center">Complete (25)</th>
                  <th className="py-3 px-3 text-center">Docs (25)</th>
                  <th className="py-3 px-3 text-center">Innov (25)</th>
                  <th className="py-3 px-4 text-right">Total Score</th>
                  <th className="py-3 px-4 text-right">Links</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredStandings.map((entry) => (
                  <tr
                    key={entry.submissionId || entry.rank}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="py-4 px-3 text-center">
                      <div className="flex justify-center">
                        {getRankBadge(entry.rank)}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                        {entry.teamName}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 max-w-sm">
                        {entry.projectDescription || 'No description provided'}
                      </p>
                    </td>

                    <td className="py-4 px-3 text-center font-mono font-medium text-slate-300">
                      {entry.codeQualityScore?.toFixed(1) || '-'}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-medium text-slate-300">
                      {entry.completenessScore?.toFixed(1) || '-'}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-medium text-slate-300">
                      {entry.documentationScore?.toFixed(1) || '-'}
                    </td>
                    <td className="py-4 px-3 text-center font-mono font-medium text-slate-300">
                      {entry.innovationScore?.toFixed(1) || '-'}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <span className="text-base font-extrabold font-mono text-white">
                        {entry.totalScore?.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono ml-0.5">/100</span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {entry.githubUrl && (
                          <a
                            href={entry.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-400 hover:text-white border border-white/10 transition-all"
                            title="GitHub Repository"
                          >
                            <Github className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => setInspectSubmission(entry)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-all"
                          title="View Full Scorecard"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-semibold">Review</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
            <Trophy className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
            <h3 className="text-sm font-bold text-slate-300">No Evaluated Submissions Yet</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Once teams submit repositories and AI evaluation completes, the ranked leaderboard will appear here.
            </p>
          </div>
        )}

      </div>

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
            />
          </div>
        </div>
      )}

    </div>
  );
}
