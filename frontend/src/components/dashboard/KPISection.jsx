import React from 'react';
import {
  Thermometer,
  Wind,
  Zap,
  Battery,
  Boxes,
  Fuel,
  Package,
  AlertTriangle,
  Activity,
  Droplets,
} from 'lucide-react';
import MetricCard from '../common/MetricCard.jsx';
import useDashboardStore from '../../store/dashboardStore.js';
import useAlertStore from '../../store/alertStore.js';

export function KPISection() {
  const { environment, energy, assetsTelemetry } = useDashboardStore();
  const activeAlertCount = useAlertStore((s) => s.activeCount);

  const gen02 = assetsTelemetry['GEN-02'] || {};
  const isGen02Critical = gen02.status === 'CRITICAL';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Environment KPI */}
      <MetricCard
        title="Antarctic Ambient"
        value={environment.temperature !== undefined ? `${environment.temperature}°C` : '-28.4°C'}
        unit=""
        icon={Thermometer}
        status={environment.temperature < -40 ? 'critical' : 'info'}
        subtitle={`Wind: ${environment.windSpeed || 32} km/h ${environment.windDirection || 'ESE'}`}
        badgeText="REFERENCE"
        badgeVariant="reference"
      />

      {/* 2. Energy Generation & Demand */}
      <MetricCard
        title="Power Microgrid"
        value={energy.generation !== undefined ? `${energy.generation}` : '168'}
        unit="kW Gen"
        icon={Zap}
        status={energy.generatorLoad > 90 ? 'warning' : 'healthy'}
        subtitle={`Load: ${energy.consumption || 144} kW (${energy.generatorLoad || 72}%)`}
        badgeText="SIMULATED"
        badgeVariant="simulated"
      />

      {/* 3. Battery ESS */}
      <MetricCard
        title="Battery Storage"
        value={energy.batteryLevel !== undefined ? `${energy.batteryLevel}%` : '88%'}
        unit="SOC"
        icon={Battery}
        status={energy.batteryLevel < 25 ? 'critical' : energy.batteryLevel < 45 ? 'warning' : 'healthy'}
        subtitle="150 kWh LiFePO4 Bank"
        badgeText="SIMULATED"
        badgeVariant="simulated"
      />

      {/* 4. Infrastructure Health & Genset Telemetry */}
      <MetricCard
        title="Asset Fleet Status"
        value={isGen02Critical ? 'DEGRADED' : 'NOMINAL'}
        unit=""
        icon={Boxes}
        status={isGen02Critical ? 'critical' : 'healthy'}
        subtitle={isGen02Critical ? 'GEN-02 Alert Triggered' : '20/20 Units Operational'}
        badgeText={isGen02Critical ? 'CRITICAL' : 'HEALTHY'}
        badgeVariant={isGen02Critical ? 'critical' : 'healthy'}
      />

      {/* 5. Fuel & Logistics Reserve */}
      <MetricCard
        title="Fuel Reserve"
        value={energy.fuelLevel !== undefined ? `${energy.fuelLevel}%` : '76.5%'}
        unit="Jet A-1"
        icon={Fuel}
        status={energy.fuelLevel < 20 ? 'critical' : energy.fuelLevel < 35 ? 'warning' : 'healthy'}
        subtitle="Est. 45 Days Autonomy"
        badgeText="LOGISTICS"
        badgeVariant="info"
      />
    </div>
  );
}

export default KPISection;
