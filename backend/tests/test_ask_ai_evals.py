import os
import sys

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.api.chat_routes import chat_with_aera, ChatRequest, get_sample_questions
from app.services.normalizer import normalizer_engine
from app.services.ai_guardrails import ai_guardrail_engine

def test_eval_ai_01_lowest_laptop_quote_grounding():
    print("[RUNNING] EVAL-AI-01: Lowest Laptop Quote Grounding & Structured Tables...")
    normalizer_engine.reset_to_defaults()
    req = ChatRequest(message="who has lowest quote for laptop")
    res = chat_with_aera(req)

    # 1. Structural assertions
    assert "### 💻 Lowest Landed Quotation Breakdown" in res.text, "Missing category breakdown header!"
    assert "Executive Finding" in res.text, "Missing executive takeaway summary!"
    assert "| Category Scope |" in res.text, "Missing Category Spend & Savings Summary Table!"
    assert "| Line | SKU | Model Description |" in res.text, "Missing Line-by-Line Breakdown Table!"
    assert "| SKU | Model |" in res.text, "Missing All-Supplier Landed Cost Matrix!"
    assert "Commercial Governance & Risk Alert" in res.text, "Missing risk & governance alert!"

    # 2. Mathematical & Factuality Grounding
    assert "Apex Technology Solutions" in res.text, "Expected Apex Technology Solutions to be identified as winner."
    assert "National IT Systems" in res.text, "Expected National IT Systems to be cited."
    
    # 3. Disqualification Integrity (MacBook Pro & Dell Precision)
    assert "*Spec Mismatch*" in res.text, "Expected *Spec Mismatch* badge for National IT on high-end compute!"
    # Ensure National IT is NOT marked as winning Green on SKU-003
    assert not ("SKU-003" in res.text and "National IT Systems | ₹104,500" in res.text and "Lowest Landed" in res.text), \
        "National IT Systems must NOT win SKU-003 (Spec Mismatch)!"

    # 4. Guardrail Metadata
    assert res.grounding is not None, "Grounding metadata must be attached!"
    assert res.grounding["is_grounded"] is True, f"Grounding check failed: {res.grounding.get('warnings')}"
    assert res.grounding["grounding_score"] == 1.0, f"Expected 1.0 grounding score, got {res.grounding['grounding_score']}"
    assert "SUPPLIER_IDENTITY_VERIFIED" in res.grounding["guardrail_checks_passed"]
    assert "SPEC_MISMATCH_SKU003_ENFORCED" in res.grounding["guardrail_checks_passed"]
    assert "STRUCTURED_TABLE_MARKDOWN_VERIFIED" in res.grounding["guardrail_checks_passed"]
    print("  -> PASSED: Verified 100% grounded laptop quotes, structured tables, and spec disqualification.")

def test_eval_ai_02_cheapest_unconstrained_optimization():
    print("[RUNNING] EVAL-AI-02: Lowest Overall Rate Grounding (MILP Optimization)...")
    req = ChatRequest(message="who has lowest quote")
    res = chat_with_aera(req)

    assert "Unconstrained Cheapest Line-by-Line Award" in res.text, "Expected unconstrained cheapest scenario trigger!"
    assert "Optimized Spend" in res.text
    assert "Net Savings" in res.text
    assert res.scenario_trigger == "unconstrained_lowest"
    assert res.metrics is not None
    assert "totalSpend" in res.metrics
    assert "netSavings" in res.metrics

    assert res.grounding is not None
    assert res.grounding["is_grounded"] is True
    print("  -> PASSED: Verified unconstrained cheapest rates grounded in HiGHS MILP solver.")

