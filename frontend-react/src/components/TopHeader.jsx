import React from 'react';
import { Search, Bell, Clock, Network, User } from 'lucide-react';

const TopHeader = ({ title = 'GUARDIAN', activeBadge = '/ SYSTEM_ACTIVE' }) => {
  return (
    <header className="top-header">
      <div className="top-header-left">
        <span>{title}</span>
        <div className="system-active-badge">
          <span>{activeBadge}</span>
          <div className="system-active-dot"></div>
        </div>
      </div>

      <div className="top-header-right">
        <div className="search-input-wrapper">
          <Search size={12} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="QUERY_NODES..."
          />
        </div>

        <div className="header-icons">
          <div className="header-icon-btn" title="Notifications">
            <Bell size={16} />
            <div className="notification-badge"></div>
          </div>
          <div className="header-icon-btn" title="System Time">
            <Clock size={16} />
          </div>
          <div className="header-icon-btn" title="Topology Hierarchy">
            <Network size={16} />
          </div>
        </div>

        <div className="admin-badge">
          <div className="admin-avatar">
            <User size={12} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800 }}>ADMIN</span>
            <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>V2.0.4</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
