"""GUARDIAN — Streamlit Dashboard (Tactical SOC Theme)"""

import streamlit as st
import requests
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import json
import time
from datetime import datetime

# ═══════════════════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════════════════

API_URL = "http://localhost:8000"

st.set_page_config(
    page_title="GUARDIAN // Autonomous Cyber Defense",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ═══════════════════════════════════════════════════════════════════════════
# TACTICAL DARK THEME CSS (Exact Match to Design Mock)
# ═══════════════════════════════════════════════════════════════════════════

st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Share+Tech+Mono&display=swap');

    /* ── Root Color Palette ── */
    :root {
        --bg-main: #0b0c0e;
        --bg-panel: #111215;
        --bg-panel-header: #16171b;
        --bg-console: #08080a;
        --border-color: #23252b;
        --border-glow: #343742;
        --text-bright: #eeeeee;
        --text-normal: #a0a4b0;
        --text-muted: #5a5e6b;
        --accent-orange: #ff4422;
        --accent-amber: #f59e0b;
        --accent-cyan: #00e5ff;
        --accent-green: #10b981;
        --glow-orange: 0 0 15px rgba(255, 68, 34, 0.4);
    }

    /* ── Global Styles ── */
    .stApp {
        background: var(--bg-main) !important;
        color: var(--text-bright) !important;
        font-family: 'JetBrains Mono', 'Share Tech Mono', monospace !important;
    }

    .main .block-container {
        padding: 1rem 1.5rem !important;
        max-width: 100% !important;
    }

    /* ── Sidebar Styling ── */
    [data-testid="stSidebar"] {
        background: #0d0e11 !important;
        border-right: 1px solid var(--border-color) !important;
    }

    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] p,
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] h1,
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] h2,
    [data-testid="stSidebar"] [data-testid="stMarkdownContainer"] h3 {
        color: var(--text-bright) !important;
        font-family: 'JetBrains Mono', monospace !important;
    }

    [data-testid="stSidebar"] .stRadio label {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.85rem !important;
        color: var(--text-normal) !important;
        text-transform: uppercase !important;
        letter-spacing: 0.5px !important;
    }

    /* ── Tactical Header Bar ── */
    .tactical-header {
        background: var(--bg-panel);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 12px 20px;
        margin-bottom: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: 'JetBrains Mono', monospace;
    }

    .tactical-header-title {
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-bright);
        display: flex;
        align-items: center;
        gap: 10px;
        letter-spacing: 1px;
    }

    .tactical-header-title .asterisk {
        color: var(--accent-orange);
        font-size: 1.3rem;
    }

    .tactical-header-title .critical-badge {
        color: var(--accent-orange);
        font-weight: 800;
    }

    .tactical-header-time {
        font-size: 0.85rem;
        color: var(--text-muted);
        letter-spacing: 1px;
    }

    /* ── Panel Box Styling ── */
    .tactical-panel {
        background: var(--bg-panel);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        margin-bottom: 16px;
        overflow: hidden;
    }

    .tactical-panel-header {
        background: var(--bg-panel-header);
        border-bottom: 1px solid var(--border-color);
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.8rem;
        font-weight: 700;
        letter-spacing: 1.5px;
        color: var(--text-bright);
        text-transform: uppercase;
    }

    .tactical-panel-body {
        padding: 16px;
    }

    /* ── Timeline Sequence ── */
    .timeline-container {
        position: relative;
        padding-left: 24px;
        margin: 8px 0;
    }

    .timeline-container::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 10px;
        bottom: 10px;
        width: 2px;
        background: #252830;
    }

    .timeline-step {
        position: relative;
        margin-bottom: 20px;
        padding: 10px 14px;
        border-radius: 4px;
        border: 1px solid transparent;
        background: transparent;
        transition: all 0.2s ease;
    }

    .timeline-step::before {
        content: '';
        position: absolute;
        left: -22px;
        top: 16px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #1e2128;
        border: 2px solid #3a3f4d;
    }

    .timeline-step.active {
        border: 1px solid var(--accent-orange);
        background: rgba(255, 68, 34, 0.05);
        box-shadow: var(--glow-orange);
    }

    .timeline-step.active::before {
        background: var(--accent-orange);
        border-color: var(--accent-orange);
        box-shadow: 0 0 10px var(--accent-orange);
    }

    .step-title {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-bright);
        letter-spacing: 1px;
    }

    .timeline-step.active .step-title {
        color: var(--accent-orange);
    }

    .step-meta {
        font-size: 0.75rem;
        color: var(--text-normal);
        margin-top: 4px;
        letter-spacing: 0.5px;
    }

    /* ── Terminal Console ── */
    .console-box {
        background: var(--bg-console);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 20px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.85rem;
        line-height: 1.8;
        color: #d1d5db;
        min-height: 480px;
        position: relative;
        white-space: pre-wrap;
    }

    .console-watermark {
        position: absolute;
        top: 15px;
        right: 20px;
        font-size: 4rem;
        font-weight: 900;
        color: rgba(255, 255, 255, 0.03);
        user-select: none;
        pointer-events: none;
    }

    .console-line-warning {
        color: var(--accent-orange);
        font-weight: 600;
    }

    .console-line-dim {
        color: var(--text-muted);
    }

    .console-cursor {
        display: inline-block;
        width: 8px;
        height: 15px;
        background: var(--text-bright);
        vertical-align: middle;
        margin-left: 4px;
        animation: blink 1s infinite;
    }

    @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
    }

    /* ── Tactical Monospace Table ── */
    .tactical-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.8rem;
    }

    .tactical-table th {
        text-align: left;
        padding: 8px 12px;
        color: var(--text-muted);
        border-bottom: 1px solid var(--border-color);
        font-weight: 600;
        letter-spacing: 1px;
    }

    .tactical-table td {
        padding: 10px 12px;
        color: var(--text-normal);
        border-bottom: 1px solid #191b22;
    }

    .tactical-table tr.highlight td {
        color: var(--accent-orange);
        font-weight: 700;
    }

    /* ── Action Buttons matching Mockup ── */
    .action-bar-container {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
    }

    .stButton > button {
        font-family: 'JetBrains Mono', monospace !important;
        font-size: 0.8rem !important;
        font-weight: 700 !important;
        letter-spacing: 1px !important;
        text-transform: uppercase !important;
        border-radius: 2px !important;
        padding: 10px 24px !important;
        transition: all 0.2s ease !important;
    }

    /* Solid White Mitigate Button */
    .btn-execute button {
        background: #ffffff !important;
        color: #000000 !important;
        border: 1px solid #ffffff !important;
    }

    .btn-execute button:hover {
        background: #e0e0e0 !important;
        box-shadow: 0 0 12px rgba(255, 255, 255, 0.4) !important;
    }

    /* Outline Override Button */
    .btn-override button {
        background: #141519 !important;
        color: #cccccc !important;
        border: 1px solid #333540 !important;
    }

    .btn-override button:hover {
        border-color: #555866 !important;
        color: #ffffff !important;
    }

    /* ── Hide Streamlit Elements ── */
    #MainMenu { visibility: hidden; }
    footer { visibility: hidden; }
    header[data-testid="stHeader"] { background: var(--bg-main) !important; }
