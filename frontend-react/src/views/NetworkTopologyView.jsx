import React, { useState } from 'react';
import { Sliders, Database } from 'lucide-react';

const NetworkTopologyView = ({ onSelectAnomalousSubnet }) => {
  const [selectedSubnet, setSelectedSubnet] = useState('192.168.1.0/24');

  const subnets = [
    { ip: '10.0.1.0/24', vlan: 'VLAN_10 (MGMT)', count: '245/254', status: 'ok' },
    { ip: '10.0.2.0/24', vlan: 'VLAN_20 (DATA)', count: '12/254', status: 'ok' },
    { ip: '192.168.1.0/24', vlan: 'DMZ_ZONE', count: 'ERR_TRAFFIC', status: 'error' },
    { ip: '10.0.3.0/24', vlan: 'VLAN_30 (GUEST)', count: 'OFFLINE', status: 'offline' },
    { ip: '172.16.0.0/16', vlan: 'VPC_AWS_US_EAST', count: 'SYNC_OK', status: 'ok' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px', flex: 1, backgroundColor: '#000000', minHeight: '100%' }}>
      {/* LEFT CANVAS: NETWORK_TOPOLOGY (Pure 100% Vector SVG for Pixel-Perfect Alignment) */}
      <div style={{ background: '#0d0e11', border: '1px solid #22242a', borderRadius: '2px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Panel Header Bar */}
        <div style={{ background: '#151619', borderBottom: '1px solid #22242a', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', color: '#ffffff' }}>
          <span>NETWORK_TOPOLOGY</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ background: 'rgba(17, 18, 21, 0.8)', border: '1px solid #22242a', color: '#a0a4b0', fontSize: '0.65rem', fontWeight: 700, padding: '4px 10px', borderRadius: '2px', letterSpacing: '1px' }}>
              ZOOM: 100%
            </button>
            <button style={{ background: 'rgba(17, 18, 21, 0.8)', border: '1px solid #22242a', color: '#a0a4b0', fontSize: '0.65rem', fontWeight: 700, padding: '4px 8px', borderRadius: '2px' }}>
              <Sliders size={12} />
            </button>
          </div>
        </div>

        {/* Pure Vector SVG Topology Screen */}
        <div style={{ flex: 1, width: '100%', minHeight: '520px', position: 'relative' }}>
          <svg
            viewBox="0 0 800 550"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', display: 'block' }}
          >
            <defs>
              {/* Subtle Grid Mesh Background Pattern */}
              <pattern id="gridPattern" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(35, 37, 43, 0.4)" strokeWidth="1" />
              </pattern>

              {/* Glowing Filters */}
              <filter id="orangeGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Background Grid */}
            <rect width="800" height="550" fill="url(#gridPattern)" />

            {/* --- CONNECTOR LINES --- */}
            {/* Core Router -> DB Cluster */}
            <line x1="400" y1="270" x2="210" y2="210" stroke="#383c4a" strokeWidth="1.5" />
            {/* DB Cluster -> Workstation Monitor */}
            <line x1="210" y1="210" x2="145" y2="238" stroke="#383c4a" strokeWidth="1.5" />
            {/* Core Router -> Ext Gateway */}
            <line x1="400" y1="270" x2="590" y2="180" stroke="#383c4a" strokeWidth="1.5" />
            {/* Core Router -> Switch Access */}
            <line x1="400" y1="270" x2="270" y2="360" stroke="#383c4a" strokeWidth="1.5" />

            {/* ANIMATED DASHED ORANGE ATTACK LINE (Core Router -> DMZ Node 04) */}
            <line
              x1="400"
              y1="270"
              x2="550"
              y2="340"
              stroke="#ff4422"
              strokeWidth="2"
              strokeDasharray="6 4"
            >
              <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
            </line>

            {/* --- NODES --- */}

            {/* 1. CENTER NODE: CORE_ROUTER_01 */}
            <g transform="translate(370, 240)">
              {/* Outer Glow Box */}
              <rect x="0" y="0" width="60" height="60" rx="3" fill="#111216" stroke="#555866" strokeWidth="1.5" filter="url(#coreGlow)" />
              {/* Icon Graphic: Stacked Server Slots */}
              <rect x="15" y="16" width="30" height="11" rx="1" fill="none" stroke="#eeeeee" strokeWidth="1.5" />
              <circle cx="21" cy="21.5" r="1.5" fill="#eeeeee" />
              <circle cx="27" cy="21.5" r="1.5" fill="#eeeeee" />

              <rect x="15" y="33" width="30" height="11" rx="1" fill="none" stroke="#eeeeee" strokeWidth="1.5" />
              <circle cx="21" cy="38.5" r="1.5" fill="#eeeeee" />
              <circle cx="27" cy="38.5" r="1.5" fill="#eeeeee" />

              {/* Label Tag */}
              <rect x="-16" y="68" width="92" height="16" rx="2" fill="#0d0e11" stroke="#22242a" strokeWidth="1" />
              <text x="30" y="80" textAnchor="middle" fill="#aaaaaa" fontSize="9" fontWeight="700" fontFamily="JetBrains Mono, monospace" letterSpacing="0.5">
                CORE_ROUTER_01
              </text>
            </g>

            {/* 2. TOP LEFT NODE: DB_CLUSTER_A */}
            <g transform="translate(190, 190)">
              <rect x="0" y="0" width="40" height="40" rx="3" fill="#111216" stroke="#333642" strokeWidth="1" />
              {/* Database Icon Lines */}
              <line x1="10" y1="14" x2="30" y2="14" stroke="#aaaaaa" strokeWidth="2" />
              <line x1="10" y1="20" x2="30" y2="20" stroke="#aaaaaa" strokeWidth="2" />
              <line x1="10" y1="26" x2="30" y2="26" stroke="#aaaaaa" strokeWidth="2" />

              <rect x="-15" y="46" width="70" height="14" rx="2" fill="#0d0e11" stroke="#1c1e24" strokeWidth="1" />
              <text x="20" y="56" textAnchor="middle" fill="#888888" fontSize="8" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                DB_CLUSTER_A
              </text>
            </g>

            {/* 3. WORKSTATION MONITOR NODE */}
            <g transform="translate(130, 222)">
              <rect x="0" y="0" width="32" height="32" rx="3" fill="#111216" stroke="#333642" strokeWidth="1" />
              <rect x="8" y="8" width="16" height="11" fill="none" stroke="#888888" strokeWidth="1.5" />
              <line x1="12" y1="23" x2="20" y2="23" stroke="#888888" strokeWidth="1.5" />
            </g>

            {/* 4. TOP RIGHT NODE: EXT_GATEWAY (CLOUD) */}
            <g transform="translate(570, 160)">
              <rect x="0" y="0" width="42" height="42" rx="3" fill="#111216" stroke="#333642" strokeWidth="1" />
              {/* Cloud Icon */}
              <path d="M14 26 A 5 5 0 0 1 14 18 A 7 7 0 0 1 27 15 A 6 6 0 0 1 29 26 Z" fill="none" stroke="#aaaaaa" strokeWidth="1.5" />

              <rect x="-10" y="48" width="62" height="14" rx="2" fill="#0d0e11" stroke="#1c1e24" strokeWidth="1" />
              <text x="21" y="58" textAnchor="middle" fill="#888888" fontSize="8" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                EXT_GATEWAY
              </text>
            </g>

            {/* 5. BOTTOM LEFT NODE: SW_ACCESS_02 */}
            <g transform="translate(250, 340)">
              <rect x="0" y="0" width="42" height="42" rx="3" fill="#111216" stroke="#333642" strokeWidth="1" />
              {/* Router / Access Point Icon */}
              <rect x="11" y="22" width="20" height="8" fill="none" stroke="#888888" strokeWidth="1.5" />
              <path d="M 15 17 Q 21 13 27 17" fill="none" stroke="#888888" strokeWidth="1.5" />

              <rect x="-10" y="48" width="62" height="14" rx="2" fill="#0d0e11" stroke="#1c1e24" strokeWidth="1" />
              <text x="21" y="58" textAnchor="middle" fill="#888888" fontSize="8" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                SW_ACCESS_02
              </text>
            </g>

            {/* 6. COMPROMISED NODE: DMZ_NODE_04 (GLOWING ORANGE BOX & TAG) */}
            <g transform="translate(525, 315)" style={{ cursor: 'pointer' }} onClick={onSelectAnomalousSubnet}>
              {/* Orange Glow Outer Box */}
              <rect x="0" y="0" width="48" height="48" rx="3" fill="rgba(255, 68, 34, 0.08)" stroke="#ff4422" strokeWidth="2" filter="url(#orangeGlow)" />
              {/* Warning Triangle Icon */}
              <polygon points="24,12 36,34 12,34" fill="none" stroke="#ff4422" strokeWidth="2" strokeLinejoin="round" />
              <line x1="24" y1="20" x2="24" y2="26" stroke="#ff4422" strokeWidth="2" strokeLinecap="round" />
              <circle cx="24" cy="30" r="1" fill="#ff4422" />

              {/* Glowing Orange Label Tag */}
              <rect x="-12" y="54" width="72" height="16" rx="2" fill="#0d0e11" stroke="#ff4422" strokeWidth="1" />
              <text x="24" y="65" textAnchor="middle" fill="#ff4422" fontSize="8.5" fontWeight="800" fontFamily="JetBrains Mono, monospace" letterSpacing="0.5">
                DMZ_NODE_04
              </text>
            </g>

            {/* --- OVERLAY STAT BOXES INSIDE TOPOLOGY CANVAS BOTTOM LEFT (Exact Match) --- */}
            {/* TOTAL_NODES Box */}
            <g transform="translate(16, 475)">
              <rect x="0" y="0" width="80" height="54" rx="2" fill="#0d0e11" stroke="#22242a" strokeWidth="1" />
              <text x="10" y="18" fill="#555866" fontSize="7.5" fontWeight="700" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
                TOTAL_NODES
              </text>
              <text x="10" y="42" fill="#ffffff" fontSize="16" fontWeight="800" fontFamily="JetBrains Mono, monospace">
                1,024
              </text>
            </g>

            {/* ANOMALIES Box (Glowing Orange Border) */}
            <g transform="translate(104, 475)" style={{ cursor: 'pointer' }} onClick={onSelectAnomalousSubnet}>
              <rect x="0" y="0" width="80" height="54" rx="2" fill="#0d0e11" stroke="#ff4422" strokeWidth="1" filter="url(#orangeGlow)" />
              <text x="10" y="18" fill="#ff4422" fontSize="7.5" fontWeight="700" fontFamily="JetBrains Mono, monospace" letterSpacing="1">
                ANOMALIES
              </text>
              <text x="10" y="42" fill="#ff4422" fontSize="16" fontWeight="800" fontFamily="JetBrains Mono, monospace">
                03
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* RIGHT SIDE PANELS: SUBNET_INVENTORY + TRAFFIC_ANALYSIS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* SUBNET_INVENTORY Panel */}
        <div className="tactical-panel">
          <div className="panel-header">
            <span>SUBNET_INVENTORY</span>
            <Database size={14} color="#666" />
          </div>
          <div className="panel-body" style={{ padding: '12px' }}>
            {subnets.map((sub) => {
              const isErr = sub.status === 'error';
              return (
                <div
                  key={sub.ip}
                  className={`subnet-item ${isErr ? 'err-traffic' : ''}`}
                  onClick={() => {
                    setSelectedSubnet(sub.ip);
                    if (isErr && onSelectAnomalousSubnet) onSelectAnomalousSubnet();
                  }}
                  style={{
                    cursor: 'pointer',
                    background: isErr ? 'rgba(255, 68, 34, 0.05)' : '#111215',
                    border: isErr ? '1px solid #ff4422' : '1px solid #22242a',
                    boxShadow: isErr ? '0 0 10px rgba(255, 68, 34, 0.35)' : 'none',
                  }}
                >
                  <div>
                    <div className="subnet-ip" style={{ color: isErr ? '#ff4422' : '#ffffff' }}>{sub.ip}</div>
                    <div className="subnet-tag" style={{ color: isErr ? '#ff4422' : '#555866' }}>{sub.vlan}</div>
                  </div>
                  <div className="subnet-count">
                    <span style={{ color: isErr ? '#ff4422' : '#a0a4b0' }}>{sub.count}</span>
                    {isErr ? (
                      <span style={{ width: '8px', height: '8px', background: '#ff4422', borderRadius: '1px' }}></span>
                    ) : (
                      <span style={{ width: '8px', height: '8px', background: '#ffffff', opacity: sub.status === 'offline' ? 0.2 : 0.8, borderRadius: '1px' }}></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRAFFIC_ANALYSIS Panel */}
        <div className="tactical-panel">
          <div className="panel-header">
            <span>TRAFFIC_ANALYSIS</span>
            <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 800 }}>LIVE</span>
          </div>
          <div className="panel-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                4.2 <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 600 }}>GB/s</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#888', textAlign: 'right' }}>
                <div>IN: 2.8 GB/s</div>
                <div>OUT: 1.4 GB/s</div>
              </div>
            </div>

            {/* Equalizer Bar Chart (Matching Image) */}
            <div className="equalizer-bar-chart" style={{ height: '64px', marginTop: '14px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
              {[25, 40, 20, 55, 75, 45, 95, 60, 35, 25, 45, 30].map((height, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${height}%`,
                    background: height === 95 ? '#ff4422' : '#252830',
                    boxShadow: height === 95 ? '0 0 12px #ff4422' : 'none',
                    borderRadius: '1px 1px 0 0',
                  }}
                ></div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: '#555', marginTop: '6px' }}>
              <span>T-60s</span>
              <span>NOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkTopologyView;
