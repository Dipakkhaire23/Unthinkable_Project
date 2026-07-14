import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, UserPlus, Shield, Wrench, Megaphone, Clock, Camera } from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-30%] left-[-20%] w-[90%] h-[90%] bg-gradient-to-br from-primary-600/20 to-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-tl from-indigo-600/20 to-teal-500/10 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-sky-600 shadow-lg shadow-primary-500/20">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              SocietySync
            </h1>
            <p className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">Maintenance Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/register')}
            className="text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2 text-white transition-all active:scale-95"
          >
            Register
          </button>
        </div>
      </header>

      {/* Main Hero & CTA section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 max-w-6xl mx-auto w-full py-12 md:py-20 text-center space-y-12">
        <div className="space-y-6 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1 text-xs font-semibold text-primary-300 backdrop-blur-md">
            <Shield className="h-3.5 w-3.5" />
            Empowering Modern Housing Societies
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Simplify Your Housing <br className="hidden sm:inline"/>
            <span className="bg-gradient-to-r from-primary-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Maintenance Management
            </span>
          </h2>
          
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            An all-in-one digital portal designed for residents to report complaints, upload visual evidence, and track status histories, while enabling admins to resolve tickets efficiently.
          </p>
        </div>

        {/* CTA Login / Register Selection Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Option 1: Login Portal */}
          <div 
            onClick={() => navigate('/login')}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-left hover:border-primary-500/50 hover:bg-slate-900/70 transition-all cursor-pointer shadow-lg backdrop-blur-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 group-hover:scale-110 transition-transform">
                <LogIn className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">Login Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access your existing account. Log in as a Resident or Admin to manage tickets, notices, and settings.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-primary-400 group-hover:text-primary-300">
              Go to Login <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          {/* Option 2: Register Portal */}
          <div 
            onClick={() => navigate('/register')}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-left hover:border-sky-500/50 hover:bg-slate-900/70 transition-all cursor-pointer shadow-lg backdrop-blur-lg flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">Register Resident</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Create a new resident profile. Register with your flat number, contact, and email to raise maintenance requests.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-sky-400 group-hover:text-sky-300">
              Go to Signup <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>

        {/* Highlight Cards Grid */}
        <div className="pt-10 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2">
              <Wrench className="h-5 w-5 text-primary-400" />
              <h4 className="text-xs font-bold text-slate-200">Easy Ticketing</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Submit complaints under categorized channels instantly.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2">
              <Camera className="h-5 w-5 text-sky-400" />
              <h4 className="text-xs font-bold text-slate-200">Photo Attachments</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Provide visual descriptions for faster maintenance diagnosis.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2">
              <Clock className="h-5 w-5 text-indigo-400" />
              <h4 className="text-xs font-bold text-slate-200">SLA Tracking</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Dynamic overdue flagging highlights stale tickets in red.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2">
              <Megaphone className="h-5 w-5 text-teal-400" />
              <h4 className="text-xs font-bold text-slate-200">Announcements</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Keep up with pinned notices and automatic email alerts.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} SocietySync Maintenance Portal. All rights reserved.</span>
        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-slate-650" /> Secure Supabase Infrastructure</span>
      </footer>
    </div>
  );
};

export default Landing;
