import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { COLUMNS } from "../data/mockData";
import Column from "./Column";
import AgendaPanel from "./AgendaPanel";
import TaskDetailModal from "./TaskDetailModal";
import { canMoveTask } from "../utils/permissions";

export default function Board({ tasks, setTasks, currentUser, showAgenda, setShowAgenda, onDenied }) {
  const [selectedTask, setSelectedTask] = useState(null);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const task = tasks.find((t) => t.id === draggableId);
    if (!task) return;

    if (!canMoveTask(currentUser, task)) {
      onDenied?.();
      return;
    }

    const nextStatus = destination.droppableId;
    setTasks((prevTasks) =>
      prevTasks.map((t) => {
        if (t.id !== draggableId) return t;
        return {
          ...t,
          status: nextStatus,
          blockedSince: nextStatus === "Blocked" ? new Date().toISOString() : t.status === "Blocked" ? null : t.blockedSince,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const handleOpenDetail = (task) => {
    setSelectedTask(task);
  };

  const handleSaveTask = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex flex-row gap-4 overflow-x-auto p-6">
        {COLUMNS.map((columnName) => (
          <Column
            key={columnName}
            columnName={columnName}
            tasks={tasks.filter((t) => t.status === columnName)}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>
      {showAgenda && <AgendaPanel tasks={tasks} onClose={() => setShowAgenda(false)} />}
      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onSave={handleSaveTask} />
      )}
    </DragDropContext>
  );
}
