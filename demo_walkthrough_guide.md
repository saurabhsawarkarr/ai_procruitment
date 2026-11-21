# Live Demo & Loom Walkthrough Guide: "Kill the Quote Spreadsheet"

**Assignment Deliverable 2**: *"A recorded walkthrough of the analyst conversation — you choose the questions worth asking."*  
**Platform**: Aerchain Sourcing Ecosystem (**Aera AI + Evaluation Agent + Omnichannel Hub**)  
**Benchmark**: ₹17.90 Crore ($2.15M) Direct Spend across 30 SKUs & 5 Heterogeneous Suppliers  

---

## Part I: Complete 4-Minute End-to-End Demo Script

| Section | Timeline | Screen / Stage | Key Narration & Demonstration Action |
| :--- | :---: | :--- | :--- |
| **1. Ingestion Hub & Chaos Parsing** | 0:00 – 0:50 | **Stage 1: Upload & Extract Quotes** | Showcase the 5 unsolicited format archetypes (`.xlsx`, `.pdf`, `.docx`, `.jpg`, `.eml`) parsed across 30 SKUs. Demonstrate the dynamic file uploader. Click `[Proceed to Normalize & Verify ➔]`. |
| **2. Trust Gate & Ambiguity Review** | 0:50 – 1:40 | **Stage 2: Normalize & Verify** | Walk through CompuZone Footnote #3 dual-scenario unbundling, Apex logistics normalization (+₹450/unit), National tech spec mismatch, Balaji contract indexation, and Vardhman 27/30 partial bid isolation. Click `[Proceed to Compare & Optimize ➔]`. |
| **3. The Analyst Conversation** | 1:40 – 3:15 | **Stage 3: Compare & Optimize** | 65% TanStack Master Matrix + 35% Aera AI Copilot. Ask the 6 killer analyst questions below, triggering real-time HiGHS MILP optimization, dynamic tables, and visual bounding boxes. |
| **4. Governance Sign-off & Audit Export** | 3:15 – 4:00 | **Stage 4: Award & Approval** | Verify the 3 reconciled KPI cards (₹17.90 Cr baseline, ₹14.07 Cr spend, ₹3.83 Cr / 21.4% savings). Open CPO Board Award Memorandum modal. Download reconciled Excel workbook. |

---

## Part II: The Analyst Conversation — The Questions Worth Asking (And Why)

The assignment brief poses the core challenge:
> *"Then the buyer stops clicking and starts asking. Natural language, over the whole comparison. Text answers, tables, charts, exports. Real analysis on real extracted data, all the way to a defensible award decision."*

Here are the **6 questions worth asking**, why each tests deep procurement intelligence rather than generic chatbots, and what the system produces:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE 6 KILLER ANALYST QUESTIONS                                   │
├────┬───────────────────────────────────────────┬─────────────────────────────────────────────────┤
│ #  │ Natural Language Prompt                   │ Why It's Worth Asking (The Procurement Test)    │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 1  │ "Are there any unusually large price      │ Tests outlier detection: flags spec mismatches  │
│    │ differences or commercial outliers?"      │ (generic PC vs workstation) & unbundled freight │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 2  │ "What is the financial impact if          │ Tests footnote comprehension: models Scenario A │
│    │ CompuZone's conditional rebate fails?"    │ vs B and unbundles hidden 8% handling charges   │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 3  │ "What is the impact of excluding          │ Connects operational SLAs to optimization:      │
│    │ suppliers with delivery times > 12 days?" │ calculates cost of delay vs nominal price delta │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 4  │ "What is the cost difference between a    │ Evaluates sole-sourcing premium vs split-award: │
│    │ single-supplier and split-supplier award?"│ proves why split-sourcing saves ₹1.41 Crore     │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 5  │ "Why was Vardhman not awarded under       │ Proves audit defensibility: explains 16d SLA    │
│    │ the strategic split?"                     │ breach & 27/30 partial bid quarantine           │
├────┼───────────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 6  │ "Show lowest laptop quote across all      │ Instant domain synthesis: parses SKU categories │
│    │ vendors"                                  │ and renders structured comparison table         │
└────┴───────────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

### Question 1: Commercial Anomaly & Price Outlier Detection
* **Prompt to Type / Click**:
  > *"Are there any unusually large price differences or commercial outliers between vendors?"*
* **Why It's Worth Asking**:  
  Shallow procurement tools average prices. Sourcing intelligence finds where vendors misunderstood specs or forgot to include logistics. 
* **What Aera Answers**:  
  Renders a structured markdown table identifying the top 5 widest price spreads across the 30 SKUs:
  - **Line 3 (Apple MacBook Pro M3 Max)**: 45.2% spread because National bid an entry-tier PC laptop instead of the requested workstation spec.
  - **Line 5 (Dell Precision Workstation)**: High spread driven by missing GPU specifications.
  - **Freight Discrepancies**: Highlights Ex-Works Bhiwandi quotes that required up to ₹1,500/unit freight equalization.

---

### Question 2: The Footnote Ambush (Conditional Rebate Modeling)
* **Prompt to Type / Click**:
  > *"What is the financial impact if CompuZone's conditional rebate is not achieved?"*
