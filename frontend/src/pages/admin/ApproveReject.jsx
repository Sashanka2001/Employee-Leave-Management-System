import React, { useEffect, useState } from "react";

export default function ApproveReject() {
  const [leaves, setLeaves] = useState([]);
  const [types, setTypes] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const token = localStorage.getItem("lms_token");

  const fetchLeaves = async () => {
    setError(null);
    if (!token) {
      setError('Not authenticated — please login');
      setLeaves([]);
      return;
    }
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("typeId", filterType);
    const url = params.toString() ? `http://localhost:5000/api/leaves?${params.toString()}` : `http://localhost:5000/api/leaves`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      setLeaves(await res.json());
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.msg || `API error ${res.status}`);
      setLeaves([]);
    }
  };

  useEffect(() => { fetchLeaves(); }, [filterType, filterStatus]);

  useEffect(() => {
    const fetchTypes = async () => {
      const r = await fetch("http://localhost:5000/api/leavetypes");
      if (r.ok) setTypes(await r.json());
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const handler = () => {
      // re-fetch types and leaves when a new type is added elsewhere
      (async () => {
        const r = await fetch("http://localhost:5000/api/leavetypes");
        if (r.ok) setTypes(await r.json());
        await fetchLeaves();
      })();
    };
    window.addEventListener('leavetypes:updated', handler);
    return () => window.removeEventListener('leavetypes:updated', handler);
  }, []);

  // (fetch triggered by filterType/filterStatus effect)

  const decide = async (id, decision) => {
    const comment = (comments[id] || "").trim();
    if (decision === 'REJECTED' && !comment) {
      alert('Please provide a reason when rejecting requests.');
      return;
    }
    const res = await fetch(`http://localhost:5000/api/leaves/${id}/decision`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ decision, comment }),
    });
    if (res.ok) {
      // clear comment for this request
      setComments(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
      fetchLeaves();
    } else {
      const err = await res.json().catch(() => ({}));
      setError(err.msg || `Failed to update (${res.status})`);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Leave Requests</h2>
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm">Filter by type</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} className="p-2 border rounded">
          <option value="">All types</option>
          {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <label className="text-sm">Status</label>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2 border rounded">
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        {filterType && <button onClick={() => setFilterType("")} className="ml-2 text-sm text-blue-600">Clear</button>}
        {filterStatus && <button onClick={() => setFilterStatus("")} className="ml-2 text-sm text-blue-600">Clear</button>}
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-200 rounded">
          {error}
        </div>
      )}
      {leaves.length === 0 && <div>No leave requests</div>}
      <div className="space-y-4">
        {leaves.map(l => (
          <div key={l._id} className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="text-sm text-gray-600">{l.user?.name} — {l.user?.email}</div>
            <div className="font-semibold">{l.type?.name} • {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}</div>
            <div className="text-sm">Reason: {l.reason}</div>
            <div className="mt-2">
              <label className="text-sm font-medium">Admin comment {" "}<span className="text-xs text-gray-500">(required for rejection)</span></label>
              <textarea
                value={comments[l._id] || ""}
                onChange={e => setComments(prev => ({ ...prev, [l._id]: e.target.value }))}
                className="w-full mt-1 p-2 border rounded resize-none"
                placeholder="Add a note or reason for decision"
                rows={2}
              />
            </div>
            <div className="mt-2 flex gap-2">
              {l.status === 'PENDING' && (
                <>
                  <button onClick={() => decide(l._id, 'APPROVED')} className="px-3 py-1 bg-green-600 text-white rounded">Approve</button>
                  <button onClick={() => decide(l._id, 'REJECTED')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
                </>
              )}
              <div className="text-sm text-gray-500 dark:text-gray-300">Status: <span className={`font-semibold ${l.status === 'APPROVED' ? 'text-green-600' : l.status === 'REJECTED' ? 'text-red-600' : 'text-yellow-600'}`}>{l.status}</span></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
