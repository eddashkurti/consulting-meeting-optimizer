import { useMemo, useState } from "react";
import { COLUMNS } from "../data/mockData";
import { useAppContext } from "../context/AppContext";
import { canEditTaskDetails, canUpdateTaskStatus, canRequestTaskChange } from "../utils/permissions";

export default function TaskDetailModal({ task, onClose, onSave }) {
  const { currentUser, users, teams, setChangeRequests } = useAppContext();
  const canEditDetails = canEditTaskDetails(currentUser, task);
  const canUpdateStatus = canUpdateTaskStatus(currentUser, task);
  const canRequestChange = canRequestTaskChange(currentUser, task);
  const [edited, setEdited] = useState({ ...task });
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestType, setRequestType] = useState("");
  const [requestChange, setRequestChange] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const assignedUsers = useMemo(
    () => users.filter((user) => edited.assignedUserIds.includes(user.id)),
    [edited.assignedUserIds, users]
  );

  const assignedTeam = teams.find((team) => team.id === edited.assignedTeamId);

  const handleSave = () => {
    const nextTask = { ...edited, updatedAt: new Date().toISOString() };
    if (!canEditDetails && canUpdateStatus) {
      nextTask.title = task.title;
      nextTask.description = task.description;
      nextTask.priority = task.priority;
      nextTask.assignedTeamId = task.assignedTeamId;
      nextTask.assignedUserIds = task.assignedUserIds;
      nextTask.dueDate = task.dueDate;
      nextTask.estimatedHours = task.estimatedHours;
    }
    onSave(nextTask);
    onClose();
  };

  const handleSubmitRequest = () => {
    if (!requestType.trim() || !requestChange.trim()) {
      setRequestMessage("Please provide request type and details.");
      return;
    }
    setChangeRequests((prev) => [
      {
        id: `cr${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        taskId: task.id,
        taskTitle: task.title,
        requestedBy: currentUser.id,
        requestedAt: new Date().toISOString(),
        status: "PENDING",
        requestType: requestType.trim(),
        requestedChange: requestChange.trim(),
        reason: requestReason.trim(),
      },
      ...prev,
    ]);
    setRequestType("");
    setRequestChange("");
    setRequestReason("");
    setRequestMessage("Your change request has been submitted for manager review.");
    setShowRequestForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Task details</h2>
            <p className="mt-1 text-sm text-slate-500">Review task context and make allowed updates.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Title
            <input
              value={edited.title}
              onChange={(e) => setEdited({ ...edited, title: e.target.value })}
              disabled={!canEditDetails}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Team
            <input
              value={assignedTeam?.name || "Unassigned"}
              disabled
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Priority
            <select
              value={edited.priority}
              onChange={(e) => setEdited({ ...edited, priority: e.target.value })}
              disabled={!canEditDetails}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Status
            <select
              value={edited.status}
              onChange={(e) => setEdited({ ...edited, status: e.target.value })}
              disabled={!canUpdateStatus}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
            >
              {COLUMNS.map((column) => (
                <option key={column}>{column}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Due date
            <input
              type="date"
              value={edited.dueDate || ""}
              onChange={(e) => setEdited({ ...edited, dueDate: e.target.value })}
              disabled={!canEditDetails}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Estimated hours
            <input
              type="number"
              min="1"
              value={edited.estimatedHours}
              onChange={(e) => setEdited({ ...edited, estimatedHours: Number(e.target.value) })}
              disabled={!canEditDetails}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none disabled:opacity-70"
            />
          </label>
        </div>

        <div className="mt-6 grid gap-4">
          <label className="space-y-2 text-sm text-slate-700">
            Description
            <textarea
              rows={4}
              value={edited.description || ""}
              onChange={(e) => setEdited({ ...edited, description: e.target.value })}
              disabled={!canEditDetails}
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none disabled:opacity-70"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">Assigned users</div>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                {assignedUsers.length ? (
                  assignedUsers.map((user) => <div key={user.id}>{user.name}</div>)
                ) : (
                  <div>No assignees</div>
                )}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs uppercase text-slate-500">Comments</div>
              <div className="mt-3 text-sm text-slate-700">
                {edited.comments?.length ? edited.comments.join("\n") : "No comments available."}
              </div>
            </div>
          </div>
        </div>

        {canRequestChange ? (
          <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-900">Request a change</div>
                <div className="mt-1 text-sm text-slate-600">Submit a task update request for a lead to review.</div>
              </div>
              <button
                onClick={() => setShowRequestForm((prev) => !prev)}
                className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {showRequestForm ? "Cancel" : "Request Task Change"}
              </button>
            </div>
            {showRequestForm ? (
              <div className="mt-4 space-y-3">
                <label className="space-y-2 text-sm text-slate-700">
                  Request type
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Select request type</option>
                    <option value="Due date change">Due date change</option>
                    <option value="Priority change">Priority change</option>
                    <option value="Description update">Description update</option>
                    <option value="Reassignment">Reassignment</option>
                    <option value="Status clarification">Status clarification</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Requested change
                  <textarea
                    rows={3}
                    value={requestChange}
                    onChange={(e) => setRequestChange(e.target.value)}
                    placeholder="Describe what should change..."
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none resize-none"
                  />
                </label>
                <label className="space-y-2 text-sm text-slate-700">
                  Reason
                  <textarea
                    rows={2}
                    value={requestReason}
                    onChange={(e) => setRequestReason(e.target.value)}
                    placeholder="Why is this change needed?"
                    className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none resize-none"
                  />
                </label>
                <button
                  onClick={handleSubmitRequest}
                  className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
                >
                  Submit request
                </button>
                {requestMessage ? <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{requestMessage}</div> : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Close
          </button>
          {(canEditDetails || canUpdateStatus) ? (
            <button
              onClick={handleSave}
              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Save changes
            </button>
          ) : (
            <div className="rounded-3xl bg-slate-50 px-5 py-3 text-sm text-slate-600">You can request a task update if changes are required.</div>
          )}
        </div>
      </div>
    </div>
  );
}
