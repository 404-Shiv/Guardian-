import React from 'react';
import { LayoutGrid, Network, Shield, Lock, Settings, Power } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutGrid },
    { id: 'network', label: 'NETWORK', icon: Network },
    { id: 'threats', label: 'THREATS', icon: Shield },
    { id: 'vault', label: 'VAULT', icon: Lock },
    { id: 'config', label: 'CONFIG', icon: Settings },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveView(item.id)}
            >
              <Icon size={18} />
              <span className="nav-item-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-logout">
        <button className="nav-item" title="LOGOUT">
          <Power size={18} />
          <span className="nav-item-label">LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
