import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { canApproveMeeting, canOverrideWip } from "../utils/permissions";
import { countActiveTasks, getLeastBusyMember } from "../utils/workload";

export default function MeetingNotes() {
  const { meetings, currentUser, setTasks, tasks, pendingActionItems, setPendingActionItems, users, teams } = useAppContext();
  const [selectedMeetingId, setSelectedMeetingId] = useState(meetings[0]?.id || "");
  const [summary, setSummary] = useState("");
  const [decisions, setDecisions] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [message, setMessage] = useState("");
  const [approvalState, setApprovalState] = useState({});
  const [wipWarning, setWipWarning] = useState(null);
  const [pendingApprovalId, setPendingApprovalId] = useState(null);

  const selectedMeeting = useMemo(
    () => meetings.find((meeting) => meeting.id === selectedMeetingId),
    [meetings, selectedMeetingId]
  );

  const canReview = canApproveMeeting(currentUser);
  const myDrafts = pendingActionItems.filter((item) => item.createdBy === currentUser.id || canReview);
  const pendingItems = myDrafts.filter((item) => item.status === "DRAFT" || !item.status);
  const rejectedItems = myDrafts.filter((item) => item.status === "REJECTED");

  const handleSaveDraft = () => {
    const lines = actionItems
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (!selectedMeeting || lines.length === 0) {
      setMessage("Add at least one action item to save a draft.");
      return;
    }

    const created = lines.map((line) => ({
      id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      title: line,
      summary,
      decisions,
      meetingId: selectedMeeting.id,
      meetingTitle: selectedMeeting.title,
      status: "DRAFT",
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    }));

    setPendingActionItems((prev) => [...created, ...prev]);
    setMessage(`${created.length} draft action item(s) saved for review.`);
    setSummary("");
    setDecisions("");
    setActionItems("");
  };

  const handleApproveAction = (item) => {
    const approved = approvalState[item.id] || {};
    const assignedUserIds = approved.assignedUserIds ? [approved.assignedUserIds] : [];
    const task = {
      id: `t${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
      title: item.title,
      description: `${item.meetingTitle} — ${item.summary}`,
      status: "To Do",
      priority: approved.priority || "Medium",
      assignedTeamId: approved.assignedTeamId || null,
      assignedUserIds,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: approved.dueDate || null,
      blockedSince: null,
      meetingGenerated: true,
      sourceMeetingId: item.meetingId,
      estimatedHours: 2,
      comments: [],
    };
    setTasks((prev) => [task, ...prev]);
    setPendingActionItems((prev) => prev.filter((action) => action.id !== item.id));
    setMessage(`Saved “${item.title}” as a task.`);
  };
  const handleRejectAction = (item) => {
    setPendingActionItems((prev) =>
      prev.map((action) =>
        action.id === item.id ? { ...action, status: "REJECTED" } : action
      )
    );
    setMessage(`Rejected "${item.title}".`);
  };
  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Meeting notes</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Convert notes into action</h1>
        <p className="mt-1 text-slate-600">Capture decisions and save follow-up action items for review.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">Select meeting</div>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="mt-4 w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
          >
            {meetings.map((meeting) => (
              <option key={meeting.id} value={meeting.id}>
                {meeting.title} — {meeting.scheduledDate}
              </option>
            ))}
          </select>

          {selectedMeeting ? (
            <div className="mt-6 rounded-3xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">Meeting summary</div>
              <div className="mt-2 text-sm text-slate-600">{selectedMeeting.purpose || "No purpose provided."}</div>
              <div className="mt-3 text-sm text-slate-600">Type: {selectedMeeting.type}</div>
              <div className="mt-3 text-sm text-slate-600">Participants: {selectedMeeting.participantIds.map((id) => users.find((user) => user.id === id)?.name).join(", ")}</div>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-700">
              Meeting summary
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Decisions made
              <textarea
                value={decisions}
                onChange={(e) => setDecisions(e.target.value)}
                rows={3}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none"
              />
            </label>
            <label className="space-y-2 text-sm text-slate-700">
              Action items (one per line)
              <textarea
                value={actionItems}
                onChange={(e) => setActionItems(e.target.value)}
                rows={5}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none"
              />
            </label>
            <button
              onClick={handleSaveDraft}
              className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Save draft action items
            </button>
            {message ? <div className="rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</div> : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Pending action items</div>
        <div className="mt-4 space-y-4">
          {pendingItems.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">No pending action items.</div>
          ) : (
            pendingItems.map((item) => {
              const meeting = meetings.find((meeting) => meeting.id === item.meetingId);
              const selectedTeam = teams.find((team) => team.id === (approvalState[item.id]?.assignedTeamId || meeting?.participantIds[0] ? users.find((user) => user.id === meeting?.participantIds[0])?.teamId : null));
              return (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                      <div className="mt-2 text-sm text-slate-600">From {item.meetingTitle}</div>
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Status: {item.status}</div>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-white p-4 border border-slate-200">
                      <div className="text-xs uppercase text-slate-500">Summary</div>
                      <div className="mt-2 text-sm text-slate-700">{item.summary || "No summary"}</div>
                    </div>
                    <div className="rounded-3xl bg-white p-4 border border-slate-200">
                      <div className="text-xs uppercase text-slate-500">Decisions</div>
                      <div className="mt-2 text-sm text-slate-700">{item.decisions || "No decisions recorded."}</div>
                    </div>
                  </div>
                  {canReview ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <select
                        value={approvalState[item.id]?.assignedTeamId || ""}
                        onChange={(e) => setApprovalState((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            assignedTeamId: e.target.value,
                          },
                        }))}
                        className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="">Assign team</option>
                        {teams.map((team) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                      <select
                        value={approvalState[item.id]?.assignedUserIds || ""}
                        onChange={(e) => setApprovalState((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            assignedUserIds: e.target.value,
                          },
                        }))}
                        className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="">Assign user</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                      <select
                        value={approvalState[item.id]?.priority || "Medium"}
                        onChange={(e) => setApprovalState((prev) => ({
                          ...prev,
                          [item.id]: {
                            ...prev[item.id],
                            priority: e.target.value,
                          },
                        }))}
                        className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                      </select>
                    </div>
                  ) : null}
                  {canReview ? (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => handleApproveAction(item)}
                        className="rounded-3xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                      >
                        Approve as task
                      </button>
                      <button
                        onClick={() => handleRejectAction(item)}
                        className="rounded-3xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-3xl bg-slate-100 p-4 text-sm text-slate-700">
                      Your draft action item is waiting for team lead approval.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {rejectedItems.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold text-slate-900">Rejected action items</div>
          <div className="mt-4 space-y-4">
            {rejectedItems.map((item) => (
              <div key={item.id} className="rounded-3xl border border-red-200 bg-red-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">{item.title}</div>
                    <div className="mt-2 text-sm text-slate-600">From {item.meetingTitle}</div>
                  </div>
                  <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Rejected</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
