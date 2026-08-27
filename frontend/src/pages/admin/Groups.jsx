import { useState, useEffect } from 'react';
import { groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  Users, 
  Eye, 
  Search, 
  Calendar, 
  Crown, 
  Mail, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    groupsAPI.all().then(r => setGroups(r.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    const res = await groupsAPI.get(id);
    setDetail(res.data);
  };

  const filteredGroups = groups.filter(g => {
    return g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (g.creator_name && g.creator_name.toLowerCase().includes(searchQuery.toLowerCase()));
  });

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
          <h1 className="page-title">Course Study Groups</h1>
          <p className="text-slate-400 text-sm mt-1">Overview of all active student groups, group leaders, and member rosters</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search groups by name or leader student…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Groups Table View */}
      {groups.length === 0 ? (
        <div className="card text-center py-20 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">No study groups formed</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Students haven't created any study groups yet.</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No study groups match your search query.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden border-slate-800 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="table-header">Group Name</th>
                  <th className="table-header">Group Creator / Leader</th>
                  <th className="table-header">Member Count</th>
                  <th className="table-header">Date Formed</th>
                  <th className="table-header text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredGroups.map(g => (
                  <tr key={g.id} className="table-row">
                    <td className="py-4 px-4 font-bold text-white text-sm font-display">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                          {g.name[0].toUpperCase()}
                        </div>
                        <span>{g.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-300 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{g.creator_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="badge-purple">
                        {g.member_count} {g.member_count === 1 ? 'member' : 'members'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                      {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => openDetail(g.id)} className="btn-ghost text-xs px-3 py-1.5">
                        <Eye className="w-3.5 h-3.5" /> View Roster
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roster Modal */}
      {detail && (
        <Modal title={`Roster: ${detail.name}`} onClose={() => setDetail(null)} size="lg" icon={Users}>
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">
                Group Leader: <span className="text-white font-bold">{detail.creator_name}</span>
              </span>
              <span className="text-slate-500">
                Formed {new Date(detail.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h4 className="section-title text-sm">
              Enrolled Members ({detail.members?.length || 0})
            </h4>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {detail.members?.map(m => {
                const isLeader = m.id === detail.created_by;
                return (
                  <div key={m.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/40 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                        {m.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white font-display">{m.name}</p>
                          {isLeader && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/40 text-amber-300 text-[10px] font-bold flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" /> Leader
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-500" /> {m.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
