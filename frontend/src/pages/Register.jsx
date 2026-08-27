import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Mail, Lock, User, UserPlus, AlertCircle, Shield, BookOpen } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'admin' ? '/admin' : '/student');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950">
      <div className="w-full max-w-md animate-slide-up space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-primary-500 shadow-xl shadow-sky-950/60 border border-sky-400/30 text-white mb-2">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Create Portal Account
            </h1>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mt-1">
              Join Easy Classroom System
            </p>
          </div>
          <p className="text-sm text-slate-400">
            Register your academic credentials to manage assignments
          </p>
        </div>

        {/* Card */}
        <div className="card border-slate-800 shadow-modal-glow bg-slate-900/90">
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="reg-name"
                  type="text"
                  className="input pl-10"
                  placeholder="Jane Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">University Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  id="reg-email"
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
                  id="reg-password"
                  type="password"
                  className="input pl-10"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="label">Academic Account Role</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'student' }))}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    form.role === 'student'
                      ? 'bg-sky-950/60 border-sky-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs font-display mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-sky-400" /> Student
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">Join groups & submit group assignments</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, role: 'admin' }))}
                  className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    form.role === 'admin'
                      ? 'bg-purple-950/60 border-purple-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs font-display mb-1">
                    <Shield className="w-3.5 h-3.5 text-purple-400" /> Professor
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">Create assignments & view analytics</p>
                </button>
              </div>
            </div>

            <button id="reg-submit" type="submit" className="btn-primary w-full mt-2 py-3" disabled={loading}>
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Registering Account…
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" /> Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-slate-400 text-xs">
              Already registered?{' '}
              <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                Sign In to Portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
