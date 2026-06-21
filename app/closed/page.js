'use client';

import { useTheme } from '@/lib/ThemeContext';

export const dynamic = 'force-dynamic';

export default function ClosedPage() {
  const { theme, toggleTheme, getDisplayTheme } = useTheme();
  const displayTheme = getDisplayTheme?.() || 'light';

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Theme toggle – because we can */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 rounded-full p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
        aria-label="Toggle theme"
      >
        {displayTheme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="max-w-md text-center space-y-6">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-4xl font-extrabold tracking-tight">We'll Be Back Soon</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Arsan's Desk is currently undergoing scheduled maintenance. 
          We apologize for the inconvenience.
        </p>
        <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          If you need immediate assistance, please contact us at{' '}
          <a
            href="mailto:support@arsansdesk.com"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            support@arsansdesk.com
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-8">
          Administrators can still access the{' '}
          <a href="/login" className="text-blue-500 hover:underline">login</a> page.
        </p>
      </div>
    </main>
  );
}
