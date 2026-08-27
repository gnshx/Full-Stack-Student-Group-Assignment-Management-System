import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  BarChart3, 
  LogOut, 
  GraduationCap, 
  Shield, 
  Sparkles,
  ChevronRight
} from 'lucide-react';

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/student/groups', label: 'My Groups', icon: Users },
  { to: '/student/assignments', label: 'Assignments', icon: FileText },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/assignments', label: 'Assignments', icon: FileText },
  { to: '/admin/groups', label: 'Groups', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-slate-950/95 backdrop-blur-xl border-r border-slate-800/80 flex flex-col z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-primary-500 flex items-center justify-center text-white shadow-lg shadow-sky-900/40 border border-sky-400/30">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-white text-base tracking-tight font-display flex items-center gap-1">
              JOIN EASY
            </span>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest block -mt-0.5">
              Academic Portal
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-300 capitalize flex items-center gap-1">
            {user?.role === 'admin' ? (
              <>
                <Shield className="w-3 h-3 text-purple-400" /> Faculty Admin
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-sky-400" /> Student Workspace
              </>
            )}
          </span>
        </div>
      </div>

      {/* Nav section */}
      <div className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Navigation
          </p>
          <nav className="space-y-1">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to || (to !== '/student' && to !== '/admin' && location.pathname.startsWith(to));
              return (
                <Link key={to} to={to} className={isActive ? 'nav-link-active' : 'nav-link'}>
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-sky-400/60" />}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User profile section */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800/60">
          <div className="w-9 h-9 rounded-lg bg-sky-950 border border-sky-500/30 flex items-center justify-center text-sky-300 font-bold text-sm shadow-inner">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate font-display">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full btn-ghost justify-start text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-transparent hover:border-red-900/40">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </aside>
  );
}
