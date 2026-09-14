import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Cpu,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';

export function ScenarioSimulatorPage() {
  const { stationId = 'bharati' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';
  const station = STATIONS[currentStationCode] || STATIONS.BHT;
  const isBharati = currentStationCode === 'BHT';

  // Form Controls State
  const [temperature, setTemperature] = useState(-42);
  const [supplyDelay, setSupplyDelay] = useState(12);
  const [chpFailure, setChpFailure] = useState(isBharati ? 'CHP-2' : 'DG-2');
  const [windSeverity, setWindSeverity] = useState('High'); // Normal / High / Extreme
  const [satelliteConn, setSatelliteConn] = useState('Degraded'); // Normal / Degraded / Offline
  const [waterPumpStatus, setWaterPumpStatus] = useState('Normal'); // Normal / Failed

  // Simulation execution results
  const [isSimulated, setIsSimulated] = useState(true);
  const [results, setResults] = useState({
    heatingDemandDelta: '+31%',
    fuelConsumptionDelta: '+22%',
    availablePower: '360 → 240 kVA',
    fuelRunway: '46 → 35 days',
    nextResupply: '47 days',
    resourceDeficit: '12 days',
    overallRisk: 'CRITICAL',
    actions: [
      'Reduce non-critical laboratory electrical load by shed-cycling spectrometer UPS feeds.',
      'Enable HVAC thermal conservation profile (set auxiliary zones to setback temperature +15°C).',
      'Prioritize accommodation, satellite telemetry, and potable water intake line heat tracing.',
      `Initiate inspection and emergency bypass on ${isBharati ? 'CHP-2' : 'DG-2'} alternator cooling circuit.`,
      'Prepare emergency fuel allocation from Reserve Bund-B and notify NCPOR Polar Logistics desk.',
    ],
  });

  const handleRunSimulation = () => {
    // Dynamic calculation based on user form inputs
    const tempDrop = Math.max(0, -16.4 - temperature);
    const heatingDeltaNum = Math.round(tempDrop * 1.2 + (windSeverity === 'Extreme' ? 12 : windSeverity === 'High' ? 6 : 0));
    const fuelDeltaNum = Math.round(heatingDeltaNum * 0.7 + (chpFailure !== 'None' ? 6 : 0));

    const basePower = isBharati ? 360 : 300;
    const lostPower = chpFailure !== 'None' ? (isBharati ? 120 : 100) : 0;
    const remainingPower = basePower - lostPower;

    const baseRunway = isBharati ? 46 : 48;
    const computedRunway = Math.max(14, Math.round(baseRunway * (1 - fuelDeltaNum / 100)));
    const resupplyHorizon = station.resupply.daysUntilNext + Number(supplyDelay);
    const deficit = Math.max(0, resupplyHorizon - computedRunway);

    let risk = 'NORMAL';
    if (deficit > 8 || chpFailure !== 'None' && temperature <= -35) {
      risk = 'CRITICAL';
    } else if (deficit > 0 || temperature <= -30) {
      risk = 'WARNING';
    }

    const dynamicActions = [
      'Reduce non-critical laboratory electrical load by shed-cycling spectrometer UPS feeds.',
      'Enable HVAC thermal conservation profile (set auxiliary zones to setback temperature +15°C).',
      'Prioritize accommodation, satellite telemetry, and potable water intake line heat tracing.',
    ];

    if (chpFailure !== 'None') {
      dynamicActions.push(`Initiate inspection and emergency bypass on ${chpFailure} alternator cooling circuit.`);
    }
    if (deficit > 0) {
      dynamicActions.push(`Prepare emergency fuel allocation (${deficit} day deficit) and notify NCPOR Polar Logistics desk.`);
    }
    if (satelliteConn === 'Offline') {
      dynamicActions.push('Switch to Iridium backup emergency messaging terminal for telemetry bursts.');
    }

    setResults({
      heatingDemandDelta: `+${heatingDeltaNum}%`,
      fuelConsumptionDelta: `+${fuelDeltaNum}%`,
      availablePower: `${basePower} → ${remainingPower} kVA`,
      fuelRunway: `${baseRunway} → ${computedRunway} days`,
      nextResupply: `${resupplyHorizon} days`,
      resourceDeficit: deficit > 0 ? `${deficit} days` : '0 days (Nominal)',
      overallRisk: risk,
      actions: dynamicActions,
    });
    setIsSimulated(true);
  };

  const handleReset = () => {
    setTemperature(-16);
    setSupplyDelay(0);
    setChpFailure('None');
    setWindSeverity('Normal');
    setSatelliteConn('Normal');
    setWaterPumpStatus('Normal');
    setIsSimulated(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Operational Scenario Simulator
            </h1>
            <DataSourceBadge type="SIMULATED" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate climate stress, mechanical outages, and logistics delays on {station.name} station survivability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Inputs</span>
          </button>
        </div>
      </div>

      {/* Simulator Form Controls Grid */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Input Operational Variables & Stress Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Outside Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">Outside Temperature</label>
              <span className="font-mono font-bold text-sky-800">{temperature}°C</span>
            </div>
            <input
              type="range"
              min="-60"
              max="-5"
              step="1"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>-60°C (Polar Vortex)</span>
              <span>-5°C (Summer)</span>
            </div>
          </div>

          {/* Supply Delay Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-700">Vessel Resupply Delay</label>
              <span className="font-mono font-bold text-sky-800">+{supplyDelay} days</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={supplyDelay}
              onChange={(e) => setSupplyDelay(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-700"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 days (On Schedule)</span>
              <span>+30 days (Heavy Sea Ice)</span>
            </div>
          </div>

          {/* CHP Failure Select */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Generator / CHP Outage</label>
            <select
              value={chpFailure}
              onChange={(e) => setChpFailure(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-sky-600"
            >
              <option value="None">None (All Units Operational)</option>
              {isBharati ? (
                <>
                  <option value="CHP-1">CHP-1 Trip</option>
                  <option value="CHP-2">CHP-2 Trip</option>
                  <option value="CHP-3">CHP-3 Trip (Severe Heat Exchanger Fault)</option>
                </>
              ) : (
                <>
                  <option value="DG-1">DG-1 Outage</option>
                  <option value="DG-2">DG-2 Outage</option>
                  <option value="DG-3">DG-3 Standby Failure</option>
                </>
              )}
            </select>
          </div>

          {/* Wind Severity Segmented */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Wind Severity</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'High', 'Extreme'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWindSeverity(w)}
                  className={`py-1.5 rounded-md font-medium text-xs transition-colors ${
                    windSeverity === w ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Satellite Connectivity */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Satellite Link Quality</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'Degraded', 'Offline'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSatelliteConn(s)}
                  className={`py-1.5 rounded-md font-medium text-xs transition-colors ${
                    satelliteConn === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Water Pump */}
          <div className="space-y-1.5 text-xs">
            <label className="font-semibold text-slate-700">Water Pump Intake Status</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'Failed'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setWaterPumpStatus(p)}
                  className={`py-1.5 rounded-md font-medium text-xs transition-colors ${
                    waterPumpStatus === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Run Simulation Action Button */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={handleRunSimulation}
            className="px-5 py-2.5 rounded-lg bg-sky-800 hover:bg-sky-900 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>RUN SIMULATION</span>
          </button>
        </div>
      </div>

      {/* Simulation Results Section */}
      {isSimulated && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Simulation Outcome & Prognostic Assessment
                </h2>
                <p className="text-xs text-slate-500">
                  Calculated coupled physical model impact under specified stress factors
                </p>
              </div>

              <div>
                <StatusBadge status={results.overallRisk} size="md" />
              </div>
            </div>

            {/* Key Impact Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Heating Demand</span>
                <div className="text-lg font-bold text-slate-900 mt-1">{results.heatingDemandDelta}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Fuel Burn Rate</span>
                <div className="text-lg font-bold text-amber-900 mt-1">{results.fuelConsumptionDelta}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Available Power</span>
                <div className="text-lg font-bold text-slate-900 mt-1 font-mono">{results.availablePower}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Fuel Runway</span>
                <div className="text-lg font-bold text-amber-900 mt-1 font-mono">{results.fuelRunway}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Resupply Target</span>
                <div className="text-lg font-bold text-slate-900 mt-1 font-mono">{results.nextResupply}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Resource Deficit</span>
                <div className="text-lg font-bold text-rose-700 mt-1 font-mono">{results.resourceDeficit}</div>
              </div>
            </div>

            {/* Prioritized Recommended Operational Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Prioritized Operational Decision Directives
              </h3>

              <div className="space-y-2">
                {results.actions.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioSimulatorPage;
