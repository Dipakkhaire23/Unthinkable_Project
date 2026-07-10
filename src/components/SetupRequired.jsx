import React from 'react';
import { Database, Terminal, FileText, CheckCircle2 } from 'lucide-react';

export const SetupRequired = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
            <Database className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Supabase Setup Required</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            The application could not load your Supabase URL or Anon key. Follow the steps below to connect your backend.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Step-by-Step Setup Guide</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Environment Variables */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs">1</span>
                Configure `.env` File
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Create a file named <strong className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</strong> in the root folder and add the following keys:
              </p>
              <pre className="bg-slate-900 text-slate-200 text-[10px] p-3 rounded-lg font-mono overflow-x-auto shadow-inner leading-normal">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`}
              </pre>
            </div>

            {/* Step 2: Restart Server */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-xs">2</span>
                Restart Development Server
              </div>
              <p className="text-xs text-slate-550 leading-relaxed">
                Vite loads environment variables only on startup. If you created <strong className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</strong> while the server was running, you **MUST** restart it:
              </p>
              <div className="bg-slate-950 text-slate-200 text-[10px] p-3 rounded-lg font-mono flex items-center gap-2">
                <Terminal className="h-4.5 w-4.5 text-slate-400" />
                <span>Ctrl + C, then run `npm run dev`</span>
              </div>
              <p className="text-[10px] text-amber-600 font-semibold leading-normal">
                ⚠️ Without restarting, Vite will keep throwing a "supabaseUrl is required" error.
              </p>
            </div>
          </div>
        </div>

        {/* Database setup checklist */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/20 p-5 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">⚡ Database Initialization Reminders</h4>
          <ul className="text-xs text-slate-650 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Paste and execute the SQL script in <a href="file:///d:/Desktop/Unthinkable_Project/schema.sql" className="font-semibold text-primary-600 hover:underline">schema.sql</a> inside your Supabase SQL Editor.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Paste and execute the sample data in <a href="file:///d:/Desktop/Unthinkable_Project/seed.sql" className="font-semibold text-primary-600 hover:underline">seed.sql</a> to create the test accounts.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <span>Go to Storage, create a public bucket named <code className="font-semibold text-slate-700">complaints</code>.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SetupRequired;
