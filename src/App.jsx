import { useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import { USERS, TEAMS, INITIAL_TASKS, INITIAL_MEETINGS } from "./data/mockData";
import Sidebar from "./components/Layout/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TeamBoard from "./pages/TeamBoard";
import MyTasks from "./pages/MyTasks";
import Calendar from "./pages/Calendar";
import Teams from "./pages/Teams";
import MeetingRequests from "./pages/MeetingRequests";
import MeetingNotes from "./pages/MeetingNotes";
import Analytics from "./pages/Analytics";
import { canViewAnalytics } from "./utils/permissions";

const ROUTES = [
  "dashboard",
  "board",
  "my-tasks",
  "calendar",
  "teams",
  "meeting-requests",
  "meeting-notes",
  "analytics",
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedId = window.localStorage.getItem("meetingOptimizerUserId");
    return USERS.find((user) => user.id === storedId) || null;
  });
  const [tasks, setTasks] = useState(() => JSON.parse(JSON.stringify(INITIAL_TASKS)));
  const [meetings, setMeetings] = useState(() => JSON.parse(JSON.stringify(INITIAL_MEETINGS)));
  const [notifications, setNotifications] = useState([]);
  const [pendingActionItems, setPendingActionItems] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && ROUTES.includes(hash)) return hash;
    return currentUser ? "dashboard" : "login";
  });

  useEffect(() => {
    if (currentUser?.id) {
      window.localStorage.setItem("meetingOptimizerUserId", currentUser.id);
    } else {
      window.localStorage.removeItem("meetingOptimizerUserId");
    }
  }, [currentUser]);

  const addTask = (task) => {
    setTasks((prev) => [task, ...prev]);
  };

  const resetDemoData = () => {
    setTasks(JSON.parse(JSON.stringify(INITIAL_TASKS)));
    setMeetings(JSON.parse(JSON.stringify(INITIAL_MEETINGS)));
    setNotifications([]);
    setPendingActionItems([]);
    setChangeRequests([]);
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "") return;
      if (hash === "login" || ROUTES.includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  useEffect(() => {
    if (!currentUser && activePage !== "login") {
      setActivePage("login");
      window.location.hash = "login";
    }
  }, [currentUser, activePage]);

  const handleLogin = ({ username, password }) => {
    const user = USERS.find(
      (item) => item.username === username && item.password === password
    );
    if (!user) return false;
    setCurrentUser(user);
    setActivePage("dashboard");
    window.location.hash = "dashboard";
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage("login");
    window.location.hash = "login";
  };

  const navigate = (page) => {
    if (page === "login") {
      handleLogout();
      return;
    }
    setActivePage(page);
    window.location.hash = page;
  };

  const pageContent = () => {
    if (!currentUser) {
      return <Login users={USERS} onLogin={handleLogin} />;
    }
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "board":
        return <TeamBoard />;
      case "my-tasks":
        return <MyTasks />;
      case "calendar":
        return <Calendar />;
      case "teams":
        return <Teams />;
      case "meeting-requests":
        return <MeetingRequests />;
      case "meeting-notes":
        return <MeetingNotes />;
      case "analytics":
        return <Analytics />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users: USERS,
        teams: TEAMS,
        tasks,
        setTasks,
        addTask,
        meetings,
        setMeetings,
        notifications,
        setNotifications,
        pendingActionItems,
        setPendingActionItems,
        changeRequests,
        setChangeRequests,
        resetDemoData,
      }}
    >
      <div className="min-h-screen bg-[#F3F6FB] text-[#0F172A]">
        {currentUser ? (
          <div>
            <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-slate-900">Meeting Optimizer</div>
                  <div className="text-sm text-slate-500">{currentUser.name}</div>
                </div>
                <select
                  value={activePage}
                  onChange={(e) => navigate(e.target.value)}
                  className="rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none"
                >
                  <option value="dashboard">Dashboard</option>
                  <option value="board">Team Board</option>
                  <option value="my-tasks">My Tasks</option>
                  <option value="calendar">Calendar</option>
                  <option value="teams">Teams</option>
                  <option value="meeting-requests">Meeting Requests</option>
                  <option value="meeting-notes">Meeting Notes</option>
                {canViewAnalytics(currentUser) ? <option value="analytics">Analytics</option> : null}
                </select>
              </div>
            </div>
            <div className="lg:flex">
              <Sidebar activePage={activePage} onNavigate={navigate} onLogout={handleLogout} onResetDemoData={resetDemoData} />
              <main className="flex-1 p-6 lg:p-8 xl:p-10">{pageContent()}</main>
            </div>
          </div>
        ) : (
          pageContent()
        )}
      </div>
    </AppContext.Provider>
  );
}
