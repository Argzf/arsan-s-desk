'use client';

import { useState } from 'react';
import { useTheme } from '@/lib/ThemeContext';

// ✅ Prevents static generation
export const dynamic = 'force-dynamic';

export default function Home() {
  const { theme, toggleTheme, getDisplayTheme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    phone: '',
    instagram: '',
  });
  const [step, setStep] = useState('form');
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneBlur = async () => {
    const phone = formData.phone;
    if (!phone) return;
    try {
      await fetch('/api/log-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
    } catch (err) {
      console.error('Webhook logging failed:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        setStatus({ type: 'error', message: verifyData.error || 'Failed to send verification code.' });
        setIsLoading(false);
        return;
      }

      setVerificationId(verifyData.request_id);
      setStep('verifying');
      setStatus({ type: 'success', message: 'Verification code sent to your phone via Telegram!' });
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const checkRes = await fetch('/api/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: verificationId,
          code: verificationCode,
          phone: formData.phone,
        }),
      });

      const checkData = await checkRes.json();

      if (!checkRes.ok) {
        setStatus({ type: 'error', message: checkData.error || 'Invalid verification code.' });
        setIsLoading(false);
        return;
      }

      const submitRes = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          verified: true,
        }),
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        setStatus({ type: 'error', message: submitData.error || 'Failed to submit.' });
        setIsLoading(false);
        return;
      }

      setStep('verified');
      setStatus({ type: 'success', message: 'Thank you! Your submission has been received.' });
      setFormData({ title: '', message: '', phone: '', instagram: '' });
      setVerificationCode('');
    } catch (err) {
      setStatus({ type: 'error', message: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const displayTheme = getDisplayTheme?.() || 'light';

  if (step === 'verified') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="text-2xl font-bold text-green-600 dark:text-green-400">Submission Received!</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Thank you for reaching out. We'll review your submission shortly.</p>
          <button
            onClick={() => { setStep('form'); setStatus({ type: '', message: '' }); }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-white dark:bg-gray-900 relative">
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 rounded-full p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        aria-label="Toggle theme"
      >
        {displayTheme === 'dark' ? '☀️' : '🌙'}
      </button>

      <div className="w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Arsan's Desk</h1>
          <p className="text-gray-500 dark:text-gray-400">Submit your ideas, complaints, or suggestions.</p>
        </div>

        {status.message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            status.type === 'error'
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
          }`}>
            {status.message}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title (Optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                placeholder="Brief title for your submission"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Message *</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                placeholder="Describe your idea, complaint, or suggestion..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                placeholder="+1234567890 (E.164 format)"
              />
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">We'll send a verification code via Telegram.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Instagram (Optional)</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                placeholder="@yourusername"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Verify & Submit'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              We sent a verification code to <strong>{formData.phone}</strong> via Telegram.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Verification Code *</label>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                placeholder="Enter the code you received"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-green-600 py-3 text-white font-medium hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code & Submit'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setStatus({ type: '', message: '' }); }}
              className="w-full text-sm text-gray-500 dark:text-gray-400 hover:underline"
            >
              ← Go back
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Your phone number is used only for verification.
        </p>
      </div>
    </main>
  );
}
