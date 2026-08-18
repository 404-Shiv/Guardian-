import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import Footer from './components/Footer';
import SocDashboardView from './views/SocDashboardView';
import NetworkTopologyView from './views/NetworkTopologyView';
import ThreatsView from './views/ThreatsView';
import VaultView from './views/VaultView';
import ConfigView from './views/ConfigView';
import IncidentCommandView from './views/IncidentCommandView';
import { getIncidents, getDashboardStats, getAlerts, loadSampleLogs, runAnalysis } from './services/api';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [incident, setIncident] = useState(null);
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      await loadSampleLogs();
      const analyzeRes = await runAnalysis();
      if (analyzeRes?.incident) {
        setIncident(analyzeRes.incident);
      }

      const incData = await getIncidents();
      if (incData?.incidents?.length > 0) {
        setIncident(incData.incidents[0]);
      }

      const statsData = await getDashboardStats();
      if (statsData) setStats(statsData);

      const alertsData = await getAlerts();
      if (alertsData?.alerts) setAlerts(alertsData.alerts);
    } catch (err) {
      console.error('API Connect error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <SocDashboardView
            stats={stats}
            onNavigateToThreats={() => setActiveView('threats')}
          />
        );
      case 'network':
        return (
          <NetworkTopologyView
            onSelectAnomalousSubnet={() => setActiveView('threats')}
          />
        );
      case 'threats':
        return <ThreatsView alerts={alerts} />;
      case 'vault':
        return <VaultView incident={incident} />;
      case 'config':
        return <ConfigView />;
      case 'incident-command':
        return <IncidentCommandView incident={incident} />;
      default:
        return <SocDashboardView stats={stats} onNavigateToThreats={() => setActiveView('threats')} />;
    }
  };

  const getHeaderSub = () => {
    switch (activeView) {
      case 'dashboard': return '/ SYSTEM_ACTIVE';
      case 'vault': return '/ SECURE_VAULT_ACCESS';
      default: return `/ ${activeView.toUpperCase()}_MODE`;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="main-wrapper">
        <TopHeader
          title="GUARDIAN"
          activeBadge={getHeaderSub()}
          onNavigateToNetwork={() => setActiveView('network')}
          onNavigateToThreats={() => setActiveView('threats')}
        />
        <div className="view-container">
          {renderView()}
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;
