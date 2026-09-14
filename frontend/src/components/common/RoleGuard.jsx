import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';

export function RoleGuard({ allowedRoles = [], children }) {
  const user = useAuthStore((s) => s.user);

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-rose-200 shadow-xl p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-500 block mb-1">
              Security Protocol 403
            </span>
            <h2 className="text-xl font-heading font-black text-slate-900">
              Access Restricted
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your current credential profile (<strong className="font-mono text-slate-800">{user?.role || 'UNAUTHENTICATED'}</strong>) does not have authorization to access this operational zone.
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Station Overview
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

export default RoleGuard;
