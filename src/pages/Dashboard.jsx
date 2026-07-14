import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { countActiveTasks, formatDuration, getDateCategory, getMeetingDurationSummary } from "../utils/workload";
import { canViewAnalytics } from "../utils/permissions";

function statCard({ label, value, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
      <div className="mt-2 text-sm text-slate-500">{label}</div>
      {description ? <div className="mt-3 text-sm text-slate-500">{description}</div> : null}
    </div>
  );
}

export default function Dashboard() {
  const { currentUser, tasks, meetings, users, teams, notifications, changeRequests, pendingActionItems, setChangeRequests, setTasks, setNotifications } = useAppContext();
  const myTasks = tasks.filter((task) => task.assignedUserIds.includes(currentUser.id));
  const activeTasks = myTasks.filter((task) => ["To Do", "In Progress", "Blocked", "Review"].includes(task.status)).length;
  const completedTasks = myTasks.filter((task) => task.status === "Done").length;
  const blockedTasks = myTasks.filter((task) => task.status === "Blocked").length;
  const unreadNotifications = notifications.filter((note) => note.userId === currentUser.id && !note.read).length;
  const pendingChangeRequests = changeRequests.filter((request) => request.status === "PENDING").length;
  const myDraftActions = pendingActionItems.filter((item) => item.createdBy === currentUser.id).length;
  const today = new Date().toISOString().slice(0, 10);
  const meetingsToday = meetings.filter(
    (meeting) =>
      meeting.scheduledDate === today &&
      meeting.participantIds.includes(currentUser.id)
  );
  const upcomingMeetings = meetings.filter(
    (meeting) =>
      meeting.participantIds.includes(currentUser.id) &&
      new Date(meeting.scheduledDate) >= new Date(today)
  );
  const tasksDueSoon = myTasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const now = new Date();
    const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  const team = teams.find((team) => team.id === currentUser.teamId);
  const teamMembers = users.filter((user) => user.teamId === currentUser.teamId);
  const teamTasks = tasks.filter((task) => task.assignedTeamId === currentUser.teamId);
  const pendingRequests = meetings.filter((meeting) => meeting.status === "PENDING");
  const blockedTeam = teamTasks.filter((task) => task.status === "Blocked").length;
  const inProgress = teamTasks.filter((task) => task.status === "In Progress").length;

  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 7);
  const meetingsThisWeek = meetings.filter((meeting) => {
    const date = new Date(meeting.scheduledDate);
    return date >= thisWeekStart && date < thisWeekEnd;
  });

  const approvedThisWeek = meetingsThisWeek.filter((meeting) => meeting.status === "APPROVED").length;

  const joinedMeetingTime = meetingsThisWeek
    .filter((meeting) => meeting.participantIds.includes(currentUser.id))
    .reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0);

  const tasksFromMeetings = tasks.filter((task) => task.meetingGenerated).length;

  const managerRoles = ["TEAM_LEAD", "PROJECT_LEAD", "ADMIN", "MANAGER"];
  const canReviewChangeRequests = managerRoles.includes(currentUser.role);
  const pendingChangeRequestItems = changeRequests.filter((request) => request.status === "PENDING");
  const myChangeRequests = changeRequests.filter((request) => request.requestedBy === currentUser.id);

  const applyRequestChange = (request) => {
    if (!request) return {};
    const requestedValue = (request.requestedChange || "").trim();
    const update = {};
    if (request.requestType === "Due date change") {
      const dateMatch = requestedValue.match(/\d{4}-\d{2}-\d{2}/);
      if (dateMatch) update.dueDate = dateMatch[0];
    }
    if (request.requestType === "Priority change") {
      const priority = ["Low", "Medium", "High", "Urgent"].find((option) => requestedValue.includes(option));
      if (priority) update.priority = priority;
    }
    return update;
  };

  const notifyUser = (userId, title, message) => {
    setNotifications((prev) => [
      {
        id: `n${Date.now()}${Math.random().toString(36).slice(2, 5)}`,
        userId,
        createdAt: new Date().toISOString(),
        read: false,
        title,
        message,
        type: "task",
      },
      ...prev,
    ]);
  };

  const handleReviewRequest = (request, status) => {
    setChangeRequests((prev) =>
      prev.map((item) =>
        item.id === request.id
          ? { ...item, status, reviewedBy: currentUser.id, reviewedAt: new Date().toISOString() }
          : item
      )
    );

    const updates = applyRequestChange(request);
    if (Object.keys(updates).length > 0) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === request.taskId ? { ...task, ...updates, updatedAt: new Date().toISOString() } : task
        )
      );
    }

    notifyUser(
      request.requestedBy,
      `Task request ${status.toLowerCase()}`,
      `Your change request for ${request.taskTitle} was ${status.toLowerCase()}.`
    );
  };

  const adminOverview = useMemo(() => {
    return {
      totalTasks: tasks.length,
      completedTasks: tasks.filter((task) => task.status === "Done").length,
      blockedTasks: tasks.filter((task) => task.status === "Blocked").length,
      pendingRequests: meetings.filter((meeting) => meeting.status === "PENDING").length,
      meetingTime: meetingsThisWeek.reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0),
      tasksFromMeetings: tasksFromMeetings,
    };
  }, [tasks, meetingsThisWeek, tasksFromMeetings]);

  if (currentUser.role === "TEAM_MEMBER") {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Welcome back</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{currentUser.name}</h1>
          <p className="mt-2 text-slate-600">Your personalized meeting and task overview.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {statCard({ label: "My active tasks", value: activeTasks })}
          {statCard({ label: "Completed tasks", value: completedTasks })}
          {statCard({ label: "Notifications", value: unreadNotifications, description: "Unread alerts in your activity feed." })}
          {statCard({ label: "Draft action items", value: myDraftActions, description: "Draft meeting follow-ups awaiting approval." })}
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Current WIP status</div>
            <div className={`mt-4 rounded-3xl px-4 py-5 text-xl font-semibold ${activeTasks > 3 ? "bg-red-50 text-red-700" : activeTasks === 3 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
              {activeTasks > 3 ? "Overloaded" : activeTasks === 3 ? "At WIP limit" : "Healthy workload"}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Upcoming meetings</div>
            <div className="mt-4 space-y-3">
              {upcomingMeetings.slice(0, 4).map((meeting) => (
                <div key={meeting.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{meeting.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{meeting.scheduledDate} · {meeting.startTime}</div>
                </div>
              ))}
              {upcomingMeetings.length === 0 && <div className="text-sm text-slate-500">No meetings scheduled.</div>}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Tasks due soon</div>
            <div className="mt-4 space-y-3">
              {tasksDueSoon.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">Due {task.dueDate}</div>
                </div>
              ))}
              {tasksDueSoon.length === 0 && <div className="text-sm text-slate-500">No tasks due soon.</div>}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">My task change requests</div>
              <div className="mt-1 text-sm text-slate-500">Track requests you've submitted and their current status.</div>
            </div>
            <div className="text-sm font-semibold text-slate-700">{myChangeRequests.length} total</div>
          </div>
          <div className="mt-5 space-y-4">
            {myChangeRequests.length ? (
              myChangeRequests.map((request) => (
                <div key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <div className="font-semibold text-slate-900">{request.taskTitle}</div>
                      <div className="text-sm text-slate-500">{request.requestType} · {new Date(request.requestedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="rounded-full px-3 py-1 text-xs font-semibold uppercase text-slate-700 bg-slate-200">
                      {request.status}
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-slate-700">{request.requestedChange}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No task change requests submitted yet.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === "TEAM_LEAD") {
    return (
      <div className="space-y-6">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Team lead overview</div>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">{currentUser.name}</h1>
          <p className="mt-2 text-slate-600">Monitor workload, blockers, and meeting effectiveness.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-4">
          {statCard({ label: "Team workload", value: teamTasks.filter((task) => ["To Do", "In Progress", "Blocked", "Review"].includes(task.status)).length })}
          {statCard({ label: "Pending meeting requests", value: pendingRequests.length })}
          {statCard({ label: "Open change requests", value: pendingChangeRequests })}
          {statCard({ label: "Unread notifications", value: unreadNotifications })}
        </div>

        {canReviewChangeRequests ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">Pending task change requests</div>
                <div className="mt-1 text-sm text-slate-500">Review team-submitted requests and approve or reject updates.</div>
              </div>
              <div className="text-sm font-semibold text-slate-700">{pendingChangeRequestItems.length} pending</div>
            </div>
            <div className="mt-5 space-y-4">
              {pendingChangeRequestItems.length ? (
                pendingChangeRequestItems.map((request) => {
                  const requester = users.find((user) => user.id === request.requestedBy);
                  return (
                    <div key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{request.taskTitle}</div>
                          <div className="mt-1 text-sm text-slate-500">
                            {request.requestType} · {requester?.name || "Unknown"}
                          </div>
                          <div className="mt-2 text-sm text-slate-700">{request.requestedChange}</div>
                          {request.reason ? <div className="mt-2 text-sm text-slate-500">Reason: {request.reason}</div> : null}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleReviewRequest(request, "APPROVED")}
                            className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReviewRequest(request, "REJECTED")}
                            className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500">No task change requests are waiting for review.</div>
              )}
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 xl:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Meetings this week</div>
            <div className="mt-4 text-3xl font-semibold text-slate-900">{approvedThisWeek}</div>
            <div className="mt-2 text-sm text-slate-500">Approved meetings in the current week.</div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Team members</div>
            <div className="mt-4 space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="rounded-3xl bg-slate-50 p-3">
                  <div className="font-semibold text-slate-900">{member.name}</div>
                  <div className="text-sm text-slate-500">{member.jobTitle}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">Meeting load</div>
            <div className="mt-4 text-3xl font-semibold text-slate-900">{formatDuration(joinedMeetingTime)}</div>
            <div className="mt-2 text-sm text-slate-500">Your confirmed meetings this week.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin overview</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{currentUser.name}</h1>
        <p className="mt-2 text-slate-600">Organization-wide health and meeting efficiency metrics.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {statCard({ label: "Total tasks", value: adminOverview.totalTasks })}
        {statCard({ label: "Completed tasks", value: adminOverview.completedTasks })}
        {statCard({ label: "Blocked tasks", value: adminOverview.blockedTasks })}
        {statCard({ label: "Unread notifications", value: unreadNotifications })}
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {statCard({ label: "Approved meetings this week", value: approvedThisWeek })}
        {statCard({ label: "Average meeting time", value: formatDuration(Math.round(adminOverview.meetingTime / Math.max(approvedThisWeek, 1))) })}
        {statCard({ label: "Tasks from meetings", value: adminOverview.tasksFromMeetings })}
        {statCard({ label: "Open change requests", value: pendingChangeRequests, description: "Requests waiting for leadership review." })}
      </div>

      {canReviewChangeRequests ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-900">Pending task change requests</div>
              <div className="mt-1 text-sm text-slate-500">Review requests from your organization and provide a decision.</div>
            </div>
            <div className="text-sm font-semibold text-slate-700">{pendingChangeRequestItems.length} pending</div>
          </div>
          <div className="mt-5 space-y-4">
            {pendingChangeRequestItems.length ? (
              pendingChangeRequestItems.map((request) => {
                const requester = users.find((user) => user.id === request.requestedBy);
                return (
                  <div key={request.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-semibold text-slate-900">{request.taskTitle}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {request.requestType} · {requester?.name || "Unknown"}
                        </div>
                        <div className="mt-2 text-sm text-slate-700">{request.requestedChange}</div>
                        {request.reason ? <div className="mt-2 text-sm text-slate-500">Reason: {request.reason}</div> : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleReviewRequest(request, "APPROVED")}
                          className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewRequest(request, "REJECTED")}
                          className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-sm text-slate-500">No task change requests are waiting for review.</div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
