import React, { useState } from 'react';
import { AlertCircle, Filter, Download, Shield, ExternalLink, CheckCircle } from 'lucide-react';

const ThreatsView = ({ alerts = [] }) => {
  const [selectedIoc, setSelectedIoc] = useState('APT29_KINETIC_PAYLOAD');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [showToast, setShowToast] = useState(null);

  const iocList = [
    {
      id: 'APT29_KINETIC_PAYLOAD',
      name: 'APT29_KINETIC_PAYLOAD',
      type: 'COMMAND_EXECUTION',
      severity: 'CRITICAL',
      confidence: '95%',
      target: '192.168.1.105 (DMZ_NODE_04)',
      mitre: 'T1059.001 (PowerShell)',
      timestamp: '14:02:11 UTC',
      hex: '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............\nb8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......\n00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................\n80 00 00 00 0e 1f ba 0e 00 b4 09 cd 21 b8 01 4c  ............!..L',
    },
    {
      id: 'ZERO_DAY_SMB_EXPLOIT',
      name: 'ZERO_DAY_SMB_EXPLOIT',
      type: 'PRIVILEGE_ESCALATION',
      severity: 'CRITICAL',
      confidence: '95%',
      target: '10.0.0.1 (CORE_ROUTER_01)',
      mitre: 'T1068 (Privilege Escalation)',
      timestamp: '13:58:44 UTC',
      hex: 'fe 53 4d 42 40 00 00 00 00 00 00 00 01 00 00 00  .SMB@...........\n00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................\n05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................',
    },
    {
      id: 'LSASS_CREDENTIAL_DUMP',
      name: 'LSASS_CREDENTIAL_DUMP',
      type: 'CREDENTIAL_ACCESS',
      severity: 'HIGH',
      confidence: '93%',
      target: '192.168.1.4 (DB_CLUSTER_A)',
      mitre: 'T1003 (OS Credential Dumping)',
      timestamp: '13:45:02 UTC',
      hex: '33 43 52 45 44 53 00 00 12 40 00 00 ff 00 00 00  3CREDS...@......\n90 90 90 90 31 c0 50 68 2f 2f 73 68 68 2f 62 69  ....1.Ph//shh/bi',
    },
  ];

  const currentIoc = iocList.find((i) => i.id === selectedIoc) || iocList[0];

  const filteredList = iocList.filter((item) => {
    if (filterSeverity === 'ALL') return true;
    return item.severity === filterSeverity;
  });

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(iocList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "GUARDIAN_IOC_EXPORT.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setShowToast('THREAT DATA EXPORTED AS GUARDIAN_IOC_EXPORT.json');
    setTimeout(() => setShowToast(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '60px', right: '20px',
          background: '#111215', border: '1px solid #10b981', color: '#10b981',
          padding: '12px 20px', borderRadius: '2px', fontSize: '0.78rem', fontWeight: 700,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <CheckCircle size={16} />
          <span>{showToast}</span>
        </div>
      )}

      {/* Top Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1.5px' }}>
          GLOBAL_THREAT_FEED // ACTIVE_IOCs <span style={{ color: '#ff4422' }}>●</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {['ALL', 'CRITICAL', 'HIGH'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              style={{
                background: filterSeverity === sev ? '#ffffff' : '#111215',
                color: filterSeverity === sev ? '#000000' : '#888888',
                border: '1px solid #333540',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              {sev}
            </button>
          ))}

          <button
            onClick={handleExport}
            style={{
              background: '#18191e', color: '#ffffff', border: '1px solid #333540',
              fontSize: '0.65rem', fontWeight: 700, padding: '4px 12px', borderRadius: '2px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
            }}
          >
            <Download size={12} />
            <span>EXPORT_DATA</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px' }}>
        {/* Left Column: Active Threat Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredList.map((ioc) => {
            const isSelected = selectedIoc === ioc.id;
            return (
              <div
                key={ioc.id}
                onClick={() => setSelectedIoc(ioc.id)}
                style={{
                  background: isSelected ? 'rgba(255, 68, 34, 0.08)' : '#111215',
                  border: isSelected ? '2px solid #ff4422' : '1px solid #22242a',
                  padding: '14px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 0 15px rgba(255, 68, 34, 0.3)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#ff4422', letterSpacing: '1px' }}>
                    {ioc.severity} ({ioc.confidence})
                  </span>
                  <span style={{ fontSize: '0.6rem', color: '#555866' }}>{ioc.timestamp}</span>
                </div>

                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', marginTop: '6px' }}>
                  {ioc.name}
                </div>

                <div style={{ fontSize: '0.68rem', color: '#888888', marginTop: '4px' }}>
                  Target: {ioc.target}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Threat Intel Profile & Hex Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Profile Card */}
          <div className="tactical-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#555866', letterSpacing: '1.5px', marginBottom: '12px' }}>
              THREAT INTEL PROFILE // {currentIoc.name}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.75rem' }}>
              <div>
                <div style={{ color: '#555866', fontSize: '0.62rem' }}>ATTACK TYPE</div>
                <div style={{ color: '#ff4422', fontWeight: 700, marginTop: '2px' }}>{currentIoc.type}</div>
              </div>
              <div>
                <div style={{ color: '#555866', fontSize: '0.62rem' }}>MITRE ATT&CK MAPPING</div>
                <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>{currentIoc.mitre}</div>
              </div>
              <div>
                <div style={{ color: '#555866', fontSize: '0.62rem' }}>CONFIDENCE RATING</div>
                <div style={{ color: '#10b981', fontWeight: 700, marginTop: '2px' }}>{currentIoc.confidence} HIGH CONFIDENCE</div>
              </div>
              <div>
                <div style={{ color: '#555866', fontSize: '0.62rem' }}>TARGETED ASSET</div>
                <div style={{ color: '#00e5ff', fontWeight: 700, marginTop: '2px' }}>{currentIoc.target}</div>
              </div>
            </div>
          </div>

          {/* Hex Dump Viewer Card */}
          <div className="tactical-panel" style={{ padding: '16px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#555866', letterSpacing: '1.5px', marginBottom: '10px' }}>
              PAYLOAD MEMORY INSPECTOR (RAW HEX DUMP)
            </div>

            <pre style={{
              background: '#08080a', border: '1px solid #22242a', padding: '14px',
              color: '#00e5ff', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.72rem',
              borderRadius: '2px', margin: 0, overflowX: 'auto', lineHeight: 1.6,
            }}>
              {currentIoc.hex}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatsView;
