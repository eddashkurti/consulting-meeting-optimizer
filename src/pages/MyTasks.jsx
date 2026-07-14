import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { canEditTask } from "../utils/permissions";
import { COLUMNS } from "../data/mockData";
import { formatTaskDate } from "../utils/workload";

export default function MyTasks() {
  const { tasks, setTasks, currentUser, users, teams } = useAppContext();
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assignedUserIds.includes(currentUser.id)),
    [tasks, currentUser.id]
  );

  const filteredTasks = useMemo(() => {
    return myTasks.filter((task) => {
      if (statusFilter !== "All" && task.status !== statusFilter) return false;
      if (priorityFilter !== "All" && task.priority !== priorityFilter) return false;
      return true;
    });
  }, [myTasks, statusFilter, priorityFilter]);

  const handleStatusChange = (taskId, nextStatus) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: nextStatus,
              updatedAt: new Date().toISOString(),
              blockedSince: nextStatus === "Blocked" ? new Date().toISOString() : null,
            }
          : task
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Personal tasks</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">My tasks</h1>
        <p className="mt-1 text-slate-600">Work on your assigned items and keep meeting follow-ups visible.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_240px]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <label className="text-sm text-slate-700">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option>All</option>
              {COLUMNS.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <label className="text-sm text-slate-700">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
            >
              <option>All</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Urgent</option>
            </select>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">No tasks found.</div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task) => {
                const assignedTeam = teams.find((team) => team.id === task.assignedTeamId);
                return (
                  <div key={task.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{task.title}</div>
                        <div className="mt-2 text-sm text-slate-500">{task.description || "No description provided."}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{task.status}</div>
                        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{task.priority}</div>
                        <div className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{assignedTeam?.name || "Unassigned"}</div>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 sm:grid-cols-3">
                      <div>
                        <div className="text-xs uppercase text-slate-500">Due date</div>
                        <div className="mt-1 text-sm text-slate-900">{formatTaskDate(task.dueDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-slate-500">Assigned users</div>
                        <div className="mt-1 text-sm text-slate-900">{task.assignedUserIds.map((userId) => users.find((user) => user.id === userId)?.name).join(", ")}</div>
                      </div>
                      <div>
                        <div className="text-xs uppercase text-slate-500">Estimated</div>
                        <div className="mt-1 text-sm text-slate-900">{task.estimatedHours} hrs</div>
                      </div>
                    </div>
                    {canEditTask(currentUser, task) ? (
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <span className="text-sm font-semibold text-slate-700">Update status</span>
                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                        >
                          {COLUMNS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
