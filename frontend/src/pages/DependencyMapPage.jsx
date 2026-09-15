import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GitFork,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Flame,
  Droplets,
  Radio,
  Building2,
  FlaskConical,
  Snowflake,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

// Maps a node's id/category to a representative icon for the card.
function getNodeIcon(node) {
  const key = `${node.id} ${node.category}`.toLowerCase();
  if (key.includes('fuel')) return Flame;
  if (key.includes('chp') || key.includes('power') || key.includes('electrical') || key.includes('energy')) return Zap;
  if (key.includes('thermal') || key.includes('hvac') || key.includes('heating')) return Flame;
  if (key.includes('water') || key.includes('lake')) return Droplets;
  if (key.includes('lab') || key.includes('research') || key.includes('scientific')) return FlaskConical;
  if (key.includes('cold') || key.includes('food')) return Snowflake;
  if (key.includes('sat') || key.includes('comm') || key.includes('telemetry')) return Radio;
  return Building2;
}

export function DependencyMapPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const isBharati = currentStationCode === 'BHT';

  const [selectedNodeId, setSelectedNodeId] = useState(isBharati ? 'chp-2' : 'power-system');

  // Dependency network graph definition
  const nodes = isBharati
    ? [
        { id: 'fuel-farm', name: 'Automated Fuel Farm', category: 'Fuel Source', tier: 1, downstream: ['chp-1', 'chp-2', 'chp-3'], status: 'Healthy' },
        { id: 'chp-1', name: 'CHP-1 Unit', category: 'Energy & Heat', tier: 2, downstream: ['power-dist', 'hvac', 'water-pump'], status: 'Healthy' },
        { id: 'chp-2', name: 'CHP-2 Unit', category: 'Energy & Heat', tier: 2, downstream: ['power-dist', 'hvac', 'water-pump', 'labs', 'cold-storage'], status: 'Healthy' },
        { id: 'chp-3', name: 'CHP-3 Unit', category: 'Energy & Heat', tier: 2, downstream: ['power-dist', 'hvac'], status: 'Warning' },
        { id: 'power-dist', name: 'Main Power Distribution', category: 'Electrical Grid', tier: 3, downstream: ['water-pump', 'water-treat', 'labs', 'cold-storage', 'sat-comm', 'main-bld'], status: 'Healthy' },
        { id: 'hvac', name: 'HVAC / Heating System', category: 'Thermal Life Support', tier: 3, downstream: ['main-bld', 'labs'], status: 'Healthy' },
        { id: 'water-pump', name: 'Sea Water Pump', category: 'Water Sourcing', tier: 4, downstream: ['water-treat'], status: 'Healthy' },
        { id: 'water-treat', name: 'Water Treatment (RO)', category: 'Potable Water', tier: 5, downstream: ['water-store'], status: 'Healthy' },
        { id: 'water-store', name: 'Fresh Water Storage', category: 'Life Support', tier: 6, downstream: [], status: 'Healthy' },
        { id: 'labs', name: 'Scientific Laboratories', category: 'Research', tier: 4, downstream: [], status: 'Healthy' },
        { id: 'cold-storage', name: 'Cold Storage (Freezer)', category: 'Food & Biology', tier: 4, downstream: [], status: 'Healthy' },
        { id: 'sat-comm', name: 'Satellite Communication', category: 'Telemetry Relay', tier: 4, downstream: [], status: 'Healthy' },
        { id: 'main-bld', name: 'Main Habitation Building', category: 'Life Support', tier: 4, downstream: [], status: 'Healthy' },
      ]
    : [
        { id: 'fuel-farm', name: 'Maitri Fuel Farm', category: 'Fuel Source', tier: 1, downstream: ['power-system'], status: 'Healthy' },
        { id: 'power-system', name: 'Diesel Power System', category: 'Energy Generation', tier: 2, downstream: ['heating-system', 'lake-pump', 'labs', 'cold-storage', 'sat-comm'], status: 'Healthy' },
        { id: 'heating-system', name: 'Dual-circuit Heating', category: 'Thermal Life Support', tier: 3, downstream: ['main-bld', 'labs'], status: 'Healthy' },
        { id: 'lake-pump', name: 'Lake Priyadarshini Pump', category: 'Water Sourcing', tier: 3, downstream: ['water-treat'], status: 'Healthy' },
        { id: 'water-treat', name: 'Water Treatment Plant', category: 'Potable Water', tier: 4, downstream: ['water-store'], status: 'Healthy' },
        { id: 'water-store', name: 'Potable Water Storage', category: 'Life Support', tier: 5, downstream: [], status: 'Healthy' },
        { id: 'labs', name: 'Research Laboratories', category: 'Scientific Operations', tier: 3, downstream: [], status: 'Healthy' },
        { id: 'cold-storage', name: 'Food Cold Storage', category: 'Food Security', tier: 3, downstream: [], status: 'Healthy' },
        { id: 'sat-comm', name: 'Satellite VSAT Link', category: 'Communications', tier: 3, downstream: [], status: 'Healthy' },
        { id: 'main-bld', name: 'Main Station Living Quarters', category: 'Habitation', tier: 4, downstream: [], status: 'Healthy' },
      ];

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  // Recursively determine all downstream affected nodes
  const getDownstreamCascade = (startId) => {
    const affected = new Set();
    const queue = [startId];
    while (queue.length > 0) {
      const current = queue.shift();
      const node = nodes.find((n) => n.id === current);
      if (node && node.downstream) {
        node.downstream.forEach((childId) => {
          if (!affected.has(childId)) {
            affected.add(childId);
            queue.push(childId);
          }
        });
      }
    }
    return Array.from(affected);
  };

  const cascadeAffectedIds = getDownstreamCascade(selectedNode.id);
  const affectedCount = cascadeAffectedIds.length;
  const riskLevel = affectedCount >= 4 ? 'High' : affectedCount >= 2 ? 'Medium' : 'Low';

  const riskChipClass =
    riskLevel === 'High'
      ? 'bg-rose-50 text-rose-800 border-rose-200'
      : riskLevel === 'Medium'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  // Sort nodes by tier so the flowing grid still reads upstream → downstream
  const orderedNodes = [...nodes].sort((a, b) => a.tier - b.tier);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-10 space-y-4">
      {/* Header */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Dependency Map</h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 max-w-md">
            Tap a component to trace what it powers, and what fails if it goes down
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span className="text-slate-500">Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-500">Affected</span>
          </div>
        </div>
      </div>

      {/* Flowing node grid, ordered upstream → downstream by tier */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {orderedNodes.map((node) => {
          const isSelected = node.id === selectedNodeId;
          const isAffected = cascadeAffectedIds.includes(node.id);
          const Icon = getNodeIcon(node);

          return (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`text-left rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-br from-sky-50 to-white border-sky-400 shadow-md shadow-sky-100'
                  : isAffected
                  ? 'bg-gradient-to-br from-amber-50 to-white border-amber-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'
              } ${isSelected ? 'col-span-2 sm:col-span-3 lg:col-span-4' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected
                      ? 'bg-sky-600 text-white'
                      : isAffected
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <StatusBadge status={node.status} size="sm" />
              </div>

              <div className="mt-2.5">
                <div className="text-sm font-bold text-slate-900 leading-snug">{node.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                  <span>Tier {node.tier}</span>
                  <span>·</span>
                  <span className="truncate">{node.category}</span>
                </div>
              </div>

              {/* Inline expanding detail, only on the selected card */}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isSelected ? 'grid-rows-[1fr] opacity-100 mt-3.5' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pt-3.5 border-t border-sky-100 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                          Affected subsystems
                        </div>
                        <div className="text-xl font-bold text-slate-900 mt-0.5">{affectedCount}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 font-semibold">
                          Cascade risk
                        </div>
                        <span
                          className={`inline-block mt-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${riskChipClass}`}
                        >
                          {riskLevel}
                        </span>
                      </div>
                    </div>

                    {affectedCount > 0 ? (
                      <div className="flex items-start gap-2 text-xs text-slate-600 flex-1">
                        <GitFork className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          A failure here cascades to{' '}
                          {cascadeAffectedIds
                            .map((id) => nodes.find((n) => n.id === id)?.name)
                            .filter(Boolean)
                            .join(', ')}
                          .
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-emerald-700">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Terminal node — no downstream dependents.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedNode.status === 'Warning' && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>{selectedNode.name}</strong> is currently flagged Warning — cascade risk should be treated
            as elevated beyond the static estimate above.
          </span>
        </div>
      )}
    </div>
  );
}

export default DependencyMapPage;