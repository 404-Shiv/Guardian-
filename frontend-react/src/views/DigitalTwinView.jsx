import React from 'react';

const DigitalTwinView = ({ incident }) => {
  const impacts = incident?.impact_simulations || [
    { action: 'Block IP', security_score_delta: 25, users_affected: 0, downtime_minutes: 0, risk_reduction_pct: 30, side_effects: 'May block shared IP' },
    { action: 'Disable Account', security_score_delta: 35, users_affected: 1, downtime_minutes: 5, risk_reduction_pct: 45, side_effects: 'User loses all AD access' },
    { action: 'Quarantine Host', security_score_delta: 40, users_affected: 3, downtime_minutes: 30, risk_reduction_pct: 60, side_effects: 'Host isolated from network' },
    { action: 'Isolate Server', security_score_delta: 45, users_affected: 50, downtime_minutes: 60, risk_reduction_pct: 70, side_effects: 'Application server outage' },
  ];

  return (
    <div className="tactical-panel">
      <div className="panel-header">
        <span>DIGITAL_TWIN // RESPONSE_IMPACT_SIMULATOR</span>
      </div>
      <div className="panel-body">
        <table className="mitre-table">
          <thead>
            <tr>
              <th>RESPONSE ACTION</th>
              <th>SECURITY DELTA</th>
              <th>USERS AFFECTED</th>
              <th>DOWNTIME</th>
              <th>RISK REDUCTION</th>
              <th>SIDE EFFECTS</th>
            </tr>
          </thead>
          <tbody>
            {impacts.map((imp, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 'bold', color: '#00e5ff' }}>{imp.action}</td>
                <td>+{imp.security_score_delta}</td>
                <td>{imp.users_affected}</td>
                <td>{imp.downtime_minutes} min</td>
                <td style={{ color: '#10b981', fontWeight: 'bold' }}>{imp.risk_reduction_pct}%</td>
                <td style={{ color: '#a0a4b0' }}>{imp.side_effects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DigitalTwinView;
