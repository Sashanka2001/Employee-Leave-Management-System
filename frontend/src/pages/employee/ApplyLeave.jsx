import React, { useState, useEffect } from "react";

export default function ApplyLeave({ onApplied }) {
  const [types, setTypes] = useState([]);
  const [typeId, setTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/leavetypes")
      .then((r) => r.json())
      .then((data) => setTypes(data))
      .catch(() => setTypes([]));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);
    try {
      const token = localStorage.getItem("lms_token");
      const res = await fetch("http://localhost:5000/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ typeId, startDate, endDate, reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed");
      setMessage({ type: "success", text: "Leave applied" });
      // notify parent to refresh balances/history
      if (onApplied) onApplied();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Apply for leave</h3>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm max-w-xl">
        <form onSubmit={submit} className="space-y-3">
        <label className="block text-sm text-gray-700 dark:text-gray-300">Leave type</label>
        <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-3 py-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required>
          <option value="">Select</option>
          {types.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <label className="block text-sm text-gray-700 dark:text-gray-300">Start date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-3 py-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />

        <label className="block text-sm text-gray-700 dark:text-gray-300">End date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-3 py-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" required />

        <label className="block text-sm text-gray-700 dark:text-gray-300">Reason</label>
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="border border-gray-200 dark:border-gray-600 rounded px-3 py-2 w-full mb-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" />
        <div className="pt-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow">Apply</button>
        </div>
        </form>
      </div>

      {message && <div className={`mt-3 p-2 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900' : 'bg-green-100 text-green-700 dark:bg-green-900'}`}>{message.text}</div>}
    </div>
  );
}
