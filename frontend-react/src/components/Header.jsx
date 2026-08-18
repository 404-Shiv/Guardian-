import React, { useState, useEffect } from 'react';
import { Network } from 'lucide-react';

const Header = ({ incidentId = 'G-8829', severity = 'CRITICAL' }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="tactical-header">
      <div className="header-title-group">
        <span className="asterisk-icon">✳</span>
        <span>
          INCIDENT_ID: {incidentId} // <span className="severity-critical">{severity}</span>
        </span>
      </div>
      <div className="header-meta">
        <span>SYS_TIME: {timeStr || '07:54:20 UTC'}</span>
        <Network size={16} color="#888" />
      </div>
    </header>
  );
};

export default Header;
