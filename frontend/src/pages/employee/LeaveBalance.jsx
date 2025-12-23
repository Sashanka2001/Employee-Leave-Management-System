import React, { useEffect, useState } from "react";

export default function LeaveBalance() {
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (!token) return;
    fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        if (!r.ok) throw new Error("failed");
        const data = await r.json();
        // leaveBalance stored as map on server; convert if needed
        const lb = data.leaveBalance || data.leaveBalance || {};
        setBalance(lb);
      })
      .catch(() => setMessage("Unable to fetch balance"));
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Leave balance</h3>
      {!balance && <div className="text-sm text-gray-500">No data</div>}
      {balance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(balance).map(([k, v]) => (
            <div key={k} className="p-3 border rounded">
              <div className="text-sm text-gray-500">{k}</div>
              <div className="text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>
      )}
      {message && <div className="mt-3 text-red-600">{message}</div>}
    </div>
  );
}
