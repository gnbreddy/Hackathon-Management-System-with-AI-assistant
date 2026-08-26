import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function CountdownTimer({ targetDate, label = "Time Remaining" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });

  useEffect(() => {
    if (!targetDate) {
      // Default placeholder 48 hours if no target
      setTimeLeft({ days: 1, hours: 23, minutes: 59, seconds: 59, ended: false });
      return;
    }

    const calculateTime = () => {
      const difference = new Date(targetDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, ended: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (timeLeft.ended) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono">
        <Clock className="w-3.5 h-3.5" />
        <span>Phase Closed</span>
      </div>
    );
  }

  const format = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 font-medium hidden sm:inline">{label}:</span>
      <div className="flex items-center gap-1.5 font-mono text-xs">
        {timeLeft.days > 0 && (
          <div className="flex items-center">
            <span className="px-2 py-1 rounded-lg bg-surface-100 border border-white/10 text-cyan-300 font-bold">
              {format(timeLeft.days)}d
            </span>
            <span className="mx-1 text-slate-500">:</span>
          </div>
        )}
        <span className="px-2 py-1 rounded-lg bg-surface-100 border border-white/10 text-indigo-300 font-bold">
          {format(timeLeft.hours)}h
        </span>
        <span className="text-slate-500">:</span>
        <span className="px-2 py-1 rounded-lg bg-surface-100 border border-white/10 text-indigo-300 font-bold">
          {format(timeLeft.minutes)}m
        </span>
        <span className="text-slate-500">:</span>
        <span className="px-2 py-1 rounded-lg bg-surface-100 border border-white/10 text-purple-400 font-bold animate-pulse">
          {format(timeLeft.seconds)}s
        </span>
      </div>
    </div>
  );
}
