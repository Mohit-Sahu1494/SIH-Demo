import React, { useState } from 'react';
import {
  Sliders,
  X,
  Play,
  RotateCcw,
  AlertTriangle,
  Flame,
  BatteryCharging,
  Wind,
  Package,
  ShieldCheck,
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore.js';
import Button from './Button.jsx';
import Badge from './Badge.jsx';

export function ScenarioControlDrawer({ isOpen, onClose }) {
  const { activeScenario, triggerScenario, resetScenario } = useDashboardStore();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'NORMAL',
      title: 'Baseline Operational State',
      description: 'Generators nominal at 78°C, vibration 2.0 mm/s, fuel 78%, battery 88%. All systems healthy.',
      icon: ShieldCheck,
      color: 'emerald',
    },
    {
      id: 'GENERATOR_FAILURE',
      title: 'Generator GEN-02 Thermal Runaway (SIH Main Demo)',
      description: 'Coolant circulation stops on GEN-02. Temperature ramps 78°C -> 94°C, vibration spikes 2.0 -> 4.2 mm/s, health collapses to 38%, triggering CRITICAL alerts and AI diagnostics.',
      icon: Flame,
      color: 'rose',
      highlight: true,
    },
    {
      id: 'LOW_FUEL',
      title: 'Severe Fuel Reserve Depletion',
      description: 'Primary Jet A-1 aviation fuel drops below 15% critical reserve threshold. Generates logistics replenishment warning.',
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      id: 'HIGH_ENERGY_CONSUMPTION',
      title: 'Microgrid Surge & Battery Drain',
      description: 'Deep-freeze HVAC and scientific LIDAR spike load above 95%, causing UPS battery reserves to rapidly plummet to 20%.',
      icon: BatteryCharging,
      color: 'amber',
    },
    {
      id: 'EXTREME_WEATHER',
      title: 'Category-3 Polar Katabatic Blizzard',
      description: 'Continental katabatic gale accelerates past 90 km/h with ambient temperature dropping below -45°C. Zero visibility.',
      icon: Wind,
      color: 'sky',
    },
    {
      id: 'LOW_INVENTORY',
      title: 'Critical Logistics & Spares Depletion',
      description: 'Essential generator filter elements and trauma medical supplies drop below critical replenishment limits.',
      icon: Package,
      color: 'purple',
    },
  ];

  const handleSelectScenario = async (scenarioId) => {
    setLoading(true);
    try {
      if (scenarioId === 'NORMAL') {
        await resetScenario();
      } else {
        await triggerScenario(scenarioId);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-600 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Simulation Scenarios
              </h3>
              <p className="text-xs text-slate-500">Live operational demonstration controller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Status Banner */}
        <div className="p-4 bg-sky-50/60 border-b border-sky-100 flex items-center justify-between">
          <div className="text-xs">
            <span className="text-slate-500 block font-medium">Currently Active Scenario:</span>
            <span className="font-heading font-bold text-sky-900 text-sm">{activeScenario}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={() => handleSelectScenario('NORMAL')}
            disabled={loading || activeScenario === 'NORMAL'}
          >
            Reset Normal
          </Button>
        </div>

        {/* Scenarios List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {scenarios.map((sc) => {
            const Icon = sc.icon;
            const isSelected = activeScenario === sc.id;

            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50/40 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                } ${sc.highlight ? 'bg-amber-50/20' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        sc.color === 'rose'
                          ? 'bg-rose-100 text-rose-700'
                          : sc.color === 'amber'
                          ? 'bg-amber-100 text-amber-700'
                          : sc.color === 'sky'
                          ? 'bg-sky-100 text-sky-700'
                          : sc.color === 'purple'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-xs text-slate-900">{sc.title}</h4>
                        {sc.highlight && <Badge variant="critical" size="sm">SIH Demo</Badge>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[10px] text-slate-400">{sc.id}</span>
                  <span
                    className={`font-semibold flex items-center gap-1 ${
                      isSelected ? 'text-sky-600' : 'text-slate-500'
                    }`}
                  >
                    {isSelected ? '● Running Live' : 'Click to Activate →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer Notice */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500">
          <strong>SIH Evaluator Note:</strong> Activating scenarios modifies telemetry through the MQTT simulator in real time. The Digital Twin and dashboard update automatically without page refresh.
        </div>
      </div>
    </div>
  );
}

export default ScenarioControlDrawer;
