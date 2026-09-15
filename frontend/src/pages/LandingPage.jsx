import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Compass, Radio, Thermometer, Droplets, Wind } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

/**
 * FIRST SCREEN — STATION SELECTION
 * Full-screen Antarctic background (medium frosted-glass overlay), real
 * station imagery for BHARATI and MAITRI, and live temp / humidity / wind
 * readouts that tick every 5s.
 */

// ---------------------------------------------------------------------------
// Background image (as supplied) — ESA Antarctic landscape.
// ---------------------------------------------------------------------------
const BACKGROUND_IMAGE_URL =
  'https://www.esa.int/var/esa/storage/images/esa_multimedia/images/2020/12/antarctic_landscape/22367251-1-eng-GB/Antarctic_landscape.jpg';

// ---------------------------------------------------------------------------
// Official NCPOR station photographs.
// Source: National Centre for Polar and Ocean Research (ncpor.res.in)
// ---------------------------------------------------------------------------
const STATION_IMAGES = {
  BHT: 'https://ncpor.res.in/files/images/Bharati%20(2).jpg',
  MTR: 'https://ncpor.res.in/files/images/Maitri.jpg',
};

// ---------------------------------------------------------------------------
// Live weather simulation.
// Prefers real values from telemetryEngine if that station's telemetry
// object already exposes temperature/humidity/windSpeed fields; otherwise
// falls back to a locally-generated live reading so the UI always has
// real-time-feeling data. Ticks every 5 seconds.
// ---------------------------------------------------------------------------
const WEATHER_BASELINES = {
  BHT: { temp: -9, tempSwing: 6, humidity: 58, humiditySwing: 12, wind: 28, windSwing: 18 },
  MTR: { temp: -16, tempSwing: 8, humidity: 45, humiditySwing: 10, wind: 34, windSwing: 22 },
};

function readTelemetryWeather(tel) {
  if (!tel) return null;
  const temp = tel.temperature ?? tel.temp ?? tel.airTemperature;
  const humidity = tel.humidity ?? tel.relativeHumidity;
  const wind = tel.windSpeed ?? tel.wind ?? tel.windKph;
  if (
    typeof temp === 'number' &&
    typeof humidity === 'number' &&
    typeof wind === 'number'
  ) {
    return { temp, humidity, wind };
  }
  return null;
}

function simulateReading(baseline, tick) {
  const t = tick * 0.37;
  const temp = baseline.temp + Math.sin(t) * (baseline.tempSwing / 2) + (Math.random() - 0.5) * 1.2;
  const humidity = Math.min(
    98,
    Math.max(15, baseline.humidity + Math.cos(t * 0.8) * (baseline.humiditySwing / 2) + (Math.random() - 0.5) * 4)
  );
  const wind = Math.max(
    0,
    baseline.wind + Math.sin(t * 1.3) * (baseline.windSwing / 2) + (Math.random() - 0.5) * 5
  );
  return { temp, humidity, wind };
}

function useLiveWeather(stationKey, telemetry) {
  const [tick, setTick] = useState(0);
  const tickRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      setTick(tickRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    const real = readTelemetryWeather(telemetry);
    if (real) return real;
    return simulateReading(WEATHER_BASELINES[stationKey], tick);
  }, [stationKey, telemetry, tick]);
}

function WeatherStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5 text-sky-100/90" />
      <span className="text-[11px] text-white/70">{label}</span>
      <span className="text-xs font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}

