import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Compass, Thermometer, Zap, Fuel, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import Card from '../components/common/Card.jsx';
import Badge from '../components/common/Badge.jsx';
import StatusBadge from '../components/common/StatusBadge.jsx';
import Button from '../components/common/Button.jsx';
import HealthScore from '../components/common/HealthScore.jsx';
import useStationStore from '../store/stationStore.js';
import useDashboardStore from '../store/dashboardStore.js';

export function Stations() {
  const navigate = useNavigate();
  const { stations, setStationCode, currentStationCode } = useStationStore();
  const { environment, energy } = useDashboardStore();

  const handleSelect = (code) => {
    setStationCode(code);
    navigate(`/stations/${code}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Indian Antarctic Research Stations"
        subtitle="National Centre for Polar and Ocean Research (NCPOR) — Ministry of Earth Sciences"
        badge={<Badge variant="info" size="sm">2 ACTIVE RESEARCH BASES</Badge>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stations.map((st) => {
          const isSelected = currentStationCode === st.code;
          const isBharati = st.code === 'BHT';

          return (
            <Card
              key={st.code}
              hover
              onClick={() => handleSelect(st.code)}
              className={`p-6 border transition-all ${
                isSelected ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 shadow-md' : 'border-slate-200'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      {st.code}
                    </span>
                    <StatusBadge status={st.status} />
                    {isSelected && (
                      <Badge variant="healthy" size="sm">
                        <CheckCircle2 className="w-3 h-3 mr-1 inline" /> ACTIVE CONTEXT
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-2xl tracking-tight">
                    {st.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                    <span>{st.location?.region || 'East Antarctica'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono">{st.location?.latitude?.toFixed(2)}°S, {st.location?.longitude?.toFixed(2)}°E</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <HealthScore score={st.healthScore || (isBharati ? 91 : 89)} size="md" showLabel={false} />
                </div>
              </div>

              <p className="text-xs text-slate-600 mb-5 line-clamp-2 leading-relaxed">
                {st.description || (isBharati
                  ? "India's state-of-the-art third Antarctic base in Larsemann Hills, operating an automated energy microgrid and comprehensive atmospheric lab."
                  : "India's second permanent polar station in Schirmacher Oasis, supporting year-round biological and meteorological observations."
                )}
              </p>

              {/* Key Station Metrics Grid */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-white rounded-xl border border-slate-200/80 mb-5">
                <div className="text-center border-r border-slate-100 pr-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase mb-0.5">
                    <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                    <span>Temp</span>
                  </div>
                  <div className="font-heading font-bold text-slate-900 text-base">
                    {isBharati ? `${environment.temperature || -28.4}°C` : '-31.2°C'}
                  </div>
                </div>

                <div className="text-center border-r border-slate-100 pr-2">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase mb-0.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600" />
                    <span>Microgrid</span>
                  </div>
                  <div className="font-heading font-bold text-slate-900 text-base">
                    {isBharati ? `${energy.generation || 168} kW` : '152 kW'}
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 font-semibold uppercase mb-0.5">
                    <Fuel className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Fuel Stock</span>
                  </div>
                  <div className="font-heading font-bold text-slate-900 text-base">
                    {isBharati ? `${energy.fuelLevel || 76.5}%` : '72.0%'}
                  </div>
                </div>
              </div>

              {/* Footer Button */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono">
                  Established: {isBharati ? '2012' : '1989'}
                </span>
                <Button
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="sm"
                  icon={ArrowRight}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(st.code);
                  }}
                >
                  {isSelected ? 'Open Mission Control' : 'Switch & Inspect'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default Stations;
