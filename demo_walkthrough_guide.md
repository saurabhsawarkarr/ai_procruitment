# Live Demo & Loom Walkthrough Script: "Kill the Quote Spreadsheet"

**Goal**: Deliver a crisp, 3-to-4 minute executive product demo showcasing conversational RFx authoring, simulated multi-channel dispatch, autonomous quote ingestion, defensible AI exception reasoning, deterministic landed cost math, and conversational procurement intelligence.

---

### Step 0: Conversational RFx Authoring & Omnichannel Dispatch (0:00 – 0:45)
* **What to Show**: In the live application at `http://localhost:5173`, display **Step 0: Draft & Dispatch RFx**.
  1. Point out the **Aera AI Sourcing Co-Pilot** on the left: show the buyer prompting Aera to draft the enterprise tender:
     > *"Aera, draft an RFx for FY2026 Enterprise IT Hardware & Client Compute across our Bengaluru and Mumbai Tech Centers. Sourcing 30 SKUs: Ultrabooks, Enterprise Workstations, Displays, and Rack Servers. Sourcing rules: Delivery SLA ≤ 12 business days, DDP Incoterms, Net 45 payment terms, and our mandatory ISO 9001 qualification questionnaire with ≤ 2.0% defect rate. Budget benchmark is ₹17.90 Crore."*
  2. Point out the **Right Pane (Drafted RFx Cockpit)**:
     - Review the 30 SKU technical specifications categorized into Compute, Peripherals, and Infrastructure.
     - Review the **Mandatory Qualification Questionnaire**: ISO 9001 certification + DoA defect rate ≤ 2.0%.
     - Show the **Target 5 Vendors** and their respective transmission channels (Apex via EDI, CompuZone via Portal, National via SCM Gateway, Vardhman via WhatsApp/Mobile, and Balaji via SMTP Email).
  3. Click **`[🚀 Dispatch RFx to 5 Vendors]`**:
     - Watch the simulated multi-channel dispatch animation confirm delivery to all 5 suppliers.
     - Click **`[Proceed to Step 1: Ingestion Hub ➔]`**.
* **What to Say**:
  > *"Procurement begins with conversational intent. Rather than filling rigid ERP forms, the buyer talks the tender into existence with Aera. The AI co-pilot compiles 30 SKU specifications, delivery SLAs, and qualification hurdles, then dispatches the tender across five supplier channels simultaneously."*

---

