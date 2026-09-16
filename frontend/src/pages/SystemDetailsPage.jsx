import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, ArrowRight, ShieldCheck, Clock, CheckCircle2, 
  Wrench, ChevronRight, Zap, Thermometer, Gauge, Settings, Radio,
  AlertTriangle, Flame, Droplets, Fuel, AlertOctagon
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

// --- PREMIUM TOOLTIP ---
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700/50 rounded-lg shadow-2xl px-4 py-3 text-sm min-w-[160px]">
      <div className="font-medium text-slate-400 border-b border-slate-700/50 pb-2 mb-2 flex items-center justify-between">
        <span>Time: {label}</span>
        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 mt-1.5">
          <span className="text-xs font-semibold capitalize" style={{ color: p.color }}>
            {p.name || p.dataKey}:
          </span>
          <span className="font-mono font-bold text-white text-xs">
            {p.value} {p.dataKey === 'temp' ? '°C' : '%'}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SystemDetailsPage() {
  const { stationId = 'bharati', systemId = 'chp-2' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  
  const system = station.systems.find((s) => s.id === systemId) || station.systems[0];
  
  // Real-time telemetry subscription
  const [telemetryState, setTelemetryState] = useState(() => telemetryEngine.getState());

  useEffect(() => {
    const unsub = telemetryEngine.subscribe((state) => {
      setTelemetryState(state);
    });
    return () => unsub();
  }, []);

  const telemetry = telemetryState[currentStationCode] || telemetryState.BHT || {};
  const stress = telemetryState.scenarioStress || {};

  // Extract dynamic values for generators / CHPs
  const isChp1 = system.id === 'chp-1' || system.id === 'dg-1';
  const isChp2 = system.id === 'chp-2' || system.id === 'dg-2';
  const isChp3 = system.id === 'chp-3' || system.id === 'dg-3';
  const isGenerator = isChp1 || isChp2 || isChp3;

  const currentChpData = isChp1
    ? telemetry.power?.chp1
    : isChp2
    ? telemetry.power?.chp2
    : isChp3
    ? telemetry.power?.chp3
    : null;

  // Compute live numeric values
  const currentLoadNum = useMemo(() => {
    if (currentChpData?.load) {
      return parseFloat(currentChpData.load);
    }
    if (system.id.includes('fuel')) return telemetry.fuel?.reservePercent || 61;
    if (system.id.includes('hvac')) return telemetry.heating?.demandPercent || 72;
    if (system.id.includes('battery')) return telemetry.battery?.levelPercent || 88;
    return parseFloat(system.specs?.load || '64');
  }, [currentChpData, system, telemetry]);

  const currentTempNum = useMemo(() => {
    if (currentChpData?.temp) {
      const match = String(currentChpData.temp).match(/\d+(\.\d+)?/);
      if (match) return parseFloat(match[0]);
    }
    if (system.id.includes('hvac')) return 20.5;
    if (system.id.includes('battery')) return parseFloat(String(telemetry.battery?.temperature || '21.4'));
    return parseFloat(system.specs?.temperature || '74');
  }, [currentChpData, system, telemetry]);

  // Determine failure condition
  const isGeneratorFailed =
    (isChp1 && telemetry.power?.chp1?.status === 'Critical') ||
    (isChp2 && telemetry.power?.chp2?.status === 'Critical') ||
    (isChp3 && (telemetry.power?.chp3?.status === 'Critical' || stress.chpFailure === 'CHP-3'));
  
  const isPumpFailed = (system.id === 'sea-water-pump' || system.id === 'lake-water-pump') && telemetry.water?.pumpStatus === 'Critical';
  const isSatFailed = system.id === 'satellite-communication' && telemetry.satellite?.isLost;
  const isFuelFailed = system.id.includes('fuel') && (telemetry.fuel?.reservePercent <= 10);

  const isFailed = isGeneratorFailed || isPumpFailed || isSatFailed || isFuelFailed;
  const currentStatus = isFailed ? 'Critical' : isGenerator && currentLoadNum > 90 ? 'Warning' : system.status;
  const currentHealth = isFailed ? 32 : isGenerator && currentLoadNum > 90 ? 71 : (system.healthScore || 92);

  // Dynamic engineering specs ribbon calculation
  const liveSpecs = useMemo(() => {
    const base = { ...(system.specs || {}) };
    if (isGenerator) {
      base.load = `${currentLoadNum}%`;
      base.temperature = isFailed ? `${currentTempNum}°C (Overheat)` : `${currentTempNum}°C`;
      base.output = currentLoadNum > 0 ? `${Math.round(120 * currentLoadNum / 100)} kW` : '0 kW (Tripped)';
      base.fuelRate = currentLoadNum > 0 ? `${(10.5 + currentLoadNum * 0.08).toFixed(1)} L/h` : '0.0 L/h';
      base.runtime = base.runtime || '1,140 hrs';
    } else if (system.id.includes('fuel')) {
      base.reserve = `${telemetry.fuel?.reservePercent || 61}%`;
      base.currentVolume = `${(telemetry.fuel?.currentLiters || 146400).toLocaleString()} L`;
      base.burnRate = `${(telemetry.fuel?.dailyBurnLiters || 4150).toLocaleString()} L/day`;
      base.runway = `${telemetry.fuel?.runwayDays || 35} Days`;
      base.resupplyStatus = telemetry.fuel?.isDeficit ? 'Deficit Warning' : 'Nominal';
    } else if (system.id.includes('pump')) {
      base.flowRate = isPumpFailed ? '0 L/h (Tripped)' : `${(telemetry.water?.pumpFlowLh || 3200).toLocaleString()} L/h`;
      base.status = isPumpFailed ? 'Motor Fault' : 'Running';
      base.pressure = isPumpFailed ? '0.0 bar' : '4.2 bar';
      base.waterSource = telemetry.water?.sourceName || 'Priyadarshini Lake';
    } else if (system.id.includes('hvac')) {
      base.thermalDemand = `${telemetry.heating?.demandPercent || 72}%`;
      base.supplyStatus = telemetry.heating?.status || 'Nominal';
      base.outdoorTemp = `${telemetry.environment?.temperature || -16.4}°C`;
      base.indoorSetPoint = '+20.5°C';
    } else if (system.id.includes('satellite')) {
      base.linkStatus = telemetry.satellite?.isLost ? 'LINK LOST' : 'Locked';
      base.latency = telemetry.satellite?.isLost ? '0 ms' : `${telemetry.satellite?.latencyMs || 680} ms`;
      base.packetLoss = `${telemetry.satellite?.packetLoss || 0}%`;
    } else if (system.id.includes('battery')) {
      base.batterySOC = `${telemetry.battery?.levelPercent || 88}%`;
      base.cellTemp = `${telemetry.battery?.temperature || '21.4'}°C`;
      base.dischargeLoad = `${telemetry.battery?.loadPercent || 42}%`;
    }
    return base;
  }, [system, isGenerator, currentLoadNum, currentTempNum, isFailed, isPumpFailed, telemetry]);

  // Rolling live history trend data
  const [history, setHistory] = useState(() => {
    const baseLoad = isGenerator ? (isFailed ? 0 : 72) : 70;
    const baseTemp = isGenerator ? (isFailed ? 104 : 74) : 74;
    return [
      { time: '11:00', load: 72, temp: 74 },
      { time: '11:01', load: 74, temp: 75 },
      { time: '11:02', load: 73, temp: 75 },
      { time: '11:03', load: 75, temp: 76 },
      { time: '11:04', load: 71, temp: 74 },
      { time: '11:05', load: baseLoad, temp: baseTemp },
    ];
  });

  // Push new live telemetry point on change or 7s cycle
  useEffect(() => {
    const now = new Date();
    const timeLabel = now.toTimeString().slice(0, 5) + ':' + String(now.getSeconds()).padStart(2, '0');
    setHistory((prev) => {
      const next = [
        ...prev.slice(-9),
        {
          time: timeLabel,
          load: currentLoadNum,
          temp: currentTempNum,
        },
      ];
      return next;
    });
  }, [currentLoadNum, currentTempNum]);

  // Health Gauge Logic
  const healthColor = currentHealth > 80 ? '#10b981' : currentHealth > 50 ? '#f59e0b' : '#ef4444';
  const gaugeData = [
    { name: 'Health', value: currentHealth },
    { name: 'Missing', value: 100 - currentHealth }
  ];

  const maintenanceLogs = system.maintenance?.recentLogs || [
    { date: '12 Sep 2026', note: 'Routine cooling fluid flush and filter replacement completed.' },
    { date: '05 Aug 2026', note: 'Vibration analysis on main bearing - within acceptable limits.' }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-3 sm:p-5 md:p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
        
        {/* 1. PREMIUM HEADER (Mobile Responsive) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-4 sm:p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none hidden sm:block">
            <Settings className="w-64 h-64 text-slate-900 animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="relative z-10 min-w-0">
            <nav className="flex items-center gap-1.5 text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-2">
              <Link to={`/station/${stationId}`} className="hover:text-sky-600 transition-colors">{station.name}</Link>
              <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
              <span>Infrastructure</span>
              <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
              <span className="text-slate-700 truncate">{system.name}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900">{system.name}</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">7s Live Sync</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{system.type} — {system.category}</p>
          </div>

          <div className="relative z-10 bg-slate-50 border border-slate-100 rounded-lg p-2.5 sm:p-3 flex items-center gap-3 sm:gap-4 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Condition</p>
              <StatusBadge status={currentStatus} className="scale-105 origin-left" />
            </div>
            <div className="w-px h-8 sm:h-10 bg-slate-200 mx-1"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Uptime</p>
              <p className="font-mono text-xs sm:text-sm font-bold text-slate-700">{isFailed ? 'TRIPPED' : '99.8%'}</p>
            </div>
          </div>
        </div>

        {/* ACTIVE FAILURE ALERT BANNER IF CRITICAL */}
        {isFailed && (
          <div className="bg-rose-50 border-l-4 border-rose-500 rounded-lg p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-bold text-rose-900">
                  CRITICAL ANOMALY DETECTED: {system.name.toUpperCase()} IS OFFLINE
                </p>
                <p className="text-[11px] sm:text-xs text-rose-700 mt-0.5">
                  {isGeneratorFailed
                    ? `Alternator overheat at ${currentTempNum}°C exceeded safety envelope (94°C max). Unit circuit breaker tripped; load dropped to 0 kW.`
                    : isPumpFailed
                    ? 'Sea water intake pump motor tripped. Fresh water RO production starved.'
                    : isFuelFailed
                    ? 'Fuel level depleted below 10%. Emergency shutdown initiated.'
                    : 'System connectivity disrupted.'}
                </p>
              </div>
            </div>
            <Link
              to={`/station/${stationId}/simulator`}
              className="text-xs font-bold text-rose-900 bg-white/80 border border-rose-200 px-3 py-1.5 rounded hover:bg-white transition-colors shrink-0"
            >
              Tune in Simulator →
            </Link>
          </div>
        )}

        {/* 2. DYNAMIC ENGINEERING DATA RIBBON (Mobile Responsive 2-col to 5-col) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
          {Object.entries(liveSpecs).slice(0, 5).map(([key, val], idx) => {
            const icons = [<Zap key="zap" />, <Gauge key="gauge" />, <Thermometer key="thermo" />, <Activity key="act" />, <Settings key="set" />];
            const isAlertVal = String(val).toLowerCase().includes('overheat') || String(val).toLowerCase().includes('tripped') || String(val).toLowerCase().includes('fault');

            return (
              <div
                key={key}
                className={`bg-white rounded-xl border p-3.5 sm:p-4 relative overflow-hidden transition-all ${
                  isAlertVal ? 'border-rose-300 bg-rose-50/40 shadow-xs' : 'border-slate-200/80 shadow-xs hover:border-sky-200'
                }`}
              >
                <div className="absolute top-0 right-0 p-2.5 sm:p-3 opacity-10 text-slate-900">
                  {icons[idx % icons.length] && React.cloneElement(icons[idx % icons.length], { className: "w-7 h-7 sm:w-8 sm:h-8" })}
                </div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10 truncate">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div
                  className={`font-mono text-base sm:text-lg font-bold relative z-10 truncate ${
                    isAlertVal ? 'text-rose-600' : 'text-slate-800'
                  }`}
                >
                  {val}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. MAIN DASHBOARD GRID (Mobile Stacked, Desktop 2/3 + 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          
          {/* CHART: 2/3 Width */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-2 mb-4 sm:mb-6">
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-600" />
                  <span>Telemetry Trend (Live Real-Time)</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  Dynamic load & thermal envelope updating continuously on 7s cycle
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100 self-start sm:self-auto">
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_5px_#14b8a6]" /> Load (%)
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_5px_#fb7185]" /> Temp (°C)
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[250px] sm:min-h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isFailed ? "#f43f5e" : "#14b8a6"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isFailed ? "#f43f5e" : "#14b8a6"} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} domain={[0, 120]} />
                  <Tooltip content={<ChartTooltip />} cursor={{stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4'}} />
                  <Area type="monotone" dataKey="temp" name="Temperature" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="load" name="Load" stroke={isFailed ? "#e11d48" : "#0d9488"} strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {isFailed && (
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-rose-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Real-time thermal spike & load drop captured on graph
                </span>
                <span className="font-mono font-bold">TEMP: {currentTempNum}°C · LOAD: {currentLoadNum}%</span>
              </div>
            )}
          </div>

          {/* HEALTH & MAINTENANCE: 1/3 Width */}
          <div className="flex flex-col gap-4 sm:gap-5">
            
            {/* Real SCADA Style Gauge */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              <h2 className="absolute top-5 left-5 text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Health Index</h2>
              
              <div className="relative w-40 h-24 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData} cx="50%" cy="100%"
                      startAngle={180} endAngle={0}
                      innerRadius={60} outerRadius={80}
                      paddingAngle={2} dataKey="value" stroke="none"
                    >
                      <Cell fill={healthColor} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Gauge Center Text */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">
                    {currentHealth}<span className="text-xl text-slate-400">%</span>
                  </span>
                </div>
              </div>
              <span className={`mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${currentHealth > 80 ? 'text-emerald-700 bg-emerald-50' : currentHealth > 50 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                {currentHealth > 80 ? 'Optimal state' : currentHealth > 50 ? 'Degraded state' : 'Critical state'}
              </span>
            </div>

            {/* Modern Maintenance Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5 flex-1">
              <div className="flex justify-between items-center mb-4 sm:mb-5">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">Maintenance</h2>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              {/* Next Action Highlight */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-lg p-3 mb-4 sm:mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">Next Inspection</p>
                  <p className="font-mono text-xs sm:text-sm font-bold text-slate-800">T - {system.maintenance?.nextInspectionDays || 14} Days</p>
                </div>
                <Wrench className="w-5 h-5 text-sky-500 opacity-50" />
              </div>

              {/* Timeline */}
              <div className="space-y-3 sm:space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                {maintenanceLogs.map((log, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 sm:gap-4">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    <div>
                      <p className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-500 mb-0.5">{log.date}</p>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">{log.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemDetailsPage;