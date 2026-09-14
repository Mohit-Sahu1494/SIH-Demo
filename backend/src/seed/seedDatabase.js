import bcrypt from 'bcryptjs';
import connectDB, { disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Station } from '../models/Station.js';
import { Asset } from '../models/Asset.js';
import { Telemetry } from '../models/Telemetry.js';
import { EnvironmentReading } from '../models/EnvironmentReading.js';
import { EnergyReading } from '../models/EnergyReading.js';
import { InventoryItem } from '../models/InventoryItem.js';
import { Alert } from '../models/Alert.js';
import { MaintenanceRecord } from '../models/MaintenanceRecord.js';
import { HealthSnapshot } from '../models/HealthSnapshot.js';
import { Scenario } from '../models/Scenario.js';
import { AuditLog } from '../models/AuditLog.js';
import { DataSource } from '../models/DataSource.js';

export async function seedDatabase() {
  console.log('\x1b[34m[Seed] Starting POLAR TWIN database seeding...\x1b[0m');

  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Station.deleteMany({}),
    Asset.deleteMany({}),
    Telemetry.deleteMany({}),
    EnvironmentReading.deleteMany({}),
    EnergyReading.deleteMany({}),
    InventoryItem.deleteMany({}),
    Alert.deleteMany({}),
    MaintenanceRecord.deleteMany({}),
    HealthSnapshot.deleteMany({}),
    Scenario.deleteMany({}),
    AuditLog.deleteMany({}),
    DataSource.deleteMany({}),
  ]);

  console.log('[Seed] Cleared existing records.');

  // 1. Seed Demo Users
  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const opPass = await bcrypt.hash('Operator@123', salt);
  const viewPass = await bcrypt.hash('Viewer@123', salt);

  const users = await User.insertMany([
    {
      name: 'Dr. Rajesh Sharma (Mission Director)',
      email: 'admin@polartwin.gov.in',
      passwordHash: adminPass,
      role: 'ADMIN',
      isActive: true,
    },
    {
      name: 'Dr. Rajesh Sharma (Mission Director)',
      email: 'admin@polartwin.local',
      passwordHash: adminPass,
      role: 'ADMIN',
      isActive: true,
    },
    {
      name: 'Capt. Arun Verma (Chief Station Operator)',
      email: 'operator@polartwin.gov.in',
      passwordHash: opPass,
      role: 'OPERATOR',
      isActive: true,
    },
    {
      name: 'Capt. Arun Verma (Chief Station Operator)',
      email: 'operator@polartwin.local',
      passwordHash: opPass,
      role: 'OPERATOR',
      isActive: true,
    },
    {
      name: 'Sunita Menon (Scientific Researcher)',
      email: 'viewer@polartwin.gov.in',
      passwordHash: viewPass,
      role: 'VIEWER',
      isActive: true,
    },
    {
      name: 'Sunita Menon (Scientific Researcher)',
      email: 'viewer@polartwin.local',
      passwordHash: viewPass,
      role: 'VIEWER',
      isActive: true,
    },
  ]);
  console.log(`[Seed] Seeded ${users.length} demo users.`);

  // 1.1 Seed Data Sources
  await DataSource.insertMany([
    {
      name: 'NCPOR Polar Meteorological Network',
      code: 'NCPOR-MET',
      type: 'NCPOR',
      baseUrl: 'https://ncpor.res.in',
      station: 'ALL',
      status: 'ACTIVE',
      reliabilityScore: 99,
      description: 'National Centre for Polar and Ocean Research ground observation stations at Maitri and Bharati.',
    },
    {
      name: 'Open-Meteo Antarctic Atmospheric Model',
      code: 'OPEN-METEO-POLAR',
      type: 'WEATHER_MODEL',
      baseUrl: 'https://api.open-meteo.com/v1/forecast',
      station: 'ALL',
      status: 'ACTIVE',
      reliabilityScore: 94,
      description: 'High-resolution numerical weather prediction models (ECMWF/GFS) calibrated for polar latitudes.',
    },
    {
      name: 'POLAR TWIN Edge MQTT Telemetry Bus',
      code: 'POLAR-EDGE-MQTT',
      type: 'SIMULATOR',
      baseUrl: 'mqtt://localhost:1883',
      station: 'ALL',
      status: 'ACTIVE',
      reliabilityScore: 98,
      description: 'High-frequency telemetry stream publishing infrastructure, energy, and asset sensor readings every 5 seconds.',
    },
  ]);
  console.log('[Seed] Seeded operational data sources.');

  // 2. Seed Stations (Bharati and Maitri)
  const bharati = await Station.create({
    name: 'Bharati Station',
    code: 'BHT',
    location: {
      latitude: 69.4069,
      longitude: 76.1969,
      region: 'Larsemann Hills, East Antarctica',
      elevationMeters: 35,
    },
    description: "India's third Antarctic research station, commissioned in 2012. Built using 134 prefabricated shipping containers with modern green architecture.",
    commissionedYear: 2012,
    status: 'OPERATIONAL',
    healthScore: 91,
    healthBreakdown: {
      environment: 94,
      energy: 87,
      infrastructure: 91,
      logistics: 92,
    },
    metadata: {
      capacityCrew: 47,
      summerCrew: 72,
      fuelType: 'Aviation Turbine Fuel (Jet A-1)',
    },
  });

  const maitri = await Station.create({
    name: 'Maitri Station',
    code: 'MTR',
    location: {
      latitude: 70.7667,
      longitude: 11.7333,
      region: 'Schirmacher Oasis, Queen Maud Land',
      elevationMeters: 117,
    },
    description: "India's second permanent Antarctic research facility, commissioned in 1989 near Lake Priyadarshini. Houses atmospheric and biological research facilities.",
    commissionedYear: 1989,
    status: 'OPERATIONAL',
    healthScore: 89,
    healthBreakdown: {
      environment: 90,
      energy: 88,
      infrastructure: 89,
      logistics: 90,
    },
    metadata: {
      capacityCrew: 25,
      summerCrew: 65,
      lakeProximity: 'Lake Priyadarshini',
    },
  });
  console.log(`[Seed] Seeded 2 stations (Bharati & Maitri).`);

  // 3. Seed Assets (20+ assets across both stations)
  const assetTemplates = [
    // Power
    {
      assetId: 'GEN-01',
      name: 'Primary Diesel Genset 01 (100 kVA)',
      type: 'Diesel Generator',
      category: 'Power',
      status: 'HEALTHY',
      healthScore: 94,
      location: { building: 'Power House', coordinates3D: { x: -8, y: 1, z: 4 } },
      specifications: { manufacturer: 'Kirloskar Oil Engines', model: 'KOEL 100kVA Heavy Duty', capacity: '100 kW', fuelType: 'Jet A-1' },
      thresholds: { temperature: { warning: 85, critical: 92 }, vibration: { warning: 3.0, critical: 4.0 }, load: { warning: 85, critical: 95 } },
      currentTelemetry: { temperature: 78.4, vibration: 1.95, load: 72.0, oilPressure: 4.1, fuelConsumption: 11.2, rpm: 1500 },
    },
    {
      assetId: 'GEN-02',
      name: 'Secondary Diesel Genset 02 (100 kVA)',
      type: 'Diesel Generator',
      category: 'Power',
      status: 'HEALTHY',
      healthScore: 92,
      location: { building: 'Power House', coordinates3D: { x: -8, y: 1, z: 8 } },
      specifications: { manufacturer: 'Kirloskar Oil Engines', model: 'KOEL 100kVA Heavy Duty', capacity: '100 kW', fuelType: 'Jet A-1' },
      thresholds: { temperature: { warning: 85, critical: 92 }, vibration: { warning: 3.0, critical: 4.0 }, load: { warning: 85, critical: 95 } },
      currentTelemetry: { temperature: 79.1, vibration: 2.05, load: 74.5, oilPressure: 4.0, fuelConsumption: 11.5, rpm: 1500 },
    },
    {
      assetId: 'GEN-03',
      name: 'Emergency Backup Genset 03 (60 kVA)',
      type: 'Auxiliary Generator',
      category: 'Power',
      status: 'HEALTHY',
      healthScore: 98,
      location: { building: 'Power House', coordinates3D: { x: -8, y: 1, z: 12 } },
      specifications: { manufacturer: 'Cummins India', model: 'QSB6.7-G', capacity: '60 kW', fuelType: 'Jet A-1' },
      thresholds: { temperature: { warning: 85, critical: 92 }, vibration: { warning: 3.0, critical: 4.0 }, load: { warning: 85, critical: 95 } },
      currentTelemetry: { temperature: 24.0, vibration: 0.1, load: 0.0, oilPressure: 0.0, fuelConsumption: 0.0, rpm: 0 },
    },
    {
      assetId: 'BAT-01',
      name: 'Central LiFePO4 Energy Storage Bank (150 kWh)',
      type: 'Battery ESS',
      category: 'Power',
      status: 'HEALTHY',
      healthScore: 96,
      location: { building: 'Power House Annex', coordinates3D: { x: -6, y: 0.5, z: 14 } },
      specifications: { manufacturer: 'Exide Technologies', model: 'Lithium Master Polar 48V', capacity: '150 kWh' },
      thresholds: { temperature: { warning: 30, critical: 40 }, load: { warning: 85, critical: 95 } },
      currentTelemetry: { temperature: 21.5, load: 45.0 },
    },
    // Logistics / Fuel
    {
      assetId: 'FUEL-01',
      name: 'Primary Jet A-1 Fuel Bulk Tank 01 (60,000 L)',
      type: 'Fuel Storage',
      category: 'Logistics',
      status: 'HEALTHY',
      healthScore: 91,
      location: { building: 'Fuel Farm Alpha', coordinates3D: { x: -14, y: 1.5, z: -4 } },
      specifications: { capacity: '60,000 Liters', insulation: 'Double Wall Vacuum Jacket' },
      thresholds: { load: { warning: 30, critical: 15 } },
      currentTelemetry: { temperature: -4.2, load: 78.5 },
    },
    {
      assetId: 'FUEL-02',
      name: 'Secondary Fuel Reserve Tank 02 (40,000 L)',
      type: 'Fuel Storage',
      category: 'Logistics',
      status: 'HEALTHY',
      healthScore: 95,
      location: { building: 'Fuel Farm Alpha', coordinates3D: { x: -14, y: 1.5, z: 2 } },
      specifications: { capacity: '40,000 Liters', insulation: 'Double Wall Vacuum Jacket' },
      thresholds: { load: { warning: 30, critical: 15 } },
      currentTelemetry: { temperature: -5.0, load: 84.0 },
    },
    // Buildings
    {
      assetId: 'BLD-01',
      name: 'Main Station Living & Operations Complex',
      type: 'Main Structure',
      category: 'Buildings',
      status: 'HEALTHY',
      healthScore: 97,
      location: { building: 'Main Station', coordinates3D: { x: 0, y: 2, z: 0 } },
      specifications: { design: 'Aerodynamic Stilt Architecture', area: '2100 sq m' },
      thresholds: { temperature: { warning: 26, critical: 30 } },
      currentTelemetry: { temperature: 21.8 },
    },
    {
      assetId: 'LAB-01',
      name: 'Atmospheric Physics & Clean Room Laboratory',
      type: 'Research Lab',
      category: 'Buildings',
      status: 'HEALTHY',
      healthScore: 94,
      location: { building: 'Research Wing', coordinates3D: { x: 6, y: 1.5, z: -4 } },
      specifications: { cleanClass: 'ISO 7', shielding: 'RF Isolated' },
      currentTelemetry: { temperature: 20.5 },
    },
    {
      assetId: 'LAB-02',
      name: 'Geomagnetism, Seismology & Earth Science Lab',
      type: 'Research Lab',
      category: 'Buildings',
      status: 'HEALTHY',
      healthScore: 93,
      location: { building: 'Research Wing', coordinates3D: { x: 6, y: 1.5, z: 4 } },
      specifications: { isolation: 'Vibration Isolated Pier' },
      currentTelemetry: { temperature: 19.8 },
    },
    {
      assetId: 'WH-01',
      name: 'Expedition Equipment & Spare Parts Warehouse',
      type: 'Storage',
      category: 'Logistics',
      status: 'HEALTHY',
      healthScore: 95,
      location: { building: 'Warehouse Module', coordinates3D: { x: 12, y: 1, z: 8 } },
      specifications: { climate: 'Dry Cold Controlled' },
      currentTelemetry: { temperature: 8.5 },
    },
    // Communication
    {
      assetId: 'COM-01',
      name: 'C-Band High-Gain Satellite Ground Station Radome',
      type: 'Satellite Radome',
      category: 'Communication',
      status: 'HEALTHY',
      healthScore: 96,
      location: { building: 'Comms Tower Hill', coordinates3D: { x: 10, y: 4, z: -10 } },
      specifications: { diameter: '4.5 m Radome', link: 'GSAT / Intelsat' },
      currentTelemetry: { temperature: -12.4 },
    },
    {
      assetId: 'COM-02',
      name: 'Long-Range HF / VHF Polar Radio Array',
      type: 'Antenna Array',
      category: 'Communication',
      status: 'HEALTHY',
      healthScore: 92,
      location: { building: 'Mast Array East', coordinates3D: { x: 14, y: 3, z: -6 } },
      specifications: { freq: '3-30 MHz HF Polar' },
      currentTelemetry: { temperature: -28.0 },
    },
    // Utilities
    {
      assetId: 'HTG-01',
      name: 'Primary Hydronic Baseboard Heating Circulation Loop',
      type: 'HVAC Heating',
      category: 'Utilities',
      status: 'HEALTHY',
      healthScore: 90,
      location: { building: 'Utilities Core', coordinates3D: { x: 0, y: 0.5, z: 4 } },
      specifications: { medium: 'Propylene Glycol 50/50', pressure: '2.5 bar' },
      thresholds: { temperature: { warning: 80, critical: 90 } },
      currentTelemetry: { temperature: 68.2, oilPressure: 2.4 },
    },
    {
      assetId: 'HTG-02',
      name: 'Exhaust Heat Recovery Exchanger System',
      type: 'Heat Recovery',
      category: 'Utilities',
      status: 'HEALTHY',
      healthScore: 92,
      location: { building: 'Power House Core', coordinates3D: { x: -6, y: 1.5, z: 6 } },
      specifications: { efficiency: '78% Thermal Capture' },
      currentTelemetry: { temperature: 74.0 },
    },
    {
      assetId: 'WTR-01',
      name: 'Automated Snow Melting & RO Drinking Water Plant',
      type: 'Water System',
      category: 'Utilities',
      status: 'HEALTHY',
      healthScore: 91,
      location: { building: 'Water Processing', coordinates3D: { x: -2, y: 0.5, z: -8 } },
      specifications: { capacity: '3500 L/day RO water' },
      currentTelemetry: { temperature: 14.5 },
    },
    {
      assetId: 'WTR-02',
      name: 'Biological Greywater Recycling & Treatment Unit',
      type: 'Wastewater',
      category: 'Utilities',
      status: 'HEALTHY',
      healthScore: 89,
      location: { building: 'Water Processing', coordinates3D: { x: -2, y: 0.5, z: -12 } },
      specifications: { standard: 'Antarctic Protocol Annex III' },
      currentTelemetry: { temperature: 18.2 },
    },
    // Equipment
    {
      assetId: 'SCI-01',
      name: 'Aerosol Multi-wavelength LIDAR Sky Scanner',
      type: 'Scientific Instrument',
      category: 'Equipment',
      status: 'HEALTHY',
      healthScore: 95,
      location: { building: 'Roof Deck Observational Hatch', coordinates3D: { x: 2, y: 3.5, z: -2 } },
      specifications: { wavelengths: '355, 532, 1064 nm' },
      currentTelemetry: { temperature: 22.0 },
    },
    {
      assetId: 'SCI-02',
      name: 'Digital Fluxgate Tri-axial Magnetometer',
      type: 'Scientific Instrument',
      category: 'Equipment',
      status: 'HEALTHY',
      healthScore: 97,
      location: { building: 'Geomagnetic Hut', coordinates3D: { x: 18, y: 0.5, z: 0 } },
      specifications: { sensitivity: '0.01 nT' },
      currentTelemetry: { temperature: 16.0 },
    },
    // Vehicles
    {
      assetId: 'VEH-01',
      name: 'PistenBully 300 Polar Tracked Snowcat',
      type: 'Heavy Polar Vehicle',
      category: 'Logistics',
      status: 'HEALTHY',
      healthScore: 88,
      location: { building: 'Vehicle Garage', coordinates3D: { x: 16, y: 1, z: 12 } },
      specifications: { engine: 'Mercedes-Benz OM 926 LA', horsepower: '330 hp' },
      currentTelemetry: { temperature: -14.0, load: 0.0 },
    },
    {
      assetId: 'VEH-02',
      name: 'Kässbohrer Arctic Logistic Heavy Sledge Train',
      type: 'Transport Sledge',
      category: 'Logistics',
      status: 'HEALTHY',
      healthScore: 94,
      location: { building: 'Vehicle Staging Yard', coordinates3D: { x: 18, y: 0.5, z: 16 } },
      specifications: { payload: '20 Metric Tons' },
      currentTelemetry: { temperature: -28.0 },
    },
  ];

  const bharatiAssets = assetTemplates.map((a) => ({
    ...a,
    stationId: bharati._id,
    stationCode: 'BHT',
    lastMaintenanceAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    nextMaintenanceAt: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
  }));

  const maitriAssets = assetTemplates.map((a) => ({
    ...a,
    stationId: maitri._id,
    stationCode: 'MTR',
    lastMaintenanceAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    nextMaintenanceAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  }));

  await Asset.insertMany([...bharatiAssets, ...maitriAssets]);
  console.log(`[Seed] Seeded ${bharatiAssets.length + maitriAssets.length} station infrastructure assets.`);

  // 4. Seed Inventory Items for Bharati and Maitri
  const inventoryData = [
    { itemName: 'Polar Aviation Diesel (Jet A-1)', category: 'Fuel', quantity: 78.5, unit: '%', warningThreshold: 30, criticalThreshold: 15, daysRemaining: 45, status: 'HEALTHY' },
    { itemName: 'Emergency Heating Kerosene', category: 'Fuel', quantity: 84.0, unit: '%', warningThreshold: 25, criticalThreshold: 12, daysRemaining: 62, status: 'HEALTHY' },
    { itemName: 'Frozen Food Provisions (Meats & Vegetables)', category: 'Food', quantity: 180, unit: 'Days Buffer', warningThreshold: 60, criticalThreshold: 30, daysRemaining: 180, status: 'HEALTHY' },
    { itemName: 'Dehydrated Rations & Grains', category: 'Food', quantity: 240, unit: 'Days Buffer', warningThreshold: 90, criticalThreshold: 45, daysRemaining: 240, status: 'HEALTHY' },
    { itemName: 'Antibiotics & Emergency Trauma Kits', category: 'Medicine', quantity: 92, unit: '%', warningThreshold: 40, criticalThreshold: 20, daysRemaining: 210, status: 'HEALTHY' },
    { itemName: 'Medical Oxygen Cylinders', category: 'Medicine', quantity: 14, unit: 'Cylinders', warningThreshold: 6, criticalThreshold: 3, daysRemaining: 120, status: 'HEALTHY' },
    { itemName: 'Generator Oil & Air Filters (Set)', category: 'Spare Parts', quantity: 18, unit: 'Sets', warningThreshold: 6, criticalThreshold: 2, daysRemaining: 95, status: 'HEALTHY' },
    { itemName: 'Replacement Bearing Sleeves & Belts', category: 'Spare Parts', quantity: 8, unit: 'Sets', warningThreshold: 3, criticalThreshold: 1, daysRemaining: 140, status: 'HEALTHY' },
    { itemName: 'Helium Gas for Meteorological Balloons', category: 'Scientific Supplies', quantity: 32, unit: 'Cylinders', warningThreshold: 10, criticalThreshold: 4, daysRemaining: 85, status: 'HEALTHY' },
    { itemName: 'Optical Calibration Sensors', category: 'Scientific Supplies', quantity: 95, unit: '%', warningThreshold: 35, criticalThreshold: 15, daysRemaining: 160, status: 'HEALTHY' },
    { itemName: 'Antarctic Antifreeze Coolant (Glycol)', category: 'Maintenance Materials', quantity: 450, unit: 'Liters', warningThreshold: 150, criticalThreshold: 50, daysRemaining: 110, status: 'HEALTHY' },
    { itemName: 'Electrical Cable Harnesses & Fuses', category: 'Maintenance Materials', quantity: 88, unit: '%', warningThreshold: 30, criticalThreshold: 15, daysRemaining: 175, status: 'HEALTHY' },
  ];

  const bharatiInventory = inventoryData.map((item) => ({
    ...item,
    stationId: bharati._id,
    stationCode: 'BHT',
    lastUpdated: new Date(),
  }));

  const maitriInventory = inventoryData.map((item) => ({
    ...item,
    stationId: maitri._id,
    stationCode: 'MTR',
    lastUpdated: new Date(),
  }));

  await InventoryItem.insertMany([...bharatiInventory, ...maitriInventory]);
  console.log(`[Seed] Seeded inventory items for both stations.`);

  // 5. Seed Historical Readings (Past 24 hours in 1-hour increments)
  const envReadings = [];
  const energyReadings = [];
  const now = Date.now();

  for (let i = 24; i >= 0; i--) {
    const timestamp = new Date(now - i * 60 * 60 * 1000);

    // Bharati
    envReadings.push({
      stationId: bharati._id,
      stationCode: 'BHT',
      temperature: +(-28.5 + Math.sin(i * 0.4) * 2.2).toFixed(1),
      humidity: Math.round(68 + Math.cos(i * 0.3) * 5),
      pressure: Math.round(988 + Math.sin(i * 0.2) * 4),
      windSpeed: +(32.4 + Math.sin(i * 0.5) * 6).toFixed(1),
      windDirection: 'ESE',
      visibility: 18,
      snow: 'Light Flurries',
      timestamp,
      sourceType: 'REFERENCE',
    });

    energyReadings.push({
      stationId: bharati._id,
      stationCode: 'BHT',
      generation: +(168 + Math.sin(i * 0.3) * 8).toFixed(1),
      consumption: +(144 + Math.cos(i * 0.4) * 7).toFixed(1),
      batteryLevel: +(88 - (i % 4) * 1.5).toFixed(1),
      fuelLevel: +(76.5 - (24 - i) * 0.1).toFixed(1),
      generatorLoad: +(72 + Math.sin(i * 0.5) * 5).toFixed(1),
      peakLoad: 182,
      efficiency: 91,
      timestamp,
      sourceType: 'SIMULATED',
    });

    // Maitri
    envReadings.push({
      stationId: maitri._id,
      stationCode: 'MTR',
      temperature: +(-31.2 + Math.sin(i * 0.3) * 3).toFixed(1),
      humidity: Math.round(62 + Math.cos(i * 0.2) * 6),
      pressure: Math.round(982 + Math.sin(i * 0.4) * 3),
      windSpeed: +(40.2 + Math.sin(i * 0.3) * 8).toFixed(1),
      windDirection: 'SE',
      visibility: 15,
      snow: 'Moderate Snowfall',
      timestamp,
      sourceType: 'REFERENCE',
    });

    energyReadings.push({
      stationId: maitri._id,
      stationCode: 'MTR',
      generation: +(152 + Math.sin(i * 0.4) * 6).toFixed(1),
      consumption: +(136 + Math.cos(i * 0.3) * 5).toFixed(1),
      batteryLevel: +(85 - (i % 3) * 1.2).toFixed(1),
      fuelLevel: +(72.0 - (24 - i) * 0.1).toFixed(1),
      generatorLoad: +(75 + Math.sin(i * 0.3) * 4).toFixed(1),
      peakLoad: 175,
      efficiency: 89,
      timestamp,
      sourceType: 'SIMULATED',
    });
  }

  await EnvironmentReading.insertMany(envReadings);
  await EnergyReading.insertMany(energyReadings);
  console.log(`[Seed] Seeded historical environment and energy readings.`);

  // 6. Seed Maintenance Records
  await MaintenanceRecord.insertMany([
    {
      stationId: bharati._id,
      stationCode: 'BHT',
      assetId: 'GEN-01',
      title: '500-Hour Scheduled Lube Oil & Filter Service',
      description: 'Replace engine oil with low-temp synthetic polar blend, inspect air intake pre-heater, and test safety shutoffs.',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      assignedTo: 'Er. Rajesh Kumar',
      notes: 'Ensure fuel supply lines are purged and pre-warmed prior to filter swap.',
      isAutomatedRecommendation: false,
    },
    {
      stationId: bharati._id,
      stationCode: 'BHT',
      assetId: 'BAT-01',
      title: 'Quarterly Battery Cell Voltage Balancing Check',
      description: 'Run individual BMS cell diagnostic trace to verify cell impedance equilibrium.',
      priority: 'LOW',
      status: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      assignedTo: 'Elec. Tech. P. Swaminathan',
      notes: 'Maintain battery chamber at minimum +18°C during diagnostic cycling.',
      isAutomatedRecommendation: false,
    },
    {
      stationId: bharati._id,
      stationCode: 'BHT',
      assetId: 'COM-01',
      title: 'Satellite Radome De-icing & Structural Seal Inspection',
      description: 'Inspect exterior radome heating elements and verify seal integrity against katabatic ice accumulation.',
      priority: 'MEDIUM',
      status: 'COMPLETED',
      scheduledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      assignedTo: 'Comms Eng. Sunita Roy',
      notes: 'All heating circuits within specification; silicone weather seals resealed.',
      isAutomatedRecommendation: false,
    },
  ]);
  console.log(`[Seed] Seeded baseline maintenance work orders.`);

  // 7. Seed Initial Baseline Alert (Resolved)
  await Alert.create({
    stationId: bharati._id,
    stationCode: 'BHT',
    assetId: 'WTR-01',
    severity: 'INFO',
    type: 'RO_WATER_CYCLE_COMPLETE',
    title: 'Snow Melting & RO Purification Batch Completed',
    description: 'Fresh drinking water batch of 3,200 Liters produced and stored in insulated holding buffer.',
    reason: 'Routine scheduled automated freshwater production run.',
    recommendedAction: 'No action needed. Tank level nominal at 92%.',
    status: 'RESOLVED',
    deduplicationKey: 'BHT:WTR-01:RO_CYCLE',
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    resolvedBy: 'system-auto',
  });

  // 8. Seed Initial Health Snapshots (Past 7 days)
  const healthSnapshots = [];
  for (let d = 7; d >= 0; d--) {
    healthSnapshots.push({
      stationId: bharati._id,
      stationCode: 'BHT',
      overallHealth: Math.min(95, Math.max(88, Math.round(91 + Math.sin(d) * 2))),
      environmentHealth: Math.round(94 + Math.sin(d * 0.7) * 2),
      energyHealth: Math.round(87 + Math.cos(d * 0.5) * 3),
      infrastructureHealth: 91,
      logisticsHealth: 92,
      timestamp: new Date(now - d * 24 * 60 * 60 * 1000),
    });
  }
  await HealthSnapshot.insertMany(healthSnapshots);
  console.log(`[Seed] Seeded health snapshots.`);

  console.log('\x1b[32m[Seed] POLAR TWIN database seeding completed successfully!\x1b[0m\n');
  await disconnectDB();
}

// If executed directly from CLI
if (process.argv[1]?.endsWith('seedDatabase.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

export default seedDatabase;
