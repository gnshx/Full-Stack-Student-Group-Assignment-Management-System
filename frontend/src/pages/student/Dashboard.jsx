import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { groupsAPI, assignmentsAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import { 
  Users, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/60 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Academic Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Track your study group submissions, upcoming deadlines, and academic assignments for this term.
          </p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Enrolled Groups" value={groups.length} icon={Users} color="blue" />
        <StatCard label="Total Assignments" value={assignments.length} icon={FileText} color="purple" />
        <StatCard label="Confirmed Submissions" value={confirmed} icon={CheckCircle2} color="green" />
        <StatCard label="Overdue Pending" value={overdue} icon={AlertTriangle} color="amber" />
      </div>

      {/* Progress Summary Card */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">
            <BookOpen className="w-5 h-5 text-sky-400" /> Overall Assignment Completion Rate
          </h2>
          <span className="text-xs text-slate-400 font-medium">Updated in real-time</span>
        </div>
        <ProgressBar value={confirmed} max={assignments.length} label="Confirmed Coursework" />
      </div>

      {/* Upcoming Assignments & Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Assignments (2 cols) */}
        <div className="lg:col-span-2 card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h2 className="section-title">
              <Clock className="w-5 h-5 text-sky-400" /> Upcoming & Current Assignments
            </h2>
            <Link to="/student/assignments" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {assignments.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-medium">No assignments active right now.</p>
              <p className="text-slate-500 text-xs">New assignments will appear here once published by your professor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 5).map(a => {
                const isConfirmed = a.submission_status === 'confirmed';
                const isOverdue = !isConfirmed && a.due_date && new Date(a.due_date) < new Date();
                return (
                  <div key={a.id} className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <p className="font-bold text-white text-sm truncate font-display">{a.title}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}
                      </p>
                    </div>

                    <div className="shrink-0">
                      {isConfirmed ? (
                        <span className="badge-green">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
                        </span>
                      ) : isOverdue ? (
                        <span className="badge-yellow">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Overdue
                        </span>
                      ) : (
                        <span className="badge-blue">
                          <Clock className="w-3.5 h-3.5 text-sky-400" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Groups Overview (1 col) */}
        <div className="card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <h2 className="section-title">
              <Users className="w-5 h-5 text-purple-400" /> My Groups
            </h2>
            <Link to="/student/groups" className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-colors">
              Manage <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {groups.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Users className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-400 text-sm font-medium">Not in any group yet.</p>
              <Link to="/student/groups" className="btn-primary text-xs py-2 px-4">
                + Create or Join Group
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {groups.map(g => (
                <div key={g.id} className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-purple-500/30 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white text-sm font-display">{g.name}</p>
                    <span className="badge-purple">
                      {g.member_count} member{g.member_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {g.is_leader && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-md">
                      👑 Group Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