def test_eval_ai_03_sla_lead_time_exclusion_grounding():
    print("[RUNNING] EVAL-AI-03: SLA Lead Time (> 12 Days) Exclusion Grounding...")
    req = ChatRequest(message="What happens if we exclude suppliers with delivery times above 12 days?")
    res = chat_with_aera(req)

    assert "Impact of Enforcing Strict ≤ 12-Day Delivery SLA" in res.text
    assert "Vardhman Infotech" in res.text, "Expected Vardhman Infotech to be identified as SLA breach vendor!"
    assert "16-day lead time" in res.text or "16" in res.text
    assert "Strict 12-Day SLA Award" in res.text
    assert res.scenario_trigger == "vp_constrained_split"

    assert res.grounding is not None
    assert res.grounding["is_grounded"] is True
    print("  -> PASSED: Verified 12-day delivery SLA exclusion logic and Vardhman disqualification.")

def test_eval_ai_04_single_source_vs_split_award_grounding():
    print("[RUNNING] EVAL-AI-04: Single-Supplier vs. Split Award Cost Delta Grounding...")
    req = ChatRequest(message="What is the cost difference between single-supplier and split-supplier awards?")
    res = chat_with_aera(req)

    assert "Cost Difference: Single-Supplier vs. Strategic Split Award" in res.text
    assert "| Sourcing Strategy | Total Landed Spend |" in res.text
    assert "Strategic Split Award (Recommended)" in res.text
    assert "Single Source Award (Sole Supplier)" in res.text
    assert "Delta (Single-Source Premium)" in res.text

    assert res.grounding is not None
    assert res.grounding["is_grounded"] is True
    print("  -> PASSED: Verified HiGHS solver spend delta for single-source vs split award.")

def test_eval_ai_05_dynamic_custom_upload_mode_isolation():
    print("[RUNNING] EVAL-AI-05: Dynamic Custom Upload Mode Isolation (Zero Benchmark Leakage)...")
    try:
        # Simulate custom user uploaded quote
        normalizer_engine.raw_quotes = {
            "VEND-CUSTOM-99": {
                "vendor_name": "Zenith Cloud Tech",
                "commercial_terms": {
                    "incoterms": "DDP Delivered",
                    "payment_terms": "Net 30 Days",
                    "lead_time_days": 8
                },
                "items": [
                    {"line_number": 1, "is_bid_present": True, "raw_quoted_price": 98000.0, "quoted_uom": "ea", "confidence_score": 1.0},
                    {"line_number": 2, "is_bid_present": True, "raw_quoted_price": 72000.0, "quoted_uom": "ea", "confidence_score": 1.0}
                ]
            }
        }
        normalizer_engine.qualifications = {
            "VEND-CUSTOM-99": {
                "vendor_name": "Zenith Cloud Tech",
                "lead_time_days": 8,
                "defect_rate_pct": 0.5,
                "incoterms": "DDP Delivered",
                "audit_status": "QUALIFIED_AUDIT_PASSED"
            }
        }
        normalizer_engine.is_custom_mode = True

        req = ChatRequest(message="who has lowest quote for laptop")
        res = chat_with_aera(req)

        # Assertions
        assert "Zenith Cloud Tech" in res.text, "Expected custom supplier 'Zenith Cloud Tech' in response!"
        assert "| SKU | Model | Zenith |" in res.text, "Expected matrix header to contain 'Zenith'!"
        # Crucial check: benchmark vendors must NOT be present
        assert "Vardhman Infotech" not in res.text, "Benchmark vendor Vardhman leaked into custom mode!"
        assert "Shree Balaji" not in res.text, "Benchmark vendor Balaji leaked into custom mode!"
        
        # Grounding check
        assert res.grounding is not None
        assert "Zenith Cloud Tech" in res.grounding["verified_suppliers"]
        print("  -> PASSED: Custom uploaded supplier isolated cleanly with zero benchmark default leakage.")

    finally:
        # Always restore defaults after test
        normalizer_engine.reset_to_defaults()

