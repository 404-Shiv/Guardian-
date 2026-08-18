import React, { useState } from 'react';
import { Lock, Key, Folder, AlertTriangle, Filter, RefreshCw, ShieldAlert, CheckCircle, Shield } from 'lucide-react';
import { authorizeContainer, rotateContainer, revokeContainer, updateConfig } from '../services/api';

const VaultView = () => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [strictTtl, setStrictTtl] = useState(false);
  const [ttlInterval, setTtlInterval] = useState('60 DAYS');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Confirmation Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null); // { type: 'access'|'rotate'|'revoke', container: object }
  const [statusToast, setStatusToast] = useState(null);

  // Active Containers
  const [containers, setContainers] = useState([
    {
      id: 'STRIPE_WEBHOOK_SEC',
      type: 'warning',
      tag: 'ROTATION_DUE',
      title: 'STRIPE_WEBHOOK_SEC',
      value: '••••••••••••••••••••',
      rawSecret: 'whsec_95748372615483920174829104758291',
      statusText: 'EXPIRED: 12M AGO',
      statusType: 'expired',
      isDue: true,
      isRevealed: false,
    },
    {
      id: 'DB_CREDENTIALS_MAIN',
      type: 'folder',
      tag: 'PROD_ENV',
      title: 'DB_CREDENTIALS_MAIN',
      value: '••••••••••••••••••••',
      rawSecret: 'postgres://admin:P@ssw0rd2026!@192.168.1.4:5432/guardian_db',
      statusText: 'ROTATED: 2H AGO',
      statusType: 'normal',
      isDue: false,
      isRevealed: false,
    },
    {
      id: 'AWS_ROOT_ACCESS',
      type: 'key',
      tag: 'API_KEYS',
      title: 'AWS_ROOT_ACCESS',
      value: '••••••••••••••••••••',
      rawSecret: 'AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
      statusText: 'ROTATED: 1D AGO',
      statusType: 'normal',
      isDue: false,
      isRevealed: false,
    },
    {
      id: 'WILDCARD_TLS_2024',
      type: 'key',
      tag: 'CERTIFICATES',
      title: 'WILDCARD_TLS_2024',
      value: '••••••••••••••••••••',
      rawSecret: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAL0...\n-----END CERTIFICATE-----',
      statusText: 'VALID: 180 DAYS',
      statusType: 'normal',
      isDue: false,
      isRevealed: false,
    },
  ]);

  const [accessLogs, setAccessLogs] = useState([
    { time: '14:02:11 UTC', user: 'USR_ADMIN_01', action: 'READ: DB_CREDENTIALS_MAIN', detail: 'IP: 192.168.1.104 (AUTHORIZED)', isHighlight: false },
    { time: '13:45:00 UTC', user: 'SYSTEM_CRON', action: 'ROTATED: API_KEYS', detail: 'SUCCESS: NEW KEY DEPLOYED', isHighlight: true },
    { time: '11:20:05 UTC', user: 'SVC_BACKEND_APP', action: 'READ: STRIPE_WEBHOOK_SEC', detail: 'IP: 10.0.0.15 (INTERNAL)', isHighlight: false },
    { time: '09:15:22 UTC', user: 'USR_DEV_04', action: 'READ: CERTIFICATES', detail: 'IP: 172.16.0.44 (VPN)', isHighlight: false },
  ]);

  // Open confirmation modal
  const promptConfirmation = (type, container) => {
    setModalAction({ type, container });
    setModalOpen(true);
  };

  // Confirm and execute action: COMPLETELY REMOVE container from list upon execution/rotation/revocation
  const handleConfirmAction = async () => {
    if (!modalAction) return;

    const { type, container } = modalAction;
    const timeStr = new Date().toISOString().substring(11, 19) + ' UTC';

    try {
      if (type === 'access') {
        await authorizeContainer(container.id);
        setContainers((prev) =>
          prev.map((c) =>
            c.id === container.id
              ? { ...c, isRevealed: true, value: c.rawSecret, statusText: 'ACCESS AUTHORIZED (REVEALED)', statusType: 'active' }
              : c
          )
        );
        setAccessLogs((prev) => [
          { time: timeStr, user: 'USR_ADMIN_01', action: `ACCESS_GRANTED: ${container.title}`, detail: 'IP: 127.0.0.1 (OPERATOR AUTHORIZED)', isHighlight: true },
          ...prev,
        ]);
        setStatusToast(`ACCESS AUTHORIZED FOR ${container.title}`);
      } else if (type === 'rotate') {
        await rotateContainer(container.id);

        // COMPLETELY REMOVE CONTAINER FROM ENCRYPTED CONTAINERS LIST
        setContainers((prev) => prev.filter((c) => c.id !== container.id));

        setAccessLogs((prev) => [
          { time: timeStr, user: 'SYSTEM_ADMIN', action: `EXECUTED_&_REMOVED: ${container.title}`, detail: 'SUCCESS: CONTAINER EXECUTED AND REMOVED FROM VAULT', isHighlight: true },
          ...prev,
        ]);
        setStatusToast(`CONTAINER EXECUTED AND REMOVED: ${container.title}`);
      } else if (type === 'revoke') {
        await revokeContainer(container.id);

        // COMPLETELY REMOVE CONTAINER FROM ENCRYPTED CONTAINERS LIST
        setContainers((prev) => prev.filter((c) => c.id !== container.id));

        setAccessLogs((prev) => [
          { time: timeStr, user: 'USR_ADMIN_01', action: `STOPPED_&_REMOVED: ${container.title}`, detail: 'SUCCESS: CONTAINER ACCESS STOPPED AND REMOVED FROM VAULT', isHighlight: true },
          ...prev,
        ]);
        setStatusToast(`CONTAINER ACCESS STOPPED AND REMOVED: ${container.title}`);
      }
    } catch (err) {
      setStatusToast(`ACTION EXECUTED FOR ${container.title}`);
    } finally {
      setModalOpen(false);
      setModalAction(null);
      setTimeout(() => setStatusToast(null), 4000);
    }
  };

  const handleApplyPolicies = async () => {
    await updateConfig({ autoRotate, strictTtl, ttlInterval });
    setStatusToast('ROTATION POLICIES UPDATED SUCCESSFULLY');
    setTimeout(() => setStatusToast(null), 3000);
  };

  // Filter Active Container list dynamically by Category
  const filteredContainers = containers.filter((c) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'ROTATION_DUE') return c.isDue;
    return c.tag === activeCategory;
  });

  const dueCount = containers.filter((c) => c.isDue).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      {/* Toast Notification */}
      {statusToast && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '20px',
          background: '#111215',
          border: '1px solid #10b981',
          color: '#10b981',
          padding: '12px 20px',
          borderRadius: '2px',
          fontSize: '0.78rem',
          fontWeight: 700,
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <CheckCircle size={16} />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Top Card: AUTHENTICATION STATUS */}
      <div className="tactical-panel" style={{ padding: '16px 20px', background: '#111215', borderColor: '#22242a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', background: '#10b981', borderRadius: '2px', boxShadow: '0 0 10px #10b981' }}></div>
            <div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1.5px', fontWeight: 700 }}>
                AUTHENTICATION STATUS
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', marginTop: '2px' }}>
                SECURE_CHANNEL_ESTABLISHED<span className="blinking-cursor"></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '32px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            <div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '1px' }}>PROTOCOLS</div>
              <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>AES-256-GCM / RSA-4096</div>
            </div>
            <div>
              <div style={{ fontSize: '0.62rem', letterSpacing: '1px' }}>SESSION EXPIRY</div>
              <div style={{ color: '#ffffff', fontWeight: 700, marginTop: '2px' }}>00:45:12</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px' }}>
        {/* Left Column: ENCRYPTED CONTAINERS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1.5px', color: '#ffffff' }}>
              ENCRYPTED CONTAINERS ({containers.length} ACTIVE {dueCount > 0 ? `| ${dueCount} DUE` : '| ALL SECURED'})
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {[
              { id: 'ALL', label: `ALL (${containers.length})` },
              { id: 'ROTATION_DUE', label: `ROTATION_DUE (${dueCount})`, isWarning: dueCount > 0 },
              { id: 'PROD_ENV', label: 'PROD_ENV' },
              { id: 'API_KEYS', label: 'API_KEYS' },
              { id: 'CERTIFICATES', label: 'CERTIFICATES' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  background: activeCategory === cat.id ? (cat.isWarning ? '#ff4422' : '#ffffff') : '#111215',
                  color: activeCategory === cat.id ? '#000000' : (cat.isWarning ? '#ff4422' : '#888888'),
                  border: cat.isWarning ? '1px solid #ff4422' : '1px solid #22242a',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Active Encrypted Containers Grid */}
          {filteredContainers.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {filteredContainers.map((item) => {
                const isStopped = item.statusType === 'stopped';
                return (
                  <div
                    key={item.id}
                    style={{
                      background: item.isDue ? 'rgba(255, 68, 34, 0.04)' : isStopped ? 'rgba(239, 68, 68, 0.04)' : '#111215',
                      border: item.isDue ? '2px solid #ff4422' : isStopped ? '1px solid #ef4444' : '1px solid #22242a',
                      borderRadius: '2px',
                      padding: '16px',
                      boxShadow: item.isDue ? '0 0 15px rgba(255, 68, 34, 0.3)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.isDue ? (
                        <AlertTriangle size={18} color="#ff4422" />
                      ) : item.type === 'folder' ? (
                        <Folder size={18} color="#aaaaaa" />
                      ) : (
                        <Key size={18} color="#aaaaaa" />
                      )}

                      <span
                        className={`badge-tag ${item.isDue ? 'critical' : ''}`}
                        style={{
                          background: item.isDue ? 'rgba(255, 68, 34, 0.15)' : '#18191e',
                          color: item.isDue ? '#ff4422' : isStopped ? '#ef4444' : '#888888',
                          borderColor: item.isDue ? '#ff4422' : '#333540',
                        }}
                      >
                        {isStopped ? 'REVOKED' : item.tag}
                      </span>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ffffff', letterSpacing: '0.5px' }}>
                        {item.title}
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        color: item.isRevealed ? '#00e5ff' : '#555866',
                        marginTop: '6px',
                        wordBreak: 'break-all',
                        fontFamily: 'JetBrains Mono',
                      }}>
                        {item.value}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1a1c22', paddingTop: '10px' }}>
                      <span style={{
                        fontSize: '0.62rem',
                        color: item.isDue ? '#ff4422' : isStopped ? '#ef4444' : item.isRevealed ? '#00e5ff' : 'var(--text-muted)',
                        fontWeight: (item.isDue || isStopped || item.isRevealed) ? 700 : 400,
                      }}>
                        {item.statusText}
                      </span>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {!item.isRevealed ? (
                          <button
                            onClick={() => promptConfirmation('access', item)}
                            style={{
                              background: '#18191e',
                              color: '#cccccc',
                              border: '1px solid #333540',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '2px',
                              cursor: 'pointer',
                            }}
                          >
                            ACCESS
                          </button>
                        ) : (
                          <button
                            onClick={() => promptConfirmation('revoke', item)}
                            style={{
                              background: '#18191e',
                              color: '#ef4444',
                              border: '1px solid #ef4444',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: '2px',
                              cursor: 'pointer',
                            }}
                          >
                            LOCK / STOP
                          </button>
                        )}

                        <button
                          onClick={() => promptConfirmation('rotate', item)}
                          style={{
                            background: item.isDue ? '#ff4422' : '#18191e',
                            color: item.isDue ? '#ffffff' : '#cccccc',
                            border: item.isDue ? '1px solid #ff4422' : '1px solid #333540',
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            borderRadius: '2px',
                            cursor: 'pointer',
                          }}
                        >
                          {item.isDue ? 'ROTATE NOW' : 'ROTATE'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: '#111215', border: '1px solid #22242a', padding: '24px', borderRadius: '2px', textAlign: 'center', color: '#888888', fontSize: '0.75rem' }}>
              ✓ ALL CONTAINERS EXECUTED & REMOVED
            </div>
          )}
        </div>

        {/* Right Column: ROTATION CONFIGURATION & ACCESS LOG */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rotation Configuration Panel */}
          <div className="tactical-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', fontWeight: 700, color: '#ffffff', letterSpacing: '1.5px', marginBottom: '16px' }}>
              <RefreshCw size={12} color="#888" />
              <span>ROTATION CONFIGURATION</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>AUTO_ROTATE_PROD</span>
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={(e) => setAutoRotate(e.target.checked)}
                  style={{ accentColor: '#ff4422', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: '#ffffff', fontWeight: 700, letterSpacing: '0.5px' }}>STRICT_TTL_ENFORCEMENT</span>
                <input
                  type="checkbox"
                  checked={strictTtl}
                  onChange={(e) => setStrictTtl(e.target.checked)}
                  style={{ accentColor: '#ff4422', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '1px' }}>
                  DEFAULT TTL INTERVAL
                </div>
                <select
                  value={ttlInterval}
                  onChange={(e) => setTtlInterval(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#090a0d',
                    border: '1px solid #333540',
                    color: '#ffffff',
                    fontFamily: 'JetBrains Mono',
                    fontSize: '0.75rem',
                    padding: '8px',
                    borderRadius: '2px',
                    outline: 'none',
                  }}
                >
                  <option value="30 DAYS">30 DAYS</option>
                  <option value="60 DAYS">60 DAYS</option>
                  <option value="90 DAYS">90 DAYS</option>
                </select>
              </div>

              <button className="btn-tactical btn-override" onClick={handleApplyPolicies} style={{ width: '100%', justifyContent: 'center', marginTop: '6px' }}>
                APPLY POLICIES
              </button>
            </div>
          </div>

          {/* Access Log Panel */}
          <div className="tactical-panel">
            <div className="panel-header">
              <span>ACCESS LOG</span>
              <Filter size={12} color="#666" />
            </div>
            <div className="panel-body" style={{ padding: '8px 12px' }}>
              {accessLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    background: log.isHighlight ? '#1c1e26' : 'transparent',
                    border: log.isHighlight ? '1px solid #333540' : 'none',
                    padding: '8px 10px',
                    marginBottom: '6px',
                    borderRadius: '2px',
                    fontSize: '0.7rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888888' }}>
                    <span>{log.time}</span>
                    <span style={{ color: '#ffffff', fontWeight: 700 }}>{log.user}</span>
                  </div>
                  <div style={{ color: log.isHighlight ? 'var(--accent-orange)' : '#ffffff', fontWeight: 700, marginTop: '2px' }}>
                    {log.action}
                  </div>
                  <div style={{ color: '#555866', fontSize: '0.62rem', marginTop: '2px' }}>
                    {log.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {modalOpen && modalAction && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#111215',
            border: modalAction.type === 'revoke' ? '2px solid #ef4444' : '2px solid #ff4422',
            borderRadius: '2px',
            padding: '24px',
            maxWidth: '480px',
            width: '90%',
            boxShadow: modalAction.type === 'revoke' ? '0 0 30px rgba(239, 68, 68, 0.4)' : '0 0 30px rgba(255, 68, 34, 0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: modalAction.type === 'revoke' ? '#ef4444' : '#ff4422' }}>
              <ShieldAlert size={24} />
              <div style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '1.5px' }}>
                CONFIRMATION AUTHORIZATION REQUIRED
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: '#ffffff', lineHeight: 1.6 }}>
              You are requesting to{' '}
              <strong style={{ color: modalAction.type === 'revoke' ? '#ef4444' : '#ff4422' }}>
                {modalAction.type === 'access' ? 'ACCESS & REVEAL' : modalAction.type === 'rotate' ? 'EXECUTE ROTATION & REMOVE FROM VAULT' : 'STOP ACCESS & REMOVE FROM VAULT'}
              </strong>{' '}
              container:
              <div style={{
                background: '#08080a',
                border: '1px solid #22242a',
                padding: '10px 14px',
                marginTop: '10px',
                marginBottom: '14px',
                fontWeight: 700,
                color: '#00e5ff',
                fontFamily: 'JetBrains Mono',
              }}>
                {modalAction.container.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a0a4b0' }}>
                Upon confirmation, this container will be executed, completely removed from the ENCRYPTED CONTAINERS list, and recorded in the immutable security audit log under user <strong>USR_ADMIN_01</strong>.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => { setModalOpen(false); setModalAction(null); }}
                style={{
                  background: '#18191e',
                  color: '#cccccc',
                  border: '1px solid #333540',
                  padding: '8px 16px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: '2px',
                }}
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmAction}
                style={{
                  background: modalAction.type === 'revoke' ? '#ef4444' : '#ffffff',
                  color: modalAction.type === 'revoke' ? '#ffffff' : '#000000',
                  border: 'none',
                  padding: '8px 20px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  borderRadius: '2px',
                  letterSpacing: '1px',
                }}
              >
                {modalAction.type === 'revoke' ? 'CONFIRM & REMOVE' : 'CONFIRM & EXECUTE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultView;
