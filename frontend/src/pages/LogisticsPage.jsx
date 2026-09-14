import React from 'react';
import { useParams } from 'react-router-dom';
import { Boxes, Ship, Calendar, AlertCircle } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS, LOGISTICS_INVENTORY } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

export function LogisticsPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const inventory = LOGISTICS_INVENTORY[currentStationCode] || LOGISTICS_INVENTORY.BHT;

  const telemetry = telemetryEngine.calculateTelemetry(currentStationCode);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Station Logistics & Inventory
            </h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Consumable inventory audit, daily burn rates, and supply status for {station.name} Station
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs bg-white px-3 py-2 rounded-lg border border-slate-200">
          <Ship className="w-4 h-4 text-sky-800" />
          <div>
            <span className="text-slate-500 font-medium">Scheduled Vessel:</span>
            <span className="font-bold text-slate-900 ml-1.5">{station.resupply.vesselName}</span>
          </div>
        </div>
      </div>

      {/* Structured Institutional Logistics Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Critical Inventory Audit Table
          </h2>
          <span className="text-xs text-slate-500">
            Resupply Threshold: <strong>{station.resupply.daysUntilNext} Days</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Resource</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Available Quantity</th>
                <th className="py-3 px-4">Daily Burn Rate</th>
                <th className="py-3 px-4">Estimated Remaining</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {inventory.map((item) => {
                // If this is fuel and telemetry updated it dynamically
                const isFuel = item.resource.toLowerCase().includes('fuel') || item.resource.toLowerCase().includes('diesel');
                const stock = isFuel ? `${telemetry.fuel.reservePercent}%` : item.stock;
                const remaining = isFuel ? `${telemetry.fuel.runwayDays} days` : `${item.remainingDays} days`;
                const status = (isFuel && telemetry.fuel.isDeficit) ? 'Critical' : item.status;

                return (
                  <tr key={item.resource} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {item.resource}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium">
                      {stock}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {isFuel ? `${telemetry.fuel.currentLiters.toLocaleString()} L` : item.amount}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {isFuel ? `${telemetry.fuel.dailyBurnLiters.toLocaleString()} L/day` : item.dailyUse}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {remaining}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <StatusBadge status={status} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LogisticsPage;
