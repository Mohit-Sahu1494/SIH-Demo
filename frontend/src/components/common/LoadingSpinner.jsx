import React from 'react';

export function LoadingSpinner({ text = 'Synchronizing mission telemetry...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-10 h-10 border-3 border-sky-100 border-t-sky-600 rounded-full animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{text}</p>
    </div>
  );
}

export function EmptyState({ title = 'No operational records', description = 'All parameters are within nominal safety envelopes.', icon: Icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
      {Icon && (
        <div className="p-3 bg-white rounded-full border border-slate-200 text-slate-400 mb-3 shadow-sm">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default LoadingSpinner;
