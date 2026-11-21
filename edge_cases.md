# Edge Cases & Evaluation Framework: "Kill the Quote Spreadsheet"

**Product Initiative**: Autonomous RFx Ingestion & Conversational Procurement Intelligence  
**Platform Architecture**: Aerchain Multi-Agent Ecosystem (**Aera AI + Evaluation Agent + Omnichannel Hub**)  
**Role**: Senior Technical Product Manager & Lead Systems Architect  
**Target Category**: Enterprise IT Hardware & Client Compute (Laptops, Desktops, Displays, Enterprise Servers & Networking)  
**Spend Benchmark**: ₹17.90 Crore ($2.15M) Annual Direct Spend across 30 SKUs & 5 Heterogeneous Suppliers  
**Reference Documents**: [problem_statement.md](file:///h:/Antigravity/Aerchain/problem_statement.md) | [architecture.md](file:///h:/Antigravity/Aerchain/architecture.md) | [implementation.md](file:///h:/Antigravity/Aerchain/implementation.md)  
**Document Status**: Production Test & Evaluation Standard (Version 1.0)

---

## 1. Executive Evaluation Thesis: "Handling the Ugly Edges"

In consumer AI, an 85% accuracy rate is considered acceptable. In enterprise direct procurement, where **₹17.90 Crore ($2.15M)** of capital is deployed, **a 1% mathematical or extraction error represents ₹17,90,000 of unbudgeted margin leakage**. 

The assignment brief outlines the core criteria that determine success:
> *"Everyone can build the happy path. We care about the rest:  
> • The ugly edges. The angled photo. The vendor who quoted 27 of 30 lines. The one who quoted in USD. The one whose 'per box' is someone else's 'per 100 pieces.' What does your system do — and what does it show the buyer — when it isn't sure?  
> • Trust. Would a buyer with ₹4 crore on the line act on what's on your screen? What did you build to earn that?  
> • Judgment and taste. A thousand decisions here have no correct answer. We want to see how you made them, and whether you can say why."*

This document defines the **exhaustive catalogue of procurement edge cases**, the **exact architectural handling and buyer-facing UX states**, and the **formal automated Evaluation Suite (Evals)** used to benchmark the platform.

---

## 2. Comprehensive Edge Cases Catalogue & UX Remediation

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                            THE 5 CORE VENDOR CHAOS EDGE-CASE ARCHETYPES                          │
├────────────────────┬────────────────────┬────────────────────┬──────────────────┬────────────────┤
│    VENDOR 1        │    VENDOR 2        │    VENDOR 3        │    VENDOR 4      │   VENDOR 5     │
│   Custom Excel     │  Letterhead PDF    │   Narrative Word   │  Skewed Camera   │ Casual Email   │
│   (Non-Template)   │ (Footnote Ambush)  │   (Prose Pricing)  │  Photo (Mobile)  │ (Legacy Basis) │
└────────────────────┴────────────────────┴────────────────────┴──────────────────┴────────────────┘
```

---

### Category A: Ingestion & Multi-Modal Document Extraction Edge Cases

#### Edge Case 1: The Angled, Distorted Mobile Photo with Shadows (Vendor 4 – Vardhman)
* **The Failure Mode**: The supplier prints a rate sheet, amends 4 prices by hand in blue ballpoint pen, places it on a shop floor desk, and snaps a skewed photo with a mobile phone. Standard OCR reads distorted characters incorrectly (e.g., misreading `₹38.50` as `₹88.50`) or fails entirely due to lighting shadows.
* **System Handling**:
  1. **OpenCV Preprocessing Pipeline**:
     * Detects page edges via Canny edge detection.
     * Computes the homography matrix using 4-point quadrilateral contour detection.
     * Applies `cv2.warpPerspective` to flatten and de-skew the image to a canonical rectangular plane.
     * Applies Contrast Limited Adaptive Histogram Equalization (`CLAHE`) to neutralize the shadow gradient.
  2. **Multi-Modal Spatial OCR**: Extracts both printed text and handwritten ink annotations with character-level confidence scores.
* **Buyer UX & Ambiguity Quarantine**:
  * If confidence score is $< 0.85$, the rate is **never hallucinated**.
  * The cell in the Quote Analysis matrix displays an **Amber Alert Badge** `[⚠ Quarantine: Review Image]`.
  * Clicking the cell opens the **Slide-Out Document Inspector**, displaying the de-skewed photo side-by-side with a highlighted crop of the handwritten correction and two buttons: `[Accept AI Suggestion: ₹38.50]` and `[Manual Override]`.

---

#### Edge Case 2: The Incomplete / Sparse Bid Set (Vendor 4 Quotes 27 of 30 Lines)
* **The Failure Mode**: Vendor 4 only quotes on 27 standard corrugated lines and leaves the 3 complex die-cut honeycomb inserts blank. A naive system averages the columns or calculates total spend across only the 27 items, creating a false illusion that Vendor 4 is the cheapest overall bidder.
* **System Handling**:
  * The extraction engine marks items 28, 29, and 30 with `is_bid_present: false` and `raw_quoted_price: null`.
  * **Scenario 1 (Single-Source Award)**: Vendor 4 is automatically marked `DISQUALIFIED (Incomplete Bid: 27/30 lines)`.
  * **Scenario 2 (Split-Award Optimization)**: The MILP solver includes the binary constraint:
    $$x_{iv} \le B_{iv} \quad \forall i \in \{1 \dots 30\}, v \in \{1 \dots 5\}$$
    Because $B_{i, \text{Vendor 4}} = 0$ for lines 28–30, the solver is mathematically prevented from allocating those SKUs to Vendor 4, while allowing them to win any of the 27 lines where they are most cost-effective.
* **Buyer UX**:
  * Vendor 4's column header shows a status pill: `Partial Bid (27/30 Lines)`.
  * Cells 28–30 display a disabled dashed cell: `— No Bid Submitted —`.

---

#### Edge Case 3: The 7pt Fine-Print Footnote Ambush (Vendor 2 – CorruPack India)
* **The Failure Mode**: The main pricing table shows low Ex-Works rates (e.g., ₹39.80/box). However, Footnote #3 on page 4 in tiny 7pt font states: *"Prices subject to a retrospective 4.5% annual turnover rebate if aggregate volume exceeds ₹1.5 Cr; freight charged at actuals + 8% handling; GST extra at 18%."* A buyer looking only at the table miscalculates the landed cost by 10% to 15%.
* **System Handling**:
  * PyMuPDF layout analysis detects text blocks below table bounding boxes.
  * Multi-modal Vision LLM scans for conditional modifiers ("rebate", "turnover", "freight", "handling", "GST").
  * Structured modifier binding: The system links Footnote #3 to the 30 pricing lines:
    $$\text{Modifier: } \{\text{rebate\_threshold}: 15000000, \text{rebate\_pct}: 0.045, \text{freight\_handling}: 0.08, \text{tax\_rate}: 0.18\}$$
* **Buyer UX**:
  * Each unit rate for Vendor 2 displays an asterisk with an unbundling icon: `₹46.85* [TCO]`.
  * Hovering over the rate reveals a popover breakdown:
    $$\text{Base Ex-Works (₹42.00)} - \text{Rebate (₹1.89)} + \text{Freight (₹4.50)} + \text{Handling (₹0.36)} + \text{GST (₹1.88)}$$
  * Clicking the cell opens the PDF viewer and **auto-scrolls to Page 4, highlighting Footnote #3 in a red bounding box**.

---

#### Edge Case 4: Rogue Multi-Tab Excel with Merged Unstructured Headers (Vendor 1 – Apex)
* **The Failure Mode**: The supplier ignores the buyer's 1-sheet template. They split 30 items across three separate tabs (`Shipper Boxes`, `Die-Cut Cartons`, `Heavy Duty`), merge `Length`, `Width`, and `Height` into a single cell (`"350x250x150 mm"`), and embed taxes in subtotal formulas (`=SUM(D2:D16)*1.18`).
* **System Handling**:
  * `openpyxl` scans all worksheet names, detects tabular grids per sheet, and reconciles them against the master 30 SKU catalog.
  * Regex AST parser decompiles `"350x250x150 mm"` into numeric fields: `L: 350`, `W: 250`, `H: 150`.
  * Excel formula tree evaluator inspects cell ASTs to isolate net pre-tax base prices from formulas containing `=...*1.18`.
* **Buyer UX**:
  * All 30 items are consolidated into the unified master matrix.
  * Click-to-source shows: `Sheet: 'Die-Cut Cartons' | Cell: D14`.

---

#### Edge Case 5: Word Narrative Proposal with Conditional Tiered Surcharges (Vendor 3 – National)
* **The Failure Mode**: The vendor submits pricing inside descriptive Word sentences: *"For Items 1 through 10, rate is ₹48.50 for 5,000+ units. For runs under 2,000 units, a surcharge of ₹3.20/pc applies. Lead time is 10 days."*
* **System Handling**:
  * `python-docx` extracts paragraph runs and table nodes.
  * Semantic entity extraction converts conditional prose into a tiered rate schedule:
    $$\text{Tier 1 } (Q \ge 5000): ₹48.50 \quad | \quad \text{Tier 2 } (Q < 2000): ₹51.70$$
  * Evaluates the annual RFx line item volume ($Q = 25,000$) to automatically apply the Tier 1 rate of ₹48.50.
* **Buyer UX**:
  * Displays rate with a `[Tiered Volume]` tag. Click-to-source highlights paragraph 4 in the Word document viewer.

---

#### Edge Case 6: Shorthand Email Quoting ₹/kg with Contract Baseline Escalation (Vendor 5 – Shree Balaji)
* **The Failure Mode**: Sales Director emails: *"₹42/kg for 5-ply, ₹38.50/kg for 3-ply. For all other specialty items, rate will be same as our 2025 Annual Contract with 3.5% escalation. Delivery DDP Bhiwandi."*
* **System Handling**:
  * NLP entity extractor isolates the ₹/kg rates and the contract baseline reference.
  * **Corrugated Board Weight Engine**: Calculates the physical weight of each 5-ply and 3-ply box from surface area, GSM, and flute take-up factors to convert ₹/kg to ₹/box.
  * **Knowledge Hub Connector**: Queries the 2025 contract database for the remaining specialty items and computes:
    $$\text{Price}_{2026} = \text{Price}_{2025} \times (1 + 0.035)$$
* **Buyer UX**:
  * Cells display converted unit rate with a `[Converted from ₹42/kg]` chip.
  * Hovering displays the board weight formula and links to the 2025 baseline PO record.

---

#### Edge Case 7: Currency Dissonance (Quoted in USD / 1,000 pieces)
* **The Failure Mode**: A multinational packaging vendor quotes export-grade cartons in `USD per 1,000 units`. If compared against INR unit rates without explicit Forex anchoring, calculations fail by a factor of 1,000.
* **System Handling**:
  * Identifies currency code `USD` and denominator unit `1,000 units`.
  * Pulls the enterprise-locked Forex spot rate (e.g., $1\text{ USD} = 83.50\text{ INR}$).
  * Normalization formula:
    $$\text{Unit Base Price (INR)} = \frac{\text{Quoted Price (USD)}}{1000} \times 83.50$$
* **Buyer UX**:
  * Cell shows: `₹41.75` with a secondary sub-label `($500/1k USD @ 83.50)`.
  * Displays a timestamped Forex lock banner: `Forex Locked: 1 USD = 83.50 INR as of 19-Nov-2026`.

---

#### Edge Case 8: Inter-Document Contractual Contradictions
* **The Failure Mode**: Vendor email body states: *"Payment terms: Net 60 days"*, but attached PDF proposal fine print states: *"Terms: 100% advance against proforma invoice."*
* **System Handling**:
  * Cross-document consistency scanner compares metadata fields between email wrapper and attached PDF.
  * Detects contradiction and flags an `INTER-DOCUMENT CONFLICT`.
* **Buyer UX**:
  * A red conflict badge appears in the Commercial Terms footer: `[⚠ Conflict: Payment Terms]`.
  * The buyer is prompted with a 1-click modal: *"Select governing term: [Net 60 Days (Email)] or [100% Advance (PDF)]"*.

---

### Category B: Mathematical & Landed Cost Normalization Edge Cases

#### Edge Case 9: Tooling, Die-Plate & Stereo Charge Amortization
* **The Failure Mode**: Vendor 2 quotes an upfront ₹75,000 tooling fee for custom die-cut blocks (SKUs 16–25). Comparing unit prices without amortizing or isolating tooling misrepresents total spend.
* **System Handling**:
  * Identifies one-time CapEx vs. recurring OpEx.
  * Normalization formula:
    $$\text{Amortized Tooling per Unit} = \frac{\text{Tooling Fee (₹75,000)}}{\sum_{i=16}^{25} \text{Annual Demand}_i}$$
* **Buyer UX**:
  * The table provides an interactive toggle: `[Amortize Tooling into Landed Cost]` vs. `[Show Tooling as Separate CapEx Line Item]`.

---

#### Edge Case 10: GST Input Tax Credit (ITC) vs. Unrecoverable Local Levies
* **The Failure Mode**: Vendor A quotes ₹40 + 18% GST (fully recoverable as Input Tax Credit by manufacturing plants). Vendor B quotes ₹43 inclusive of non-recoverable state entry levies.
* **System Handling**:
  * Distinguishes between **recoverable pass-through GST** (excluded from True Landed Cost evaluation) and **unrecoverable logistics levies** (added to landed cost).
* **Buyer UX**:
  * Dedicated toggle in Table Header: `[Landed Cost: Net of ITC]` vs. `[Gross Cash Outflow]`.

---

### Category C: Combinatorial Optimization & Decision Edge Cases

#### Edge Case 11: The Small-Order Rejection Threshold (Minimum ₹5 Lakhs per Vendor)
* **The Failure Mode**: A pure line-by-line cheapest award assigns 28 items to CorruPack, 1 item to National Boxes (₹65,000), and 1 item to Shree Balaji (₹1,20,000). Both small vendors reject the award because orders below ₹5,00,000 do not meet factory batch minimums.
* **System Handling**:
  * In the MILP solver, we introduce binary activation variables $y_v \in \{0, 1\}$ and Big-M constraints:
    $$\sum_{i \in I} D_i \cdot C_{iv} \cdot x_{iv} \ge 500,000 \cdot y_v \quad \forall v \in V$$
    $$x_{iv} \le y_v \quad \forall i \in I, \forall v \in V$$
  * If a vendor's allocated spend is $> 0$, it **must be $\ge ₹5,00,000$**. If the optimal allocation for a vendor would be $< ₹5,00,000$, the solver automatically shifts those line items to the next-cheapest qualified supplier to ensure no vendor receives sub-scale orders.
* **Buyer UX**:
  * Aera explains the reallocation in chat:
    > *"Notice: Reallocated SKU-029 from Shree Balaji to National Boxes (+₹8,200) to respect the ₹5,00,000 minimum supplier spend threshold."*

---

#### Edge Case 12: Mathematical Infeasibility (Over-Constrained Queries)
* **The Failure Mode**: The buyer prompts: *"Split award: only suppliers with lead time $\le 7$ days and ISO 9001 certified."* No vendor meets both criteria for lines 21–25.
* **System Handling**:
  * The MILP solver returns `LpStatusInfeasible`.
  * The system does not crash or hallucinate. Aera’s constraint analyzer isolates the bottleneck variables.
* **Buyer UX**:
  * Aera returns a natural language diagnostic:
    > *"Scenario Infeasible: No suppliers meet both criteria (Lead Time $\le 7$ days AND ISO 9001) for SKUs 21 through 25.  
    > Suggested adjustments:  
    > • Relax lead time threshold to 9 days (CorruPack qualifies).  
    > • Grant a quality waiver for Shree Balaji (Lead time: 8 days)."*
  * Renders clickable 1-click action buttons: `[Relax to 9 Days]` or `[Grant Waiver]`.

---

#### Edge Case 13: Qualitative Disqualification of the Lowest Commercial Bidder
* **The Failure Mode**: Vendor 1 (Apex Packaging) quotes the absolute lowest base price on 18 of 30 lines. However, their qualitative questionnaire reveals a **3.8% defect rate (Hurdle: $\le 2.0\%$) and no ISO 9001 certificate**.
* **System Handling**:
  * In the MILP solver, $Q_{\text{Vendor 1}} = 0$ (Failed Quality Audit).
  * Hard constraint: $x_{i, \text{Vendor 1}} \le 0 \implies x_{i, \text{Vendor 1}} = 0 \quad \forall i$.
* **Buyer UX**:
  * Vendor 1's prices appear in the matrix with a subtle grey strikethrough: `~~₹37.50~~`.
  * The Questionnaire Comparison sub-grid highlights their quality score in Red: `Defect Rate: 3.8% ✖ Failed Audit`.
  * Tooltip explains: *"Disqualified: Exceeds maximum permissible defect rate threshold (3.8% vs 2.0% limit)."*

---

## 3. The Automated Evaluation Framework (Evals Suite)

To ensure this platform operates with verifiable enterprise rigor, we implement an automated **Evaluation Test Harness** across 4 evaluation dimensions:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE 4-DIMENSIONAL EVALS HARNESS                                  │
├────────────────────────┬─────────────────────────────────────────────────────────┬───────────────┤
│ Dimension              │ Evaluation Scope                                        │ Target Metric │
├────────────────────────┼─────────────────────────────────────────────────────────┼───────────────┤
│ 1. Extraction Accuracy │ Precision, Recall, & Field Extraction across 5 files    │ ≥ 98.5%       │
│ 2. Spatial Grounding   │ Bounding Box Intersection-over-Union (IoU) on source    │ IoU ≥ 0.85    │
│ 3. Mathematical Rigor  │ Deterministic Landed Cost & Board Weight Arithmetic     │ 100.0% Exact  │
│ 4. Solver Optimality   │ MILP Spend Minimization & Zero Constraint Violations    │ 100.0% Proof  │
└────────────────────────┴─────────────────────────────────────────────────────────┴───────────────┘
```

---

### 3.1. Dimension 1: Extraction & Ingestion Evals (`eval_extraction.py`)
Tests whether the multi-modal parsers extract the ground-truth values from the 5 messy files.

| Test Case ID | Test Target | Ground Truth Expectation | Pass Criteria |
| :--- | :--- | :--- | :--- |
| `EVAL-EXT-01` | Vendor 1 (Excel) Multi-Tab & Dimensions | Consolidates 30 items across 3 tabs; splits `"350x250x150 mm"` into $L, W, H$. | Exact match on 30 items, 0 dropped rows. |
| `EVAL-EXT-02` | Vendor 2 (PDF) Footnote Extraction | Extracts 4.5% annual rebate, 8% handling, 18% GST from Footnote #3 on Page 4. | All 3 footnote attributes captured. |
| `EVAL-EXT-03` | Vendor 3 (Word) Tiered Pricing | Maps $Q \ge 5000 \implies ₹48.50$, $Q < 2000 \implies ₹51.70$. | Correct tier applied to 25k volume. |
| `EVAL-EXT-04` | Vendor 4 (Photo) De-skew & Handwriting | De-skews 15-degree skew; extracts handwritten rates on items 4, 12, 19, 23. | Character error rate (CER) $< 2\%$. |
| `EVAL-EXT-05` | Vendor 4 (Photo) Sparse Matrix Detection | Flags items 28, 29, 30 as unquoted (`is_bid_present: false`). | Exactly 3 null lines identified. |
| `EVAL-EXT-06` | Vendor 5 (Email) ₹/kg & Escalation | Captures ₹42/kg (5-ply), ₹38.50/kg (3-ply), and 3.5% escalation on 2025 contract. | Exact formula modifiers extracted. |

---

### 3.2. Dimension 2: Spatial Grounding Evals (`eval_grounding.py`)
Evaluates whether every extracted cell links to the correct visual bounding box on the original document.

* **Metric**: Bounding Box Intersection over Union (IoU):
  $$\text{IoU} = \frac{\text{Area of Overlap}(\text{Predicted Box}, \text{Ground Truth Box})}{\text{Area of Union}(\text{Predicted Box}, \text{Ground Truth Box})}$$
* **Target Benchmark**: $\text{IoU} \ge 0.85$ across all PDF and JPEG extractions.
* **Test Case `EVAL-GRD-01`**: Clicking cell `Vendor 2, SKU-014` must return `Page: 2`, `ymin: 0.452`, `xmin: 0.120`, `ymax: 0.478`, `xmax: 0.380` with IoU $\ge 0.90$.

---

### 3.3. Dimension 3: Deterministic Mathematical Normalization Evals (`eval_math.py`)
Evaluates arithmetic accuracy of the Landed Cost engine. **Zero tolerance for floating-point drift or hallucination**.

* **Test Case `EVAL-MTH-01` (Board Weight Conversion)**:
  * Input SKU-001 ($350 \times 250 \times 150\text{ mm}$, $5$-ply, GSM $180/120/120/120/180$, Flute B/C).
  * Expected Theoretical Board Weight: $418.25\text{ grams} \pm 0.5\text{ g}$.
  * Quoted Rate: ₹$42.00/\text{kg}$.
  * Expected Normalized Unit Price: ₹$17.57 \pm 0.01$.
  * Evaluation: `assert abs(computed - 17.57) < 0.01`.

* **Test Case `EVAL-MTH-02` (Footnote Landed Cost Unbundling)**:
  * Input SKU-014: Base Ex-Works = ₹$42.00$.
  * Expected Landed Cost:
    $$42.00 - (42.00 \times 0.045) + 4.50 + (4.50 \times 0.08) + (42.00 \times 0.18 \times 0.25 \text{ unrecoverable}) = ₹46.85 \pm 0.02$$
  * Evaluation: `assert abs(computed - 46.85) < 0.02`.

---

### 3.4. Dimension 4: Strategic Optimization & Constraint Evals (`eval_optimizer.py`)
Tests whether the MILP solver calculates mathematically proven optimal allocations under hard constraints.

| Test Case ID | Query / Constraint Scenario | Expected Optimal Output | Verification Check |
| :--- | :--- | :--- | :--- |
| `EVAL-OPT-01` | **Pure Unconstrained Lowest Cost** (Ignore quality audit and lead time) | Total Spend: **₹3.18 Cr** (Savings: ₹82.0 L / 20.5%) | Sum of absolute lowest rates across all 30 SKUs. |
| `EVAL-OPT-02` | **VP Multi-Constraint Split Award**: Quality Audited + Lead Time $\le 12$d + Min ₹5L per vendor | Total Spend: **₹3.41 Cr** (Savings: ₹58.8 L / 14.7%) | 1. Vendor 1 allocated: 0 SKUs (Failed audit)<br>2. Vendor 4 allocated: 0 SKUs (Lead time $16 > 12$d)<br>3. CorruPack: 18 SKUs (₹2.12 Cr)<br>4. National Boxes: 9 SKUs (₹0.98 Cr)<br>5. Shree Balaji: 3 SKUs (₹0.31 Cr $\rightarrow$ Re-allocated to satisfy ₹5L threshold). |
| `EVAL-OPT-03` | **Single-Source Single Vendor Best Award** | Awarded: **CorruPack India** (₹3.62 Cr) | Vendor 4 disqualified (partial bid 27/30). |
| `EVAL-OPT-04` | **Infeasible Constraint Test**: Lead time $\le 7$ days | Solver status: `LpStatusInfeasible` | System catches error and outputs natural language diagnostics. |

---

## 4. Automated Evals Test Runner Implementation

We provide an executable test harness in `backend/tests/test_evals_suite.py`:

```python
import pytest
from app.services.parsers.excel_parser import parse_apex_excel
from app.services.parsers.pdf_parser import parse_corrupack_pdf
from app.services.parsers.vision_parser import parse_vardhman_photo
from app.services.normalizer import compute_board_weight, compute_landed_cost
from app.services.optimizer import solve_split_award

def test_eval_ext_01_excel_multi_tab():
    result = parse_apex_excel("dataset/vendor_1_apex_quote.xlsx")
    assert len(result["items"]) == 30
    assert result["items"][0]["length"] == 350
    assert result["items"][0]["width"] == 250
    assert result["items"][0]["height"] == 150

def test_eval_ext_02_pdf_footnote_rebate():
    result = parse_corrupack_pdf("dataset/vendor_2_corrupack_quote.pdf")
    assert result["footnote_modifiers"]["rebate_pct"] == 0.045
    assert result["footnote_modifiers"]["freight_handling"] == 0.08

def test_eval_ext_05_sparse_matrix_detection():
    result = parse_vardhman_photo("dataset/vendor_4_vardhman_quote.jpg")
    unquoted = [item for item in result["items"] if not item["is_bid_present"]]
    assert len(unquoted) == 3
    assert {item["line_number"] for item in unquoted} == {28, 29, 30}

def test_eval_mth_01_board_weight_math():
    weight = compute_board_weight(length=350, width=250, height=150, 
                                  plies=5, gsm_list=[180, 120, 120, 120, 180], 
                                  flute_type="BC")
    assert round(weight, 1) == 418.3

def test_eval_opt_02_vp_scenario_split_award():
    scenario = solve_split_award(
        require_quality_audit=True,
        max_lead_time_days=12,
        min_vendor_spend_inr=500000
    )
    assert scenario["total_spend_inr"] == 34120000
    assert scenario["savings_inr"] == 5880000
    assert scenario["vendor_allocations"]["Apex Packaging"] == 0  # Disqualified: Failed audit
    assert scenario["vendor_allocations"]["Vardhman Paper"] == 0  # Disqualified: Lead time 16 > 12
    assert scenario["vendor_allocations"]["CorruPack India"] >= 15
```

---

## 5. Summary Matrix: Edge Cases vs. Enterprise Handling

| Edge Case | Ugly Edge Challenge | System Architectural Action | Buyer UX Indicator | Trust Justification |
| :--- | :--- | :--- | :--- | :--- |
| **Vendor 1** | Merged headers, 3 separate tabs, hidden taxes. | `openpyxl` AST multi-tab scanner & dimension regex. | Merged into single 30-item table with cell coordinate links. | No copy-paste errors across sheets. |
| **Vendor 2** | 7pt Footnote #3 (4.5% rebate & freight). | Vision LLM binds footnote rules to unit rates. | Asterisk with unbundling popover; jumps to Page 4 on click. | Prevents 10%–15% false award calculation error. |
| **Vendor 3** | Word narrative prose pricing ($Q \ge 5000$). | Semantic paragraph parser maps conditional tiers. | `[Tiered Volume]` chip; highlights paragraph offset in doc. | Replaces manual conditional modeling. |
| **Vendor 4** | Angled phone photo + 27/30 incomplete bid. | OpenCV perspective warp + sparse matrix classifier. | `[⚠ Ambiguity Quarantine]` badge; blank lines marked `No Bid`. | Prevents OCR hallucination and false total averages. |
| **Vendor 5** | Shorthand email in ₹/kg + contract baseline. | Physical board weight geometry engine + 2025 DB query. | Shows conversion math: `Surface Area × GSM × Flute`. | Transparent, deterministic formula auditing. |
| **The VP Query** | $5^{30}$ combination split award with 3 constraints. | Embedded Mixed-Integer Linear Programming solver. | Instant result ($< 500$ ms) showing ₹58.8 L savings & allocation. | Zero mathematical hallucinations; provable global optimum. |

---

*This document serves as the formal edge-case handling standard and automated evaluation harness for the Aerchain "Kill the Quote Spreadsheet" platform.*
