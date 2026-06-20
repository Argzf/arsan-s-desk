'use client';

import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    phone: '',
    instagram: '',
  });
  const [step, setStep] = useState('form'); // 'form' | 'verifying' | 'verified'
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      // First, send the verification code via Telegram
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

      // Code verified — now submit the form
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

  if (step === 'verified') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg text-center">
          <div className="mb-4 text-5xl">✅</div>
          <h2 className="text-2xl font-bold text-green-600">Submission Received!</h2>
          <p className="mt-2 text-gray-600">Thank you for reaching out. We'll review your submission shortly.</p>
          <button
            onClick={() => { setStep('form'); setStatus({ type: '', message: '' }); }}
            className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Submit Another
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Arsan's Desk</h1>
          <p className="text-gray-500">Submit your ideas, complaints, or suggestions.</p>
        </div>

        {status.message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${
            status.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {status.message}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title (Optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Brief title for your submission"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Message *</label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Describe your idea, complaint, or suggestion..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="+1234567890 (E.164 format)"
              />
              <p className="mt-1 text-xs text-gray-400">We'll send a verification code via Telegram.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram (Optional)</label>
              <input
                type="text"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="@yourusername"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 py-3 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Verify & Submit'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-sm text-gray-600">
              We sent a verification code to <strong>{formData.phone}</strong> via Telegram.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code *</label>
              <input
                type="text"
                required
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Enter the code you received"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-green-600 py-3 text-white font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Verifying...' : 'Verify Code & Submit'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setStatus({ type: '', message: '' }); }}
              className="w-full text-sm text-gray-500 hover:underline"
            >
              ← Go back
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          Your phone number is used only for verification.
        </p>
      </div>
    </main>
  );
}
