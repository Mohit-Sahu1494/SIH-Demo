import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Eye,
  Activity,
  UserCheck,
} from 'lucide-react';
import useAuthStore from '../store/authStore.js';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both your operational email and password.');
      return;
    }

    try {
      const data = await login(email, password);
      // Route based on role returned by backend
      const role = data.user.role;
      if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'VIEWER') {
        navigate('/viewer/dashboard', { replace: true });
      } else {
        navigate('/operator/dashboard', { replace: true });
      }
    } catch (err) {
      setLocalError(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // Quick-fill credentials for SIH demo evaluation
  const setQuickCreds = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLocalError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center select-none text-slate-100 font-sans">
      <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 backdrop-blur-xl">
          {/* Left Column: Authentic Antarctic Visual & Mission Context */}
          <div className="lg:col-span-6 relative p-8 sm:p-10 flex flex-col justify-between overflow-hidden bg-slate-950/70 border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Background Image with Overlay */}
            <img
              src="/images/antarctic_station_hero.jpg"
              alt="Polar Station"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-heading font-black text-lg shadow-md shadow-sky-600/30">
                  PT
                </div>
                <div>
                  <div className="font-heading font-bold text-lg text-white tracking-wider">
                    POLAR TWIN
                  </div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-sky-400">
                    Antarctic Mission Control
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>SECURE GATEWAY v2.4</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-heading font-black text-white leading-tight">
                  Remote Management for Maitri & Bharati Stations
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Real-time telemetry, digital twin synchronization, predictive asset health, and automated emergency anomaly orchestration.
                </p>
              </div>
            </div>

            {/* Quick Demo Credentials Panel for SIH evaluators */}
            <div className="relative z-10 pt-8 border-t border-slate-800/80 space-y-3">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Quick-Select Credentials for SIH Demo:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickCreds('operator@polartwin.gov.in', 'Operator@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-sky-300 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Operator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickCreds('admin@polartwin.gov.in', 'Admin@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-purple-300 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  <span>Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setQuickCreds('viewer@polartwin.gov.in', 'Viewer@123')}
                  className="px-2.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-emerald-300 transition-all text-center flex flex-col items-center gap-0.5"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Viewer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-center space-y-6">
            <div>
              <h3 className="text-xl font-heading font-black text-white">
                Mission Control Access
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials. Permissions and dashboard access will be automatically determined by the server.
              </p>
            </div>

            {/* Error banner */}
            {(localError || error) && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{localError || error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Operational Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. operator@polartwin.gov.in"
                    className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Mission Password
                  </label>
                  <span className="text-[11px] text-slate-500">Encrypted JWT</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700/90 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono transition-all"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-heading font-black text-sm shadow-xl shadow-sky-500/25 hover:shadow-sky-400/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Authenticating with Mission Server...</span>
                  ) : (
                    <>
                      <span>Sign In to Mission Control</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
              Need to explore without credentials?{' '}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sky-400 hover:underline font-semibold"
              >
                Return to Public Landing Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
