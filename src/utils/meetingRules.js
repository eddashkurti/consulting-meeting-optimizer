const RECOMMEND_KEYWORDS = ["decision", "approval", "blocker", "urgent", "client"];

export function evaluateMeetingRequest(request) {
  const { purpose = "", expectedOutcome = "", durationMinutes = 0, participantIds = [], participantTeams = [] } = request;
  const normalizedPurpose = purpose.toLowerCase();
  const normalizedOutcome = expectedOutcome.toLowerCase();

  if (!purpose.trim() || !expectedOutcome.trim()) {
    return {
      recommendation: "NOT_RECOMMENDED",
      recommendationReason: "Meeting requests need a clear purpose and expected outcome.",
    };
  }

  if (durationMinutes < 15) {
    return {
      recommendation: "OPTIONAL",
      recommendationReason: "This may be solved with a task comment or quick async update.",
    };
  }

  if (participantIds.length <= 2 && durationMinutes <= 15) {
    return {
      recommendation: "NOT_RECOMMENDED",
      recommendationReason: "Small updates between two people should usually be handled asynchronously.",
    };
  }

  if (participantIds.length >= 4) {
    return {
      recommendation: "RECOMMENDED",
      recommendationReason: "Multiple stakeholders are involved.",
    };
  }

  const differentTeams = Array.from(new Set(participantTeams)).length;
  if (differentTeams >= 2) {
    return {
      recommendation: "RECOMMENDED",
      recommendationReason: "Cross-functional work may require discussion.",
    };
  }

  if (RECOMMEND_KEYWORDS.some((keyword) => normalizedPurpose.includes(keyword))) {
    return {
      recommendation: "RECOMMENDED",
      recommendationReason: "This meeting appears to support an important decision or blocker resolution.",
    };
  }

  return {
    recommendation: "OPTIONAL",
    recommendationReason: "The request seems useful but may be handled with a lighter async update.",
  };
}

export function getMeetingDisplayStatus(meeting) {
  if (!meeting) return "PENDING";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const meetingDate = new Date(meeting.scheduledDate);
  meetingDate.setHours(0, 0, 0, 0);

  if (meeting.status === "PENDING" && meetingDate < today) {
    return "EXPIRED";
  }

  if (meeting.status === "APPROVED" && meetingDate < today) {
    return "COMPLETED";
  }

  return meeting.status;
}

export function isTerminalMeetingStatus(status) {
  return ["COMPLETED", "REJECTED", "CANCELLED", "EXPIRED"].includes(status);
}
