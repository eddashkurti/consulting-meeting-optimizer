import { useMemo } from "react";
import { useAppContext } from "../context/AppContext";
import { countActiveTasks, getUserWipStatus, getTeamActiveTasks } from "../utils/workload";
import { canManageTeams } from "../utils/permissions";

export default function Teams() {
  const { users, teams, tasks, currentUser } = useAppContext();
  const showManage = canManageTeams(currentUser);

  const teamStats = useMemo(
    () =>
      teams.map((team) => {
        const members = users.filter((user) => team.members.includes(user.id));
        const activeCount = getTeamActiveTasks(tasks, team.id).length;
        const blockedCount = tasks.filter((task) => task.assignedTeamId === team.id && task.status === "Blocked").length;
        const capacity = members.length * 4 || 1;
        return { team, members, activeCount, blockedCount, capacity };
      }),
    [teams, users, tasks]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Team view</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Teams</h1>
        <p className="mt-1 text-slate-600">Track team load, blockers, and member availability.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {teamStats.map(({ team, members, activeCount, blockedCount, capacity }) => (
          <div key={team.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-slate-900">{team.name}</div>
                <div className="mt-2 text-sm text-slate-500">{members.length} member(s)</div>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{activeCount} active</div>
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Workload</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: `${Math.min(100, Math.round((activeCount / capacity) * 100))}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-slate-500">{blockedCount} blocked task(s)</div>
            </div>

            <div className="mt-5 space-y-3">
              {members.map((member) => {
                const count = countActiveTasks(tasks, member.id);
                return (
                  <div key={member.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-900">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.jobTitle}</div>
                      </div>
                      <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{getUserWipStatus(count)}</div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">{count} active task(s)</div>
                  </div>
                );
              })}
            </div>

            {showManage ? (
              <div className="mt-5 flex flex-wrap gap-3">
                <button className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Edit team</button>
                <button className="rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Add user</button>
              </div>
            ) : (
              <div className="mt-5 rounded-3xl bg-slate-50 p-4 text-sm text-slate-500">Team management actions are demo-only for your role.</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
