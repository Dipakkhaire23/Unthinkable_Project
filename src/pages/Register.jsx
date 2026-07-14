import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Home, Building2, Eye, EyeOff, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    flatNumber: '',
    building: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when editing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const tempErrors = {};
    
    if (!formData.fullName.trim()) tempErrors.fullName = 'Full Name is required';
    
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,14}$/.test(formData.phone.replace(/\s+/g, ''))) {
      tempErrors.phone = 'Please enter a valid phone number (10-14 digits)';
    }

    if (!formData.flatNumber.trim()) tempErrors.flatNumber = 'Flat Number is required';
    if (!formData.building.trim()) tempErrors.building = 'Building Name is required';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    setSuccessMsg('');

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone,
        flatNumber: formData.flatNumber,
        building: formData.building,
      });

      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      console.error(err);
      setErrors({ api: err.message || 'Registration failed. Email may already be in use.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Split Layout Container */}
      <div className="flex w-full flex-col lg:flex-row">
        
        {/* Left Side: Info panel (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-tr from-sky-955 via-primary-950 to-sky-900 text-white p-16 flex-col justify-between">
          {/* Subtle decorative glow circles */}
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-sky-400/10 rounded-full blur-3xl" />

          {/* Logo & Brand Header */}
          <Link to="/" className="flex items-center gap-3 relative z-10 hover:opacity-85 transition-opacity">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-sky-600 text-white shadow-lg shadow-primary-500/20">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Society Maintenance</h1>
              <p className="text-[10px] text-primary-300 font-semibold tracking-wider uppercase">Resident & Admin Portal</p>
            </div>
          </Link>

          {/* Core Banner / Call to Action */}
          <div className="my-auto space-y-6 relative z-10 max-w-lg">
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-primary-200 bg-clip-text text-transparent">
              Join the Society Maintenance Portal today.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Create an account as a resident to easily file complaints, upload photographic evidence, track status resolutions, and read announcements from the Notice Board.
            </p>

            {/* List of Features */}
            <div className="space-y-4 pt-6">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Quick Sign Up</h4>
                  <p className="text-xs text-slate-400">Fill in your basic information and flat details to register instantly.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Notice Board Updates</h4>
                  <p className="text-xs text-slate-400">Receive priority announcements automatically broadcasted directly to your email.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/20 text-primary-300">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-100">Resident Dashboard</h4>
                  <p className="text-xs text-slate-400">Access filters, search utilities, and detailed timelines for your resolved complaints.</p>
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
        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10 md:p-14 bg-slate-50">
          <div className="w-full max-w-lg space-y-6">
            
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="text-center lg:text-left space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-2.5">
                <Link to="/" className="flex lg:hidden h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white shadow-md hover:scale-105 transition-transform">
                  <Building2 className="h-5 w-5" />
                </Link>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                  Create Resident Account
                </h2>
              </div>
              <p className="text-sm text-slate-500">
                Register your account to manage and track maintenance requests.
              </p>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-250 p-4 text-xs font-semibold text-emerald-800 animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="h-4.5 w-4.5" />
                {successMsg}
              </div>
            )}

            {errors.api && (
              <div className="rounded-xl bg-rose-50 border border-rose-250 p-4 text-xs font-semibold text-rose-800 animate-fade-in flex items-start gap-2">
                <span className="text-base leading-none">⚠️</span>
                {errors.api}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.fullName
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.fullName && <p className="text-xs text-rose-600 font-semibold">{errors.fullName}</p>}
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505">
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
                    className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.email
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="john.doe@example.com"
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600 font-semibold">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505">
                  Password
                </label>
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
                    className={`block w-full rounded-xl border py-2.5 pl-11 pr-11 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.password
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-650"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-600 font-semibold">{errors.password}</p>}
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-505">
                  Phone Number
                </label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    name="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                      errors.phone
                        ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                        : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                    }`}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-600 font-semibold">{errors.phone}</p>}
              </div>

              {/* Grid: Flat & Building details */}
              <div className="grid grid-cols-2 gap-4">
                {/* Flat Number */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-505">
                    Flat Number
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Home className="h-4 w-4" />
                    </span>
                    <input
                      name="flatNumber"
                      type="text"
                      required
                      value={formData.flatNumber}
                      onChange={handleChange}
                      className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                        errors.flatNumber
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                          : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                      }`}
                      placeholder="e.g. A-402"
                    />
                  </div>
                  {errors.flatNumber && <p className="text-xs text-rose-600 font-semibold">{errors.flatNumber}</p>}
                </div>

                {/* Building */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-550">
                    Building/Block
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                      <Building2 className="h-4 w-4" />
                    </span>
                    <input
                      name="building"
                      type="text"
                      required
                      value={formData.building}
                      onChange={handleChange}
                      className={`block w-full rounded-xl border py-2.5 pl-11 pr-4 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-4 transition-all duration-200 ${
                        errors.building
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10 text-rose-900'
                          : 'border-slate-350 focus:border-primary-500 focus:ring-primary-500/10 text-slate-700 bg-white'
                      }`}
                      placeholder="e.g. Block C"
                    />
                  </div>
                  {errors.building && <p className="text-xs text-rose-600 font-semibold">{errors.building}</p>}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-sky-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 hover:from-primary-700 hover:to-sky-800 focus:outline-hidden focus:ring-4 focus:ring-primary-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 pt-3"
              >
                {loading ? 'Creating Account...' : (
                  <>
                    Register Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Redirect Link */}
            <div className="text-center text-sm text-slate-500 pt-4 border-t border-slate-200">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:text-primary-700 hover:underline transition-colors"
              >
                Sign In
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
