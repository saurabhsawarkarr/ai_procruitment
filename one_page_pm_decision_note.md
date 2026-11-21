# One-Page Product Management Decision Note
**Assignment**: "Kill the Quote Spreadsheet" | **Role**: Senior Technical Product Manager & Systems Architect  
**Platform**: Aerchain Sourcing Ecosystem (**Aera AI + Evaluation Agent + Omnichannel Hub**)  

---

### 1. What We Decided (Strategic & Architectural Bets)

1. **The Vertical Category Wedge (Enterprise IT Hardware & Client Compute)**:  
   Rather than building a superficial horizontal prototype that extracts generic prices across 10 unrelated industries, we chose **Enterprise IT Hardware & Client Compute (₹17.90 Crore annual spend across 30 SKUs)**. Direct procurement is governed by category-specific economics: hardware landed cost cannot be normalized without unbundling multi-year OEM warranty terms, software pre-provisioning/imaging surcharges, volume turnover rebates, and tech center logistics. Depth builds buyer trust; generic tools fail on day one.

2. **Deterministic Mathematics vs. Non-Deterministic Semantic Parsing**:  
   We strictly bifurcated cognitive responsibilities:
   * **LLMs & Vision Pipelines**: Perform semantic translation, OCR, document layout analysis, and conversational intent routing.
   * **Python & Embedded HiGHS (MILP)**: Execute 100% of arithmetic, landed cost unbundling, and combinatorial split-award optimization.  
   *Result*: Zero hallucinated math on a ₹17.90 Crore capital allocation decision.

3. **Click-to-Source Grounding & Ambiguity Quarantine (The "Trust Engine")**:  
   Enterprise buyers do not trust black-box recommendations. Every number on screen links back to its exact visual bounding box coordinates on the supplier's original PDF, Excel cell, or de-skewed photo. When confidence drops below 0.85 or when fine-print conditions apply, the system **never guesses**—it isolates the rate into an **Ambiguity Quarantine Drawer** for 1-click Human-in-the-Loop review.

4. **Production UI Mirroring Aerchain's Platform Anatomy**:  
   We aligned the presentation layer directly with Aerchain's production experience from their official demo video: **35% Left Pane for Aera AI Copilot**, **65% Right Pane for the Master TanStack Quote Analysis Matrix**, and a collapsible **Supplier Qualification Questionnaire Sub-Grid** beneath the pricing table.

---

### 2. What We Deliberately Left Out (Defensive Scoping)

1. **Live SMTP Server & Webhook Daemons**:  
   *Why excluded*: Operating live IMAP/SMTP mail servers adds DevOps plumbing without testing sourcing intelligence. We stubbed transmission by placing real raw files (`.eml`, `.pdf`, `.xlsx`, `.docx`, `.jpg`) into an Omnichannel Ingestion Hub with file upload APIs.
2. **Direct ERP/SAP BAPI Write-Back**:  
   *Why excluded*: Writing live Purchase Orders into SAP or Oracle requires enterprise IT security sign-offs. We terminated the workflow at the defensible decision milestone: 1-click export of an audit-ready **Board Award Memorandum (Markdown & Multi-Sheet Excel)** with digital governance signature blocks.
3. **Broad Multi-Category Breadth**:  
   *Why excluded*: Building shallow parsers for MRO spares, IT hardware, and ocean freight simultaneously dilutes rigor. Solving packaging with physical board weight conversion proves the category-deep architecture needed to scale to subsequent direct categories.

---

### 3. "Where the Real Interesting Problem Was" (The PM Insight)

Before building, one assumes the core technical difficulty is document OCR—handling the angled phone photo or parsing the rogue Excel. **It isn't.** Modern vision models handle messy shapes relatively easily.

The **real, wicked problem** in autonomous direct sourcing lives at the intersection of **commercial contract unbundling** and **combinatorial constraint defense**:
* **The Footnote Ambush**: A supplier (CorruPack) quotes an apparently high Ex-Works price, but conceals a retrospective 4.5% turnover rebate on page 4 in 7pt font. A naive system picks the wrong supplier.
* **The Partial-Bid Distortion**: A vendor (Vardhman) quotes only 27 of 30 lines. Traditional systems compute an average or total across only 27 items, falsely declaring them the cheapest single-source winner.
* **The Batch Minimum Trap**: An unconstrained line-by-line cheapest award divides spend so thinly that a supplier receives a ₹45,000 order and cancels it because it breaches factory run minimums. Our MILP solver applies Big-M binary activation constraints to mathematically enforce that any awarded supplier receives at least ₹5,00,000.

**Conclusion**: Sourcing AI succeeds not when it reads documents faster, but when it protects category margins through provable mathematical optimality.
