'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import QRScanner from '@/components/QRScanner';
import axios from 'axios';

type ScanResult = {
  message: string;
  attendance: any;
};

export default function CoordinatorScanner() {
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
      const res = await axios.post('/api/attendance/scan', {
        qrToken: decodedText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify QR Code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />

      <nav className="max-w-md mx-auto flex items-center justify-between py-6 mb-8 border-b border-white/5 relative z-10">
        <Link href="/coordinator" className="text-white/50 hover:text-cyan-400 transition-colors flex items-center gap-2 font-mono text-sm bg-white/5 px-4 py-2 border border-white/10 rounded-md">
          <ArrowLeft className="w-4 h-4" /> Exit Scanner
        </Link>
        <div className="font-bold text-cyan-400 text-sm font-mono tracking-widest uppercase">Venue Scanner</div>
      </nav>

      <main className="max-w-md mx-auto space-y-8 relative z-10">
        {!result && !error && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">Scan Digital Pass</h2>
              <p className="text-white/50 mt-2 font-mono text-sm">Verify attendance & auto-generate OD.</p>
            </div>
            <div className="bg-black border border-cyan-500/30 p-2 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.1)]">
              <QRScanner onScanSuccess={handleScan} />
            </div>
            {loading && <p className="text-center text-cyan-400 animate-pulse font-mono text-sm flex items-center justify-center gap-2"><Terminal className="w-4 h-4"/> Verifying...</p>}
          </div>
        )}

        {result && (
          <div className="p-8 rounded-2xl bg-green-500/10 border border-green-500/30 shadow-[0_0_40px_rgba(34,197,94,0.1)] text-center space-y-6 backdrop-blur-xl">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
            <div>
              <h2 className="text-2xl font-black text-white">Attendance Logged</h2>
              <p className="text-green-400 font-bold mt-1 font-mono text-sm">{result.message}</p>
            </div>
            <button 
              onClick={() => setResult(null)} 
              className="w-full py-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
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
