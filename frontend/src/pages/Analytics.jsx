import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Zap,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import useStationStore from '../store/stationStore.js';

export function Analytics() {
  const { currentStationCode } = useStationStore();
  const [days, setDays] = useState('7');

  // Synthetic 7-day health & energy trend
  const healthData = [
    { day: 'Day -6', overall: 92, env: 94, energy: 88, infra: 92 },
    { day: 'Day -5', overall: 91, env: 93, energy: 87, infra: 91 },
    { day: 'Day -4', overall: 93, env: 95, energy: 89, infra: 92 },
    { day: 'Day -3', overall: 90, env: 92, energy: 86, infra: 90 },
    { day: 'Day -2', overall: 91, env: 94, energy: 87, infra: 91 },
    { day: 'Yesterday', overall: 92, env: 94, energy: 88, infra: 92 },
    { day: 'Today', overall: 91, env: 94, energy: 87, infra: 91 },
  ];

  const alertFreqData = [
    { category: 'Overheating', count: 3, resolved: 3 },
    { category: 'Vibration', count: 2, resolved: 2 },
    { category: 'Low Fuel', count: 1, resolved: 1 },
    { category: 'Katabatic Storm', count: 2, resolved: 2 },
    { category: 'Water Filter', count: 4, resolved: 4 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Historical Analytics"
        subtitle={`Long-term telemetry downsampling and multi-factor performance analysis for ${currentStationCode}`}
        badge={<Badge variant="healthy" size="sm">AGGREGATED TELEMETRY</Badge>}
        action={
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
            {['7', '14', '30'].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  days === d ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {d} Days
              </button>
            ))}
          </div>
        }
      />

      {/* 1. Station Health History */}
      <Card>
        <CardHeader
          title="Station Dynamic Health Progression (7 Days)"
          subtitle="Composite rating history synthesizing Environment, Energy, and Infrastructure"
        />
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={healthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="overall"
                name="Overall Station Health (%)"
                stroke="#0284C7"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="energy"
                name="Energy Health (%)"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="infra"
                name="Infrastructure Health (%)"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Anomaly Category Frequency */}
      <Card>
        <CardHeader
          title="Anomaly Detection Frequency by Subsystem"
          subtitle="Historical incidence distribution of threshold trigger events"
        />
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alertFreqData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="category" stroke="#94A3B8" fontSize={11} />
              <YAxis stroke="#94A3B8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="count" name="Total Triggered" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="resolved" name="Successfully Resolved" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Analytics;
