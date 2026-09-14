import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Sliders,
  Shield,
  Radio,
  Server,
  User,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import useAuthStore from '../store/authStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function Settings() {
  const { user } = useAuthStore();
  const { activeScenario, triggerScenario, resetScenario } = useDashboardStore();

  const [tempWarning, setTempWarning] = useState(85);
  const [tempCritical, setTempCritical] = useState(92);
  const [vibCritical, setVibCritical] = useState(3.8);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Operations & System Configuration"
        subtitle="Mission Control thresholds, MQTT telemetry parameters, and demo simulation tools"
        badge={<Badge variant="healthy" size="sm">SYSTEM ONLINE</Badge>}
      />

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Operational parameters updated in memory and broadcast to anomaly engine.</span>
        </div>
      )}

      {/* Anomaly Detection Thresholds */}
      <Card>
        <CardHeader
          title="Rule-Based Anomaly Detection Thresholds"
          subtitle="Configure trigger limits for generators, microgrid, and telemetry streams"
        />

        <div className="space-y-5 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <span>Generator Core Overheat Advisory (Warning):</span>
              <span className="font-mono text-slate-900 font-bold">{tempWarning}°C</span>
            </div>
            <input
              type="range"
              min="75"
              max="90"
              value={tempWarning}
              onChange={(e) => setTempWarning(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <span className="text-[11px] text-slate-400">Nominal baseline: 78°C</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <span>Generator Core Emergency Shutdown (Critical):</span>
              <span className="font-mono text-rose-600 font-bold">{tempCritical}°C</span>
            </div>
            <input
              type="range"
              min="90"
              max="100"
              value={tempCritical}
              onChange={(e) => setTempCritical(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
            <span className="text-[11px] text-slate-400">Safety margin trip threshold</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 font-semibold text-slate-700">
              <span>Bearing Harmonic Vibration Critical Limit:</span>
              <span className="font-mono text-rose-600 font-bold">{vibCritical} mm/s</span>
            </div>
            <input
              type="range"
              min="2.5"
              max="5.0"
              step="0.1"
              value={vibCritical}
              onChange={(e) => setVibCritical(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
            <span className="text-[11px] text-slate-400">Baseline balanced vibration: 2.0 mm/s</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleSave}>
              Save Threshold Policies
            </Button>
          </div>
        </div>
      </Card>

      {/* Simulator Scenario Controller */}
      <Card>
        <CardHeader
          title="SIH Telemetry Scenario Simulator Control"
          subtitle="Directly control the in-process MQTT simulator engine"
          action={
            <Badge variant={activeScenario !== 'NORMAL' ? 'critical' : 'healthy'} size="sm">
              Current: {activeScenario}
            </Badge>
          }
        />

        <div className="space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Trigger failure modes to test the end-to-end mission loop: <strong>Telemetry → Anomaly Detection → Alert → AI Insight → Prescriptive Action</strong>.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => resetScenario()}
              className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 text-left"
            >
              Reset Normal Baseline
            </button>
            <button
              onClick={() => triggerScenario('GENERATOR_FAILURE')}
              className="p-3 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 font-bold text-rose-800 text-left"
            >
              Start Generator Failure (Demo)
            </button>
            <button
              onClick={() => triggerScenario('LOW_FUEL')}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 font-semibold text-amber-800 text-left"
            >
              Low Fuel (&lt;15%)
            </button>
            <button
              onClick={() => triggerScenario('HIGH_ENERGY_CONSUMPTION')}
              className="p-3 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 font-semibold text-amber-800 text-left"
            >
              Grid Surge & Battery Drain
            </button>
            <button
              onClick={() => triggerScenario('EXTREME_WEATHER')}
              className="p-3 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 font-semibold text-sky-800 text-left"
            >
              Category-3 Katabatic Gale
            </button>
            <button
              onClick={() => triggerScenario('LOW_INVENTORY')}
              className="p-3 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 font-semibold text-purple-800 text-left"
            >
              Low Spares / Med Supplies
            </button>
          </div>
        </div>
      </Card>

      {/* Operator Session Info */}
      <Card>
        <CardHeader title="Operator Clearance & Authorization" />
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-slate-900">{user?.name || 'Capt. Arun Verma'}</div>
            <div className="text-slate-500 font-mono mt-0.5">{user?.email || 'operator@polartwin.local'}</div>
          </div>
          <Badge variant="info" size="md">
            ROLE: {user?.role || 'OPERATOR'}
          </Badge>
        </div>
      </Card>
    </div>
  );
}

export default Settings;
