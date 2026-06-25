'use client';

import { useState, useEffect } from 'react';
import { Plus, UploadCloud, Users, Calendar, ScanLine, ArrowLeft, Terminal, Download, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NumberTicker } from '@/components/NumberTicker';

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
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-mono">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 relative overflow-hidden">
      
      <nav className="max-w-7xl mx-auto flex items-center justify-between py-6 mb-8 border-b border-slate-200 relative z-10">
        <div className="text-xl font-bold tracking-tight text-slate-900">Coordinator Dashboard</div>
        <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto relative z-10 space-y-8">
        
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-semibold mb-1">Total Events</p>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                {loading ? '-' : <NumberTicker value={analytics.totalEvents} />}
              </h3>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-semibold mb-1">Total Registrations</p>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">
                {loading ? '-' : <NumberTicker value={analytics.totalRegistrations} />}
              </h3>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm text-slate-500 font-semibold mb-1">Attendance Rate</p>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight flex items-baseline">
                {loading ? '-' : <NumberTicker value={analytics.attendanceRate} />}<span className="text-2xl">%</span>
              </h3>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-center gap-3">
              <Link href="/coordinator/scanner" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
                <ScanLine className="w-5 h-5" /> Quick Scan
              </Link>
              <Link href="/coordinator/import" className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                <UploadCloud className="w-5 h-5" /> Import Data
              </Link>
            </div>
          </div>
        )}

        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Create New Event</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <input required placeholder="Event Title" type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              <input required placeholder="Venue" type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              <input required type="datetime-local" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
              <input required placeholder="Capacity" type="number" value={newEvent.capacity} onChange={e => setNewEvent({...newEvent, capacity: parseInt(e.target.value)})} className="border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Create Event</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Cancel</button>
            </div>
          </form>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Manage Events</h2>
            <button onClick={() => setShowCreateForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Create Event
            </button>
          </div>
          
          <div className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No events found.</div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {event.venue}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900">{event.capacity}</div>
                      <div className="text-xs font-semibold text-slate-500 uppercase">Capacity</div>
                    </div>
                    <button onClick={() => downloadCSV(event.id, event.title)} className="p-3 bg-slate-100 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
