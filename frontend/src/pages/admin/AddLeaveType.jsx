import React, { useState } from "react";
// Replacing lucide-react icons with emoji spans to avoid runtime React child errors

export default function AddLeaveType() {
  const [name, setName] = useState("");
  const [days, setDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const token = localStorage.getItem("lms_token");

  const submit = async () => {
    if (!name.trim()) {
      setMessage({ type: "error", text: "Please enter a leave type name" });
      return;
    }
    if (days <= 0) {
      setMessage({ type: "error", text: "Days must be greater than 0" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("http://localhost:5000/api/leavetypes", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name, defaultDaysPerYear: Number(days) }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Leave type added successfully!" });
        setName("");
        setDays(0);
        
        // Notify other components that leave types changed
        try {
          window.dispatchEvent(new Event('leavetypes:updated'));
        } catch (e) {
          // ignore
        }
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.msg || "Failed to add leave type" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      submit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl">
          ➕
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add Leave Type</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new leave type for employees</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm max-w-2xl">
        <div className="p-6 space-y-5">
          {/* Leave Type Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">📅</span>
              Leave Type Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Sick Leave, Annual Leave, Casual Leave"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          {/* Default Days */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">#</span>
              Default Days Per Year
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              onKeyPress={handleKeyPress}
              min="0"
              placeholder="e.g., 12"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Number of days employees can take for this leave type annually
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              message.type === "error" 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            }`}>
              {message.type === "error" ? (
                <span className="w-5 h-5 flex-shrink-0 mt-0.5">❗</span>
              ) : (
                <span className="w-5 h-5 flex-shrink-0 mt-0.5">✅</span>
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={submit}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5">➕</span>
              {loading ? "Adding..." : "Add Leave Type"}
            </button>
          </div>
        </div>
      </div>

      {/* Quick tips removed as requested */}
    </div>
  );
}