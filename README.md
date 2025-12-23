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

The frontend dev server uses Vite (default port 5173). Backend runs on port 5000 by default.

 