### Step 1: Upload Quotes & The 5 Chaos Artifacts (0:45 – 1:30)
* **What to Show**: On **Step 1: Upload Quotes**:
  1. Point out the 5 pre-loaded chaotic vendor responses (exactly matching the assignment's 5 archetypes):
     - `vendor_1_apex_quote.xlsx` (Multi-tab spreadsheet with combined dimensions and Ex-Works Bengaluru terms).
     - `vendor_2_compuzone_quote.pdf` (Corporate letterhead PDF hiding a 4.5% rebate and 8% handling margin in 7pt Footnote #3 on Page 4).
     - `vendor_3_national_quote.docx` (Narrative Word proposal with volume discount tiers).
     - `vendor_4_vardhman_quote.jpg` (15° perspective-skewed mobile photo with blue pen handwriting and lines 28–30 blank).
     - `vendor_5_balaji_quote.eml` (Casual email referencing historical 2025 contract with +3.5% currency indexation).
  2. Demonstrate the **Upload Modal**: Highlight that the system supports uploading unseen quotations (e.g. `01_ltimindtree_enterprise_quote.xlsx`), extracting supplier ID, detecting commercial exceptions, and dynamically appending them to the comparison matrix while preserving the 5 benchmark suppliers.
  3. Click **`[Proceed to Review & Exceptions ➔]`**.
* **What to Say**:
  > *"Suppliers respond in whatever format they have on hand. Instead of forcing vendors into rigid templates, our system ingests multi-tab spreadsheets, scanned PDFs with fine print, narrative Word proposals, smartphone photos, and casual emails with equal precision."*

---

### Step 2: Review Extracted Exceptions & Trust Gate (1:30 – 2:15)
* **What to Show**: Advance to **Step 2 (Review & Exceptions)**:
  1. **Exception 1 (CompuZone Footnote #3)**:
     - Show the **Dual Scenario Normalization**:
       - *Scenario A (Without Rebate)*: ₹1,08,000 baseline price.
       - *Scenario B (If Spend > ₹1.5 Cr)*: ₹1,03,500.
     - Highlight the warning badge: *"Handling amount requires confirmation of underlying actual cost (vendor states 'at actuals + 8% margin', not a flat rate)."*
     - Click **`[Request Clarification]`** to demonstrate the pre-drafted RFP clarification email.
  2. **Exception 2 (Apex Logistics Normalization)**:
     - Show Ex-Works Bhiwandi terms normalized to DDP delivered (+₹450/unit).
  3. **Exception 3 (National IT Technical Equivalence Check)**:
     - Show how the AI detected generic PC pricing on high-end Apple MacBook Pro (SKU-003) and flagged technical disqualification to prevent delivery rejection.
  4. **Exception 4 (Shree Balaji Commercial Unbundling)**:
     - Show the contract baseline with +3.5% FX escalation and unbundled WD22TB4 docking stations.
  5. **Exception 5 (Vardhman 16d SLA & Quality Failure)**:
     - Show the +4 working days delivery delay breach and 27/30 partial bid quarantined to prevent false averages.
  6. Click **`[Proceed to Compare & Optimize]`**.
* **What to Say**:
  > *"When ₹17.90 Crore is on the line, buyers cannot trust a black-box AI that hallucinates discounts. In Step 2, our system isolates commercial ambiguities in an audit-ready review cockpit with click-to-source bounding boxes and dual scenario normalization."*

---

### Step 3: Quote Analysis Master Matrix & Aera Optimization (2:15 – 3:15)
* **What to Show**: On Screen 3 (**Compare & Optimize**):
  1. Show the **Right Pane (65%)**: The 30 SKUs organized into tabs (`Client Compute & Laptops`, `Displays & Docks`, `Enterprise Infrastructure`) with baseline and target prices.
  2. Point out the **Commercial Terms Footer** with unbundled logistics, taxes, and true landed TCO.
  3. **Click any cell (CompuZone, SKU-001)**: The **SourceViewerDrawer** slides out displaying exact document bounding boxes and calculation waterfalls.
  4. Switch to **Left Pane (35%) — Aera AI Copilot**:
     - Click chip: `[Cheapest Line-by-Line]`: Evaluates unconstrained allocation across lowest individual rates, but Aera warns that unconstrained buying risks delivery SLAs and awards defective suppliers.
     - Click chip: `[VP Constrained Split]`: The MILP solver optimizes binary assignment variables in under 200 ms, achieving **₹14.07 Cr Landed Spend (₹3.83 Cr / 21.4% net realized savings against the ₹17.90 Cr baseline)** while enforcing quality hurdles (defect rate ≤ 2.0%), ≤ 12-day lead times, and the ₹5 Lakh minimum supplier spend threshold.
* **What to Say**:
  > *"The Evaluation Agent normalizes all formats into an apples-to-apples cockpit. When the VP asks 'what if we split award by lowest landed cost, but only among vendors who passed quality audits and can deliver under 12 days?', our embedded MILP solver calculates the exact mathematical optimum in under 200 milliseconds. Vardhman is restricted based on our Step 2 decisions, and the solver guarantees no supplier receives an uneconomical sub-scale order."*

---

### Step 4: Governance Sign-Off & Reconciled Financial Export (3:15 – 4:00)
* **What to Show**: Click **`[Proceed to Award Recommendation ➔]`** on Screen 4:
  1. Show the **3 Fully Reconciled Executive KPI Cards**:
     - **Baseline Spend**: ₹17.90 Cr (`₹17,89,60,500.00`)
     - **Recommended Spend**: ₹14.07 Cr (`₹14,06,99,590.00`)
     - **Projected Savings**: ₹3.83 Cr (`₹38,260,910.00`, 21.4% Net Reduction)
  2. Point out the **Supplier Allocation Schedule**:
     - Apex Technology Solutions: 19 SKUs, ₹8.90 Cr (63.2%)
     - National IT Systems: 4 SKUs, ₹2.56 Cr (18.2%)
     - Shree Balaji Infotech: 7 SKUs, ₹2.61 Cr (18.6%)
     - **Total**: 30 SKUs, ₹14.07 Cr (100.0%) — **Reconciles to the exact rupee**.
  3. Show the **Detailed 30 SKU Schedule**: Summing the 30 rows matches ₹14.07 Cr spend and ₹3.83 Cr savings.
  4. Click **`[Award Memo]`**: The modal opens displaying the formal **Executive Procurement Board Award Memorandum** complete with vendor allocation shares, qualification audit records, and digital signature sign-off blocks.
  5. Click **`[Export Excel]`**: Generates an audit-ready Excel workbook with full reconciliation schedules.
* **What to Say**:
  > *"Procurement ends with an audit-ready, defensible governance memo. All financial calculations tie out across the dashboard: baseline, optimized spend, projected savings, supplier allocations, and line-item totals match to the exact rupee. We've replaced 4 days of clerical spreadsheet transcription with 4 minutes of autonomous, defensible intelligence."*
