import React from 'react';
import { Download } from 'lucide-react';

const ReportsView = ({ incident }) => {
  const incId = incident?.id || 'G-8829';
  const summary = incident?.summary || 'Attack chain with 29 events across 6 stages. Targeted users: jsmith. Source IPs: 10.0.0.50, 192.168.1.20.';

  const reportText = `# GUARDIAN INCIDENT REPORT // ${incId}\nSTATUS: CRITICAL\nDATE: ${new Date().toISOString()}\n\n## SUMMARY\n${summary}\n\n## RECOMMENDED ACTION\nSelected Plan C: Full Quarantine + MFA\nScore: 87.6/100`;

  const handleDownload = () => {
    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GUARDIAN_REPORT_${incId}.md`;
    a.click();
  };

  return (
    <div className="tactical-panel">
      <div className="panel-header">
        <span>INCIDENT_REPORT // {incId}</span>
        <button className="btn-tactical btn-execute" onClick={handleDownload} style={{ padding: '6px 14px' }}>
          <Download size={14} /> DOWNLOAD MD
        </button>
      </div>
      <div className="panel-body" style={{ whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
        {reportText}
      </div>
    </div>
  );
};

export default ReportsView;
