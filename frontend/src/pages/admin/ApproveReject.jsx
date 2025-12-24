import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Filter, X, AlertCircle, FileText, Calendar, User, MessageSquare } from "lucide-react";

export default function ApproveReject() {
  const [leaves, setLeaves] = useState([]);
  const [types, setTypes] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [processingIds, setProcessingIds] = useState(new Set());
  const token = localStorage.getItem("lms_token");

  const fetchLeaves = async () => {
    setError(null);
    setLoading(true);
    
    if (!token) {
      setError('Not authenticated — please login');
      setLeaves([]);
      setLoading(false);
      return;
    }
    
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("typeId", filterType);
    
    const url = params.toString() 
      ? `http://localhost:5000/api/leaves?${params.toString()}` 
      : `http://localhost:5000/api/leaves`;
      
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      
      if (res.ok) {
        setLeaves(await res.json());
      } else {
        const body = await res.json().catch(() => ({}));
        setError(body.msg || `API error ${res.status}`);
        setLeaves([]);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchLeaves(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterType, filterStatus]);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const r = await fetch("http://localhost:5000/api/leavetypes");
        if (r.ok) setTypes(await r.json());
      } catch (err) {
        // Silent fail for types
      }
    };
    fetchTypes();
  }, []);

  useEffect(() => {
    const handler = () => {
      (async () => {
        const r = await fetch("http://localhost:5000/api/leavetypes");
        if (r.ok) setTypes(await r.json());
        await fetchLeaves();
      })();
    };
    window.addEventListener('leavetypes:updated', handler);
    return () => window.removeEventListener('leavetypes:updated', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decide = async (id, decision) => {
    const comment = (comments[id] || "").trim();
    
    if (decision === 'REJECTED' && !comment) {
      alert('Please provide a reason when rejecting requests.');
      return;
    }
    
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/${id}/decision`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json", 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ decision, comment }),
      });
      
      if (res.ok) {
        setComments(prev => { 
          const copy = { ...prev }; 
          delete copy[id]; 
          return copy; 
        });
        await fetchLeaves();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.msg || `Failed to update (${res.status})`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'PENDING':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
  };

  const hasActiveFilters = filterType || filterStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Requests</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review and manage employee leave applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">All types</option>
              {types.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={() => { setFilterType(""); setFilterStatus(""); }} 
              className="flex items-center gap-1 px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading requests...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && leaves.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No leave requests found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {hasActiveFilters ? 'Try adjusting your filters' : 'Requests will appear here once submitted'}
          </p>
        </div>
      )}

      {/* Leave Requests List */}
      {!loading && leaves.length > 0 && (
        <div className="space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                {/* Header with User Info */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {leave.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{leave.user?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{leave.user?.email || ''}</div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(leave.status)}`}>
                    {getStatusIcon(leave.status)}
                    <span>{leave.status}</span>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{leave.type?.name || 'Leave Type'}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{calculateDuration(leave.startDate, leave.endDate)}</span>
                    </div>
                  </div>

                  {leave.reason && (
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason: </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{leave.reason}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Admin Comment Section */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                    Admin Comment
                    {leave.status === 'PENDING' && (
                      <span className="text-xs text-red-600 dark:text-red-400">(required for rejection)</span>
                    )}
                  </label>
                  <textarea
                    value={comments[leave._id] || ""}
                    onChange={(e) => setComments(prev => ({ ...prev, [leave._id]: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none resize-none"
                    placeholder="Add a note or reason for your decision..."
                    rows={3}
                    disabled={leave.status !== 'PENDING'}
                  />
                </div>

                {/* Action Buttons */}
                {leave.status === 'PENDING' && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => decide(leave._id, 'APPROVED')}
                      disabled={processingIds.has(leave._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {processingIds.has(leave._id) ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => decide(leave._id, 'REJECTED')}
                      disabled={processingIds.has(leave._id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      {processingIds.has(leave._id) ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}

                {/* Admin Response Display (for approved/rejected) */}
                {leave.status !== 'PENDING' && leave.adminResponse && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Admin Response: </span>
                        <span className="text-sm text-blue-800 dark:text-blue-300">{leave.adminResponse}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && leaves.length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <p className="text-sm text-purple-800 dark:text-purple-200">
            <span className="font-semibold">{leaves.length}</span> request{leaves.length !== 1 ? 's' : ''} found • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'PENDING').length}</span> pending • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'APPROVED').length}</span> approved • 
            <span className="font-semibold ml-1">{leaves.filter(l => l.status === 'REJECTED').length}</span> rejected
          </p>
        </div>
      )}
    </div>
  );
}