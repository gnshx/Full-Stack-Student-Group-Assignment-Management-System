import { useState, useEffect } from 'react';
import { groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function StudentGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showMembers, setShowMembers] = useState(null); // group detail
  const [newName, setNewName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => groupsAPI.mine().then(r => setGroups(r.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await groupsAPI.create({ name: newName });
      setNewName('');
      setShowCreate(false);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create group');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);
    try {
      await groupsAPI.addMember(showMembers.id, addEmail);
      setAddEmail('');
      const res = await groupsAPI.get(showMembers.id);
      setShowMembers(res.data);
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const openGroup = async (id) => {
    const res = await groupsAPI.get(id);
    setShowMembers(res.data);
    setError('');
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Groups</h1>
          <p className="text-slate-400 mt-1">Create, join, and manage your study groups</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">+ New Group</button>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">◈</div>
          <h3 className="text-lg font-semibold text-white mb-1">No groups yet</h3>
          <p className="text-slate-500 text-sm mb-4">Create your first study group to get started.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">Create Group</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map(g => (
            <div key={g.id} onClick={() => openGroup(g.id)}
              className="card hover:border-primary-500/40 cursor-pointer transition-all duration-200 hover:shadow-primary-900/20 hover:shadow-xl group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{g.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{g.member_count} member{g.member_count !== 1 ? 's' : ''}</p>
                </div>
                <span className="badge-blue">◈</span>
              </div>
              <p className="text-xs text-slate-600 mt-3">
                Created {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="Create New Group" onClose={() => { setShowCreate(false); setError(''); }}>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Group name</label>
              <input className="input" placeholder="e.g. Team Alpha" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary" disabled={actionLoading}>
                {actionLoading ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Members modal */}
      {showMembers && (
        <Modal title={showMembers.name} onClose={() => { setShowMembers(null); setError(''); }} size="lg">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
          <div className="mb-4">
            <p className="text-sm text-slate-400">Created by <span className="text-white font-medium">{showMembers.creator_name}</span></p>
          </div>

          <h4 className="section-title mb-3">Members ({showMembers.members?.length || 0})</h4>
          <div className="space-y-2 mb-5 max-h-60 overflow-y-auto">
            {showMembers.members?.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-sm font-semibold">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-600">
                  {new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>

          <h4 className="section-title mb-3">Add Member</h4>
          <form onSubmit={handleAddMember} className="flex gap-3">
            <input className="input flex-1" placeholder="student@university.edu" type="email"
              value={addEmail} onChange={e => setAddEmail(e.target.value)} required />
            <button type="submit" className="btn-primary whitespace-nowrap" disabled={actionLoading}>
              {actionLoading ? 'Adding…' : 'Add'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
