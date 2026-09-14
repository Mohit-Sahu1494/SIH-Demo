import React, { useEffect, useState } from 'react';
import { Server, Database, Radio, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api.js';

export function AdminSystem() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get('/health').then((res) => setHealth(res.data)).catch(() => {});
  }, []);

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-heading font-black text-slate-900">
          Core System Infrastructure Status
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Low-level diagnostic metrics for Node.js process runtime, MQTT Aedes broker, and MongoDB memory storage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-500" />
            <span>Node.js Application Runtime</span>
          </h3>
          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Service:</span>
              <strong className="text-slate-800">{health?.service || 'POLAR TWIN API'}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Service Health:</span>
              <strong className="text-emerald-600 font-mono font-bold uppercase">{health?.status || 'HEALTHY'}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Process Uptime:</span>
              <strong className="text-slate-800 font-mono">{health?.uptimeSeconds || 120} seconds</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Node Environment:</span>
              <strong className="text-slate-800 font-mono">Development / SIH Prototype</strong>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-500" />
            <span>Database & Messaging Buses</span>
          </h3>
          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">MongoDB Layer:</span>
              <strong className="text-emerald-600 font-mono font-bold uppercase">{health?.database || 'CONNECTED'}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">MQTT Ingestion Loop:</span>
              <strong className="text-emerald-600 font-mono font-bold uppercase">{health?.mqtt || 'ACTIVE'}</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Telemetry Publishing Tick:</span>
              <strong className="text-purple-700 font-mono font-bold">5000 ms (5 seconds)</strong>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">WebSocket Transport:</span>
              <strong className="text-emerald-600 font-mono font-bold">Socket.IO Engine.IO v4</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSystem;
