'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { RefreshCw, MapPin, Calendar, Clock, Ticket, AlertTriangle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Selected event for QR generation
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrError, setQrError] = useState<string | null>(null);

  // Fetch user data on load
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login/student');
        return;
      }

      try {
        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data);
        
        // Auto-select the first registered event if available
        if (res.data.registrations && res.data.registrations.length > 0) {
          setSelectedEventId(res.data.registrations[0].eventId);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem('token');
        router.push('/login/student');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch QR Token
  useEffect(() => {
    if (!selectedEventId) return;

    const fetchToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setQrError(null);
        const res = await axios.get(`/api/attendance/qr/${selectedEventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQrToken(res.data.qrToken);
        setTimeLeft(30);
      } catch (err: any) {
        setQrError(err.response?.data?.error || 'Failed to generate pass');
        setQrToken(null);
      }
    };

    fetchToken();
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchToken();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedEventId]);

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-cyan-400 font-mono">Loading...</div>;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Heavy Glass Glow Effects */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />

      <header className="mb-12 flex justify-between items-center max-w-5xl mx-auto relative z-10 bg-white/[0.02] backdrop-blur-3xl px-8 py-6 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10">
        <div>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter">My Dashboard</h1>
          <p className="text-white/50 font-mono text-sm mt-1">Logged in as {user?.name} ({user?.roll_no})</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={handleLogout} className="text-xs font-mono text-white/50 hover:text-cyan-400 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Logout
          </button>
          <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center font-bold text-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            {user?.name?.[0] || 'S'}
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
        
        {/* Left Column: My Events */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold border-b border-white/10 pb-4 text-cyan-400 font-mono">Registered Events</h2>
          
          {user?.registrations?.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/50 font-mono">
              No active registrations found.
            </div>
          ) : (
            user?.registrations?.map((reg: any, i: number) => (
              <motion.div 
                key={reg.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedEventId(reg.eventId)}
                className={`border rounded-3xl p-8 transition-all cursor-pointer relative overflow-hidden backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] ${
                  selectedEventId === reg.eventId 
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]' 
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-cyan-500/30'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">{reg.event.title}</h3>
                    <p className="text-cyan-400 font-medium mt-1 text-sm">{reg.event.venue}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    Registered
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-white/60 mb-6 font-mono">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-cyan-400" /> {new Date(reg.event.date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-purple-400" /> {new Date(reg.event.date).toLocaleTimeString()}</div>
                  <div className="col-span-2 flex items-center gap-2"><Ticket className="w-4 h-4" /> Pass ID: {reg.id.split('-')[0]}</div>
                </div>
                
                {selectedEventId !== reg.eventId && (
                  <button className="w-full py-3 rounded-xl bg-white/5 text-cyan-400 font-bold hover:bg-cyan-500/20 transition-all font-mono text-sm border border-cyan-500/20">
                    Show Pass
                  </button>
                )}
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Right Column: QR Code */}
        <div className="space-y-6">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-400 to-purple-500" />
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 pointer-events-none" />
            
            <h3 className="text-2xl font-black tracking-tighter mb-2 text-white relative z-10">Your Event Pass</h3>
            <p className="text-xs text-white/50 mb-10 font-mono relative z-10">Scan at venue for attendance</p>
            
            <div className="bg-white p-5 rounded-3xl mb-10 relative group overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.2)] z-10">
              {qrError ? (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-red-500 p-4 border border-red-500/30 bg-red-500/5 rounded-xl">
                  <AlertTriangle className="w-10 h-10 mb-2" />
                  <span className="font-bold text-sm">{qrError}</span>
                </div>
              ) : qrToken ? (
                <>
                  <QRCode value={qrToken} size={200} />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-400 opacity-50 shadow-[0_0_10px_rgba(6,182,212,1)] animate-[scan_3s_ease-in-out_infinite]" />
                </>
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400">
                  Select an event
                </div>
              )}
            </div>
            
            {qrToken && !qrError && (
              <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-6 py-2.5 rounded-full font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                Refreshes in {timeLeft}s
              </div>
            )}
          </div>
        </div>

      </main>
      
      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
      `}</style>
    </div>
  );
}
