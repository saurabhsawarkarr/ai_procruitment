import sys
import os

# Ensure backend directory is in python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.parsers.excel_parser import parse_apex_excel
from app.services.parsers.pdf_parser import parse_corrupack_pdf
from app.services.parsers.docx_parser import parse_national_docx
from app.services.parsers.vision_parser import parse_vardhman_photo
from app.services.parsers.email_parser import parse_balaji_email
from app.services.normalizer import normalizer_engine, compute_board_weight, compute_landed_cost
from app.services.optimizer import solve_split_award

print("--- 1. Testing Vendor 1 Excel Parser ---")
v1 = parse_apex_excel(r"h:\Antigravity\Aerchain\dataset\vendor_1_apex_quote.xlsx")
print(f"Vendor 1 Items: {len(v1['items'])} | Tab 1 dim parsed: {v1['items'][0]['length']}x{v1['items'][0]['width']}x{v1['items'][0]['height']}")
assert len(v1["items"]) == 30

print("\n--- 2. Testing Vendor 2 PDF Parser & Footnote ---")
v2 = parse_corrupack_pdf(r"h:\Antigravity\Aerchain\dataset\vendor_2_corrupack_quote.pdf")
print(f"Vendor 2 Items: {len(v2['items'])} | Footnote Rebate: {v2['footnote_modifiers']['rebate_pct']*100}% | Handling: {v2['footnote_modifiers']['freight_handling']*100}%")
assert len(v2["items"]) == 30
assert v2["footnote_modifiers"]["rebate_pct"] == 0.045

print("\n--- 3. Testing Vendor 3 Word Parser ---")
v3 = parse_national_docx(r"h:\Antigravity\Aerchain\dataset\vendor_3_national_quote.docx")
print(f"Vendor 3 Items: {len(v3['items'])} | Item 1 Rate: ₹{v3['items'][0]['raw_quoted_price']}")
assert len(v3["items"]) == 30

print("\n--- 4. Testing Vendor 4 Vision Parser & Sparse Bid ---")
v4 = parse_vardhman_photo(r"h:\Antigravity\Aerchain\dataset\vendor_4_vardhman_quote.jpg")
unquoted = [item for item in v4["items"] if not item["is_bid_present"]]
print(f"Vendor 4 Items: {len(v4['items'])} | Quoted: {v4['lines_quoted_count']} | Unquoted (Sparse): {len(unquoted)}")
assert len(v4["items"]) == 30
assert len(unquoted) == 3
assert {u["line_number"] for u in unquoted} == {28, 29, 30}

print("\n--- 5. Testing Vendor 5 Email Parser ---")
v5 = parse_balaji_email(
    r"h:\Antigravity\Aerchain\dataset\vendor_5_balaji_quote.eml",
    r"h:\Antigravity\Aerchain\dataset\rfx_spec_30_skus.json",
    r"h:\Antigravity\Aerchain\dataset\contract_baseline_2025.json"
)
print(f"Vendor 5 Items: {len(v5['items'])} | Item 1 Converted Rate: ₹{v5['items'][0]['raw_quoted_price']}")
assert len(v5["items"]) == 30

print("\n--- 6. Testing Master Normalization Matrix ---")
matrix = normalizer_engine.normalize_matrix()
print(f"Normalized Matrix Rows: {len(matrix['rows'])} | Benchmark: ₹{matrix['benchmark_spend_inr']:,.2f}")
assert len(matrix["rows"]) == 30

print("\n--- 7. Testing MILP Optimization Solver ---")
# VP Constrained Split
vp_res = solve_split_award(scenario_type="vp_constrained_split", require_quality_audit=True, max_lead_time_days=12, min_vendor_spend_inr=500000)
print(f"VP Constrained Split: Status: {vp_res['status']} | Spend: ₹{vp_res['total_spend_inr']:,.2f} | Net Savings: ₹{vp_res['net_savings_inr']:,.2f} ({vp_res['savings_percentage']}%)")
for v_name, alloc in vp_res["vendor_allocations"].items():
    print(f"  -> {v_name}: {alloc['sku_count']} SKUs (₹{alloc['total_spend_inr']:,.2f}, {alloc['share_pct']}%)")

# Unconstrained Lowest
uncons_res = solve_split_award(scenario_type="unconstrained_lowest")
print(f"Unconstrained Lowest: Spend: ₹{uncons_res['total_spend_inr']:,.2f} | Net Savings: ₹{uncons_res['net_savings_inr']:,.2f} ({uncons_res['savings_percentage']}%)")

# Single Source Best
single_res = solve_split_award(scenario_type="single_source_best", single_source_only=True)
print(f"Single Source Best: Spend: ₹{single_res['total_spend_inr']:,.2f} | Net Savings: ₹{single_res['net_savings_inr']:,.2f} ({single_res['savings_percentage']}%)")

print("\n>>> ALL VERIFICATION TESTS PASSED! BACKEND SERVICES FULLY OPERATIONAL. <<<")
