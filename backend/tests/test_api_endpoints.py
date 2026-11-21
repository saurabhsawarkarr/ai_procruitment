import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

print("--- Testing Complete API Endpoints Suite ---")

# 1. Root / Health Check
r_root = client.get("/api/health")
assert r_root.status_code == 200
print(f"1. Health Endpoint: Status {r_root.status_code} | Platform: {r_root.json()['platform']}")

# 2. Matrix
r_matrix = client.get("/api/rfx/matrix")
assert r_matrix.status_code == 200
matrix_data = r_matrix.json()
print(f"2. Matrix Endpoint: Status {r_matrix.status_code} | Rows: {len(matrix_data['rows'])} | Benchmark: ₹{matrix_data['benchmark_spend_inr']:,.2f}")

# 3. Quarantine
r_quarantine = client.get("/api/rfx/quarantine")
assert r_quarantine.status_code == 200
q_data = r_quarantine.json()
print(f"3. Quarantine Endpoint: Status {r_quarantine.status_code} | Exceptions Quarantined: {q_data['count']}")

# 4. Ingestion Status
r_ingest = client.get("/api/ingestion/status")
assert r_ingest.status_code == 200
ingest_data = r_ingest.json()
print(f"4. Ingestion Status: Status {r_ingest.status_code} | Sources: {ingest_data['omnichannel_sources_count']}")

# 5. Scenario Solver (VP Split)
r_solve = client.post("/api/scenarios/solve", json={
    "scenario_type": "vp_constrained_split",
    "require_quality_audit": True,
    "max_lead_time_days": 12,
    "min_vendor_spend_inr": 500000
})
assert r_solve.status_code == 200
s_data = r_solve.json()
print(f"5. Scenario Solver Endpoint: Status {r_solve.status_code} | Status: {s_data['status']} | Spend: ₹{s_data['total_spend_inr']:,.2f} | Savings: ₹{s_data['net_savings_inr']:,.2f}")

# 6. Aera Copilot Chat
r_chat = client.post("/api/aera/chat", json={
    "message": "Why was Apex disqualified?",
    "active_scenario": "vp_constrained_split"
})
assert r_chat.status_code == 200
chat_data = r_chat.json()
print(f"6. Aera Copilot Chat: Status {r_chat.status_code} | Chips: {len(chat_data['action_chips'])} | Response length: {len(chat_data['text'])}")

# 7. Award Memo Markdown
r_memo = client.get("/api/export/memo?scenario=vp_constrained_split")
assert r_memo.status_code == 200
print(f"7. Award Memo Markdown: Status {r_memo.status_code} | Length: {len(r_memo.text)} bytes")

# 8. Award Excel Workbook Export
r_excel = client.get("/api/export/excel?scenario=vp_constrained_split")
assert r_excel.status_code == 200
assert r_excel.headers["content-type"] == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
print(f"8. Award Excel Workbook Export: Status {r_excel.status_code} | Size: {len(r_excel.content)} bytes")

print("\n>>> ALL 8 ENTERPRISE API ENDPOINTS VERIFIED AND RESPONDING 200 OK! <<<")
