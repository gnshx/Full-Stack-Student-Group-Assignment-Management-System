export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}/{max} <span className="text-slate-500">({pct}%)</span></span>
      </div>
      <div className="progress-track">
        <div className="progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
