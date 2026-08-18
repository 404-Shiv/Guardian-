import React, { useState } from 'react';
import { Sliders, Eye, EyeOff, CheckSquare, ShieldCheck, RefreshCw } from 'lucide-react';

const ConfigView = () => {
  const [activeTab, setActiveTab] = useState('AGENT SETTINGS');
  const [autoResponse, setAutoResponse] = useState(true);
  const [dpiEnabled, setDpiEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState(75);
  const [showOverrideKey, setShowOverrideKey] = useState(false);
  const [overrideKey, setOverrideKey] = useState('secret_master_override_key_99');

  return (
    <div className="config-container">
      {/* Breadcrumb Header */}
      <div className="config-breadcrumb">
        NODE: 01 // STATUS: SECURE // ENV: PROD
      </div>

      {/* Tab Navigation matching New Image 1 */}
      <div className="config-tab-bar">
        {['AGENT SETTINGS', 'API INTEGRATION', 'USER ACCESS CONTROL'].map((tab) => (
          <button
            key={tab}
            className={`config-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Main Settings Grid + System Health Sidebar */}
      <div className="config-grid">
        {/* Left Side: Settings Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Autonomous Response + Deep Packet Inspection */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Autonomous Response Card */}
            <div className="setting-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="setting-card-title">AUTONOMOUS RESPONSE</div>
                  <div className="setting-card-desc">
                    Enable AI-driven threat mitigation without manual approval.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoResponse}
                  onChange={(e) => setAutoResponse(e.target.checked)}
                  style={{ accentColor: '#ff4422', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '12px', fontSize: '0.72rem' }}>
                <div>
                  &gt; STATUS: <span style={{ color: autoResponse ? 'var(--accent-orange)' : 'var(--text-muted)', fontWeight: 700 }}>{autoResponse ? 'ACTIVE' : 'DISABLED'}</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  &gt; LAST EVENT: 02:14:00 UTC
                </div>
              </div>
            </div>

            {/* Deep Packet Inspection Card */}
            <div className="setting-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="setting-card-title">DEEP PACKET INSPECTION</div>
                  <div className="setting-card-desc">
                    Inspect payload data for signatures.
                  </div>
                </div>
                <div
                  onClick={() => setDpiEnabled(!dpiEnabled)}
                  style={{
                    width: '36px',
                    height: '20px',
                    background: dpiEnabled ? '#ff4422' : '#282a33',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      background: '#fff',
                      borderRadius: '1px',
                      position: 'absolute',
                      top: '2px',
                      left: dpiEnabled ? '18px' : '2px',
                      transition: 'all 0.2s ease',
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Threat Sensitivity Threshold Slider (New Image 1) */}
          <div className="setting-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="setting-card-title">THREAT SENSITIVITY THRESHOLD</div>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{sensitivity}%</span>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>MIN</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                style={{ flex: 1, accentColor: '#ff4422', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>MAX</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              <span>Permissive</span>
              <span>Strict</span>
            </div>
          </div>

          {/* Row 3: Master Override Key Input (New Image 1) */}
          <div className="setting-card">
            <div className="setting-card-title">MASTER OVERRIDE KEY</div>
            <div style={{ position: 'relative', marginTop: '12px' }}>
              <input
                type={showOverrideKey ? 'text' : 'password'}
                value={overrideKey}
                onChange={(e) => setOverrideKey(e.target.value)}
                style={{
                  width: '100%',
                  background: '#090a0d',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '0.8rem',
                  padding: '10px 40px 10px 14px',
                  outline: 'none',
                  borderRadius: '2px',
                }}
              />
              <div
                onClick={() => setShowOverrideKey(!showOverrideKey)}
                style={{ position: 'absolute', right: '12px', top: '10px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showOverrideKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: System Health Side Panel (New Image 1) */}
        <div className="system-health-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="panel-header" style={{ margin: '-20px -20px 0 -20px', borderBottom: '1px solid var(--border-color)' }}>
            <span>SYSTEM HEALTH</span>
            <Sliders size={14} color="#666" />
          </div>

          {/* CPU LOAD */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>CPU LOAD</span>
              <span style={{ color: '#fff' }}>42%</span>
            </div>
            <div className="health-progress-bar">
              <div className="health-progress-fill" style={{ width: '42%' }}></div>
            </div>
          </div>

          {/* MEM USAGE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>MEM USAGE</span>
              <span style={{ color: '#fff' }}>16.4 GB</span>
            </div>
            <div className="health-progress-bar">
              <div className="health-progress-fill" style={{ width: '68%' }}></div>
            </div>
          </div>

          {/* NET TRAFFIC */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
              <span>NET TRAFFIC</span>
              <span style={{ color: '#fff' }}>1.2 TB/s</span>
            </div>

            {/* Equalizer bars below NET TRAFFIC */}
            <div className="equalizer-bar-chart" style={{ height: '40px', marginTop: '10px' }}>
              {[30, 45, 60, 80, 50, 95, 70, 40].map((h, i) => (
                <div key={i} className={`eq-bar ${h === 95 ? 'spike' : ''}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>

          {/* Status Nominal */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '0.75rem', color: 'var(--text-normal)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: '#fff', borderRadius: '1px' }}></span>
            <span>SYSTEM NOMINAL</span>
          </div>

          {/* Action Button: RESTART DAEMON */}
          <div style={{ marginTop: 'auto' }}>
            <button className="btn-tactical btn-override" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              <RefreshCw size={14} /> RESTART DAEMON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigView;
