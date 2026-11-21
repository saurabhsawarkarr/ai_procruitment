# Aerchain Sourcing Intelligence: "Kill the Quote Spreadsheet"

## Autonomous RFx Ingestion, Multi-Modal Normalization & Conversational Sourcing Copilot

**Role**: Senior Technical Product Manager & Lead Systems Architect  
**Platform Architecture**: Aerchain Multi-Agent Ecosystem (**Aera AI + Evaluation Agent + Omnichannel Hub**)  
**Category Focus (Wedge Strategy)**: Enterprise IT Hardware & Client Compute (Laptops, Desktops, Displays, Enterprise Servers & Networking)  
**Spend Scale Benchmark**: ₹17.90 Crore ($2.15M) Annual Direct Spend across 30 SKUs & 5 Heterogeneous Suppliers  

---

## 🏆 Core Assignment Deliverables Checklist

Per the formal instructions in the [Aerchain Take-Home Assignment PDF](file:///h:/Antigravity/Aerchain/Aerchain-Product-Assignment%20(1)%20(1).pdf):

| Deliverable | Requirement | Implemented Solution | Quick Reference Link |
| :--- | :--- | :--- | :--- |
| **Deliverable 1** | **A working prototype, ready for a live demo we'll drive with you.** | Full-stack interactive prototype (FastAPI + Vite React TS) with 5-step flow: RFx authoring, multi-modal ingestion of 5 chaos formats, exception review, TanStack Master Matrix + Aera Copilot, and Board Award export. | [start_prototype.bat](file:///h:/Antigravity/Aerchain/start_prototype.bat), [share_live.bat](file:///h:/Antigravity/Aerchain/share_live.bat) |
| **Deliverable 2** | **A recorded walkthrough of the analyst conversation — you choose the questions worth asking.** | Comprehensive demo script & Loom walkthrough guide featuring the **6 killer analyst questions** (outliers, footnote ambushes, delivery SLAs, sole vs split premiums, disqualification audits, category deep-dives). | [demo_walkthrough_guide.md](file:///h:/Antigravity/Aerchain/demo_walkthrough_guide.md) |
| **Deliverable 3** | **A one-page note on what you decided, and what you deliberately left out.** | Executive PM decision memorandum addressing architectural bets (deterministic math vs LLMs), solving ugly edges (angled photos, 27/30 partial bids), defensive omissions, and "where the real interesting problem was". | [one_page_pm_decision_note.md](file:///h:/Antigravity/Aerchain/one_page_pm_decision_note.md) |

---

## 1. Quick Verification & Execution

### 1.1. Run 4-Dimensional Automated Evaluation Suite (100% Pass)
```bash
python backend/tests/test_evals_suite.py
```
*Executes all **25 formal test cases** benchmarking Extraction Accuracy (≥98.5%), Spatial Grounding (IoU ≥0.85), Deterministic Math Arithmetic (100% exact), MILP Solver Optimality, and Ask AI Copilot Analytical Grounding.*

### 1.2. Run Complete API Endpoints Verification
```bash
python backend/tests/test_api_endpoints.py
```
*Verifies all **8 REST endpoints** (Health, Matrix, Quarantine, Ingestion Status, Scenario Solver, Aera Chat, Award Memo Markdown, and Award Excel Workbook Export) returning 200 OK.*

### 1.3. Launch Prototype (Windows 1-Click Launch)
```bash
.\start_prototype.bat
```
Or run individually:
```bash
# Terminal 1: FastAPI Backend (Port 8000 - also serves built React UI)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Vite React Frontend (Port 5173 for hot-reloading dev)
cd frontend
npm.cmd run dev
```
* Interactive Cockpit: `http://localhost:5173` (or `http://localhost:8000` for production unified build)
* Swagger API Documentation: `http://localhost:8000/docs`

### 1.4. Share Live MVP (Public HTTPS URL)

#### Method 1: Instant 1-Click Public Tunnel (Share in seconds)
Double-click `share_live.bat` or run:
```bash
.\share_live.bat
```
This launches a secure Cloudflare Tunnel exposing the unified web application on an instant public `https://*.trycloudflare.com` URL accessible globally without login gates.

#### Method 2: Permanent 24/7 Cloud Deployment (Render / Railway / Docker)
- **Render.com (1-Click Blueprint)**: Connect repository `https://github.com/saurabhsawarkarr/ai_procruitment.git` and deploy with `render.yaml` (uses the multi-stage `Dockerfile`).
- **Railway / Fly.io / GCP Cloud Run**: Point to the root `Dockerfile` to deploy a single production container hosting both frontend and backend.

---

## 2. Complete Phase-Wise Architecture Matrix

| Phase | Module | Implemented Deliverable | Verified File Location |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Scaffolding | FastAPI backend, Vite React TS frontend, HiGHS MILP integration. | [backend/](file:///h:/Antigravity/Aerchain/backend), [frontend/](file:///h:/Antigravity/Aerchain/frontend) |
| **Phase 1** | Dataset Generation | 30 SKUs + 5 chaotic vendor binary files + 10 format sample files. | [dataset/](file:///h:/Antigravity/Aerchain/dataset) |
| **Phase 2** | Omnichannel Hub | OpenCV de-skew, PyMuPDF footnote scanner, AST formula parser, docx narrative parser. | [parsers/](file:///h:/Antigravity/Aerchain/backend/app/services/parsers) |
| **Phase 3** | Deterministic Normalizer | Corrugated board weight geometry formula & true landed cost TCO unbundler. | [normalizer.py](file:///h:/Antigravity/Aerchain/backend/app/services/normalizer.py) |
| **Phase 4** | MILP Optimizer | Embedded HiGHS solver via `scipy.optimize.milp` (Split award, MOQ, single-source). | [optimizer.py](file:///h:/Antigravity/Aerchain/backend/app/services/optimizer.py) |
| **Phase 5** | Dual-Pane Cockpit UI | High-fidelity Aerchain cockpit (Aera Copilot on left, TanStack Matrix on right, Questionnaire sub-grid). | [components/](file:///h:/Antigravity/Aerchain/frontend/src/components) |
| **Phase 6** | Defensive Audit Exporter | 1-Click CPO Board Award Memorandum (Markdown & Formatted Multi-Sheet Excel). | [memo_generator.py](file:///h:/Antigravity/Aerchain/backend/app/services/memo_generator.py), [export_routes.py](file:///h:/Antigravity/Aerchain/backend/app/api/export_routes.py) |
| **Phase 7** | Evaluation Harness | 4-Dimensional evaluation suite benchmarking 25 edge cases (100% Pass). | [test_evals_suite.py](file:///h:/Antigravity/Aerchain/backend/tests/test_evals_suite.py) |

---

## 3. The 5 Chaos Supplier Archetypes

1. **Vendor 1 (Apex Technology Solutions)**: Multi-tab non-template Excel (`vendor_1_apex_quote.xlsx`) with merged dimensions, unbundled Bhiwandi freight (+₹450/unit), and aggressive base prices.
2. **Vendor 2 (CompuZone India Pvt Ltd)**: 4-page formal quotation PDF (`vendor_2_compuzone_quote.pdf`). Features **7pt Footnote #3** on Page 4 offering a 4.5% annual turnover rebate (> ₹1.5 Cr spend) and +8% depot handling fee unbundled into true landed cost.
3. **Vendor 3 (National IT Systems)**: Narrative Word proposal (`vendor_3_national_quote.docx`) with prose tier pricing for items 1-10 and spec mismatch on high-end laptops.
4. **Vendor 4 (Vardhman Paper Products / Hardware)**: 15° angled mobile photo (`vendor_4_vardhman_quote.jpg`) with lighting gradients, handwritten blue ink corrections, a 16-day SLA breach, and a **27/30 partial bid (blank lines 28-30)** quarantined in MILP.
5. **Vendor 5 (Shree Balaji Infotech)**: Shorthand email (`vendor_5_balaji_quote.eml`) quoting historical 2025 contract with +3.5% currency escalation and unbundled WD22TB4 docking stations.

---

## 4. Key Documentation Reference Links
- [one_page_pm_decision_note.md](file:///h:/Antigravity/Aerchain/one_page_pm_decision_note.md): Deliverable 3 — One-page PM decision note.
- [demo_walkthrough_guide.md](file:///h:/Antigravity/Aerchain/demo_walkthrough_guide.md): Deliverable 2 — Analyst conversation walkthrough & questions worth asking.
- [problem_statement.md](file:///h:/Antigravity/Aerchain/problem_statement.md): Senior PM strategic product thesis, category wedge, and UI cockpit anatomy.
- [architecture.md](file:///h:/Antigravity/Aerchain/architecture.md): Systems architecture, landed cost formulas, and MILP mathematical formulations.
- [edge_cases.md](file:///h:/Antigravity/Aerchain/edge_cases.md): 13+ procurement edge cases and evaluation benchmarks.
