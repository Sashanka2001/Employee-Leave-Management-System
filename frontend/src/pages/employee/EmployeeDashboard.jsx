import React, { useState } from "react";
import ApplyLeave from "./ApplyLeave";
import LeaveBalance from "./LeaveBalance";
import ApplicationHistory from "./ApplicationHistory";
import Notifications from "../../components/Notifications";

export default function EmployeeDashboard({ user, onLogout }) {
  const [page, setPage] = useState("apply");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 dark:text-white border-r dark:border-gray-700 p-4">
        <div className="mb-6">
          <div className="font-semibold">Welcome</div>
          <div className="text-sm text-gray-600">{user?.name || "Employee"}</div>
        </div>
        <Notifications />
        <nav className="flex flex-col gap-2">
          <button className={`text-left p-2 rounded ${page === "apply" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("apply")}>Apply for leave</button>
          <button className={`text-left p-2 rounded ${page === "balance" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("balance")}>Check leave balance</button>
          <button className={`text-left p-2 rounded ${page === "history" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => setPage("history")}>View application history</button>
        </nav>

        <div className="mt-6">
          <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 text-gray-900 dark:text-gray-100">
        {page === "apply" && <ApplyLeave />}
        {page === "balance" && <LeaveBalance />}
        {page === "history" && <ApplicationHistory />}
      </main>
    </div>
  );
}
