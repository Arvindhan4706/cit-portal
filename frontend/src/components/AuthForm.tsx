'use client';

import { useState } from 'react';
import { ArrowRight, Loader2, KeyRound, UserCircle } from 'lucide-react';
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
    
    if (!email.endsWith('@citchennai.net')) {
      setError('Please use your institutional email (@citchennai.net).');
      setLoading(false);
      return;
    }

    if (password.length > 50) {
      setError('Password is too long.');
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password,
        expectedRole: role
      });
      onSuccess(res.data.token, res.data.user);
    } catch (err: any) {
      let errorMessage = 'Authentication failed. Please check your credentials.';
      if (err.response?.status === 401 || err.response?.status === 403 || err.response?.status === 404) {
        errorMessage = 'Invalid email or password.';
      } else if (err.response?.status === 429) {
        errorMessage = 'Too many login attempts. Please try again later.';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const themeMap = {
    STUDENT: {
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      iconBg: 'bg-blue-100 text-blue-600',
      placeholder: 'rollno@citchennai.net',
      focusRing: 'focus:border-blue-500'
    },
    FACULTY: {
      btnBg: 'bg-slate-800 hover:bg-slate-900',
      iconBg: 'bg-slate-100 text-slate-800',
      placeholder: 'faculty.name@citchennai.net',
      focusRing: 'focus:border-slate-800'
    },
    COORDINATOR: {
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      iconBg: 'bg-emerald-100 text-emerald-600',
      placeholder: 'club@citchennai.net',
      focusRing: 'focus:border-emerald-500'
    }
  };

  const theme = themeMap[role];
  
  return (
    <div className="w-full max-w-md bg-white border border-slate-200 shadow-sm rounded-2xl p-8 md:p-10 relative">
      <div className="mb-10 text-center">
        <div className={`w-16 h-16 ${theme.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          {role === 'STUDENT' ? <UserCircle className="w-8 h-8" /> : <KeyRound className="w-8 h-8" />}
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
          {title}
        </h2>
        <p className="text-slate-500 text-sm">
          {subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Institutional Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
            placeholder={theme.placeholder}
            className={`w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none transition-colors ${theme.focusRing}`}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none transition-colors ${theme.focusRing}`}
          />
          <div className="text-right mt-2">
            <a href="/forgot-password" className="text-xs text-blue-600 font-semibold hover:underline">
              Forgot Password?
            </a>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-xl text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3.5 ${theme.btnBg} text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2 mt-4`}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
