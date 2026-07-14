export default function FocusModeModal({ info, onCancel, onConfirm }) {
  if (!info) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-slate-900">Focus Mode Activated</h2>
        <p className="mt-3 text-sm text-slate-600">
          This user has reached the WIP limit of 3 active tasks. Assigning more work may reduce focus and delay completion.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Current active tasks</div>
            <div className="mt-2 text-3xl font-semibold text-slate-900">{info.activeCount}</div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase text-slate-500">Recommended alternative</div>
            <div className="mt-2 font-semibold text-slate-900">{info.suggestion.user.name}</div>
            <div className="text-sm text-slate-600">{info.suggestion.count} active tasks</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel Assignment
          </button>
          <button
            onClick={onConfirm}
            className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Assign Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
