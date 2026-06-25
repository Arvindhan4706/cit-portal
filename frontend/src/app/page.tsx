'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, QrCode, ShieldCheck, Zap, Terminal } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'STUDENT') router.push('/student');
        else if (user.role === 'COORDINATOR') router.push('/coordinator');
        else router.push('/faculty');
      } catch (e) {}
    }
  }, [router]);
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-950 via-slate-900 to-slate-950 text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Heavy Glass Glow Elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-sky-600/20 blur-[150px] pointer-events-none" />

      <nav className="max-w-7xl mx-auto flex items-center justify-between py-6 border border-white/10 relative z-10 bg-white/[0.02] backdrop-blur-3xl px-8 mt-4 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center text-blue-400 font-black text-xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
            C
          </div>
          <div className="text-xl font-black tracking-tighter text-white">
            CIT PASS
            <span className="block text-[10px] text-blue-400 font-mono tracking-widest uppercase mt-0.5">Verification Portal</span>
          </div>
        </div>
        <div className="hidden sm:flex space-x-4 items-center">
          <Link href="/login/faculty" className="px-5 py-2.5 rounded-xl bg-sky-500/10 backdrop-blur-md border border-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white hover:shadow-[0_0_20px_rgba(14,165,233,0.4)] transition-all text-sm font-bold tracking-wide">
            Faculty Login
          </Link>
          <Link href="/login/coordinator" className="px-5 py-2.5 rounded-xl bg-emerald-500/10 backdrop-blur-md border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all text-sm font-bold tracking-wide">
            Coordinator Login
          </Link>
          <Link href="/login/student" className="px-5 py-2.5 rounded-xl bg-blue-500/10 backdrop-blur-md border border-blue-500/20 text-blue-400 hover:bg-blue-400 hover:text-black hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all text-sm font-bold tracking-wide">
            Student Login
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-8 p-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.2)] rounded-full px-4 py-1.5 backdrop-blur-md relative z-10">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-mono text-white/80 tracking-widest uppercase">CIT Online Portal</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black tracking-tighter leading-[1.0] text-white relative z-10">
              Event Registration & <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-500">
                Digital Passes.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg text-white/60 leading-relaxed font-light relative z-10">
              The official portal for CIT events. Clubs upload their registered students, and we automatically generate secure digital entry passes for valid attendees.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-6 relative z-10">
              <Link href="/login/student" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500/80 to-blue-600/80 backdrop-blur-xl text-white rounded-xl font-bold hover:scale-105 transition-all shadow-[0_0_30px_rgba(59,130,246,0.4)] border border-blue-400/50">
                Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/coordinator/import" className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 glass-panel text-white rounded-xl font-bold hover:bg-white/10 transition-all">
                <Terminal className="w-5 h-5 text-white/40 group-hover:text-blue-400 transition-colors" /> Upload Registrations
              </Link>
            </motion.div>
          </motion.div>

          {/* Glass Mockup Graphic */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-sky-500/20 blur-3xl rounded-full" />
            <div className="relative w-full max-w-sm mx-auto h-[500px] bg-white/[0.03] backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] p-6 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-400 to-sky-500" />
              <div className="w-full h-full border border-white/10 rounded-3xl p-6 flex flex-col relative">

                <div className="space-y-4 mb-8">
                  <div className="h-4 w-32 bg-white/10 rounded-full" />
                  <div className="h-8 w-48 bg-white/20 rounded-full" />
                </div>
                <div className="flex-grow flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full" />
                  <div className="w-48 h-48 bg-white p-4 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.2)] relative z-10 flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-black" />
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400 opacity-50 shadow-[0_0_10px_rgba(59,130,246,1)] animate-[scan_3s_ease-in-out_infinite]" />
                  </div>
                </div>
                <div className="mt-8 h-12 w-full bg-white/5 rounded-xl border border-white/10 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-mono text-white/50">Pass Active</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid md:grid-cols-3 gap-6 mt-32"
        >
          <FeatureCard 
            variants={itemVariants}
            icon={<Zap className="w-6 h-6 text-blue-400" />}
            title="External Sync"
            desc="Clubs can use their own Google Forms. Just upload the list of emails, and the portal will process it instantly."
          />
          <FeatureCard 
            variants={itemVariants}
            icon={<QrCode className="w-6 h-6 text-sky-400" />}
            title="Secure Event Passes"
            desc="Generated QR codes strictly expire after the event's end date. Old passes cannot be reused."
          />
          <FeatureCard 
            variants={itemVariants}
            icon={<ShieldCheck className="w-6 h-6 text-blue-400" />}
            title="Verified Attendance"
            desc="Faculty check the pass in class. Event coordinators scan it at the venue. This ensures 100% accurate attendance."
          />
        </motion.div>
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

function FeatureCard({ icon, title, desc, variants }: { icon: React.ReactNode, title: string, desc: string, variants: any }) {
  return (
    <motion.div variants={variants} className="group p-8 rounded-3xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl hover:bg-white/[0.04] transition-colors relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_4px_16px_rgba(0,0,0,0.2)] backdrop-blur-md relative z-10">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white relative z-10">{title}</h3>
      <p className="text-white/50 leading-relaxed font-light relative z-10">{desc}</p>
    </motion.div>
  );
}
