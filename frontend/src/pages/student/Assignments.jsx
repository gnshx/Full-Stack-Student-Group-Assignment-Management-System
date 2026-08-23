import { useState, useEffect } from 'react';
import { assignmentsAPI, submissionsAPI, groupsAPI } from '../../services/api';
import Modal from '../../components/Modal';

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmTarget, setConfirmTarget] = useState(null); // step 1
  const [showFinalConfirm, setShowFinalConfirm] = useState(false); // step 2
  const [submitting, setSubmitting] = useState(false);
  const [detail, setDetail] = useState(null);

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

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Assignments</h1>
        <p className="text-slate-400 mt-1">View and confirm submissions for your group</p>
      </div>

      {assignments.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">◷</div>
          <h3 className="text-lg font-semibold text-white mb-1">No assignments yet</h3>
          <p className="text-slate-500 text-sm">Your professor hasn't posted any assignments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(a => {
            const isConfirmed = a.submission_status === 'confirmed';
            const isOverdue = !isConfirmed && a.due_date && new Date(a.due_date) < new Date();
            return (
              <div key={a.id} className="card hover:border-surface-muted transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-lg">{a.title}</h3>
                      {isConfirmed ? <span className="badge-green">✓ Confirmed</span>
                        : isOverdue ? <span className="badge-yellow">⚠ Overdue</span>
                        : <span className="badge-blue">Pending</span>}
                    </div>
                    {a.description && <p className="text-slate-400 text-sm mt-1 line-clamp-2">{a.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <span>Due: {a.due_date ? new Date(a.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No deadline'}</span>
                      {a.confirmed_at && <span>Confirmed: {new Date(a.confirmed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openDetail(a.id)} className="btn-ghost text-sm">View</button>
                    {!isConfirmed && groups.length > 0 && (
                      <button onClick={() => handleStep1(a)} className="btn-primary text-sm">
                        ✓ I have submitted
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Step 1 → Step 2 modal */}
      {confirmTarget && !showFinalConfirm && (
        <Modal title="Confirm Submission" onClose={() => setConfirmTarget(null)}>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600/20 border border-primary-500/30 mx-auto">
              <span className="text-3xl">📤</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">{confirmTarget.title}</h3>
              <p className="text-slate-400 text-sm mt-1">Have you submitted this assignment on OneDrive?</p>
              {confirmTarget.onedrive_link && (
                <a href={confirmTarget.onedrive_link} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-primary-400 hover:text-primary-300 text-sm underline">
                  Open OneDrive link →
                </a>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmTarget(null)} className="btn-secondary">Not yet</button>
              <button onClick={handleStep2} className="btn-primary">Yes, I have submitted</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Step 2: Final confirmation */}
      {confirmTarget && showFinalConfirm && (
        <Modal title="Final Confirmation" onClose={() => { setConfirmTarget(null); setShowFinalConfirm(false); }}>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/30 mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Are you sure?</h3>
              <p className="text-slate-400 text-sm mt-1">
                This will mark your <span className="text-white font-medium">group's</span> submission as complete for
                <span className="text-white font-medium"> "{confirmTarget.title}"</span>.
                This action is visible to your professor.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setConfirmTarget(null); setShowFinalConfirm(false); }} className="btn-secondary">Cancel</button>
              <button onClick={handleConfirm} className="btn-primary" disabled={submitting}>
                {submitting ? 'Confirming…' : 'Confirm submission'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Detail modal */}
      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} size="lg">
          <div className="space-y-4">
            {detail.description && <p className="text-slate-300">{detail.description}</p>}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Due date</span>
                <p className="text-white mt-0.5">{detail.due_date ? new Date(detail.due_date).toLocaleString() : 'No deadline'}</p>
              </div>
              <div>
                <span className="text-slate-500">Target</span>
                <p className="text-white mt-0.5 capitalize">{detail.target_type === 'all' ? 'All groups' : 'Specific groups'}</p>
              </div>
              <div>
                <span className="text-slate-500">Posted by</span>
                <p className="text-white mt-0.5">{detail.creator_name}</p>
              </div>
            </div>
            {detail.onedrive_link && (
              <a href={detail.onedrive_link} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-400 hover:bg-primary-600/30 transition-colors text-sm">
                📁 Open OneDrive Link
              </a>
            )}
            {detail.targeted_groups?.length > 0 && (
              <div>
                <h4 className="text-sm text-slate-500 mb-2">Targeted groups</h4>
                <div className="flex flex-wrap gap-2">
                  {detail.targeted_groups.map(g => (
                    <span key={g.id} className="badge-purple">{g.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
