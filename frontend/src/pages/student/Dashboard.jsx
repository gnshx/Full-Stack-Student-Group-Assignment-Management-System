import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI, assignmentsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([groupsAPI.mine(), assignmentsAPI.list()])
      .then(([g, a]) => { setGroups(g.data); setAssignments(a.data); })
      .finally(() => setLoading(false));
  }, []);

  const confirmed = assignments.filter(a => a.submission_status === 'confirmed').length;
  const pending = assignments.length - confirmed;
  const overdue = assignments.filter(a => !a.submission_status && a.due_date && new Date(a.due_date) < new Date()).length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 mt-1">Here's your academic overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Groups" value={groups.length} icon="◈" color="blue" />
        <StatCard label="Total Assignments" value={assignments.length} icon="◷" color="purple" />
        <StatCard label="Confirmed" value={confirmed} icon="✓" color="green" />
        <StatCard label="Overdue" value={overdue} icon="⚠" color="amber" />
      </div>

      {/* Progress */}
      <div className="card">
        <h2 className="section-title mb-4">Overall Progress</h2>
        <ProgressBar value={confirmed} max={assignments.length} label="Assignments confirmed" />
      </div>

      {/* Recent assignments */}
      <div className="card">
        <h2 className="section-title mb-4">Upcoming Assignments</h2>
        {assignments.length === 0 ? (
          <p className="text-slate-500 text-sm">No assignments yet. Check back later!</p>
        ) : (
          <div className="space-y-3">
            {assignments.slice(0, 5).map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-surface hover:bg-white/5 transition-colors border border-transparent hover:border-surface-border">
                <div className="min-w-0">
                  <p className="font-medium text-white truncate">{a.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                  </p>
                </div>
                {a.submission_status === 'confirmed' ? (
                  <span className="badge-green">✓ Confirmed</span>
                ) : a.due_date && new Date(a.due_date) < new Date() ? (
                  <span className="badge-yellow">⚠ Overdue</span>
                ) : (
                  <span className="badge-blue">Pending</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Groups overview */}
      <div className="card">
        <h2 className="section-title mb-4">My Groups</h2>
        {groups.length === 0 ? (
          <p className="text-slate-500 text-sm">You haven't joined any groups yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {groups.map(g => (
              <div key={g.id} className="p-4 rounded-xl bg-surface border border-surface-border hover:border-primary-500/30 transition-colors">
                <p className="font-semibold text-white">{g.name}</p>
                <p className="text-xs text-slate-500 mt-1">{g.member_count} member{g.member_count !== 1 ? 's' : ''}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
