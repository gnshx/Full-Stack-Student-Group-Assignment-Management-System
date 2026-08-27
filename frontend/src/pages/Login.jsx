import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, LogIn, AlertCircle, CheckCircle2, Shield } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md animate-slide-up space-y-6">
        {/* Academic Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-primary-500 shadow-xl shadow-sky-950/60 border border-sky-400/30 text-white mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              JOIN EASY CLASSROOM
            </h1>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
              Academic Assignment Portal
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Sign in to access your course assignments and study groups
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="card border-slate-800 shadow-modal-glow bg-slate-900/90">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-start gap-2.5 shadow-sm">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-email"
                  type="email"
                  className="input pl-10"
                  placeholder="student@university.edu"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="login-password"
                  type="password"
                  className="input pl-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn-primary w-full mt-2 py-3" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Authenticating…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Sign In to Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-slate-400 text-xs">
              Don't have an account?{' '}
              <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                Create Academic Account
              </Link>
            </p>
          </div>
        </div>

        {/* Enterprise features footer banner */}
        <div className="card-sm bg-slate-900/60 border-slate-800/80 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
            <Shield className="w-3.5 h-3.5 text-sky-400" /> Platform Security Safeguards
          </div>
          <ul className="space-y-1 text-[11px] text-slate-400">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Group Leader submission confirmations
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Live professor analytics & status filtering
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
