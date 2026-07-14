export const ROLES = {
  TEAM_MEMBER: "TEAM_MEMBER",
  TEAM_LEAD: "TEAM_LEAD",
  PROJECT_LEAD: "PROJECT_LEAD",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
};

export function canCreateTask(user) {
  if (!user) return false;
  const normalizedTitle = (user.jobTitle || "").toLowerCase();
  const roleAllowed = [
    ROLES.TEAM_LEAD,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
    ROLES.ADMIN,
  ].includes(user.role);
  const titleAllowed = ["lead", "manager", "project lead"].some((keyword) => normalizedTitle.includes(keyword));
  return roleAllowed || titleAllowed;
}

export function canEditTaskDetails(user, task) {
  if (!user || !task) return false;
  return [
    ROLES.ADMIN,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
    ROLES.TEAM_LEAD,
  ].includes(user?.role);
}

export function canUpdateTaskStatus(user, task) {
  if (!user || !task) return false;
  if ([ROLES.ADMIN, ROLES.PROJECT_LEAD, ROLES.MANAGER, ROLES.TEAM_LEAD].includes(user.role)) return true;
  return task.assignedUserIds?.includes(user.id);
}

export function canEditTask(user, task) {
  return canEditTaskDetails(user, task) || canUpdateTaskStatus(user, task);
}

export function canDeleteTask(user) {
  return [
    ROLES.ADMIN,
    ROLES.PROJECT_LEAD,
  ].includes(user?.role);
}

export function canAssignTask(user) {
  return [
    ROLES.TEAM_LEAD,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
    ROLES.ADMIN,
  ].includes(user?.role);
}

export function canApproveMeeting(user) {
  return [
    ROLES.TEAM_LEAD,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
    ROLES.ADMIN,
  ].includes(user?.role);
}

export function canApproveMeetingRequest(user, meeting) {
  if (!user || !meeting) return false;
  // User cannot approve their own meeting request
  const requestOwner = meeting.requestedBy || meeting.createdBy;
  if (requestOwner === user.id) return false;
  return canApproveMeeting(user);
}

export function canOverrideWip(user) {
  // Only ADMIN and PROJECT_LEAD can override WIP limits
  return [
    ROLES.ADMIN,
    ROLES.PROJECT_LEAD,
  ].includes(user?.role);
}

export function canViewAnalytics(user) {
  return [
    ROLES.TEAM_LEAD,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
    ROLES.ADMIN,
  ].includes(user?.role);
}

export function canManageTeams(user) {
  return [
    ROLES.ADMIN,
    ROLES.PROJECT_LEAD,
    ROLES.MANAGER,
  ].includes(user?.role);
}

export function canSubmitMeetingRequest(user) {
  return Boolean(user);
}

export function canRequestTaskChange(user, task) {
  if (!user || !task) return false;
  return user.role === ROLES.TEAM_MEMBER && task.assignedUserIds?.includes(user.id);
}

export function canMoveTask(user, task) {
  if (!user || !task) return false;
  if ([ROLES.ADMIN, ROLES.PROJECT_LEAD, ROLES.TEAM_LEAD].includes(user?.role)) return true;
  return task.assignedUserIds?.includes(user.id);
}
