import { useState, useEffect } from 'react';
import { groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Users, 
  Plus, 
  Crown, 
  UserPlus, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  AlertCircle,
  Search,
  ArrowRight
} from 'lucide-react';

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
      setError(err.response?.data?.error || 'Failed to create study group');
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
      setError(err.response?.data?.error || 'Failed to add member to group');
    } finally {
      setActionLoading(false);
    }
  };

  const openGroup = async (id) => {
    const res = await groupsAPI.get(id);
    setShowMembers(res.data);
    setError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="page-title">My Study Groups</h1>
          <p className="text-slate-400 text-sm mt-1">Form assignment groups, add classmates, and designate group leadership</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-2.5 px-4 shadow-sky-950/60 shrink-0">
          <Plus className="w-4 h-4" /> Create New Group
        </button>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="card text-center py-20 space-y-4">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white font-display">No study groups joined</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">Create a group or ask a classmate to invite your university email address.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs py-2.5 px-5">
            <Plus className="w-4 h-4" /> Create Study Group Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map(g => (
            <div 
              key={g.id} 
              onClick={() => openGroup(g.id)}
              className="card-interactive space-y-4 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-bold text-white text-base group-hover:text-sky-400 transition-colors font-display truncate">
                    {g.name}
                  </h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    {g.member_count} {g.member_count === 1 ? 'Member' : 'Members'}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-600" />
                  Formed {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-sky-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold">
                  Manage <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <Modal title="Create Study Group" onClose={() => { setShowCreate(false); setError(''); }} icon={Users}>
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="label">Group Title</label>
              <input 
                className="input" 
                placeholder="e.g., Computer Science Team Alpha" 
                value={newName} 
                onChange={e => setNewName(e.target.value)} 
                required 
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs" disabled={actionLoading}>
                {actionLoading ? 'Creating…' : 'Create Group'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Group Detail & Add Members Modal */}
      {showMembers && (
        <Modal title={showMembers.name} onClose={() => { setShowMembers(null); setError(''); }} size="lg" icon={Users}>
          <div className="space-y-6">
            {error && (
              <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">
                Created by <span className="text-white font-semibold">{showMembers.creator_name}</span>
              </span>
              <span className="text-slate-500">
                Group ID: #{showMembers.id}
              </span>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="section-title text-sm">
                Group Roster ({showMembers.members?.length || 0})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {showMembers.members?.map(m => {
                  const isLeader = m.id === showMembers.created_by;
                  return (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                          {m.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-white font-display">{m.name}</p>
                            {isLeader && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                                <Crown className="w-3 h-3 text-amber-400" /> Group Leader
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{m.email}</p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Joined {new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Member Form */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <h4 className="section-title text-sm">Add Team Member</h4>
              <form onSubmit={handleAddMember} className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input 
                    className="input pl-10" 
                    placeholder="classmate@university.edu" 
                    type="email"
                    value={addEmail} 
                    onChange={e => setAddEmail(e.target.value)} 
                    required 
                  />
                </div>
                <button type="submit" className="btn-primary text-xs px-4 whitespace-nowrap" disabled={actionLoading}>
                  {actionLoading ? 'Adding…' : 'Add Member'}
                </button>
              </form>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
