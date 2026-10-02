import React, { useState, useEffect } from 'react';
import {
  Shield, Upload, FileText, CheckCircle, AlertCircle, Play,
  Trash2, Filter, Download, ExternalLink, RefreshCw, FileUp,
  Layers, Search, Database, Cpu, ArrowRight, Activity
} from 'lucide-react';
import { uploadLogFile, loadSampleLogs, runAnalysis, getLogs, clearLogs } from '../services/api';

const ThreatsView = ({ alerts = [], incident = null, onRefreshData }) => {
  const [activeTab, setActiveTab] = useState('threats'); // 'threats' | 'upload_lab'
  const [selectedIoc, setSelectedIoc] = useState('APT29_KINETIC_PAYLOAD');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [showToast, setShowToast] = useState(null);

  // File Upload & Log Ingestion State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [ingestedLogs, setIngestedLogs] = useState([]);
  const [logFilterQuery, setLogFilterQuery] = useState('');

  // Initial fetch of logs if on upload tab
  const fetchLogsList = async () => {
    try {
      const res = await getLogs();
      if (res?.logs) {
        setIngestedLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  };

  useEffect(() => {
    fetchLogsList();
  }, []);

  // Map backend threats or fallback to IOC list
  const backendThreats = incident?.threats || [];
  const iocList = backendThreats.length > 0 ? backendThreats.map((t, idx) => ({
    id: `THREAT_${idx}_${t.attack_type.replace(/\s+/g, '_')}`,
    name: t.attack_type,
    type: t.attack_type,
    severity: (t.severity || 'HIGH').toUpperCase(),
    confidence: `${Math.round((t.confidence || 0.9) * 100)}%`,
    target: t.target || t.affected_host || '192.168.1.105 (DMZ_NODE_04)',
    mitre: t.mitre_technique || 'T1059.001 (PowerShell Execution)',
    timestamp: t.timestamp || 'RECENT',
    hex: t.hex_payload || '4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00  MZ..............\nb8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00  ........@.......\n00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................\n80 00 00 00 0e 1f ba 0e 00 b4 09 cd 21 b8 01 4c  ............!..L',
  })) : [
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

  const triggerToast = (msg) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    setSelectedFile(file);
    triggerToast(`FILE READY: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  };

  // Submit file upload to backend endpoint /api/logs/upload
  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const res = await uploadLogFile(selectedFile);
      setUploadResult(res);
      triggerToast(`SUCCESS: ${res.message || 'Logs ingested successfully'}`);
      await fetchLogsList();
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      console.error('Upload Error:', err);
      triggerToast(`UPLOAD ERROR: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Load built-in sample logs
  const handleLoadSample = async () => {
    setUploading(true);
    try {
      const res = await loadSampleLogs();
      setUploadResult(res);
      triggerToast(`SAMPLE DATA LOADED: ${res.message || 'Sample logs ingested'}`);
      await fetchLogsList();
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      triggerToast(`SAMPLE LOAD ERROR: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // Clear backend logs
  const handleClearLogs = async () => {
    try {
      await clearLogs();
      setIngestedLogs([]);
      setUploadResult(null);
      setAnalysisSummary(null);
      triggerToast('LOG DATABASE PURGED CLEAN');
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      triggerToast(`CLEAR ERROR: ${err.message}`);
    }
  };

  // Run AI Threat Analysis
  const handleRunPipeline = async () => {
    setAnalyzing(true);
    try {
      const res = await runAnalysis();
      setAnalysisSummary(res?.incident);
      triggerToast('AI THREAT PIPELINE EXECUTION COMPLETE');
      if (onRefreshData) await onRefreshData();
    } catch (err) {
      triggerToast(`ANALYSIS ERROR: ${err.response?.data?.detail || err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(iocList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "GUARDIAN_IOC_EXPORT.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast('THREAT DATA EXPORTED AS GUARDIAN_IOC_EXPORT.json');
  };

  const filteredLogs = ingestedLogs.filter((l) => {
    if (!logFilterQuery) return true;
    const q = logFilterQuery.toLowerCase();
    return (
      (l.source_ip && l.source_ip.toLowerCase().includes(q)) ||
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.host && l.host.toLowerCase().includes(q)) ||
      (l.event && l.event.toLowerCase().includes(q)) ||
      (l.severity && l.severity.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '65px', right: '24px',
          background: '#111215', border: '1px solid #10b981', color: '#10b981',
          padding: '12px 20px', borderRadius: '2px', fontSize: '0.78rem', fontWeight: 700,
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <CheckCircle size={16} />
          <span style={{ letterSpacing: '0.5px' }}>{showToast}</span>
        </div>
      )}

      {/* Top Header & Tab Navigation bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#090a0d', border: '1px solid #22242a', padding: '12px 16px', borderRadius: '2px'
      }}>
        {/* Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('threats')}
            style={{
              background: activeTab === 'threats' ? 'rgba(255, 68, 34, 0.15)' : 'transparent',
              color: activeTab === 'threats' ? '#ff4422' : '#888888',
              border: activeTab === 'threats' ? '1px solid #ff4422' : '1px solid #22242a',
              fontSize: '0.72rem', fontWeight: 800, padding: '8px 16px', borderRadius: '2px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px'
            }}
          >
            <Shield size={15} />
            <span>ACTIVE THREAT FEED ({iocList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_lab')}
            style={{
              background: activeTab === 'upload_lab' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
              color: activeTab === 'upload_lab' ? '#00e5ff' : '#888888',
              border: activeTab === 'upload_lab' ? '1px solid #00e5ff' : '1px solid #22242a',
              fontSize: '0.72rem', fontWeight: 800, padding: '8px 16px', borderRadius: '2px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '1px',
              position: 'relative'
            }}
          >
            <FileUp size={15} />
            <span>LOG INGESTION & THREAT UPLOADER</span>
            {ingestedLogs.length > 0 && (
              <span style={{
                background: '#00e5ff', color: '#000', fontSize: '0.6rem', fontWeight: 900,
                padding: '2px 6px', borderRadius: '10px', marginLeft: '4px'
              }}>
                {ingestedLogs.length} LOGS
              </span>
            )}
          </button>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeTab === 'threats' && (
            <>
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
                    padding: '6px 12px',
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
                  fontSize: '0.65rem', fontWeight: 700, padding: '6px 12px', borderRadius: '2px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                }}
              >
                <Download size={12} />
                <span>EXPORT_DATA</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('upload_lab')}
            style={{
              background: '#00e5ff', color: '#000000', border: 'none',
              fontSize: '0.7rem', fontWeight: 800, padding: '7px 14px', borderRadius: '2px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
            }}
          >
            <Upload size={14} />
            <span>+ UPLOAD LOG FILE</span>
          </button>
        </div>
      </div>

      {/* ────────────────── TAB 1: ACTIVE THREAT FEED (IOCs) ────────────────── */}
      {activeTab === 'threats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px' }}>
          {/* Left Column: Active Threat Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#555866', letterSpacing: '1px', marginBottom: '4px' }}>
              IDENTIFIED THREAT VECTORS ({filteredList.length})
            </div>

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
                    transition: 'all 0.15s ease'
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

            {/* Quick Upload Banner in Threat list */}
            <div
              onClick={() => setActiveTab('upload_lab')}
              style={{
                background: '#090a0d', border: '1px dashed #00e5ff',
                padding: '14px', borderRadius: '2px', cursor: 'pointer',
                textAlign: 'center', marginTop: '8px'
              }}
            >
              <FileUp size={20} color="#00e5ff" style={{ margin: '0 auto 6px auto', display: 'block' }} />
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#00e5ff', letterSpacing: '1px' }}>
                HAVE A CUSTOM LOG FILE?
              </div>
              <div style={{ fontSize: '0.65rem', color: '#888888', marginTop: '4px' }}>
                Click to open dedicated File Upload & Ingestion Lab
              </div>
            </div>
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
      )}

      {/* ────────────────── TAB 2: LOG INGESTION & THREAT FILE ANALYZER ("A SEPERATE PLACE") ────────────────── */}
      {activeTab === 'upload_lab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header Banner for Dedicated Upload Workspace */}
          <div className="tactical-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, #090a0d 0%, #111215 100%)', border: '1px solid #00e5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#00e5ff', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Cpu size={18} />
                  <span>DEDICATED LOG INGESTION & THREAT FILE ANALYZER</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#888888', marginTop: '4px' }}>
                  Upload raw security logs (.json, .csv, .log) to ingest into GUARDIAN database and trigger autonomous AI threat correlation.
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleLoadSample}
                  disabled={uploading}
                  style={{
                    background: '#18191e', color: '#ffffff', border: '1px solid #333540',
                    fontSize: '0.68rem', fontWeight: 700, padding: '8px 14px', borderRadius: '2px',
                    cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Database size={14} color="#10b981" />
                  <span>LOAD SAMPLE LOGS</span>
                </button>

                <button
                  onClick={handleClearLogs}
                  style={{
                    background: 'rgba(255,68,34,0.1)', color: '#ff4422', border: '1px solid #ff4422',
                    fontSize: '0.68rem', fontWeight: 700, padding: '8px 14px', borderRadius: '2px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Trash2 size={14} />
                  <span>CLEAR DATABASE</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Workspace Split: Upload Area vs Ingestion Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* File Drag & Drop Card */}
            <div
              className="tactical-panel"
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                padding: '24px',
                border: dragActive ? '2px dashed #00e5ff' : '1px dashed #333540',
                background: dragActive ? 'rgba(0, 229, 255, 0.05)' : '#0d0e12',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                minHeight: '220px', transition: 'all 0.2s ease', position: 'relative'
              }}
            >
              <input
                type="file"
                id="log-file-input"
                accept=".json,.csv,.log,.txt"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />

              <FileUp size={40} color={selectedFile ? '#10b981' : '#00e5ff'} style={{ marginBottom: '12px' }} />

              {selectedFile ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff' }}>{selectedFile.name}</div>
                  <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '2px' }}>
                    SIZE: {(selectedFile.size / 1024).toFixed(1)} KB | READY FOR INGESTION
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px' }}>
                    DRAG & DROP THREAT LOG FILE HERE
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#666666', marginTop: '4px' }}>
                    Supports JSON array of events, CSV, or syslog formatted files
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <label
                  htmlFor="log-file-input"
                  style={{
                    background: '#18191e', color: '#ffffff', border: '1px solid #333540',
                    fontSize: '0.7rem', fontWeight: 700, padding: '8px 16px', borderRadius: '2px',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <FileText size={14} />
                  <span>BROWSE FILES</span>
                </label>

                {selectedFile && (
                  <button
                    onClick={handleUploadSubmit}
                    disabled={uploading}
                    style={{
                      background: '#00e5ff', color: '#000000', border: 'none',
                      fontSize: '0.7rem', fontWeight: 800, padding: '8px 20px', borderRadius: '2px',
                      cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                      boxShadow: '0 0 15px rgba(0, 229, 255, 0.4)'
                    }}
                  >
                    {uploading ? <RefreshCw size={14} className="spin" /> : <Upload size={14} />}
                    <span>{uploading ? 'INGESTING...' : 'INGEST FILE TO DATABASE'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* AI Analysis Execution & Pipeline Card */}
            <div className="tactical-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#555866', letterSpacing: '1.5px', marginBottom: '10px' }}>
                  GUARDIAN AI THREAT PIPELINE EXECUTION
                </div>
                <div style={{ fontSize: '0.72rem', color: '#aaaaaa', lineHeight: 1.5 }}>
                  Once logs are ingested, run the multi-agent detection pipeline to execute Pattern Detection, MITRE ATT&CK Mapping, Attack Chain Reconstruction, and Response Plan Generation.
                </div>

                {uploadResult && (
                  <div style={{
                    marginTop: '12px', background: '#08080a', border: '1px solid #10b981',
                    padding: '10px 14px', borderRadius: '2px', fontSize: '0.72rem', color: '#10b981'
                  }}>
                    ✓ {uploadResult.message || 'Log entries ingested into database'}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '20px' }}>
                <button
                  onClick={handleRunPipeline}
                  disabled={analyzing}
                  style={{
                    width: '100%',
                    background: analyzing ? '#18191e' : 'linear-gradient(90deg, #ff4422 0%, #ff6600 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    padding: '12px',
                    borderRadius: '2px',
                    cursor: analyzing ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    letterSpacing: '1px',
                    boxShadow: analyzing ? 'none' : '0 0 20px rgba(255, 68, 34, 0.4)'
                  }}
                >
                  {analyzing ? <RefreshCw size={16} className="spin" /> : <Play size={16} />}
                  <span>{analyzing ? 'RUNNING 8-AGENT DEFENSE PIPELINE...' : 'RUN GUARDIAN AI THREAT ANALYSIS'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Summary Output Card (if available) */}
          {analysisSummary && (
            <div className="tactical-panel" style={{ padding: '20px', border: '1px solid #ff4422', background: 'rgba(255,68,34,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ff4422', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>ANALYSIS COMPLETE — DETECTED INCIDENT: {analysisSummary.title || analysisSummary.incident_id}</span>
                </div>
                <button
                  onClick={() => setActiveTab('threats')}
                  style={{ background: '#111215', color: '#fff', border: '1px solid #333', fontSize: '0.65rem', padding: '4px 10px', cursor: 'pointer' }}
                >
                  VIEW IN THREAT FEED →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '0.72rem' }}>
                <div style={{ background: '#08080a', padding: '10px', border: '1px solid #22242a' }}>
                  <div style={{ color: '#555866', fontSize: '0.62rem' }}>THREATS DETECTED</div>
                  <div style={{ color: '#ff4422', fontWeight: 800, fontSize: '1rem', marginTop: '2px' }}>
                    {analysisSummary.threats?.length || 0}
                  </div>
                </div>

                <div style={{ background: '#08080a', padding: '10px', border: '1px solid #22242a' }}>
                  <div style={{ color: '#555866', fontSize: '0.62rem' }}>MITRE TECHNIQUES</div>
                  <div style={{ color: '#00e5ff', fontWeight: 800, fontSize: '1rem', marginTop: '2px' }}>
                    {analysisSummary.mitre_mappings?.length || 0}
                  </div>
                </div>

                <div style={{ background: '#08080a', padding: '10px', border: '1px solid #22242a' }}>
                  <div style={{ color: '#555866', fontSize: '0.62rem' }}>TIMELINE EVENTS</div>
                  <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '1rem', marginTop: '2px' }}>
                    {analysisSummary.timeline?.length || 0}
                  </div>
                </div>

                <div style={{ background: '#08080a', padding: '10px', border: '1px solid #22242a' }}>
                  <div style={{ color: '#555866', fontSize: '0.62rem' }}>OPTIMAL RESPONSE PLAN</div>
                  <div style={{ color: '#10b981', fontWeight: 800, fontSize: '0.78rem', marginTop: '4px' }}>
                    {analysisSummary.final_decision?.selected_plan_name || 'Plan C: Quarantine'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ingested Log Stream Table Viewer */}
          <div className="tactical-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={16} color="#00e5ff" />
                <span>INGESTED SECURITY LOG DATABASE ({filteredLogs.length} ENTRIES)</span>
              </div>

              {/* Log Search Filter */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#666" style={{ position: 'absolute', left: '10px', top: '7px' }} />
                <input
                  type="text"
                  placeholder="Filter logs by IP, User, Event..."
                  value={logFilterQuery}
                  onChange={(e) => setLogFilterQuery(e.target.value)}
                  style={{
                    background: '#08080a', border: '1px solid #22242a', color: '#fff',
                    fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem',
                    padding: '5px 10px 5px 30px', borderRadius: '2px', width: '220px', outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto', maxHeight: '340px', border: '1px solid #22242a' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>
                <thead>
                  <tr style={{ background: '#090a0d', color: '#555866', textAlign: 'left', borderBottom: '1px solid #22242a' }}>
                    <th style={{ padding: '8px 12px' }}>TIMESTAMP</th>
                    <th style={{ padding: '8px 12px' }}>SOURCE IP</th>
                    <th style={{ padding: '8px 12px' }}>USER</th>
                    <th style={{ padding: '8px 12px' }}>HOST</th>
                    <th style={{ padding: '8px 12px' }}>EVENT / ACTION</th>
                    <th style={{ padding: '8px 12px' }}>SEVERITY</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #18191e', background: idx % 2 === 0 ? '#0b0c10' : '#08080a' }}>
                        <td style={{ padding: '8px 12px', color: '#888' }}>{log.timestamp || 'N/A'}</td>
                        <td style={{ padding: '8px 12px', color: '#00e5ff' }}>{log.source_ip || 'N/A'}</td>
                        <td style={{ padding: '8px 12px', color: '#fff' }}>{log.user || 'N/A'}</td>
                        <td style={{ padding: '8px 12px', color: '#aaa' }}>{log.host || 'N/A'}</td>
                        <td style={{ padding: '8px 12px', color: '#fff' }}>{log.event || log.action || 'LOG_ENTRY'}</td>
                        <td style={{ padding: '8px 12px' }}>
                          <span style={{
                            fontSize: '0.6rem', fontWeight: 800, padding: '2px 6px', borderRadius: '2px',
                            background: log.severity === 'critical' ? 'rgba(255,68,34,0.2)' : log.severity === 'high' ? 'rgba(255,170,0,0.2)' : 'rgba(16,185,129,0.2)',
                            color: log.severity === 'critical' ? '#ff4422' : log.severity === 'high' ? '#ffaa00' : '#10b981',
                            border: `1px solid ${log.severity === 'critical' ? '#ff4422' : log.severity === 'high' ? '#ffaa00' : '#10b981'}`
                          }}>
                            {(log.severity || 'low').toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#555866' }}>
                        No ingested logs found. Drag & drop a .json or .csv log file above or click "LOAD SAMPLE LOGS".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatsView;
