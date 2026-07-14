import { useMemo } from "react";
import { useAppContext } from "../../context/AppContext";
import { canViewAnalytics } from "../../utils/permissions";

const NAV_ITEMS = [
  { page: "dashboard", label: "Dashboard", icon: "📊" },
  { page: "board", label: "Team Board", icon: "🧭" },
  { page: "my-tasks", label: "My Tasks", icon: "✅" },
  { page: "calendar", label: "Calendar", icon: "📅" },
  { page: "teams", label: "Teams", icon: "👥" },
  { page: "meeting-requests", label: "Meeting Requests", icon: "✉️" },
  { page: "meeting-notes", label: "Meeting Notes", icon: "📝" },
  { page: "analytics", label: "Analytics", icon: "📈" },
];

const roleLabel = {
  TEAM_MEMBER: "Team Member",
  TEAM_LEAD: "Team Lead",
  PROJECT_LEAD: "Project Lead",
  MANAGER: "Manager",
  ADMIN: "Admin",
};

const RESET_ROLES = ["PROJECT_LEAD", "ADMIN"];

export default function Sidebar({ activePage, onNavigate, onLogout, onResetDemoData }) {
  const { currentUser, teams } = useAppContext();
  const team = useMemo(
    () => teams.find((item) => item.id === currentUser?.teamId),
    [teams, currentUser]
  );

  const visibleNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.page !== "analytics" || canViewAnalytics(currentUser)),
    [currentUser]
  );

  return (
    <aside className="hidden lg:flex lg:w-60 xl:w-64 flex-col bg-white border-r border-[#DDE5F0] h-screen sticky top-0 shadow-sm">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mb-8 rounded-[18px] border border-[#DDE5F0] bg-[#F8FAFF] p-5">
          <div className="text-lg font-semibold text-slate-900">Meeting Optimizer</div>
          <div className="mt-1 text-sm text-slate-500">Workplace productivity hub</div>
        </div>

        <div className="rounded-3xl bg-slate-50 border border-slate-200 p-4 mb-6">
          <div className="text-base font-semibold text-slate-900">{currentUser?.name}</div>
          <div className="text-sm text-slate-500">{currentUser?.jobTitle}</div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold">
            {roleLabel[currentUser?.role] || currentUser?.role}
          </div>
          <div className="mt-3 text-sm text-slate-600">{team?.name}</div>
        </div>

        <nav className="space-y-1">
          {visibleNavItems.map((item) => (
            <button
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={`w-full text-left inline-flex items-center gap-3 px-4 py-3 rounded-[14px] text-sm font-semibold transition ${
                activePage === item.page
                  ? "bg-[#E8EDFF] text-[#0F172A] shadow-inner"
                  : "text-[#64748B] hover:bg-[#EFF6FF]"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 px-6 pb-6 space-y-3">
        {RESET_ROLES.includes(currentUser?.role) ? (
          <button
            onClick={onResetDemoData}
            className="w-full inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#DDE5F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#EFF6FF]"
          >
            🔄 Reset demo data
          </button>
        ) : null}
        <button
          onClick={onLogout}
          className="w-full inline-flex items-center justify-center gap-2 rounded-[16px] border border-[#DDE5F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] hover:bg-[#EFF6FF]"
        >
          🔒 Logout
        </button>
      </div>
    </aside>
  );
}