* **Why It's Worth Asking**:  
  Tests whether the AI actually read 7pt footnotes or just scraped the main table. Evaluates whether the vendor's 4.5% rebate threshold (> ₹1.5 Cr spend) will be met.
* **What Aera Answers**:  
  Displays a dual-scenario financial comparison table:
  - **Scenario A (Spend < ₹1.5 Cr)**: Base landed cost = ₹1,00,000/unit.
  - **Scenario B (Spend > ₹1.5 Cr)**: Net landed cost = ₹95,500/unit (-₹4,500/unit net savings).
  - **Strategic Takeaway**: Category compute volume is ₹6.47 Cr, easily crossing the ₹1.5 Cr threshold, mathematically guaranteeing ₹6.75L to ₹12.5L in bottom-line savings while disallowing unapproved 8% depot handling surcharges.

---

### Question 3: Delivery SLA Constraint & Operational Risk
* **Prompt to Type / Click**:
  > *"What is the impact of excluding suppliers with delivery times above 12 days?"*
* **Why It's Worth Asking**:  
  Standard Excel solvers minimize cost blindly, awarding orders to a vendor with a 16-day lead time that halts client delivery.
* **What Aera Answers**:  
  - Identifies **Vardhman Paper Products** with a **16-day lead time** (breaching the ≤ 12-day threshold).
  - Evaluates live HiGHS solver spend: Strict 12-day SLA achieves **₹14.07 Cr spend (₹3.83 Cr net savings)** with 100% compliant delivery in 7–10 days.
  - Warns that relaxing the SLA saves only a nominal ₹4.2 Lakhs in unit price while inducing an estimated **₹18.5 Lakhs in engineering idle-time losses**.

---

### Question 4: Sourcing Strategy Tradeoff (Single-Source vs. Split Award)
* **Prompt to Type / Click**:
  > *"What is the cost difference between a single-supplier and split-supplier award?"*
* **Why It's Worth Asking**:  
  Executive leadership always asks: *"Why can't we just give 100% of the volume to one vendor to simplify vendor management?"*
* **What Aera Answers**:  
  Aera computes the exact delta in real time:
  - **Single Source (Apex Technology Solutions)**: ₹15.48 Cr (₹2.41 Cr / 13.5% savings).
  - **Strategic Split (Apex + National + Balaji)**: ₹14.07 Cr (₹3.83 Cr / 21.4% savings).
  - **Executive Bottom Line**: Sole-sourcing carries a **+₹1.41 Crore premium (+10.1% cost penalty)** because no single supplier is cheapest across Compute, Displays, and Infrastructure.

---

### Question 5: Defensible Supplier Disqualification
* **Prompt to Type / Click**:
  > *"Why was Vardhman not awarded under the strategic split?"*
* **Why It's Worth Asking**:  
  Auditors demand to know why a vendor was bypassed. The answer must be factually anchored in the raw file.
* **What Aera Answers**:  
  Provides a 3-point audit-ready justification:
  1. **Delivery SLA Breach**: Quoted 16 calendar days vs. enterprise requirement of ≤ 12 days.
  2. **Incomplete Bid (27/30 SKUs)**: Omitted Lines 28–30 (Dual 100GbE NICs, Fibre Channel HBAs), quarantined to prevent distorted single-source averages.
  3. **Quality Risk**: 2.4% historical defect rate exceeding the mandatory 2.0% qualification ceiling.

---

### Question 6: Natural Language Category Deep Dive
* **Prompt to Type / Click**:
  > *"Show lowest laptop quote across all vendors"*
* **Why It's Worth Asking**:  
  Demonstrates that the copilot understands product taxonomy and immediately renders a clean markdown comparison table with click-to-source grounding.
* **What Aera Answers**:  
  Generates a clean comparison table for all 5 enterprise laptop SKUs (Ultrabook Core Ultra 7, Developer Mobile Workstation, MacBook Pro M3 Max, Rugged Field Laptop, Executive Ultra-Lightweight), highlighting lowest rates and delivery lead times.

---

## Part III: Recording the Loom Video (Step-by-Step Practical Setup)

1. **Pre-Flight Preparation**:
   - Start the prototype using `.\start_prototype.bat` (or open your live public URL).
   - Open browser at `http://localhost:5173`.
   - Have the Swagger API documentation open in a second tab at `http://localhost:8000/docs` to demonstrate backend rigor.
2. **Recording Setup**:
   - Resolution: 1080p Full Screen.
   - Target Duration: **3:30 to 4:00 minutes**.
3. **Execution Flow**:
   - **Minute 0:00 - 0:50**: Stage 1: Upload & Extract Quotes (Show 5 chaotic vendor files in Ingestion Hub, demo dynamic file uploader).
   - **Minute 0:50 - 1:40**: Stage 2: Normalize & Verify (Review exceptions, show CompuZone Footnote #3 unbundling, Apex freight normalization, and Vardhman partial bid isolation).
   - **Minute 1:40 - 3:15**: Stage 3: Compare & Optimize (Master Matrix & Aera Copilot: click cells for visual bounding boxes, ask 3 of the killer questions above, switch scenarios).
   - **Minute 3:15 - 4:00**: Stage 4: Award & Approval (Show 100% reconciled KPI cards, open Board Award Memo, export Excel workbook).
