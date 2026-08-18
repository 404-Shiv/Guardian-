"""Digital Twin Agent — Simulates network infrastructure and response impacts."""

from typing import List, Dict, Any, Tuple
import networkx as nx


def build_infrastructure() -> Tuple[nx.DiGraph, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Build a simulated network infrastructure graph.
    Returns (graph, nodes_list, edges_list).
    """
    G = nx.DiGraph()

    # Define nodes
    nodes = [
        {"id": "internet", "name": "Internet", "node_type": "external", "status": "operational", "risk_level": "high"},
        {"id": "firewall", "name": "Firewall (fw-gateway-01)", "node_type": "security", "status": "operational", "risk_level": "low"},
        {"id": "workstation", "name": "Workstation (workstation-pc-12)", "node_type": "endpoint", "status": "operational", "risk_level": "medium"},
        {"id": "app_server", "name": "App Server (app-server-01)", "node_type": "server", "status": "operational", "risk_level": "medium"},
        {"id": "db_server", "name": "DB Server (db-server-01)", "node_type": "server", "status": "operational", "risk_level": "high"},
        {"id": "ad_server", "name": "Active Directory", "node_type": "server", "status": "operational", "risk_level": "medium"},
        {"id": "backup", "name": "Backup Server", "node_type": "server", "status": "operational", "risk_level": "low"},
        {"id": "mgmt_station", "name": "Management Station", "node_type": "endpoint", "status": "operational", "risk_level": "low"},
    ]

    for node in nodes:
        G.add_node(node["id"], **node)

    # Define edges (network connections)
    edges = [
        {"source": "internet", "target": "firewall", "protocol": "TCP/443"},
        {"source": "firewall", "target": "workstation", "protocol": "TCP/22"},
        {"source": "firewall", "target": "app_server", "protocol": "TCP/443"},
        {"source": "workstation", "target": "app_server", "protocol": "TCP/8080"},
        {"source": "app_server", "target": "db_server", "protocol": "TCP/5432"},
        {"source": "workstation", "target": "ad_server", "protocol": "LDAP/389"},
        {"source": "app_server", "target": "ad_server", "protocol": "LDAP/389"},
        {"source": "db_server", "target": "backup", "protocol": "TCP/873"},
        {"source": "mgmt_station", "target": "firewall", "protocol": "TCP/22"},
        {"source": "mgmt_station", "target": "app_server", "protocol": "TCP/22"},
        {"source": "db_server", "target": "internet", "protocol": "TCP/443"},
    ]

    for edge in edges:
        G.add_edge(edge["source"], edge["target"], **edge)

    return G, nodes, edges


def simulate_response(action: str, target: str = "") -> Dict[str, Any]:
    """
    Simulate the impact of a response action on the infrastructure.
    Returns impact metrics.
    """
    impact_map = {
        "block_ip": {
            "action": "Block IP at Firewall",
            "description": "Block attacker's source IP at the perimeter firewall",
            "security_score_delta": 25.0,
            "users_affected": 0,
            "downtime_minutes": 0,
            "risk_reduction_pct": 30.0,
            "affected_nodes": ["firewall"],
            "side_effects": "May block legitimate traffic from shared IPs",
        },
        "disable_account": {
            "action": "Disable User Account",
            "description": "Disable the compromised user account in Active Directory",
            "security_score_delta": 35.0,
            "users_affected": 1,
            "downtime_minutes": 5,
            "risk_reduction_pct": 45.0,
            "affected_nodes": ["ad_server", "workstation"],
            "side_effects": "User loses access to all systems until re-enabled",
        },
        "reset_credentials": {
            "action": "Reset Credentials",
            "description": "Force password reset and revoke all active sessions",
            "security_score_delta": 30.0,
            "users_affected": 1,
            "downtime_minutes": 10,
            "risk_reduction_pct": 40.0,
            "affected_nodes": ["ad_server"],
            "side_effects": "User must re-authenticate on all devices",
        },
        "quarantine_host": {
            "action": "Quarantine Host",
            "description": "Isolate compromised workstation from the network",
            "security_score_delta": 40.0,
            "users_affected": 3,
            "downtime_minutes": 30,
            "risk_reduction_pct": 60.0,
            "affected_nodes": ["workstation"],
            "side_effects": "All users on the host lose network access",
        },
        "isolate_server": {
            "action": "Isolate Server",
            "description": "Disconnect the application server from the network",
            "security_score_delta": 45.0,
            "users_affected": 50,
            "downtime_minutes": 60,
            "risk_reduction_pct": 70.0,
            "affected_nodes": ["app_server"],
            "side_effects": "All application services become unavailable",
        },
        "enable_mfa": {
            "action": "Enable MFA",
            "description": "Force multi-factor authentication for the compromised account",
            "security_score_delta": 20.0,
            "users_affected": 1,
            "downtime_minutes": 5,
            "risk_reduction_pct": 35.0,
            "affected_nodes": ["ad_server"],
            "side_effects": "User must set up MFA device",
        },
        "patch_system": {
            "action": "Emergency Patch",
            "description": "Apply emergency security patches to affected systems",
            "security_score_delta": 15.0,
            "users_affected": 10,
            "downtime_minutes": 45,
            "risk_reduction_pct": 25.0,
            "affected_nodes": ["workstation", "app_server"],
            "side_effects": "Systems require restart, brief downtime",
        },
        "monitor_host": {
            "action": "Enhanced Monitoring",
            "description": "Deploy enhanced monitoring on compromised hosts",
            "security_score_delta": 10.0,
            "users_affected": 0,
            "downtime_minutes": 0,
            "risk_reduction_pct": 15.0,
            "affected_nodes": ["workstation", "app_server", "db_server"],
            "side_effects": "Increased log volume and CPU usage",
        },
    }

    result = impact_map.get(action.lower().replace(" ", "_"), {
        "action": action,
        "description": f"Custom action: {action}",
        "security_score_delta": 10.0,
        "users_affected": 0,
        "downtime_minutes": 0,
        "risk_reduction_pct": 10.0,
        "affected_nodes": [],
        "side_effects": "Unknown",
    })

    return result


def get_all_impact_simulations() -> List[Dict[str, Any]]:
    """Get impact simulations for all available response actions."""
    actions = [
        "block_ip", "disable_account", "reset_credentials",
        "quarantine_host", "isolate_server", "enable_mfa",
        "patch_system", "monitor_host",
    ]
    return [simulate_response(a) for a in actions]
