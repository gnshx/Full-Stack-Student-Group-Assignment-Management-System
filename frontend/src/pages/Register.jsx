import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4 shadow-lg shadow-primary-900/40">
            <span className="text-3xl font-bold text-white">J</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
          <p className="text-slate-400 mt-2">Join your classroom on JoinEasy</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input id="reg-name" type="text" className="input" placeholder="John Doe"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email address</label>
              <input id="reg-email" type="email" className="input" placeholder="you@university.edu"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input id="reg-password" type="password" className="input" placeholder="Min 6 characters"
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={6} />
            </div>
            <div>
              <label className="label">Role</label>
              <div className="flex gap-3">
                {['student', 'admin'].map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 capitalize ${
                      form.role === r
                        ? r === 'student'
                          ? 'bg-primary-600/20 border-primary-500/40 text-primary-400'
                          : 'bg-purple-600/20 border-purple-500/40 text-purple-400'
                        : 'bg-surface border-surface-border text-slate-500 hover:border-slate-500'
                    }`}>
                    {r === 'admin' ? '🎓 Professor' : '📚 Student'}
                  </button>
                ))}
              </div>
            </div>
            <button id="reg-submit" type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
