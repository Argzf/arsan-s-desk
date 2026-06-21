'use client';

import { useState, useRef } from 'react';
import { useTheme } from '@/lib/ThemeContext';

export const dynamic = 'force-dynamic';

export default function Home() {
  const { theme, toggleTheme, getDisplayTheme } = useTheme();
  const formRef = useRef(null);

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
      // Silent fail
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

      let verifyData;
      const contentType = verifyRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        verifyData = await verifyRes.json();
      } else {
        const text = await verifyRes.text();
        throw new Error(`Server returned non-JSON: ${text.substring(0, 100)}`);
      }

      if (!verifyRes.ok) {
        setStatus({ type: 'error', message: verifyData.error || 'Failed to send verification code.' });
        setIsLoading(false);
        return;
      }

      setVerificationId(verifyData.request_id);
      setStep('verifying');
      setStatus({ type: 'success', message: 'Verification code sent to your phone via Telegram!' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
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

      let checkData;
      const contentType = checkRes.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        checkData = await checkRes.json();
      } else {
        const text = await checkRes.text();
        throw new Error(`Server returned non-JSON: ${text.substring(0, 100)}`);
      }

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

      let submitData;
      const subContentType = submitRes.headers.get('content-type');
      if (subContentType && subContentType.includes('application/json')) {
        submitData = await submitRes.json();
      } else {
        const text = await submitRes.text();
        throw new Error(`Server returned non-JSON: ${text.substring(0, 100)}`);
      }

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
      setStatus({ type: 'error', message: err.message || 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const displayTheme = getDisplayTheme?.() || 'light';

  if (step === 'verified') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-white dark:bg-gray-900">
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
    <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 rounded-full p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors shadow-lg"
        aria-label="Toggle theme"
      >
        {displayTheme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 text-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Welcome to <span className="text-blue-600 dark:text-blue-400">Arsan's Desk</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Share your ideas, complaints, or suggestions — securely and anonymously.
          </p>
          <button
            onClick={scrollToForm}
            className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            Get Started
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 rounded-t-3xl"></div>
      </section>

      {/* What This Is Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What This Is</h2>
          <div className="prose prose-lg dark:prose-invert mx-auto text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              <strong>Arsan's Desk</strong> is a direct line to the team. Use this space to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Share creative ideas</strong> – propose features, projects, or improvements.</li>
              <li><strong>Report issues or complaints</strong> – let us know about problems you’ve encountered.</li>
              <li><strong>Give constructive feedback</strong> – help us grow and serve you better.</li>
              <li><strong>Ask questions</strong> – if you’re unsure about something, we’re here to clarify.</li>
            </ul>
            <p>
              Your submissions are taken seriously and will be reviewed personally. 
              We value your voice – every message helps shape what we do.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="text-center">
              <div className="text-5xl mb-2">📝</div>
              <p className="font-semibold">1. Fill the form</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your message and contact info.</p>
            </div>
            <div className="text-4xl text-gray-400 dark:text-gray-500">→</div>
            <div className="text-center">
              <div className="text-5xl mb-2">📱</div>
              <p className="font-semibold">2. Verify via Telegram</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">We send a code to your phone.</p>
            </div>
            <div className="text-4xl text-gray-400 dark:text-gray-500">→</div>
            <div className="text-center">
              <div className="text-5xl mb-2">✅</div>
              <p className="font-semibold">3. Submit</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your submission is securely stored.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section ref={formRef} className="py-16 px-6 bg-white dark:bg-gray-900 scroll-mt-16">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold text-center mb-6">Submit Your Request</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            All fields except Title and Instagram are required.
          </p>

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
      </section>

     {/* Footer */}
<footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
  &copy; {new Date().getFullYear()}{' '}
  <a 
    href="https://arcanum-arsan.vercel.app/links/portfolio" 
    target="_blank" 
    rel="noopener noreferrer"
    className="text-blue-600 dark:text-blue-400 hover:underline"
  >
    Arsan Gzf
  </a>
  . All rights reserved.
</footer>
    </main>
  );
}
