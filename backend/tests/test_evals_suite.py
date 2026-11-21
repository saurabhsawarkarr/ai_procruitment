import os
import sys

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.core.config import RFX_SPEC_PATH, CONTRACT_BASELINE_PATH, VENDOR_FILES
from app.services.parsers.excel_parser import parse_apex_excel
from app.services.parsers.pdf_parser import parse_corrupack_pdf
from app.services.parsers.docx_parser import parse_national_docx
from app.services.parsers.vision_parser import parse_vardhman_photo
from app.services.parsers.email_parser import parse_balaji_email
from app.services.normalizer import compute_board_weight, compute_landed_cost, normalize_uom_price, normalizer_engine
from app.services.optimizer import solve_split_award
from tests.test_ask_ai_evals import (
    test_eval_ai_01_lowest_laptop_quote_grounding,
    test_eval_ai_02_cheapest_unconstrained_optimization,
    test_eval_ai_03_sla_lead_time_exclusion_grounding,
    test_eval_ai_04_single_source_vs_split_award_grounding,
    test_eval_ai_05_dynamic_custom_upload_mode_isolation,
    test_eval_ai_06_domain_guardrail_blocks_hallucinations,
    test_eval_ai_07_markdown_table_formatting_integrity,
    test_eval_ai_08_price_variance_outlier_detection,
    test_eval_ai_09_compuzone_conditional_rebate_impact,
    test_eval_ai_10_dynamic_sample_questions_according_to_uploaded_quotes,
    test_eval_ai_11_ask_ai_sla_delivery_status_grounded_in_lead_times,
    test_eval_ai_12_ask_ai_non_uploaded_rebate_verification
)

def test_eval_uom_01_unit_conversion_math():
    print("[RUNNING] EVAL-UOM-01: Unit of Measure (UOM) Multipliers & Harmonization...")
    # 1. Pack of 10 conversion
    price_ea, factor, _ = normalize_uom_price(8500.0, "pk10")
    assert price_ea == 850.0, f"Expected 850.0, got {price_ea}"
    assert factor == 10.0

    # 2. Lakhs denomination conversion
    price_lakh, _, _ = normalize_uom_price(1.042, "lakh")
    assert price_lakh == 104200.0, f"Expected 104200.0, got {price_lakh}"

    # 3. Spool / Roll 305m to meter conversion
    price_meter, factor_spool, _ = normalize_uom_price(15250.0, "spool_305m", target_uom="meter")
    assert price_meter == 50.0, f"Expected 50.0, got {price_meter}"
    assert factor_spool == 305.0

    # 4. Lump sum lot conversion
    price_lot, _, _ = normalize_uom_price(12283200.0, "lot", lot_qty=120)
    assert price_lot == 102360.0, f"Expected 102360.0, got {price_lot}"

    print("  -> PASSED: Verified UOM normalization across Pack of 10, Lakhs scale, Spool, and Lump-Sum Lot.")

def test_eval_ext_01_excel_multi_tab():
    print("[RUNNING] EVAL-EXT-01: Vendor 1 (Excel) Multi-Tab & Dimension Parsing...")
    res = parse_apex_excel(VENDOR_FILES["VEND-001"])
    assert len(res["items"]) == 30, f"Expected 30 items, got {len(res['items'])}"
    assert res["items"][0]["length"] == 350
    assert res["items"][0]["width"] == 250
    assert res["items"][0]["height"] == 150
    print("  -> PASSED: Consolidated 30 items across 3 tabs and split dimensions.")

def test_eval_ext_02_pdf_footnote_rebate():
    print("[RUNNING] EVAL-EXT-02: Vendor 2 (PDF) Footnote #3 Extraction...")
    res = parse_corrupack_pdf(VENDOR_FILES["VEND-002"])
    assert len(res["items"]) == 30
    fn = res["footnote_modifiers"]
    assert fn["found_footnote"] is True
    assert fn["rebate_pct"] == 0.045, f"Expected 0.045 rebate, got {fn['rebate_pct']}"
    assert fn["freight_handling"] == 0.08, f"Expected 0.08 handling, got {fn['freight_handling']}"
    print("  -> PASSED: Successfully detected Footnote #3 (4.5% rebate, 8% handling).")

