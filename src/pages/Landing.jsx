import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, LogIn, UserPlus, Shield, Wrench, Megaphone, Clock, Camera, Palette } from 'lucide-react';

const themes = {
  ocean: {
    name: 'Ocean Breeze',
    colorClass: 'bg-sky-500',
    bgGradient1: 'from-primary-600/20 to-sky-500/10',
    bgGradient2: 'from-indigo-600/20 to-teal-500/10',
    titleGradient: 'from-primary-400 via-sky-400 to-indigo-400',
    badgeBorder: 'border-primary-500/30',
    badgeBg: 'bg-primary-500/10',
    badgeText: 'text-primary-300',
    logoBg: 'from-primary-500 to-sky-600',
    logoText: 'text-primary-400',
    card1Hover: 'hover:border-primary-500/50',
    card2Hover: 'hover:border-sky-500/50',
    card1Icon: 'bg-primary-500/10 text-primary-400',
    card2Icon: 'bg-sky-500/10 text-sky-400',
    card1Text: 'group-hover:text-primary-300',
    card2Text: 'group-hover:text-sky-300',
    card1Arrow: 'text-primary-400 group-hover:text-primary-300',
    card2Arrow: 'text-sky-400 group-hover:text-sky-300',
    highlight1: 'text-primary-400',
    highlight2: 'text-sky-400',
    highlight3: 'text-indigo-400',
    highlight4: 'text-teal-400'
  },
  sunset: {
    name: 'Sunset Glow',
    colorClass: 'bg-rose-500',
    bgGradient1: 'from-rose-600/20 to-amber-500/10',
    bgGradient2: 'from-orange-600/20 to-pink-500/10',
    titleGradient: 'from-rose-400 via-amber-400 to-orange-400',
    badgeBorder: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/10',
    badgeText: 'text-rose-300',
    logoBg: 'from-rose-500 to-amber-600',
    logoText: 'text-rose-400',
    card1Hover: 'hover:border-rose-500/50',
    card2Hover: 'hover:border-amber-500/50',
    card1Icon: 'bg-rose-500/10 text-rose-400',
    card2Icon: 'bg-amber-500/10 text-amber-400',
    card1Text: 'group-hover:text-rose-300',
    card2Text: 'group-hover:text-amber-300',
    card1Arrow: 'text-rose-400 group-hover:text-rose-300',
    card2Arrow: 'text-amber-400 group-hover:text-amber-300',
    highlight1: 'text-rose-400',
    highlight2: 'text-amber-400',
    highlight3: 'text-orange-400',
    highlight4: 'text-pink-400'
  },
  forest: {
    name: 'Forest Moss',
    colorClass: 'bg-emerald-500',
    bgGradient1: 'from-emerald-600/20 to-teal-500/10',
    bgGradient2: 'from-teal-600/20 to-lime-500/10',
    titleGradient: 'from-emerald-400 via-teal-400 to-lime-400',
    badgeBorder: 'border-emerald-500/30',
    badgeBg: 'bg-emerald-500/10',
    badgeText: 'text-emerald-300',
    logoBg: 'from-emerald-500 to-teal-600',
    logoText: 'text-emerald-400',
    card1Hover: 'hover:border-emerald-500/50',
    card2Hover: 'hover:border-teal-500/50',
    card1Icon: 'bg-emerald-500/10 text-emerald-400',
    card2Icon: 'bg-teal-500/10 text-teal-400',
    card1Text: 'group-hover:text-emerald-300',
    card2Text: 'group-hover:text-teal-300',
    card1Arrow: 'text-emerald-400 group-hover:text-emerald-300',
    card2Arrow: 'text-teal-400 group-hover:text-teal-300',
    highlight1: 'text-emerald-400',
    highlight2: 'text-teal-400',
    highlight3: 'text-lime-400',
    highlight4: 'text-green-400'
  },
  royal: {
    name: 'Royal Purple',
    colorClass: 'bg-violet-500',
    bgGradient1: 'from-violet-600/20 to-fuchsia-500/10',
    bgGradient2: 'from-fuchsia-600/20 to-indigo-500/10',
    titleGradient: 'from-violet-400 via-fuchsia-400 to-indigo-400',
    badgeBorder: 'border-violet-500/30',
    badgeBg: 'bg-violet-500/10',
    badgeText: 'text-violet-300',
    logoBg: 'from-violet-500 to-fuchsia-600',
    logoText: 'text-violet-400',
    card1Hover: 'hover:border-violet-500/50',
    card2Hover: 'hover:border-fuchsia-500/50',
    card1Icon: 'bg-violet-500/10 text-violet-400',
    card2Icon: 'bg-fuchsia-500/10 text-fuchsia-400',
    card1Text: 'group-hover:text-violet-300',
    card2Text: 'group-hover:text-fuchsia-300',
    card1Arrow: 'text-violet-400 group-hover:text-violet-300',
    card2Arrow: 'text-fuchsia-400 group-hover:text-fuchsia-300',
    highlight1: 'text-violet-400',
    highlight2: 'text-fuchsia-400',
    highlight3: 'text-indigo-400',
    highlight4: 'text-pink-400'
  }
};

