import React from 'react';

export function Card({ children, className = '', hover = false, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-card p-5 ${
        hover ? 'hover:shadow-cardHover hover:border-slate-300 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, badge }) {
  return (
    <div className="flex items-start justify-between mb-4 pb-3 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2.5">
          <h3 className="font-heading font-semibold text-slate-900 text-base">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export default Card;
