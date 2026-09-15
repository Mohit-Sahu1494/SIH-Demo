import React, { useState } from 'react';
import { 
  AlertTriangle, ArrowDown, Settings, 
  ArrowRight, Info, CheckCircle2, RotateCcw
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

// --- MINIMAL COMPONENTS ---

const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
    {children}
  </h3>
);

const StatusText = ({ status, text }) => {
  const colors = {
    red: 'text-red-600',
    amber: 'text-amber-600',
    green: 'text-emerald-600',
    default: 'text-slate-600'
  };
  return <span className={`font-semibold ${colors[status] || colors.default}`}>{text}</span>;
};


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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 p-6 font-sans">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Impact Analysis</h1>
          <p className="text-slate-500 text-sm mt-0.5">Decision support & cascade prediction.</p>
        </div>
        <div className="flex gap-3">
          <select 
            className="bg-white border border-slate-300 text-sm rounded px-3 py-1.5 shadow-sm outline-none"
            value={eventId}
            onChange={(e) => { setEventId(e.target.value); setIsSimulatingFailure(false); }}
          >
            <option value="chpOverheat">CHP Overheating</option>
            <option value="pumpFailure">Pump Failure</option>
          </select>
          <select 
            className="bg-white border border-slate-300 text-sm rounded px-3 py-1.5 shadow-sm outline-none font-medium"
            value={station}
            onChange={(e) => { setStation(e.target.value); setIsSimulatingFailure(false); }}
          >
            <option value="bharati">Bharati Station</option>
            <option value="maitri">Maitri Station</option>
          </select>
        </div>
      </div>

      {/* 2. CRITICAL ALERT BANNER (Merged with "Why it matters" to save space) */}
      <div className={`bg-white border-l-4 ${isSimulatingFailure ? 'border-red-500' : 'border-amber-500'} border-y border-r border-slate-200 rounded-r shadow-sm p-5 mb-6 flex flex-col md:flex-row gap-6`}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className={`w-5 h-5 ${isSimulatingFailure ? 'text-red-500' : 'text-amber-500'}`} />
            <h2 className="text-lg font-bold text-slate-900 uppercase">
              {isSimulatingFailure ? scenarioDef.name.replace('Overheating', 'FAILURE') : scenarioDef.name}
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 ml-2">
              {scenarioDef.badge}
            </span>
          </div>
          
          <div className="flex gap-8 text-sm mt-3">
            <div><span className="text-slate-500">Severity:</span> <StatusText status={isSimulatingFailure ? 'red' : 'amber'} text={isSimulatingFailure ? 'CRITICAL' : scenarioDef.severity} /></div>
            <div><span className="text-slate-500">Current:</span> <span className="font-semibold">{isSimulatingFailure ? 'OFFLINE' : scenarioDef.currentValue}</span></div>
            <div><span className="text-slate-500">Normal:</span> <span className="font-semibold">{scenarioDef.normalAssumption}</span></div>
          </div>
        </div>

        {/* Minimal 'Why it matters' */}
        <div className="flex-1 border-l border-slate-100 pl-6 hidden md:block">
          <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5" /> Context
          </h4>
          <ul className="text-sm text-slate-600 list-disc pl-4 space-y-1">
            {scenarioDef.whyMatters.map((point, idx) => <li key={idx}>{point}</li>)}
          </ul>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* LEFT COL: Propagation Flow */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <SectionTitle>Event Propagation Flow</SectionTitle>
          
          <div className="flex flex-col ml-2 mt-4 space-y-3 relative">
            {/* Very minimal timeline/flow line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200 z-0"></div>

            {/* Root Cause (Hardcoded minimalist example) */}
            <div className="relative z-10 pl-6">
              <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-100 border-2 border-slate-300"></div>
              <p className="text-sm text-slate-500">Outside Temp Drop (-31°C) → Heating Demand (+23%)</p>
            </div>
            
            {/* Impact Chain mapping */}
            {activeState.impactChain?.map((node, idx) => (
              <div key={idx} className="relative z-10 pl-6">
                <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 bg-white ${
                  node.status === 'red' ? 'border-red-500' : 
                  node.status === 'amber' ? 'border-amber-500' : 'border-slate-300'
                }`}></div>
                <p className={`text-sm font-medium ${node.status === 'red' ? 'text-red-700' : node.status === 'amber' ? 'text-amber-700' : 'text-slate-800'}`}>
                  {node.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COL: Subsystem Impact & Metrics */}
        <div className="flex flex-col gap-6">
          
          <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <SectionTitle>Affected Subsystems</SectionTitle>
            <div className="space-y-3 mt-4">
              {activeState.affectedSystems?.map((sys, idx) => (
                <div key={idx} className="flex justify-between items-start border-b border-slate-50 pb-2 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{sys.name}</p>
                    <p className="text-xs text-slate-500">{sys.reason}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    sys.risk === 'Critical' ? 'text-red-700 bg-red-50' :
                    sys.risk === 'High' ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100'
                  }`}>
                    {sys.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <SectionTitle>Metrics Shift</SectionTitle>
            <table className="w-full text-sm mt-2">
              <tbody>
                {activeState.beforeAfter?.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 text-slate-500 w-1/3">{row.metric}</td>
                    <td className="py-2 text-slate-800 font-medium w-1/3">{row.current}</td>
                    <td className="py-2 w-8"><ArrowRight className="w-4 h-4 text-slate-300 mx-auto" /></td>
                    <td className={`py-2 font-semibold w-1/3 text-right ${isSimulatingFailure ? 'text-red-600' : 'text-amber-600'}`}>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Recommended Actions - Minimal List */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <SectionTitle>Recommended Actions</SectionTitle>
          <div className="space-y-4 mt-4">
            {activeState.actions?.map((act, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-sm mt-0.5 ${
                  act.p === 'P1' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {act.p}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{act.action}</p>
                  <p className="text-xs text-slate-500">{act.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projected Timeline */}
        <div className="bg-white border border-slate-200 rounded p-5 shadow-sm">
          <SectionTitle>Projected Timeline</SectionTitle>
          <div className="space-y-4 mt-4">
            {activeState.timeline?.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center border-b border-slate-50 pb-2 last:border-0">
                <span className="text-xs font-bold text-slate-400 w-16 shrink-0">{item.time}</span>
                <p className={`text-sm font-medium ${item.status === 'red' ? 'text-red-600' : 'text-slate-700'}`}>
                  {item.event}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. SIMULATION CONTROLS */}
      <div className="flex items-center gap-4 mt-8 pt-4 border-t border-slate-200">
        {!isSimulatingFailure ? (
          <button 
            onClick={handleSimulate}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm rounded transition-colors flex items-center gap-2 shadow-sm"
          >
            <Settings className="w-4 h-4" /> Simulate Failure Pattern
          </button>
        ) : (
          <button 
            onClick={handleReset}
            className="px-5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded transition-colors flex items-center gap-2 bg-white shadow-sm"
          >
             <RotateCcw className="w-4 h-4" /> Reset Scenario
          </button>
        )}
      </div>

    </div>
  );
}