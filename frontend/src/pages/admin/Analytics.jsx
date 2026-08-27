import { useState, useEffect } from 'react';
import { analyticsAPI, assignmentsAPI } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import Modal from '../../components/Modal';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Eye, 
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';

export default function AdminAnalytics() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    assignmentsAPI.list().then(r => setAssignments(r.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    const res = await analyticsAPI.assignment(id);
    setDetail(res.data);
  };

  const filteredAssignments = assignments.filter(a => {
    const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
    if (statusFilter === 'confirmed') return pct === 100 && a.total_groups > 0;
    if (statusFilter === 'pending') return pct < 100 || a.total_groups === 0;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-sky-400" /> Analytics & Course Metrics
          </h1>
          <p className="text-slate-400 text-sm mt-1">Deep submission rate visual analytics and individual group tracking</p>
        </div>

        {assignments.length > 0 && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
            {[
              { id: 'all', label: 'All Assignments', count: assignments.length },
              { id: 'confirmed', label: '100% Confirmed', count: assignments.filter(a => (a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0) === 100 && a.total_groups > 0).length },
              { id: 'pending', label: 'Pending', count: assignments.filter(a => (a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0) < 100 || a.total_groups === 0).length }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  statusFilter === f.id
                    ? 'bg-sky-950 text-sky-300 border border-sky-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-20 space-y-3">
          <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">No analytical data available</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Create course assignments to record student group submission metrics.</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No assignments match the selected analytics filter.</p>
        </div>
      ) : (
        <>
          {/* Completion Bar Chart */}
          <div className="card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h2 className="section-title">
                  <TrendingUp className="w-5 h-5 text-emerald-400" /> Course Completion Rate Visualizer
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Click any column bar to open detailed group breakdown</p>
              </div>
              <span className="badge-purple">
                <Sparkles className="w-3 h-3 text-purple-300" /> Live Data
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-8 pb-3 px-4 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="h-56 flex items-end gap-4 sm:gap-8 justify-around px-2">
                {filteredAssignments.map(a => {
                  const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
                  return (
                    <div 
                      key={a.id} 
                      className="flex-1 flex flex-col items-center gap-2 group h-full justify-end cursor-pointer" 
                      onClick={() => openDetail(a.id)}
                    >
                      <div className="text-xs font-bold font-mono text-white opacity-90 group-hover:scale-110 transition-transform bg-slate-900 px-2 py-0.5 rounded border border-slate-800 shadow-sm">
                        {pct}%
                      </div>
                      <div className="w-full max-w-[48px] bg-slate-900 rounded-t-xl flex flex-col justify-end overflow-hidden h-full border border-slate-800/80 group-hover:border-sky-500/40 transition-colors">
                        <div
                          style={{ height: `${Math.max(pct, 6)}%` }}
                          className={`w-full rounded-t-lg transition-all duration-700 shadow-sm ${
                            pct === 100
                              ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                              : pct >= 50
                              ? 'bg-gradient-to-t from-sky-600 to-primary-400'
                              : 'bg-gradient-to-t from-amber-600 to-amber-400'
                          }`}
                        />
                      </div>
                      <span className="text-xs text-slate-400 truncate max-w-[90px] text-center font-semibold group-hover:text-white transition-colors font-display" title={a.title}>
                        {a.title}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-800/80 mt-3 pt-2 flex justify-between text-[11px] font-mono text-slate-500">
                <span>0% Benchmark</span>
                <span>50% Completion Target</span>
                <span className="text-emerald-400">100% Fully Confirmed</span>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredAssignments.map(a => {
              const pct = a.total_groups ? Math.round((a.confirmed_count / a.total_groups) * 100) : 0;
              return (
                <div 
                  key={a.id} 
                  onClick={() => openDetail(a.id)}
                  className="card-interactive space-y-4 group"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors font-display truncate mr-2">
                      {a.title}
                    </h3>
                    <span className={`text-base font-extrabold font-mono shrink-0 ${
                      pct === 100 ? 'text-emerald-400' : pct >= 50 ? 'text-sky-400' : 'text-amber-400'
                    }`}>
                      {pct}%
                    </span>
                  </div>

                  <ProgressBar value={a.confirmed_count} max={a.total_groups} label="Group Submissions Confirmed" />

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                    <span className="capitalize">Target: {a.target_type === 'all' ? 'All Groups' : 'Specific Groups'}</span>
                    <span className="flex items-center gap-1 font-semibold text-sky-400 group-hover:translate-x-0.5 transition-transform">
                      View Breakdown <Eye className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Assignment Detail Modal */}
      {detail && (
        <Modal title={`Analytics: ${detail.assignment.title}`} onClose={() => setDetail(null)} size="lg" icon={BarChart3}>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <p className="text-2xl font-extrabold text-white font-mono">{detail.total_groups}</p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Groups</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
                <p className="text-2xl font-extrabold text-emerald-400 font-mono">{detail.confirmed_groups}</p>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                <p className="text-2xl font-extrabold text-amber-400 font-mono">{detail.total_groups - detail.confirmed_groups}</p>
                <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending</p>
              </div>
            </div>

            <ProgressBar value={detail.confirmed_groups} max={detail.total_groups} label="Classroom Completion Status" />

            <h4 className="section-title text-sm">Individual Group Submission Roster</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {detail.groups?.map(g => (
                <div key={g.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/50 border border-slate-800">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-white font-display">{g.name}</p>
                    {g.confirmed_by && (
                      <p className="text-xs text-slate-400">
                        Confirmed by <span className="text-white font-medium">{g.confirmed_by}</span>
                      </p>
                    )}
                  </div>

                  {g.status === 'confirmed' ? (
                    <div className="text-right space-y-1">
                      <span className="badge-green">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
                      </span>
                      {g.confirmed_at && (
                        <p className="text-[11px] text-slate-500 font-mono">
                          {new Date(g.confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="badge-yellow">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending
                    </span>
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
