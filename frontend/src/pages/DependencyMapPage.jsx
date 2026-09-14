import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { GitFork, ArrowDown, AlertTriangle, ShieldCheck, Zap, Flame, Droplets, Radio, Building2 } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';
import telemetryEngine from '../simulation/telemetryEngine.js';

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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Digital Twin Dependency Map
            </h1>
            <DataSourceBadge type="DERIVED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Topological causal network linking energy, thermal, hydraulic, and computational loads for {station.name} Station
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-sky-100 border border-sky-400" />
            <span className="text-slate-600">Selected Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-50 border border-amber-400" />
            <span className="text-slate-600">Downstream Cascade</span>
          </div>
        </div>
      </div>

      {/* Selected Node Cascade Inspector Panel */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Selected Component</span>
            <span>•</span>
            <span className="text-sky-800">{selectedNode.category}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">
            {selectedNode.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click any node below to simulate failure cascade and inspect downstream criticality.
          </p>
        </div>

        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-left">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Affected Subsystems
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {affectedCount}
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Cascade Risk
            </span>
            <div className="mt-1">
              <span
                className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                  riskLevel === 'High'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : riskLevel === 'Medium'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                {riskLevel} Risk
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Topological Pipeline Visualization */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Station Operational Pipeline (Click node to inspect)
        </h3>

        <div className="space-y-6">
          {/* Level 1: Fuel Sourcing */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">1. Fuel Logistics</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {nodes.filter((n) => n.tier === 1).map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isAffected = cascadeAffectedIds.includes(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200'
                        : isAffected
                        ? 'bg-amber-50/80 border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{node.name}</span>
                      <StatusBadge status={node.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">{node.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Level 2: Generation / CHPs */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">2. Power & Cogeneration</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {nodes.filter((n) => n.tier === 2).map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isAffected = cascadeAffectedIds.includes(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200'
                        : isAffected
                        ? 'bg-amber-50/80 border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{node.name}</span>
                      <StatusBadge status={node.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">{node.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Level 3: Grid & Thermal Distribution */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">3. Distribution & Thermal Networks</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {nodes.filter((n) => n.tier === 3).map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isAffected = cascadeAffectedIds.includes(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200'
                        : isAffected
                        ? 'bg-amber-50/80 border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900">{node.name}</span>
                      <StatusBadge status={node.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">{node.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center text-slate-300">
            <ArrowDown className="w-5 h-5" />
          </div>

          {/* Level 4: Life Support & End Consumers */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase mb-2">4. Life Support, Water & Consumers</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {nodes.filter((n) => n.tier >= 4).map((node) => {
                const isSelected = node.id === selectedNodeId;
                const isAffected = cascadeAffectedIds.includes(node.id);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-200'
                        : isAffected
                        ? 'bg-amber-50/80 border-amber-400'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 truncate">{node.name}</span>
                      <StatusBadge status={node.status} size="sm" />
                    </div>
                    <span className="text-[11px] text-slate-500">{node.category}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DependencyMapPage;
