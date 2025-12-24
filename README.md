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

To set the default leave balances for all users to ANNUAL:5, CASUAL:5, MEDICAL:5 (applies to new users and can update existing users), two changes are provided:

- The backend model default has been updated to the new values.
- A small script is included to update existing users in your database.

Run the script from the `backend` folder (ensure `MONGO_URI` is set if needed):

```bash
cd backend
npm install
node scripts/update_leave_balances.js
```

This will connect to your MongoDB and set `leaveBalance` for all users to the values above.

 

 
