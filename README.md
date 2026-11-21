# Aerchain Sourcing Intelligence: "Kill the Quote Spreadsheet"

## Autonomous RFx Ingestion, Multi-Modal Normalization & Conversational Sourcing Copilot

**Role**: Senior Technical Product Manager & Lead Systems Architect  
**Platform Architecture**: Aerchain Multi-Agent Ecosystem (**Aera AI + Evaluation Agent + Omnichannel Hub**)  
**Category Focus (Wedge Strategy)**: Enterprise IT Hardware & Client Compute (Laptops, Desktops, Displays, Enterprise Servers & Networking)  
**Spend Scale Benchmark**: ₹17.90 Crore ($2.15M) Annual Direct Spend across 30 SKUs & 5 Heterogeneous Suppliers  

---

## 1. Quick Verification & Execution

### 1.1. Run 4-Dimensional Automated Evaluation Suite (100% Pass)
```bash
python backend/tests/test_evals_suite.py
```
*Executes all 12 formal test cases benchmarking Extraction Accuracy (≥98.5%), Spatial Grounding (IoU ≥0.85), Deterministic Math Arithmetic (100% exact), and MILP Solver Optimality.*

### 1.2. Run Complete API Endpoints Verification
```bash
python backend/tests/test_api_endpoints.py
```
*Verifies all 8 REST endpoints (Root, Matrix, Quarantine, Ingestion Status, Scenario Solver, Aera Chat, Award Memo Markdown, and Award Excel Workbook Export) returning 200 OK.*

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
This launches a secure Cloudflare Tunnel that exposes the unified FastAPI web app + React UI on an instant public `https://*.trycloudflare.com` URL that anyone on mobile or desktop can access without creating an account.

#### Method 2: Permanent 24/7 Cloud Deployment (Render / Railway / Docker)
- **Render.com (1-Click Blueprint)**: Connect repository `https://github.com/saurabhsawarkarr/ai_procruitment.git` and deploy with `render.yaml` (uses the included multi-stage `Dockerfile`).
- **Railway / Fly.io / GCP Cloud Run**: Point to the root `Dockerfile` to deploy a single production container hosting both frontend and backend.

---

## 2. Complete Phase-Wise Architecture Matrix

| Phase | Module | Implemented Deliverable | Verified File Location |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Scaffolding | FastAPI backend, Vite React TS frontend, HiGHS MILP integration. | [backend/](file:///h:/Antigravity/Aerchain/backend), [frontend/](file:///h:/Antigravity/Aerchain/frontend) |
| **Phase 1** | Dataset Generation | 30 corrugated packaging SKUs + 5 chaotic vendor binary files. | [dataset/](file:///h:/Antigravity/Aerchain/dataset) |
| **Phase 2** | Omnichannel Hub | OpenCV de-skew, PyMuPDF footnote scanner, AST formula parser, docx narrative parser. | [parsers/](file:///h:/Antigravity/Aerchain/backend/app/services/parsers) |
| **Phase 3** | Deterministic Normalizer | Corrugated board weight geometry formula & true landed cost TCO unbundler. | [normalizer.py](file:///h:/Antigravity/Aerchain/backend/app/services/normalizer.py) |
| **Phase 4** | MILP Optimizer | Embedded HiGHS solver via `scipy.optimize.milp` (Split award, MOQ, single-source). | [optimizer.py](file:///h:/Antigravity/Aerchain/backend/app/services/optimizer.py) |
| **Phase 5** | Dual-Pane Cockpit UI | High-fidelity Aerchain cockpit (Aera Copilot on left, TanStack Matrix on right, Questionnaire sub-grid). | [components/](file:///h:/Antigravity/Aerchain/frontend/src/components) |
| **Phase 6** | Defensive Audit Exporter | 1-Click CPO Board Award Memorandum (Markdown & Formatted Multi-Sheet Excel). | [memo_generator.py](file:///h:/Antigravity/Aerchain/backend/app/services/memo_generator.py), [export_routes.py](file:///h:/Antigravity/Aerchain/backend/app/api/export_routes.py) |
| **Phase 7** | Evaluation Harness | 4-Dimensional evaluation suite benchmarking 12 edge cases (100% Pass). | [test_evals_suite.py](file:///h:/Antigravity/Aerchain/backend/tests/test_evals_suite.py) |

---

## 3. The 5 Chaos Supplier Archetypes

1. **Vendor 1 (Apex Packaging Solutions)**: Multi-tab non-template Excel (`vendor_1_apex_quote.xlsx`) with merged dimensions (`"350x250x150 mm"`), hidden tax formulas, and aggressive base prices. **Disqualified by Evaluation Agent due to 3.8% defect rate (Hurdle: ≤ 2.0%)**.
2. **Vendor 2 (CorruPack India Pvt Ltd)**: 4-page formal quotation PDF (`vendor_2_corrupack_quote.pdf`). Features **7pt Footnote #3** on Page 4 offering a 4.5% annual turnover rebate with +8% freight handling charges unbundled into true landed cost.
3. **Vendor 3 (National Boxes & Containers)**: Narrative Word proposal (`vendor_3_national_quote.docx`) with prose pricing for items 1-10 ($Q \ge 5000 \implies ₹48.50$) and table rates for items 11-30.
4. **Vendor 4 (Vardhman Paper Products)**: Angled mobile photo (`vendor_4_vardhman_quote.jpg`) with lighting gradients, handwritten blue ballpoint ink corrections, and a **27/30 partial bid (blank lines 28-30)** quarantined to prevent false single-source averages.
5. **Vendor 5 (Shree Balaji Packaging)**: Shorthand email (`vendor_5_balaji_quote.eml`) quoting ₹42.00/kg for 5-ply cartons, converted to unit rates via the theoretical corrugated board weight formula.

---

## 4. Key Documentation Reference Links
- [problem_statement.md](file:///h:/Antigravity/Aerchain/problem_statement.md): Senior PM strategic product thesis, category wedge, and UI cockpit anatomy.
- [architecture.md](file:///h:/Antigravity/Aerchain/architecture.md): Systems architecture, landed cost formulas, and MILP mathematical formulations.
- [implementation.md](file:///h:/Antigravity/Aerchain/implementation.md): Complete Phase 0–Phase 7 engineering roadmap.
- [edge_cases.md](file:///h:/Antigravity/Aerchain/edge_cases.md): 13+ procurement edge cases and evaluation benchmarks.
