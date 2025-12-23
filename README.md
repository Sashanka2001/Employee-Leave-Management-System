# Leave Management System

A simple full-stack leave management application (Node.js + Express backend, MongoDB, React + Vite frontend, Tailwind CSS).

## Features
- JWT authentication (Employee & Admin roles)
- Apply for leave (employees)
- Approve / Reject leave requests (admins)
- Leave types management (admin)
- Notifications for admins and users
- Monthly reports (admin)

## Quick Setup
Prerequisites:
- Node.js 16+
- npm
- MongoDB running locally or accessible via a connection string

Clone & install

```bash
# from workspace root
cd backend
npm install

cd ../frontend
npm install
```

Environment
- Create a `.env` in `backend/` with:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/leave-management
JWT_SECRET=your_secret_here
```

Running

```bash
# Backend (in one terminal)
cd backend
node server.js

# Frontend (in another terminal)
cd frontend
npm run dev
```

The frontend dev server uses Vite (default port 5173). Backend runs on port 5000 by default.

API Endpoints (summary)
- `POST /api/auth/register` — register user (returns token)
- `POST /api/auth/login` — login (returns token)
- `GET /api/auth/me` — get current user and leave balances
- `GET /api/leavetypes` — list leave types
- `POST /api/leavetypes` — create leave type (admin)
- `POST /api/leaves` — apply for leave (auth)
- `GET /api/leaves/my` — current user's leaves
- `GET /api/leaves` — admin: list leaves (filters: `typeId`, `status`, `userId`)
- `PUT /api/leaves/:id/decision` — admin approve/reject a leave; body: `{ decision: 'APPROVED'|'REJECTED', comment?: '...' }`
- `GET /api/leaves/report?month=YYYY-MM` — monthly aggregated report (admin)
- `GET /api/notifications` — fetch notifications

Notes / Recent changes
- Some icon usage (lucide-react) caused React runtime errors in this environment. Icons in several pages were temporarily replaced with emoji spans to avoid errors. You can switch to a compatible icon library (e.g. `@heroicons/react`) if desired.
- Admin decision flow now accepts an `adminComment` (sent from frontend as `comment`) and stores it on the leave request; notifications include the admin comment.
- The app uses JWT stored in `localStorage` under `lms_token`.

Testing
- Register or create test users, create leave types (admin), then apply for leave as an employee and approve/reject as admin.
- Check the Network tab for API request/response details if something doesn't appear.

Development notes
- Backend is ESM (uses `import`); run with Node 16+.
- If you change Mongoose schemas, restart the backend server.

Contributing
- Fork / branch and open PRs for fixes/features.

Contact
- This workspace is local to your machine; refer to the files in `backend/` and `frontend/` for implementation details.
