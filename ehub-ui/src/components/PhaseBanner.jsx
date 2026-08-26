import React from 'react';
import { useEvent } from '../context/EventContext';
import CountdownTimer from './CountdownTimer';
import {
  UserPlus,
  Code2,
  BrainCircuit,
  Award,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const phases = [
  { id: 'REGISTRATION', label: 'Team Registration', icon: UserPlus, desc: 'Form teams & browse matchmaking' },
  { id: 'CODING', label: 'Coding Window', icon: Code2, desc: 'Build & push GitHub repository' },
  { id: 'JUDGING', label: 'AI Evaluation', icon: BrainCircuit, desc: 'Gemini scores code & rubrics' },
  { id: 'FINISHED', label: 'Final Leaderboard', icon: Award, desc: 'Standings & award distribution' },
];

export default function PhaseBanner() {
  const { activeEvent } = useEvent();

  if (!activeEvent) return null;

  const currentPhase = activeEvent.currentPhase || 'REGISTRATION';
  const currentPhaseIndex = phases.findIndex(p => p.id === currentPhase);

  const getTargetDeadline = () => {
    switch (currentPhase) {
      case 'REGISTRATION': return activeEvent.registrationDeadline;
      case 'CODING': return activeEvent.codingDeadline;
      case 'JUDGING': return activeEvent.judgingDeadline;
      default: return null;
    }
  };

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-6 mb-8 border border-indigo-500/20 bg-gradient-to-br from-surface-100/90 to-surface-200/90">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Active Hackathon
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: #{activeEvent.id}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {activeEvent.title}
          </h1>
          <p className="text-sm text-slate-300 mt-0.5 line-clamp-1">
            {activeEvent.description || 'Welcome to the hackathon workspace.'}
          </p>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-3">
          <CountdownTimer targetDate={getTargetDeadline()} label={`${phases[currentPhaseIndex]?.label || 'Phase'} Closes in`} />
        </div>
      </div>

      {/* Lifecycle Progression Steps */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-5">
        {phases.map((phase, idx) => {
          const Icon = phase.icon;
          const isCurrent = phase.id === currentPhase;
          const isPassed = idx < currentPhaseIndex;
          const isUpcoming = idx > currentPhaseIndex;

          let cardStyle = "bg-white/[0.02] border-white/5 opacity-60";
          let iconBg = "bg-slate-800 text-slate-400";
          let badge = "Upcoming";
          let badgeStyle = "bg-slate-800 text-slate-400";

          if (isPassed) {
            cardStyle = "bg-emerald-950/20 border-emerald-500/30 opacity-90";
            iconBg = "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            badge = "Completed";
            badgeStyle = "bg-emerald-500/20 text-emerald-300";
          } else if (isCurrent) {
            cardStyle = "bg-indigo-950/40 border-indigo-500/60 shadow-glow-sm ring-1 ring-indigo-500/40";
            iconBg = "bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-glow-sm";
            badge = "Active Phase";
            badgeStyle = "bg-indigo-500/30 text-indigo-200 border border-indigo-500/50 animate-pulse";
          }

          return (
            <div
              key={phase.id}
              className={`flex flex-col p-3.5 rounded-xl border transition-all ${cardStyle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
                  {isPassed ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${badgeStyle}`}>
                  {badge}
                </span>
              </div>

              <div className="font-semibold text-sm text-white flex items-center gap-1">
                {phase.label}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                {phase.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
