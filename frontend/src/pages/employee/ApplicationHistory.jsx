import React, { useEffect, useState } from "react";
import { FiFileText } from "react-icons/fi";
// Replaced lucide icons with emojis to avoid rendering issues

export default function ApplicationHistory() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/leaves/my", { 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then((r) => r.json())
      .then((data) => {
        setLeaves(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage("Unable to fetch leave history");
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="w-5 h-5 text-green-500">✅</span>;
      case 'REJECTED':
        return <span className="w-5 h-5 text-red-500">❌</span>;
      case 'PENDING':
        return <span className="w-5 h-5 text-yellow-500">⏳</span>;
      default:
        return <span className="w-5 h-5 text-gray-500">⚠️</span>;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'REJECTED':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'PENDING':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800';
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg">
          📜
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Application History</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">View all your leave requests</p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading history...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {message && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{message}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !message && leaves.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiFileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No leave applications yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Your leave requests will appear here</p>
        </div>
      )}

      {/* Leave Applications List */}
      {!loading && leaves.length > 0 && (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white">
                        📄
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {leave.type?.name || "Leave Type"}
                      </span>
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(leave.status)}`}>
                      {getStatusIcon(leave.status)}
                      <span>{leave.status}</span>
                    </div>
                  </div>

                  {/* Date and Duration Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4">📅</span>
                      <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4">⏰</span>
                      <span>{calculateDuration(leave.startDate, leave.endDate)}</span>
                    </div>
                  </div>

                  {/* Reason (if available) */}
                  {leave.reason && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Reason:</span> {leave.reason}
                      </p>
                    </div>
                  )}

                  {/* Admin Response (if available) */}
                  {leave.adminResponse && (
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Admin Response:</span> {leave.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && leaves.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <span className="font-semibold">{leaves.length}</span> total application{leaves.length !== 1 ? 's' : ''} • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'APPROVED').length}</span> approved • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'PENDING').length}</span> pending • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'REJECTED').length}</span> rejected
          </p>
        </div>
      )}
    </div>
  );
}