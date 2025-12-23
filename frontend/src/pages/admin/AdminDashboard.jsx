import React, { useState } from "react";
import ApproveReject from "./ApproveReject";
import AddLeaveType from "./AddLeaveType";
import MonthlyReport from "./MonthlyReport";
import Notifications from "../../components/Notifications";

export default function AdminDashboard({ user, onLogout }) {
  const [page, setPage] = useState("approve");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 dark:text-white border-r dark:border-gray-700 p-4">
        <div className="mb-6">
          <div className="font-semibold">Admin</div>
          <div className="text-sm text-gray-600">{user?.name || "Admin"}</div>
        </div>
        <div className="mb-4">
          <Notifications />
        </div>
        <nav className="flex flex-col gap-2">
          <button className={`text-left p-2 rounded ${page === "approve" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("approve")}>Approve/Reject leave</button>
          <button className={`text-left p-2 rounded ${page === "types" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("types")}>Add leave types</button>
          <button className={`text-left p-2 rounded ${page === "report" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("report")}>View monthly leave report</button>
        </nav>

        <div className="mt-6">
          <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 text-gray-900 dark:text-gray-100">
        {page === "approve" && <ApproveReject />}
        {page === "types" && <AddLeaveType />}
        {page === "report" && <MonthlyReport />}
      </main>
    </div>
  );
}
