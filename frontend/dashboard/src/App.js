// FINAL, VERIFIED, AND COMPLETE App.js / PolyhouseDashboard.jsx
// With all requested UI changes.

import { AlertTriangle, Bug, CheckCircle, Droplet, Info, Leaf, Move, MoveVertical, Power, Thermometer, TrendingUp, Zap } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AlertsDisplay = ({ alerts }) => {
    if (!alerts || alerts.length === 0) return null;
    const getAlertStyle = (level) => {
        switch (level) {
            case 'critical': return { container: { background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)' }, title: { color: '#f87171' }, item: { background: 'rgba(239, 68, 68, 0.1)' } };
            case 'warning': return { container: { background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.4)' }, title: { color: '#f59e0b' }, item: { background: 'rgba(245, 158, 11, 0.1)' } };
            case 'advisory': return { container: { background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.4)' }, title: { color: '#3b82f6' }, item: { background: 'rgba(59, 130, 246, 0.1)' } };
            default: return { container: { background: 'rgba(100, 116, 139, 0.1)', border: '1px solid rgba(100, 116, 139, 0.4)' }, title: { color: '#64748b' }, item: { background: 'rgba(100, 116, 139, 0.1)' } };
        }
    };
    const overallSeverity = alerts.some(a => a.level === 'critical') ? 'critical' : alerts.some(a => a.level === 'warning') ? 'warning' : 'advisory';
    const mainStyle = getAlertStyle(overallSeverity);
    return (
        <div style={{ ...mainStyle.container, borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h2 style={{ ...mainStyle.title, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {overallSeverity === 'critical' || overallSeverity === 'warning' ? <AlertTriangle /> : <Info />} Proactive Insights ({alerts.length})
            </h2>
            {alerts.map((alert) => {
                const itemStyle = getAlertStyle(alert.level);
                return (
                    <div key={alert.id} style={{ ...itemStyle.item, padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                        <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{alert.title}</h3>
                        <p style={{ color: '#e2e8f0', margin: '0.5rem 0' }}>{alert.description}</p>
                        <p style={{ fontSize: '0.9rem' }}>
                            <span style={{ color: '#94a3b8' }}>Current Value: </span><span style={{ fontWeight: 'bold', ...itemStyle.title }}>{alert.current_value}</span>
                            <span style={{ color: '#94a3b8', marginLeft: '1rem' }}>Optimal: </span><span style={{ fontWeight: 'bold', color: '#4ade80' }}>{alert.optimal_range}</span>
                        </p>
                        <p style={{ marginTop: '0.75rem', color: '#cbd5e1', fontStyle: 'italic' }}><strong style={{ color: '#e2e8f0', fontStyle: 'normal' }}>Impact:</strong> {alert.impact}</p>
                        <h4 style={{ fontWeight: 'bold', marginTop: '1rem', color: '#e2e8f0' }}>Recommended Precautions:</h4>
                        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '0.5rem 0 0 0' }}>
                            {alert.solutions && alert.solutions.map((solution, index) => (
                                <li key={index} style={{ color: '#e2e8f0', marginBottom: '0.25rem' }}>{solution.action}</li>
                            ))}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
};

const PolyhouseDashboard = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [alerts, setAlerts] = useState([]);
    const [sensorData, setSensorData] = useState(null);
    const [cameraFrame, setCameraFrame] = useState(null);
    const [diseaseData, setDiseaseData] = useState(null);
    const [pestData, setPestData] = useState(null);
    const [growthData, setGrowthData] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('Connecting...');
    const [isConnected, setIsConnected] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const mountedRef = useRef(true);

    const connectWebSocket = React.useCallback(() => {
        if (!mountedRef.current) return;
        try {
            const ws = new WebSocket('ws://localhost:8000/ws/realtime');
            ws.onopen = () => { setIsConnected(true); setConnectionStatus('Connected'); };
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    if (message.type === 'sensor_update') {
                        const data = message.data;
                        setSensorData(data);
                        setAlerts(message.alerts || []);
                        setHistoricalData(prev => [...prev, {
                            time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            temp: data.temperature_internal,
                            humidity: data.humidity,
                            moisture: data.soil_moisture,
                            water_level: data.water_level_cm
                        }].slice(-30));
                        if (data.camera_frame_base64) setCameraFrame(data.camera_frame_base64);
                        if (data.disease_analysis) setDiseaseData(data.disease_analysis);
                        if (data.pest_analysis) setPestData(data.pest_analysis);
                        if (data.growth_metrics) setGrowthData(data.growth_metrics);
                    }
                } catch (error) { console.error('Error parsing message:', error); }
            };
            ws.onerror = () => { setIsConnected(false); setConnectionStatus('Connection Error'); };
            ws.onclose = () => {
                setIsConnected(false);
                setConnectionStatus('Reconnecting...');
                if (mountedRef.current) reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
            };
            wsRef.current = ws;
        } catch (error) { setIsConnected(false); setConnectionStatus('Failed to Connect'); }
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        connectWebSocket();
        return () => {
            mountedRef.current = false;
            if (wsRef.current) wsRef.current.close();
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        };
    }, [connectWebSocket]);

    const triggerProblem = async (problemType) => {
        try { await fetch(`http://localhost:8000/api/simulate/problem?problem_type=${problemType}`, { method: 'POST' }); }
        catch (error) { console.error('Error triggering problem:', error); }
    };

    const resolveProblem = async () => {
        try { await fetch('http://localhost:8000/api/simulate/resolve', { method: 'POST' }); }
        catch (error) { console.error('Error resolving problem:', error); }
    };

    const controlMotor = async (motorId, direction, speed) => {
        try { await fetch(`http://localhost:8000/api/motors/control?motor_id=${motorId}&direction=${direction}&speed=${speed}`, { method: 'POST' }); }
        catch (error) { console.error('Error controlling motor:', error); }
    };

    const stopAllMotors = async () => {
        try { await fetch('http://localhost:8000/api/motors/stop-all', { method: 'POST' }); }
        catch (error) { console.error('Error stopping motors:', error); }
    };

    const styles = {
        container: { minHeight: '100vh', background: '#0f172a', fontFamily: "'Segoe UI', sans-serif", padding: '2rem', color: '#e2e8f0' },
        header: { textAlign: 'center', marginBottom: '2rem' },
        title: { fontSize: '2.5rem', marginBottom: '0.5rem', color: 'white', fontWeight: 'bold' },
        subtitle: { fontSize: '1rem', color: '#94a3b8' },
        tabContainer: { display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap', borderBottom: '1px solid #334155', paddingBottom: '1rem' },
        tabButton: { padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s', color: '#94a3b8', backgroundColor: 'transparent' },
        tabButtonActive: { color: 'white', backgroundColor: '#3b82f6' },
        card: { background: '#1e293b', borderRadius: '1rem', padding: '1.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', marginBottom: '1.5rem', border: '1px solid #334155' },
        cardTitle: { display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' },
        sensorItem: { background: '#334155', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
        sensorLabel: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: '#94a3b8', marginBottom: '0.5rem' },
        sensorValue: { fontSize: '2.2rem', fontWeight: 'bold', color: 'white' },
        statusIndicator: { position: 'fixed', top: '2rem', right: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#1e293b', borderRadius: '0.5rem', border: '1px solid #334155', zIndex: 1000 },
        statusDot: { width: '12px', height: '12px', borderRadius: '50%' },
        cameraContainer: { background: '#0f172a', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid #334155' },
        cameraImage: { width: '100%', borderRadius: '0.25rem' },
        aiAnalysisGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
        analysisCard: { background: '#334155', padding: '1.5rem', borderRadius: '0.75rem' },
        analysisTitle: { display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' },
        motorCard: { background: '#334155', padding: '1rem', borderRadius: '0.75rem', textAlign: 'center' },
        motorButton: { padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: '600', color: 'white', flexGrow: 1 },
        clock: { position: 'fixed', top: '2rem', left: '2rem', background: '#1e293b', color: '#94a3b8', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #334155', fontSize: '0.9rem', zIndex: 1000 }
    };

    const renderSensorData = () => {
        if (!sensorData) return <p style={{ color: '#94a3b8' }}>Waiting for initial sensor data...</p>;
        const sensorMap = [
            { label: 'Internal Temp', value: `${sensorData.temperature_internal}°C`, icon: <Thermometer size={18} /> },
            { label: 'Humidity', value: `${sensorData.humidity}%`, icon: <Droplet size={18} /> },
            { label: 'Soil Moisture', value: `${sensorData.soil_moisture}%`, icon: <MoveVertical size={18} /> },
            { label: 'Water Level', value: `${sensorData.water_level_cm}cm`, icon: <TrendingUp size={18} /> },
            { label: 'Motion Detected', value: sensorData.motion_detected ? "Yes" : "No", icon: <Move size={18} /> },
            { label: 'Soil pH', value: sensorData.soil_ph, icon: <Zap size={18} /> },
        ];
        return <div style={styles.grid}>{sensorMap.map(s => (<div key={s.label} style={styles.sensorItem}><div style={styles.sensorLabel}>{s.icon} {s.label}</div><div style={styles.sensorValue}>{s.value}</div></div>))}</div>;
    };

    const DemoControls = () => (
        <div style={styles.card}>
            <h2 style={styles.cardTitle}><AlertTriangle size={24} style={{ display: 'inline-block', marginRight: '0.75rem', color: '#facc15' }} />Demo Controls (Simulator Only)</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <button style={{ ...styles.tabButton, background: '#ef4444', color: 'white' }} onClick={() => triggerProblem('high_temperature')}>High Temp</button>
                <button style={{ ...styles.tabButton, background: '#3b82f6', color: 'white' }} onClick={() => triggerProblem('high_humidity')}>High Humidity</button>
                <button style={{ ...styles.tabButton, background: '#a78bfa', color: 'white' }} onClick={() => triggerProblem('low_humidity')}>Low Humidity</button>
                <button style={{ ...styles.tabButton, background: '#8b5cf6', color: 'white' }} onClick={() => triggerProblem('low_soil_moisture')}>Low Moisture</button>
                <button style={{ ...styles.tabButton, background: '#d946ef', color: 'white' }} onClick={() => triggerProblem('high_soil_moisture')}>High Moisture</button>
                <button style={{ ...styles.tabButton, background: '#10b981', color: 'white' }} onClick={() => triggerProblem('detect_disease')}>Detect Disease</button>
                <button style={{ ...styles.tabButton, background: '#f59e0b', color: 'white' }} onClick={() => triggerProblem('detect_pest')}>Detect Pests</button>
                <button style={{ ...styles.tabButton, background: '#64748b', color: 'white' }} onClick={resolveProblem}><CheckCircle size={18} style={{ display: 'inline-block', marginRight: '0.5rem' }} />Resolve All</button>
            </div>
        </div>
    );

    return (
        <div style={styles.container}>
            <style>{`@keyframes blink { 0%, 50% { opacity: 1; } 51%, 100% { opacity: 0.3; } }`}</style>

            <div style={styles.clock}>
                {currentTime.toLocaleString()}
            </div>

            <div style={styles.statusIndicator}>
                <div style={{ ...styles.statusDot, background: isConnected ? '#48bb78' : '#f56565', animation: isConnected ? 'blink 1.5s infinite' : 'none' }}></div>
                <span style={{ color: isConnected ? '#48bb78' : '#f56565' }}>{connectionStatus}</span>
            </div>

            <div style={styles.header}>
                <h1 style={styles.title}>Smart Polyhouse AI Dashboard</h1>
                <p style={styles.subtitle}>Real-time Rover Control, Environmental Monitoring & AI Analysis</p>
            </div>

            <div style={styles.tabContainer}>
                {['overview', 'motors', 'camera', 'ai-analysis', 'charts'].map(tab => (
                    <button key={tab} style={{ ...styles.tabButton, ...(activeTab === tab ? styles.tabButtonActive : {}) }} onClick={() => setActiveTab(tab)}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                ))}
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {['overview', 'ai-analysis', 'charts'].includes(activeTab) && <AlertsDisplay alerts={alerts} />}

                {activeTab === 'overview' && (<><div style={styles.card}><h2 style={styles.cardTitle}>Live Environmental Status</h2>{renderSensorData()}</div><DemoControls /></>)}

                {activeTab === 'motors' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Rover Motor Control</h2>
                        <div style={{ ...styles.grid, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                            {[1, 2, 3, 4].map(id => (
                                <div key={id} style={styles.motorCard}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Motor {id}</div>
                                    <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>{`Speed: ${sensorData?.motor_statuses?.[id] || 0}%`}</div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button style={{ ...styles.motorButton, background: '#2563eb' }} onClick={() => controlMotor(id, 'forward', 100)}>Forward</button>
                                        <button style={{ ...styles.motorButton, background: '#ca8a04' }} onClick={() => controlMotor(id, 'backward', 100)}>Reverse</button>
                                        <button style={{ ...styles.motorButton, background: '#dc2626' }} onClick={() => controlMotor(id, 'stop', 0)}>Stop</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button style={{ ...styles.motorButton, width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.2rem', background: '#be123c' }} onClick={stopAllMotors}><Power size={20} style={{ display: 'inline-block', marginRight: '0.5rem' }} /> EMERGENCY STOP ALL</button>
                    </div>
                )}

                {activeTab === 'camera' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Live Camera Feed</h2>
                        {cameraFrame ? (
                            <>
                                <div style={{ ...styles.cameraContainer, position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', padding: '0.5rem', background: 'rgba(0, 0, 0, 0.5)', color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', borderTopLeftRadius: '0.25rem', borderTopRightRadius: '0.25rem' }}>LIVE SIMULATED FEED</div>
                                    <img src={`data:image/jpeg;base64,${cameraFrame}`} alt="Live feed" style={styles.cameraImage} />
                                </div>
                                <p style={{ color: '#94a3b8', marginTop: '1rem', textAlign: 'center' }}>
                                    This is a simulated feed for demonstration. On a Raspberry Pi, this will show the live video from the camera module.
                                </p>
                            </>
                        ) : (<p style={{ color: '#94a3b8' }}>Waiting for camera feed...</p>)}
                    </div>
                )}

                {activeTab === 'ai-analysis' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>AI-Powered Plant Analysis</h2>
                        <div style={styles.aiAnalysisGrid}>
                            <div style={styles.analysisCard}><div style={styles.analysisTitle}><Leaf size={20} /> Disease Detection</div>{diseaseData ? (diseaseData.diseases_detected?.length > 0 ? diseaseData.diseases_detected.map((d, i) => <p key={i}>{d.name}</p>) : <p style={{ color: '#48bb78' }}>No diseases detected.</p>) : <p>Analyzing...</p>}</div>
                            <div style={styles.analysisCard}><div style={styles.analysisTitle}><Bug size={20} /> Pest Identification</div>{pestData ? (pestData.pests_detected?.length > 0 ? pestData.pests_detected.map((p, i) => <p key={i}>{p.pest_type} (Count: {p.count})</p>) : <p style={{ color: '#48bb78' }}>No pests detected.</p>) : <p>Analyzing...</p>}</div>
                            <div style={styles.analysisCard}><div style={styles.analysisTitle}><TrendingUp size={20} /> Growth Monitoring</div>{growthData ? (<div><p>Canopy Coverage: {growthData.canopy_coverage_percent}%</p><p>Growth Stage: {growthData.growth_stage}</p></div>) : <p>Analyzing...</p>}</div>
                        </div>
                    </div>
                )}

                {activeTab === 'charts' && (
                    <>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Environment Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={historicalData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><XAxis dataKey="time" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #4a5568' }} /><Legend /><Line type="monotone" dataKey="temp" stroke="#f87171" name="Temp (°C)" /><Line type="monotone" dataKey="humidity" stroke="#60a5fa" name="Humidity (%)" /></LineChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={styles.card}>
                                <h2 style={styles.cardTitle}>Resource Trends</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={historicalData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" /><XAxis dataKey="time" stroke="#94a3b8" /><YAxis stroke="#94a3b8" /><Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #4a5568' }} /><Legend /><Area type="monotone" dataKey="moisture" stroke="#4ade80" fill="#4ade80" fillOpacity={0.3} name="Soil Moisture (%)" /><Area type="monotone" dataKey="water_level" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.3} name="Water Level (cm)" /></AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <DemoControls />
                    </>
                )}
            </div>
        </div>
    );
};

export default PolyhouseDashboard;