export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  const getGradient = () => {
    if (pct === 100) return 'from-emerald-500 to-teal-400';
    if (pct >= 50) return 'from-sky-500 to-primary-500';
    return 'from-amber-500 to-orange-400';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 tracking-wide uppercase">{label}</span>
        <div className="flex items-center gap-1.5 font-mono">
          <span className="font-bold text-white text-sm">{value}</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{max}</span>
          <span className={`ml-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
            pct === 100 
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
              : pct >= 50 
              ? 'bg-sky-950/60 text-sky-400 border-sky-500/30' 
              : 'bg-amber-950/60 text-amber-400 border-amber-500/30'
          }`}>
            {pct}%
          </span>
        </div>
      </div>
      <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-full h-2.5 p-0.5 overflow-hidden shadow-inner">
        <div 
          className={`h-full rounded-full bg-gradient-to-r ${getGradient()} transition-all duration-700 shadow-sm`} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  );
}
