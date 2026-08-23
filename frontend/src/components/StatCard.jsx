export default function StatCard({ label, value, icon, color = 'blue' }) {
  const colors = {
    blue: 'from-primary-600/20 to-primary-900/10 border-primary-500/30 text-primary-400',
    green: 'from-emerald-600/20 to-emerald-900/10 border-emerald-500/30 text-emerald-400',
    purple: 'from-purple-600/20 to-purple-900/10 border-purple-500/30 text-purple-400',
    amber: 'from-amber-600/20 to-amber-900/10 border-amber-500/30 text-amber-400',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-white mt-1">{value ?? '—'}</p>
        </div>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}
