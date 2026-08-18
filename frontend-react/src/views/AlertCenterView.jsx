import React from 'react';

const AlertCenterView = ({ alerts = [] }) => {
  const alertList = alerts.length > 0 ? alerts : [
    { attack_type: 'Brute Force', severity: 'high', confidence: 0.95, source_ip: '10.0.0.50', target_user: 'jsmith', target_host: 'workstation-pc-12' },
    { attack_type: 'Command Execution', severity: 'critical', confidence: 0.90, source_ip: '192.168.1.20', target_user: 'jsmith', target_host: 'workstation-pc-12' },
    { attack_type: 'Privilege Escalation', severity: 'critical', confidence: 0.95, source_ip: '192.168.1.20', target_user: 'jsmith', target_host: 'app-server-01' },
    { attack_type: 'Credential Access', severity: 'critical', confidence: 0.93, source_ip: '192.168.1.20', target_user: 'jsmith', target_host: 'app-server-01' },
    { attack_type: 'Data Exfiltration', severity: 'critical', confidence: 0.94, source_ip: '192.168.1.40', target_user: 'jsmith', target_host: 'db-server-01' },
  ];

  const getSevColor = (sev) => {
    switch (sev.toLowerCase()) {
      case 'critical': return '#ff4422';
      case 'high': return '#f59e0b';
      case 'medium': return '#00e5ff';
      default: return '#10b981';
    }
  };

  return (
    <div className="tactical-panel">
      <div className="panel-header">
        <span>ALERT_CENTER // ACTIVE_FEED</span>
      </div>
      <div className="panel-body">
        {alertList.map((alert, i) => {
          const color = getSevColor(alert.severity);
          return (
            <div
              key={i}
              style={{
                background: '#111215',
                border: '1px solid #22242a',
                borderLeft: `4px solid ${color}`,
                padding: '12px 16px',
                marginBottom: '10px',
                borderRadius: '2px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>{alert.attack_type}</span>
                <span style={{ color, textTransform: 'uppercase' }}>[{alert.severity}]</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#a0a4b0', marginTop: '6px' }}>
                CONF: {(alert.confidence * 100).toFixed(0)}% // SRC: {alert.source_ip} // TARGET: {alert.target_user || alert.target_host}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlertCenterView;
