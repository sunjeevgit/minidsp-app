'use client';
import { useState } from 'react';
import { uploadAndScan } from './actions';
import { useRouter } from 'next/navigation';

export default function ScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'scanning' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setStatus('uploading');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await uploadAndScan(formData);

      if (response.success) {
        setStatus('success');
        // Small delay for the user to see the success state
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        throw new Error(response.error);
      }
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900">New PII Scan</h1>
        <p className="text-slate-500 mt-2">Upload a synthetic .csv or .txt file (max 1MiB) for PII detection</p>
      </div>

      <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
        status === 'idle' ? 'border-slate-300 bg-white hover:border-indigo-400' :
        status === 'success' ? 'border-green-500 bg-green-50' :
        status === 'error' ? 'border-red-500 bg-red-50' : 'border-indigo-300 bg-indigo-50'
      }`}>
        {status === 'idle' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.8-4.2A7.997 7.997 0 0112 10a7.997 7.997 0 014.2 3.8A4.4 4.4 0 0012 16m0 0l-4-4m4 4l4-4m-4 4V4" />
                </svg>
              </div>
            </div>
            <div>
              <label className="cursor-pointer">
                <span className="bg-indigo-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-indigo-700 transition-colors">
                  Select File
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.txt"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </label>
              {file && <p className="mt-4 text-sm text-slate-600 font-medium">Selected: {file.name}</p>}
            </div>
          </div>
        )}

        {status === 'uploading' || status === 'scanning' ? (
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            <p className="text-indigo-600 font-medium animate-pulse">Processing file and scanning for PII...</p>
          </div>
        ) : null}

        {status === 'success' ? (
          <div className="flex flex-col items-center gap-4 text-green-600">
            <div className="p-3 bg-green-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-bold text-lg">Scan Complete!</p>
            <p className="text-sm">Redirecting to dashboard...</p>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="flex flex-col items-center gap-4 text-red-600">
            <div className="p-3 bg-red-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="font-bold text-lg">Scan Failed</p>
            <p className="text-sm text-red-500">{errorMessage}</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-2 text-xs underline font-medium hover:text-red-700"
            >
              Try again
            </button>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleUpload} className="mt-8 flex justify-center">
        <button
          type="submit"
          disabled={!file || status !== 'idle'}
          className="px-10 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
        >
          Start Analysis
        </button>
      </form>
    </div>
  );
}