function StationCard({ stationKey, code, name, region, tagline, location, waterSupply, powerSystem, telemetry, onEnter }) {
  const weather = useLiveWeather(stationKey, telemetry);

  return (
    <div
      onClick={onEnter}
      className="group relative rounded-2xl border border-white/30 bg-white/15 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:bg-white/20 hover:border-white/50 transition-all duration-200 cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 pt-6 md:px-8 md:pt-8 flex items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-sky-100 tracking-wider uppercase drop-shadow">
            {region}
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1 drop-shadow-sm">
            {code}
          </h2>
        </div>
        <StatusBadge status={telemetry?.stationStatus || 'Operational'} size="md" />
      </div>

      <p className="text-sm text-white/80 px-6 md:px-8 mt-1">{tagline}</p>

      {/* Real station photo, centered */}
      <div className="mt-5 mx-6 md:mx-8 rounded-xl overflow-hidden border border-white/25 shadow-lg aspect-[16/10] bg-black/20">
        <img
          src={STATION_IMAGES[stationKey]}
          alt={`${name} — Indian Antarctic Research Station`}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Facts */}
      {/* <div className="space-y-2 text-xs text-white/70 px-6 md:px-8 py-5 mt-1 border-t border-white/15">
        <div className="flex justify-between">
          <span>Location</span>
          <span className="font-medium text-white/90">{location}</span>
        </div>
        <div className="flex justify-between">
          <span>Water Supply</span>
          <span className="font-medium text-white/90">{waterSupply}</span>
        </div>
        <div className="flex justify-between">
          <span>Power System</span>
          <span className="font-medium text-white/90">{powerSystem}</span>
        </div>
      </div> */}

      {/* Live weather strip */}
      <div className="px-6 mt-5 md:px-8 py-3 bg-black/25 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
        <WeatherStat icon={Thermometer} label="Temp" value={`${weather.temp.toFixed(1)}°C`} />
        <WeatherStat icon={Droplets} label="Humidity" value={`${weather.humidity.toFixed(0)}%`} />
        <WeatherStat icon={Wind} label="Wind" value={`${weather.wind.toFixed(0)} km/h`} />
      </div>

      {/* CTA */}
      <div className="px-6 md:px-8 py-4 border-t border-white/15 flex items-center justify-between bg-white/5">
        <span className="text-xs font-semibold text-white/90 group-hover:text-sky-100 transition-colors">
          Enter {name} Mission Control
        </span>
        <div className="w-8 h-8 rounded-full bg-white/15 group-hover:bg-white/25 flex items-center justify-center text-white/80 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const [telemetry, setTelemetry] = useState(() => telemetryEngine.getState());

  useEffect(() => {
    const unsub = telemetryEngine.subscribe((state) => {
      setTelemetry(state);
    });
    return () => unsub();
  }, []);

  const bhtTel = telemetry.BHT || {};
  const mtrTel = telemetry.MTR || {};

  return (
    <div className="relative min-h-screen text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* ---------------- Full-screen background ---------------- */}
      <div className="fixed inset-0 -z-10">
        <img
          src={BACKGROUND_IMAGE_URL}
          alt="Antarctic landscape"
          className="w-full h-full object-cover"
        />
        {/* medium frosted-glass wash so foreground content stays legible */}
        <div className="absolute inset-0 backdrop-blur-xs bg-slate-950/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/20 to-slate-950/60" />
      </div>

      <div className="min-h-screen flex flex-col justify-between">
        {/* Institutional Top Strip */}
        {/* <div className="w-full backdrop-blur-md bg-white/10 border-b border-white/20 px-6 py-3 flex items-center justify-between text-xs text-white/80">
          <div className="flex items-center gap-2 font-medium">
            <span className="font-semibold text-white">National Centre for Polar and Ocean Research (NCPOR)</span>
            <span className="text-white/30">•</span>
            <span>Ministry of Earth Sciences, Govt. of India</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-white/60">
            <span>Antarctic Treaty System Protocol Compliant</span>
          </div>
        </div> */}

        {/* Main Centered Content */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center">
          {/* Top Header */}
          <div className="max-w-2xl mx-auto space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-md text-sky-100 border border-white/25">
              <Compass className="w-3.5 h-3.5" />
              Polar Operations Directorate
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              Indian Antarctic Mission Control
            </h1>

            <p className="text-base sm:text-lg text-white/85 font-normal drop-shadow-sm">
              Digital Twin & Remote Operations Platform
            </p>
          </div>

          {/* Center of page: Two Large Station Choices */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto text-left">
            <StationCard
              stationKey="BHT"
              code="BHARATI"
              name="Bharati"
              region="East Antarctica · 69°S"
              tagline="Indian Antarctic Research Station"
              location="Larsemann Hills"
              waterSupply="Sea Water Pump (Desalination)"
              powerSystem="3x Combined Heat & Power (CHP)"
              telemetry={bhtTel}
              onEnter={() => navigate('/station/bharati')}
            />

            <StationCard
              stationKey="MTR"
              code="MAITRI"
              name="Maitri"
              region="Queen Maud Land · 70°S"
              tagline="Indian Antarctic Research Station"
              location="Schirmacher Oasis"
              waterSupply="Lake Priyadarshini (Lake Pump)"
              powerSystem="Polar Diesel Genset Station"
              telemetry={mtrTel}
              onEnter={() => navigate('/station/maitri')}
            />
          </div>

          {/* Operational software disclaimer */}
          <div className="mt-12 text-xs text-white/60 max-w-xl">
            Authorized personnel only. Live telemetry streams synchronized via polar satellite tracking relays.
          </div>
        </main>

        {/* Institutional Footer */}
        <footer className="w-full backdrop-blur-md bg-white/10 border-t border-white/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/70">
          <div>
            © {new Date().getFullYear()} National Centre for Polar and Ocean Research, Goa, India.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/50">System Version 2.4-PROD</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1 text-white/85">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Telemetry Link Active
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;