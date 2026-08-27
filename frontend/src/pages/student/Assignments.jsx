import { useState, useEffect } from 'react';
import { assignmentsAPI, submissionsAPI, groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ExternalLink, 
  Lock, 
  Users, 
  Send, 
  Eye, 
  ShieldAlert, 
  Search,
  Filter
} from 'lucide-react';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // step 1
  const [showFinalConfirm, setShowFinalConfirm] = useState(false); // step 2
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = () => {
    Promise.all([assignmentsAPI.list(), groupsAPI.mine()])
      .then(([a, g]) => { setAssignments(a.data); setGroups(g.data); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  // Step 1: student clicks "I have submitted" → sets confirmTarget
  const handleStep1 = (assignment) => {
    setConfirmTarget(assignment);
    setShowFinalConfirm(false);
  };

  // Step 2: show final confirmation dialog
  const handleStep2 = () => {
    setShowFinalConfirm(true);
  };

  // Step 2 confirm: actually POST
  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await submissionsAPI.confirm(confirmTarget.id);
      setConfirmTarget(null);
      setShowFinalConfirm(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Confirmation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = async (id) => {
    const res = await assignmentsAPI.get(id);
    setDetail(res.data);
  };

  const filteredAssignments = assignments.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    const isConfirmed = a.submission_status === 'confirmed';
    const isOverdue = !isConfirmed && a.due_date && new Date(a.due_date) < new Date();
    
    if (statusFilter === 'confirmed') return isConfirmed;
    if (statusFilter === 'pending') return !isConfirmed && !isOverdue;
    if (statusFilter === 'overdue') return isOverdue;
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
          <p className="text-slate-400 text-sm mt-1">Review assignments, access project instructions, and record group submissions</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search assignments by title or keyword…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          {[
            { id: 'all', label: 'All Assignments', count: assignments.length },
            { id: 'pending', label: 'Pending', count: assignments.filter(a => a.submission_status !== 'confirmed' && (!a.due_date || new Date(a.due_date) >= new Date())).length },
            { id: 'confirmed', label: 'Confirmed', count: assignments.filter(a => a.submission_status === 'confirmed').length },
            { id: 'overdue', label: 'Overdue', count: assignments.filter(a => a.submission_status !== 'confirmed' && a.due_date && new Date(a.due_date) < new Date()).length },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-sky-950 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <div className="card text-center py-20 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white font-display">No assignments posted</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Your course professor hasn't published any assignments yet.</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-slate-400 text-sm">No assignments match your search or filter options.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(a => {
            const isConfirmed = a.submission_status === 'confirmed';
            const isOverdue = !isConfirmed && a.due_date && new Date(a.due_date) < new Date();

            return (
              <div key={a.id} className="card hover:border-slate-700 transition-all shadow-md hover:shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-white text-lg font-display">{a.title}</h3>
                      {isConfirmed ? (
                        <span className="badge-green">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed
                        </span>
                      ) : isOverdue ? (
                        <span className="badge-yellow">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Overdue
                        </span>
                      ) : (
                        <span className="badge-blue">
                          <Clock className="w-3.5 h-3.5 text-sky-400" /> Pending Confirmation
                        </span>
                      )}
                    </div>

                    {a.description && (
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2">{a.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Due Date: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}
                      </span>

                      {a.onedrive_link && (
                        <a 
                          href={a.onedrive_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open OneDrive Folder
                        </a>
                      )}

                      {a.confirmed_at && (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed on {new Date(a.confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                    <button 
                      onClick={() => openDetail(a.id)} 
                      className="btn-ghost text-xs px-3 py-2"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>

                    {!isConfirmed && (
                      groups.length === 0 ? (
                        <span className="px-3 py-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" /> Join group to submit
                        </span>
                      ) : a.is_group_leader ? (
                        <button 
                          onClick={() => handleStep1(a)} 
                          className="btn-primary text-xs py-2 px-4 shadow-sky-950/60"
                        >
                          <Send className="w-3.5 h-3.5" /> I Have Submitted
                        </button>
                      ) : (
                        <span 
                          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold flex items-center gap-1.5" 
                          title="Only your group leader can mark this submission as confirmed"
                        >
                          <Lock className="w-3.5 h-3.5 text-amber-400" /> Leader Submission Only
                        </span>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1 Modal */}
      {confirmTarget && !showFinalConfirm && (
        <Modal title="Confirm Submission Status" onClose={() => setConfirmTarget(null)} icon={Send}>
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
              <Send className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg font-display">{confirmTarget.title}</h3>
              <p className="text-slate-300 text-sm">
                Has your team finished and submitted the project files on OneDrive?
              </p>

              {confirmTarget.onedrive_link && (
                <div className="pt-2">
                  <a 
                    href={confirmTarget.onedrive_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-400 hover:text-sky-300 text-xs font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Verify OneDrive Submission Link
                  </a>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => setConfirmTarget(null)} className="btn-secondary text-xs">
                Not Yet
              </button>
              <button onClick={handleStep2} className="btn-primary text-xs">
                Yes, Ready to Confirm
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Step 2 Modal */}
      {confirmTarget && showFinalConfirm && (
        <Modal title="Final Academic Confirmation" onClose={() => { setConfirmTarget(null); setShowFinalConfirm(false); }} icon={ShieldAlert}>
          <div className="text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg font-display">Confirm Final Group Submission?</h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                You are about to mark <span className="text-white font-semibold">{confirmTarget.title}</span> as officially completed for your group.
                This action is permanently logged and reported directly to your professor.
              </p>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => { setConfirmTarget(null); setShowFinalConfirm(false); }} className="btn-secondary text-xs">
                Cancel
              </button>
              <button onClick={handleConfirm} className="btn-primary text-xs" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Finalize Confirmation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail Modal */}
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} size="lg" icon={FileText}>
          <div className="space-y-6">
            {detail.description && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-300 text-sm leading-relaxed">
                {detail.description}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Due Date</span>
                <p className="text-white font-medium text-sm">
                  {detail.due_date ? new Date(detail.due_date).toLocaleString() : 'No deadline'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Target Scope</span>
                <p className="text-white font-medium text-sm capitalize">
                  {detail.target_type === 'all' ? 'All Course Groups' : 'Selected Target Groups'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Posted By</span>
                <p className="text-white font-medium text-sm">{detail.creator_name}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase tracking-wider font-semibold text-[10px]">Submission Status</span>
                <p className="text-white font-medium text-sm">
                  {detail.submission_status === 'confirmed' ? '✓ Confirmed' : 'Pending'}
                </p>
              </div>
            </div>

            {detail.onedrive_link && (
              <a 
                href={detail.onedrive_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full btn-primary py-3 justify-center text-xs"
              >
                <ExternalLink className="w-4 h-4" /> Open Course OneDrive Submission Directory
              </a>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