export const Landing = () => {
  const navigate = useNavigate();
  const [themeKey, setThemeKey] = useState(() => {
    return localStorage.getItem('landing-theme') || 'ocean';
  });

  const activeTheme = themes[themeKey] || themes.ocean;

  const handleThemeChange = (key) => {
    setThemeKey(key);
    localStorage.setItem('landing-theme', key);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className={`absolute top-[-30%] left-[-20%] w-[90%] h-[90%] bg-gradient-to-br ${activeTheme.bgGradient1} rounded-full blur-[140px] pointer-events-none transition-all duration-700`} />
      <div className={`absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-gradient-to-tl ${activeTheme.bgGradient2} rounded-full blur-[140px] pointer-events-none transition-all duration-700`} />
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Header / Navbar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${activeTheme.logoBg} shadow-lg transition-all duration-500`}>
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-350 bg-clip-text text-transparent">
              SocietySync
            </h1>
            <p className={`text-[10px] ${activeTheme.logoText} font-bold uppercase tracking-wider transition-colors duration-500`}>Maintenance Tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Theme Selector */}
          <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-2.5 py-1.5 backdrop-blur-md">
            <Palette className="h-3.5 w-3.5 text-slate-400" />
            <div className="flex items-center gap-1.5">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => handleThemeChange(key)}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-300 focus:outline-none relative group/btn ${t.colorClass} ${
                    themeKey === key 
                      ? 'ring-2 ring-white scale-125 shadow-md shadow-white/10' 
                      : 'opacity-50 hover:opacity-100 hover:scale-110'
                  }`}
                >
                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-[9px] font-medium bg-slate-900 border border-slate-850 rounded text-slate-200 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-slate-350 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/register')}
              className="text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl px-4 py-2 text-white transition-all active:scale-95 shadow-sm"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & CTA section */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 max-w-6xl mx-auto w-full py-12 md:py-20 text-center space-y-12">
        <div className="space-y-6 max-w-3xl animate-fade-in">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 rounded-full border ${activeTheme.badgeBorder} ${activeTheme.badgeBg} px-3.5 py-1 text-xs font-semibold ${activeTheme.badgeText} backdrop-blur-md transition-all duration-500`}>
            <Shield className="h-3.5 w-3.5" />
            Empowering Modern Housing Societies
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            Simplify Your Housing <br className="hidden sm:inline"/>
            <span className={`bg-gradient-to-r ${activeTheme.titleGradient} bg-clip-text text-transparent transition-all duration-500`}>
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
            className={`group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 text-left ${activeTheme.card1Hover} hover:bg-slate-900/50 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeTheme.card1Icon} group-hover:scale-110 transition-transform duration-350`}>
                <LogIn className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-xl font-bold text-white ${activeTheme.card1Text} transition-colors duration-300`}>Login Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Access your existing account. Log in as a Resident or Admin to manage tickets, notices, and settings.
                </p>
              </div>
            </div>
            <div className={`mt-8 flex items-center gap-2 text-xs font-semibold ${activeTheme.card1Arrow} transition-colors duration-300`}>
              Go to Login <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </div>
          </div>

          {/* Option 2: Register Portal */}
          <div 
            onClick={() => navigate('/register')}
            className={`group relative rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 text-left ${activeTheme.card2Hover} hover:bg-slate-900/50 transition-all duration-300 cursor-pointer shadow-lg backdrop-blur-md flex flex-col justify-between`}
          >
            <div className="space-y-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${activeTheme.card2Icon} group-hover:scale-110 transition-transform duration-350`}>
                <UserPlus className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className={`text-xl font-bold text-white ${activeTheme.card2Text} transition-colors duration-300`}>Register Resident</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Create a new resident profile. Register with your flat number, contact, and email to raise maintenance requests.
                </p>
              </div>
            </div>
            <div className={`mt-8 flex items-center gap-2 text-xs font-semibold ${activeTheme.card2Arrow} transition-colors duration-300`}>
              Go to Signup <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>

        {/* Highlight Cards Grid */}
        <div className="pt-10 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2 hover:border-slate-800 transition-all duration-300">
              <Wrench className={`h-5 w-5 ${activeTheme.highlight1} transition-colors duration-500`} />
              <h4 className="text-xs font-bold text-slate-200">Easy Ticketing</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Submit complaints under categorized channels instantly.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2 hover:border-slate-800 transition-all duration-300">
              <Camera className={`h-5 w-5 ${activeTheme.highlight2} transition-colors duration-500`} />
              <h4 className="text-xs font-bold text-slate-200">Photo Attachments</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Provide visual descriptions for faster maintenance diagnosis.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2 hover:border-slate-800 transition-all duration-300">
              <Clock className={`h-5 w-5 ${activeTheme.highlight3} transition-colors duration-500`} />
              <h4 className="text-xs font-bold text-slate-200">SLA Tracking</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Dynamic overdue flagging highlights stale tickets in red.</p>
            </div>
            <div className="border border-slate-900 bg-slate-950/40 p-4.5 rounded-xl space-y-2 hover:border-slate-800 transition-all duration-300">
              <Megaphone className={`h-5 w-5 ${activeTheme.highlight4} transition-colors duration-500`} />
              <h4 className="text-xs font-bold text-slate-200">Announcements</h4>
              <p className="text-[10px] text-slate-450 leading-relaxed">Keep up with pinned notices and automatic email alerts.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <span>© {new Date().getFullYear()} SocietySync Maintenance Portal. All rights reserved. | Developed by Dipak Khaire</span>
        <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-slate-650" /> Secure Supabase Infrastructure</span>
      </footer>
    </div>
  );
};

export default Landing;
