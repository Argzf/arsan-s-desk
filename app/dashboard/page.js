'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        setError(data.error || 'Failed to load submissions.');
        setLoading(false);
        return;
      }

      setSubmissions(data.submissions || []);
    } catch (err) {
      setError('Failed to load submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/submissions', { method: 'DELETE' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading submissions...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Arsan's Desk — Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400">{submissions.length} submissions received</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 dark:bg-red-900 p-3 text-sm text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

        {submissions.length === 0 ? (
          <div className="rounded-lg bg-white dark:bg-gray-800 p-12 text-center shadow">
            <p className="text-gray-400 dark:text-gray-500">No submissions yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((sub) => (
              <div key={sub.id} className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {sub.title || 'Untitled'}
                  </h3>
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    {new Date(sub.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{sub.message}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>📞 {sub.phone}</span>
                  {sub.instagram && <span>📷 {sub.instagram}</span>}
                  <span className="text-green-600 dark:text-green-400">✓ Verified</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
