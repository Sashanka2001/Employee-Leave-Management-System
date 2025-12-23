import React, { useEffect, useState } from "react";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("lms_token");

  const fetchNotes = async () => {
    if (!token) return;
    const res = await fetch("http://localhost:5000/api/notifications/", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setNotes(await res.json());
  };

  useEffect(() => { fetchNotes(); }, []);

  const markRead = async (id) => {
    const res = await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) fetchNotes();
  };

  const unread = notes.filter(n => !n.read).length;

  return (
    <div className="mb-4">
      <button onClick={() => { setOpen(!open); if (!open) fetchNotes(); }} className="flex items-center gap-2">
        <span className="bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">🔔</span>
        {unread > 0 && <span className="text-sm text-red-600">{unread}</span>}
      </button>
      {open && (
          <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-auto w-80 shadow-sm">
          {notes.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-300">No notifications</div>}
          {notes.map(n => (
              <div key={n._id} className={`p-2 mb-2 border ${n.read ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} border-gray-200 dark:border-gray-700 rounded-lg`}>
              <div className="text-sm text-gray-800 dark:text-gray-100">{n.message}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
              {!n.read && <button onClick={() => markRead(n._id)} className="mt-1 text-xs text-blue-600">Mark read</button>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
