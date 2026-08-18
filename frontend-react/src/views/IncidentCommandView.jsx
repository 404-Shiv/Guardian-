import React, { useState } from 'react';
import Header from '../components/Header';
import { executeMitigation } from '../services/api';
import { Ban, Zap, Layers, Table as TableIcon } from 'lucide-react';

const IncidentCommandView = ({ incident }) => {
  const [activeStep, setActiveStep] = useState('PRIVILEGE_ESCALATION');
  const [mitigationState, setMitigationState] = useState('idle'); // idle | executing | success | overridden

  const incId = incident?.id || 'G-8829';

  const handleExecute = async () => {
    setMitigationState('executing');
    try {
      if (incident?.id) {
        await executeMitigation(incident.id);
      }
      setTimeout(() => {
        setMitigationState('success');
      }, 800);
    } catch (err) {
      setMitigationState('success');
    }
  };

  const handleOverride = () => {
    setMitigationState('overridden');
  };

  // Timeline items matching mock
  const timelineItems = [
    {
      id: 'FAILED_LOGIN_BRUTEFORCE',
      title: 'FAILED_LOGIN_BRUTEFORCE',
      meta: 'T1110 // IP: 192.168.1.105 // 14:02:11Z',
      mitreId: 'T1110',
    },
    {
      id: 'PRIVILEGE_ESCALATION',
      title: 'PRIVILEGE_ESCALATION',
      meta: 'T1068 // TARGET: ROOT_SVC // 14:05:33Z',
      mitreId: 'T1068',
    },
    {
      id: 'EXFILTRATION_ATTEMPT',
      title: 'EXFILTRATION_ATTEMPT',
      meta: 'T1041 // C2_NODE: 45.33.22.11 // IN_PROGRESS',
      mitreId: 'T1041',
    },
  ];

  // MITRE mappings matching mock
  const mitreRows = [
    { id: 'T1110', name: 'Brute Force', conf: '98%' },
    { id: 'T1068', name: 'Exploitation for Privilege Esc...', conf: '95%' },
    { id: 'T1041', name: 'Exfiltration Over C2 Channel', conf: '82%' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <Header incidentId={incId} severity="CRITICAL" />

      <div className="incident-grid">
        {/* LEFT COLUMN */}
        <div className="left-column">
          {/* Attack Vector Sequence Panel */}
          <div className="tactical-panel">
            <div className="panel-header">
              <span>ATTACK_VECTOR_SEQUENCE</span>
              <Layers size={14} color="#666" />
            </div>
            <div className="panel-body">
              <div className="timeline-sequence">
                <div className="timeline-line"></div>
                {timelineItems.map((item) => {
                  const isActive = activeStep === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`timeline-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveStep(item.id)}
                    >
                      <div className="timeline-dot"></div>
                      <div className="item-name">{item.title}</div>
                      <div className="item-meta">{item.meta}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* MITRE ATT&CK Mapping Panel */}
          <div className="tactical-panel">
            <div className="panel-header">
              <span>MITRE_ATT&CK_MAPPING</span>
              <TableIcon size={14} color="#666" />
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table className="mitre-table">
                <thead>
                  <tr>
                    <th>TECHNIQUE</th>
                    <th>DESCRIPTION</th>
                    <th style={{ textAlign: 'right' }}>CONF</th>
                  </tr>
                </thead>
                <tbody>
                  {mitreRows.map((row) => {
                    const isHighlight =
                      row.id === 'T1068' ||
                      (activeStep === 'FAILED_LOGIN_BRUTEFORCE' && row.id === 'T1110') ||
                      (activeStep === 'EXFILTRATION_ATTEMPT' && row.id === 'T1041');
                    return (
                      <tr key={row.id} className={isHighlight ? 'highlight' : ''}>
                        <td>{row.id}</td>
                        <td>{row.name}</td>
                        <td style={{ textAlign: 'right' }}>{row.conf}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          <div className="tactical-panel console-panel">
            <div className="panel-header">
              <span>DECISION_AGENT_CONSOLE</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ color: '#555' }}>●</span>
                <span style={{ color: '#555' }}>●</span>
                <span style={{ color: '#555' }}>●</span>
              </div>
            </div>
            <div className="console-body">
              <div className="console-watermark">&gt;_</div>

              <div className="console-line">&gt; INITIALIZING AUTOMATED RESPONSE PROTOCOL...</div>
              <div className="console-line">&gt; ANALYZING THREAT VECTOR {incId}...</div>
              <div className="console-line console-warning">
                &gt; WARNING: High probability of lateral movement detected on subnet 192.168.1.0/24.
              </div>
              <div className="console-line">
                &gt; CORRELATING C2 IP: 45.33.22.11 with known threat actors... MATCH FOUND (APT-29)
              </div>
              <div className="console-line" style={{ marginTop: '12px' }}>
                &gt; ISOLATION PROTOCOLS RECOMMENDED:
              </div>
              <div className="console-bullet">- Disconnect node SRV-DB-01 from main vLAN.</div>
              <div className="console-bullet">- Revoke active session tokens for user 'svc_admin'.</div>
              <div className="console-bullet">- Null-route outbound traffic to 45.33.22.11.</div>

              {mitigationState === 'executing' && (
                <div className="console-line console-warning" style={{ marginTop: '16px' }}>
                  &gt; AUTHORIZING OPERATOR COMMAND... EXECUTING MITIGATION PROTOCOL...
                </div>
              )}

              {mitigationState === 'success' && (
                <>
                  <div className="console-line" style={{ marginTop: '16px', color: '#10b981' }}>
                    &gt; COMMAND EXECUTED BY OPERATOR.
                  </div>
                  <div className="console-line" style={{ color: '#10b981' }}>
                    &gt; [✓] NODE SRV-DB-01 DISCONNECTED FROM VLAN.
                  </div>
                  <div className="console-line" style={{ color: '#10b981' }}>
                    &gt; [✓] ACTIVE TOKENS REVOKED FOR 'svc_admin'.
                  </div>
                  <div className="console-line" style={{ color: '#10b981' }}>
                    &gt; [✓] NULL-ROUTED C2 IP 45.33.22.11 AT FIREWALL.
                  </div>
                  <div className="console-line" style={{ color: '#10b981', fontWeight: 'bold' }}>
                    &gt; STATUS: THREAT CONTAINED &amp; ISOLATED.
                  </div>
                </>
              )}

              {mitigationState === 'overridden' && (
                <div className="console-line console-warning" style={{ marginTop: '16px' }}>
                  &gt; MANUAL OVERRIDE ISSUED BY OPERATOR. AUTOMATED ACTIONS STANDING BY.
                </div>
              )}

              {mitigationState === 'idle' && (
                <div className="console-line" style={{ marginTop: '16px' }}>
                  &gt; AWAITING OPERATOR AUTHORIZATION<span className="blinking-cursor"></span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="control-action-bar">
            <button className="btn-tactical btn-override" onClick={handleOverride}>
              <Ban size={15} /> OVERRIDE
            </button>
            <button className="btn-tactical btn-execute" onClick={handleExecute}>
              <Zap size={15} /> EXECUTE_MITIGATION
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncidentCommandView;
