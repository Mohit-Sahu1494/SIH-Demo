import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  GitFork, ShieldCheck, Zap, Flame, Droplets, Radio, 
  Building2, FlaskConical, Snowflake, ArrowDown, Activity
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';

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
  const riskLevel = affectedCount >= 4 ? 'Critical' : affectedCount >= 2 ? 'High' : affectedCount === 1 ? 'Moderate' : 'None';

  // Group nodes by Tier for the visual flow
  const nodesByTier = nodes.reduce((acc, node) => {
    if (!acc[node.tier]) acc[node.tier] = [];
    acc[node.tier].push(node);
    return acc;
  }, {});

  const maxTier = Math.max(...Object.keys(nodesByTier).map(Number));

  return (
    <div className="min-h-screen bg-slate-100 p-6 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* 1. FLAT TECHNICAL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-300 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" /> CASCADE ANALYSIS
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <GitFork className="w-5 h-5 text-slate-700" /> Infrastructure Dependency Map
            </h1>
            <p className="text-sm text-slate-600 font-medium mt-1 border-l-2 border-slate-300 pl-2">
              Select any system node to trace downstream failure impact across the {station.name} facility.
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider bg-white border border-slate-300 p-2 rounded-sm shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="w-3 h-3 bg-blue-600 border border-blue-700 rounded-sm"></div> Selected Source
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="w-3 h-3 bg-amber-100 border border-amber-400 rounded-sm"></div> Downstream Impact
            </div>
          </div>
        </div>

        {/* 2. SELECTED NODE INSIGHTS (Flat Panel) */}
        <div className="bg-white border border-slate-300 rounded-sm shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              {React.createElement(getNodeIcon(selectedNode), { className: "w-6 h-6 text-slate-700" })}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Simulating Failure For</p>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{selectedNode.name}</h2>
              <p className="text-xs font-mono text-slate-500">{selectedNode.id.toUpperCase()} · Tier {selectedNode.tier}</p>
            </div>
          </div>

          <div className="flex gap-4 w-full md:w-auto md:border-l border-slate-200 md:pl-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Impact Radius</p>
              <p className="font-mono text-xl font-bold text-slate-800">{affectedCount} <span className="text-xs font-sans text-slate-500">Systems</span></p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Cascade Risk</p>
              <span className={`inline-block px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider border rounded-sm ${
                riskLevel === 'Critical' ? 'bg-red-50 text-red-700 border-red-300' :
                riskLevel === 'High' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                riskLevel === 'Moderate' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                'bg-emerald-50 text-emerald-700 border-emerald-300'
              }`}>
                {riskLevel}
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 font-medium">
            {affectedCount > 0 ? (
              <span>
                <strong>System Failure Simulation:</strong> Dropping this node will inherently cause failure in: <span className="font-bold text-amber-700">{cascadeAffectedIds.map((id) => nodes.find((n) => n.id === id)?.name).join(', ')}</span>.
              </span>
            ) : (
              <span className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Terminal node. Failure is isolated and does not cascade to other subsystems.
              </span>
            )}
          </div>
        </div>

        {/* 3. THE LOGICAL CASCADE MAP */}
        <div className="bg-white border border-slate-300 rounded-sm shadow-sm p-8 overflow-x-auto">
          <div className="min-w-[700px] flex flex-col items-center">
            
            {Array.from({ length: maxTier }, (_, i) => i + 1).map((tier) => {
              const tierNodes = nodesByTier[tier] || [];
              if (tierNodes.length === 0) return null;

              return (
                <React.Fragment key={`tier-${tier}`}>
                  
                  {/* Tier Row Container */}
                  <div className="w-full relative py-2">
                    {/* Background Tier Label */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-300">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest border border-slate-200 px-1 py-0.5">Tier {tier}</span>
                      <div className="w-8 h-px bg-slate-200"></div>
                    </div>

                    <div className="flex justify-center gap-4 flex-wrap pl-20 pr-4">
                      {tierNodes.map((node) => {
                        const isSelected = node.id === selectedNodeId;
                        const isAffected = cascadeAffectedIds.includes(node.id);
                        const Icon = getNodeIcon(node);

                        return (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNodeId(node.id)}
                            className={`flex items-center gap-3 p-3 w-56 text-left border rounded-sm transition-all duration-150 ${
                              isSelected
                                ? 'bg-blue-600 border-blue-700 text-white shadow-md scale-[1.02]'
                                : isAffected
                                ? 'bg-amber-50 border-amber-400 shadow-sm shadow-amber-100'
                                : 'bg-white border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                            }`}
                          >
                            <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                              isSelected ? 'bg-blue-700 border-blue-500 text-white' : 
                              isAffected ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-slate-100 border-slate-200 text-slate-500'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {node.name}
                              </p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-[9px] uppercase tracking-widest font-bold ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                                  {node.category}
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flow Arrows between Tiers */}
                  {tier < maxTier && (
                    <div className="py-3 flex justify-center w-full">
                      <div className="flex flex-col items-center">
                        <div className="w-px h-6 bg-slate-300"></div>
                        <ArrowDown className="w-4 h-4 text-slate-400 -mt-1" />
                      </div>
                    </div>
                  )}

                </React.Fragment>
              );
            })}

          </div>
        </div>

      </div>
    </div>
  );
}

export default DependencyMapPage;