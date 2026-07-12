import React, { useState } from 'react';
import { Truck, Lock, Mail, AlertCircle, Eye, EyeOff, Loader2, UserPlus, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, signupSchema } from '../../schemas/auth.schema';
import type { User } from '../../types';

interface LoginCardProps {
  onLoginSuccess: (user: User, token: string) => void;
}

const DEMO_CREDENTIALS = [
  { label: 'Fleet Manager', email: 'fleetmanager@transit.com', password: 'Fleet@123' },
  { label: 'Safety Officer', email: 'safety@transit.com', password: 'Safety@123' },
  { label: 'Driver', email: 'driver@transit.com', password: 'Driver@123' },
  { label: 'Financial Analyst', email: 'analyst@transit.com', password: 'Analyst@123' },
];

const ROLES = [
  'Fleet Manager',
  'Driver',
  'Safety Officer',
  'Financial Analyst',
];

export const LoginCard: React.FC<LoginCardProps> = ({ onLoginSuccess }) => {
  const { login, signup } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Fleet Manager');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // Field-level Zod validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);

    try {
      if (isSignUp) {
        // ── Zod signup validation ──────────────────────────────────────────
        const parsed = signupSchema.safeParse({ fullName, email, password, role });
        if (!parsed.success) {
          const errors: Record<string, string> = {};
          parsed.error.issues.forEach((err) => {
            const field = String(err.path[0]);
            if (!errors[field]) errors[field] = err.message;
          });
          setFieldErrors(errors);
          return;
        }

        const result = await signup(fullName, email, password, role);
        onLoginSuccess(result.user, result.token);
      } else {
        // ── Zod login validation ───────────────────────────────────────────
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          const errors: Record<string, string> = {};
          parsed.error.issues.forEach((err) => {
            const field = String(err.path[0]);
            if (!errors[field]) errors[field] = err.message;
          });
          setFieldErrors(errors);
          return;
        }

        const result = await login(email, password, role);
        onLoginSuccess(result.user, result.token);
      }
    } catch {
      // Errors are surfaced via Sonner toasts inside useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string, demoLabel: string, demoPassword?: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword || 'password');
    setRole(demoLabel);
    setFieldErrors({});
  };

  return (
    <div className="flex w-full max-w-4xl rounded-3xl overflow-hidden neumorph-outset border border-white/5 shadow-2xl min-h-[580px]">
      {/* Left Dark Sidebar Panel (Screen 0 Brand Info) */}
      <div className="w-1/3 bg-[#1e1610] p-8 text-[#faf5e9] flex flex-col justify-between border-r border-[#2b2019]">
        <div>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 text-[#d35e23] bg-[#2b2019] border border-white/5">
            <Truck className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black tracking-tight mb-1">TransitOps</h2>
          <p className="text-xs text-[#faf5e9]/65 tracking-wider font-semibold mb-8">Smart Transport Operations</p>

          <div className="space-y-4">
            <span className="text-xs font-bold text-[#df6a2e] tracking-wider block">One login, four roles:</span>
            <ul className="space-y-2 text-xs font-semibold text-[#faf5e9]/80">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d35e23]"></div> Fleet Manager
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#df6a2e]"></div> Driver
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d35e23]"></div> Safety Officer
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#d35e23]"></div> Financial Analyst
              </li>
            </ul>
          </div>
        </div>

        <div className="text-xs text-[#faf5e9]/50 tracking-wider font-semibold mt-8">
          TransitOps © 2026 • RBAC Enabled
        </div>
      </div>

      {/* Right Login/Signup Form Panel */}
      <div className="flex-1 p-8 bg-app-theme relative flex flex-col justify-between">
        {/* Top Orange accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#b84a14] via-[#e7733a] to-[#b84a14]"></div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-extrabold text-primary tracking-tight">{isSignUp ? 'Create an account' : 'Sign in to your account'}</h1>
            <p className="text-xs text-secondary mt-0.5 font-semibold">
              {isSignUp ? 'Enter your details to register' : 'Enter your credentials to continue'}
            </p>
          </div>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFieldErrors({});
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold text-orange hover:text-orange/80 cursor-pointer transition-all"
          >
            {isSignUp ? (
              <><UserCheck className="w-4 h-4" /> Already registered? Sign In</>
            ) : (
              <><UserPlus className="w-4 h-4" /> New user? Sign Up</>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Full Name</label>
              <div className={`relative rounded-2xl neumorph-inset border ${fieldErrors.fullName ? 'border-red-500/60' : 'border-theme'}`}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ranjeet Kumar"
                  className="w-full px-4 py-2.5 bg-transparent rounded-2xl text-primary placeholder-secondary/40 focus:outline-none font-bold text-xs"
                />
              </div>
              {fieldErrors.fullName && (
                <p className="mt-1 px-1 text-[10px] font-semibold text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {fieldErrors.fullName}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Email Address</label>
            <div className={`relative rounded-2xl neumorph-inset border flex items-center ${fieldErrors.email ? 'border-red-500/60' : 'border-theme'}`}>
              <Mail className="absolute left-4 w-4 h-4 text-secondary/60" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@transitops.in"
                className="w-full pl-11 pr-4 py-2.5 bg-transparent rounded-2xl text-primary placeholder-secondary/40 focus:outline-none font-bold text-xs"
              />
            </div>
            {fieldErrors.email && (
              <p className="mt-1 px-1 text-[10px] font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Password</label>
            <div className={`relative rounded-2xl neumorph-inset border flex items-center ${fieldErrors.password ? 'border-red-500/60' : 'border-theme'}`}>
              <Lock className="absolute left-4 w-4 h-4 text-secondary/60" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 bg-transparent rounded-2xl text-primary placeholder-secondary/40 focus:outline-none font-bold text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 p-1 text-secondary/60 hover:text-orange rounded-lg transition-all cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="mt-1 px-1 text-[10px] font-semibold text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5 px-1">Role Option</label>
            <div className="rounded-2xl neumorph-inset border border-theme">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-transparent rounded-2xl text-primary font-bold text-xs focus:outline-none cursor-pointer"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-card-theme text-primary">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-secondary px-1 py-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" className="rounded border-gray-400 bg-transparent text-orange focus:ring-0" />
              Remember me
            </label>
            <a href="#forgot" className="hover:text-orange transition-colors">Forgot password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:pointer-events-none neumorph-btn-orange text-xs shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isSignUp ? 'Creating Account...' : 'Signing in...'}
              </>
            ) : (
              isSignUp ? 'Sign Up & Login' : 'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-theme"></div>
          </div>
          <span className="relative bg-app-theme px-3 text-xs font-semibold tracking-wider text-secondary/85">
            Quick Demo Access
          </span>
        </div>

        {/* Demo Accounts Grid */}
        <div className="grid grid-cols-4 gap-2">
          {DEMO_CREDENTIALS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => handleQuickSelect(demo.email, demo.label, demo.password)}
              className="flex flex-col p-2.5 rounded-xl transition-all cursor-pointer group neumorph-btn-vanilla text-left shadow-xs"
            >
              <span className="text-[11px] font-bold text-primary group-hover:text-orange transition-colors truncate">
                {demo.label}
              </span>
              <span className="text-[10px] text-secondary/85 font-semibold truncate mt-0.5 select-all">
                {demo.email}
              </span>
            </button>
          ))}
        </div>

        {/* Access scoping details helper */}
        <div className="mt-4 p-3 rounded-xl border border-theme bg-card-theme text-[11px] text-secondary/85 leading-normal flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-orange shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-primary block tracking-wider">Access Scope Hierarchy:</span>
            <span className="font-semibold block mt-0.5">
              • Fleet Manager: Fleet, Maintenance | • Driver: Dashboard, Trips
            </span>
            <span className="font-semibold block">
              • Safety Officer: Drivers, Compliance | • Financial Analyst: Fuel & Expenses, Analytics
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
