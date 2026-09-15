import React, { useState } from 'react';
import { 
  AlertTriangle, Settings, ArrowRight, Info, CheckCircle2, 
  RotateCcw, Activity, ChevronRight, Zap, Droplets, Thermometer, Clock
} from 'lucide-react';

// --- MOCK DATA STRUCTURE (Unchanged) ---
const impactScenarios = {
  bharati: {
    chpOverheat: {
      id: 'chpOverheat',
      name: 'CHP-3 Overheating',
      severity: 'HIGH',
      status: 'Active',
      currentValue: '94°C',
      normalAssumption: '65–85°C',
      trend: '+7°C in last 10 minutes',
      badge: 'SIMULATED',
      whyMatters: [
        "CHP-3 is one of three available CHP units.",
        "A failure reduces power and heating redundancy.",
        "Remaining units may need to carry increased load."
      ],
      warningState: {
        impactChain: [
          { label: 'CHP-3 Warning', status: 'amber' },
          { label: 'Available Power Reduced (300 → 200 kVA)', status: 'amber' },
          { label: 'Remaining CHP Load Increases (+18%)', status: 'amber' },
          { label: 'Fuel Consumption Increases (+12%)', status: 'amber' },
          { label: 'Fuel Runway Decreases (46 → 41 days)', status: 'red' },
          { label: 'Operational Risk: HIGH', status: 'red' }
        ],
        affectedSystems: [
          { name: 'HVAC', risk: 'High', reason: 'Reduced heating redundancy.' },
          { name: 'Power Distribution', risk: 'High', reason: 'Available generation capacity reduced.' },
          { name: 'Water Pump', risk: 'Medium', reason: 'Dependent on station power.' },
          { name: 'Laboratories', risk: 'Medium', reason: 'Non-critical loads may need reduction.' },
          { name: 'Cold Storage', risk: 'Medium', reason: 'Must retain uninterrupted power.' }
        ],
        beforeAfter: [
          { metric: 'Available CHP', current: '300 kVA', after: '200 kVA' },
          { metric: 'Heating Capacity', current: 'Normal', after: 'Reduced' },
          { metric: 'Fuel Consumption', current: 'Baseline', after: '+12%' },
          { metric: 'Fuel Runway', current: '46 days', after: '41 days' }
        ],
        timeline: [
          { time: 'NOW', event: 'CHP-3 temperature warning detected', status: 'amber' },
          { time: '+30 MIN', event: 'Temperature trend remains elevated', status: 'amber' },
          { time: '+2 HOURS', event: 'Potential shutdown risk increases', status: 'red' },
          { time: '+6 HOURS', event: 'Fuel consumption increases across remaining units', status: 'amber' }
        ],
        actions: [
          { p: 'P1', action: 'Inspect CHP-3 cooling system', reason: 'Temperature is rising above simulated safe range.' },
          { p: 'P2', action: 'Shift non-critical electrical load away from CHP-3', reason: 'Reduces heat generation in the unit.' },
          { p: 'P3', action: 'Enable HVAC conservation mode if necessary', reason: 'Preserves heating redundancy for critical zones.' }
        ]
      },
      failureState: {
        impactChain: [
          { label: 'CHP-3 OFFLINE', status: 'red' },
          { label: 'Available Power Reduced to 200 kVA', status: 'red' },
          { label: 'Remaining CHP Load Increased (+18%)', status: 'amber' },
          { label: 'Fuel Runway Decreased to 41 days', status: 'red' },
          { label: 'Operational Risk: CRITICAL', status: 'red' }
        ],
        affectedSystems: [
          { name: 'HVAC', risk: 'Critical', reason: 'Heating redundancy lost. Active conservation required.' },
          { name: 'Power Distribution', risk: 'Critical', reason: 'Operating at near maximum capacity.' },
          { name: 'Water Pump', risk: 'High', reason: 'Vulnerable to further power disruptions.' },
          { name: 'Laboratories', risk: 'High', reason: 'Non-critical loads MUST be shed immediately.' },
          { name: 'Cold Storage', risk: 'Medium', reason: 'Running on backup provision.' }
        ],
        beforeAfter: [
          { metric: 'Available CHP', current: '300 kVA', after: '200 kVA (ACTUAL)' },
          { metric: 'Heating Capacity', current: 'Normal', after: 'Compromised' },
          { metric: 'Fuel Consumption', current: 'Baseline', after: '+12% (ACTIVE)' },
          { metric: 'Fuel Runway', current: '46 days', after: '41 days (UPDATED)' }
        ],
        timeline: [
          { time: 'NOW', event: 'CHP-3 HAS FAILED', status: 'red' },
          { time: '+15 MIN', event: 'Automated load shedding initiated', status: 'amber' },
          { time: '+1 HOUR', event: 'Fuel consumption baseline recalculated', status: 'amber' }
        ],
        actions: [
          { p: 'P1', action: 'Execute Load Shedding Protocol Alpha', reason: 'Prevents cascade failure of CHP-1 and CHP-2.' },
          { p: 'P2', action: 'Dispatch maintenance team to CHP-3', reason: 'Immediate repair assessment required.' },
          { p: 'P3', action: 'Lock HVAC in conservation mode', reason: 'Protects critical infrastructure from freezing.' }
        ]
      }
    },
    pumpFailure: {
      id: 'pumpFailure',
      name: 'Sea Water Pump Failure',
      severity: 'MEDIUM',
      status: 'Warning',
      currentValue: 'Low Flow',
      normalAssumption: '15 L/s',
      trend: 'Declining',
      badge: 'LIVE',
      whyMatters: ["Sea water intake is critical for Bharati's desalination plant.", "Affects fresh water supply."],
      warningState: { impactChain: [], affectedSystems: [], beforeAfter: [], timeline: [], actions: [] },
      failureState: { impactChain: [], affectedSystems: [], beforeAfter: [], timeline: [], actions: [] }
    }
  },
  maitri: {
    chpOverheat: {
      id: 'chpOverheat',
      name: 'Power Gen Overheating',
      severity: 'HIGH',
      status: 'Active',
      currentValue: '89°C',
      normalAssumption: '70°C',
      trend: '+5°C',
      badge: 'SIMULATED',
      whyMatters: ["Maitri relies heavily on continuous power generation for life support."],
      warningState: { impactChain: [], affectedSystems: [], beforeAfter: [], timeline: [], actions: [] },
      failureState: { impactChain: [], affectedSystems: [], beforeAfter: [], timeline: [], actions: [] }
    }
  }
};

