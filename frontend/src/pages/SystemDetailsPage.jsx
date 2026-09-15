import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Activity, ArrowRight, ShieldCheck, Clock, CheckCircle2, 
  Wrench, ChevronRight, Zap, Thermometer, Gauge, Settings, Radio
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
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color, boxShadow: `0 0 8px ${p.color}` }} />
            <span className="text-slate-300 text-xs uppercase tracking-wider">{p.dataKey === 'load' ? 'Sys Load' : 'Thermal'}</span>
          </div>
          <span className="font-mono font-bold text-white text-base">
            {p.value}<span className="text-[10px] text-slate-400 ml-0.5">{p.dataKey === 'load' ? '%' : '°C'}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

// --- MAIN COMPONENT ---
export function SystemDetailsPage() {
  const { stationId = 'bharati', systemId = 'chp-2' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  
  const system = station.systems.find((s) => s.id === systemId) || station.systems[0];
  const telemetry = telemetryEngine.calculateTelemetry(currentStationCode);

  const trendData = [
    { time: '08:00', load: 68, temp: 72 }, { time: '09:00', load: 70, temp: 73 },
    { time: '10:00', load: 74, temp: 75 }, { time: '11:00', load: 72, temp: 74 },
    { time: '12:00', load: 76, temp: 77 }, { time: '13:00', load: 75, temp: 76 },
    { time: '14:00', load: 71, temp: 74 }, { time: '15:00', load: 73, temp: 75 },
  ];

  const isChp3Tripped = system.id === 'chp-3' && telemetry.injections?.chpFailure;
  const currentStatus = isChp3Tripped ? 'Critical' : system.status;
  const currentHealth = isChp3Tripped ? 32 : (system.healthScore || 92);

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
    <div className="min-h-screen bg-[#F1F5F9] p-4 md:p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* 1. PREMIUM HEADER */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute -right-16 -top-16 opacity-5 pointer-events-none">
            <Settings className="w-64 h-64 text-slate-900 animate-[spin_60s_linear_infinite]" />
          </div>

          <div className="relative z-10">
            <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              <Link to={`/station/${stationId}`} className="hover:text-sky-600 transition-colors">{station.name}</Link>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span>Infrastructure</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-slate-700">{system.name}</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{system.name}</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Sync</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">{system.type} — {system.category}</p>
          </div>

          <div className="relative z-10 bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center gap-4 min-w-[200px]">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Condition</p>
              <StatusBadge status={currentStatus} className="scale-110 origin-left" />
            </div>
            <div className="w-px h-10 bg-slate-200 mx-1"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Uptime</p>
              <p className="font-mono text-sm font-bold text-slate-700">99.8%</p>
            </div>
          </div>
        </div>

        {/* 2. ENGINEERING DATA RIBBON */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(system.specs || {}).slice(0, 5).map(([key, val], idx) => {
            const icons = [<Zap/>, <Gauge/>, <Thermometer/>, <Activity/>, <Settings/>];
            return (
              <div key={key} className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-4 relative overflow-hidden group hover:border-sky-200 transition-colors">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-slate-900 group-hover:text-sky-600 transition-colors">
                  {icons[idx % icons.length] && React.cloneElement(icons[idx % icons.length], { className: "w-8 h-8" })}
                </div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 relative z-10">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <div className="font-mono text-lg font-bold text-slate-800 relative z-10">
                  {val}
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. MAIN DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* CHART: 2/3 Width */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col p-5">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Telemetry Trend</h2>
                <p className="text-xs text-slate-500 mt-1">Real-time load and thermal envelope (8H)</p>
              </div>
              <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase">
                  <span className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_5px_#14b8a6]" /> Load
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 uppercase">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_5px_#fb7185]" /> Temp
                </div>
              </div>
            </div>

            <div className="flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb7185" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#fb7185" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} domain={[50, 100]} />
                  <Tooltip content={<ChartTooltip />} cursor={{stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4'}} />
                  <Area type="monotone" dataKey="temp" stroke="#fb7185" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" activeDot={{ r: 5, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="load" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" activeDot={{ r: 5, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* HEALTH & MAINTENANCE: 1/3 Width */}
          <div className="flex flex-col gap-5">
            
            {/* Real SCADA Style Gauge */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
              <h2 className="absolute top-5 left-5 text-sm font-bold text-slate-900 uppercase tracking-wider">Health Index</h2>
              
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
                  <span className="font-mono text-4xl font-black text-slate-800 tracking-tighter">
                    {currentHealth}<span className="text-xl text-slate-400">%</span>
                  </span>
                </div>
              </div>
              <span className={`mt-2 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest ${currentHealth > 80 ? 'text-emerald-700 bg-emerald-50' : currentHealth > 50 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50'}`}>
                {currentHealth > 80 ? 'Optimal state' : currentHealth > 50 ? 'Degraded state' : 'Critical state'}
              </span>
            </div>

            {/* Modern Maintenance Timeline */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 flex-1">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Maintenance</h2>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>

              {/* Next Action Highlight */}
              <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-100 rounded-lg p-3 mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-0.5">Next Inspection</p>
                  <p className="font-mono text-sm font-bold text-slate-800">T - {system.maintenance?.nextInspectionDays || 14} Days</p>
                </div>
                <Wrench className="w-5 h-5 text-sky-500 opacity-50" />
              </div>

              {/* Timeline */}
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
                {maintenanceLogs.map((log, idx) => (
                  <div key={idx} className="relative flex items-start gap-4">
                    <div className="w-4 h-4 rounded-full bg-white border-2 border-emerald-400 flex items-center justify-center shrink-0 mt-0.5 z-10 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                    <div>
                      <p className="text-[11px] font-mono font-bold text-slate-500 mb-0.5">{log.date}</p>
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