def test_eval_ai_06_domain_guardrail_blocks_hallucinations():
    print("[RUNNING] EVAL-AI-06: Out-of-Domain Guardrail & Anti-Hallucination Shield...")
    normalizer_engine.reset_to_defaults()
    
    # Query completely outside procurement
    req = ChatRequest(message="write a poem about flowers and tell me who won the cricket match")
    res = chat_with_aera(req)

    assert "Enterprise Procurement Guardrail Active" in res.text, "Expected guardrail activation message!"
    assert "Enterprise RFx Master Matrix" in res.text
    assert res.grounding is not None
    assert "DOMAIN_BOUND_GUARDRAIL_ENFORCED" in res.grounding["guardrail_checks_passed"]
    print("  -> PASSED: Out-of-domain query successfully intercepted without hallucinating.")

def test_eval_ai_07_markdown_table_formatting_integrity():
    print("[RUNNING] EVAL-AI-07: Markdown Table Formatting & Structural Integrity...")
    req = ChatRequest(message="who has lowest quote for laptop")
    res = chat_with_aera(req)

    lines = [l.strip() for l in res.text.split("\n") if l.strip().startswith("|") and l.strip().endswith("|")]
    assert len(lines) >= 8, f"Expected at least 8 markdown table lines across summary & matrices, got {len(lines)}"

    # Verify each table line has valid columns
    for line in lines:
        cells = [c.strip() for c in line.split("|")[1:-1]]
        assert len(cells) >= 2, f"Invalid markdown table line: {line}"

    print("  -> PASSED: All table markdown rows strictly conform to standard pipe formatting.")

def test_eval_ai_08_price_variance_outlier_detection():
    print("[RUNNING] EVAL-AI-08: Price Variance & Commercial Outlier Detection...")
    req = ChatRequest(message="Which SKUs have unusually large price differences between vendors?")
    res = chat_with_aera(req)

    assert "Unusually Large Price Differences" in res.text
    assert "| Line | SKU | Description |" in res.text
    assert "Price Spread" in res.text
    assert res.grounding is not None
    assert res.grounding["is_grounded"] is True
    print("  -> PASSED: Successfully detected outlier spreads and anomaly root causes.")

def test_eval_ai_09_compuzone_conditional_rebate_impact():
    print("[RUNNING] EVAL-AI-09: CompuZone Footnote #3 Conditional Rebate Financial Impact...")
    req = ChatRequest(message="What is the impact if CompuZone conditional rebate is not achieved?")
    res = chat_with_aera(req)

    assert "CompuZone India Footnote #3: Conditional Rebate Analysis" in res.text
    assert "Scenario A: Rebate Not Achieved" in res.text
    assert "Scenario B: Rebate Achieved" in res.text
    assert "-₹4,500.00" in res.text or "-4.5%" in res.text
    assert res.grounding is not None
    assert res.grounding["is_grounded"] is True
    print("  -> PASSED: Verified Scenario A vs B financial modeling for conditional rebate.")