// --- MINIMAL PREMIUM COMPONENTS ---
const SectionTitle = ({ children }) => (
  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
    {children}
  </h3>
);

export default function ImpactAnalysis() {
  const [station, setStation] = useState('bharati');
  const [eventId, setEventId] = useState('chpOverheat');
  const [isSimulatingFailure, setIsSimulatingFailure] = useState(false);

  const scenarioDef = impactScenarios[station]?.[eventId] || impactScenarios.bharati.chpOverheat;
  const activeState = isSimulatingFailure && scenarioDef.failureState 
    ? scenarioDef.failureState 
    : (scenarioDef.warningState || { impactChain: [], affectedSystems: [], beforeAfter: [], timeline: [], actions: [] });

  const handleSimulate = () => setIsSimulatingFailure(true);
  const handleReset = () => setIsSimulatingFailure(false);

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-5">
        
        {/* 1. PREMIUM HEADER & CONTROLS */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
          {/* Background Watermark */}
          <div className="absolute -right-12 -top-12 opacity-[0.03] pointer-events-none">
            <Activity className="w-64 h-64 text-slate-900" />
          </div>

          <div className="relative z-10">
            <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              <span className="text-slate-500">Digital Twin</span>
              <ChevronRight className="w-3 h-3 opacity-50" />
              <span className="text-slate-700">Impact Analysis</span>
            </nav>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Cascade Prediction</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Live Engine</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">Simulate and evaluate equipment failure propagation.</p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-3 bg-slate-50 border border-slate-100 rounded-lg p-2.5">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">Target Station</p>
              <select 
                className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-md px-3 py-1.5 shadow-sm outline-none focus:ring-2 focus:ring-sky-100 w-full sm:w-40"
                value={station}
                onChange={(e) => { setStation(e.target.value); setIsSimulatingFailure(false); }}
              >
                <option value="bharati">Bharati (BHT)</option>
                <option value="maitri">Maitri (MTR)</option>
              </select>
            </div>
            <div className="hidden sm:block w-px bg-slate-200 mx-1"></div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 px-1">Scenario Event</p>
              <select 
                className="bg-white border border-slate-200 text-sm font-semibold text-slate-700 rounded-md px-3 py-1.5 shadow-sm outline-none focus:ring-2 focus:ring-sky-100 w-full sm:w-56"
                value={eventId}
                onChange={(e) => { setEventId(e.target.value); setIsSimulatingFailure(false); }}
              >
                <option value="chpOverheat">CHP Thermal Overload</option>
                <option value="pumpFailure">Pump Flow Failure</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. CRITICAL ALERT BANNER */}
        <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row transition-all duration-300 ${
          isSimulatingFailure ? 'shadow-[inset_4px_0_0_#ef4444]' : 'shadow-[inset_4px_0_0_#f59e0b]'
        }`}>
          <div className="p-5 md:p-6 flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isSimulatingFailure ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {isSimulatingFailure ? scenarioDef.name.replace('Overheating', 'CRITICAL FAILURE') : scenarioDef.name}
                </h2>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">{scenarioDef.id}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm mt-4 bg-slate-50 border border-slate-100 rounded-lg p-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Severity</span> 
                <span className={`font-bold px-2 py-0.5 rounded text-xs uppercase tracking-wider ${
                  isSimulatingFailure ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {isSimulatingFailure ? 'CRITICAL' : scenarioDef.severity}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Current Output</span> 
                <span className={`font-mono text-lg font-bold ${isSimulatingFailure ? 'text-red-600' : 'text-slate-800'}`}>
                  {isSimulatingFailure ? 'OFFLINE' : scenarioDef.currentValue}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Normal Range</span> 
                <span className="font-mono text-sm font-semibold text-slate-600 mt-1 block">{scenarioDef.normalAssumption}</span>
              </div>
            </div>
          </div>

          {/* Context / Why it matters */}
          <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-100 p-5 md:p-6 w-full md:w-80 shrink-0">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Operational Context
            </h4>
            <ul className="text-sm text-slate-700 font-medium space-y-2 leading-relaxed">
              {scenarioDef.whyMatters.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" /> {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. MAIN DASHBOARD COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* LEFT COL: Propagation Flow */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <SectionTitle>Event Propagation Map</SectionTitle>
            
            <div className="relative pl-4 mt-6 space-y-6">
              {/* Timeline Track */}
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 z-0"></div>

              {/* Root Cause */}
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center shrink-0 shadow-sm">
                  <Thermometer className="w-3 h-3 text-slate-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Root Catalyst</p>
                  <p className="text-sm font-bold text-slate-800">Outside Temp (-31°C) → Heating Demand (+23%)</p>
                </div>
              </div>
              
              {/* Impact Nodes */}
              {activeState.impactChain?.map((node, idx) => (
                <div key={idx} className="relative z-10 flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                    node.status === 'red' ? 'border-red-500 shadow-red-100' : 
                    node.status === 'amber' ? 'border-amber-500 shadow-amber-100' : 'border-slate-300'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${node.status === 'red' ? 'bg-red-500' : node.status === 'amber' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-bold leading-tight ${node.status === 'red' ? 'text-red-700' : node.status === 'amber' ? 'text-amber-700' : 'text-slate-800'}`}>
                      {node.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COL: Subsystem Impact & Metrics */}
          <div className="flex flex-col gap-5">
            
            {/* Affected Subsystems */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
              <SectionTitle>Affected Subsystems</SectionTitle>
              <div className="space-y-3 mt-4">
                {activeState.affectedSystems?.map((sys, idx) => (
                  <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{sys.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{sys.reason}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded border ${
                      sys.risk === 'Critical' ? 'text-red-700 bg-red-50 border-red-200' :
                      sys.risk === 'High' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {sys.risk}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics Shift */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
              <SectionTitle>Metrics Displacement</SectionTitle>
              <table className="w-full text-sm mt-2">
                <tbody className="divide-y divide-slate-100">
                  {activeState.beforeAfter?.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 text-slate-500 font-semibold w-1/3 text-xs uppercase tracking-wider">{row.metric}</td>
                      <td className="py-3 text-slate-800 font-mono font-bold w-1/3">{row.current}</td>
                      <td className="py-3 w-8 text-center"><ArrowRight className="w-4 h-4 text-slate-300 inline-block" /></td>
                      <td className={`py-3 font-mono font-bold w-1/3 text-right ${isSimulatingFailure ? 'text-red-600' : 'text-amber-600'}`}>
                        {row.after}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* 4. ACTIONS & TIMELINE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
          
          {/* Recommended Actions */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <SectionTitle>Standard Operating Procedures</SectionTitle>
            <div className="space-y-4 mt-4">
              {activeState.actions?.map((act, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded mt-0.5 border ${
                    act.p === 'P1' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {act.p}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{act.action}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{act.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projected Timeline */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
            <SectionTitle>Projection Timeline</SectionTitle>
            <div className="space-y-4 mt-4">
              {activeState.timeline?.map((item, idx) => (
                <div key={idx} className="flex gap-4 items-center p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-1.5 w-20 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-xs font-bold text-slate-600">{item.time}</span>
                  </div>
                  <p className={`text-sm font-bold ${item.status === 'red' ? 'text-red-600' : 'text-slate-800'}`}>
                    {item.event}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* 5. SIMULATION CONTROLS */}
        <div className="flex items-center gap-4 mt-6 pt-4">
          {!isSimulatingFailure ? (
            <button 
              onClick={handleSimulate}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 shadow-md"
            >
              <Settings className="w-4 h-4" /> Run Failure Simulation
            </button>
          ) : (
            <button 
              onClick={handleReset}
              className="px-6 py-3 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors flex items-center gap-2 bg-white shadow-sm"
            >
               <RotateCcw className="w-4 h-4" /> Reset Environment
            </button>
          )}
        </div>

      </div>
    </div>
  );
}