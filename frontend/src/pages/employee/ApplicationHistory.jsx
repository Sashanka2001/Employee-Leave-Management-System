import React, { useEffect, useState } from "react";

export default function ApplicationHistory() {
  const [leaves, setLeaves] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (!token) return;
    fetch("http://localhost:5000/api/leaves/my", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setLeaves(data))
      .catch(() => setMessage("Unable to fetch"));
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Application history</h3>
      {!leaves.length && <div className="text-sm text-gray-500">No applications</div>}
      {leaves.map((l) => (
        <div key={l._id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-2 shadow-sm">
          <div className="text-sm text-gray-500 dark:text-gray-300">{l.type?.name || "Type"} • {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</div>
          <div className="mt-1">Status: <span className={`font-semibold ${l.status === 'APPROVED' ? 'text-green-600' : l.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>{l.status}</span></div>
        </div>
      ))}
      {message && <div className="mt-3 text-red-600">{message}</div>}
    </div>
  );
}
