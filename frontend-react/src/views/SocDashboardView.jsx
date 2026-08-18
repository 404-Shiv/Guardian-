import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SocDashboardView = ({ stats, onNavigateToThreats }) => {
  const [timeFilter, setTimeFilter] = useState('24H');

  const chartData = [
    { time: '00:00', val: 20 },
    { time: '06:00', val: 40 },
    { time: '12:00', val: 55 },
    { time: '18:00', val: 78 },
    { time: 'NOW', val: 88 },
  ];

  const incidentLogs = [
    { time: '14:02:11', ip: '192.168.1.105', type: 'BRUTE_FORCE', isOrange: true },
    { time: '13:58:44', ip: '45.22.109.12', type: 'PORT_SCAN', isOrange: false },
    { time: '13:45:02', ip: '10.0.0.42', type: 'ANOMALY', isOrange: false },
    { time: '13:12:19', ip: '172.16.254.1', type: 'DDoS_ATTEMPT', isOrange: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000' }}>
      {/* Top Row: SYS.STATUS + DEFCON 2 Posture (Image 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* SYS.STATUS Card */}
        <div style={{ background: '#111215', border: '1px solid #22242a', padding: '24px', position: 'relative' }}>
          <div style={{ fontSize: '0.68rem', color: '#555866', letterSpacing: '1.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🖪</span>
            <span>SYS.STATUS</span>
          </div>

          <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '2px', color: '#ffffff', margin: '12px 0 10px 0' }}>
            OPERATIONAL_STATE: NOMINAL<span className="blinking-cursor"></span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#a0a4b0', lineHeight: 1.6, maxWidth: '640px' }}>
            All localized defensive perimeters are active. Quantum encryption modules synchronized. Last sweep completed 0.42s ago.
          </div>

          <div style={{ display: 'flex', gap: '40px', marginTop: '24px', borderTop: '1px solid #1a1c22', paddingTop: '16px' }}>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#555866', letterSpacing: '1.5px', fontWeight: 700 }}>UPTIME</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>99.998%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#555866', letterSpacing: '1.5px', fontWeight: 700 }}>NODES</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>1,024 ONLINE</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', color: '#555866', letterSpacing: '1.5px', fontWeight: 700 }}>LOAD</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>14.2%</div>
            </div>
          </div>
        </div>

        {/* DEFCON POSTURE White Glowing Card (Image 1) */}
        <div style={{
          background: '#ffffff',
          color: '#000000',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          position: 'relative',
          border: '2px solid #ff4422',
          boxShadow: '0 0 25px rgba(255, 68, 34, 0.45)',
        }}>
          <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '4px' }}>
            <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
            <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
            <span style={{ width: '4px', height: '4px', background: '#000', borderRadius: '50%' }}></span>
          </div>

          <div style={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '2px', color: '#555555', textTransform: 'uppercase' }}>
            CURRENT POSTURE
          </div>
          <div style={{ fontSize: '2.8rem', fontWeight: 900, letterSpacing: '3px', color: '#000000', margin: '6px 0' }}>
            DEFCON 2
          </div>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#333333' }}>
            ELEVATED RISK PROTOCOL
          </div>
        </div>
      </div>

      {/* Middle Row: 3 Stat Cards (Image 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
        <div style={{ background: '#111215', border: '1px solid #22242a', padding: '20px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#555866' }}>
            TOTAL_ALERTS (24H)
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            14,208
          </div>
        </div>

        <div style={{ background: '#111215', border: '1px solid #22242a', padding: '20px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#555866' }}>
            THREATS_BLOCKED
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ffffff', marginTop: '8px' }}>
            14,195
          </div>
        </div>

        <div style={{ background: '#111215', border: '1px solid #22242a', padding: '20px' }}>
          <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '1.5px', color: '#555866' }}>
            ACTIVE_VECTORS
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#ff4422', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>13</span>
            <span style={{ fontSize: '1.2rem', color: '#ff4422' }}>△</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: VECTOR_ANALYSIS_CHART + INCIDENT_LOG (Image 1) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '16px' }}>
        {/* Vector Analysis Chart Container */}
        <div className="tactical-panel">
          <div className="panel-header">
            <span>VECTOR_ANALYSIS_CHART</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['1H', '24H', '7D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  style={{
                    background: timeFilter === tf ? '#ffffff' : '#111215',
                    color: timeFilter === tf ? '#000000' : '#888888',
                    border: '1px solid #333540',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '2px',
                    cursor: 'pointer',
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="panel-body" style={{ height: 230, padding: '16px 16px 0 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#555866" fontSize={10} tickLine={false} />
                <YAxis stroke="#555866" fontSize={10} tickLine={false} domain={[0, 100]} ticks={[0, 50, 100]} />
                <Tooltip contentStyle={{ background: '#111215', borderColor: '#22242a', color: '#fff', fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#areaGrad)"
                  dot={{ r: 4, fill: '#ffffff', stroke: '#000000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Incident Log Table Container */}
        <div className="tactical-panel">
          <div className="panel-header">
            <span>INCIDENT_LOG</span>
            <button
              onClick={onNavigateToThreats}
              style={{
                background: 'transparent',
                border: '1px solid #333540',
                color: '#cccccc',
                fontSize: '0.6rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              VIEW_ALL
            </button>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <table className="mitre-table">
              <thead>
                <tr>
                  <th>TIME</th>
                  <th>SOURCE_IP</th>
                  <th style={{ textAlign: 'right' }}>TYPE</th>
                </tr>
              </thead>
              <tbody>
                {incidentLogs.map((log, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={onNavigateToThreats}>
                    <td>{log.time}</td>
                    <td>{log.ip}</td>
                    <td style={{ textAlign: 'right', color: log.isOrange ? '#ff4422' : 'inherit', fontWeight: log.isOrange ? 700 : 400 }}>
                      {log.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocDashboardView;
