import React, { useState, useEffect } from "react";
// Replaced lucide-react icons with emojis to avoid rendering issues

export default function ApplyLeave({ onApplied }) {
  const [types, setTypes] = useState([]);
  const [typeId, setTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/leavetypes")
      .then((r) => r.json())
      .then((data) => {
        setTypes(data);
        setLoadingTypes(false);
      })
      .catch(() => {
        setTypes([]);
        setLoadingTypes(false);
      });
  }, []);

  const calculateDuration = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const duration = calculateDuration();

  const submit = async () => {
    setMessage(null);
    setLoading(true);

    // Validation
    if (!typeId) {
      setMessage({ type: "error", text: "Please select a leave type" });
      setLoading(false);
      return;
    }

    if (!startDate || !endDate) {
      setMessage({ type: "error", text: "Please select start and end dates" });
      setLoading(false);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      setMessage({ type: "error", text: "End date must be after start date" });
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("lms_token");
      const res = await fetch("http://localhost:5000/api/leaves", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ typeId, startDate, endDate, reason }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.msg || "Failed to apply for leave");
      
      setMessage({ type: "success", text: "Leave application submitted successfully!" });
      
      // Reset form
      setTypeId("");
      setStartDate("");
      setEndDate("");
      setReason("");
      
      // Notify parent to refresh balances/history
      if (onApplied) onApplied();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">📤</span>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Apply for Leave</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Submit a new leave request</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm max-w-2xl">
        <div className="p-6 space-y-5">
          {/* Leave Type */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">📄</span>
              Leave Type
            </label>
            {loadingTypes ? (
              <div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Loading leave types...</span>
              </div>
            ) : (
              <select
                value={typeId}
                onChange={(e) => setTypeId(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
              >
                <option value="">Select a leave type</option>
                {types.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name} {t.defaultDaysPerYear && `(${t.defaultDaysPerYear} days/year)`}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="text-gray-400">📅</span>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <span className="text-gray-400">📅</span>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onKeyPress={handleKeyPress}
                min={startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Duration Display */}
          {duration && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-blue-600 dark:text-blue-400">⏰</span>
              <span className="text-sm text-blue-800 dark:text-blue-200">
                Duration: <span className="font-semibold">{duration} day{duration !== 1 ? 's' : ''}</span>
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-gray-400">📝</span>
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for your leave request..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none resize-none"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              message.type === "error" 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800'
            }`}>
              {message.type === "error" ? (
                <span className="flex-shrink-0 mt-0.5">❗</span>
              ) : (
                <span className="flex-shrink-0 mt-0.5">✅</span>
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={submit}
              disabled={loading || loadingTypes}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 flex items-center justify-center gap-2"
            >
              <span className="w-5 h-5">📤</span>
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 max-w-2xl">
        <h4 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2">📋 Before You Apply</h4>
        <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
          <li>• Check your leave balance before applying</li>
          <li>• Ensure dates don't conflict with existing leave</li>
          <li>• Your manager will be notified of your request</li>
          <li>• You'll receive a notification once your request is reviewed</li>
        </ul>
      </div>
    </div>
  );
}