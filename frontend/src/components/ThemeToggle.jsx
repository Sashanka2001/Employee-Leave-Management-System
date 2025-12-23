import React, { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => localStorage.getItem('lms_theme') || 'light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('lms_theme', theme);
  }, [theme]);

  return (
    <div className="mt-4">
      <button
        onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-sm"
      >
        {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </div>
  );
}
