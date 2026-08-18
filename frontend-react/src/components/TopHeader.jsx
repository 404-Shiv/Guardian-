import React, { useState, useEffect } from 'react';
import { Search, Bell, Clock, Network, UserCheck, X } from 'lucide-react';

const TopHeader = ({ title = 'GUARDIAN', activeBadge = '/ SYSTEM_ACTIVE', onNavigateToNetwork, onNavigateToThreats }) => {
  const [timeMode, setTimeMode] = useState('UTC');
  const [timeStr, setTimeStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      if (timeMode === 'UTC') {
        setTimeStr(now.toISOString().substring(11, 19) + ' UTC');
      } else {
        setTimeStr(now.toLocaleTimeString());
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timeMode]);

  const notificationsList = [
    { id: 1, type: 'CRITICAL', text: 'Brute force attack detected on DMZ_NODE_04 (IP: 192.168.1.105)', time: '2m ago' },
    { id: 2, type: 'WARNING', text: 'Vault credential STRIPE_WEBHOOK_SEC expired 12m ago', time: '12m ago' },
    { id: 3, type: 'INFO', text: 'Quantum encryption modules synchronized', time: '1h ago' },
  ];

  return (
    <header className="top-header" style={{ position: 'relative' }}>
      {/* Title & Status */}
      <div className="header-left">
        <span className="header-title">{title}</span>
        <span className="header-badge">{activeBadge}</span>
        <span className="blinking-cursor"></span>
      </div>

      {/* Controls & User Identity */}
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Live Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} color="#666666" style={{ position: 'absolute', left: '10px' }} />
          <input
            type="text"
            placeholder="QUERY_NODES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: '#090a0d',
              border: '1px solid #22242a',
              color: '#ffffff',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.72rem',
              padding: '6px 10px 6px 30px',
              borderRadius: '2px',
              width: '180px',
              outline: 'none',
            }}
          />
        </div>

        {/* Action Icon Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notification Icon */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="SYSTEM NOTIFICATIONS"
            style={{ background: 'none', border: 'none', color: showNotifications ? '#ff4422' : '#aaaaaa', cursor: 'pointer', position: 'relative', padding: '4px' }}
          >
            <Bell size={16} />
            <span style={{ position: 'absolute', top: '2px', right: '2px', width: '6px', height: '6px', background: '#ff4422', borderRadius: '50%' }}></span>
          </button>

          {/* Clock Icon */}
          <button
            onClick={() => setTimeMode(timeMode === 'UTC' ? 'LOCAL' : 'UTC')}
            title={`TOGGLE TIME FORMAT (${timeMode})`}
            style={{ background: 'none', border: 'none', color: '#aaaaaa', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Clock size={16} />
            <span style={{ fontSize: '0.72rem', fontFamily: 'JetBrains Mono', color: '#cccccc' }}>{timeStr}</span>
          </button>

          {/* Network Topology Quick Jump Icon */}
          <button
            onClick={onNavigateToNetwork}
            title="JUMP TO NETWORK TOPOLOGY"
            style={{ background: 'none', border: 'none', color: '#aaaaaa', cursor: 'pointer', padding: '4px' }}
          >
            <Network size={16} />
          </button>
        </div>

        {/* User Identity Profile Badge */}
        <div
          onClick={() => setShowAdminModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111215',
            border: '1px solid #22242a',
            padding: '4px 10px',
            borderRadius: '2px',
            cursor: 'pointer',
          }}
        >
          <UserCheck size={16} color="#10b981" />
          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.5px' }}>
            ADMIN <span style={{ color: '#555866', fontWeight: 600 }}>V2.0.4</span>
          </div>
        </div>
      </div>

      {/* Notifications Drawer Popover */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '120px',
          width: '320px',
          background: '#111215',
          border: '1px solid #ff4422',
          boxShadow: '0 0 20px rgba(255, 68, 34, 0.3)',
          borderRadius: '2px',
          padding: '12px',
          zIndex: 999,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #22242a', paddingBottom: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>SYSTEM NOTIFICATIONS</span>
            <X size={14} color="#888" style={{ cursor: 'pointer' }} onClick={() => setShowNotifications(false)} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notificationsList.map((n) => (
              <div key={n.id} style={{ background: '#08080a', borderLeft: n.type === 'CRITICAL' ? '3px solid #ff4422' : '3px solid #10b981', padding: '8px', fontSize: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: n.type === 'CRITICAL' ? '#ff4422' : '#10b981', fontWeight: 700 }}>
                  <span>{n.type}</span>
                  <span style={{ color: '#555' }}>{n.time}</span>
                </div>
                <div style={{ color: '#cccccc', marginTop: '4px' }}>{n.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin Session Modal */}
      {showAdminModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ background: '#111215', border: '1px solid #333540', padding: '20px', borderRadius: '2px', maxWidth: '380px', width: '90%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>ADMINISTRATOR SESSION</span>
              <X size={16} color="#888" style={{ cursor: 'pointer' }} onClick={() => setShowAdminModal(false)} />
            </div>

            <div style={{ fontSize: '0.75rem', color: '#a0a4b0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>USER: <strong style={{ color: '#fff' }}>OPERATOR_ADMIN_01</strong></div>
              <div>ROLE: <strong style={{ color: '#10b981' }}>SUPERUSER / THREAT COMMANDER</strong></div>
              <div>SESSION ID: <strong style={{ color: '#00e5ff' }}>SES-8839201948</strong></div>
              <div>AUTH PROTOCOL: <strong style={{ color: '#fff' }}>MFA HARDWARE KEY ACTIVE</strong></div>
            </div>

            <button
              onClick={() => setShowAdminModal(false)}
              style={{ width: '100%', background: '#18191e', border: '1px solid #333540', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '8px', marginTop: '18px', cursor: 'pointer' }}
            >
              CLOSE SESSION INFO
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopHeader;
