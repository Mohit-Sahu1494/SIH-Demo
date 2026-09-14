import React from 'react';
import Badge from './Badge.jsx';

export function PageHeader({ title, subtitle, badge, action, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        {breadcrumb && (
          <div className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
            {breadcrumb}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}

export default PageHeader;
