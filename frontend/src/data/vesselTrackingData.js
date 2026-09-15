// Indian Antarctic Scientific Expedition Vessel Tracking Data & Calculations
// Comprehensive navigation dataset for chartered icebreakers & polar research vessels

export const VESSELS = [
  {
    id: 'mv-vasiliy-golovnin',
    name: 'MV Vasiliy Golovnin',
    callSign: 'UBST-4',
    flag: 'Russia (Chartered by NCPOR / MoES, India)',
    type: 'Polar Class Icebreaker & Resupply Vessel',
    iceClass: 'Russian Arc7 / DNV Polar Class 5',
    dwt: '10,658 tonnes',
    length: '163.7 m',
    beam: '22.4 m',
    destinationStation: 'Bharati',
    stationCode: 'BHT',
    expedition: '44th Indian Scientific Expedition to Antarctica (ISEA)',
    voyageStatus: 'Navigating Fast Ice Pack',
    voyageProgressPercent: 82,
    departurePort: 'Mormugao Port, Goa, India',
    departureDate: '2026-09-02',
    scheduledArrivalDate: '2026-09-22T08:30:00Z',
    
    // Telemetry current snapshot
    currentPosition: {
      latitude: '68°44′18″ S',
      longitude: '75°32′45″ E',
      latNumeric: -68.738,
      lonNumeric: 75.545,
      zoneName: 'Prydz Bay / Quilty Bay Fast Ice Approach',
      speedKnots: 8.6,
      headingDegrees: 174,
      engineLoadPercent: 78,
      fuelAutonomyDays: 46,
      distanceTraveledNm: 4120,
      distanceRemainingNm: 480,
      totalVoyageDistanceNm: 4600,
    },

    weather: {
      airTemp: '-18.4°C',
      seaSurfaceTemp: '-1.8°C',
      windSpeedKnots: 32,
      windDirection: 'SE (Katabatic blast)',
      seaState: 'Fast Ice Pack (6/10ths concentration)',
      iceThicknessM: 1.4,
      visibilityNm: 4.5,
    },

    captain: 'Capt. I. V. Morozov (Ice Master)',
    voyageLeader: 'Dr. Rajesh Sharma (NCPOR Expedition Leader)',
    crewAndScientists: 68, // 36 crew + 32 winter/summer scientists

    cargoManifest: [
      { item: 'Aviation Turbine Fuel / Polar Diesel (ATF)', quantity: '180,000 Liters', category: 'Fuel', priority: 'CRITICAL', stationRelief: 'Refuels Automated Fuel Farm; restores fuel runway from 41 to 180+ days' },
      { item: 'CHP-3 Turbocharger & Overhaul Repair Kit', quantity: '1 Complete Unit (640 kg)', category: 'Spares', priority: 'HIGH', stationRelief: 'Fixes CHP-3 high temperature alert & restores 360 kVA power redundancy' },
      { item: 'Reverse Osmosis Desalination Filter Cartridges', quantity: '120 Cartridges & Membranes', category: 'Water', priority: 'CRITICAL', stationRelief: 'Eliminates 29-day water treatment consumable deficit warning' },
      { item: 'Fresh Provisions & Cold Rations', quantity: '6,200 kg frozen vegetables, fruit, grains', category: 'Provisions', priority: 'NORMAL', stationRelief: 'Restores galley provisions inventory for wintering crew' },
      { item: 'Piston Bully 300 Polar Snowcat Spare Track Links', quantity: '4 Sets', category: 'Transport', priority: 'NORMAL', stationRelief: 'Maintains overland traverse transport readiness' },
      { item: 'Deep Ice-Core Drilling Scientific Sonde Rig', quantity: '2 Modules (MoES/NCPOR)', category: 'Science', priority: 'NORMAL', stationRelief: 'Equips Bharti Atmospheric & Glaciological Labs' },
    ],

    waypoints: [
      { id: 'wp-1', name: 'Mormugao Port (Goa)', lat: 15.41, lon: 73.80, status: 'PASSED', date: '02 Sep 2026', notes: 'Expedition departed; 4,200 metric tonnes loaded' },
      { id: 'wp-2', name: 'Port Louis (Mauritius)', lat: -20.16, lon: 57.50, status: 'PASSED', date: '08 Sep 2026', notes: 'Bunkering & final Indian Ocean meteorological check' },
      { id: 'wp-3', name: 'Roaring Forties (40°S Gate)', lat: -40.00, lon: 62.00, status: 'PASSED', date: '12 Sep 2026', notes: 'Encountered 6.2m westerly swell; vessel ballasted for rough polar sea' },
      { id: 'wp-4', name: 'Furious Fifties (50°S Transect)', lat: -50.00, lon: 68.50, status: 'PASSED', date: '14 Sep 2026', notes: 'Air temp dropped to -4°C; CTD scientific cast logged' },
      { id: 'wp-5', name: 'Screaming Sixties / Polar Ice Edge', lat: -62.50, lon: 72.00, status: 'PASSED', date: '15 Sep 2026', notes: 'First sea-ice floes sighted; ice searchlights activated' },
      { id: 'wp-6', name: 'Fast Ice Pack (Current Position)', lat: -68.74, lon: 75.55, status: 'CURRENT', date: '15 Sep 2026', notes: 'Navigating 1.4m consolidated fast ice at 8.6 kts' },
      { id: 'wp-7', name: 'Quilty Bay Outer Anchorage', lat: -69.32, lon: 76.08, status: 'UPCOMING', eta: '21 Sep 2026, 18:00 UTC', notes: 'Helicopter sling operation zone established' },
      { id: 'wp-8', name: 'Bharati Station Fast Ice Berthing', lat: -69.41, lon: 76.19, status: 'UPCOMING', eta: '22 Sep 2026, 08:30 UTC', notes: 'Direct offload via heavy polar sledges to fuel farm' },
    ],
  },

  {
    id: 'sa-agulhas-ii',
    name: 'S.A. Agulhas II',
    callSign: 'ZS6A',
    flag: 'South Africa (Joint Polar Logistics Support)',
    type: 'Polar Supply & Research Icebreaker',
    iceClass: 'DNV Polar Class 5',
    dwt: '4,980 tonnes',
    length: '134.2 m',
    beam: '21.7 m',
    destinationStation: 'Maitri',
    stationCode: 'MTR',
    expedition: 'Maitri Inter-Continental Logistics Resupply',
    voyageStatus: 'Transiting Furious Fifties',
    voyageProgressPercent: 62,
    departurePort: 'Cape Town Port, South Africa',
    departureDate: '2026-09-08',
    scheduledArrivalDate: '2026-09-28T14:00:00Z',

    currentPosition: {
      latitude: '54°18′20″ S',
      longitude: '16°45′10″ E',
      latNumeric: -54.305,
      lonNumeric: 16.752,
      zoneName: 'Southern Ocean / Antarctic Convergence Belt',
      speedKnots: 13.8,
      headingDegrees: 188,
      engineLoadPercent: 72,
      fuelAutonomyDays: 52,
      distanceTraveledNm: 2480,
      distanceRemainingNm: 1420,
      totalVoyageDistanceNm: 3900,
    },

    weather: {
      airTemp: '-6.2°C',
      seaSurfaceTemp: '+0.4°C',
      windSpeedKnots: 28,
      windDirection: 'NW',
      seaState: 'Rough open ocean (Swell 4.2m)',
      iceThicknessM: 0.0,
      visibilityNm: 8.0,
    },

    captain: 'Capt. Knowledge Bengu',
    voyageLeader: 'Er. Sandeep Patil (Maitri Logistics Coordinator)',
    crewAndScientists: 54,

    cargoManifest: [
      { item: 'Polar Diesel (50-cetane Low Pour Point)', quantity: '150,000 Liters', category: 'Fuel', priority: 'CRITICAL', stationRelief: 'Restores Maitri fuel farm reserve from 67% to full capacity' },
      { item: 'Lake Priyadarshini 2.4km Trace Heating Cables', quantity: '3,000 Meters Heavy Duty', category: 'Infrastructure', priority: 'HIGH', stationRelief: 'Prevents winter freeze-up of freshwater intake pipeline' },
      { item: 'DG-3 Genset Major Overhaul Spares Kit', quantity: '8 Crates (Cummins Polar Spec)', category: 'Power', priority: 'HIGH', stationRelief: 'Ensures 100% triple redundancy for Maitri power station' },
      { item: 'Dry Rations & Medical Oxygen Cylinders', quantity: '4,100 kg Rations + 24 Cylinders', category: 'Provisions', priority: 'NORMAL', stationRelief: 'Winter survival buffer enhancement' },
    ],

    waypoints: [
      { id: 'wp-1', name: 'Cape Town Port', lat: -33.92, lon: 18.42, status: 'PASSED', date: '08 Sep 2026', notes: 'Loaded heavy machinery and fuel drums' },
      { id: 'wp-2', name: 'Roaring Forties (40°S)', lat: -40.00, lon: 17.50, status: 'PASSED', date: '11 Sep 2026', notes: 'Gale force conditions handled nominally' },
      { id: 'wp-3', name: 'Convergence Zone (Current Position)', lat: -54.31, lon: 16.75, status: 'CURRENT', date: '15 Sep 2026', notes: 'Steaming south at 13.8 knots; sea temp falling' },
      { id: 'wp-4', name: 'Screaming Sixties (60°S)', lat: -60.00, lon: 15.00, status: 'UPCOMING', eta: '18 Sep 2026', notes: 'Anticipate first multi-year ice floes' },
      { id: 'wp-5', name: 'Lazarev Sea Pack Ice Entry', lat: -68.00, lon: 13.00, status: 'UPCOMING', eta: '24 Sep 2026', notes: 'Engage icebreaking propulsion' },
      { id: 'wp-6', name: 'Astrid Coast / Maitri Ice Shelf Depot', lat: -70.76, lon: 11.73, status: 'UPCOMING', eta: '28 Sep 2026, 14:00 UTC', notes: 'Piston Bully sledge convoy transfer over continental shelf' },
    ],
  },

  {
    id: 'orv-sagar-nidhi',
    name: 'ORV Sagar Nidhi',
    callSign: 'VWYP',
    flag: 'India (Ministry of Earth Sciences / NIOT)',
    type: 'Ice-Strengthened Polar Oceanographic Research Vessel',
    iceClass: 'DNV GL Ice-1C',
    dwt: '2,200 tonnes',
    length: '104.0 m',
    beam: '18.0 m',
    destinationStation: 'Southern Ocean Observation Line',
    stationCode: 'SOO',
    expedition: '18th Indian Southern Ocean Expedition (ISOE)',
    voyageStatus: 'Conducting Oceanographic Profiling',
    voyageProgressPercent: 50,
    departurePort: 'Cochin Port, India',
    departureDate: '2026-08-25',
    scheduledArrivalDate: '2026-10-05T12:00:00Z',

    currentPosition: {
      latitude: '48°22′30″ S',
      longitude: '64°15′00″ E',
      latNumeric: -48.375,
      lonNumeric: 64.250,
      zoneName: 'Kerguelen Plateau / Southern Indian Ocean',
      speedKnots: 4.2,
      headingDegrees: 112,
      engineLoadPercent: 55,
      fuelAutonomyDays: 38,
      distanceTraveledNm: 3650,
      distanceRemainingNm: 1850,
      totalVoyageDistanceNm: 5500,
    },

    weather: {
      airTemp: '+1.5°C',
      seaSurfaceTemp: '+3.2°C',
      windSpeedKnots: 24,
      windDirection: 'WNW',
      seaState: 'Moderate open sea (Swell 3.1m)',
      iceThicknessM: 0.0,
      visibilityNm: 10.0,
    },

    captain: 'Capt. R. K. Nair',
    voyageLeader: 'Dr. Anoop Kumar (Chief Scientist)',
    crewAndScientists: 42,

    cargoManifest: [
      { item: 'Bio-Argo Ocean Profiling Floats', quantity: '14 Units', category: 'Science', priority: 'HIGH', stationRelief: 'Deployed along 40°S to 60°S carbon sequestration transect' },
      { item: 'Deep Ocean Mooring Sensors & Hydrophones', quantity: '6 Heavy Moorings', category: 'Science', priority: 'HIGH', stationRelief: 'NCPOR long-term climate change monitoring array' },
      { item: 'Cryo-Preserved Sea Ice Biota Samples', quantity: '80 Liters', category: 'Science', priority: 'NORMAL', stationRelief: 'Collected for National Polar Data Repository' },
    ],

    waypoints: [
      { id: 'wp-1', name: 'Cochin Port', lat: 9.93, lon: 76.26, status: 'PASSED', date: '25 Aug 2026', notes: 'Expedition departed with oceanographic sensors' },
      { id: 'wp-2', name: 'Equator Crossing', lat: 0.00, lon: 70.00, status: 'PASSED', date: '30 Aug 2026', notes: 'Calibrated acoustic Doppler current profiler' },
      { id: 'wp-3', name: 'Sub-Tropical Front (35°S)', lat: -35.00, lon: 66.00, status: 'PASSED', date: '06 Sep 2026', notes: 'CTD deep casts deployed to 3,000m depth' },
      { id: 'wp-4', name: 'Kerguelen Transect (Current Station)', lat: -48.38, lon: 64.25, status: 'CURRENT', date: '15 Sep 2026', notes: 'Deploying deep biogeochemical sampling rosette' },
      { id: 'wp-5', name: 'Polar Front (58°S)', lat: -58.00, lon: 60.00, status: 'UPCOMING', eta: '24 Sep 2026', notes: 'Ice edge ocean-atmosphere flux observation' },
      { id: 'wp-6', name: 'Mauritius Return Bunkering', lat: -20.16, lon: 57.50, status: 'UPCOMING', eta: '05 Oct 2026', notes: 'Voyage completion and sample transfer to India' },
    ],
  },
];

/**
 * Calculates live time-remaining countdown formatted as Days, Hours, Mins, Secs
 */
export function calculateRemainingEta(scheduledArrivalIso) {
  const targetTime = new Date(scheduledArrivalIso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, targetTime - now);

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    formattedCountdown: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    formattedShort: `${days}d ${hours}h remaining`,
    isArrived: diffMs === 0,
  };
}

export default VESSELS;
