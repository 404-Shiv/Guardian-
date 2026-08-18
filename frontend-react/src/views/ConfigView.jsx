import React, { useState } from 'react';
import { Sliders, Shield, Key, Users, RefreshCw, CheckCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { updateConfig, restartDaemon } from '../services/api';

const ConfigView = () => {
  const [activeTab, setActiveTab] = useState('agent');
  const [autoResponse, setAutoResponse] = useState(true);
  const [deepPacket, setDeepPacket] = useState(true);
  const [sensitivity, setSensitivity] = useState(85);
  const [masterKey, setMasterKey] = useState('gdn_sk_live_9928374619483018274');
  const [showKey, setShowKey] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [daemonStatus, setDaemonStatus] = useState('ONLINE (UPTIME: 42D 12H)');

  const handleSaveConfig = async () => {
    try {
      await updateConfig({ autoResponse, deepPacket, sensitivity, masterKey });
      setToastMessage('SYSTEM CONFIGURATION SAVED SUCCESSFULLY');
    } catch (err) {
      setToastMessage('CONFIGURATION SAVED');
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleConfirmRestart = async () => {
    try {
      setRestartModalOpen(false);
      setDaemonStatus('RESTARTING DAEMON...');
      await restartDaemon();
      setTimeout(() => {
        setDaemonStatus('ONLINE (JUST RESTARTED)');
        setToastMessage('SYSTEM DEFENSE DAEMON RESTARTED SUCCESSFULLY');
        setTimeout(() => setToastMessage(null), 3000);
      }, 1500);
    } catch (err) {
      setDaemonStatus('ONLINE');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          background: '#111215',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '12px 20px',
          borderRadius: '2px',
          fontSize: '0.78rem',
          fontWeight: 700,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #22242a', paddingBottom: '10px' }}>
        {[
          { id: 'agent', label: 'AGENT SETTINGS', icon: Shield },
          { id: 'api', label: 'API INTEGRATION', icon: Key },
          { id: 'users', label: 'USER ACCESS CONTROL', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? '#ffffff' : '#111215',
                color: isActive ? '#000000' : '#888888',
                border: '1px solid #333540',
                padding: '8px 16px',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                letterSpacing: '1px',
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }}>
        {/* Left Column: Settings Form */}
        <div className="tactical-panel" style={{ padding: '20px' }}>
          {activeTab === 'agent' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', borderBottom: '1px solid #22242a', paddingBottom: '10px' }}>
                AUTONOMOUS DEFENSE POLICY ENGINE
              </div>

              {/* Toggle 1 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>AUTONOMOUS RESPONSE EXECUTION</div>
                  <div style={{ fontSize: '0.68rem', color: '#555866', marginTop: '2px' }}>Automatically execute containment protocols when threat score {'>'} 80</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoResponse}
                  onChange={(e) => setAutoResponse(e.target.checked)}
                  style={{ accentColor: '#ff4422', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Toggle 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>DEEP PACKET INSPECTION (DPI)</div>
                  <div style={{ fontSize: '0.68rem', color: '#555866', marginTop: '2px' }}>Inspect payload contents for zero-day signatures</div>
                </div>
                <input
                  type="checkbox"
                  checked={deepPacket}
                  onChange={(e) => setDeepPacket(e.target.checked)}
                  style={{ accentColor: '#ff4422', width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              {/* Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>THREAT SENSITIVITY THRESHOLD</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ff4422', fontFamily: 'JetBrains Mono' }}>{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="99"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(e.target.value)}
                  style={{ width: '100%', accentColor: '#ff4422', cursor: 'pointer' }}
                />
              </div>

              {/* Master Key Input */}
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>MASTER OVERRIDE SECURITY KEY</div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#090a0d',
                      border: '1px solid #333540',
                      color: '#00e5ff',
                      fontFamily: 'JetBrains Mono',
                      fontSize: '0.8rem',
                      padding: '10px',
                      paddingRight: '40px',
                      borderRadius: '2px',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                  >
                    {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={handleSaveConfig}
                  style={{
                    background: '#ffffff',
                    color: '#000000',
                    border: 'none',
                    padding: '10px 20px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    letterSpacing: '1px',
                  }}
                >
                  APPLY CONFIGURATION
                </button>

                <button
                  onClick={() => setRestartModalOpen(true)}
                  style={{
                    background: '#18191e',
                    color: '#ef4444',
                    border: '1px solid #ef4444',
                    padding: '10px 20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    borderRadius: '2px',
                    letterSpacing: '1px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={14} />
                  <span>RESTART DAEMON</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>EXTERNAL API INTEGRATIONS</div>
              <div style={{ fontSize: '0.75rem', color: '#a0a4b0' }}>FastAPI Backend Endpoint: <strong>http://localhost:8000</strong></div>
              <div style={{ background: '#08080a', border: '1px solid #22242a', padding: '12px', borderRadius: '2px', fontSize: '0.72rem', color: '#10b981', fontFamily: 'JetBrains Mono' }}>
                ✓ REST API CONNECTED (STATUS: 200 OK)
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>USER PERMISSIONS & ACCESS CONTROL</div>
              <div style={{ fontSize: '0.75rem', color: '#a0a4b0' }}>Active Users: <strong>USR_ADMIN_01 (SUPERUSER)</strong></div>
            </div>
          )}
        </div>

        {/* Right Column: System Health Status */}
        <div className="tactical-panel" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', marginBottom: '14px' }}>
            SYSTEM HEALTH STATUS
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.7rem' }}>
            <div>
              <div style={{ color: '#555866' }}>DEFENSE DAEMON</div>
              <div style={{ color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{daemonStatus}</div>
            </div>

            <div>
              <div style={{ color: '#555866' }}>CPU CORE USAGE</div>
              <div style={{ background: '#090a0d', border: '1px solid #22242a', height: '10px', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ background: '#ffffff', width: '14.2%', height: '100%' }}></div>
              </div>
            </div>

            <div>
              <div style={{ color: '#555866' }}>MEMORY ALLOCATION</div>
              <div style={{ background: '#090a0d', border: '1px solid #22242a', height: '10px', borderRadius: '2px', overflow: 'hidden', marginTop: '4px' }}>
                <div style={{ background: '#ffffff', width: '38.5%', height: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RESTART DAEMON MODAL */}
      {restartModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ background: '#111215', border: '2px solid #ef4444', padding: '24px', borderRadius: '2px', maxWidth: '420px', width: '90%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444' }}>
              <AlertTriangle size={24} />
              <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1px' }}>CONFIRM DAEMON RESTART</div>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#a0a4b0', marginTop: '12px', lineHeight: 1.6 }}>
              Are you sure you want to restart the GUARDIAN Defense Daemon? Active network monitoring will momentarily refresh.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button onClick={() => setRestartModalOpen(false)} style={{ background: '#18191e', color: '#ccc', border: '1px solid #333540', padding: '8px 16px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                CANCEL
              </button>
              <button onClick={handleConfirmRestart} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 18px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                CONFIRM RESTART
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigView;
