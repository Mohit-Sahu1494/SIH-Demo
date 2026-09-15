import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import DataSourceBadge from '../components/common/DataSourceBadge.jsx';
import { STATIONS } from '../data/stationConfig.js';

const DEFAULTS = {
  temperature: -16,
  supplyDelay: 0,
  chpFailure: 'None',
  windSeverity: 'Normal',
  satelliteConn: 'Normal',
  waterPumpStatus: 'Normal',
};

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

  // Simulation results — recalculated live whenever an input changes
  const results = useMemo(() => {
    const tempDrop = Math.max(0, -16.4 - temperature);
    const heatingDeltaNum = Math.round(
      tempDrop * 1.2 + (windSeverity === 'Extreme' ? 12 : windSeverity === 'High' ? 6 : 0)
    );
    const fuelDeltaNum = Math.round(heatingDeltaNum * 0.7 + (chpFailure !== 'None' ? 6 : 0));

    const basePower = isBharati ? 360 : 300;
    const lostPower = chpFailure !== 'None' ? (isBharati ? 120 : 100) : 0;
    const remainingPower = basePower - lostPower;

    const baseRunway = isBharati ? 46 : 48;
    const computedRunway = Math.max(14, Math.round(baseRunway * (1 - fuelDeltaNum / 100)));
    const resupplyHorizon = station.resupply.daysUntilNext + Number(supplyDelay);
    const deficit = Math.max(0, resupplyHorizon - computedRunway);

    let risk = 'NORMAL';
    if ((deficit > 8 || chpFailure !== 'None') && temperature <= -35) {
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
    if (waterPumpStatus === 'Failed') {
      dynamicActions.push('Deploy backup intake pump and initiate emergency water rationing protocol.');
    }

    return {
      heatingDemandDelta: `+${heatingDeltaNum}%`,
      fuelConsumptionDelta: `+${fuelDeltaNum}%`,
      availablePower: `${basePower} → ${remainingPower} kVA`,
      fuelRunway: `${baseRunway} → ${computedRunway} days`,
      nextResupply: `${resupplyHorizon} days`,
      resourceDeficit: deficit > 0 ? `${deficit} days` : '0 days (Nominal)',
      overallRisk: risk,
      actions: dynamicActions,
    };
  }, [temperature, supplyDelay, chpFailure, windSeverity, satelliteConn, waterPumpStatus, isBharati, station]);

  const handleReset = () => {
    setTemperature(DEFAULTS.temperature);
    setSupplyDelay(DEFAULTS.supplyDelay);
    setChpFailure(DEFAULTS.chpFailure);
    setWindSeverity(DEFAULTS.windSeverity);
    setSatelliteConn(DEFAULTS.satelliteConn);
    setWaterPumpStatus(DEFAULTS.waterPumpStatus);
  };

  const isDeficit = results.resourceDeficit !== '0 days (Nominal)';

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-4 pb-10 space-y-4">
      {/* Header */}
      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">Scenario Simulator</h1>
            <DataSourceBadge type="SIMULATED" />
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Model climate, mechanical, and logistics stress on {station.name} station survivability
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* Split panel: inputs (left) / live results (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 items-start">
        {/* ---------------- INPUT PANEL ---------------- */}
        <div className="lg:sticky lg:top-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <h2 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Stress parameters
          </h2>

          {/* Outside Temperature */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Outside temperature</label>
              <span className="text-xs font-semibold text-sky-800 tabular-nums transition-colors duration-300">
                {temperature}°C
              </span>
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
              <span>−60°C</span>
              <span>−5°C</span>
            </div>
          </div>

          {/* Supply Delay */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Resupply delay</label>
              <span className="text-xs font-semibold text-sky-800 tabular-nums transition-colors duration-300">
                +{supplyDelay}d
              </span>
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
              <span>On schedule</span>
              <span>+30d</span>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* CHP / Generator outage */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Generator / CHP outage</label>
            <select
              value={chpFailure}
              onChange={(e) => setChpFailure(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-sky-600"
            >
              <option value="None">None — all units operational</option>
              {isBharati ? (
                <>
                  <option value="CHP-1">CHP-1 trip</option>
                  <option value="CHP-2">CHP-2 trip</option>
                  <option value="CHP-3">CHP-3 trip (heat exchanger fault)</option>
                </>
              ) : (
                <>
                  <option value="DG-1">DG-1 outage</option>
                  <option value="DG-2">DG-2 outage</option>
                  <option value="DG-3">DG-3 standby failure</option>
                </>
              )}
            </select>
          </div>

          {/* Wind Severity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Wind severity</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'High', 'Extreme'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWindSeverity(w)}
                  className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                    windSeverity === w ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* Satellite Connectivity */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Satellite link</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'Degraded', 'Offline'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSatelliteConn(s)}
                  className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                    satelliteConn === s ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Water Pump */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Water pump intake</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
              {['Normal', 'Failed'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setWaterPumpStatus(p)}
                  className={`py-1.5 rounded-md text-xs font-medium transition-colors ${
                    waterPumpStatus === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 pt-1">
            Results update automatically as parameters change.
          </p>
        </div>

        {/* ---------------- RESULTS PANEL ---------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Projected outcome</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Coupled physical model impact under the selected conditions
              </p>
            </div>
            <StatusBadge status={results.overallRisk} size="md" />
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Heating demand', value: results.heatingDemandDelta },
              { label: 'Fuel burn rate', value: results.fuelConsumptionDelta, warn: true },
              { label: 'Available power', value: results.availablePower, mono: true },
              { label: 'Fuel runway', value: results.fuelRunway, warn: true, mono: true },
              { label: 'Resupply in', value: results.nextResupply, mono: true },
              { label: 'Resource deficit', value: results.resourceDeficit, critical: true, mono: true },
            ].map((m) => (
              <div key={m.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400">{m.label}</div>
                <div
                  className={`text-base font-bold mt-1 transition-colors duration-300 ${m.mono ? 'font-mono text-[15px]' : ''} ${
                    m.critical && isDeficit
                      ? 'text-rose-700'
                      : m.warn
                      ? 'text-amber-700'
                      : 'text-slate-900'
                  }`}
                >
                  {m.value}
                </div>
              </div>
            ))}
          </div>

          {isDeficit && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Under these conditions, fuel runway falls short of the resupply horizon by{' '}
                <strong>{results.resourceDeficit}</strong>.
              </span>
            </div>
          )}

          {/* Prioritized actions */}
          <div className="pt-1 space-y-2.5">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
              Recommended actions
            </h3>
            <div className="space-y-2">
              {results.actions.map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScenarioSimulatorPage;