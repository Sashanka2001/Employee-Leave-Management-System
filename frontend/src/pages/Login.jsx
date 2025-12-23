import React, { useState } from "react";
// Using simple emoji icons to avoid runtime issues with lucide-react

export default function Login({ switchView, onAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    
    if (role === "EMPLOYEE") {
      const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!pwdRegex.test(password)) {
        setMessage({ 
          type: "error", 
          text: "Password must be at least 8 characters and include uppercase, lowercase, and a special character." 
        });
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Login failed");
      const userRole = data.user?.role;
      localStorage.setItem("lms_token", data.token);
      localStorage.setItem("lms_role", userRole);
      localStorage.setItem("lms_name", data.user?.name || "");
      setMessage({ type: "success", text: "Login successful" });
      if (onAuth) onAuth({ token: data.token, role: userRole, name: data.user?.name });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 text-white text-2xl">
              🔐
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500">Sign in to manage your leaves</p>
          </div>

          {/* Role Selector */}
          <div className="flex gap-3 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole("EMPLOYEE")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === "EMPLOYEE" 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Employee
            </button>
            <button
              type="button"
              onClick={() => setRole("ADMIN")}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                role === "ADMIN" 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? "Signing in..." : `Sign in as ${role}`}
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-lg ${
              message.type === "error" 
                ? 'bg-red-50 text-red-800 border border-red-200' 
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message.type === "error" ? (
                <span className="w-5 h-5 flex-shrink-0 mt-0.5">❗</span>
              ) : (
                <span className="w-5 h-5 flex-shrink-0 mt-0.5">✅</span>
              )}
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Note */}
          {role === "ADMIN" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 Use the admin credentials created via backend to login as Admin.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchView && switchView("register")}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}