import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import MeetingRequestForm from "../components/MeetingRequestForm";
import { canApproveMeeting, canApproveMeetingRequest } from "../utils/permissions";
import { formatDuration } from "../utils/workload";
import { getMeetingDisplayStatus } from "../utils/meetingRules";

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-slate-100 text-slate-800",
  EXPIRED: "bg-red-50 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-800",
};

function MeetingSection({ title, meetings, users, renderActions }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-lg font-semibold text-slate-900">{title}</div>
      <div className="mt-4 space-y-4">
        {meetings.length === 0 ? (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">No meetings in this category.</div>
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-lg font-semibold text-slate-900">{meeting.title}</div>
                  <div className="mt-1 text-sm text-slate-500">{meeting.scheduledDate} · {meeting.startTime}</div>
                  <div className="mt-2 text-sm text-slate-600">{meeting.purpose}</div>
                </div>
                <div className={`rounded-full px-3 py-2 text-sm font-semibold ${STATUS_STYLES[getMeetingDisplayStatus(meeting)]}`}>
                  {getMeetingDisplayStatus(meeting).replace("_", " ")}
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="text-sm text-slate-700">Duration: {formatDuration(meeting.durationMinutes)}</div>
                <div className="text-sm text-slate-700">Recommendation: {meeting.recommendation.replace("_", " ")}</div>
                <div className="text-sm text-slate-700">Organizer: {users.find((user) => user.id === meeting.createdBy)?.name}</div>
              </div>
              <div className="mt-3 flex flex-wrap gap-3">
                {meeting.participantIds.map((id) => (
                  <span key={id} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 border border-slate-200">{users.find((user) => user.id === id)?.name}</span>
                ))}
              </div>
              {renderActions(meeting)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function MeetingRequests() {
  const { meetings, setMeetings, currentUser, users, setNotifications } = useAppContext();
  const [rescheduleId, setRescheduleId] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("09:00");
  const [showOrganizerForm, setShowOrganizerForm] = useState(false);
  const isOrganizer = canApproveMeeting(currentUser);

  const visibleRequests = useMemo(() => {
    if (isOrganizer) {
      return meetings;
    }
    return meetings.filter((meeting) => meeting.createdBy === currentUser.id);
  }, [meetings, currentUser, isOrganizer]);

  const handleSubmitRequest = (request) => {
    const status = isOrganizer ? "APPROVED" : "PENDING";
    setMeetings((prev) => [
      {
        ...request,
        status,
        id: `m${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleAction = (id, status) => {
    const meeting = meetings.find((item) => item.id === id);
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === id
          ? { ...meeting, status, updatedAt: new Date().toISOString() }
          : meeting
      )
    );

    if (meeting) {
      setNotifications((prev) => [
        {
          id: `n${Date.now()}`,
          userId: meeting.createdBy,
          createdAt: new Date().toISOString(),
          read: false,
          title: `Meeting ${status.toLowerCase()}`,
          message: `${meeting.title} was ${status.toLowerCase()}.`,
          type: "meeting",
        },
        ...prev,
      ]);
    }
  };

  const handleReschedule = (id) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === id
          ? {
              ...meeting,
              scheduledDate: rescheduleDate || meeting.scheduledDate,
              startTime: rescheduleTime || meeting.startTime,
              updatedAt: new Date().toISOString(),
            }
          : meeting
      )
    );
    setRescheduleId(null);
  };

  const sections = [
    { title: "Pending requests", meetings: visibleRequests.filter((meeting) => getMeetingDisplayStatus(meeting) === "PENDING") },
    { title: "Approved meetings", meetings: visibleRequests.filter((meeting) => getMeetingDisplayStatus(meeting) === "APPROVED") },
    { title: "Completed meetings", meetings: visibleRequests.filter((meeting) => getMeetingDisplayStatus(meeting) === "COMPLETED") },
    { title: "Rejected meetings", meetings: visibleRequests.filter((meeting) => meeting.status === "REJECTED") },
    { title: "Expired and cancelled", meetings: visibleRequests.filter((meeting) => ["EXPIRED", "CANCELLED"].includes(getMeetingDisplayStatus(meeting))) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
          {isOrganizer ? "Meeting management" : "Meeting requests"}
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          {isOrganizer ? "Organize team meetings" : "Smart requests"}
        </h1>
        <p className="mt-1 text-slate-600">
          {isOrganizer
            ? "Schedule meetings directly for your team; requests from other contributors appear below for review."
            : "Submit new requests and review pending meetings in one place."}
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">
          {isOrganizer ? "Schedule a meeting for the team" : "Submit a meeting request"}
        </div>
        <p className="mt-2 text-sm text-slate-600">
          {isOrganizer
            ? "As a lead, meetings you schedule are approved immediately and the team is notified."
            : "Use the planner to ask for a meeting and keep requests visible until a manager approves them."}
        </p>
      </div>

      {isOrganizer ? (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowOrganizerForm((prev) => !prev)}
            className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {showOrganizerForm ? "Hide organizer form" : "Organize meeting"}
          </button>
          <span className="text-sm text-slate-500">Only click when you want to schedule a team meeting.</span>
        </div>
      ) : null}

      {(showOrganizerForm || !isOrganizer) && (
        <MeetingRequestForm onSubmit={handleSubmitRequest} isOrganizer={isOrganizer} />
      )}

      <div className="grid gap-6">
        {sections.map((section) => (
          <MeetingSection
            key={section.title}
            title={section.title}
            meetings={section.meetings}
            users={users}
            renderActions={(meeting) => {
              if (getMeetingDisplayStatus(meeting) !== "PENDING") {
                return <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">No action required.</div>;
              }
              
              const canApprove = canApproveMeetingRequest(currentUser, meeting);
              
              if (!canApprove) {
                return <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm text-amber-700 font-medium">Waiting for manager review</div>;
              }
              
              return (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction(meeting.id, "APPROVED")}
                    className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(meeting.id, "REJECTED")}
                    className="rounded-3xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setRescheduleId(meeting.id);
                      setRescheduleDate(meeting.scheduledDate);
                      setRescheduleTime(meeting.startTime);
                    }}
                    className="rounded-3xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Reschedule
                  </button>
                </div>
              );
            }}
          />
        ))}

        {rescheduleId ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold text-slate-900">Reschedule meeting</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
              />
              <button
                onClick={() => handleReschedule(rescheduleId)}
                className="rounded-3xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Save new time
              </button>
              <button
                onClick={() => setRescheduleId(null)}
                className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
