import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../../context/AppContext";
import { COLUMNS } from "../../data/mockData";
import { getLeastBusyMember, countActiveTasks, ACTIVE_STATUSES } from "../../utils/workload";
import { canOverrideWip } from "../../utils/permissions";

const INITIAL_FORM = {
  title: "",
  description: "",
  status: "To Do",
  priority: "Medium",
  assignedTeamId: "team-dev",
  assignedUserIds: [],
  dueDate: "",
  estimatedHours: "4",
};

export default function CreateTaskModal({ onClose, onCreate }) {
  const { teams, users, tasks, currentUser, setNotifications } = useAppContext();
  const [form, setForm] = useState(INITIAL_FORM);
  const [showFocus, setShowFocus] = useState(false);
  const [focusInfo, setFocusInfo] = useState(null);

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === form.assignedTeamId),
    [form.assignedTeamId, teams]
  );

  const assignedUsers = useMemo(
    () => users.filter((user) => form.assignedUserIds.includes(user.id)),
    [form.assignedUserIds, users]
  );

  const leastBusy = useMemo(() => {
    if (!selectedTeam) return null;
    return getLeastBusyMember(selectedTeam, users, tasks);
  }, [selectedTeam, users, tasks]);

  useEffect(() => {
    if (!selectedTeam) return;
    const defaultIds = selectedTeam.members.slice();
    setForm((prev) => ({ ...prev, assignedTeamId: selectedTeam.id, assignedUserIds: defaultIds }));
  }, [selectedTeam?.id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const overloadedUsers = assignedUsers.filter((user) => countActiveTasks(tasks, user.id) >= 3);

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    if (form.assignedUserIds.length === 0) return;

    if (overloadedUsers.length > 0 && !canOverrideWip(currentUser)) {
      const [user] = overloadedUsers;
      setFocusInfo({ user, activeCount: countActiveTasks(tasks, user.id), suggestion: leastBusy });
      setShowFocus(true);
      return;
    }

    if (overloadedUsers.length > 0 && canOverrideWip(currentUser)) {
      const [user] = overloadedUsers;
      setFocusInfo({ user, activeCount: countActiveTasks(tasks, user.id), suggestion: leastBusy });
      setShowFocus(true);
      return;
    }

    submitTask();
  };

  const submitTask = () => {
    const task = {
      id: `t${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      assignedTeamId: form.assignedTeamId,
      assignedUserIds: form.assignedUserIds,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: form.dueDate || null,
      blockedSince: null,
      meetingGenerated: false,
      sourceMeetingId: null,
      estimatedHours: Number(form.estimatedHours),
      comments: [],
    };

    onCreate(task);
    form.assignedUserIds.forEach((userId) => {
      setNotifications((prev) => [
        {
          id: `n${Date.now()}${Math.random().toString(36).slice(2, 4)}`,
          userId,
          createdAt: new Date().toISOString(),
          read: false,
          title: "New task assigned",
          message: `${task.title} has been assigned to you.`,
          type: "task",
        },
        ...prev,
      ]);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Create new task</h2>
            <p className="mt-1 text-sm text-slate-500">Assign work, reduce meeting churn, and keep visibility clear.</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">✕</button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Task title
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Task status
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              {COLUMNS.map((column) => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Assigned team
            <select
              value={form.assignedTeamId}
              onChange={(e) => handleChange("assignedTeamId", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              {teams.map((team) => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
            Description
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Priority
            <select
              value={form.priority}
              onChange={(e) => handleChange("priority", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Due date
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => handleChange("dueDate", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-700">
            Estimated hours
            <input
              type="number"
              min="1"
              value={form.estimatedHours}
              onChange={(e) => handleChange("estimatedHours", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>

          <div className="sm:col-span-2 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <div className="font-medium text-slate-900">Assigned members</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTeam?.members.map((memberId) => {
                const user = users.find((item) => item.id === memberId);
                if (!user) return null;
                const isSelected = form.assignedUserIds.includes(memberId);
                return (
                  <button
                    key={memberId}
                    type="button"
                    onClick={() => {
                      const next = form.assignedUserIds.includes(memberId)
                        ? form.assignedUserIds.filter((id) => id !== memberId)
                        : [...form.assignedUserIds, memberId];
                      setForm((prev) => ({ ...prev, assignedUserIds: next }));
                    }}
                    className={`rounded-full border px-3 py-2 text-sm transition ${
                      isSelected ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    {user.name.split(" ").slice(0, 2).map((part) => part[0]).join("")}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 rounded-2xl bg-white p-3 border border-slate-200 text-slate-500 text-sm">
              All members of the selected team were automatically assigned. Use the chips above to add or remove specific users.
            </div>
            {leastBusy && (
              <div className="mt-3 text-sm text-slate-700">
                Suggested assignee: <span className="font-semibold text-slate-900">{leastBusy.user.name}</span> — {leastBusy.count} active task(s)
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onClose}
            className="rounded-3xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Create task
          </button>
        </div>

        {showFocus && focusInfo && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4">
            <div className="text-sm font-semibold text-red-900">Assignment Blocked</div>
            <p className="mt-2 text-sm text-red-800">
              This user already has 3 active tasks and has reached the WIP limit.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-3 border border-red-200">
                <div className="text-xs uppercase text-slate-500">Current active tasks</div>
                <div className="mt-2 text-lg font-semibold text-slate-900">{focusInfo.activeCount}</div>
              </div>
              <div className="rounded-2xl bg-white p-3 border border-red-200">
                <div className="text-xs uppercase text-slate-500">Recommended alternative</div>
                <div className="mt-2 font-semibold text-slate-900">{focusInfo.suggestion?.user.name || "No alternative"}</div>
                <div className="text-sm text-slate-500">{focusInfo.suggestion?.count ?? 0} active task(s)</div>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setShowFocus(false)}
                className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Select Alternative Assignee
              </button>
              {canOverrideWip(currentUser) ? (
                <button
                  onClick={() => {
                    submitTask();
                    setShowFocus(false);
                  }}
                  className="rounded-3xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500"
                >
                  Admin Override
                </button>
              ) : null}
            </div>
            {!canOverrideWip(currentUser) && (
              <div className="mt-4 rounded-2xl bg-red-100 p-3 text-sm text-red-700">
                Team leads cannot bypass the WIP limit. Please select another assignee from the team.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
