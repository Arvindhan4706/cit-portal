'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, ScanLine, Shield, CheckCircle, Terminal } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FacultyPortal() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (!token || !userStr) {
      router.push('/login/faculty');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'FACULTY' && user.role !== 'COORDINATOR') {
        router.push('/login/faculty');
      }
    } catch (e) {
      router.push('/login/faculty');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Heavy Glass Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />

      <nav className="max-w-6xl mx-auto flex items-center justify-between py-6 mb-8 border border-white/10 relative z-10 bg-white/[0.02] backdrop-blur-3xl px-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 font-black shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            F
          </div>
          <div>
            <div className="font-black tracking-tighter text-lg">Faculty Dashboard</div>
            <div className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">Student Verification</div>
          </div>
        </div>
        <button onClick={handleLogout} className="text-xs font-mono text-white/50 hover:text-red-400 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Logout
        </button>
      </nav>

      <main className="max-w-4xl mx-auto mt-20 space-y-10 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
          Authorize Academic Leave.
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
          Before permitting a student to leave the classroom for an event, scan their digital pass to verify its authenticity and confirm the event's current active status.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-12">
          <Link href="/faculty/scanner" className="group flex items-center justify-center gap-3 px-10 py-5 bg-white/[0.03] backdrop-blur-3xl border border-purple-500/30 hover:bg-purple-600/20 text-purple-400 rounded-3xl font-bold transition-all shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] w-full sm:w-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <ScanLine className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10 tracking-wide text-lg">Open QR Scanner</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-16 text-left">
          <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.04] transition-colors shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <Shield className="w-10 h-10 text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] relative z-10" />
            <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Verified Attendance</h3>
            <p className="text-white/50 leading-relaxed font-light relative z-10 text-lg">Scan students' digital passes to officially mark them as attending the event and excuse their absence from class.</p>
          </div>
          <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.04] transition-colors shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <CheckCircle className="w-10 h-10 text-purple-400 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] relative z-10" />
            <h3 className="text-2xl font-bold mb-3 text-white relative z-10">Secure QR Codes</h3>
            <p className="text-white/50 leading-relaxed font-light relative z-10 text-lg">Digital passes utilize rotating JWT tokens that expire every 30 seconds, entirely preventing the use of screenshots or forwarded passes.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
