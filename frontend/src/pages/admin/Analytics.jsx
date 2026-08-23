import { useState, useEffect } from 'react';
import { analyticsAPI, assignmentsAPI } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import Modal from '../../components/Modal';

export default function AdminAnalytics() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    assignmentsAPI.list().then(r => setAssignments(r.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    const res = await analyticsAPI.assignment(id);
    setDetail(res.data);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="text-slate-400 mt-1">Drill into per-assignment submission progress and performance charts</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">▦</div>
          <h3 className="text-lg font-semibold text-white mb-1">No data yet</h3>
          <p className="text-slate-500 text-sm">Create assignments to view analytics and progress charts.</p>
        </div>
      ) : (
        <>
          {/* Visual Analytics Chart */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="section-title">Completion Overview Chart</h2>
                <p className="text-xs text-slate-400 mt-0.5">Group submission rates per assignment</p>
              </div>
              <span className="badge-purple">Live Data</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-6 pb-2 px-4 bg-surface rounded-xl border border-surface-border">
              <div className="h-48 flex items-end gap-6 sm:gap-10 justify-around px-2">
                {assignments.map(a => {
                  const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
                  return (
                    <div key={a.id} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer" onClick={() => openDetail(a.id)}>
                      <div className="text-xs font-bold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                        {pct}%
                      </div>
                      <div className="w-full max-w-[48px] bg-slate-800 rounded-t-lg flex flex-col justify-end overflow-hidden h-full">
                        <div
                          style={{ height: `${Math.max(pct, 6)}%` }}
                          className={`w-full rounded-t-lg transition-all duration-700 ${
                            pct === 100
                              ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                              : pct >= 50
                              ? 'bg-gradient-to-t from-primary-700 to-primary-400'
                              : 'bg-gradient-to-t from-amber-600 to-amber-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[80px] text-center font-medium group-hover:text-white transition-colors" title={a.title}>
                        {a.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-surface-border mt-2 pt-2 flex justify-between text-[11px] text-slate-500">
                <span>0%</span>
                <span>50%</span>
                <span>100% Completion</span>
              </div>
            </div>
          </div>

          {/* Detailed Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {assignments.map(a => {
              const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
              return (
                <div key={a.id} onClick={() => openDetail(a.id)}
                  className="card cursor-pointer hover:border-primary-500/40 transition-all duration-200 group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors truncate mr-2">{a.title}</h3>
                    <span className={`text-sm font-bold flex-shrink-0 ${pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-primary-400' : 'text-amber-400'}`}>{pct}%</span>
                  </div>
                  <ProgressBar value={a.confirmed_count} max={a.total_groups} label="Groups confirmed" />
                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2 border-t border-surface-border/50">
                    <span>Target: {a.target_type === 'all' ? 'All Groups' : 'Specific Groups'}</span>
                    <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Per-assignment detail */}
      {detail && (
        <Modal title={`Analytics: ${detail.assignment.title}`} onClose={() => setDetail(null)} size="lg">
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-surface border border-surface-border">
                <p className="text-2xl font-bold text-white">{detail.total_groups}</p>
                <p className="text-xs text-slate-500 mt-1">Total Groups</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-600/10 border border-emerald-500/30">
                <p className="text-2xl font-bold text-emerald-400">{detail.confirmed_groups}</p>
                <p className="text-xs text-slate-500 mt-1">Confirmed</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-600/10 border border-amber-500/30">
                <p className="text-2xl font-bold text-amber-400">{detail.total_groups - detail.confirmed_groups}</p>
                <p className="text-xs text-slate-500 mt-1">Pending</p>
              </div>
            </div>

            <ProgressBar value={detail.confirmed_groups} max={detail.total_groups} label="Overall progress" />

            <h4 className="section-title">Per-Group Breakdown</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {detail.groups?.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-border">
                  <div>
                    <p className="text-sm font-medium text-white">{g.name}</p>
                    {g.confirmed_by && <p className="text-xs text-slate-500 mt-0.5">by {g.confirmed_by}</p>}
                  </div>
                  {g.status === 'confirmed' ? (
                    <div className="text-right">
                      <span className="badge-green">✓ Confirmed</span>
                      <p className="text-xs text-slate-600 mt-1">
                        {g.confirmed_at && new Date(g.confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ) : (
                    <span className="badge-yellow">Pending</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
