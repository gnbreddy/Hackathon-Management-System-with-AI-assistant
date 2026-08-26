import React, { useState } from 'react';
import {
  Users,
  Crown,
  Copy,
  Check,
  Tag,
  UserPlus,
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function TeamCard({
  team,
  isMyTeam = false,
  currentUser = null,
  onJoin = null,
  onLeave = null
}) {
  const [copied, setCopied] = useState(false);

  if (!team) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const skillsList = team.skillsRequired
    ? team.skillsRequired.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const isFull = team.currentSize >= team.maxSize;

  return (
    <div className={`glass-card rounded-2xl p-5 border transition-all ${
      isMyTeam ? 'border-indigo-500/40 bg-indigo-950/20 shadow-glow-sm' : 'border-white/10 hover:border-white/20'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{team.name}</h3>
            {isMyTeam && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                MY TEAM
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Leader: <span className="text-slate-200 font-medium">{team.leaderName}</span>
          </p>
        </div>

        {/* Capacity Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-100 border border-white/10 text-xs font-mono">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className={isFull ? 'text-amber-400 font-bold' : 'text-slate-300'}>
            {team.currentSize}/{team.maxSize}
          </span>
        </div>
      </div>

      {/* Join Code Box */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100/60 border border-white/5 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-mono">Join Code:</span>
          <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider">
            {team.joinCode}
          </span>
        </div>
        <button
          onClick={handleCopyCode}
          title="Copy code"
          className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Members List */}
      <div className="mb-4">
        <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
          Team Members ({team.members?.length || 0})
        </h4>
        <div className="space-y-1.5">
          {team.members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
            >
              <div className="flex items-center gap-2">
                {m.isLeader ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-cyan-400/80" />
                )}
                <span className="text-slate-200 font-medium">{m.fullName}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {m.registrationNumber}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Required Skills Matchmaking Tags */}
      {skillsList.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-indigo-400" />
            Seeking Skills
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {skillsList.map((skill, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="pt-2 border-t border-white/5">
        {isMyTeam && onLeave && (
          <button
            onClick={() => onLeave(team.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Leave Team
          </button>
        )}

        {!isMyTeam && onJoin && (
          <button
            onClick={() => onJoin(team.joinCode)}
            disabled={isFull}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
              isFull
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm hover:shadow-glow'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            {isFull ? 'Team Full' : 'Request to Join'}
          </button>
        )}
      </div>

    </div>
  );
}
