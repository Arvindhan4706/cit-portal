'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UploadCloud, FileType, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function ImportRegistrations() {
  const router = useRouter();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login/faculty');
    }
  }, [router]);
  const [file, setFile] = useState<File | null>(null);
  const [eventId, setEventId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; importedCount: number; totalProcessed: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !eventId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      // Simple regex to extract emails from CSV or text block
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const emails = text.match(emailRegex) || [];

      if (emails.length === 0) {
        throw new Error('No emails found in the uploaded file.');
      }

      const res = await axios.post(`/api/events/${eventId}/import`, {
        emails: Array.from(new Set(emails)) // Remove duplicates
      });

      setResult(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to import registrations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <header className="mb-12 flex justify-between items-center max-w-4xl mx-auto relative z-10 border-b border-white/5 pb-6">
        <div>
          <Link href="/coordinator" className="text-white/50 hover:text-cyan-400 transition-colors flex items-center gap-2 font-mono text-sm mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 tracking-tighter">
            Upload Registrations
          </h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto space-y-8 relative z-10">
        <div className="text-center">
          <p className="text-white/50 text-sm">Upload a list of participants. We will automatically find the email addresses and add them to your event.</p>
        </div>

        <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl p-8 space-y-8">
          <div className="space-y-3">
            <label className="block text-sm font-mono text-cyan-400">Event ID (Copy from Dashboard)</label>
            <input 
              type="text" 
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              placeholder="e.g., 550e8400-e29b-41d4-a716-446655440000"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-400 transition-colors font-mono text-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-mono text-cyan-400">Upload CSV or Text file</label>
            <div className="relative border-2 border-dashed border-white/20 hover:border-cyan-400/50 transition-colors rounded-2xl bg-black/30 flex flex-col items-center justify-center p-12 text-center group">
              <input 
                type="file" 
                accept=".csv,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-10 h-10 text-white/30 group-hover:text-cyan-400 transition-colors mb-4" />
              {file ? (
                <div>
                  <p className="font-bold text-cyan-400 flex items-center gap-2 justify-center"><FileType className="w-4 h-4"/> {file.name}</p>
                  <p className="text-xs text-white/50 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              ) : (
                 <div>
                  <p className="font-bold text-white/80">Click or drag file here</p>
                  <p className="text-xs text-white/40 mt-1">Accepts .csv or .txt files</p>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleUpload}
            disabled={!file || !eventId || loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Upload and Process'}
          </button>
        </div>

        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-start gap-4"
          >
            <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
            <div>
              <h3 className="font-bold text-green-400 text-lg">Upload Complete</h3>
              <p className="text-white/80 mt-1">{result.message}</p>
              <div className="mt-4 flex gap-4 text-sm font-mono">
                <span className="text-white/50">Found: {result.totalProcessed}</span>
                <span className="text-cyan-400">Imported: {result.importedCount}</span>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-4"
          >
            <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <h3 className="font-bold text-red-400 text-lg">Upload Failed</h3>
              <p className="text-white/80 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
