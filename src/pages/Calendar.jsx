import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { formatDuration, getDateCategory } from "../utils/workload";
import { getMeetingDisplayStatus } from "../utils/meetingRules";

export default function Calendar() {
  const { meetings, tasks, currentUser, users } = useAppContext();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const userMeetings = useMemo(
    () => meetings.filter((meeting) => meeting.participantIds.includes(currentUser.id)),
    [meetings, currentUser.id]
  );

  const upcomingMeetings = useMemo(
    () =>
      userMeetings
        .filter((meeting) => getMeetingDisplayStatus(meeting) === "APPROVED")
        .filter((meeting) => new Date(meeting.scheduledDate) >= today)
        .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate)),
    [userMeetings, today]
  );

  const historyMeetings = useMemo(
    () =>
      userMeetings
        .filter((meeting) => getMeetingDisplayStatus(meeting) !== "APPROVED" || new Date(meeting.scheduledDate) < today)
        .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate)),
    [userMeetings, today]
  );

  const taskDueItems = useMemo(
    () =>
      tasks
        .filter(
          (task) =>
            task.assignedUserIds.includes(currentUser.id) && task.dueDate && new Date(task.dueDate) >= new Date()
        )
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [tasks, currentUser.id]
  );

  const sections = useMemo(() => {
    return {
      today: upcomingMeetings.filter((meeting) => getDateCategory(meeting.scheduledDate) === "today"),
      week: upcomingMeetings.filter((meeting) => getDateCategory(meeting.scheduledDate) === "week"),
      upcoming: upcomingMeetings.filter((meeting) => getDateCategory(meeting.scheduledDate) === "upcoming"),
    };
  }, [upcomingMeetings]);

  const meetingTimeToday = sections.today.reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0);
  const meetingTimeWeek = sections.week.reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Calendar</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Personal schedule</h1>
        <p className="mt-1 text-slate-600">See your approved meetings and upcoming deadlines in one place.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Today’s meeting time</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{formatDuration(meetingTimeToday)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">This week</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{formatDuration(meetingTimeWeek)}</div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Approved meetings</div>
          <div className="mt-4 text-3xl font-semibold text-slate-900">{upcomingMeetings.length}</div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {Object.entries(sections).map(([category, items]) => (
          <div key={category} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900 capitalize">{category === "week" ? "This week" : category}</div>
            <div className="mt-4 space-y-3">
              {items.length === 0 ? (
                <div className="text-sm text-slate-500">No entries.</div>
              ) : (
                items.map((meeting) => (
                  <div key={meeting.id} className="rounded-3xl bg-slate-50 p-4">
                    <div className="font-semibold text-slate-900">{meeting.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{meeting.scheduledDate} · {meeting.startTime}</div>
                    <div className="mt-2 text-xs text-slate-600">{meeting.participantIds.map((id) => users.find((user) => user.id === id)?.name).join(", ")}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Task deadlines</div>
          <div className="mt-4 space-y-3">
            {taskDueItems.length === 0 ? (
              <div className="text-sm text-slate-500">No upcoming task deadlines.</div>
            ) : (
              taskDueItems.slice(0, 6).map((task) => (
                <div key={task.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{task.title}</div>
                  <div className="mt-1 text-sm text-slate-500">Due {task.dueDate}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Meeting history</div>
          <div className="mt-4 space-y-3">
            {historyMeetings.length === 0 ? (
              <div className="text-sm text-slate-500">No past meetings.</div>
            ) : (
              historyMeetings.slice(0, 6).map((meeting) => (
                <div key={meeting.id} className="rounded-3xl bg-slate-50 p-4">
                  <div className="font-semibold text-slate-900">{meeting.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{meeting.scheduledDate} · {meeting.startTime}</div>
                  <div className="mt-2 text-xs text-slate-600">{getMeetingDisplayStatus(meeting).replace("_", " ")}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
