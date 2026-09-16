import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { Download, Activity, Thermometer, Wind, Gauge, Droplets } from 'lucide-react';
import environmentService from '../services/environmentService.js';

export function EnvironmentHistoricalPage() {
  const { stationId = 'maitri' } = useParams();
  const currentStationCode = stationId.toLowerCase() === 'bharati' ? 'BHT' : 'MTR';
  const stationName = currentStationCode === 'BHT' ? 'Bharati' : 'Maitri';

  const [selectedRange, setSelectedRange] = useState('24h');
  
  // Naya State: Switch between 'all' or individual metrics
  const [activeView, setActiveView] = useState('all'); 
  
  const [chartData, setChartData] = useState({ data: [], stats: null });
  const [currentWeather, setCurrentWeather] = useState(null);

  useEffect(() => {
    const series = environmentService.getCombinedHistoricalSeries(currentStationCode, selectedRange);
    setChartData(series);
    environmentService.getStationWeather(currentStationCode).then(res => setCurrentWeather(res));
  }, [currentStationCode, selectedRange]);

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  // Views Configuration
  const views = [
    { id: 'all', label: 'All Live Data', icon: Activity },
    { id: 'temperature', label: 'Air Temperature', icon: Thermometer, color: '#ef4444' },
    { id: 'windSpeed', label: 'Wind Speed', icon: Wind, color: '#3b82f6' },
    { id: 'pressure', label: 'Air Pressure', icon: Gauge, color: '#0f172a' },
    { id: 'humidity', label: 'Relative Humidity', icon: Droplets, color: '#22c55e' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4">
      
      {/* NPDC Style Dark Blue Header */}
      <div className="bg-[#0b1c3c] text-white rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center px-4 sm:px-6 py-4 shadow-md border-b-4 border-sky-500 gap-3 md:gap-0">
        <div className="text-base sm:text-lg font-semibold tracking-wide">
          {currentDate}
        </div>
        
        {currentWeather && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row gap-x-6 lg:gap-x-12 gap-y-1.5 text-xs sm:text-sm w-full md:w-auto">
            <div className="flex flex-col items-start sm:items-end">
              <span><span className="text-sky-300">Temperature:</span> {currentWeather.temperature}° C</span>
              <span><span className="text-emerald-400">Air Pressure:</span> {currentWeather.pressure} mBar</span>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <span><span className="text-sky-300">Relative Humidity:</span> {currentWeather.humidity}%</span>
              <span><span className="text-emerald-400">Wind Speed:</span> {currentWeather.windSpeed} m/s</span>
            </div>
          </div>
        )}
      </div>

      {/* View Selector Tabs */}
      <div className="overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white p-1.5 sm:p-2 rounded-lg border border-slate-200 shadow-sm min-w-max">
          {views.map(view => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-2 sm:p-4 overflow-hidden">
        <h2 className="text-center font-bold text-[#6b21a8] text-base sm:text-lg mb-4 sm:mb-6">
          Antarctica - {stationName} {activeView !== 'all' && `(${views.find(v => v.id === activeView)?.label})`}
        </h2>

        <div className="h-[340px] sm:h-[450px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.data} margin={{ top: 15, right: activeView === 'all' ? 25 : 15, left: -5, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} />
              <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #cbd5e1' }} itemStyle={{ fontWeight: 'bold' }} />
              <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '20px' }}/>
              
              {/* Conditionally Render Axes and Lines based on activeView */}
              
              {/* Temperature */}
              {(activeView === 'all' || activeView === 'temperature') && (
                <React.Fragment>
                  <YAxis yAxisId="temp" orientation="left" stroke="#ef4444" tick={{ fontSize: 11 }} domain={['auto', 'auto']} label={{ value: 'Temperature °C', angle: -90, position: 'insideLeft', fill: '#ef4444', style: { fontWeight: 'bold' }, dx: -10 }} />
                  <Line yAxisId="temp" type="linear" dataKey="temperature" name="Temperature" stroke="#ef4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </React.Fragment>
              )}

              {/* Wind Speed */}
              {(activeView === 'all' || activeView === 'windSpeed') && (
                <React.Fragment>
                  <YAxis yAxisId="wind" orientation="left" stroke="#3b82f6" tick={{ fontSize: 11 }} domain={['auto', 'auto']} label={{ value: 'Wind Speed (m/s)', angle: -90, position: 'insideLeft', fill: '#3b82f6', style: { fontWeight: 'bold' } }} />
                  <Line yAxisId="wind" type="linear" dataKey="windSpeed" name="Wind Speed" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </React.Fragment>
              )}

              {/* Air Pressure */}
              {(activeView === 'all' || activeView === 'pressure') && (
                <React.Fragment>
                  {/* Agar individual view hai toh axis left me dikhegi, All hai toh right me */}
                  <YAxis yAxisId="pressure" orientation={activeView === 'all' ? "right" : "left"} stroke="#0f172a" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} label={{ value: 'Air Pressure (mBar)', angle: activeView === 'all' ? 90 : -90, position: activeView === 'all' ? 'insideRight' : 'insideLeft', fill: '#0f172a', style: { fontWeight: 'bold' } }} />
                  <Line yAxisId="pressure" type="linear" dataKey="pressure" name="Air Pressure" stroke="#0f172a" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </React.Fragment>
              )}

              {/* Humidity */}
              {(activeView === 'all' || activeView === 'humidity') && (
                <React.Fragment>
                  <YAxis yAxisId="humidity" orientation={activeView === 'all' ? "right" : "left"} stroke="#22c55e" tick={{ fontSize: 11 }} domain={[0, 100]} label={{ value: 'Relative Humidity (%)', angle: activeView === 'all' ? 90 : -90, position: activeView === 'all' ? 'insideRight' : 'insideLeft', fill: '#22c55e', style: { fontWeight: 'bold' }, dx: activeView === 'all' ? 10 : -10 }} />
                  <Line yAxisId="humidity" type="linear" dataKey="humidity" name="Relative Humidity" stroke="#22c55e" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </React.Fragment>
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* NPDC Style Stats Table */}
      {chartData.stats && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="p-3 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Download className="w-4 h-4" /> Save as Image
            </button>
            <div className="flex gap-2 text-xs justify-end">
              {['24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1.5 font-semibold border rounded transition-colors cursor-pointer ${selectedRange === range ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-center min-w-[540px]">
              <thead className="text-slate-700 bg-slate-50 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-1/5">Data</th>
                  <th className="py-3 px-4 w-1/5">Average</th>
                  <th className="py-3 px-4 w-1/5">Data</th>
                  <th className="py-3 px-4 w-1/5">Minimum</th>
                  <th className="py-3 px-4 w-1/5">Data</th>
                  <th className="py-3 px-4 w-1/5">Maximum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                
                {/* Dynamically hide/show table rows based on activeView */}
                {(activeView === 'all' || activeView === 'temperature') && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4">Temperature</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.temperature.avg} °C</td>
                    <td className="py-3 px-4">Temperature</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.temperature.min} °C</td>
                    <td className="py-3 px-4">Temperature</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.temperature.max} °C</td>
                  </tr>
                )}

                {(activeView === 'all' || activeView === 'windSpeed') && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4">Wind Speed</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.windSpeed.avg} m/s</td>
                    <td className="py-3 px-4">Wind Speed</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.windSpeed.min} m/s</td>
                    <td className="py-3 px-4">Wind Speed</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.windSpeed.max} m/s</td>
                  </tr>
                )}

                {(activeView === 'all' || activeView === 'pressure') && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4">Air Pressure</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.pressure.avg} hPa</td>
                    <td className="py-3 px-4">Air Pressure</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.pressure.min} hPa</td>
                    <td className="py-3 px-4">Air Pressure</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.pressure.max} hPa</td>
                  </tr>
                )}

                {(activeView === 'all' || activeView === 'humidity') && (
                  <tr className="hover:bg-slate-50">
                    <td className="py-3 px-4">Rel. Humidity</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.humidity.avg} %</td>
                    <td className="py-3 px-4">Rel. Humidity</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.humidity.min} %</td>
                    <td className="py-3 px-4">Rel. Humidity</td>
                    <td className="py-3 px-4 font-semibold">{chartData.stats.humidity.max} %</td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 text-[10px] text-center py-2 text-slate-500 border-t border-slate-200">
            Copyright © National Polar Data Center, NCPOR, MoES, Govt of India. All Rights Reserved.
          </div>
        </div>
      )}
    </div>
  );
}

export default EnvironmentHistoricalPage;