import { Activity, AlertCircle, CheckCircle, Droplets, Sprout, Sun, Thermometer, Wifi, WifiOff, Wind, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PolyhouseDashboard = () => {
  const [sensorData, setSensorData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const connectWebSocket = React.useCallback(() => {
    if (!mountedRef.current) return;

    try {
      console.log('🔌 Connecting to WebSocket...');
      const ws = new WebSocket('ws://localhost:8000/ws/realtime');

      ws.onopen = () => {
        console.log('✅ WebSocket Connected Successfully');
        setConnectionStatus('connected');
      };

      ws.onmessage = (event) => {
        console.log('📨 Message received:', event.data);
        try {
          const message = JSON.parse(event.data);
          console.log('📊 Parsed message:', message);

          if (message.type === 'sensor_update') {
            console.log('✅ Setting sensor data:', message.data);
            setSensorData(message.data);
            setAlerts(message.alerts || []);

            setHistoricalData(prev => {
              const newData = {
                time: new Date(message.timestamp).toLocaleTimeString(),
                temp: message.data.temperature_internal,
                humidity: message.data.humidity,
                light: message.data.light_par,
                co2: message.data.co2_level,
                moisture: message.data.soil_moisture
              };
              const updated = [...prev, newData].slice(-20);
              return updated;
            });
          }
        } catch (error) {
          console.error('❌ Error parsing message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('error');
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setConnectionStatus('disconnected');
        wsRef.current = null;

        if (mountedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('🔄 Attempting to reconnect...');
            connectWebSocket();
          }, 3000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('❌ Error creating WebSocket:', error);
      setConnectionStatus('error');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connectWebSocket();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  const triggerProblem = async (problemType) => {
    try {
      console.log('🚨 Triggering problem:', problemType);
      const response = await fetch(`http://localhost:8000/api/simulate/problem?problem_type=${problemType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log('✅ Problem triggered:', data);
    } catch (error) {
      console.error('❌ Error triggering problem:', error);
    }
  };

  const resolveProblem = async () => {
    try {
      console.log('✅ Resolving problems...');
      const response = await fetch('http://localhost:8000/api/simulate/resolve', {
        method: 'POST'
      });
      const data = await response.json();
      console.log('✅ Problems resolved:', data);
    } catch (error) {
      console.error('❌ Error resolving problem:', error);
    }
  };

  const getAlertColor = (level) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'advisory': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (value, min, max) => {
    if (value < min || value > max) return 'text-red-500';
    return 'text-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
                <Sprout className="text-green-600" size={40} />
                Polyhouse Monitoring System
              </h1>
              <p className="text-gray-600 mt-2">Real-time environmental monitoring and alerts</p>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
              }`}>
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi size={20} />
                  <span className="font-medium">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff size={20} />
                  <span className="font-medium">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="text-red-500 flex-shrink-0" size={32} />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Active Alerts ({alerts.length})
                </h3>
                <div className="space-y-4">
                  {alerts.map((alert, idx) => (
                    <div key={idx} className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-gray-800">{alert.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-white text-sm ${getAlertColor(alert.level)}`}>
                          {alert.level.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{alert.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="font-medium">Current: </span>
                          <span className="text-red-600">{alert.current_value}</span>
                        </div>
                        <div>
                          <span className="font-medium">Optimal: </span>
                          <span className="text-green-600">{alert.optimal_range}</span>
                        </div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3">
                        <p className="text-sm font-medium text-gray-700">
                          <strong>Impact:</strong> {alert.impact}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-800">Recommended Actions:</p>
                        {alert.solutions.map((solution, sIdx) => (
                          <div key={sIdx} className="bg-white p-3 rounded border border-gray-200 text-sm">
                            <div className="flex items-start gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-xs">
                                {solution.priority}
                              </span>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800">{solution.action}</p>
                                <p className="text-gray-600 text-xs mt-1">
                                  {solution.time_to_effect} •
                                  {solution.automated ? ' Automated' : ' Manual'} •
                                  {solution.cost_estimate > 0 ? ` ₹${solution.cost_estimate}` : ' Free'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {sensorData ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Temperature</h3>
                  <Thermometer className="text-red-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.temperature_internal, 20, 28)}`}>
                    {sensorData.temperature_internal}°C
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>External: {sensorData.temperature_external}°C</div>
                    <div>Soil: {sensorData.temperature_soil}°C</div>
                    <div className="text-xs mt-2 text-gray-500">Optimal: 20-28°C</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Humidity</h3>
                  <Droplets className="text-blue-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.humidity, 55, 75)}`}>
                    {sensorData.humidity}%
                  </div>
                  <div className="text-xs mt-2 text-gray-500">Optimal: 55-75%</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Light (PAR)</h3>
                  <Sun className="text-yellow-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.light_par, 400, 1000)}`}>
                    {sensorData.light_par}
                  </div>
                  <div className="text-sm text-gray-600">μmol/m²/s</div>
                  <div className="text-xs mt-2 text-gray-500">Optimal: 400-1000</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">CO₂ Level</h3>
                  <Wind className="text-green-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.co2_level, 600, 1200)}`}>
                    {sensorData.co2_level}
                  </div>
                  <div className="text-sm text-gray-600">ppm</div>
                  <div className="text-xs mt-2 text-gray-500">Optimal: 600-1200 ppm</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Soil Moisture</h3>
                  <Activity className="text-cyan-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.soil_moisture, 60, 80)}`}>
                    {sensorData.soil_moisture}%
                  </div>
                  <div className="text-xs mt-2 text-gray-500">Optimal: 60-80%</div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Soil pH & EC</h3>
                  <Zap className="text-purple-500" size={24} />
                </div>
                <div className="space-y-2">
                  <div className={`text-3xl font-bold ${getStatusColor(sensorData.soil_ph, 5.8, 6.5)}`}>
                    {sensorData.soil_ph}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>EC: {sensorData.soil_ec} dS/m</div>
                    <div className="text-xs mt-2 text-gray-500">Optimal pH: 5.8-6.5</div>
                  </div>
                </div>
              </div>
            </div>

            {historicalData.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Temperature & Humidity Trends</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temp" stroke="#ef4444" name="Temp (°C)" strokeWidth={2} />
                      <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidity (%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Light & CO₂ Trends</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="light" stroke="#eab308" fill="#fef08a" name="Light (PAR)" />
                      <Area type="monotone" dataKey="co2" stroke="#22c55e" fill="#bbf7d0" name="CO₂ (ppm)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Waiting for sensor data...</p>
            <p className="text-gray-500 text-sm mt-2">
              {connectionStatus === 'connected' ? 'Connected - waiting for data stream' : 'Connecting to backend...'}
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Demo Controls (Simulate Problems)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button
              onClick={() => triggerProblem('high_temperature')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              High Temp
            </button>
            <button
              onClick={() => triggerProblem('high_humidity')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
            >
              High Humidity
            </button>
            <button
              onClick={() => triggerProblem('low_light')}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
            >
              Low Light
            </button>
            <button
              onClick={() => triggerProblem('low_soil_moisture')}
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors text-sm"
            >
              Low Moisture
            </button>
            <button
              onClick={() => triggerProblem('low_co2')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
            >
              Low CO₂
            </button>
            <button
              onClick={resolveProblem}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle size={16} />
              Resolve All
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>Last updated: {sensorData ? new Date(sensorData.timestamp).toLocaleString() : 'Waiting for data...'}</p>
        </div>
      </div>
    </div>
  );
};

export default PolyhouseDashboard;