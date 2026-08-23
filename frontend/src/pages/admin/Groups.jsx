import { useState, useEffect } from 'react';
import { groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function AdminGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    groupsAPI.all().then(r => setGroups(r.data)).finally(() => setLoading(false));
  }, []);

  const openDetail = async (id) => {
    const res = await groupsAPI.get(id);
    setDetail(res.data);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">All Groups</h1>
        <p className="text-slate-400 mt-1">View all student groups and their members</p>
      </div>

      {groups.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">◈</div>
          <h3 className="text-lg font-semibold text-white mb-1">No groups yet</h3>
          <p className="text-slate-500 text-sm">Students haven't created any groups.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-border text-left">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Group</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created by</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Members</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-medium text-white">{g.name}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-400">{g.creator_name}</td>
                  <td className="py-3 px-4">
                    <span className="badge-blue">{g.member_count}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => openDetail(g.id)} className="btn-ghost text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal title={detail.name} onClose={() => setDetail(null)} size="lg">
          <div className="mb-4">
            <p className="text-sm text-slate-400">Created by <span className="text-white font-medium">{detail.creator_name}</span></p>
            <p className="text-xs text-slate-600 mt-1">
              {new Date(detail.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          <h4 className="section-title mb-3">Members ({detail.members?.length || 0})</h4>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {detail.members?.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-surface-border">
                <div className="w-8 h-8 rounded-full bg-primary-600/20 border border-primary-500/30 flex items-center justify-center text-primary-400 text-sm font-semibold">
                  {m.name[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
