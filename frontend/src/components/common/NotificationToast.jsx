import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';
import useAlertStore from '../../store/alertStore.js';

export function NotificationToast() {
  const { toast, clearToast } = useAlertStore();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      clearToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const isCritical = toast.severity === 'CRITICAL';

  return (
    <div className="fixed top-20 right-6 z-50 max-w-md w-full animate-bounce-short">
      <div
        className={`p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 transition-all ${
          isCritical
            ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-500/10'
            : 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-500/10'
        }`}
      >
        <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
          {isCritical ? <AlertTriangle className="w-5 h-5 animate-pulse" /> : <Info className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-bold text-xs uppercase tracking-wider">
              {toast.severity} Alert Ingested
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Just now</span>
          </div>
          <h4 className="font-semibold text-sm mt-0.5 text-slate-900">{toast.title}</h4>
          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{toast.description}</p>
        </div>

        <button
          onClick={clearToast}
          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default NotificationToast;
