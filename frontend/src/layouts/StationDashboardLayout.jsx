import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MissionControlHeader from '../components/common/MissionControlHeader.jsx';
import StationDashboard from '../pages/StationDashboard.jsx';
import telemetryEngine from '../simulation/telemetryEngine.js';
import { STATIONS } from '../data/stationConfig.js';

export function StationDashboardLayout() {
  const { stationId = 'bharati' } = useParams();
  const navigate = useNavigate();

  const currentStationCode =
    stationId.toLowerCase() === 'maitri' ? 'MTR' : 'BHT';

  const currentStation =
    STATIONS[currentStationCode] || STATIONS.BHT;

  // Real-time telemetry state
  const [telemetryState, setTelemetryState] = useState(() =>
    telemetryEngine.getState()
  );

  // Antarctic station local time
  const [antarcticTime, setAntarcticTime] = useState('');

  useEffect(() => {
    const unsubscribe = telemetryEngine.subscribe((state) => {
      setTelemetryState(state);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Bharati = UTC+5, Maitri = UTC+0
      const offsetHours = currentStationCode === 'BHT' ? 5 : 0;

      const utc =
        now.getTime() + now.getTimezoneOffset() * 60000;

      const stationDate = new Date(
        utc + 3600000 * offsetHours
      );

      const timeStr = stationDate
        .toTimeString()
        .split(' ')[0];

      const dateStr = stationDate.toLocaleDateString(
        'en-GB',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );

      setAntarcticTime(
        `${timeStr} (UTC${
          offsetHours >= 0 ? `+${offsetHours}` : offsetHours
        }) · ${dateStr}`
      );
    };

    updateTime();

    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, [currentStationCode]);

  const currentTel =
    telemetryState[currentStationCode] ||
    telemetryState.BHT ||
    {};

  const handleStationSwitch = (code) => {
    navigate(`/station/${code.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      {/* Shared Mission Control Header */}
      <MissionControlHeader
        currentStationCode={currentStationCode}
        currentStation={currentStation}
        currentTel={currentTel}
        antarcticTime={antarcticTime}
        onStationSwitch={handleStationSwitch}
      />

      {/* Station Dashboard */}
      <main className="flex-1">
        <StationDashboard />
      </main>
    </div>
  );
}

export default StationDashboardLayout;