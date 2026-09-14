import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
  icon: Icon,
  type = 'button',
}) {
  const variants = {
    primary:
      'bg-sky-600 hover:bg-sky-700 text-white shadow-sm hover:shadow active:scale-[0.98] border border-transparent',
    secondary:
      'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:border-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm hover:shadow active:scale-[0.98]',
    warning:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-sm',
    ghost:
      'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
    md: 'px-3.5 py-2 text-sm font-medium rounded-lg gap-2',
    lg: 'px-4 py-2.5 text-base font-semibold rounded-lg gap-2.5',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
}

export default Button;
