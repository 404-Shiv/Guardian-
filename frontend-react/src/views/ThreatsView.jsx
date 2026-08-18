import React, { useState } from 'react';
import { AlertTriangle, Cpu, Shield, Filter, Download, ExternalLink } from 'lucide-react';

const ThreatsView = () => {
  const [selectedIoc, setSelectedIoc] = useState('APT29_KINETIC_PAYLOAD');

  const iocs = [
    {
      id: 'APT29_KINETIC_PAYLOAD',
      type: 'APT29_KINETIC_PAYLOAD',
      badge: 'CRITICAL',
      isCritical: true,
      time: '02:14:4',
      source: 'EUR_NODE',
      hash: 'E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855',
      icon: AlertTriangle,
    },
    {
      id: 'ZERO_DAY_SMB_EXPLOIT',
      type: 'ZERO_DAY_SMB_EXPLOIT',
      badge: 'ELEVATED',
      isCritical: false,
      time: '01:55:12Z',
      source: 'US_EAST_1',
      hash: 'IP: 192.168.45.221 (SPOOFED)',
      icon: Cpu,
    },
    {
      id: 'CREDENTIAL_DUMP_ATTEMPT',
      type: 'CREDENTIAL_DUMP_ATTEMPT',
      badge: 'ELEVATED',
      isCritical: false,
      time: '01:42:09Z',
      source: 'INT_DMZ',
      hash: 'USER: SYSTEM_ADMIN_SVC',
      icon: Shield,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Top Section Header matching New Image 2 */}
      <div className="threat-header-bar">
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
            GLOBAL_THREAT_FEED
          </div>
          <div className="threat-header-title">
            <span>ACTIVE_IOCs</span>
            <div className="red-dot-live"></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-tactical btn-override" style={{ padding: '8px 16px' }}>
            <Filter size={13} /> FILTER
          </button>
          <button className="btn-tactical btn-execute" style={{ padding: '8px 16px' }}>
            <Download size={13} /> EXPORT_DATA
          </button>
        </div>
      </div>

      {/* Main Grid: Left IOC List, Right Intel Profile + Hex Dump */}
      <div className="threats-grid">
        {/* Left Column: IOC List */}
        <div>
          {iocs.map((ioc) => {
            const Icon = ioc.icon;
            const isSelected = selectedIoc === ioc.id;
            return (
              <div
                key={ioc.id}
                className={`ioc-card ${ioc.isCritical ? 'critical' : 'elevated'}`}
                onClick={() => setSelectedIoc(ioc.id)}
                style={{
                  background: isSelected ? '#18191e' : 'var(--bg-card-dark)',
                  borderColor: isSelected ? '#444754' : 'var(--border-color)',
                }}
              >
                <div className="ioc-icon-box">
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div className="ioc-title-row">
                    <span>{ioc.type}</span>
                    <span className={`badge-tag ${ioc.isCritical ? 'critical' : ''}`}>
                      {ioc.badge}
                    </span>
                  </div>

                  <div className="ioc-details">
                    <div>{ioc.hash}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                      TIMESTAMP: {ioc.time} &nbsp;|&nbsp; SOURCE: {ioc.source}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Intel Profile + Hex Dump (New Image 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Actor Profile / Intel */}
          <div className="actor-profile-card">
            <div className="panel-header" style={{ margin: '-16px -16px 14px -16px', background: 'transparent', borderBottom: '1px solid var(--border-color)' }}>
              <span>ACTOR_PROFILE // INTEL</span>
              <ExternalLink size={14} color="#666" />
            </div>

            <div className="actor-profile-header">
              <div className="actor-avatar-img">
                <span style={{ fontSize: '1.6rem' }}>👤</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: '#fff' }}>COZY_BEAR (APT29)</div>
                  <span className="badge-tag critical">T1-STATE_SPONSORED</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ORIGIN: UNKNOWN // CONFIDENCE: HIGH
                </div>
              </div>
            </div>

            <div style={{ fontSize: '0.74rem', color: 'var(--text-normal)', marginTop: '12px', lineHeight: 1.6 }}>
              Advanced persistent threat group specializing in long-term intelligence gathering. Current TTPs indicate a shift towards highly customized supply-chain attacks leveraging forged SAML tokens.
            </div>

            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '16px', letterSpacing: '1px' }}>
              KNOWN_TTP_VECTORS
            </div>

            <div className="ttp-vector-grid">
              <div className="ttp-item">
                <span>T1190</span>
                <span style={{ color: '#fff' }}>PUB_FACING_APP</span>
              </div>
              <div className="ttp-item">
                <span>T1078</span>
                <span style={{ color: '#fff' }}>VALID_ACCTS</span>
              </div>
              <div className="ttp-item">
                <span>T1110</span>
                <span style={{ color: 'var(--accent-orange)' }}>BRUTE_FORCE</span>
              </div>
              <div className="ttp-item">
                <span>T1555</span>
                <span style={{ color: '#fff' }}>CRED_FROM_PWD</span>
              </div>
            </div>
          </div>

          {/* Payload Analysis / Hex Dump (New Image 2) */}
          <div className="tactical-panel">
            <div className="panel-header">
              <span>PAYLOAD_ANALYSIS // HEX_DUMP</span>
              <span style={{ width: '8px', height: '8px', background: '#ff4422', borderRadius: '1px' }}></span>
            </div>
            <div className="hex-dump-panel">
              <div>
                <span className="hex-offset">00000000</span>
                <span className="hex-bytes"><span className="hex-highlight">4D 5A</span> 90 00 03 00 00 00 04 00 00 00 FF FF 00 00</span>
                <span>MZ..............</span>
              </div>
              <div>
                <span className="hex-offset">00000010</span>
                <span className="hex-bytes">B8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00</span>
                <span>........@.......</span>
              </div>
              <div>
                <span className="hex-offset">00000020</span>
                <span className="hex-bytes">00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00</span>
                <span>................</span>
              </div>
              <div>
                <span className="hex-offset">00000030</span>
                <span className="hex-bytes">00 00 00 00 00 00 00 00 00 00 00 00 <span className="hex-highlight">80 00 00 00</span></span>
                <span>............€...</span>
              </div>
              <div>
                <span className="hex-offset">00000040</span>
                <span className="hex-bytes">0E 1F BA 0E 00 B4 09 CD 21 B8 01 4C CD 21 54 68</span>
                <span>........!...L.!Th</span>
              </div>
              <div>
                <span className="hex-offset">00000050</span>
                <span className="hex-bytes">69 73 20 70 72 6f 67 72 61 6d 20 63 61 6e 6e 6f</span>
                <span>is program canno</span>
              </div>
              <div>
                <span className="hex-offset">00000060</span>
                <span className="hex-bytes">74 20 62 65 20 72 75 6e 20 69 6e 20 44 4f 53 20</span>
                <span>t be run in DOS </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatsView;
