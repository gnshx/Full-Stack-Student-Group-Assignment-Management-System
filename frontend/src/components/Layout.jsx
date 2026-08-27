import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Calendar, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  // Simple path breadcrumb label generator
  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'Overview';
    const role = parts[0] === 'admin' ? 'Faculty Admin' : 'Student Portal';
    const sub = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1) : 'Dashboard';
    return `${role} / ${sub}`;
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Formal Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-display flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              {getBreadcrumb()}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{currentDate}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-medium">
              {user?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-purple-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span className="capitalize">{user?.role} Mode</span>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="flex-1 p-8 overflow-auto min-w-0">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
