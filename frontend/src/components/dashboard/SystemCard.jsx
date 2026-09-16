import React from 'react';
import {
  ArrowUpRight,
  Zap,
  Fuel,
  Flame,
  Droplets,
  Radio,
  FlaskConical,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Snowflake,
  Activity,
  AlertTriangle,
  Layers,
  Thermometer,
  Gauge,
  Clock,
  Sparkles,
} from 'lucide-react';
import StatusBadge from '../common/StatusBadge.jsx';

/**
 * Returns an appropriate icon based on the system id and category
 */
const getSystemIcon = (sysId = '', category = '') => {
  const id = sysId.toLowerCase();
  const cat = category.toLowerCase();

  if (id.includes('chp') || id.includes('dg') || cat.includes('power')) return Zap;
  if (id.includes('fuel')) return Fuel;
  if (id.includes('hvac') || cat.includes('heating')) return Flame;
  if (id.includes('water') || id.includes('pump')) return Droplets;
  if (id.includes('satellite') || cat.includes('comm')) return Radio;
  if (id.includes('lab') || cat.includes('sci')) return FlaskConical;
  if (id.includes('fire') || cat.includes('safe')) return ShieldAlert;
  if (id.includes('storage') || id.includes('cold')) return Snowflake;
  if (id.includes('building')) return Building2;
  return Activity;
};

/**
 * Theme colors and gradients based on category and status
 */
const getSystemTheme = (category = '', status = '') => {
  const normStatus = (status || '').toLowerCase();
  const isWarn = normStatus.includes('warn') || normStatus.includes('degrad') || normStatus.includes('high');
  const isCrit = normStatus.includes('crit') || normStatus.includes('fail') || normStatus.includes('lost');

  if (isCrit) {
    return {
      iconBg: 'bg-rose-500/15 border-rose-400/40 text-rose-700',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
      barGradient: 'from-rose-500 to-red-600',
      borderGlow: 'hover:border-rose-400/80 border-rose-300/70',
      cardBg: 'bg-rose-500/[0.04]',
      glowColor: 'bg-rose-500/15',
    };
  }

  if (isWarn) {
    return {
      iconBg: 'bg-amber-500/15 border-amber-400/40 text-amber-700',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
      barGradient: 'from-amber-400 to-amber-600',
      borderGlow: 'hover:border-amber-400/80 border-amber-300/70',
      cardBg: 'bg-amber-500/[0.04]',
      glowColor: 'bg-amber-500/15',
    };
  }

  const cat = category.toLowerCase();
  if (cat.includes('power')) {
    return {
      iconBg: 'bg-sky-500/15 border-sky-400/30 text-sky-700',
      badgeBg: 'bg-sky-50 border-sky-200 text-sky-700',
      barGradient: 'from-sky-400 to-blue-600',
      borderGlow: 'hover:border-sky-400/70 border-white/60',
      cardBg: 'bg-white/30',
      glowColor: 'bg-sky-400/15',
    };
  }
  if (cat.includes('fuel')) {
    return {
      iconBg: 'bg-amber-500/15 border-amber-400/30 text-amber-700',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
      barGradient: 'from-amber-400 to-orange-500',
      borderGlow: 'hover:border-amber-400/70 border-white/60',
      cardBg: 'bg-white/30',
      glowColor: 'bg-amber-400/15',
    };
  }
  if (cat.includes('water')) {
    return {
      iconBg: 'bg-teal-500/15 border-teal-400/30 text-teal-700',
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-700',
      barGradient: 'from-teal-400 to-cyan-600',
      borderGlow: 'hover:border-teal-400/70 border-white/60',
      cardBg: 'bg-white/30',
      glowColor: 'bg-teal-400/15',
    };
  }
  if (cat.includes('heating')) {
    return {
      iconBg: 'bg-orange-500/15 border-orange-400/30 text-orange-700',
      badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
      barGradient: 'from-orange-400 to-red-500',
      borderGlow: 'hover:border-orange-400/70 border-white/60',
      cardBg: 'bg-white/30',
      glowColor: 'bg-orange-400/15',
    };
  }
  if (cat.includes('comm')) {
    return {
      iconBg: 'bg-indigo-500/15 border-indigo-400/30 text-indigo-700',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      barGradient: 'from-indigo-400 to-purple-600',
      borderGlow: 'hover:border-indigo-400/70 border-white/60',
      cardBg: 'bg-white/30',
      glowColor: 'bg-indigo-400/15',
    };
  }

  return {
    iconBg: 'bg-slate-500/15 border-slate-400/30 text-slate-700',
    badgeBg: 'bg-slate-50 border-slate-200 text-slate-700',
    barGradient: 'from-slate-400 to-slate-600',
    borderGlow: 'hover:border-slate-400/70 border-white/60',
    cardBg: 'bg-white/30',
    glowColor: 'bg-slate-400/15',
  };
};

