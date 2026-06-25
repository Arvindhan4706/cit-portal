'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, KeyRound, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | 'COORDINATOR'>('STUDENT');
  const [email, setEmail] = useState('');
  const [securityVerification, setSecurityVerification] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email.endsWith('@citchennai.net')) {
      setError('Please use your institutional email (@citchennai.net).');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/auth/reset-password', {
        email,
        role,
        securityVerification,
        newPassword
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/login/${role.toLowerCase()}`);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password reset failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#050505] to-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white font-mono text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2rem] p-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black text-white">Recover Access</h1>
            <p className="text-white/50 text-sm mt-2">Verify your identity to reset your password securely.</p>
          </div>

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto" />
              <div className="text-xl font-bold text-white">Password Reset!</div>
              <p className="text-white/50 text-sm">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50">ACCOUNT TYPE</label>
                <div className="grid grid-cols-3 gap-2">
                  {['STUDENT', 'FACULTY', 'COORDINATOR'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r as any)}
                      className={`py-2 text-[10px] font-bold font-mono rounded-lg border transition-all ${
                        role === r 
                        ? 'bg-white/20 border-white/40 text-white' 
                        : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50">INSTITUTION EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:border-red-500 outline-none font-mono text-sm transition-colors"
                    placeholder="name@citchennai.net"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50">
                  {role === 'STUDENT' ? 'ROLL NUMBER (SECURITY CHECK)' : 'DEPARTMENT (SECURITY CHECK)'}
                </label>
                <input
                  required type="text" value={securityVerification} onChange={(e) => setSecurityVerification(e.target.value.toUpperCase())}
                  className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/20 focus:border-red-500 outline-none font-mono text-sm transition-colors uppercase"
                  placeholder={role === 'STUDENT' ? 'e.g. 21IT001' : 'e.g. CSE'}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-white/50">NEW PASSWORD</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-white/20 focus:border-red-500 outline-none font-mono text-sm transition-colors"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-mono text-center">
                  {error}
                </motion.div>
              )}

              <button
                disabled={loading} type="submit"
                className="w-full py-4 mt-2 bg-white text-black font-bold font-mono rounded-xl hover:bg-red-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'SECURE RESET'}
              </button>

            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
