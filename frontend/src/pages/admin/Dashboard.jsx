import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  Shield, 
  Plus, 
  ArrowRight, 
  BarChart3,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.overview().then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/60 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" /> Faculty Command Center
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Course Administration
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Monitor overall class submission completion, manage assignments, and oversee student group organization.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <Link to="/admin/assignments" className="btn-primary text-xs py-2.5 px-4">
            <Plus className="w-4 h-4" /> New Assignment
          </Link>
          <Link to="/admin/analytics" className="btn-secondary text-xs py-2.5 px-4">
            <BarChart3 className="w-4 h-4 text-purple-400" /> Analytics
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Enrolled Students" value={data?.totalStudents} icon={Users} color="blue" />
        <StatCard label="Total Course Groups" value={data?.totalGroups} icon={Users} color="purple" />
        <StatCard label="Active Assignments" value={data?.totalAssignments} icon={FileText} color="amber" />
        <StatCard label="Confirmed Submissions" value={data?.totalConfirmed} icon={CheckCircle2} color="green" />
      </div>

      {/* Recent Assignment Progress Card */}
      <div className="card space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <h2 className="section-title">
            <BookOpen className="w-5 h-5 text-sky-400" /> Recent Assignment Progress
          </h2>
          <Link to="/admin/analytics" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors">
            Full Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!data?.recentAssignments?.length ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-medium">No assignments created yet.</p>
            <Link to="/admin/assignments" className="btn-primary text-xs py-2 px-4 inline-flex mt-2">
              <Plus className="w-4 h-4" /> Create First Assignment
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.recentAssignments.map(a => (
              <div key={a.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base font-display">{a.title}</h3>
                  <span className="text-xs font-medium text-slate-400">
                    Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                  </span>
                </div>
                <ProgressBar value={a.confirmed} max={a.total} label="Group Submissions Confirmed" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