</style>
""", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════
# API HELPERS
# ═══════════════════════════════════════════════════════════════════════════

def api_get(endpoint: str):
    """GET request to API."""
    try:
        r = requests.get(f"{API_URL}{endpoint}", timeout=10)
        r.raise_for_status()
        return r.json()
    except Exception:
        return None


def api_post(endpoint: str, **kwargs):
    """POST request to API."""
    try:
        r = requests.post(f"{API_URL}{endpoint}", timeout=30, **kwargs)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        return {"error": str(e)}


CHART_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(17,18,21,0.8)",
    font=dict(color="#eeeeee", family="JetBrains Mono, monospace"),
    margin=dict(l=30, r=20, t=30, b=30),
    legend=dict(bgcolor="rgba(0,0,0,0)"),
)

DEFAULT_AXIS = dict(gridcolor="rgba(35,37,43,0.6)", zerolinecolor="rgba(35,37,43,0.6)")


def chart_layout(**overrides):
    layout = dict(CHART_LAYOUT)
    xa = dict(DEFAULT_AXIS)
    if "xaxis" in overrides:
        xa.update(overrides.pop("xaxis"))
    layout["xaxis"] = xa
    ya = dict(DEFAULT_AXIS)
    if "yaxis" in overrides:
        ya.update(overrides.pop("yaxis"))
    layout["yaxis"] = ya
    if "legend" in overrides:
        leg = dict(layout.get("legend", {}))
        leg.update(overrides.pop("legend"))
        layout["legend"] = leg
    layout.update(overrides)
    return layout


SEVERITY_COLORS = {
    "critical": "#ff4422",
    "high": "#f59e0b",
    "medium": "#00e5ff",
    "low": "#10b981",
}

# ═══════════════════════════════════════════════════════════════════════════
# SIDEBAR
# ═══════════════════════════════════════════════════════════════════════════

with st.sidebar:
    st.markdown("""
    <div style="padding: 12px 0 16px 0; border-bottom: 1px solid var(--border-color); margin-bottom: 16px;">
        <div style="font-size: 0.7rem; color: var(--text-muted); letter-spacing: 2px;">TACTICAL DEFENSE</div>
        <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-bright); letter-spacing: 1.5px;">GUARDIAN</div>
    </div>
    """, unsafe_allow_html=True)

    page = st.radio(
        "Navigation",
        [
            "⚡ Incident Command",
            "🏠 SOC Dashboard",
            "🚨 Alert Center",
            "⏱️ Attack Timeline",
            "🗺️ Attack Map",
            "🏗️ Digital Twin",
            "📋 Response Plans",
            "📄 Reports",
        ],
        label_visibility="collapsed",
    )

    st.markdown("---")

    st.markdown("<div style='font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px;'>QUICK ACTIONS</div>", unsafe_allow_html=True)

    if st.button("📥 LOAD SAMPLE LOGS", use_container_width=True):
        with st.spinner("INJECTING LOGS..."):
            result = api_post("/api/logs/upload-sample")
            if result and "error" not in result:
                st.success(f"LOADED {result.get('logs_count', 0)} EVENTS")
                st.session_state["logs_loaded"] = True
            else:
                st.error("API OFFLINE")

    if st.button("🔍 RUN PIPELINE", use_container_width=True):
        with st.spinner("ANALYZING THREAT VECTORS..."):
            result = api_post("/api/analyze")
            if result and "error" not in result:
                st.success("ANALYSIS COMPLETE")
                st.session_state["incident"] = result.get("incident", {})
            else:
                st.error("NO LOGS INGESTED")

    if st.button("🗑️ RESET SYSTEM", use_container_width=True):
        try:
            requests.delete(f"{API_URL}/api/logs", timeout=5)
            st.session_state.clear()
            st.success("SYSTEM RESET")
        except Exception:
            st.error("FAILED")

    st.markdown("---")
    health = api_get("/api/health")
    if health:
        st.markdown("<span style='color: #10b981;'>● SYS_STATUS: ONLINE</span>", unsafe_allow_html=True)
    else:
        st.markdown("<span style='color: #ff4422;'>● SYS_STATUS: OFFLINE</span>", unsafe_allow_html=True)

# ═══════════════════════════════════════════════════════════════════════════
# PAGE: INCIDENT COMMAND (EXACT MATCH TO REFERENCE IMAGE)
# ═══════════════════════════════════════════════════════════════════════════

if page == "⚡ Incident Command":
    # Fetch latest incident or provide demo default
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []
    incident = incidents[0] if incidents else None

    inc_id = incident.get("id", "G-8829") if incident else "G-8829"
    inc_sev = "CRITICAL"
    sys_time = datetime.now().strftime("%H:%M:%S UTC")

    # Header Bar
    st.markdown(f"""
    <div class="tactical-header">
        <div class="tactical-header-title">
            <span class="asterisk">✳</span>
            <span>INCIDENT_ID: {inc_id} // <span class="critical-badge">{inc_sev}</span></span>
        </div>
        <div class="tactical-header-time">
            SYS_TIME: {sys_time} &nbsp; 🖧
        </div>
    </div>
    """, unsafe_allow_html=True)

    col_left, col_right = st.columns([42, 58])

    with col_left:
        # Panel 1: ATTACK_VECTOR_SEQUENCE
        st.markdown("""
        <div class="tactical-panel">
            <div class="tactical-panel-header">
                <span>ATTACK_VECTOR_SEQUENCE</span>
                <span style="color: var(--text-muted);">➿</span>
            </div>
            <div class="tactical-panel-body">
                <div class="timeline-container">
                    <div class="timeline-step">
                        <div class="step-title">FAILED_LOGIN_BRUTEFORCE</div>
                        <div class="step-meta">T1110 // IP: 192.168.1.105 // 14:02:11Z</div>
                    </div>
                    <div class="timeline-step active">
                        <div class="step-title">PRIVILEGE_ESCALATION</div>
                        <div class="step-meta">T1068 // TARGET: ROOT_SVC // 14:05:33Z</div>
                    </div>
                    <div class="timeline-step">
                        <div class="step-title">EXFILTRATION_ATTEMPT</div>
                        <div class="step-meta">T1041 // C2_NODE: 45.33.22.11 // IN_PROGRESS</div>
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Panel 2: MITRE_ATT&CK_MAPPING
        st.markdown("""
        <div class="tactical-panel">
            <div class="tactical-panel-header">
                <span>MITRE_ATT&CK_MAPPING</span>
                <span style="color: var(--text-muted);">📋</span>
            </div>
            <div class="tactical-panel-body" style="padding: 0;">
                <table class="tactical-table">
                    <thead>
                        <tr>
                            <th>TECHNIQUE</th>
                            <th>DESCRIPTION</th>
                            <th style="text-align: right;">CONF</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>T1110</td>
                            <td>Brute Force</td>
                            <td style="text-align: right;">98%</td>
                        </tr>
                        <tr class="highlight">
                            <td>T1068</td>
                            <td>Exploitation for Privilege Esc...</td>
                            <td style="text-align: right;">95%</td>
                        </tr>
                        <tr>
                            <td>T1041</td>
                            <td>Exfiltration Over C2 Channel</td>
                            <td style="text-align: right;">82%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        """, unsafe_allow_html=True)

    with col_right:
        # Decision Console Text State
        mitigated = st.session_state.get("mitigated", False)

        if mitigated:
            console_text = f"""\
> INITIALIZING AUTOMATED RESPONSE PROTOCOL...

> ANALYZING THREAT VECTOR {inc_id}...

> WARNING: High probability of lateral movement detected on subnet 192.168.1.0/24.

> CORRELATING C2 IP: 45.33.22.11 with known threat actors... MATCH FOUND (APT-29)

> ISOLATION PROTOCOLS RECOMMENDED:
  - Disconnect node SRV-DB-01 from main vLAN.
  - Revoke active session tokens for user 'svc_admin'.
  - Null-route outbound traffic to 45.33.22.11.

> EXECUTION COMMAND AUTHORIZED BY OPERATOR.
> EXECUTING ISOLATION PROTOCOL...
> [✓] DISCONNECTED SRV-DB-01 FROM VLAN.
> [✓] REVOKED ALL TOKENS FOR 'svc_admin'.
> [✓] NULL-ROUTED 45.33.22.11 AT FIREWALL.

> STATUS: THREAT CONTAINED & MITIGATED.<span class="console-cursor"></span>"""
        else:
            console_text = f"""\
> INITIALIZING AUTOMATED RESPONSE PROTOCOL...

> ANALYZING THREAT VECTOR {inc_id}...

<span class="console-line-warning">> WARNING: High probability of lateral movement detected on subnet 192.168.1.0/24.</span>

> CORRELATING C2 IP: 45.33.22.11 with known threat actors... MATCH FOUND (APT-29)

> ISOLATION PROTOCOLS RECOMMENDED:
  - Disconnect node SRV-DB-01 from main vLAN.
  - Revoke active session tokens for user 'svc_admin'.
  - Null-route outbound traffic to 45.33.22.11.

> AWAITING OPERATOR AUTHORIZATION<span class="console-cursor"></span>"""

        st.markdown(f"""
        <div class="tactical-panel">
            <div class="tactical-panel-header">
                <span>DECISION_AGENT_CONSOLE</span>
                <span style="color: var(--text-muted);">● ● ●</span>
            </div>
            <div class="console-box">
                <div class="console-watermark">&gt;_</div>
{console_text}
            </div>
        </div>
        """, unsafe_allow_html=True)

        # Action Buttons
        btn_col1, btn_col2 = st.columns([1, 1])

        with btn_col1:
            st.markdown('<div class="btn-override">', unsafe_allow_html=True)
            if st.button("🚫 OVERRIDE", use_container_width=True):
                st.session_state["mitigated"] = False
                st.info("OVERRIDE SIGNAL ISSUED.")
            st.markdown('</div>', unsafe_allow_html=True)

        with btn_col2:
            st.markdown('<div class="btn-execute">', unsafe_allow_html=True)
            if st.button("⚡ EXECUTE_MITIGATION", use_container_width=True):
                st.session_state["mitigated"] = True
                if incident:
                    api_post(f"/api/incidents/{incident['id']}/respond")
                st.success("MITIGATION EXECUTED.")
            st.markdown('</div>', unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: SOC DASHBOARD
# ═══════════════════════════════════════════════════════════════════════════

elif page == "🏠 SOC Dashboard":
    stats = api_get("/api/dashboard/stats")
    if not stats:
        stats = {"total_alerts": 0, "high_severity": 0, "medium_severity": 0, "low_severity": 0,
                 "critical_severity": 0, "threats_blocked": 0, "incidents_count": 0,
                 "alerts_over_time": [], "attack_types": [], "severity_distribution": [], "recent_alerts": []}

    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        st.metric("TOTAL ALERTS", stats["total_alerts"])
    with c2:
        st.metric("CRITICAL", stats["critical_severity"])
    with c3:
        st.metric("HIGH", stats["high_severity"])
    with c4:
        st.metric("MEDIUM", stats["medium_severity"])
    with c5:
        st.metric("BLOCKED", stats["threats_blocked"])

    st.markdown("")

    chart_left, chart_right = st.columns(2)

    with chart_left:
        st.markdown("<div style='font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;'>ATTACK TYPES DISTRIBUTION</div>", unsafe_allow_html=True)
        attack_data = stats.get("attack_types", [])
        if attack_data:
            df = pd.DataFrame(attack_data)
            fig = px.bar(df, x="type", y="count", color="count", color_continuous_scale=["#00e5ff", "#3b82f6", "#ff4422"])
            fig.update_layout(**chart_layout(showlegend=False, coloraxis_showscale=False, height=320))
            st.plotly_chart(fig, use_container_width=True)

    with chart_right:
        st.markdown("<div style='font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-bottom: 8px;'>SEVERITY BREAKDOWN</div>", unsafe_allow_html=True)
        sev_data = stats.get("severity_distribution", [])
        if sev_data:
            df = pd.DataFrame(sev_data)
            fig = px.pie(df, values="count", names="severity", color="severity", color_discrete_map=SEVERITY_COLORS, hole=0.5)
            fig.update_layout(**chart_layout(height=320))
            st.plotly_chart(fig, use_container_width=True)

    st.markdown("<div style='font-size: 0.85rem; font-weight: 700; color: var(--text-muted); margin-top: 16px; margin-bottom: 8px;'>RECENT THREAT EVENTS</div>", unsafe_allow_html=True)
    recent = stats.get("recent_alerts", [])
    if recent:
        df = pd.DataFrame(recent[:10])
        st.dataframe(df[["timestamp", "attack_type", "severity", "confidence", "source_ip", "target_host"]], use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: ALERT CENTER
# ═══════════════════════════════════════════════════════════════════════════

elif page == "🚨 Alert Center":
    st.markdown("### 🚨 ALERT CENTER")
    alerts_data = api_get("/api/alerts")
    alerts = alerts_data.get("alerts", []) if alerts_data else []

    if alerts:
        for alert in alerts:
            sev = alert.get("severity", "medium").lower()
            color = SEVERITY_COLORS.get(sev, "#00e5ff")
            st.markdown(f"""
            <div style="background: var(--bg-panel); border: 1px solid var(--border-color); border-left: 4px solid {color};
                        padding: 12px 16px; margin-bottom: 8px; border-radius: 2px;">
                <div style="display: flex; justify-content: space-between; font-weight: 700;">
                    <span style="color: var(--text-bright);">{alert.get('attack_type', 'UNKNOWN')}</span>
                    <span style="color: {color}; text-transform: uppercase;">[{sev}]</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-normal); margin-top: 4px;">
                    CONF: {alert.get('confidence', 0)*100:.0f}% // SRC: {alert.get('source_ip', '—')} // TARGET: {alert.get('target_user', alert.get('target_host', '—'))}
                </div>
            </div>
            """, unsafe_allow_html=True)
    else:
        st.info("NO ACTIVE ALERTS DETECTED.")


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: ATTACK TIMELINE
# ═══════════════════════════════════════════════════════════════════════════

elif page == "⏱️ Attack Timeline":
    st.markdown("### ⏱️ ATTACK TIMELINE")
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []

    if incidents:
        timeline = incidents[0].get("timeline", [])
        if timeline:
            severity_y = {"low": 1, "medium": 2, "high": 3, "critical": 4}
            colors = [SEVERITY_COLORS.get(e.get("severity", "medium").lower(), "#00e5ff") for e in timeline]

            fig = go.Figure()
            fig.add_trace(go.Scatter(
                x=[e["timestamp"] for e in timeline],
                y=[severity_y.get(e.get("severity", "medium").lower(), 2) for e in timeline],
                mode="markers+lines",
                marker=dict(size=12, color=colors, line=dict(width=1, color="#ffffff")),
                line=dict(color="rgba(0, 229, 255, 0.4)", width=2),
                text=[f"{e['event']} ({e.get('mitre_id', '')})" for e in timeline],
            ))
            fig.update_layout(**chart_layout(height=400, title=dict(text="Timeline Progression")))
            st.plotly_chart(fig, use_container_width=True)

            df = pd.DataFrame(timeline)
            st.dataframe(df[["timestamp", "event", "attack_stage", "mitre_id", "mitre_technique", "severity"]], use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: ATTACK MAP
# ═══════════════════════════════════════════════════════════════════════════

elif page == "🗺️ Attack Map":
    st.markdown("### 🗺️ ATTACK PATH VISUALIZATION")
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []

    if incidents:
        chain = incidents[0].get("attack_chain", [])
        if chain:
            import networkx as nx
            G = nx.DiGraph()
            for link in chain:
                G.add_edge(link.get("source_ip", "src"), link.get("destination_ip", "dst"))

            pos = nx.spring_layout(G, k=2, seed=42)
            edge_x, edge_y = [], []
            for edge in G.edges():
                x0, y0 = pos[edge[0]]
                x1, y1 = pos[edge[1]]
                edge_x.extend([x0, x1, None])
                edge_y.extend([y0, y1, None])

            node_x = [pos[n][0] for n in G.nodes()]
            node_y = [pos[n][1] for n in G.nodes()]

            fig = go.Figure()
            fig.add_trace(go.Scatter(x=edge_x, y=edge_y, mode="lines", line=dict(width=1.5, color="#3a3f4d")))
            fig.add_trace(go.Scatter(x=node_x, y=node_y, mode="markers+text", text=list(G.nodes()), textposition="top center", marker=dict(size=24, color="#ff4422")))
            fig.update_layout(**chart_layout(height=450, showlegend=False))
            st.plotly_chart(fig, use_container_width=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: DIGITAL TWIN
# ═══════════════════════════════════════════════════════════════════════════

elif page == "🏗️ Digital Twin":
    st.markdown("### 🏗️ DIGITAL TWIN — INFRASTRUCTURE SIMULATOR")
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []

    if incidents:
        impacts = incidents[0].get("impact_simulations", [])
        if impacts:
            df = pd.DataFrame(impacts)
            fig = go.Figure()
            fig.add_trace(go.Bar(x=df["action"], y=df["risk_reduction_pct"], name="Risk Reduction %", marker_color="#00e5ff"))
            fig.add_trace(go.Bar(x=df["action"], y=df["downtime_minutes"], name="Downtime (min)", marker_color="#ff4422"))
            fig.update_layout(**chart_layout(barmode="group", height=380))
            st.plotly_chart(fig, use_container_width=True)
            st.dataframe(df[["action", "security_score_delta", "users_affected", "downtime_minutes", "risk_reduction_pct", "side_effects"]], use_container_width=True, hide_index=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: RESPONSE PLANS
# ═══════════════════════════════════════════════════════════════════════════

elif page == "📋 Response Plans":
    st.markdown("### 📋 RESPONSE PLANS & DECISION AGENT")
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []

    if incidents:
        plans = incidents[0].get("response_plans", [])
        if plans:
            cols = st.columns(len(plans))
            for i, p in enumerate(plans):
                with cols[i]:
                    st.markdown(f"""
                    <div style="background: var(--bg-panel); border: 1px solid var(--border-color); padding: 16px; border-radius: 4px;">
                        <div style="font-weight: 700; color: var(--accent-cyan);">{p['name']}</div>
                        <div style="font-size: 1.8rem; font-weight: 800; margin: 8px 0;">{p['total_score']:.1f}</div>
                        <div style="font-size: 0.8rem; color: var(--text-normal);">
                            SECURITY: {p['scores']['security']:.0f}<br>
                            BUSINESS: {p['scores']['business_impact']:.0f}<br>
                            DOWNTIME: {p['scores']['downtime']:.0f}
                        </div>
                    </div>
                    """, unsafe_allow_html=True)


# ═══════════════════════════════════════════════════════════════════════════
# PAGE: REPORTS
# ═══════════════════════════════════════════════════════════════════════════

elif page == "📄 Reports":
    st.markdown("### 📄 INCIDENT REPORTS")
    incidents_data = api_get("/api/incidents")
    incidents = incidents_data.get("incidents", []) if incidents_data else []

    if incidents:
        inc = incidents[0]
        report_md = f"# GUARDIAN INCIDENT REPORT\n\n**INCIDENT:** {inc['id']}\n**SUMMARY:** {inc.get('summary', '')}\n"
        st.markdown(report_md)
        st.download_button("📥 DOWNLOAD REPORT", data=report_md, file_name=f"{inc['id']}_report.md", mime="text/markdown")
