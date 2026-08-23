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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="text-slate-400 mt-1">Drill into per-assignment submission progress</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">▦</div>
          <h3 className="text-lg font-semibold text-white mb-1">No data yet</h3>
          <p className="text-slate-500 text-sm">Create assignments to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {assignments.map(a => {
            const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
            return (
              <div key={a.id} onClick={() => openDetail(a.id)}
                className="card cursor-pointer hover:border-primary-500/40 transition-all duration-200 group">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{a.title}</h3>
                  <span className={`text-sm font-bold ${pct === 100 ? 'text-emerald-400' : pct > 50 ? 'text-amber-400' : 'text-red-400'}`}>{pct}%</span>
                </div>
                <ProgressBar value={a.confirmed_count} max={a.total_groups} label="Groups confirmed" />
                <p className="text-xs text-slate-600 mt-3">
                  Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
            );
          })}
        </div>
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
