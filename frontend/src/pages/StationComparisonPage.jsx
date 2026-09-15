import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowRight, Activity, Radio, Map } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

// --- MAIN COMPONENT ---
export function StationComparisonPage() {
  const navigate = useNavigate();
  const telemetry = telemetryEngine.getState();
  const bhtTel = telemetry.BHT || {};
  const mtrTel = telemetry.MTR || {};

  const bhtConfig = STATIONS.BHT;
  const mtrConfig = STATIONS.MTR;

  // SAFE Helper to determine cell background (Fixed the .includes error)
  const getCellBg = (status, val) => {
    // Exact match for direct status strings
    if (status === 'Critical') return 'bg-red-50/50';
    if (status === 'Warning') return 'bg-amber-50/50';
    
    // Safe string check for text containing keywords
    if (typeof val === 'string') {
      if (val.includes('Critical') || val.includes('Warning')) {
         return val.includes('Critical') ? 'bg-red-50/50' : 'bg-amber-50/50';
      }
    }
    
    // Numeric health score checks
    if (typeof val === 'number') {
      if (val < 60) return 'bg-red-50/50';
      if (val < 85) return 'bg-amber-50/50';
    }

    return 'bg-white';
  };

  const comparisonRows = [
    {
      section: 'Core Telemetry',
      metrics: [
        {
          label: 'Operational Status',
          mtrVal: mtrTel.stationStatus || 'Operational',
          bhtVal: bhtTel.stationStatus || 'Operational',
          renderMtr: <StatusBadge status={mtrTel.stationStatus || 'Operational'} />,
          renderBht: <StatusBadge status={bhtTel.stationStatus || 'Operational'} />
        },
        {
          label: 'Health Index',
          mtrVal: mtrTel.healthScore || 91,
          bhtVal: bhtTel.healthScore || 88,
          renderMtr: <span className="font-mono text-sm font-bold text-slate-900">{mtrTel.healthScore || 91}%</span>,
          renderBht: <span className="font-mono text-sm font-bold text-slate-900">{bhtTel.healthScore || 88}%</span>
        },
        {
          label: 'Active Alerts',
          mtrVal: '1 Advisory',
          bhtVal: '3 Warnings',
          renderMtr: <span className="font-mono text-xs font-bold text-slate-700">1 Advisory</span>,
          renderBht: <span className="font-mono text-xs font-bold text-amber-700">3 Warnings</span>
        }
      ]
    },
    {
      section: 'Environmental Data',
      metrics: [
        {
          label: 'Outside Temperature',
          mtrVal: mtrTel.environment?.temperature || -18, 
          bhtVal: bhtTel.environment?.temperature || -31,
          renderMtr: <span className="font-mono text-sm font-bold text-slate-800">{mtrTel.environment?.temperature || '-18'}°C</span>,
          renderBht: <span className="font-mono text-sm font-bold text-slate-800">{bhtTel.environment?.temperature || '-31'}°C</span>
        },
        {
          label: 'Wind Speed',
          mtrVal: mtrTel.environment?.windSpeed || 12, 
          bhtVal: bhtTel.environment?.windSpeed || 45,
          renderMtr: <span className="font-mono text-sm font-semibold text-slate-600">{mtrTel.environment?.windSpeed || '12'} m/s</span>,
          renderBht: <span className="font-mono text-sm font-semibold text-slate-600">{bhtTel.environment?.windSpeed || '45'} m/s</span>
        }
      ]
    },
    {
      section: 'Critical Infrastructure',
      metrics: [
        {
          label: 'Primary Power',
          mtrVal: 'Healthy',
          bhtVal: bhtTel.injections?.chpFailure ? 'Warning' : 'Healthy',
          renderMtr: <div className="text-xs font-medium text-slate-700"><span className="block font-bold text-slate-900 mb-1">Diesel Gensets</span> Synchronized (MTR)</div>,
          renderBht: <div className="text-xs font-medium text-slate-700"><span className="block font-bold text-slate-900 mb-1">3x CHP Units</span> Heat & Power (BHT)</div>
        },
        {
          label: 'Water Sourcing',
          mtrVal: 'Healthy', 
          bhtVal: 'Healthy',
          renderMtr: <span className="text-xs font-medium text-slate-700">Lake Priyadarshini Intake</span>,
          renderBht: <span className="text-xs font-medium text-slate-700">Sea Water Pump (RO Desalination)</span>
        },
        {
          label: 'Satellite Comm Link',
          mtrVal: mtrTel.satellite?.isLost ? 'Critical' : 'Healthy',
          bhtVal: bhtTel.satellite?.isLost ? 'Critical' : 'Healthy',
          renderMtr: <StatusBadge status={mtrTel.satellite?.isLost ? 'Critical' : 'Healthy'} />,
          renderBht: <StatusBadge status={bhtTel.satellite?.isLost ? 'Critical' : 'Healthy'} />
        }
      ]
    },
    {
      section: 'Logistics & Supply',
      metrics: [
        {
          label: 'Fuel Runway Projection',
          mtrVal: mtrTel.fuel?.runwayDays || 45, 
          bhtVal: bhtTel.fuel?.runwayDays || 41,
          renderMtr: <span className="font-mono text-sm font-bold text-slate-900">{mtrTel.fuel?.runwayDays || 45} Days</span>,
          renderBht: <span className="font-mono text-sm font-bold text-slate-900">{bhtTel.fuel?.runwayDays || 41} Days</span>
        },
        {
          label: 'Next Resupply Window',
          mtrVal: mtrConfig.resupply?.daysUntilNext || 30, 
          bhtVal: bhtConfig.resupply?.daysUntilNext || 30,
          renderMtr: <span className="font-mono text-sm font-bold text-sky-700">T - {mtrConfig.resupply?.daysUntilNext || 30} Days</span>,
          renderBht: <span className="font-mono text-sm font-bold text-sky-700">T - {bhtConfig.resupply?.daysUntilNext || 30} Days</span>
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* 1. HEADER - FLAT & TECHNICAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> GLOBAL INFRASTRUCTURE MATRIX
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-slate-700" /> Station Comparison
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 border-l-2 border-slate-300 pl-2">
              Live synchronized cross-telemetry from Queen Maud Land and Larsemann Hills.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-slate-300 p-1.5 rounded-sm shadow-sm">
            <span className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200">
              <Radio className="w-3 h-3 animate-pulse" /> Sync Active
            </span>
          </div>
        </div>

        {/* 2. STATION HEADERS (Direct Access Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Maitri Header */}
          <div className="bg-white border border-slate-300 rounded-sm p-4 flex justify-between items-center shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                MAITRI <span className="font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm">MTR</span>
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                <Map className="w-3 h-3" /> 70°45'S, 11°44'E (Est. 1989)
              </p>
            </div>
            <button 
              onClick={() => navigate('/station/maitri')}
              className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Access MTR <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bharati Header */}
          <div className="bg-white border border-slate-300 rounded-sm p-4 flex justify-between items-center shadow-sm">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                BHARATI <span className="font-mono text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded-sm">BHT</span>
              </h2>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                <Map className="w-3 h-3" /> 69°24'S, 76°11'E (Est. 2012)
              </p>
            </div>
            <button 
              onClick={() => navigate('/station/bharati')}
              className="px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              Access BHT <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* 3. STRICT COMPARISON GRID */}
        <div className="bg-white border border-slate-300 rounded-sm shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                <th className="px-5 py-3 w-1/3 border-r border-slate-300">Operational Dimension</th>
                <th className="px-5 py-3 w-1/3 border-r border-slate-300 text-slate-900">Maitri (MTR) Parameter</th>
                <th className="px-5 py-3 w-1/3 text-slate-900">Bharati (BHT) Parameter</th>
              </tr>
            </thead>

            {/* Table Body - Grouped by Sections */}
            <tbody className="divide-y divide-slate-200">
              {comparisonRows.map((group, groupIdx) => (
                <React.Fragment key={groupIdx}>
                  
                  {/* Section Divider */}
                  <tr className="bg-slate-50 border-y border-slate-200">
                    <td colSpan="3" className="px-5 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-3 h-3" /> {group.section}
                    </td>
                  </tr>

                  {/* Section Rows */}
                  {group.metrics.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/50 transition-colors">
                      
                      {/* Dimension Label */}
                      <td className="px-5 py-4 border-r border-slate-200 align-middle">
                        <span className="text-xs font-bold text-slate-700">{row.label}</span>
                      </td>

                      {/* Maitri Cell */}
                      <td className={`px-5 py-4 border-r border-slate-200 align-middle ${getCellBg(row.mtrVal, row.mtrVal)}`}>
                        {row.renderMtr}
                      </td>

                      {/* Bharati Cell */}
                      <td className={`px-5 py-4 align-middle ${getCellBg(row.bhtVal, row.bhtVal)}`}>
                        {row.renderBht}
                      </td>

                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
            
          </table>
        </div>

      </div>
    </div>
  );
}

export default StationComparisonPage;