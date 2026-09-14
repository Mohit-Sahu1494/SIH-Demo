import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Building2, ArrowRight } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

export function StationComparisonPage() {
  const navigate = useNavigate();
  const telemetry = telemetryEngine.getState();
  const bhtTel = telemetry.BHT || {};
  const mtrTel = telemetry.MTR || {};

  const bhtConfig = STATIONS.BHT;
  const mtrConfig = STATIONS.MTR;

  const comparisonRows = [
    {
      metric: 'Operational Status',
      maitri: <StatusBadge status={mtrTel.stationStatus || 'Operational'} size="sm" />,
      bharati: <StatusBadge status={bhtTel.stationStatus || 'Operational'} size="sm" />,
    },
    {
      metric: 'Station Health Score',
      maitri: <span className="font-bold text-slate-900 font-mono">{mtrTel.healthScore || 91}%</span>,
      bharati: <span className="font-bold text-slate-900 font-mono">{bhtTel.healthScore || 88}%</span>,
    },
    {
      metric: 'Atmospheric Conditions',
      maitri: <span className="text-slate-700">{mtrTel.environment?.temperature}°C · {mtrTel.environment?.windSpeed} m/s</span>,
      bharati: <span className="text-slate-700">{bhtTel.environment?.temperature}°C · {bhtTel.environment?.windSpeed} m/s</span>,
    },
    {
      metric: 'Primary Power Generation',
      maitri: <span className="text-slate-700">Polar Diesel Gensets (Synchronized)</span>,
      bharati: <span className="text-slate-700">3x Combined Heat & Power (CHP)</span>,
    },
    {
      metric: 'Power Status',
      maitri: <StatusBadge status="Healthy" size="sm" />,
      bharati: <StatusBadge status={bhtTel.injections?.chpFailure ? 'Warning' : 'Healthy'} size="sm" />,
    },
    {
      metric: 'Satellite Link Status',
      maitri: <StatusBadge status={mtrTel.satellite?.isLost ? 'Critical' : 'Healthy'} size="sm" />,
      bharati: <StatusBadge status={bhtTel.satellite?.isLost ? 'Critical' : 'Healthy'} size="sm" />,
    },
    {
      metric: 'Active Operational Alerts',
      maitri: <span className="font-mono font-bold text-slate-800">1 Advisory</span>,
      bharati: <span className="font-mono font-bold text-amber-900">3 Warnings</span>,
    },
    {
      metric: 'Water Sourcing Infrastructure',
      maitri: <span className="text-slate-700">Lake Priyadarshini (2.4km heated line)</span>,
      bharati: <span className="text-slate-700">Sea Water Pump (RO Desalination)</span>,
    },
    {
      metric: 'Fuel Runway Projection',
      maitri: <span className="font-mono font-bold text-slate-900">{mtrTel.fuel?.runwayDays || 45} days</span>,
      bharati: <span className="font-mono font-bold text-slate-900">{bhtTel.fuel?.runwayDays || 41} days</span>,
    },
    {
      metric: 'Next Resupply Window',
      maitri: <span className="font-mono text-slate-700">{mtrConfig.resupply.daysUntilNext} days</span>,
      bharati: <span className="font-mono text-slate-700">{bhtConfig.resupply.daysUntilNext} days</span>,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Indian Antarctic Operations
            </h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Comparative operational status between Maitri (Queen Maud Land) and Bharati (Larsemann Hills)
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-4 px-5 text-slate-500 font-medium">Operational Dimension</th>
                <th className="py-4 px-5 w-1/3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">MAITRI</div>
                      <div className="text-[11px] text-slate-400 font-normal">Est. 1989 · 70°S</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/station/maitri')}
                      className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Open Maitri Mission Control"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
                <th className="py-4 px-5 w-1/3 border-l border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">BHARATI</div>
                      <div className="text-[11px] text-slate-400 font-normal">Est. 2012 · 69°S</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/station/bharati')}
                      className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                      title="Open Bharati Mission Control"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    {row.metric}
                  </td>
                  <td className="py-3.5 px-5">
                    {row.maitri}
                  </td>
                  <td className="py-3.5 px-5 border-l border-slate-100">
                    {row.bharati}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default StationComparisonPage;
