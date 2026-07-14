import { useMemo, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { evaluateMeetingRequest } from "../utils/meetingRules";
import { formatDuration } from "../utils/workload";

const STATUS_COLORS = {
  RECOMMENDED: "bg-green-100 text-green-800",
  OPTIONAL: "bg-orange-100 text-orange-800",
  NOT_RECOMMENDED: "bg-red-100 text-red-800",
};

export default function MeetingRequestForm({ onSubmit, isOrganizer = false }) {
  const { users, currentUser, teams } = useAppContext();
  const [form, setForm] = useState({
    title: "",
    purpose: "",
    expectedOutcome: "",
    participantIds: [currentUser?.id].filter(Boolean),
    durationMinutes: 15,
    scheduledDate: "",
    startTime: "09:00",
  });
  const [result, setResult] = useState(null);

  const selectedParticipants = useMemo(
    () => users.filter((user) => form.participantIds.includes(user.id)),
    [users, form.participantIds]
  );

  const participantTeams = useMemo(
    () => selectedParticipants.map((user) => user.teamId),
    [selectedParticipants]
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleParticipant = (id) => {
    setForm((prev) => {
      const next = prev.participantIds.includes(id)
        ? prev.participantIds.filter((item) => item !== id)
        : [...prev.participantIds, id];
      return { ...prev, participantIds: next };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const evaluation = evaluateMeetingRequest({
      purpose: form.purpose,
      expectedOutcome: form.expectedOutcome,
      durationMinutes: Number(form.durationMinutes),
      participantIds: form.participantIds,
      participantTeams,
    });
    setResult(evaluation);
    onSubmit({
      ...form,
      ...evaluation,
      status: isOrganizer ? "APPROVED" : "PENDING",
      type: "OTHER",
      createdBy: currentUser.id,
      requestedBy: currentUser.id,
    });
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isOrganizer ? "Organize a meeting" : "Submit meeting request"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isOrganizer
              ? "Schedule a meeting directly for your team and notify attendees immediately."
              : "Use the planner to reduce unnecessary conversations and track requests."}
          </p>
        </div>
        <div className={`rounded-2xl px-4 py-2 text-sm font-semibold ${result ? STATUS_COLORS[result.recommendation] : "bg-slate-100 text-slate-700"}`}>
          {result ? result.recommendation.replace("_", " ") : "Recommendation pending"}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-slate-700">
            Meeting title
            <input
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Estimated duration (minutes)
            <input
              type="number"
              min="5"
              value={form.durationMinutes}
              onChange={(e) => handleChange("durationMinutes", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
            Purpose
            <input
              value={form.purpose}
              onChange={(e) => handleChange("purpose", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
            Expected outcome
            <textarea
              rows={3}
              value={form.expectedOutcome}
              onChange={(e) => handleChange("expectedOutcome", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none resize-none"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Preferred date
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => handleChange("scheduledDate", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
          <label className="space-y-2 text-sm text-slate-700">
            Preferred time
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            />
          </label>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Participants</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleToggleParticipant(user.id)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                  form.participantIds.includes(user.id)
                    ? "border-blue-500 bg-blue-50 text-slate-900"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="font-semibold">{user.name}</div>
                <div className="text-xs text-slate-500">{user.jobTitle}</div>
                <div className="mt-1 text-xs text-slate-400">{teams.find((team) => team.id === user.teamId)?.name}</div>
              </button>
            ))}
          </div>
        </div>

        {result?.recommendationReason ? (
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
            <span className="font-semibold">Reason:</span> {result.recommendationReason}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
          >
            {isOrganizer ? "Schedule meeting" : "Submit request"}
          </button>
        </div>
      </form>
    </div>
  );
}
