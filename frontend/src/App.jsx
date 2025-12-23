import React, { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

export default function App() {
  const [view, setView] = useState("login");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const token = localStorage.getItem("lms_token");
    const role = localStorage.getItem("lms_role");
    const name = localStorage.getItem("lms_name");
    if (token && role) setUser({ token, role, name });
    const saved = localStorage.getItem('lms_theme') || 'light';
    setTheme(saved);
    if (saved === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const handleAuth = (userObj) => {
    if (!userObj) {
      localStorage.removeItem("lms_token");
      localStorage.removeItem("lms_role");
      localStorage.removeItem("lms_name");
      setUser(null);
      setView("login");
      return;
    }
    localStorage.setItem("lms_token", userObj.token);
    localStorage.setItem("lms_role", userObj.role);
    localStorage.setItem("lms_name", userObj.name || "");
    setUser(userObj);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lms_theme', next);
    if (next === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  if (user && user.role === "EMPLOYEE") {
    return (
      <div className="">
        <button onClick={toggleTheme} className="fixed top-4 right-4 z-50 p-2 rounded bg-gray-100 dark:bg-gray-800">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <EmployeeDashboard user={user} onLogout={() => handleAuth(null)} />
      </div>
    );
  }

  if (user && user.role === "ADMIN") {
    return (
      <div>
        <button onClick={toggleTheme} className="fixed top-4 right-4 z-50 p-2 rounded bg-gray-100 dark:bg-gray-800">
          {theme === 'dark' ? '🌙' : '☀️'}
        </button>
        <AdminDashboard user={user} onLogout={() => handleAuth(null)} />
      </div>
    );
  }

  return view === "login" ? (
    <div>
      <button onClick={toggleTheme} className="fixed top-4 right-4 z-50 p-2 rounded bg-gray-100 dark:bg-gray-800">{theme === 'dark' ? '🌙' : '☀️'}</button>
      <Login switchView={setView} onAuth={handleAuth} />
    </div>
  ) : (
    <div>
      <button onClick={toggleTheme} className="fixed top-4 right-4 z-50 p-2 rounded bg-gray-100 dark:bg-gray-800">{theme === 'dark' ? '🌙' : '☀️'}</button>
      <Register switchView={setView} onAuth={handleAuth} />
    </div>
  );
}
