import React, { useEffect, useState } from "react";
// Replaced lucide-react icons with emoji spans to avoid runtime React child errors

export default function MonthlyReport() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("lms_token");

  const fetchReport = async (m) => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/leaves/report?month=${m}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setReport(await res.json());
      } else {
        setReport(null);
      }
    } catch (error) {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(month);
  }, [month]);

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <span className="w-5 h-5 text-green-500">✅</span>;
      case 'pending':
        return <span className="w-5 h-5 text-yellow-500">⏳</span>;
      case 'rejected':
        return <span className="w-5 h-5 text-red-500">❌</span>;
      default:
        return <span className="w-5 h-5 text-gray-500">⚠️</span>;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'rejected':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-white text-xl">
            📄
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Monthly Leave Report</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overview of leave statistics</p>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 shadow-sm">
          <span className="text-gray-400">📅</span>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-gray-900 dark:text-gray-100 font-medium outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 dark:text-gray-400">Loading report...</span>
          </div>
        </div>
      )}

      {/* No Data State */}
          {!loading && !report && (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="w-8 h-8 text-gray-400">📄</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">No data available for selected month</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try selecting a different month</p>
        </div>
      )}

      {/* Report Content */}
      {!loading && report && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Requests</div>
                <span className="w-5 h-5 text-blue-600 dark:text-blue-400">📈</span>
              </div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{report.totalRequests}</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-purple-700 dark:text-purple-300">Days Requested</div>
                <span className="w-5 h-5 text-purple-600 dark:text-purple-400">📅</span>
              </div>
              <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{report.totalDaysRequested}</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">Days Approved</div>
                <span className="w-5 h-5 text-green-600 dark:text-green-400">✅</span>
              </div>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">{report.totalDaysApproved}</div>
            </div>
          </div>

          {/* By Status Section */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <span className="text-gray-400">🕒</span>
              By Status
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(report.byStatus || {}).map(([status, count]) => (
                <div
                  key={status}
                  className={`p-4 border rounded-lg ${getStatusColor(status)}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{status}</span>
                    {getStatusIcon(status)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
                </div>
              ))}
            </div>
          </section>

          {/* By Type Section */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-gray-400">📄</span>
                By Leave Type
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Requested Days</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Approved Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(report.byType || {}).map(([type, data]) => (
                    <tr key={type} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{data.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{data.requestedDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          {data.approvedDays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* By User Section */}
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span className="text-gray-400">👥</span>
                By User Summary
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Count</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Requested Days</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Approved Days</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {Object.entries(report.byUser || {}).map(([user, data]) => (
                    <tr key={user} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{user}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{data.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">{data.requestedDays}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                          {data.approvedDays}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}