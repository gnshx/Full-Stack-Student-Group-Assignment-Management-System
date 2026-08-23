import { useState, useEffect } from 'react';
import { assignmentsAPI, groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', onedrive_link: '', target_type: 'all', group_ids: [] });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([assignmentsAPI.list(), groupsAPI.all()])
      .then(([a, g]) => { setAssignments(a.data); setAllGroups(g.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm({ title: '', description: '', due_date: '', onedrive_link: '', target_type: 'all', group_ids: [] });
    setEditing(null);
    setError('');
  };

  const openCreate = () => { resetForm(); setShowForm(true); };

  const openEdit = async (id) => {
    const res = await assignmentsAPI.get(id);
    const a = res.data;
    setForm({
      title: a.title || '',
      description: a.description || '',
      due_date: a.due_date ? a.due_date.slice(0, 16) : '',
      onedrive_link: a.onedrive_link || '',
      target_type: a.target_type || 'all',
      group_ids: a.targeted_groups?.map(g => g.id) || [],
    });
    setEditing(id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      const payload = { ...form, due_date: form.due_date || null };
      if (editing) {
        await assignmentsAPI.update(editing, payload);
      } else {
        await assignmentsAPI.create(payload);
      }
      setShowForm(false);
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment? This cannot be undone.')) return;
    try {
      await assignmentsAPI.delete(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  const toggleGroup = (gid) => {
    setForm(f => ({
      ...f,
      group_ids: f.group_ids.includes(gid)
        ? f.group_ids.filter(id => id !== gid)
        : [...f.group_ids, gid],
    }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="text-slate-400 mt-1">Create, edit and manage course assignments</p>
        </div>
        <button onClick={openCreate} className="btn-primary">+ New Assignment</button>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">◷</div>
          <h3 className="text-lg font-semibold text-white mb-1">No assignments yet</h3>
          <p className="text-slate-500 text-sm mb-4">Create your first assignment to get started.</p>
          <button onClick={openCreate} className="btn-primary">Create Assignment</button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => (
            <div key={a.id} className="card hover:border-surface-muted transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white text-lg">{a.title}</h3>
                    <span className={`badge ${a.target_type === 'all' ? 'badge-blue' : 'badge-purple'}`}>
                      {a.target_type === 'all' ? 'All groups' : 'Targeted'}
                    </span>
                  </div>
                  {a.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{a.description}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline'}</span>
                    <span className="text-emerald-400">{a.confirmed_count}/{a.total_groups} confirmed</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(a.id)} className="btn-ghost text-sm">Edit</button>
                  <button onClick={() => handleDelete(a.id)} className="btn-danger text-sm">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <Modal title={editing ? 'Edit Assignment' : 'New Assignment'} onClose={() => { setShowForm(false); resetForm(); }} size="lg">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Title *</label>
              <input className="input" placeholder="Assignment title" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea className="input min-h-[80px] resize-y" placeholder="Describe the assignment…"
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Due date</label>
                <input type="datetime-local" className="input" value={form.due_date}
                  onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
              </div>
              <div>
                <label className="label">OneDrive link</label>
                <input className="input" placeholder="https://onedrive.live.com/…" value={form.onedrive_link}
                  onChange={e => setForm(f => ({ ...f, onedrive_link: e.target.value }))} />
              </div>
            </div>

            {/* Target type */}
            <div>
              <label className="label">Target</label>
              <div className="flex gap-3">
                {['all', 'specific_groups'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm(f => ({ ...f, target_type: t }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      form.target_type === t
                        ? 'bg-primary-600/20 border-primary-500/40 text-primary-400'
                        : 'bg-surface border-surface-border text-slate-500 hover:border-slate-500'
                    }`}>
                    {t === 'all' ? '🌐 All Groups' : '🎯 Specific Groups'}
                  </button>
                ))}
              </div>
            </div>

            {/* Group multi-select */}
            {form.target_type === 'specific_groups' && (
              <div>
                <label className="label">Select groups</label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 rounded-xl bg-surface border border-surface-border">
                  {allGroups.length === 0 ? (
                    <p className="text-slate-500 text-sm p-2">No groups exist yet.</p>
                  ) : allGroups.map(g => (
                    <label key={g.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        form.group_ids.includes(g.id) ? 'bg-primary-600/10 border border-primary-500/30' : 'hover:bg-white/5 border border-transparent'
                      }`}>
                      <input type="checkbox" className="accent-primary-500"
                        checked={form.group_ids.includes(g.id)}
                        onChange={() => toggleGroup(g.id)} />
                      <div>
                        <span className="text-sm text-white">{g.name}</span>
                        <span className="text-xs text-slate-500 ml-2">{g.member_count} members</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : editing ? 'Update Assignment' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
