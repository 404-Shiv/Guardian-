"""Pydantic models for GUARDIAN."""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class LogEntry(BaseModel):
    """A single normalized log entry."""
    id: Optional[int] = None
    timestamp: str
    source_ip: str
    destination_ip: str
    user: str
    host: str
    event: str
    severity: str
    action: str
    raw_log: str = ""


class ThreatDetection(BaseModel):
    """Output from the Threat Hunter agent."""
    attack_type: str
    confidence: float
    severity: str
    evidence: List[str]
    source_ip: Optional[str] = None
    target_user: Optional[str] = None
    target_host: Optional[str] = None


class AttackChainLink(BaseModel):
    """Single step in a correlated attack chain."""
    timestamp: str
    event: str
    source_ip: str
    destination_ip: str
    user: str
    host: str
    severity: str
    attack_stage: str = ""
    mitre_technique: str = ""
    mitre_id: str = ""


class MITREMapping(BaseModel):
    """MITRE ATT&CK technique mapping."""
    technique_id: str
    technique_name: str
    tactic: str
    evidence: str


class TimelineEvent(BaseModel):
    """A single event on the attack timeline."""
    timestamp: str
    event: str
    attack_stage: str
    mitre_technique: str
    mitre_id: str
    severity: str
    details: str = ""


class DigitalTwinNode(BaseModel):
    """A node in the digital twin network."""
    id: str
    name: str
    node_type: str
    status: str = "operational"
    risk_level: str = "low"


class DigitalTwinEdge(BaseModel):
    """An edge in the digital twin network."""
    source: str
    target: str
    protocol: str = "TCP"


class ResponseAction(BaseModel):
    """A single response action."""
    action: str
    description: str
    target: str


class ResponsePlan(BaseModel):
    """A scored response plan."""
    plan_id: str
    name: str
    actions: List[ResponseAction]
    scores: Dict[str, float]
    total_score: float
    security_impact: float = 0.0
    users_affected: int = 0
    estimated_downtime_minutes: int = 0
    risk_reduction: float = 0.0


class AdversarialChallenge(BaseModel):
    """Adversarial agent's challenge to a response plan."""
    plan_id: str
    weakness: str
    attack_vector: str
    improvement: str
    improved_score: float = 0.0


class FinalDecision(BaseModel):
    """Final decision from the Decision agent."""
    selected_plan_id: str
    selected_plan_name: str
    total_score: float
    reason: str
    expected_impact: str
    actions: List[ResponseAction]


class ImpactSimulation(BaseModel):
    """Digital twin impact simulation result."""
    action: str
    security_score_delta: float
    users_affected: int
    downtime_minutes: int
    risk_reduction_pct: float


class Incident(BaseModel):
    """Complete incident record combining all agent outputs."""
    id: Optional[str] = None
    created_at: Optional[str] = None
    status: str = "detected"
    threats: List[ThreatDetection] = []
    attack_chain: List[AttackChainLink] = []
    mitre_mappings: List[MITREMapping] = []
    timeline: List[TimelineEvent] = []
    response_plans: List[ResponsePlan] = []
    adversarial_challenges: List[AdversarialChallenge] = []
    final_decision: Optional[FinalDecision] = None
    impact_simulations: List[ImpactSimulation] = []
    digital_twin_nodes: List[DigitalTwinNode] = []
    digital_twin_edges: List[DigitalTwinEdge] = []
    summary: str = ""


class DashboardStats(BaseModel):
    """Aggregated stats for the dashboard."""
    total_alerts: int = 0
    high_severity: int = 0
    medium_severity: int = 0
    low_severity: int = 0
    critical_severity: int = 0
    threats_blocked: int = 0
    incidents_count: int = 0
    alerts_over_time: List[Dict[str, Any]] = []
    attack_types: List[Dict[str, Any]] = []
    severity_distribution: List[Dict[str, Any]] = []
    recent_alerts: List[Dict[str, Any]] = []


class UploadResponse(BaseModel):
    """Response after log upload."""
    message: str
    logs_count: int
    log_ids: List[int] = []
