import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import EnvironmentHero from '../components/dashboard/EnvironmentHero.jsx';
import SystemCard from '../components/dashboard/SystemCard.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';
import {
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Search,
  LayoutGrid,
  Grid2X2,
  Filter,
  CheckCircle2,
  XCircle,
  Zap,
  Droplets,
  Fuel,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

export function StationDashboard({ telemetry: propTelemetry }) {
  const { stationId = 'bharati' } = useParams();
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;

  // Direct subscription to telemetryEngine for guaranteed 7-second real-time updates
  const [telemetryState, setTelemetryState] = useState(() => telemetryEngine.getState());

  useEffect(() => {
    const unsub = telemetryEngine.subscribe((state) => {
      setTelemetryState(state);
    });
    return () => unsub();
  }, []);

  const liveTel = telemetryState[currentStationCode] || telemetryState.BHT || {};
  const telemetry = propTelemetry || context.telemetry || liveTel;

  // UI state for Bento grid filtering and view modes
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('bento'); // 'bento' | 'compact'
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);

  // Extract environmental values from telemetry engine
  const env = telemetry.environment || {
    temperature: -16.4,
    windSpeed: 22.3,
    humidity: 26.3,
    pressure: 973,
    updatedAt: '8 seconds ago',
    source: 'LIVE · NCPOR',
    isStale: false,
  };

  // Systems list specific to the current station
  const systems = station.systems || [];

  // Determine dynamic metric value if affected by simulation failure injection
  const getDynamicMetric = (sys) => {
    if ((sys.id === 'chp-1' || sys.id === 'dg-1') && telemetry.power?.chp1) {
      return { label: 'Load', value: telemetry.power.chp1.load };
    }
    if ((sys.id === 'chp-2' || sys.id === 'dg-2') && telemetry.power?.chp2) {
      return { label: 'Load', value: telemetry.power.chp2.load };
    }
    if ((sys.id === 'chp-3' || sys.id === 'dg-3') && telemetry.power?.chp3) {
      return { label: 'Load', value: telemetry.power.chp3.load };
    }
    if ((sys.id === 'fuel-farm' || sys.id === 'fuel-storage') && telemetry.fuel) {
      return { label: 'Remaining', value: `${telemetry.fuel.reservePercent}%` };
    }
    if (sys.id === 'hvac' && telemetry.heating) {
      return { label: 'Heating Load', value: `${telemetry.heating.demandPercent}%` };
    }
    if ((sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') && telemetry.water) {
      return { label: 'Intake Flow', value: `${telemetry.water.pumpFlowLh.toLocaleString()} L/h` };
    }
    if (sys.id === 'satellite-communication' && telemetry.satellite) {
      return {
        label: 'Status',
        value: telemetry.satellite.isLost ? 'LINK LOST' : `${telemetry.satellite.latencyMs} ms`,
      };
    }
    return sys.primaryMetric;
  };

  const getDynamicStatus = (sys) => {
    if ((sys.id === 'chp-1' || sys.id === 'dg-1') && telemetry.power?.chp1?.status) {
      return telemetry.power.chp1.status;
    }
    if ((sys.id === 'chp-2' || sys.id === 'dg-2') && telemetry.power?.chp2?.status) {
      return telemetry.power.chp2.status;
    }
    if ((sys.id === 'chp-3' || sys.id === 'dg-3') && telemetry.power?.chp3?.status) {
      return telemetry.power.chp3.status;
    }
    if ((sys.id === 'sea-water-pump' || sys.id === 'lake-water-pump') && telemetry.water) {
      return telemetry.water.pumpStatus;
    }
    if (sys.id === 'satellite-communication' && telemetry.satellite?.isLost) {
      return 'Critical';
    }
    if ((sys.id === 'fuel-farm' || sys.id === 'fuel-storage') && telemetry.fuel) {
      if (telemetry.fuel.reservePercent <= 10) return 'Critical';
      if (telemetry.fuel.reservePercent <= 35) return 'Warning';
    }
    return sys.status;
  };

  // Pre-calculate system statuses, dynamic specs and counts
  const systemsWithStatus = useMemo(() => {
    return systems.map((sys) => {
      const dynamicStatus = getDynamicStatus(sys);
      const dynamicMetric = getDynamicMetric(sys);
      const updatedSpecs = { ...(sys.specs || {}) };

      if ((sys.id === 'chp-1' || sys.id === 'dg-1') && telemetry.power?.chp1) {
        updatedSpecs.load = telemetry.power.chp1.load;
        if (telemetry.power.chp1.temp) updatedSpecs.temperature = telemetry.power.chp1.temp;
      } else if ((sys.id === 'chp-2' || sys.id === 'dg-2') && telemetry.power?.chp2) {
        updatedSpecs.load = telemetry.power.chp2.load;
        if (telemetry.power.chp2.temp) updatedSpecs.temperature = telemetry.power.chp2.temp;
      } else if ((sys.id === 'chp-3' || sys.id === 'dg-3') && telemetry.power?.chp3) {
        updatedSpecs.load = telemetry.power.chp3.load;
        if (telemetry.power.chp3.temp) updatedSpecs.temperature = telemetry.power.chp3.temp;
      } else if ((sys.id === 'fuel-farm' || sys.id === 'fuel-storage') && telemetry.fuel) {
        if (telemetry.fuel.currentLiters) {
          updatedSpecs.currentVolume = `${telemetry.fuel.currentLiters.toLocaleString()} L`;
        }
      }

      return {
        ...sys,
        specs: updatedSpecs,
        dynamicStatus,
        dynamicMetric,
      };
    });
  }, [systems, telemetry]);

  const alertCount = useMemo(() => {
    return systemsWithStatus.filter(
      (s) =>
        s.dynamicStatus?.toLowerCase().includes('warn') ||
        s.dynamicStatus?.toLowerCase().includes('crit') ||
        s.dynamicStatus?.toLowerCase().includes('lost')
    ).length;
  }, [systemsWithStatus]);

  const nominalCount = systemsWithStatus.length - alertCount;

  // Category classification for filter tabs
  const categoryGroups = [
    { id: 'all', label: 'All Systems', icon: LayoutGrid },
    { id: 'power', label: 'Power & Energy', icon: Zap, match: ['power'] },
    { id: 'water-hvac', label: 'Water & Climate', icon: Droplets, match: ['water', 'heating', 'hvac', 'waste'] },
    { id: 'fuel', label: 'Fuel Reserves', icon: Fuel, match: ['fuel'] },
    { id: 'comms-sci', label: 'Comms & Labs', icon: Radio, match: ['comm', 'scientific', 'science'] },
  ];

  // Filter systems according to active filters and search
  const filteredSystems = useMemo(() => {
    return systemsWithStatus.filter((sys) => {
      // Alert only filter
      if (filterAlertsOnly) {
        const isAlert =
          sys.dynamicStatus?.toLowerCase().includes('warn') ||
          sys.dynamicStatus?.toLowerCase().includes('crit') ||
          sys.dynamicStatus?.toLowerCase().includes('lost');
        if (!isAlert) return false;
      }

      // Category filter
      if (activeCategory !== 'all') {
        const group = categoryGroups.find((g) => g.id === activeCategory);
        if (group?.match) {
          const sysCat = (sys.category || '').toLowerCase();
          const sysSub = (sys.subCategory || '').toLowerCase();
          const matches = group.match.some((m) => sysCat.includes(m) || sysSub.includes(m));
          if (!matches) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = sys.name.toLowerCase().includes(q);
        const matchesType = (sys.type || '').toLowerCase().includes(q);
        const matchesCat = (sys.category || '').toLowerCase().includes(q);
        const matchesMetric = (sys.dynamicMetric?.label || '').toLowerCase().includes(q);
        if (!matchesName && !matchesType && !matchesCat && !matchesMetric) return false;
      }

      return true;
    });
  }, [systemsWithStatus, activeCategory, searchQuery, filterAlertsOnly]);

  // Determine Bento grid variant and spanning
  const getBentoVariant = (sys) => {
    if (viewMode === 'compact') return 'standard';

    const isAlert =
      sys.dynamicStatus?.toLowerCase().includes('warn') ||
      sys.dynamicStatus?.toLowerCase().includes('crit') ||
      sys.dynamicStatus?.toLowerCase().includes('lost');

    if (isAlert) return 'spotlight';

    // Featured lifeline systems
    const heroIds = [
      'chp-1',
      'dg-1',
      'fuel-farm',
      'fuel-storage',
      'power-distribution',
      'satellite-communication',
    ];

    if (heroIds.includes(sys.id)) return 'featured';

    return 'standard';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
      {/* 1. Main Environment Card + Station Health Bento Row */}
      <section className="flex flex-col lg:flex-row gap-6 items-start">
        <EnvironmentHero
          stationName={station.name}
          temperature={env.temperature}
          windSpeed={env.windSpeed}
          humidity={env.humidity}
          pressure={env.pressure}
          updatedText={env.updatedAt}
          sourceBadge={env.source}
          isStale={env.isStale}
        />

        {/* Supplementary Health & Resupply Card */}
        <div className="w-full lg:w-[32%] bg-white/35 backdrop-blur-xl rounded-2xl border border-white/60 p-5 md:p-6 shadow-xs flex flex-col justify-between hover:bg-white/45 transition-all duration-300">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-white/50">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Station Health Index
              </span>
              <StatusBadge status={telemetry.stationStatus || 'Operational'} size="sm" />
            </div>

            <div className="py-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-extrabold text-slate-900 font-mono tracking-tight">
                  {telemetry.healthScore || 88}
                </span>
                <span className="text-base font-semibold text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Composite telemetry health score across energy, water, infrastructure, and satellite links.
              </p>
            </div>
          </div>

          <div className="pt-3.5 border-t border-white/50 space-y-2.5 text-xs">
            <div className="flex justify-between items-center text-slate-700 bg-white/40 border border-white/60 rounded-xl px-3.5 py-2.5 backdrop-blur-xs">
              <span className="text-slate-500 font-medium">Next Resupply Vessel</span>
              <span className="font-bold text-slate-800 font-mono">
                {station.resupply.daysUntilNext} days
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-700 bg-white/40 border border-white/60 rounded-xl px-3.5 py-2.5 backdrop-blur-xs">
              <span className="text-slate-500 font-medium">Water Source Mode</span>
              <span className="font-bold text-slate-800">
                {currentStationCode === 'BHT' ? 'Seawater RO' : 'Lake Priyadarshini'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Station Systems Bento Grid Section */}
      <section className="space-y-5">
        {/* Header with Title and Bento Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Station Systems
              </h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="bg-white/60 border border-white/80 text-slate-700 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {systemsWithStatus.length} Total
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {nominalCount} Nominal
                </span>
                {alertCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFilterAlertsOnly(!filterAlertsOnly)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
                      filterAlertsOnly
                        ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-900 hover:bg-amber-500/25'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    {alertCount} Attention Required
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Modular bento overview of active generators, life-support, communications, and telemetry pipelines
            </p>
          </div>

          {/* Right Controls: Search + Density Switcher */}
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            {/* Quick search */}
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search systems..."
                className="w-full bg-white/40 border border-white/70 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 backdrop-blur-md transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Switcher: Bento vs Compact */}
            <div className="flex items-center bg-white/40 border border-white/70 rounded-xl p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setViewMode('bento')}
                title="Bento Grid View"
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'bento'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bento</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Compact Grid View"
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-white text-sky-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Grid2X2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categoryGroups.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !filterAlertsOnly;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (filterAlertsOnly) setFilterAlertsOnly(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                    : 'bg-white/35 border-white/60 text-slate-700 hover:bg-white/55'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-100' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* BENTO GRID OF SYSTEMS */}
        {filteredSystems.length === 0 ? (
          <div className="bg-white/30 backdrop-blur-xl border border-white/60 rounded-2xl p-12 text-center">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-400 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No systems found</h3>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or category filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setFilterAlertsOnly(false);
              }}
              className="mt-4 px-4 py-1.5 rounded-xl bg-sky-600 text-white text-xs font-semibold hover:bg-sky-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {filteredSystems.map((sys) => {
              const variant = getBentoVariant(sys);

              return (
                <SystemCard
                  key={sys.id}
                  system={sys}
                  name={sys.name}
                  status={sys.dynamicStatus}
                  primaryMetric={sys.dynamicMetric}
                  variant={variant}
                  onClick={() => navigate(`/station/${stationId}/systems/${sys.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default StationDashboard;
