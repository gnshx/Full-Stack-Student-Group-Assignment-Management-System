import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.overview().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-slate-400 mt-1">Monitor classes, groups, and submission progress</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={data?.totalStudents} icon="👥" color="blue" />
        <StatCard label="Total Groups" value={data?.totalGroups} icon="◈" color="purple" />
        <StatCard label="Assignments" value={data?.totalAssignments} icon="◷" color="amber" />
        <StatCard label="Confirmations" value={data?.totalConfirmed} icon="✓" color="green" />
      </div>

      {/* Recent assignments with progress */}
      <div className="card">
        <h2 className="section-title mb-5">Recent Assignment Progress</h2>
        {!data?.recentAssignments?.length ? (
          <p className="text-slate-500 text-sm">No assignments created yet.</p>
        ) : (
          <div className="space-y-5">
            {data.recentAssignments.map(a => (
              <div key={a.id} className="p-4 rounded-xl bg-surface border border-surface-border">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white">{a.title}</h3>
                  <span className="text-xs text-slate-500">
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                  </span>
                </div>
                <ProgressBar value={a.confirmed} max={a.total} label="Groups confirmed" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
