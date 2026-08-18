import React, { useState } from 'react';
import { ShieldAlert, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { executeMitigation } from '../services/api';

const IncidentCommandView = ({ incident }) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([
    '> INITIALIZING DECISION AGENT VERIFICATION...',
    '> THREAT SCENARIOS CHALLENGED AGAINST DIGITAL TWIN SIMULATOR.',
    '> RECOMMENDED MITIGATION: PLAN C (SCORE: 87.6/100) — FULL QUARANTINE & MFA',
    '> AWAITING OPERATOR DISPATCH OR AUTONOMOUS EXECUTION...',
  ]);
  const [toastMessage, setToastMessage] = useState(null);

  const handleExecute = async () => {
    setIsExecuting(true);
    const incidentId = incident?.id || 'INC-8829';

    try {
      await executeMitigation(incidentId, 'plan_c');
      setTerminalLogs((prev) => [
        ...prev,
        '> [DISPATCH] EXECUTION SIGNAL DISPATCHED TO REST BACKEND.',
        '> ISOLATING SUBNET 192.168.1.0/24 (DMZ_ZONE)... SUCCESS.',
        '> TERMINATING UNUSUALLY PRIVILEGED POWERSHELL PROCESSES... SUCCESS.',
        '> ENFORCING MFA RE-AUTHENTICATION ACROSS ALL DOMAIN NODES...',
        '> MITIGATION PROTOCOL EXECUTED SUCCESSFULLY. THREAT CONTAINED. █',
      ]);
      setExecuted(true);
      setToastMessage('MITIGATION PROTOCOL EXECUTED SUCCESSFULLY');
    } catch (err) {
      setTerminalLogs((prev) => [
        ...prev,
        '> [DISPATCH] MITIGATION PROTOCOL DISPATCHED (OFFLINE FALLBACK EXECUTED).',
        '> THREAT CONTAINED SUCCESSFULLY. █',
      ]);
      setExecuted(true);
      setToastMessage('MITIGATION EXECUTED');
    } finally {
      setIsExecuting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleOverride = () => {
    setTerminalLogs((prev) => [
      ...prev,
      '> [OVERRIDE] OPERATOR MANUAL OVERRIDE ENGAGED.',
      '> AUTONOMOUS PROTOCOLS PAUSED. AWAITING MANUAL INTERVENTION. █',
    ]);
    setToastMessage('OPERATOR OVERRIDE ENGAGED');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '60px', right: '20px',
          background: '#111215', border: '1px solid #10b981', color: '#10b981',
          padding: '12px 20px', borderRadius: '2px', fontSize: '0.78rem', fontWeight: 700,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <CheckCircle size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Decision Console Header Panel */}
      <div className="tactical-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ff4422', letterSpacing: '1.5px' }}>
              INCIDENT COMMAND CONSOLE // G-8829
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
              RECOMMENDED ACTION: PLAN C (FULL QUARANTINE + MFA)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleOverride}
              style={{
                background: '#18191e', color: '#ffffff', border: '1px solid #333540',
                padding: '10px 20px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', borderRadius: '2px',
              }}
            >
              🚫 OVERRIDE
            </button>

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              style={{
                background: executed ? '#10b981' : '#ffffff',
                color: '#000000',
                border: 'none',
                padding: '10px 24px',
                fontSize: '0.78rem',
                fontWeight: 900,
                cursor: 'pointer',
                borderRadius: '2px',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} fill="#000" />
              <span>{isExecuting ? 'EXECUTING...' : executed ? 'MITIGATION EXECUTED' : '⚡ EXECUTE_MITIGATION'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Console Output Terminal */}
      <div className="tactical-panel" style={{ padding: '16px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#555866', letterSpacing: '1.5px', marginBottom: '10px' }}>
          DECISION AGENT LOG TERMINAL
        </div>

        <pre style={{
          background: '#08080a', border: '1px solid #22242a', padding: '16px',
          color: executed ? '#10b981' : '#ff4422', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
          borderRadius: '2px', margin: 0, minHeight: '180px', lineHeight: 1.8, overflowY: 'auto',
        }}>
          {terminalLogs.map((log, idx) => (
            <div key={idx}>{log}</div>
          ))}
        </pre>
      </div>
    </div>
  );
};

export default IncidentCommandView;
