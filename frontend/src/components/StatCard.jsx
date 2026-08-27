import { TrendingUp } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, color = 'blue', trend }) {
  const colorThemes = {
    blue: {
      bg: 'bg-slate-900/80 hover:bg-slate-900',
      border: 'border-sky-500/20 hover:border-sky-500/40',
      glow: 'shadow-sky-950/30 hover:shadow-sky-900/20',
      iconBg: 'bg-sky-500/10 border-sky-500/20 text-sky-400',
      accent: 'text-sky-400',
    },
    green: {
      bg: 'bg-slate-900/80 hover:bg-slate-900',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      glow: 'shadow-emerald-950/30 hover:shadow-emerald-900/20',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      accent: 'text-emerald-400',
    },
    purple: {
      bg: 'bg-slate-900/80 hover:bg-slate-900',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      glow: 'shadow-purple-950/30 hover:shadow-purple-900/20',
      iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      accent: 'text-purple-400',
    },
    amber: {
      bg: 'bg-slate-900/80 hover:bg-slate-900',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      glow: 'shadow-amber-950/30 hover:shadow-amber-900/20',
      iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      accent: 'text-amber-400',
    },
  };

  const theme = colorThemes[color] || colorThemes.blue;

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-200 shadow-lg hover:shadow-xl ${theme.bg} ${theme.border} ${theme.glow} group`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">{label}</p>
          <p className="text-3xl font-extrabold text-white tracking-tight font-display group-hover:scale-[1.02] transition-transform origin-left">
            {value ?? '—'}
          </p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${theme.iconBg} shadow-sm group-hover:scale-105 transition-transform`}>
          {typeof Icon === 'function' || typeof Icon === 'object' ? (
            <Icon className="w-5 h-5" />
          ) : (
            <span className="text-lg">{Icon}</span>
          )}
        </div>
      </div>
      
      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-1.5 text-xs text-emerald-400">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-semibold">{trend}</span>
          <span className="text-slate-500 text-[11px] ml-1">vs last period</span>
        </div>
      )}
    </div>
  );
}