def test_eval_ai_10_dynamic_sample_questions_according_to_uploaded_quotes():
    print("[RUNNING] EVAL-AI-10: Dynamic Sample Questions Strictly Grounded in Uploaded Quotes...")
    # 1. Test Default Benchmark Mode
    normalizer_engine.reset_to_defaults()
    sq_default = get_sample_questions()
    assert sq_default["is_custom_mode"] is False
    assert sq_default["vendor_count"] == 5
    default_questions = sq_default["sample_questions"]
    labels = [q["label"] for q in default_questions]
    prompts = [q["prompt"] for q in default_questions]

    # Benchmark quotes contain CompuZone, so rebate question is present
    assert any("CompuZone" in l or "CompuZone" in p for l, p in zip(labels, prompts)), "Expected CompuZone rebate question in benchmark mode."
    # Benchmark quotes contain Vardhman (>12d lead time), so exclude >12 days SLA question is present
    assert any("12 days" in l or "12 days" in p for l, p in zip(labels, prompts)), "Expected 12-day SLA question in benchmark mode."

    # 2. Test Custom Upload Mode: User uploads quotes for "Zenith Cloud Tech" and "CyberDynamics Solutions"
    try:
        normalizer_engine.raw_quotes = {
            "VEND-CUSTOM-01": {
                "vendor_name": "Zenith Cloud Tech",
                "commercial_terms": {
                    "incoterms": "DDP Delivered",
                    "payment_terms": "Net 30 Days",
                    "lead_time_days": 8
                },
                "items": [
                    {"line_number": 1, "is_bid_present": True, "raw_quoted_price": 95000.0, "quoted_uom": "ea", "confidence_score": 1.0},
                    {"line_number": 2, "is_bid_present": True, "raw_quoted_price": 68000.0, "quoted_uom": "ea", "confidence_score": 1.0}
                ]
            },
            "VEND-CUSTOM-02": {
                "vendor_name": "CyberDynamics Solutions",
                "commercial_terms": {
                    "incoterms": "DDP Delivered",
                    "payment_terms": "Net 45 Days",
                    "lead_time_days": 10
                },
                "items": [
                    {"line_number": 1, "is_bid_present": True, "raw_quoted_price": 92000.0, "quoted_uom": "ea", "confidence_score": 1.0},
                    {"line_number": 2, "is_bid_present": True, "raw_quoted_price": 71000.0, "quoted_uom": "ea", "confidence_score": 1.0}
                ]
            }
        }
        normalizer_engine.qualifications = {
            "VEND-CUSTOM-01": {
                "vendor_name": "Zenith Cloud Tech",
                "lead_time_days": 8,
                "defect_rate_pct": 0.4,
                "incoterms": "DDP Delivered",
                "audit_status": "QUALIFIED_AUDIT_PASSED"
            },
            "VEND-CUSTOM-02": {
                "vendor_name": "CyberDynamics Solutions",
                "lead_time_days": 10,
                "defect_rate_pct": 0.6,
                "incoterms": "DDP Delivered",
                "audit_status": "QUALIFIED_AUDIT_PASSED"
            }
        }
        normalizer_engine.is_custom_mode = True

        sq_custom = get_sample_questions()
        assert sq_custom["is_custom_mode"] is True
        assert sq_custom["vendor_count"] == 2
        custom_questions = sq_custom["sample_questions"]
        c_labels = [q["label"] for q in custom_questions]
        c_prompts = [q["prompt"] for q in custom_questions]
        all_custom_text = " ".join(c_labels + c_prompts)

        # Questions MUST reference uploaded vendors
        assert "Zenith" in all_custom_text, "Sample questions must reference uploaded supplier 'Zenith'!"
        assert "CyberDynamics" in all_custom_text, "Sample questions must reference uploaded supplier 'CyberDynamics'!"
        assert any("Compare Zenith vs CyberDynamics" in l for l in c_labels), "Expected dynamic pairwise comparison chip for uploaded vendors!"

        # ZERO Leakage of Benchmark Defaults
        assert "CompuZone" not in all_custom_text, "Benchmark vendor CompuZone leaked into sample questions!"
        assert "Vardhman" not in all_custom_text, "Benchmark vendor Vardhman leaked into sample questions!"
        assert "Apex" not in all_custom_text, "Benchmark vendor Apex leaked into sample questions!"
        assert "Balaji" not in all_custom_text, "Benchmark vendor Balaji leaked into sample questions!"
        assert "National IT" not in all_custom_text, "Benchmark vendor National IT leaked into sample questions!"

        # Since neither vendor has a conditional rebate, NO rebate question should appear
        assert not any("rebate" in l.lower() for l in c_labels), "Non-existent rebate question should NOT be suggested for custom quotes!"

        # Since both vendors have lead times <= 10 days, delivery status confirms compliance rather than exclusion
        assert any("Delivery SLA" in l for l in c_labels)
        print("  -> PASSED: Verified sample questions adapt 100% dynamically to uploaded quotes with zero benchmark leakage.")
    finally:
        normalizer_engine.reset_to_defaults()

