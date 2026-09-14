import React, { useEffect, useState } from 'react';
import { Database, Radio, Globe, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import api from '../services/api.js';

export function AdminDataSources() {
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSources() {
      try {
        const res = await api.get('/data-sources');
        setSources(res.data?.data || []);
      } catch (e) {
        console.warn('Error loading data sources:', e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadSources();
  }, []);

  return (
    <div className="space-y-6 select-none">
      <div>
        <h1 className="text-2xl font-heading font-black text-slate-900">
          Connected Data Sources & Observatories
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Surveillance of verified external telemetry ingestion pipelines, NCPOR ground observation portals, and meteorological models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sources.map((src) => (
          <div
            key={src.code}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {src.type}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{src.status}</span>
                </span>
              </div>

              <h3 className="font-heading font-bold text-base text-slate-900 leading-snug">
                {src.name}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{src.description}</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Reliability Index:</span>
                <strong className="text-slate-800 font-mono">{src.reliabilityScore}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Target Base:</span>
                <strong className="text-slate-800 font-mono">{src.station}</strong>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Last Synchronized:</span>
                <span>{new Date(src.lastSync || Date.now()).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDataSources;
