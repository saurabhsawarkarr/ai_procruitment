# Live Demo & Loom Walkthrough Script: "Kill the Quote Spreadsheet"

**Goal**: Deliver a crisp, 3-to-4 minute executive product demo showcasing autonomous RFx ingestion, defensible AI exception reasoning, deterministic landed cost math, and conversational procurement intelligence.

---

### Step 1: Upload Quotes & The 5 Chaos Artifacts (0:00 – 0:45)
* **What to Show**: In the live application at `http://localhost:5173`, display **Step 1: Upload Quotes**. Point out the 5 pre-loaded chaotic vendor files (or show them in the `dataset/` directory):
  1. `vendor_4_vardhman_quote.jpg` (15° perspective-skewed mobile photo with blue pen handwriting and lines 28–30 blank).
  2. `vendor_2_corrupack_quote.pdf` (Corporate letterhead PDF hiding a 4.5% rebate and 8% handling margin in 7pt Footnote #3 on Page 4).
  3. `vendor_5_balaji_quote.eml` (Casual email referencing historical 2025 contract with +3.5% currency indexation and bundled peripheral pricing).
  4. `vendor_1_apex_quote.xlsx` (Multi-tab spreadsheet with combined dimensions and Ex-Works Bengaluru terms).
  5. `vendor_3_national_quote.docx` (Narrative Word proposal with volume discount tiers).
* **What to Say**:
  > *"Enterprise category buyers spend 3 to 4 working days manually transcribing vendor quotes into Excel. In our benchmark scenario, an enterprise IT buyer is sourcing 30 SKUs of enterprise IT hardware and client compute worth ₹17.90 Crore across 5 suppliers. Instead of forcing vendors into rigid web forms, our system accepts whatever format arrives—scanned photos, multi-page PDFs with fine print, multi-tab workbooks, and casual emails."*

---

### Step 2: Review Extracted Exceptions & Trust Gate (0:45 – 1:30)
* **What to Show**: Click **`[Proceed to Review & Exceptions ➔]`** to advance to **Step 2**.
  1. **Exception 1 (CompuZone Footnote)**:
     * Show the **Dual Scenario Normalization**:
       * *Scenario A (Without Rebate)*: ₹1,08,000 baseline price.
       * *Scenario B (If Spend > ₹1.5 Cr)*: ₹1,03,500.
     * Highlight the warning badge: *"Handling amount requires confirmation of underlying actual cost (vendor states 'at actuals + 8% margin', not a flat rate)."*
     * Click **`[Request Clarification]`** to demonstrate the pre-drafted RFP clarification email for actual handling schedules.
  2. **Exception 2 (Shree Balaji)**:
     * Point out the category: **Historical pricing reference & bundled quotation** (separated from simple unit conversion).
     * Show Sub-Issue A (contract baseline with stated +3.5% indexation) vs. Sub-Issue B (bundled peripheral package requiring itemization).
  3. **Exception 3 (Vardhman 27/30 Lines)**:
     * Show the 3-Tier Provenance grid: **Vendor-Stated** vs. **AI-Inferred** vs. **Verified Facts**.
     * Emphasize the core rule: Vardhman is eligible for lines 1–27, while lines 28–30 are excluded ($x_{iv} = 0$).
  4. **Exception 4 (Vardhman 16d SLA)**:
     * Show the honest operational variance (+4 working days above 12-day SLA).
     * Click **`[Accept Deviation]`** or **`[Mark as Non-Compliant]`** to show real buyer decision-making.
  5. **Click `[Proceed to Compare & Optimize]`**:
     * Show the **Pre-Optimization Review Summary Modal** detailing how unresolved items are defensively bounded in the optimizer.
* **What to Say**:
  > *"When ₹17.90 Crore is on the line, buyers will never trust a black-box AI that hallucinates discounts or invents safety buffer costs. In Step 2, our system isolates commercial ambiguities in an audit-ready review cockpit. Notice how the AI evaluates CompuZone under both conservative and rebate-achieved scenarios, flags handling actuals for confirmation, and clearly separates vendor-stated claims from verified facts."*

---

### Step 3: Quote Analysis Master Matrix & Aera Optimization (1:30 – 2:45)
* **What to Show**: On Screen 3 (**Compare & Optimize**):
  1. Show the **Right Pane (65%)**: The 30 SKUs organized into tabs (`Client Compute & Laptops`, `Displays & Docks`, `Enterprise Infrastructure`) with baseline and target prices.
  2. Point out the **Commercial Terms Footer** with unbundled logistics, taxes, and true landed TCO.
  3. **Click any cell (CompuZone, SKU-001)**: The **SourceViewerDrawer** slides out displaying exact document bounding boxes and calculation waterfalls.
  4. Switch to **Left Pane (35%) — Aera AI Copilot**:
     * Click chip: `[Cheapest Line-by-Line]`: Spend drops to ₹1.98 Cr, but Aera warns that unconstrained buying breaches delivery SLAs and awards defective suppliers.
     * Click chip: `[VP Constrained Split]`: The MILP solver optimizes 155 binary variables in 150 ms, achieving **₹2.42 Cr Landed Spend (₹1.87 Cr / 43.6% net realized savings)** while enforcing quality hurdles, ≤ 12-day lead times, and the ₹5 Lakh minimum supplier spend threshold.
* **What to Say**:
  > *"The Evaluation Agent normalizes all formats into an apples-to-apples cockpit. When the VP asks 'what if we split award by lowest landed cost, but only among vendors who passed quality audits and can deliver under 12 days?', our embedded MILP solver calculates the exact mathematical optimum in under 200 milliseconds. Vardhman is restricted based on our Step 2 decisions, and the solver guarantees no supplier receives an uneconomical sub-scale order."*

---

### Step 4: Governance Sign-Off & 1-Click Export (2:45 – 3:30)
* **What to Show**: Click **`[Proceed to Award Recommendation ➔]`** on Screen 4:
  1. Show the **Executive Sourcing Summary** with supplier allocation breakdown and savings waterfall.
  2. Click **`[Award Memo]`**: The modal opens displaying the formal **Executive Procurement Board Award Memorandum** complete with vendor allocation shares, qualification audit records, and digital signature sign-off blocks.
  3. Click **`[Export Excel]`**: Generates an audit-ready Excel workbook with full reconciliation schedules.
* **What to Say**:
  > *"Procurement ends with an audit-ready, defensible governance memo. With one click, the buyer exports the CPO Board Award Memorandum and formatted Excel schedules with complete mathematical provenance. We've replaced 4 days of clerical spreadsheet transcription with 4 minutes of autonomous, defensible intelligence."*
