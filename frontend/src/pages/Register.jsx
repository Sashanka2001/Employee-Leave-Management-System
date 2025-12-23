import React, { useState } from "react";
// Using simple emoji icons instead of lucide-react to avoid runtime errors

export default function Register({ switchView, onAuth }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const submit = async () => {
    setLoading(true);
    setMessage(null);
    
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!pwdRegex.test(password)) {
      setMessage({ 
        type: "error", 
        text: "Password must be at least 8 characters and include uppercase, lowercase, and a special character." 
      });
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "EMPLOYEE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Registration failed");
      const userRole = data.user?.role;
      localStorage.setItem("lms_token", data.token);
      localStorage.setItem("lms_role", userRole);
      localStorage.setItem("lms_name", data.user?.name || "");
      setMessage({ type: "success", text: "Registration successful." });
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
              ➕👤
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="text-gray-500">Join us to start managing your leaves</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  required
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                Must be 8+ characters with uppercase, lowercase & special character
              </p>
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30"
            >
              {loading ? "Creating..." : "Create Account"}
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

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}