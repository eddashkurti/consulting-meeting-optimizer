export const ACTIVE_STATUSES = ["To Do", "In Progress", "Blocked", "Review"];

export function countActiveTasks(tasks, userId) {
  return tasks.filter(
    (task) =>
      task.assignedUserIds?.includes(userId) &&
      ACTIVE_STATUSES.includes(task.status)
  ).length;
}

export function getLeastBusyMember(team, users, tasks) {
  const members = users.filter((user) => user.teamId === team.id);
  if (members.length === 0) return null;
  const sorted = [...members].sort((a, b) => {
    return countActiveTasks(tasks, a.id) - countActiveTasks(tasks, b.id);
  });
  const user = sorted[0];
  const count = countActiveTasks(tasks, user.id);
  return { user, count };
}

export function getTeamActiveTasks(tasks, teamId) {
  return tasks.filter(
    (task) => task.assignedTeamId === teamId && ACTIVE_STATUSES.includes(task.status)
  );
}

export function getUserWipStatus(activeCount) {
  if (activeCount <= 2) return "Available";
  if (activeCount === 3) return "At limit";
  return "Overloaded";
}

export function getActiveTasksForTeam(tasks, team) {
  const memberIds = team.members || [];
  return tasks.filter(
    (task) =>
      ACTIVE_STATUSES.includes(task.status) &&
      task.assignedUserIds?.some((id) => memberIds.includes(id))
  );
}

export function calculateBlockedHours(task) {
  if (!task?.blockedSince) return 0;
  const blockedDate = new Date(task.blockedSince);
  if (Number.isNaN(blockedDate.getTime())) return 0;
  const diffMs = Date.now() - blockedDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
}

export function getBlockedEscalation(task) {
  const hours = calculateBlockedHours(task);
  if (!hours) return null;
  if (hours >= 72) {
    return { text: "Blocked 72h — Manager review recommended", color: "red" };
  }
  if (hours >= 48) {
    return { text: "Blocked 48h", color: "orange" };
  }
  if (hours >= 24) {
    return { text: "Blocked 24h", color: "yellow" };
  }
  return { text: `Blocked ${hours}h`, color: "yellow" };
}

export function formatTaskDate(dateString) {
  if (!dateString) return "No due date";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function getDateCategory(dateString) {
  if (!dateString) return "upcoming";
  const date = new Date(dateString);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(startOfToday.getDate() + 1);

  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfToday.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  if (date >= startOfToday && date < endOfToday) return "today";
  if (date >= endOfToday && date < endOfWeek) return "week";
  return "upcoming";
}

export function getMeetingDurationSummary(meetings, startDate, endDate) {
  return meetings
    .filter((meeting) => {
      const date = new Date(meeting.scheduledDate);
      return date >= startDate && date < endDate;
    })
    .reduce((sum, meeting) => sum + (meeting.durationMinutes || 0), 0);
}

export function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}
