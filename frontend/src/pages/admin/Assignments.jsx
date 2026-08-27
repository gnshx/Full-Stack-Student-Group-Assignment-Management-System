import { useState, useEffect } from 'react';
import { assignmentsAPI, groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Target, 
  Globe, 
  AlertCircle,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', due_date: '', onedrive_link: '', target_type: 'all', group_ids: [] });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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
    if (!confirm('Delete this assignment? This will remove all associated group records.')) return;
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

  const filteredAssignments = assignments.filter(a => {
    if (statusFilter === 'confirmed') return a.total_groups > 0 && a.confirmed_count === a.total_groups;
    if (statusFilter === 'pending') return a.total_groups === 0 || a.confirmed_count < a.total_groups;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="page-title">Course Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">Publish coursework, configure target group scopes, and manage submission links</p>
        </div>
        <button onClick={openCreate} className="btn-primary text-xs py-2.5 px-4 shadow-sky-950/60 shrink-0">
          <Plus className="w-4 h-4" /> Create New Assignment
        </button>
      </div>

      {/* Filter Tabs */}
      {assignments.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Assignments', count: assignments.length },
            { id: 'confirmed', label: '100% Fully Confirmed', count: assignments.filter(a => a.total_groups > 0 && a.confirmed_count === a.total_groups).length },
            { id: 'pending', label: 'Pending Progress', count: assignments.filter(a => a.total_groups === 0 || a.confirmed_count < a.total_groups).length }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-sky-950 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="card text-center py-20 space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">No course assignments yet</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Create your first assignment to begin tracking student group submissions.</p>
          </div>
          <button onClick={openCreate} className="btn-primary text-xs py-2.5 px-5">
            <Plus className="w-4 h-4" /> Create Assignment Now
          </button>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No assignments match the selected status filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(a => (
            <div key={a.id} className="card hover:border-slate-700 transition-all shadow-md space-y-3">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white text-lg font-display">{a.title}</h3>
                    <span className={a.target_type === 'all' ? 'badge-blue' : 'badge-purple'}>
                      {a.target_type === 'all' ? (
                        <><Globe className="w-3 h-3" /> All Groups</>
                      ) : (
                        <><Target className="w-3 h-3" /> Targeted Groups</>
                      )}
                    </span>
                  </div>

                  {a.description && (
                    <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{a.description}</p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}
                    </span>

                    <span className="flex items-center gap-1 font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> {a.confirmed_count}/{a.total_groups} Groups Confirmed
                    </span>

                    {a.onedrive_link && (
                      <a 
                        href={a.onedrive_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> OneDrive Folder
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <button onClick={() => openEdit(a.id)} className="btn-ghost text-xs px-3 py-2">
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="btn-danger text-xs px-3 py-2">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Form Modal */}
      {showForm && (
        <Modal 
          title={editing ? 'Edit Assignment Details' : 'Create Course Assignment'} 
          onClose={() => { setShowForm(false); resetForm(); }} 
          size="lg"
          icon={editing ? Edit3 : Plus}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Assignment Title *</label>
              <input 
                className="input" 
                placeholder="e.g., Assignment 1: Distributed Systems Architecture" 
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} 
                required 
              />
            </div>

            <div>
              <label className="label">Description / Instructions</label>
              <textarea 
                className="input min-h-[90px] resize-y" 
                placeholder="Detailed instructions, requirements, submission format guidelines…"
                value={form.description} 
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Submission Deadline</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input 
                    type="datetime-local" 
                    className="input pl-10" 
                    value={form.due_date}
                    onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} 
                  />
                </div>
              </div>

              <div>
                <label className="label">OneDrive Folder Link</label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input 
                    className="input pl-10" 
                    placeholder="https://onedrive.live.com/…" 
                    value={form.onedrive_link}
                    onChange={e => setForm(f => ({ ...f, onedrive_link: e.target.value }))} 
                  />
                </div>
              </div>
            </div>

            {/* Target type selection */}
            <div>
              <label className="label">Assignment Target Scope</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, target_type: 'all' }))}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    form.target_type === 'all'
                      ? 'bg-sky-950/60 border-sky-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs font-display mb-1">
                    <Globe className="w-3.5 h-3.5 text-sky-400" /> All Groups
                  </div>
                  <p className="text-[11px] text-slate-400">Assigned to every registered study group</p>
                </button>

                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, target_type: 'specific_groups' }))}
                  className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                    form.target_type === 'specific_groups'
                      ? 'bg-purple-950/60 border-purple-500/50 text-white shadow-sm'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs font-display mb-1">
                    <Target className="w-3.5 h-3.5 text-purple-400" /> Specific Groups
                  </div>
                  <p className="text-[11px] text-slate-400">Target selected groups manually</p>
                </button>
              </div>
            </div>

            {/* Multi-select for specific groups */}
            {form.target_type === 'specific_groups' && (
              <div>
                <label className="label">Select Target Groups</label>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {allGroups.length === 0 ? (
                    <p className="text-slate-500 text-xs p-3">No student groups exist yet.</p>
                  ) : allGroups.map(g => (
                    <label 
                      key={g.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors border ${
                        form.group_ids.includes(g.id) 
                          ? 'bg-sky-950/40 border-sky-500/30' 
                          : 'hover:bg-slate-900 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          className="accent-sky-500 w-4 h-4 rounded"
                          checked={form.group_ids.includes(g.id)}
                          onChange={() => toggleGroup(g.id)} 
                        />
                        <span className="text-xs font-semibold text-white font-display">{g.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{g.member_count} members</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end pt-3 border-t border-slate-800">
              <button type="button" onClick={() => { setShowForm(false); resetForm(); }} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs" disabled={actionLoading}>
                {actionLoading ? 'Saving…' : editing ? 'Update Assignment' : 'Create Assignment'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
