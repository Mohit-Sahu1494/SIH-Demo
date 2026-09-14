import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Activity,
  Thermometer,
  Zap,
  Fuel,
  Wrench,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import assetService from '../services/assetService.js';
import telemetryService from '../services/telemetryService.js';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function AssetDetails() {
  const { assetId } = useParams();
  const navigate = useNavigate();
  const { currentStationCode } = useStationStore();
  const { assetsTelemetry } = useDashboardStore();

  const [asset, setAsset] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const id = (assetId || 'GEN-02').toUpperCase();
  const liveTelem = assetsTelemetry[id] || {};

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await assetService.getById(id, currentStationCode);
        setAsset(data);
        const telemData = await telemetryService.getByAsset(id, currentStationCode, 20);
        setHistory(telemData || []);
      } catch (err) {
        // keep fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, currentStationCode]);

  // Synthetic trend line for chart if history is short
  const chartData = [
    { time: '10:00', temp: 78, vib: 2.0, load: 72 },
    { time: '10:15', temp: 80, vib: 2.1, load: 74 },
    { time: '10:30', temp: 82, vib: 2.4, load: 76 },
    { time: '10:45', temp: 86, vib: 2.9, load: 78 },
    { time: '11:00', temp: 90, vib: 3.5, load: 81 },
    {
      time: 'Live',
      temp: liveTelem.temperature || 94,
      vib: liveTelem.vibration || 4.2,
      load: liveTelem.load || 82,
    },
  ];

  const currentStatus = liveTelem.status || asset?.status || 'HEALTHY';
  const currentHealth = typeof liveTelem.healthScore === 'number' ? liveTelem.healthScore : (asset?.healthScore || 92);
  const isCritical = currentStatus === 'CRITICAL';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/infrastructure')}
        >
          Back to Asset Table
        </Button>
      </div>

      <PageHeader
        title={`${asset?.name || 'Secondary Diesel Genset 02'} (${id})`}
        subtitle={`Live Mechanical & Electrical Telemetry Diagnostic Feed — ${currentStationCode} Station`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={currentStatus} />
            <Badge variant="simulated" size="sm">DATA SOURCE: SIMULATED (MQTT)</Badge>
          </div>
        }
      />

      {/* Critical Alert Warning Banner */}
      {isCritical && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3.5 shadow-sm animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
          <div className="text-xs">
            <h4 className="font-bold text-rose-900 text-sm">
              Critical Anomaly Detected on {id}
            </h4>
            <p className="mt-1 leading-relaxed text-rose-800">
              Core temperature ({liveTelem.temperature || 94}°C) and harmonic bearing vibration ({liveTelem.vibration || 4.2} mm/s) exceed nominal thresholds. Recommended Action: Shed 40% electrical bus load and isolate primary glycol cooling line.
            </p>
          </div>
        </div>
      )}

      {/* Key Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Thermometer className="w-4 h-4 text-sky-600" />
            <span>Operating Temperature</span>
          </div>
          <div className="text-2xl font-heading font-bold text-slate-900">
            {liveTelem.temperature || 94}°C
          </div>
          <span className={`text-[10px] font-semibold ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
            Safe band: &lt; 85.0°C
          </span>
        </Card>

        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Activity className="w-4 h-4 text-purple-600" />
            <span>Bearing Vibration</span>
          </div>
          <div className="text-2xl font-heading font-bold text-slate-900">
            {liveTelem.vibration || 4.2} mm/s
          </div>
          <span className={`text-[10px] font-semibold ${isCritical ? 'text-rose-600' : 'text-emerald-600'}`}>
            Safe band: &lt; 3.00 mm/s
          </span>
        </Card>

        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Current Load Ratio</span>
          </div>
          <div className="text-2xl font-heading font-bold text-slate-900">
            {liveTelem.load || 82}%
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Continuous duty</span>
        </Card>

        <Card className="p-4 bg-slate-50 border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <Fuel className="w-4 h-4 text-emerald-600" />
            <span>Fuel Burn Rate</span>
          </div>
          <div className="text-2xl font-heading font-bold text-slate-900">
            {liveTelem.fuelConsumption || 12.5} L/hr
          </div>
          <span className="text-[10px] text-slate-500 font-semibold">Jet A-1 Fuel</span>
        </Card>
      </div>

      {/* Recharts Live Chart & Specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Card>
            <CardHeader
              title="Thermal & Vibration Progression Trend"
              subtitle="Downsampled telemetry stream from MQTT broker"
            />
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    name="Temperature (°C)"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="vib"
                    name="Vibration (mm/s)"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader
              title="Asset Technical Specs"
              subtitle="NCPOR Equipment Registry"
            />

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Asset Identifier:</span>
                <span className="font-mono font-bold text-slate-900">{id}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Manufacturer:</span>
                <span className="font-medium text-slate-900">Kirloskar Oil Engines</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Rated Output:</span>
                <span className="font-medium text-slate-900">100 kVA (80 kW)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Fuel Grade:</span>
                <span className="font-medium text-slate-900">Jet A-1 Aviation Polar</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Installation Date:</span>
                <span className="font-medium text-slate-900">January 2012</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Station: {currentStationCode} Base</span>
              <span className="text-emerald-600 font-semibold">Sensor Ring: Online</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AssetDetails;
