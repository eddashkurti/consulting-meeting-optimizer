export default function AgendaPanel({ tasks, onClose }) {
  const doneAndReviewCount = tasks.filter((t) => t.status === "Done" || t.status === "Review").length;
  const totalTasks = tasks.length;
  const blockedTasks = tasks.filter((task) => task.status === "Blocked");
  const blockedRequests = blockedTasks.filter((task) => task.blockedSince);
  const hasSyncRequests = blockedTasks.length > 0;

  return (
    <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl p-6 z-10 overflow-y-auto">
      <h2 className="text-lg font-semibold text-slate-900">Meeting agenda</h2>
      <p className="mt-2 text-sm text-slate-500">Quick view of blockers and suggested syncs.</p>

      <div className="mt-6 space-y-4">
        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Progress</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{doneAndReviewCount}/{totalTasks}</div>
          <div className="mt-2 text-sm text-slate-500">Tasks in review or done</div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Blocker summary</div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">{blockedTasks.length}</div>
          <div className="mt-2 text-sm text-slate-500">Blocked tasks currently needing attention</div>
        </div>

        <div className="rounded-3xl bg-slate-50 p-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Escalated blockers</div>
          <div className="mt-3 text-2xl font-semibold text-slate-900">{blockedRequests.length}</div>
          <div className="mt-2 text-sm text-slate-500">Tasks blocked for 24+ hours</div>
        </div>
      </div>

      <div className="mt-6">
        <div className="text-sm font-semibold text-slate-900">Blocked task watchlist</div>
        <div className="mt-4 space-y-3">
          {blockedTasks.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">No blocked tasks at the moment.</div>
          ) : (
            blockedTasks.slice(0, 5).map((task) => (
              <div key={task.id} className="rounded-3xl border border-slate-200 bg-white p-4">
                <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                <div className="mt-1 text-xs text-slate-500">{task.assignedUserIds.length} assignee(s)</div>
                <div className="mt-2 text-xs text-slate-600">Due {task.dueDate || "TBD"}</div>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-[16px] bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8]"
        >
          Hide Agenda
        </button>
      </div>
    </div>
  );
}
