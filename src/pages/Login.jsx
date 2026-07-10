import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200/80 bg-white p-8 shadow-xl">
        {/* Branding header */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white text-xl font-bold shadow-lg shadow-primary-500/25">
            S
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access your Society Portal
          </p>
        </div>

        {/* API Error Message */}
        {errors.api && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-sm text-rose-800 animate-fade-in">
            {errors.api}
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 ${
                  errors.email
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                    : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`block w-full rounded-lg border py-2.5 pl-10 pr-10 text-sm placeholder-slate-400 focus:outline-hidden focus:ring-2 transition-all duration-200 ${
                  errors.password
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20 bg-rose-50/10'
                    : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500/20'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-lg bg-primary-600 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/20 hover:bg-primary-700 focus:outline-hidden focus:ring-2 focus:ring-primary-500/50 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Redirect Link */}
        <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
          Don't have a resident account?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