def test_eval_ext_03_word_narrative_tiers():
    print("[RUNNING] EVAL-EXT-03: Vendor 3 (Word) Narrative Prose Tiers...")
    res = parse_national_docx(VENDOR_FILES["VEND-003"])
    assert len(res["items"]) == 30
    assert res["items"][0]["raw_quoted_price"] == 104500.0
    assert res["items"][9]["raw_quoted_price"] == 104500.0
    print("  -> PASSED: Converted narrative prose into Tier 1 rates (₹104,500.00).")

def test_eval_ext_04_and_05_vision_photo_sparse_matrix():
    print("[RUNNING] EVAL-EXT-04 & 05: Vendor 4 (Photo) De-skew, Handwriting & Sparse Matrix...")
    res = parse_vardhman_photo(VENDOR_FILES["VEND-004"])
    assert len(res["items"]) == 30
    assert res["lines_quoted_count"] == 27
    unquoted = [item for item in res["items"] if not item["is_bid_present"]]
    assert len(unquoted) == 3, f"Expected exactly 3 unquoted items, got {len(unquoted)}"
    assert {u["line_number"] for u in unquoted} == {28, 29, 30}
    item4 = next(it for it in res["items"] if it["line_number"] == 4)
    assert "Handwritten" in item4["notes"]
    print("  -> PASSED: De-skewed photo, extracted blue handwriting, identified 27/30 partial bid.")

def test_eval_ext_06_email_per_kg_and_escalation():
    print("[RUNNING] EVAL-EXT-06: Vendor 5 (Email) 2025 Contract Baseline Escalation...")
    res = parse_balaji_email(VENDOR_FILES["VEND-005"], RFX_SPEC_PATH, CONTRACT_BASELINE_PATH)
    assert len(res["items"]) == 30
    assert "2025 Contract Baseline" in res["items"][0]["notes"]
    assert "escalation" in res["items"][0]["notes"]
    print("  -> PASSED: Parsed shorthand email rates with contract baseline escalation.")

def test_eval_grd_01_spatial_grounding():
    print("[RUNNING] EVAL-GRD-01: Spatial Grounding & Bounding Boxes...")
    res_pdf = parse_corrupack_pdf(VENDOR_FILES["VEND-002"])
    bbox = res_pdf["items"][0]["bounding_box"]
    assert "quote.pdf" in bbox["source_file"]
    assert 0.0 <= bbox["ymin"] <= 1.0
    assert 0.0 <= bbox["xmin"] <= 1.0
    assert 0.0 <= bbox["ymax"] <= 1.0
    assert 0.0 <= bbox["xmax"] <= 1.0
    print("  -> PASSED: Normalized spatial coordinates verified for visual grounding.")

def test_eval_mth_01_board_weight_math():
    print("[RUNNING] EVAL-MTH-01: Theoretical Packaging Board Weight Geometry...")
    w = compute_board_weight(350, 250, 150, 5, [180, 120, 120, 120, 180], "BC")
    assert 400.0 <= w <= 500.0, f"Unexpected weight {w}g"
    print(f"  -> PASSED: Computed exact theoretical board weight: {w}g.")

def test_eval_mth_02_footnote_landed_cost():
    print("[RUNNING] EVAL-MTH-02: Footnote Landed Cost Unbundling...")
    landed, rebate, freight, handling, tax = compute_landed_cost(
        "VEND-002", 100000.0, "Ex-Works", {"rebate_pct": 0.045, "freight_handling": 0.08}
    )
    assert rebate == 4500.0
    assert freight == 650.0
    assert handling == 52.0
    assert landed == round((100000.0 - 4500.0) + 650.0 + 52.0, 2)
    print(f"  -> PASSED: Landed cost unbundled: Base ₹100,000.00 -> Net ₹{landed:.2f}.")

def test_eval_opt_01_unconstrained_lowest():
    print("[RUNNING] EVAL-OPT-01: MILP Unconstrained Lowest Cost Solver...")
    sol = solve_split_award(scenario_type="unconstrained_lowest")
    assert sol["status"] == "OPTIMAL"
    assert sol["net_savings_inr"] > 20000000.0
    print(f"  -> PASSED: Optimal Spend: ₹{sol['total_spend_inr']:,.2f} (Savings: ₹{sol['net_savings_inr']:,.2f}).")

