import React, { useState } from 'react';
import { login } from '../../utils/api';
import type { User } from '../../types';
import { Truck, Lock, Mail, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginCardProps {
  onLoginSuccess: (user: User, token: string) => void;
}

const DEMO_CREDENTIALS = [
  { label: 'Fleet Manager', email: 'manager@transitops.com' },
  { label: 'Safety Officer', email: 'safety@transitops.com' },
  { label: 'Driver', email: 'driver@transitops.com' },
  { label: 'Financial Analyst', email: 'finance@transitops.com' },
];

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await login(email, password);
      onLoginSuccess(result.user, result.token);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password');
    setError(null);
  };

  return (
    <div className="w-full max-w-md rounded-3xl p-8 relative overflow-hidden transition-all duration-300 neumorph-outset border border-white/50">
      
      {/* Burnt Orange Top Stripe Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#b84a14] via-[#e7733a] to-[#b84a14]"></div>

      {/* Brand Icon and Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 text-[#b84a14] bg-[#faf5e9] shadow-[3px_3px_6px_#e0d4bc,-3px_-3px_6px_#ffffff] border border-white/40">
          <Truck className="w-9 h-9" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#2e2520] tracking-tight mb-1 font-sans">TransitOps</h1>
        <p className="text-xs text-[#87786f] font-bold uppercase tracking-wider">Transport Operations Platform</p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="mb-6 flex items-start gap-3 bg-[#fdf5f2] border border-[#f5d5c6] text-[#a6350f] px-4 py-3 rounded-2xl text-xs font-semibold animate-slide-in shadow-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#b84a14] mt-0.5" />
          <div>
            <p className="font-bold">Authentication failed</p>
            <p className="opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Inputs and Submit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#87786f] mb-2 px-1">
            Email Address
          </label>
          <div className="relative rounded-2xl neumorph-inset group border border-slate-200/25">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#87786f]/70" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@transitops.com"
              className="w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-[#2e2520] placeholder-[#87786f]/55 focus:outline-none font-bold text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#87786f] mb-2 px-1">
            Password
          </label>
          <div className="relative rounded-2xl neumorph-inset group border border-slate-200/25">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#87786f]/70" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3.5 bg-transparent rounded-2xl text-[#2e2520] placeholder-[#87786f]/55 focus:outline-none font-bold text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-[#87786f]/60 hover:text-[#b84a14] rounded-lg transition-all cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none neumorph-btn-orange text-sm shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#eedebd]/60"></div>
        </div>
        <span className="relative bg-[#faf5e9] px-3 text-[10px] font-extrabold uppercase tracking-widest text-[#87786f]">
          Quick Demo Access
        </span>
      </div>

      {/* Demo Accounts Select */}
      <div className="grid grid-cols-2 gap-2.5">
        {DEMO_CREDENTIALS.map((demo) => (
          <button
            key={demo.email}
            type="button"
            onClick={() => handleQuickSelect(demo.email)}
            className="flex flex-col text-left p-3 rounded-2xl transition-all cursor-pointer group neumorph-btn-vanilla"
          >
            <span className="text-xs font-extrabold text-[#2e2520] group-hover:text-[#b84a14] transition-colors">
              {demo.label}
            </span>
            <span className="text-[10px] text-[#87786f] font-semibold truncate mt-0.5 select-all">
              {demo.email}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
