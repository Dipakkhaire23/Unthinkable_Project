import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Building2, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const userProfile = await login(formData.email, formData.password);
      
      // Role-based routing as per requirement
      if (userProfile.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/resident');
      }
    } catch (err) {
      console.error(err);
      setErrors({ api: err.message || 'Login failed. Please verify credentials.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Split Layout Container */}
      <div className="flex w-full flex-col lg:flex-row">
        
        {/* Left Side: Branding and info (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-tr from-sky-950 via-primary-950 to-sky-900 text-white p-16 flex-col justify-between">
          {/* Subtle decorative glow circles */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-400/10 rounded-full blur-3xl" />

          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 relative z-10">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-sky-600 text-white shadow-lg shadow-primary-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Society Maintenance</h1>
              <p className="text-[10px] text-primary-300 font-semibold tracking-wider uppercase">Resident & Admin Portal</p>
            </div>
          </div>

          {/* Core Banner / Call to Action */}
          <div className="my-auto space-y-6 relative z-10 max-w-lg">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-primary-200 bg-clip-text text-transparent">
              Manage your residential maintenance queries in one place.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Log in to file maintenance complaints, view notice board updates, track resolution history, and get in touch with administration.
            </p>

            {/* List of Features */}
            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Track In Real-Time</h4>
                  <p className="text-xs text-slate-400">File complaints with photos and track progress updates from admins.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Notice Board Announcements</h4>
                  <p className="text-xs text-slate-400">Stay informed with society announcements, pinned notices, and instant updates.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Secure Communication</h4>
                  <p className="text-xs text-slate-400">Bypasses public access controls; your private data is encrypted and secure.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 flex justify-between text-xs text-primary-300 border-t border-white/10 pt-4">
            <span>© {new Date().getFullYear()} Society Maintenance Portal</span>
            <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Secure SSL Connection</span>
          </div>
        </div>

        {/* Right Side: Form area */}
        <div className="flex w-full lg:w-1/2 items-center justify-center p-8 sm:p-12 md:p-16 bg-slate-50">
          <div className="w-full max-w-md space-y-8">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <div className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Sign In
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Welcome back! Enter your credentials to access the portal.
              </p>
            </div>

            {/* Error notifications */}
            {errors.api && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-rose-800 animate-fade-in flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                {errors.api}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border py-3 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="name@society.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-600 font-semibold">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border py-3 pl-11 pr-11 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-600 font-semibold">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-sky-800 focus:outline-hidden focus:ring-4 focus:ring-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              >
                {loading ? 'Verifying Account...' : (
                  <>
                    Sign In <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Registration link */}
            <div className="text-center text-sm text-slate-500 pt-6 border-t border-slate-200">
              Don't have a resident account?{' '}
              <Link
                to="/register"
                className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Register Here
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
