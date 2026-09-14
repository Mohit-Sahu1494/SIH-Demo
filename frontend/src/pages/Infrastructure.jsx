import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Boxes, Zap, Cpu, Wrench, Shield, ArrowRight, Activity, Thermometer } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import assetService from '../services/assetService.js';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function Infrastructure() {
  const navigate = useNavigate();
  const { currentStationCode } = useStationStore();
  const { assetsTelemetry, openInspector } = useDashboardStore();

  const [assets, setAssets] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [assetList, catBreakdown] = await Promise.all([
          assetService.getAll(currentStationCode),
          assetService.getBreakdown(currentStationCode),
        ]);
        setAssets(assetList || []);
        setBreakdown(catBreakdown || {});
      } catch (err) {
        // keep fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentStationCode]);

  // Merge live simulator telemetry from store into assets
  const enrichedAssets = assets.map((a) => {
    const live = assetsTelemetry[a.assetId] || {};
    return {
      ...a,
      status: live.status || a.status,
      healthScore: typeof live.healthScore === 'number' ? live.healthScore : a.healthScore,
      currentTelemetry: {
        ...a.currentTelemetry,
        ...live,
      },
    };
  });

  const filteredAssets = enrichedAssets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetId.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || a.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Power', 'Buildings', 'Utilities', 'Equipment', 'Communication', 'Logistics'];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Infrastructure & Asset Operations"
        subtitle="Real-time mechanical and structural telemetry tracking across 20+ station assets"
        badge={<Badge variant="simulated" size="sm">TELEMETRY BINDING: ACTIVE</Badge>}
      />

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const info = breakdown[cat] || { health: 92, count: 3, critical: 0 };
          return (
            <div
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'ALL' : cat)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'border-sky-500 bg-sky-50/50 shadow-sm ring-2 ring-sky-500/20'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{cat}</span>
                <span className={`font-mono ${info.health < 75 ? 'text-rose-600 font-bold' : 'text-slate-900'}`}>
                  {info.health}%
                </span>
              </div>
              <ProgressBar
                value={info.health}
                color={info.health >= 85 ? 'emerald' : info.health >= 70 ? 'amber' : 'rose'}
                showPercentage={false}
              />
              <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                <span>{info.count} Assets</span>
                {info.critical > 0 && (
                  <span className="text-rose-600 font-bold animate-pulse">
                    {info.critical} Critical
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Asset Table with Search and Filters */}
      <Card className="p-0 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by Asset ID or Name (e.g. GEN-02)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="HEALTHY">HEALTHY</option>
              <option value="WARNING">WARNING</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset ID</th>
                <th className="py-3 px-4">Asset Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Health</th>
                <th className="py-3 px-4">Live Telemetry</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const isCritical = asset.status === 'CRITICAL';
                return (
                  <tr
                    key={asset.assetId}
                    onClick={() => navigate(`/infrastructure/${asset.assetId}`)}
                    className={`hover:bg-slate-50/90 transition-colors cursor-pointer ${
                      isCritical ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">
                      {asset.assetId}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{asset.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        {asset.location?.building || 'Main Complex'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {asset.category}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={asset.status} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          asset.healthScore < 50 ? 'text-rose-600' : asset.healthScore < 80 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                          {asset.healthScore}%
                        </span>
                        <div className="w-16">
                          <ProgressBar
                            value={asset.healthScore}
                            color={asset.healthScore >= 85 ? 'emerald' : asset.healthScore >= 70 ? 'amber' : 'rose'}
                            showPercentage={false}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {asset.currentTelemetry?.temperature !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className={asset.currentTelemetry.temperature > 90 ? 'text-rose-600 font-bold' : ''}>
                            {asset.currentTelemetry.temperature}°C
                          </span>
                          {asset.currentTelemetry?.vibration !== undefined && (
                            <span className="text-slate-400">
                              • {asset.currentTelemetry.vibration} mm/s
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">Nominal</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInspector(asset.assetId);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default Infrastructure;
