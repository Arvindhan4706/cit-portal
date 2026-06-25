'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, KeyRound, Mail, UserCircle } from 'lucide-react';
import axios from 'axios';

type AuthFormProps = {
  role: 'STUDENT' | 'FACULTY' | 'COORDINATOR';
  onSuccess: (token: string, user: any) => void;
  title: string;
  subtitle: string;
};

export default function AuthForm({ role, onSuccess, title, subtitle }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('http://localhost:5001/api/auth/login', {
        email,
        password,
        expectedRole: role
      });
      onSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const themeMap = {
    STUDENT: {
      color: 'cyan',
      bgGrad: 'from-cyan-500/10',
      iconBg: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      iconShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      inputFocus: 'focus:ring-cyan-500/50 focus:border-cyan-500',
      btnBorder: 'border-cyan-500/50',
      btnBg: 'bg-cyan-600/30 hover:bg-cyan-500/50',
      btnShadow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      placeholder: 'rollno@citchennai.net'
    },
    FACULTY: {
      color: 'purple',
      bgGrad: 'from-purple-500/10',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      iconShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      inputFocus: 'focus:ring-purple-500/50 focus:border-purple-500',
      btnBorder: 'border-purple-500/50',
      btnBg: 'bg-purple-600/30 hover:bg-purple-500/50',
      btnShadow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      placeholder: 'faculty.name@citchennai.net'
    },
    COORDINATOR: {
      color: 'emerald',
      bgGrad: 'from-emerald-500/10',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      iconShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      inputFocus: 'focus:ring-emerald-500/50 focus:border-emerald-500',
      btnBorder: 'border-emerald-500/50',
      btnBg: 'bg-emerald-600/30 hover:bg-emerald-500/50',
      btnShadow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
      placeholder: 'club@citchennai.net'
    }
  };

  const theme = themeMap[role];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-[2rem] p-8 md:p-10 relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGrad} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`} />

      <div className="mb-10 text-center relative z-10">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
          className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 ${theme.iconShadow} backdrop-blur-md border`}
        >
          {role === 'STUDENT' ? <UserCircle className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
        </motion.div>
        <h2 className="text-3xl font-black tracking-tighter text-white mb-2">{title}</h2>
        <p className="text-white/50 font-light">{subtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-mono text-white/50 mb-2">Institutional Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-white/30" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 transition-all text-white font-mono placeholder:text-white/20 outline-none ${theme.inputFocus}`}
                placeholder={theme.placeholder}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-mono text-white/50 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-white/30" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`block w-full pl-11 pr-4 py-3.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl focus:ring-2 transition-all text-white font-mono placeholder:text-white/20 outline-none ${theme.inputFocus}`}
                placeholder="Enter your password"
              />
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-bold text-center backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`group relative w-full flex justify-center py-4 px-4 border text-sm font-bold rounded-xl text-white focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden backdrop-blur-md ${theme.btnBorder} ${theme.btnBg} ${theme.btnShadow}`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">
              Sign in to Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>
    </motion.div>
  );
}
