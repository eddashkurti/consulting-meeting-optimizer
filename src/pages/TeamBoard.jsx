import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import Board from "../components/Board";
import CreateTaskModal from "../components/Tasks/CreateTaskModal";
import { canCreateTask } from "../utils/permissions";

export default function TeamBoard() {
  const { currentUser, tasks, setTasks, addTask } = useAppContext();
  const [showCreate, setShowCreate] = useState(false);
  const [deniedMessage, setDeniedMessage] = useState("");
  const [showAgenda, setShowAgenda] = useState(false);

  const canCreate = canCreateTask(currentUser);

  const handleCreate = (task) => {
    addTask(task);
  };

  return (
    <div className="space-y-6">
<div className="rounded-[18px] border border-[#DDE5F0] bg-gradient-to-r from-[#EFF6FF] via-[#F3F6FB] to-[#F8FBFF] p-6 shadow-sm">
        <div>
          <div className="text-sm uppercase tracking-[0.2em] text-[#64748B]">Team board</div>
          <h1 className="mt-2 text-3xl font-semibold text-[#0F172A]">Kanban workflow</h1>
          <p className="mt-1 text-[#64748B]">Review task status, blockers, and meeting-generated work.</p>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#DDE5F0] bg-white p-4 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.25)]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          {canCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-[16px] bg-[#2563EB] px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1D4ED8]"
            >
              + New Task
            </button>
          ) : <div />}
          {!showAgenda ? (
            <button
              onClick={() => setShowAgenda(true)}
              className="rounded-[16px] border border-[#DDE5F0] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#EFF6FF]"
            >
              Show Agenda
            </button>
          ) : null}
        </div>

        {deniedMessage ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deniedMessage}</div>
        ) : null}

        <Board
          tasks={tasks}
          setTasks={setTasks}
          currentUser={currentUser}
          showAgenda={showAgenda}
          setShowAgenda={setShowAgenda}
          onDenied={() => setDeniedMessage("You can only update tasks assigned to you.")}
        />
      </div>

      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}
