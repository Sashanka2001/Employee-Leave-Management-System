import React, { useEffect, useState } from "react";
import { TrendingUp, Calendar, AlertCircle, RefreshCw } from "lucide-react";

export default function LeaveBalance({ refreshKey }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchBalance = async () => {
    const token = localStorage.getItem("lms_token");
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const r = await fetch("http://localhost:5000/api/auth/me", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (!r.ok) throw new Error("Failed to fetch balance");
      
      const data = await r.json();
      const lb = data?.user?.leaveBalance || null;
      
      if (!lb || Object.keys(lb).length === 0) {
        setBalance(null);
      } else {
        setBalance(lb);
      }
      
      setMessage(null);
      setLastUpdated(new Date());
    } catch (err) {
      setMessage("Unable to fetch leave balance");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and refetch when parent triggers (refreshKey)
  useEffect(() => {
    fetchBalance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Polling to keep data reasonably up-to-date (every 10s)
  useEffect(() => {
    const id = setInterval(fetchBalance, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBalanceColor = (days) => {
    if (days === 0) return 'text-red-600 dark:text-red-400';
    if (days <= 5) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getBalanceBgColor = (days) => {
    if (days === 0) return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    if (days <= 5) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Balance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your available leave days</p>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <RefreshCw className="w-3 h-3" />
            <span>Updated {formatLastUpdated()}</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading balance...</span>
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

      {/* No Data State */}
      {!loading && !message && !balance && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No leave balance data available</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Contact your admin to set up your leave allocation</p>
        </div>
      )}

      {/* Balance Cards */}
      {!loading && balance && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(balance).map(([leaveType, days]) => (
              <div
                key={leaveType}
                className={`relative overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md ${getBalanceBgColor(days)}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">{leaveType}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${getBalanceColor(days)}`}>
                      {days}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      day{days !== 1 ? 's' : ''} remaining
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    {days === 0 && (
                      <span className="inline-flex items-center text-xs font-medium text-red-700 dark:text-red-300">
                        ⚠️ No days remaining
                      </span>
                    )}
                    {days > 0 && days <= 5 && (
                      <span className="inline-flex items-center text-xs font-medium text-yellow-700 dark:text-yellow-300">
                        ⚡ Running low
                      </span>
                    )}
                    {days > 5 && (
                      <span className="inline-flex items-center text-xs font-medium text-green-700 dark:text-green-300">
                        ✓ Good balance
                      </span>
                    )}
                  </div>
                </div>

                {/* Decorative gradient overlay */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform translate-x-8 -translate-y-8">
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-transparent rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-blue-800 dark:text-blue-200">
                <span className="font-semibold">
                  {Object.values(balance).reduce((sum, days) => sum + days, 0)} total days
                </span>
                {' '}available across {Object.keys(balance).length} leave type{Object.keys(balance).length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}