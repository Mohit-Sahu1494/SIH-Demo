import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Zap,
  Boxes,
  Package,
  CloudSnow,
  Radio,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import HealthOverview from '../components/dashboard/HealthOverview.jsx';
import StationCanvas from '../components/digital-twin/StationCanvas.jsx';
import useStationStore from '../store/stationStore.js';

export function StationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { stations, setStationCode, currentStationCode } = useStationStore();
  const [activeTab, setActiveTab] = useState('overview');

  const code = (id || 'BHT').toUpperCase();
  const station = stations.find((s) => s.code === code) || stations[0];
  const isSelected = currentStationCode === station?.code;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/stations')}
        >
          All Stations
        </Button>
      </div>

      <PageHeader
        title={station?.name || 'Bharati Station'}
        subtitle={`Antarctic Station Specification & Diagnostic Overview (${station?.code})`}
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={station?.status} />
            <Badge variant="simulated" size="sm">DATA SOURCE: SIMULATED (MQTT)</Badge>
          </div>
        }
        action={
          !isSelected && (
            <Button
              variant="primary"
              size="sm"
              icon={Sliders}
              onClick={() => setStationCode(station.code)}
            >
              Set as Active Station
            </Button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['overview', 'digital-twin', 'infrastructure-matrix'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-sky-50 text-sky-800 shadow-xs border border-sky-200 font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Health Index Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <HealthOverview
                breakdown={station?.healthBreakdown}
                healthScore={station?.healthScore || 91}
              />
            </div>

            <div className="lg:col-span-5">
              <Card className="h-full flex flex-col justify-between">
                <CardHeader
                  title="Geographic & Structural Specifications"
                  subtitle="National polar expedition facility records"
                />

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Coordinates:</span>
                    <span className="font-mono text-slate-900 font-medium">
                      {station?.location?.latitude?.toFixed(2)}°S, {station?.location?.longitude?.toFixed(2)}°E
                    </span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Elevation:</span>
                    <span className="font-medium text-slate-900">35 meters above sea level</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Wintering Capacity:</span>
                    <span className="font-medium text-slate-900">47 Scientists & Technicians</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Summer Expedition Peak:</span>
                    <span className="font-medium text-slate-900">72 Personnel</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">Primary Fuel Spec:</span>
                    <span className="font-medium text-slate-900">Aviation Turbine Fuel (Jet A-1)</span>
                  </div>

                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Operational Custodian:</span>
                    <span className="font-medium text-slate-900">NCPOR, Goa, India</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  Commissioned Year: {station?.commissionedYear || 2012}
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'digital-twin' && (
        <Card className="p-2 border-slate-200">
          <StationCanvas className="h-[540px] w-full" />
        </Card>
      )}

      {activeTab === 'infrastructure-matrix' && (
        <Card>
          <CardHeader
            title="Subsystem Functional Matrix"
            subtitle="Integrated operational categories"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <Zap className="w-5 h-5 text-amber-600 mb-2" />
              <div className="font-bold text-slate-900">Power & Microgrid</div>
              <p className="text-slate-500 mt-1">
                2x 100 kVA Diesel Gensets, 150 kWh LiFePO4 ESS battery storage, and automated synchronized load-shedding switchgear.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <Boxes className="w-5 h-5 text-sky-600 mb-2" />
              <div className="font-bold text-slate-900">Scientific Labs</div>
              <p className="text-slate-500 mt-1">
                Atmospheric aerosol LIDAR, Geomagnetic observatories, meteorology balloons, and high-frequency communication radomes.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <Package className="w-5 h-5 text-emerald-600 mb-2" />
              <div className="font-bold text-slate-900">Life Support Utilities</div>
              <p className="text-slate-500 mt-1">
                Hydronic exhaust heat recovery loop, automated snow-melters, reverse osmosis purification, and thermal food storage.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default StationDetails;
