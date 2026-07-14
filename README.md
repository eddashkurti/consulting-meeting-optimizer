# Consulting Meeting Optimizer

A role-based React application designed to improve task coordination, meeting management, workload visibility, and team collaboration in consulting environments.

The application combines task tracking, meeting approval workflows, workload monitoring, and team analytics in one interface.

## Features

- Role-based access for team members, team leads, project leads, and administrators
- Kanban task board with drag-and-drop functionality
- Work-in-progress limits for task management
- Task assignment and workload balancing
- Meeting request submission and approval workflows
- Meeting notes and action-item tracking
- Calendar view for meetings and tasks
- Team and individual task dashboards
- Analytics for workload and team activity
- Responsive navigation for desktop and mobile devices
- Demo authentication and local data persistence

## User Roles

The application provides different permissions and workflows depending on the selected role:

- **Team Member** — views and manages assigned tasks
- **Team Lead** — manages team tasks and meeting requests
- **Project Lead** — oversees project-level activity and approvals
- **Administrator** — has broader access to teams and application data

## Tech Stack

- React
- JavaScript
- Vite
- Tailwind CSS
- React Context API
- `@hello-pangea/dnd`
- Browser Local Storage

## Project Structure

```text
src/
├── components/
│   ├── FocusMode/
│   ├── Layout/
│   ├── Tasks/
│   └── shared application components
├── context/
│   └── AppContext.jsx
├── data/
│   └── mockData.js
├── pages/
│   ├── Analytics.jsx
│   ├── Calendar.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── MeetingNotes.jsx
│   ├── MeetingRequests.jsx
│   ├── MyTasks.jsx
│   ├── TeamBoard.jsx
│   └── Teams.jsx
├── utils/
│   ├── meetingRules.js
│   ├── permissions.js
│   └── workload.js
├── App.jsx
├── index.css
└── main.jsx
```

## Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/eddashkurti/consulting-meeting-optimizer.git
```

Open the project directory:

```bash
cd consulting-meeting-optimizer
```

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal.

## Production Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Demo Data

This project currently uses mock organizational data and simulated user accounts.

Authentication is intended for demonstration purposes and is not connected to a production authentication provider. Application data is stored locally in the browser rather than in an external database.

## Core Workflow

1. A user signs in using one of the available demo roles.
2. Tasks are created, assigned, and managed through the task board.
3. Work-in-progress limits help prevent excessive active workloads.
4. Meeting requests are submitted for review.
5. Authorized users approve or reject meeting requests.
6. Meeting notes can be recorded and converted into follow-up actions.
7. Dashboards and analytics provide visibility into workload and activity.

## Author

**Edda Shkurti**
