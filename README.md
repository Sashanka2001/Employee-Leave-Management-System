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

### Update all users' leave balances

To set the default leave balances for all users to ANNUAL:5, CASUAL:5, MEDICAL:10 (applies to new users and can update existing users), two changes are provided:

- The backend model default has been updated to the new values.
- A small script is included to update existing users in your database.

Run the script from the `backend` folder (ensure `MONGO_URI` is set if needed):

```bash
cd backend
npm install
node scripts/update_leave_balances.js
```

This will connect to your MongoDB and set `leaveBalance` for all users to the values above (ANNUAL:5, CASUAL:5, MEDICAL:10).

 

## Developer notes

- Recommended: install React DevTools for a better development experience: https://reactjs.org/link/react-devtools

- Recent fixes and troubleshooting:
	- `lucide-react` icon components caused runtime errors in development ("Objects are not valid as a React child"). As a temporary stability fix, several admin/employee pages now use emoji fallbacks for icons. Affected files include:
		- `frontend/src/pages/employee/LeaveBalance.jsx`
		- `frontend/src/pages/employee/ApplyLeave.jsx`
		- `frontend/src/pages/employee/ApplicationHistory.jsx`
		- `frontend/src/pages/admin/ApproveReject.jsx`
	- If you prefer SVG icons, reinstall or fix `lucide-react` and restore icons in those files.

- UX change: new user registration no longer auto-signs-in. After registering, users must sign in via the login view.

- How to run and debug locally:
	- Start backend:

```bash
cd backend
node server.js
```

	- Start frontend:

```bash
cd frontend
npm run dev
```

	- Open the app in the browser (Vite will show the URL). Use React DevTools and your browser console to inspect any runtime errors.

 


