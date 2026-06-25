'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { RefreshCw, MapPin, Calendar, Clock, Ticket, AlertTriangle, ArrowLeft, Settings, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  // Profile Edit State
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editSaving, setEditSaving] = useState(false);

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
        setEditName(res.data.name || '');
        setEditDept(res.data.department || '');
        setEditYear(res.data.year?.toString() || '');
        
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditSaving(true);
    const token = localStorage.getItem('token');
    try {
      const res = await axios.put('/api/auth/me', {
        name: editName,
        department: editDept,
        year: editYear
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser((prev: any) => ({ ...prev, ...res.data }));
      setShowProfileEdit(false);
    } catch (err) {
      alert("Failed to update profile.");
    } finally {
      setEditSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12">
      <header className="mb-12 flex justify-between items-center max-w-5xl mx-auto bg-white px-8 py-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Logged in as {user?.name} ({user?.roll_no})</p>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => setShowProfileEdit(true)} className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-2 transition-colors">
            <Settings className="w-4 h-4" /> Edit Profile
          </button>
          <button onClick={handleLogout} className="text-xs font-semibold text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Logout
          </button>
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200">
            {user?.name?.[0] || 'S'}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
        
        {/* Left Column: My Events */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold border-b border-slate-200 pb-4 text-slate-800">Registered Events</h2>
          
          {user?.registrations?.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
              No active registrations found.
            </div>
          ) : (
            user?.registrations?.map((reg: any, i: number) => (
              <div 
                key={reg.id} 
                onClick={() => setSelectedEventId(reg.eventId)}
                className={`cursor-pointer p-6 rounded-2xl border transition-all duration-200 ${
                  selectedEventId === reg.eventId 
                    ? 'bg-blue-50 border-blue-300 shadow-md' 
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{reg.event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(reg.event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {reg.event.venue}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border-green-200' :
                    reg.status === 'PENDING' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    {reg.status}
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
              </div>
            ))
          )}
        </div>

        {/* Right Column: QR Code */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-10 flex flex-col items-center text-center shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight mb-2 text-slate-900">Your Event Pass</h3>
            <p className="text-sm text-slate-500 mb-10">Scan at venue for attendance</p>
            
            <div className="bg-white p-5 rounded-3xl mb-10 relative border border-slate-200 shadow-sm">
              {qrError ? (
                <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-red-600 p-4 border border-red-200 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-10 h-10 mb-2" />
                  <span className="font-bold text-sm">{qrError}</span>
                </div>
              ) : qrToken ? (
                <QRCode value={qrToken} size={200} />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                  Select an event
                </div>
              )}
            </div>
            
            {qrToken && !qrError && (
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-6 py-2.5 rounded-full">
                <RefreshCw className="w-4 h-4 animate-spin-slow" />
                Refreshes in {timeLeft}s
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showProfileEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full relative shadow-xl">
              <button onClick={() => setShowProfileEdit(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Profile</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name</label>
                  <input required type="text" value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Department</label>
                  <input required type="text" value={editDept} onChange={(e)=>setEditDept(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-colors uppercase" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-1 block">Year</label>
                  <input required type="number" min="1" max="5" value={editYear} onChange={(e)=>setEditYear(e.target.value)} className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 outline-none transition-colors" />
                </div>
                
                <button disabled={editSaving} type="submit" className="w-full py-3 mt-4 bg-blue-600 rounded-xl text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  {editSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
