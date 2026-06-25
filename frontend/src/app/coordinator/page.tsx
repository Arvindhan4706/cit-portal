'use client';

import { useState, useEffect } from 'react';
import { Plus, UploadCloud, Users, Calendar, ScanLine, ArrowLeft, Terminal, Download, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CoordinatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New event form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', venue: '', date: '', capacity: 100 });

  useEffect(() => {
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/faculty');
      return;
    }

    try {
      const resEvents = await axios.get('/api/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(resEvents.data);

      // Fetch Analytics
      try {
        const resAnalytics = await axios.get('/api/events/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnalytics(resAnalytics.data);
      } catch (e) {
        console.error("Failed to load analytics");
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
        router.push('/login/faculty');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.post('/api/events', {
        ...newEvent,
        description: 'New Event',
        clubId: null // We skip clubId for simplicity in this demo
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowCreateForm(false);
      setNewEvent({ title: '', venue: '', date: '', capacity: 100 });
      fetchEvents();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create event');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const downloadCSV = async (eventId: string, eventTitle: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`/api/events/${eventId}/attendance/csv`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download CSV. Maybe no attendance records exist yet.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-purple-400 font-mono">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Heavy Glass Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />

      <header className="max-w-6xl mx-auto flex items-center justify-between py-6 mb-8 border border-white/10 relative z-10 bg-white/[0.02] backdrop-blur-3xl px-8 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center text-purple-400 font-black shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            C
          </div>
          <div>
            <div className="font-black tracking-tighter text-lg">Coordinator Dashboard</div>
            <div className="text-[10px] text-purple-400 font-mono tracking-widest uppercase">Event Management</div>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/coordinator/scanner" className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-bold text-sm font-mono shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center gap-2">
            <ScanLine className="w-4 h-4" /> Open Scanner
          </Link>
          <Link href="/coordinator/import" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm font-mono transition-all border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)] flex items-center gap-2">
            <UploadCloud className="w-4 h-4" /> Upload Students
          </Link>
          <button onClick={handleLogout} className="px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-sm font-mono transition-all border border-red-500/30 backdrop-blur-md flex items-center gap-2 ml-2">
            <ArrowLeft className="w-4 h-4" /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Analytics Section */}
        {analytics && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Calendar className="w-16 h-16 text-cyan-400" /></div>
              <div className="text-xs font-mono text-white/50 mb-1">Total Events</div>
              <div className="text-3xl font-black text-white">{analytics.totalEvents}</div>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Users className="w-16 h-16 text-purple-400" /></div>
              <div className="text-xs font-mono text-white/50 mb-1">Total Students</div>
              <div className="text-3xl font-black text-white">{analytics.totalStudents}</div>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><Activity className="w-16 h-16 text-green-400" /></div>
              <div className="text-xs font-mono text-white/50 mb-1">Total Registrations</div>
              <div className="text-3xl font-black text-white">{analytics.totalRegistrations}</div>
            </div>
            <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity"><TrendingUp className="w-16 h-16 text-red-400" /></div>
              <div className="text-xs font-mono text-white/50 mb-1">Attendance Rate</div>
              <div className="text-3xl font-black text-white">{analytics.attendanceRate}%</div>
            </div>
          </motion.div>
        )}
        
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <button 
            onClick={() => setShowCreateForm(true)}
            className="p-8 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl hover:border-purple-500/50 hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-4 group shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_16px_rgba(168,85,247,0.2)] border border-purple-500/30 relative z-10">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-tight text-white/80 group-hover:text-white relative z-10">Create New Event</span>
          </button>

          <Link href="/coordinator/import" className="p-8 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl hover:border-cyan-500/50 hover:bg-white/[0.05] transition-all flex flex-col items-center justify-center gap-4 group shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_16px_rgba(6,182,212,0.2)] border border-cyan-500/30 relative z-10">
              <UploadCloud className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-tight text-white/80 group-hover:text-white relative z-10">Upload Registrations</span>
          </Link>

          <Link href="/coordinator/scanner" className="p-8 bg-gradient-to-br from-purple-600/20 to-cyan-600/20 backdrop-blur-2xl border border-purple-500/30 rounded-3xl hover:shadow-[0_0_40px_rgba(168,85,247,0.3)] transition-all flex flex-col items-center justify-center gap-4 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.1] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_4px_16px_rgba(255,255,255,0.2)] border border-white/20 relative z-10">
              <ScanLine className="w-6 h-6" />
            </div>
            <span className="font-bold tracking-tight text-white group-hover:text-cyan-200 relative z-10">Open QR Scanner</span>
          </Link>
        </div>

        {/* Create Event Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="bg-white/[0.03] backdrop-blur-3xl border border-purple-500/30 rounded-[2rem] p-10 space-y-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-purple-400 font-mono">Create New Event</h2>
              <button type="button" onClick={() => setShowCreateForm(false)} className="text-white/50 hover:text-white font-mono text-sm px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">Cancel</button>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-mono text-white/50">Event Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none text-white font-mono transition-colors" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-mono text-white/50">Venue</label>
                <input required type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none text-white font-mono transition-colors" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-mono text-white/50">Date & Time</label>
                <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none text-white font-mono transition-colors [color-scheme:dark]" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-mono text-white/50">Capacity</label>
                <input required type="number" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})} className="w-full bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3 focus:border-purple-500 outline-none text-white font-mono transition-colors" />
              </div>
            </div>
            <button type="submit" className="w-full py-4 bg-purple-600/30 border border-purple-500/50 hover:bg-purple-500/50 rounded-xl font-bold transition-all shadow-[0_4px_20px_rgba(168,85,247,0.3)] backdrop-blur-md text-white mt-6">Create Event</button>
          </form>
        )}

        {/* Managed Events List */}
        <div>
          <h2 className="text-lg font-bold text-white/80 border-b border-white/10 pb-4 mb-6 font-mono">Active Events</h2>
          <div className="space-y-4">
            {events.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-white/30 font-mono text-sm border border-white/10 rounded-3xl bg-white/[0.02] backdrop-blur-xl">No events active in the database.</motion.div>
            ) : (
              events.map((event, i) => (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col md:flex-row justify-between items-center bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-8 hover:bg-white/[0.04] transition-colors group shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <div className="mb-6 md:mb-0 w-full md:w-auto relative z-10">
                    <h3 className="text-2xl font-bold tracking-tight mb-2 text-white">{event.title}</h3>
                    <div className="flex gap-6 text-sm font-mono text-white/50">
                      <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-cyan-400" /> ID: {event.id.split('-')[0]}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-purple-400" /> {new Date(event.date).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end relative z-10">
                    <div className="text-center bg-black/30 border border-white/5 rounded-xl px-4 py-2">
                      <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest mb-1">Capacity</div>
                      <div className="font-bold flex items-center gap-2 justify-center text-white"><Users className="w-4 h-4 text-cyan-400" /> {event.capacity}</div>
                    </div>
                    <button onClick={() => downloadCSV(event.id, event.title)} className="px-4 py-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-bold text-sm font-mono transition-all border border-purple-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.1)] flex items-center gap-2">
                      <Download className="w-4 h-4" /> CSV
                    </button>
                    <Link href="/coordinator/import" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-cyan-400 font-bold text-sm font-mono transition-all border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                      Upload Students
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