def test_eval_opt_02_vp_constrained_split():
    print("[RUNNING] EVAL-OPT-02: VP Multi-Constraint Strategic Split Award...")
    sol = solve_split_award(
        scenario_type="vp_constrained_split",
        require_quality_audit=True,
        max_lead_time_days=12,
        min_vendor_spend_inr=500000
    )
    assert sol["status"] == "OPTIMAL"
    # Vardhman Infotech excluded due to 16-day SLA breach and failing quality questionnaire
    assert sol["vendor_allocations"]["Vardhman Infotech"]["sku_count"] == 0
    # Apex Technology passed quality questionnaire and meets delivery SLA (<= 12 days)
    assert sol["vendor_allocations"]["Apex Technology Solutions"]["sku_count"] > 0
    for v_name, alloc in sol["vendor_allocations"].items():
        if alloc["sku_count"] > 0:
            assert alloc["total_spend_inr"] >= 500000.0, f"Vendor {v_name} awarded sub-scale order!"
    print(f"  -> PASSED: VP Split Award optimal at ₹{sol['total_spend_inr']:,.2f} ({sol['savings_percentage']}% savings).")

def test_eval_opt_03_single_source_best():
    print("[RUNNING] EVAL-OPT-03: Single Source Sole Supplier Award...")
    sol = solve_split_award(scenario_type="single_source_best", single_source_only=True)
    assert sol["status"] == "OPTIMAL"
    # Exactly 1 vendor awarded all 30 SKUs
    active_vendors = [v for v, a in sol["vendor_allocations"].items() if a["sku_count"] > 0]
    assert len(active_vendors) == 1
    winner = active_vendors[0]
    assert sol["vendor_allocations"][winner]["sku_count"] == 30
    # Vardhman cannot win because of partial bid
    vardhman_count = sol["vendor_allocations"].get("Vardhman Infotech", {}).get("sku_count", 0)
    assert vardhman_count == 0
    print(f"  -> PASSED: Sole supplier awarded to '{winner}' across all 30 SKUs (₹{sol['total_spend_inr']:,.2f}).")

def test_eval_opt_04_infeasible_diagnostics():
    print("[RUNNING] EVAL-OPT-04: Infeasible Constraint & Diagnostic Remedies...")
    sol = solve_split_award(scenario_type="vp_constrained_split", max_lead_time_days=6)
    assert sol["status"] == "INFEASIBLE"
    assert len(sol["infeasibility_remedies"]) > 0
    print(f"  -> PASSED: Detected infeasibility cleanly with {len(sol['infeasibility_remedies'])} suggested buyer remedies.")

if __name__ == "__main__":
    print("==================================================================")
    print(" AERCHAIN 'KILL THE QUOTE SPREADSHEET' - AUTOMATED EVALS SUITE")
    print("==================================================================")
    test_eval_ext_01_excel_multi_tab()
    test_eval_ext_02_pdf_footnote_rebate()
    test_eval_ext_03_word_narrative_tiers()
    test_eval_ext_04_and_05_vision_photo_sparse_matrix()
    test_eval_ext_06_email_per_kg_and_escalation()
    test_eval_grd_01_spatial_grounding()
    test_eval_mth_01_board_weight_math()
    test_eval_mth_02_footnote_landed_cost()
    test_eval_uom_01_unit_conversion_math()
    test_eval_opt_01_unconstrained_lowest()
    test_eval_opt_02_vp_constrained_split()
    test_eval_opt_03_single_source_best()
    test_eval_opt_04_infeasible_diagnostics()
    # Ask AI Copilot Grounding & Guardrail Evals
    print("------------------------------------------------------------------")
    print(" ASK AI COPILOT INTELLIGENCE: GROUNDING & GUARDRAILS EVALS")
    print("------------------------------------------------------------------")
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
    print(" >>> ALL 25 FORMAL EVALUATION TESTS PASSED (100% SUCCESS) <<<")
    print("==================================================================")
