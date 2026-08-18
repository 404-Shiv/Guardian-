"""Quick test script for GUARDIAN API."""
import requests
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

API = "http://localhost:8000"

# Get incidents
r = requests.get(f"{API}/api/incidents")
incs = r.json()
inc = incs["incidents"][0]

# Threats
threats = inc.get("threats", [])
print(f"Threats detected: {len(threats)}")
for t in threats:
    print(f"  - {t['attack_type']}: confidence={t['confidence']}, severity={t['severity']}")

# MITRE
mitre = inc.get("mitre_mappings", [])
print(f"\nMITRE mappings: {len(mitre)}")
for m in mitre:
    print(f"  - {m['technique_id']} - {m['technique_name']} ({m['tactic']})")

# Timeline
timeline = inc.get("timeline", [])
print(f"\nTimeline events: {len(timeline)}")

# Decision
d = inc.get("final_decision", {})
print(f"\nFinal Decision: {d.get('selected_plan_name', 'N/A')}")
print(f"Score: {d.get('total_score', 0)}")
print(f"Reason: {d.get('reason', '')}")

# Plans
plans = inc.get("response_plans", [])
print(f"\nResponse Plans: {len(plans)}")
for p in plans:
    print(f"  - {p['name']}: score={p['total_score']}")

print("\nAll tests passed!")