/**
 * Parse numeric percentage from metric value string
 */
const parsePercentage = (metric) => {
  if (!metric) return null;
  if (typeof metric.numeric === 'number' && metric.numeric >= 0 && metric.numeric <= 100) {
    return metric.numeric;
  }
  const valStr = String(metric.value || '');
  if (valStr.includes('%')) {
    const parsed = parseFloat(valStr.replace('%', ''));
    if (!isNaN(parsed)) return Math.min(100, Math.max(0, parsed));
  }
  return null;
};

export function SystemCard({
  system = {},
  name = 'System',
  status = 'Healthy',
  primaryMetric = { label: 'Metric', value: 'Nominal' },
  variant = 'standard', // 'featured' | 'spotlight' | 'standard'
  onClick,
}) {
  const sysId = system.id || '';
  const category = system.category || 'General';
  const subCategory = system.subCategory || '';
  const type = system.type || '';
  const healthScore = system.healthScore;
  const specs = system.specs || {};
  const dependencies = system.dependencies || {};
  const suppliesCount = dependencies.supplies?.length || 0;
  const recentLog = system.maintenance?.recentLogs?.[0];

  const IconComponent = getSystemIcon(sysId, category);
  const theme = getSystemTheme(category, status);
  const percentVal = parsePercentage(primaryMetric);

  const isWarning = status?.toLowerCase().includes('warn');
  const isCritical = status?.toLowerCase().includes('crit') || status?.toLowerCase().includes('lost');

  // Featured 2-column Bento Card
  if (variant === 'featured') {
    const specEntries = Object.entries(specs)
      .filter(([k]) => !k.toLowerCase().includes('runtime') && !k.toLowerCase().includes('frequency'))
      .slice(0, 3);

    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          col-span-1 md:col-span-2
          w-full text-left rounded-2xl
          ${theme.cardBg}
          backdrop-blur-xl
          border ${theme.borderGlow}
          p-5 md:p-6
          shadow-xs hover:shadow-xl
          transition-all duration-300
          group cursor-pointer relative overflow-hidden flex flex-col justify-between
          hover:bg-white/45
          focus:outline-none focus:ring-2 focus:ring-sky-500/30
        `}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -top-14 -right-14 w-40 h-40 ${theme.glowColor} rounded-full blur-3xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
        />

        {/* Top Header */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-xs ${theme.iconBg} group-hover:scale-105 transition-transform`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                    {name}
                  </h3>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/60 border border-white/80 text-slate-600">
                    {category}
                  </span>
                </div>
                {type && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {type}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {healthScore && (
                <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white/60 border border-white/80 px-2 py-0.5 rounded-md">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  <span>{healthScore}%</span>
                </div>
              )}
              <StatusBadge status={status} size="sm" />
            </div>
          </div>

          {/* Metric Section + Progress Bar */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="bg-white/40 border border-white/60 rounded-xl p-3.5 backdrop-blur-sm">
              <div className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                {primaryMetric.label || 'Primary Telemetry'}
              </div>
              <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 mt-0.5">
                {primaryMetric.value}
              </div>
              {percentVal !== null && (
                <div className="mt-2.5">
                  <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} transition-all duration-500`}
                      style={{ width: `${percentVal}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs Chips */}
            {specEntries.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {specEntries.map(([key, val]) => (
                  <div
                    key={key}
                    className="bg-white/30 border border-white/50 rounded-lg p-2 flex flex-col justify-center"
                  >
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider truncate">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="font-semibold text-slate-800 font-mono truncate mt-0.5">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {suppliesCount > 0 ? `Supplying ${suppliesCount} downstream systems` : 'Core Station Infrastructure'}
            </span>
          </div>

          <div className="flex items-center text-sky-700 font-medium group-hover:text-sky-900 transition-colors">
            <span>Explore Telemetry</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </button>
    );
  }

  // Spotlight Bento Card (Warning or Attention item)
  if (variant === 'spotlight' || isWarning || isCritical) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`
          w-full text-left rounded-2xl
          ${theme.cardBg}
          backdrop-blur-xl
          border ${theme.borderGlow}
          p-5
          shadow-xs hover:shadow-xl
          transition-all duration-300
          group cursor-pointer relative overflow-hidden flex flex-col justify-between
          hover:bg-white/45
          focus:outline-none focus:ring-2 focus:ring-amber-500/30
          ring-1 ${isCritical ? 'ring-rose-400/40' : 'ring-amber-400/40'}
        `}
      >
        {/* Glow */}
        <div
          className={`absolute -top-12 -right-12 w-36 h-36 ${theme.glowColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
        />

        <div>
          {/* Attention Banner */}
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-amber-200/50">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-300/70 px-2 py-0.5 rounded-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
              Attention Required
            </span>
            <StatusBadge status={status} size="sm" />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-xs ${theme.iconBg}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-900 transition-colors">
                  {name}
                </h3>
                <span className="text-[11px] text-slate-500">{category}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xl font-bold font-mono text-slate-900">
                {primaryMetric.value}
              </div>
              <div className="text-[11px] text-slate-500">
                {primaryMetric.label}
              </div>
            </div>
          </div>

          {/* Metric Bar */}
          {percentVal !== null && (
            <div className="mt-3">
              <div className="w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} transition-all duration-500`}
                  style={{ width: `${percentVal}%` }}
                />
              </div>
            </div>
          )}

          {/* Advisory note excerpt if available */}
          {recentLog && (
            <div className="mt-3 bg-amber-100/50 border border-amber-200/70 rounded-lg p-2 text-[11px] text-amber-900/90 leading-tight">
              <span className="font-semibold">Log:</span> {recentLog.note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-2.5 border-t border-amber-200/40 flex items-center justify-between text-xs">
          <span className="text-[11px] text-amber-800/80 font-medium">
            Run Diagnostics
          </span>
          <div className="flex items-center text-amber-900 font-semibold group-hover:text-amber-950 transition-colors">
            <span>Inspect</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </button>
    );
  }

  // Standard Bento Card (Compact & Modern)
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full text-left rounded-2xl
        ${theme.cardBg}
        backdrop-blur-xl
        border ${theme.borderGlow}
        p-4 sm:p-5
        shadow-xs hover:shadow-lg
        transition-all duration-300
        group cursor-pointer relative overflow-hidden flex flex-col justify-between
        hover:bg-white/45
        focus:outline-none focus:ring-2 focus:ring-sky-500/20
      `}
    >
      {/* Background glow */}
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 ${theme.glowColor} rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none`}
      />

      <div>
        {/* Card Header: Icon + Category + Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-xs ${theme.iconBg} group-hover:scale-105 transition-transform`}
            >
              <IconComponent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-900 transition-colors">
                {name}
              </h3>
              <span className="text-[11px] text-slate-500 line-clamp-1">
                {type || category}
              </span>
            </div>
          </div>

          <StatusBadge status={status} size="sm" />
        </div>

        {/* Primary Metric */}
        <div className="mt-4 bg-white/40 border border-white/60 rounded-xl p-3 backdrop-blur-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
              {primaryMetric.label || 'Metric'}
            </span>
            <span className="text-xl font-bold font-mono tracking-tight text-slate-900">
              {primaryMetric.value}
            </span>
          </div>

          {percentVal !== null && (
            <div className="mt-2">
              <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.barGradient} transition-all duration-500`}
                  style={{ width: `${percentVal}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3.5 pt-2.5 border-t border-white/40 flex items-center justify-between text-xs text-slate-600">
        {healthScore ? (
          <span className="text-[11px] text-slate-500 font-mono">
            Health: <span className="font-semibold text-slate-700">{healthScore}%</span>
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 capitalize">{category}</span>
        )}

        <div className="flex items-center text-[11px] text-sky-700 font-medium group-hover:text-sky-900 transition-colors">
          <span>Telemetry</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </button>
  );
}

export default SystemCard;