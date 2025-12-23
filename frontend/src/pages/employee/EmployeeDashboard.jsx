import React, { useState, useEffect } from "react";
import ApplyLeave from "./ApplyLeave";
import LeaveBalance from "./LeaveBalance";
import ApplicationHistory from "./ApplicationHistory";
import Notifications from "../../components/Notifications";

export default function EmployeeDashboard({ user, onLogout }) {
  const [page, setPage] = useState("apply");
  // a simple refresh key to trigger child components to refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  // mapping between internal page keys and URL-friendly slugs
  const SLUGS = { apply: "apply", balance: "balance", history: "history" };

  // set page from URL on mount and listen to back/forward navigation
  useEffect(() => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    // expected path like /employee/apply
    if (parts[0] === "employee" && parts[1]) {
      const slug = parts[1].toLowerCase();
      const key = Object.keys(SLUGS).find((k) => SLUGS[k] === slug);
      if (key) setPage(key);
    }
    const onPop = () => {
      const p = window.location.pathname.split("/").filter(Boolean)[1] || "apply";
      const key = Object.keys(SLUGS).find((k) => SLUGS[k] === p);
      setPage(key || "apply");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper to navigate and update the URL using a slug (no spaces)
  const go = (p) => {
    setPage(p);
    const slug = SLUGS[p] || p;
    try {
      window.history.pushState({}, "", `/employee/${slug}`);
    } catch (e) {
      // ignore history errors in some environments
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 dark:text-white border-r dark:border-gray-700 p-4">
        <div className="mb-6">
          <div className="font-semibold">Welcome</div>
          <div className="text-sm text-gray-600">{user?.name || "Employee"}</div>
        </div>
        <Notifications />
        <nav className="flex flex-col gap-2">
          <button className={`text-left p-2 rounded ${page === "apply" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => go("apply")}>Apply for leave</button>
          <button className={`text-left p-2 rounded ${page === "balance" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => go("balance")}>Check leave balance</button>
          <button className={`text-left p-2 rounded ${page === "history" ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'}`} onClick={() => go("history")}>View application history</button>
        </nav>

        <div className="mt-6">
          <button onClick={onLogout} className="text-sm text-red-600">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 text-gray-900 dark:text-gray-100">
        {page === "apply" && <ApplyLeave onApplied={triggerRefresh} />}
        {page === "balance" && <LeaveBalance refreshKey={refreshKey} />}
        {page === "history" && <ApplicationHistory refreshKey={refreshKey} />}
      </main>
    </div>
  );
}
