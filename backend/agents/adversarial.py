"""Adversarial Agent — Red-team challenges for response plans."""

from typing import List, Dict, Any


# Knowledge base of adversarial challenges per action type
ADVERSARIAL_KNOWLEDGE = {
    "Block IP": {
        "weakness": "Attacker may use VPN, TOR, or compromised proxies to change source IP. IP-based blocking is easily bypassed.",
        "attack_vector": "Attacker pivots to a different IP address or uses already-established internal access.",
        "improvements": ["Reset Credentials", "Enable MFA", "Enhanced Monitoring"],
    },
    "Disable Account": {
        "weakness": "Attacker may have already created backdoor accounts or implanted persistence mechanisms.",
        "attack_vector": "Attacker uses secondary compromised account or scheduled task for continued access.",
        "improvements": ["Audit all recent account changes", "Quarantine Host", "Check for scheduled tasks"],
    },
    "Reset Credentials": {
        "weakness": "If attacker has dumped cached credentials or Kerberos tickets, password reset alone may not invalidate existing sessions.",
        "attack_vector": "Attacker uses stolen Kerberos Golden Ticket or cached NTLM hash for pass-the-hash attack.",
        "improvements": ["Invalidate all Kerberos tickets", "Enable MFA", "Force re-authentication on all systems"],
    },
    "Quarantine Host": {
        "weakness": "Attacker may have already moved laterally to other hosts before quarantine was applied.",
        "attack_vector": "Attacker continues operations from other compromised hosts in the network.",
        "improvements": ["Scan all connected hosts", "Block lateral movement ports", "Enable network segmentation"],
    },
    "Isolate Server": {
        "weakness": "Isolating the server causes significant business disruption. Attacker may have already exfiltrated data.",
        "attack_vector": "Data is already exfiltrated; isolation only prevents further damage, not recovery.",
        "improvements": ["Enable backup restoration", "Notify affected customers", "Engage forensics team"],
    },
    "Enable MFA": {
        "weakness": "MFA can be bypassed through SIM swapping, MFA fatigue attacks, or social engineering.",
        "attack_vector": "Attacker bombards user with MFA prompts until approved, or uses stolen session tokens.",
        "improvements": ["Use hardware security keys", "Implement conditional access policies", "Monitor for MFA fatigue"],
    },
    "Enhanced Monitoring": {
        "weakness": "Monitoring alone is passive — it detects but doesn't prevent. Attacker may use anti-forensics to evade detection.",
        "attack_vector": "Attacker clears logs, uses encrypted channels, or operates during low-monitoring periods.",
        "improvements": ["Implement active blocking rules", "Deploy EDR solution", "Enable real-time alerting"],
    },
}


def challenge_plans(plans: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Challenge each response plan from an adversarial perspective.
    Returns list of challenges with weaknesses, attack vectors, and improvements.
    """
    challenges = []

    for plan in plans:
        plan_actions = plan.get("actions", [])
        action_names = [a.get("action", "") for a in plan_actions]

        # Find weaknesses for each action
        all_weaknesses = []
        all_improvements = []

        for action_name in action_names:
            knowledge = ADVERSARIAL_KNOWLEDGE.get(action_name, {})
            if knowledge:
                all_weaknesses.append(knowledge["weakness"])
                all_improvements.extend(knowledge["improvements"])

        # Remove improvements that are already in the plan
        new_improvements = [imp for imp in all_improvements if imp not in action_names]
        # Deduplicate
        seen = set()
        unique_improvements = []
        for imp in new_improvements:
            if imp not in seen:
                seen.add(imp)
                unique_improvements.append(imp)

        # Compute the primary weakness (most critical)
        if all_weaknesses:
            primary_weakness = all_weaknesses[0]
        else:
            primary_weakness = "No specific weaknesses identified for this plan."

        # Determine the most likely attack vector
        if "Block IP" in action_names and "Reset Credentials" not in action_names:
            attack_vector = "Attacker retains valid credentials and can authenticate from a new IP."
        elif "Disable Account" in action_names and "Quarantine Host" not in action_names:
            attack_vector = "Attacker may have implanted backdoors or created secondary accounts on compromised hosts."
        elif "Quarantine Host" in action_names and "Reset Credentials" not in action_names:
            attack_vector = "Attacker can still use stolen credentials from another device."
        else:
            attack_vector = "Attacker may leverage persistence mechanisms or pre-staged exfiltration channels."

        improvement_text = " + ".join(unique_improvements[:3]) if unique_improvements else "Current plan covers major vectors"

        # Score improvement
        base_score = plan.get("total_score", 60)
        improvement_bonus = min(20, len(unique_improvements) * 5)
        improved_score = min(98, base_score + improvement_bonus)

        challenges.append({
            "plan_id": plan.get("plan_id", ""),
            "weakness": primary_weakness,
            "attack_vector": attack_vector,
            "improvement": improvement_text,
            "improved_score": round(improved_score, 1),
        })

    return challenges
