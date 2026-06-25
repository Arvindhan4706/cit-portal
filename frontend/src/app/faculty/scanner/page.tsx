'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Terminal } from 'lucide-react';
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
      // Haptic feedback (Vibrate for 100ms)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify QR Code. It might be expired.');
      // Error haptic feedback (Vibrate twice quickly)
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/10 blur-[120px] pointer-events-none" />

      <nav className="max-w-md mx-auto flex items-center justify-between py-6 mb-8 border-b border-white/5 relative z-10">
        <Link href="/faculty" className="text-white/50 hover:text-sky-400 transition-colors flex items-center gap-2 font-mono text-sm bg-white/5 px-4 py-2 border border-white/10 rounded-md">
          <ArrowLeft className="w-4 h-4" /> Exit Scanner
        </Link>
        <div className="font-bold text-sky-400 text-sm font-mono tracking-widest uppercase">Classroom Scanner</div>
      </nav>

      <main className="max-w-md mx-auto space-y-8 relative z-10">
        {!result && !error && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">Verify Digital Pass</h2>
              <p className="text-white/50 mt-2 font-mono text-sm">Scan to authorize student to leave class.</p>
            </div>
            <div className="bg-black border border-sky-500/30 p-2 rounded-xl shadow-[0_0_30px_rgba(14,165,233,0.1)]">
              <QRScanner onScanSuccess={handleScan} />
            </div>
            {loading && <p className="text-center text-sky-400 animate-pulse font-mono text-sm flex items-center justify-center gap-2"><Terminal className="w-4 h-4"/> Verifying...</p>}
          </div>
        )}

        {result && (
          <div className="p-8 rounded-2xl bg-white/5 border border-sky-500/30 shadow-[0_0_40px_rgba(14,165,233,0.15)] text-center space-y-6 backdrop-blur-xl">
            <CheckCircle2 className="w-16 h-16 text-sky-400 mx-auto drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
            <div>
              <h2 className="text-2xl font-black text-white">Pass Verified</h2>
              <p className="text-sky-400 font-bold mt-1 font-mono text-sm">Authorized for Leave</p>
            </div>
            <div className="space-y-4 text-left bg-black/50 border border-white/10 p-6 rounded-xl font-mono text-sm">
              <div>
                <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Student Details</p>
                <p className="text-lg font-bold text-white">{result.student.name}</p>
                <p className="text-blue-400">{result.student.roll_no} • {result.student.department}</p>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div>
                <p className="text-white/40 uppercase tracking-widest text-[10px] mb-1">Registered Event</p>
                <p className="font-bold text-sky-400">{result.event.title}</p>
                <p className="text-white/60">Venue: {result.event.venue}</p>
              </div>
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="w-full py-4 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-400 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(14,165,233,0.2)]"
            >
              Scan Next Pass
            </button>
          </div>
        )}

        {error && (
          <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.1)] text-center space-y-6 backdrop-blur-xl">
            <XCircle className="w-16 h-16 text-red-400 mx-auto drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
            <div>
              <h2 className="text-2xl font-black text-white">Verification Failed</h2>
              <p className="text-red-400 font-bold mt-2 font-mono text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
