'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, ShieldAlert, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative font-sans">
      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500" />
          
          <div className="text-center mb-8 pt-4">
            <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Recover Access</h1>
            <p className="text-slate-500 text-sm mt-2">Verify your identity to reset your password securely.</p>
          </div>

          {success ? (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <div className="text-xl font-bold text-slate-900">Password Reset!</div>
              <p className="text-slate-500 text-sm">Redirecting you to login...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">ACCOUNT TYPE</label>
                <div className="grid grid-cols-3 gap-2">
                  {['STUDENT', 'FACULTY', 'COORDINATOR'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r as any)}
                      className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                        role === r 
                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value.toLowerCase())}
                  placeholder="name@citchennai.net"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {role === 'STUDENT' ? 'Roll Number' : role === 'FACULTY' ? 'Faculty ID' : 'Club Registration No'}
                </label>
                <input
                  required
                  type="text"
                  value={securityVerification}
                  onChange={e => setSecurityVerification(e.target.value)}
                  placeholder="Security Verification"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-blue-500 transition-colors"
                />
                <p className="text-[10px] text-slate-400 mt-1 font-semibold">Must be at least 8 characters long.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2 mt-4 shadow-sm"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
