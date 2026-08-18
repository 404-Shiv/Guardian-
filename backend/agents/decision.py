"""Decision Agent — Selects the best response plan."""

from typing import List, Dict, Any, Optional


def select_best_plan(
    plans: List[Dict[str, Any]],
    challenges: List[Dict[str, Any]],
) -> Optional[Dict[str, Any]]:
    """
    Compare all response plans considering adversarial feedback and select the best one.
    Returns the final decision.
    """
    if not plans:
        return None

    # Build a lookup of challenges by plan_id
    challenge_map = {c["plan_id"]: c for c in challenges}

    # Score each plan combining original score + adversarial assessment
    scored_plans = []
    for plan in plans:
        pid = plan.get("plan_id", "")
        base_score = plan.get("total_score", 0)

        challenge = challenge_map.get(pid, {})
        improved_score = challenge.get("improved_score", base_score)

        # Composite: 60% base score + 40% improved (post-adversarial) score
        composite = (base_score * 0.6) + (improved_score * 0.4)

        # Bonus for plans with more comprehensive actions
        action_count = len(plan.get("actions", []))
        comprehensiveness_bonus = min(10, action_count * 2)

        # Penalty for high user impact
        users_affected = plan.get("users_affected", 0)
        user_penalty = min(15, users_affected * 0.3)

        final_score = composite + comprehensiveness_bonus - user_penalty

        scored_plans.append({
            "plan": plan,
            "challenge": challenge,
            "final_score": round(final_score, 1),
        })

    # Select the best
    scored_plans.sort(key=lambda x: x["final_score"], reverse=True)
    best = scored_plans[0]
    best_plan = best["plan"]
    best_challenge = best["challenge"]

    # Generate reason
    reasons = []
    if best_plan.get("scores", {}).get("security", 0) > 70:
        reasons.append("high security effectiveness")
    if best_plan.get("scores", {}).get("business_impact", 0) > 70:
        reasons.append("acceptable business impact")
    if best_plan.get("scores", {}).get("downtime", 0) > 60:
        reasons.append("minimal downtime")
    if best_challenge.get("improvement"):
        reasons.append(f"with recommended improvements: {best_challenge['improvement']}")

    reason = f"Selected for " + ", ".join(reasons) if reasons else "Best overall score across all criteria"

    # Expected impact
    risk_reduction = best_plan.get("risk_reduction", 0)
    downtime = best_plan.get("estimated_downtime_minutes", 0)
    users = best_plan.get("users_affected", 0)

    expected_impact = (
        f"Risk reduction: {risk_reduction:.0f}% | "
        f"Estimated downtime: {downtime} minutes | "
        f"Users affected: {users} | "
        f"Final confidence score: {best['final_score']:.1f}/100"
    )

    return {
        "selected_plan_id": best_plan["plan_id"],
        "selected_plan_name": best_plan["name"],
        "total_score": best["final_score"],
        "reason": reason,
        "expected_impact": expected_impact,
        "actions": best_plan.get("actions", []),
    }
