import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import { WIP_LIMIT } from "../data/mockData";

export default function Column({ columnName, tasks, onOpenDetail }) {
  const isInProgress = columnName === "In Progress";
  const exceedsWipLimit = isInProgress && tasks.length > WIP_LIMIT;

  return (
    <Droppable droppableId={columnName}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="rounded-[18px] border border-[#DDE5F0] min-w-[240px] max-w-[260px] p-4 flex flex-col gap-3 shadow-sm"
          style={{
            backgroundColor:
              columnName === "Backlog"
                ? "#F8FAFC"
                : columnName === "To Do"
                ? "#EFF6FF"
                : columnName === "In Progress"
                ? "#EEF2FF"
                : columnName === "Blocked"
                ? "#FEF2F2"
                : columnName === "Review"
                ? "#FFFBEB"
                : "#F0FDF4",
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-slate-900">{columnName}</h3>
              <div className="text-xs text-slate-500">{tasks.length} task(s)</div>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{tasks.length}</span>
          </div>

          {isInProgress && (
            <div
              className={`text-xs px-3 py-2 rounded-3xl font-semibold ${
                exceedsWipLimit ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {exceedsWipLimit ? "⚠ Focus limit" : "Healthy WIP"}
            </div>
          )}

          <div className="flex flex-col gap-3 flex-1">
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} onOpenDetail={onOpenDetail} />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
}