def test_eval_ai_11_ask_ai_sla_delivery_status_grounded_in_lead_times():
    print("[RUNNING] EVAL-AI-11: Delivery SLA Analytical Grounding in Uploaded Quotes...")
    try:
        normalizer_engine.raw_quotes = {
            "VEND-CUSTOM-01": {
                "vendor_name": "Zenith Cloud Tech",
                "commercial_terms": {"incoterms": "DDP", "payment_terms": "Net 30", "lead_time_days": 8},
                "items": [{"line_number": 1, "is_bid_present": True, "raw_quoted_price": 95000.0, "quoted_uom": "ea"}]
            }
        }
        normalizer_engine.qualifications = {
            "VEND-CUSTOM-01": {"vendor_name": "Zenith Cloud Tech", "lead_time_days": 8, "defect_rate_pct": 0.4, "audit_status": "QUALIFIED_AUDIT_PASSED"}
        }
        normalizer_engine.is_custom_mode = True

        req = ChatRequest(message="Do all uploaded suppliers comply with our 12-day delivery SLA?")
        res = chat_with_aera(req)

        assert "Delivery SLA Status: 100% Compliant" in res.text or "All active uploaded suppliers" in res.text
        assert "Zenith Cloud Tech" in res.text
        assert "Vardhman" not in res.text, "Vardhman must not be cited when custom quotes are uploaded!"
        assert res.grounding is not None
        assert res.grounding["is_grounded"] is True
        print("  -> PASSED: Delivery SLA status correctly grounded in custom uploaded quote lead times.")
    finally:
        normalizer_engine.reset_to_defaults()

def test_eval_ai_12_ask_ai_non_uploaded_rebate_verification():
    print("[RUNNING] EVAL-AI-12: Non-Uploaded Quote Verification (Anti-Hallucination)...")
    try:
        normalizer_engine.raw_quotes = {
            "VEND-CUSTOM-01": {
                "vendor_name": "Zenith Cloud Tech",
                "commercial_terms": {"incoterms": "DDP", "payment_terms": "Net 30", "lead_time_days": 8},
                "items": [{"line_number": 1, "is_bid_present": True, "raw_quoted_price": 95000.0, "quoted_uom": "ea"}]
            }
        }
        normalizer_engine.qualifications = {
            "VEND-CUSTOM-01": {"vendor_name": "Zenith Cloud Tech", "lead_time_days": 8, "defect_rate_pct": 0.4, "audit_status": "QUALIFIED_AUDIT_PASSED"}
        }
        normalizer_engine.is_custom_mode = True

        # Query specifically about CompuZone when only Zenith is uploaded
        req = ChatRequest(message="What is the impact if CompuZone conditional rebate is not achieved?")
        res = chat_with_aera(req)

        assert "not part of the currently uploaded quotations" in res.text or "not among the uploaded" in res.text
        assert "Zenith Cloud Tech" in res.text
        assert res.grounding is not None
        assert res.grounding["is_grounded"] is True
        print("  -> PASSED: Verified clean verification that non-uploaded quote is not present.")
    finally:
        normalizer_engine.reset_to_defaults()

if __name__ == "__main__":
    print("==================================================================")
    print("   AERA COPILOT INTELLIGENCE: EVALUATION & GUARDRAILS TEST SUITE   ")
    print("==================================================================")
    test_eval_ai_01_lowest_laptop_quote_grounding()
    test_eval_ai_02_cheapest_unconstrained_optimization()
    test_eval_ai_03_sla_lead_time_exclusion_grounding()
    test_eval_ai_04_single_source_vs_split_award_grounding()
    test_eval_ai_05_dynamic_custom_upload_mode_isolation()
    test_eval_ai_06_domain_guardrail_blocks_hallucinations()
    test_eval_ai_07_markdown_table_formatting_integrity()
    test_eval_ai_08_price_variance_outlier_detection()
    test_eval_ai_09_compuzone_conditional_rebate_impact()
    test_eval_ai_10_dynamic_sample_questions_according_to_uploaded_quotes()
    test_eval_ai_11_ask_ai_sla_delivery_status_grounded_in_lead_times()
    test_eval_ai_12_ask_ai_non_uploaded_rebate_verification()
    print("==================================================================")
    print(" >>> ALL 12 ASK AI GROUNDING & GUARDRAIL EVALS PASSED (100%) <<<")
    print("==================================================================")
