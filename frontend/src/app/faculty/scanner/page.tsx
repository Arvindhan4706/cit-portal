'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import axios from 'axios';

type ScanResult = {
  valid: boolean;
  student: { name: string; roll_no: string; department: string };
  event: { title: string; date: string; venue: string };
  status: string;
};

export default function FacultyScanner() {
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/faculty');
    }
  }, [router]);

  const handleScan = async (decodedText: string) => {
    if (loading || result) return;
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('token');
    
    try {
      const res = await axios.post('/api/attendance/verify', {
        qrToken: decodedText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify QR Code. It might be expired.');
      // Error haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 relative">
      <nav className="max-w-md mx-auto flex items-center justify-between py-6 mb-8 border-b border-slate-200">
        <Link href="/faculty" className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 font-semibold text-sm bg-white px-4 py-2 border border-slate-200 rounded-lg shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Exit Scanner
        </Link>
        <div className="font-bold text-slate-900 text-sm tracking-wide uppercase">Classroom Scanner</div>
      </nav>

      <main className="max-w-md mx-auto space-y-8">
        {!result && !error && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Verify Digital Pass</h2>
              <p className="text-slate-500 mt-2 text-sm">Scan to authorize student to leave class.</p>
            </div>
            <div className="bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
              <QRScanner onScanSuccess={handleScan} />
            </div>
            {loading && <p className="text-center text-blue-600 font-semibold text-sm flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Verifying...</p>}
          </div>
        )}

        {result && (
          <div className="p-8 rounded-2xl bg-white border border-blue-200 shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />
            <CheckCircle2 className="w-16 h-16 text-blue-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Pass Verified</h2>
              <p className="text-blue-600 font-semibold mt-1 text-sm">Authorized for Leave</p>
            </div>
            <div className="space-y-4 text-left bg-slate-50 border border-slate-200 p-6 rounded-xl text-sm">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-xs mb-1">Student Details</p>
                <p className="text-lg font-bold text-slate-900">{result.student.name}</p>
                <p className="text-slate-600">{result.student.roll_no} • {result.student.department}</p>
              </div>
              <div className="h-px bg-slate-200 w-full" />
              <div>
                <p className="text-slate-400 font-semibold uppercase text-xs mb-1">Registered Event</p>
                <p className="font-bold text-blue-700">{result.event.title}</p>
                <p className="text-slate-600">Venue: {result.event.venue}</p>
              </div>
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="w-full py-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 rounded-xl font-bold transition-colors"
            >
              Scan Next Pass
            </button>
          </div>
        )}

        {error && (
          <div className="p-8 rounded-2xl bg-white border border-red-200 shadow-sm text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
              <p className="text-red-600 font-semibold mt-2 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="w-full py-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl font-bold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
