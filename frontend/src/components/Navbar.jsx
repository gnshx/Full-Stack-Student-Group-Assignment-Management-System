import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const studentLinks = [
  { to: '/student', label: 'Dashboard', icon: '⊞' },
  { to: '/student/groups', label: 'My Groups', icon: '◈' },
  { to: '/student/assignments', label: 'Assignments', icon: '◷' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: '⊞' },
  { to: '/admin/assignments', label: 'Assignments', icon: '◷' },
  { to: '/admin/groups', label: 'Groups', icon: '◈' },
  { to: '/admin/analytics', label: 'Analytics', icon: '▦' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-surface-card border-r border-surface-border flex flex-col z-20">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-surface-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg">J</div>
          <span className="font-bold text-white text-lg">JoinEasy</span>
        </div>
        <div className="mt-1 text-xs text-surface-muted capitalize">{user?.role} Portal</div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, label, icon }) => {
          const isActive = location.pathname === to || (to !== '/student' && to !== '/admin' && location.pathname.startsWith(to));
          return (
            <Link key={to} to={to} className={isActive ? 'nav-link-active' : 'nav-link'}>
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t border-surface-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-primary-400 font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-surface-muted truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full btn-ghost text-left text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10">
          ⤫ Sign out
        </button>
      </div>
    </aside>
  );
}
