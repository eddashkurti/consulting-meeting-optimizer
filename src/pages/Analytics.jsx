import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { canViewAnalytics } from "../utils/permissions";
import { formatDuration } from "../utils/workload";

const STATUS_ORDER = ["Backlog", "To Do", "In Progress", "Blocked", "Review", "Done"];

export default function Analytics() {
  const { tasks, meetings, users, currentUser, teams } = useAppContext();
  if (!canViewAnalytics(currentUser)) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700 shadow-sm">
        <div className="text-xl font-semibold text-slate-900">Access denied</div>
        <p className="mt-3 text-sm text-slate-600">You do not have permission to view analytics.</p>
      </div>
    );
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Done").length;
  const blockedTasks = tasks.filter((task) => task.status === "Blocked").length;
  const pendingRequests = meetings.filter((meeting) => meeting.status === "PENDING").length;
  const approvedThisWeek = meetings.filter((meeting) => meeting.status === "APPROVED" && new Date(meeting.scheduledDate) >= new Date()).length;
  const averageMeetingDuration = Math.round(meetings.reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0) / Math.max(meetings.length, 1));
  const tasksFromMeetings = tasks.filter((task) => task.meetingGenerated).length;

  const tasksByStatus = STATUS_ORDER.map((status) => ({ status, count: tasks.filter((task) => task.status === status).length }));
  const tasksByTeam = teams.map((team) => ({ team: team.name, count: tasks.filter((task) => task.assignedTeamId === team.id).length }));
  const workloadByEmployee = users.map((user) => ({ name: user.name, count: tasks.filter((task) => task.assignedUserIds.includes(user.id) && ["To Do", "In Progress", "Blocked", "Review"].includes(task.status)).length }));
  const meetingsByType = meetings.reduce((acc, meeting) => {
    acc[meeting.type] = (acc[meeting.type] || 0) + 1;
    return acc;
  }, {});
  const recommendationBreakdown = meetings.reduce((acc, meeting) => {
    const key = meeting.recommendation || "OPTIONAL";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Analytics</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Meeting optimization metrics</h1>
        <p className="mt-1 text-slate-600">Monitor task flow, blockers, and meeting quality trends.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {[
          { label: "Total tasks", value: totalTasks },
          { label: "Completed tasks", value: completedTasks },
          { label: "Blocked tasks", value: blockedTasks },
          { label: "Pending requests", value: pendingRequests },
        ].map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm text-slate-500">{item.label}</div>
            <div className="mt-4 text-3xl font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Approved meetings</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{approvedThisWeek}</div>
          <div className="mt-2 text-sm text-slate-500">Meetings scheduled this week.</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Average meeting duration</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{formatDuration(averageMeetingDuration)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Tasks from meetings</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{tasksFromMeetings}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Tasks by status</div>
          <div className="mt-4 space-y-4">
            {tasksByStatus.map((item) => (
              <div key={item.status} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{item.status}</span>
                  <span>{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-blue-600"
                    style={{ width: `${Math.round((item.count / Math.max(totalTasks, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Meeting recommendation breakdown</div>
          <div className="mt-4 space-y-4">
            {Object.entries(recommendationBreakdown).map(([key, count]) => (
              <div key={key} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span>{key.replace("_", " ")}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Workload by employee</div>
          <div className="mt-4 space-y-3">
            {workloadByEmployee
              .sort((a, b) => b.count - a.count)
              .slice(0, 6)
              .map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-slate-700">
                    <span>{item.name}</span>
                    <span>{item.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${Math.min(100, item.count * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Meetings by type</div>
          <div className="mt-4 space-y-3">
            {Object.entries(meetingsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between rounded-3xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <span>{type.replace("_", " ")}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
