import React from 'react';
import {
  Sparkles,
  Award,
  CheckCircle,
  AlertTriangle,
  Code,
  CheckCheck,
  BookOpen,
  Lightbulb,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export default function ScoreCard({ submission, onReEvaluate, isEvaluating = false }) {
  if (!submission) return null;

  const {
    totalScore = 0,
    codeQualityScore = 0,
    completenessScore = 0,
    documentationScore = 0,
    innovationScore = 0,
    aiFeedbackSummary,
    aiStrengths,
    aiWeaknesses,
    githubUrl,
    demoUrl,
    status
  } = submission;

  const rubrics = [
    { label: 'Code Quality', score: codeQualityScore, max: 25, icon: Code, color: 'text-indigo-400', bar: 'bg-indigo-500' },
    { label: 'Completeness', score: completenessScore, max: 25, icon: CheckCheck, color: 'text-cyan-400', bar: 'bg-cyan-500' },
    { label: 'Documentation', score: documentationScore, max: 25, icon: BookOpen, color: 'text-purple-400', bar: 'bg-purple-500' },
    { label: 'Innovation', score: innovationScore, max: 25, icon: Lightbulb, color: 'text-amber-400', bar: 'bg-amber-500' },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 75) return 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10';
    if (score >= 60) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-cyan-400 p-0.5 shadow-glow-sm">
            <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">AI Evaluation Scorecard</h3>
              <span className={`px-2 py-0.5 text-xs font-mono font-semibold rounded-md border ${
                status === 'EVALUATED'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse'
              }`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-slate-400">Evaluated with Google Gemini 1.5 Flash System Rubrics</p>
          </div>
        </div>

        {/* Action / Links */}
        <div className="flex items-center gap-2">
          {githubUrl && (
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-hover text-xs font-medium text-slate-300 border border-white/10 hover:border-white/20 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>GitHub Repo</span>
            </a>
          )}
          {onReEvaluate && (
            <button
              onClick={onReEvaluate}
              disabled={isEvaluating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-xs font-medium text-indigo-300 border border-indigo-500/30 hover:border-indigo-500/50 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Grading...' : 'Re-Evaluate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Score Metrics & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-6">
        
        {/* Total Score Pod */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-xl bg-surface-100/60 border border-white/10 text-center relative">
          <Award className="w-8 h-8 text-amber-400 mb-2" />
          <span className="text-xs uppercase tracking-widest text-slate-400 font-mono">Overall Aggregate Score</span>
          <div className="my-2 flex items-baseline gap-1">
            <span className="text-5xl font-extrabold tracking-tight text-white">
              {totalScore.toFixed(1)}
            </span>
            <span className="text-lg font-semibold text-slate-500">/ 100</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold border mt-1 ${getScoreColor(totalScore)}`}>
            {totalScore >= 90 ? '🌟 Exceptional Build' : totalScore >= 75 ? '🚀 High Quality' : '⚡ Promising Build'}
          </div>
        </div>

        {/* Rubric Breakdown Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {rubrics.map((r, i) => {
            const Icon = r.icon;
            const percentage = (r.score / r.max) * 100;
            return (
              <div key={i} className="p-3.5 rounded-xl bg-surface-100/40 border border-white/5 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${r.color}`} />
                    <span className="text-xs font-semibold text-slate-300">{r.label}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">
                    {r.score.toFixed(1)} <span className="text-slate-500 font-normal">/ {r.max}</span>
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${r.bar}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Judge Feedback Summary */}
      {aiFeedbackSummary && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 mb-4">
          <h4 className="text-xs uppercase tracking-wider text-indigo-300 font-mono font-bold mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Judging Review
          </h4>
          <p className="text-sm text-slate-200 leading-relaxed">
            {aiFeedbackSummary}
          </p>
        </div>
      )}

      {/* Strengths & Weaknesses Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {aiStrengths && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
            <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-mono font-bold mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Key Strengths
            </h4>
            <div className="text-xs text-emerald-100 space-y-1 whitespace-pre-line leading-relaxed">
              {aiStrengths}
            </div>
          </div>
        )}

        {aiWeaknesses && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20">
            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-mono font-bold mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Actionable Recommendations
            </h4>
            <div className="text-xs text-amber-100 space-y-1 whitespace-pre-line leading-relaxed">
              {aiWeaknesses}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
