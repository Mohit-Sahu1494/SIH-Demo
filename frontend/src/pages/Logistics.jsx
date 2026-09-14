import React, { useState, useEffect } from 'react';
import {
  Package,
  Fuel,
  Utensils,
  Pill,
  Wrench,
  Sparkles,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import MetricCard from '../components/common/MetricCard.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import ProgressBar from '../components/common/ProgressBar.jsx';
import Button from '../components/common/Button.jsx';
import logisticsService from '../services/logisticsService.js';
import useStationStore from '../store/stationStore.js';

export function Logistics() {
  const { currentStationCode } = useStationStore();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [itemList, sum] = await Promise.all([
          logisticsService.getAll(currentStationCode),
          logisticsService.getSummary(currentStationCode),
        ]);
        setItems(itemList || []);
        setSummary(sum || {});
      } catch (err) {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentStationCode]);

  const categories = ['Fuel', 'Food', 'Medicine', 'Spare Parts', 'Scientific Supplies', 'Maintenance Materials'];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Fuel': return Fuel;
      case 'Food': return Utensils;
      case 'Medicine': return Pill;
      case 'Spare Parts': return Wrench;
      default: return Package;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Antarctic Logistics & Inventory Roster"
        subtitle={`Critical supply reserves, consumption tracking, and replenishment buffers for ${currentStationCode}`}
        badge={<Badge variant="healthy" size="sm">NCPOR LOGISTICS DESK</Badge>}
      />

      {/* Logistics Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Jet A-1 Fuel Stock"
          value={`${summary?.fuelLevelPercent || 78.5}%`}
          unit=""
          icon={Fuel}
          status="healthy"
          subtitle={`${summary?.fuelDaysRemaining || 45} Days Autonomy`}
        />

        <MetricCard
          title="Food Provisions"
          value="180"
          unit="Days"
          icon={Utensils}
          status="healthy"
          subtitle="Meats & Dried Grain Store"
        />

        <MetricCard
          title="Critical Spare Parts"
          value="18"
          unit="Sets"
          icon={Wrench}
          status="healthy"
          subtitle="Genset & Pump Filters"
        />

        <MetricCard
          title="Trauma & Med Supplies"
          value="92%"
          unit="Indexed"
          icon={Pill}
          status="healthy"
          subtitle="Oxygen & Cold-weather kits"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          All Categories ({items.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const Icon = getCategoryIcon(item.category);
          const isCritical = item.status === 'CRITICAL' || item.daysRemaining < 10;
          const isWarning = item.status === 'WARNING' || item.daysRemaining < 25;

          return (
            <Card
              key={item._id || item.itemName}
              className={`p-5 border transition-all ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/20'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-slate-900 text-xs leading-snug">
                      {item.itemName}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.category}
                    </span>
                  </div>
                </div>
                <StatusBadge status={item.status} size="sm" />
              </div>

              <div className="my-3">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-xl font-heading font-black text-slate-900">
                    {item.quantity} {item.unit}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {item.daysRemaining} days left
                  </span>
                </div>
                <ProgressBar
                  value={item.daysRemaining}
                  max={90}
                  color={isCritical ? 'rose' : isWarning ? 'amber' : 'emerald'}
                  showPercentage={false}
                />
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Threshold: &lt; {item.warningThreshold} {item.unit}</span>
                <span className="font-mono text-slate-400">
                  {isCritical ? 'Order Supply Ship' : 'Stock Nominal'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Logistics;
