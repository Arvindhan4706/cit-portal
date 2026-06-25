'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AuthForm from '@/components/AuthForm';

export default function StudentLogin() {
  const router = useRouter();

  const handleSuccess = (token: string, user: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    router.push('/student');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center relative overflow-hidden selection:bg-cyan-500/30">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-cyan-900/20 to-transparent pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-cyan-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20" />

      <div className="relative z-10 flex flex-col items-center px-4">
        <Link href="/" className="mb-8 flex items-center gap-2 text-sm font-mono text-white/50 hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Link>
        
        <AuthForm 
          role="STUDENT"
          title="Student Login"
          subtitle="Log in with your college account."
          onSuccess={handleSuccess}
        />
        
        <div className="mt-8 text-center text-sm font-mono text-white/30">
          Having trouble? <a href="#" className="font-bold text-cyan-400 hover:text-cyan-300">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
