import { useMemo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useAppContext } from "../context/AppContext";
import { formatTaskDate, getBlockedEscalation } from "../utils/workload";

const PRIORITY_CLASSES = {
  Low: "bg-slate-100 text-slate-700 border-slate-200",
  Medium: "bg-blue-100 text-blue-700 border-blue-200",
  High: "bg-orange-100 text-orange-800 border-orange-200",
  Urgent: "bg-red-100 text-red-800 border-red-200",
};

export default function TaskCard({ task, index, onOpenDetail }) {
  const { users, teams } = useAppContext();
  const team = teams.find((teamItem) => teamItem.id === task.assignedTeamId);
  const assignedUsers = useMemo(
    () => users.filter((user) => task.assignedUserIds?.includes(user.id)),
    [task.assignedUserIds, users]
  );
  const escalation = getBlockedEscalation(task);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onOpenDetail(task)}
          className="bg-white rounded-[18px] border border-[#DDE5F0] p-4 shadow-[0_15px_30px_-20px_rgba(15,23,42,0.25)] cursor-pointer transition hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#0F172A]">{task.title}</div>
              <div className="mt-2 text-sm text-[#64748B] line-clamp-2">{task.description || "No description available."}</div>
            </div>
            <div className={`rounded-2xl border px-2 py-1 text-[11px] font-semibold ${PRIORITY_CLASSES[task.priority]}`}>
              {task.priority}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#64748B]">
            <span className="rounded-full border border-[#DDE5F0] bg-white px-2 py-1">{team?.name || "Unassigned team"}</span>
            <span className="rounded-full border border-[#DDE5F0] bg-white px-2 py-1">Due {formatTaskDate(task.dueDate)}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {assignedUsers.length > 0 ? (
              assignedUsers.map((user) => (
                <span key={user.id} className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
                  {user.name.split(" ").map((part) => part[0]).join("")}
                </span>
              ))
            ) : (
              <span className="rounded-full bg-[#FEF3C7] px-3 py-1 text-xs font-semibold text-[#B45309]">No assignees</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {task.meetingGenerated ? (
              <span className="rounded-2xl bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">From Meeting</span>
            ) : null}
            {task.status === "Blocked" ? (
              <span className="rounded-2xl bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Blocked</span>
            ) : null}
            {escalation ? (
              <span className={`rounded-2xl px-2 py-1 text-xs font-semibold ${
                escalation.color === "red" ? "bg-red-100 text-red-800" : escalation.color === "orange" ? "bg-orange-100 text-orange-800" : "bg-amber-100 text-amber-800"
              }`}>
                {escalation.text}
              </span>
            ) : null}
          </div>
        </div>
      )}
    </Draggable>
  );
}
