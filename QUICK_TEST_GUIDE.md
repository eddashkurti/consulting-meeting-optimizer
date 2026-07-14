# Quick Testing Guide - Meeting Optimizer

## Demo Credentials
```
Team Member:    john / password123
Team Lead:      sarah / password123
Project Lead:   michael / admin123
```

---

## Quick Test Flow (5 minutes)

### 1. Test Role-Based Task Creation
- [ ] Login as **john** → No "+ New Task" button visible
- [ ] Logout, login as **sarah** → "+ New Task" button visible
- [ ] Create a test task → Appears in To Do column

### 2. Test WIP Limit
- [ ] Assign 3 tasks to john (board drag/drop)
- [ ] Try to create a 4th task for john
- [ ] See red "Assignment Blocked" warning
- [ ] Click "Select Alternative Assignee"
- [ ] Assign to mark instead

### 3. Test Admin Override
- [ ] Login as **michael**
- [ ] Try assigning 4th task to john (WIP warning)
- [ ] Click "Admin Override" button
- [ ] Task gets assigned despite limit

### 4. Test Meeting Approval
- [ ] Login as **john**
- [ ] Create a meeting request
- [ ] See "Waiting for manager review" message
- [ ] **Approve/Reject buttons are NOT visible**

### 5. Test Manager Approval
- [ ] Logout, login as **sarah**
- [ ] Go to Meeting Requests
- [ ] See john's request with **Approve/Reject/Reschedule** buttons
- [ ] Click Approve
- [ ] John gets notification (check dashboard unread count)

### 6. Test Calendar Filtering
- [ ] Go to Calendar as john
- [ ] **Pending meeting request does NOT appear** in upcoming
- [ ] **After sarah approves** it, it appears in upcoming
- [ ] If sarah rejects it, it **disappears from calendar**

### 7. Test Task Change Requests
- [ ] Login as **john**
- [ ] Open any task details
- [ ] Click "Request Task Change" button
- [ ] Select "Due date change" from dropdown
- [ ] Fill in what and why
- [ ] Submit
- [ ] See confirmation: "submitted for manager review"

### 8. Test Action Item Workflow
- [ ] Go to Meeting Notes as **sarah**
- [ ] Create draft action items
- [ ] See "Approve as task" and **"Reject" buttons**
- [ ] Click Reject on one
- [ ] It moves to "Rejected action items" section
- [ ] Approve another with assignment details
- [ ] Task created successfully

### 9. Test Login Page
- [ ] Clear browser cache/localStorage
- [ ] Go to login
- [ ] See **left column**: login form
- [ ] See **right side**: Demo Accounts card + Role Capabilities card
- [ ] Try invalid login → Error message says "Try one of the demo credentials"

---

## What NOT to See (Bug Verification)
- [ ] John CANNOT see Create Task button
- [ ] John CANNOT approve/reject his own meeting request
- [ ] john's pending meeting does NOT appear in calendar
- [ ] Sarah CANNOT bypass WIP limit (no override button)
- [ ] Rejected meetings do NOT appear in upcoming calendar
- [ ] Team members CANNOT edit task details

---

## What SHOULD See (Working Features)
- [ ] Sarah CAN create tasks
- [ ] Sarah CAN see override prompts (no override button)
- [ ] michael CAN see Admin Override button
- [ ] Approved meetings appear in calendar
- [ ] Rejected meetings appear in history
- [ ] Task cards show proper icons/badges
- [ ] Notifications created on task assignment

---

## Browser Console Check
Open Developer Tools (F12) and check:
```
✓ No red errors in Console
✓ No missing imports
✓ No "undefined" variable warnings
```

---

## Performance Notes
- App should load < 2 seconds
- Task drag/drop smooth with no lag
- No console errors on page navigation
- localStorage persists after refresh

---

## If Something Breaks
Check these first:
1. Clear localStorage: `localStorage.clear()` in console
2. Hard refresh: Ctrl+Shift+R
3. Check browser console for errors
4. Verify correct credentials (case-sensitive)
5. Check that files saved without syntax errors

---

## File Status Summary
```
✅ src/utils/permissions.js - All roles updated
✅ src/pages/Login.jsx - Demo credentials & capabilities shown
✅ src/pages/TeamBoard.jsx - "+ New Task" button visible
✅ src/pages/MeetingRequests.jsx - Self-approval blocked, sections organized
✅ src/pages/Calendar.jsx - Only approved meetings shown
✅ src/pages/MeetingNotes.jsx - Reject button added, sections separated
✅ src/components/TaskDetailModal.jsx - Change request form enhanced
✅ src/components/Tasks/CreateTaskModal.jsx - WIP warning improved
✅ src/data/mockData.js - PROJECT_LEAD and ADMIN roles added
```

All files have been tested for syntax errors and are ready for testing.
