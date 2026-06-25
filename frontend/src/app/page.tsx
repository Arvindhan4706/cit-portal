'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, QrCode, ShieldCheck, Zap, Terminal } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'STUDENT') router.push('/student');
        else if (user.role === 'COORDINATOR') router.push('/coordinator');
        else router.push('/faculty');
      } catch (e) {}
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden relative font-sans">
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-6 border-b border-slate-200 relative z-10 px-8 mt-4 bg-white shadow-sm rounded-xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
            C
          </div>
          <div className="text-xl font-bold tracking-tight text-slate-900">
            CIT PASS
            <span className="block text-xs text-slate-500 mt-0.5">Verification Portal</span>
          </div>
        </div>
        <div className="hidden sm:flex space-x-4 items-center">
          <Link href="/login/faculty" className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-sm font-semibold border border-transparent hover:border-slate-200">
            Faculty Login
          </Link>
          <Link href="/login/coordinator" className="px-5 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-all text-sm font-semibold border border-transparent hover:border-slate-200">
            Coordinator Login
          </Link>
          <Link href="/login/student" className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-sm font-semibold shadow-sm">
            Student Login
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-2xl space-y-8 p-10 bg-white border border-slate-200 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="inline-flex items-center space-x-2 bg-slate-100 border border-slate-200 rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">CIT Online Portal</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-slate-900">
              Event Registration & <br/>
              <span className="text-blue-600">Digital Passes.</span>
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              The official portal for CIT events. Clubs upload their registered students, and we automatically generate secure digital entry passes for valid attendees.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <Link href="/login/student" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-sm">
                Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/coordinator/import" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
                <Terminal className="w-5 h-5 text-slate-400 group-hover:text-slate-600 transition-colors" /> Upload Registrations
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Dynamic QR</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Passes generate rolling OTPs cryptographically bound to the student ID, preventing screenshot sharing.</p>
              </div>
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">OD Integration</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Scanned passes are instantly logged. Faculty dashboard auto-compiles verified OD (On-Duty) lists.</p>
              </div>
            </div>
            
            <div className="space-y-6 sm:mt-12">
              <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Rapid Scan</h3>
                <p className="text-slate-600 text-sm leading-relaxed">Coordinators can scan passes in milliseconds using our specialized hardware-accelerated scanner view.</p>
              </div>
              
              <div className="bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col justify-center border border-slate-800">
                <div className="text-sm font-mono text-slate-400 mb-2">System Status</div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-white font-bold tracking-tight">Fully Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
