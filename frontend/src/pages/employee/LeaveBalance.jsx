import React, { useEffect, useState } from "react";

export default function LeaveBalance({ refreshKey }) {
  const [balance, setBalance] = useState(null);
  const [message, setMessage] = useState(null);
  const [leaveTypes, setLeaveTypes] = useState([]);

  const fetchBalance = async () => {
    const token = localStorage.getItem("lms_token");
    if (!token) return;
    try {
      const r = await fetch("http://localhost:5000/api/auth/me", { headers: { Authorization: `Bearer ${token}` } });
      if (!r.ok) throw new Error("failed");
      const data = await r.json();
      const lb = data?.user?.leaveBalance || null;
      if (!lb || Object.keys(lb).length === 0) setBalance(null);
      else setBalance(lb);
      setMessage(null);
    } catch (err) {
      setMessage("Unable to fetch balance");
    }
  };

  const fetchLeaveTypes = async () => {
    try {
      const r = await fetch("http://localhost:5000/api/leavetypes");
      if (!r.ok) throw new Error("failed");
      const data = await r.json();
      setLeaveTypes(data || []);
    } catch (err) {
      // ignore - leaveTypes stays empty
      setLeaveTypes([]);
    }
  };

  // initial fetch and refetch when parent triggers (refreshKey)
  useEffect(() => {
    fetchBalance();
    fetchLeaveTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // polling to keep data reasonably up-to-date (every 10s)
  useEffect(() => {
    const id = setInterval(fetchBalance, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
