import sys
import os

backend_dir = os.path.abspath("backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.normalizer import normalizer_engine
from app.services.optimizer import solve_split_award

normalizer_engine.reset_to_defaults()
matrix = normalizer_engine.normalize_matrix()
rows = matrix["rows"]

total_baseline = sum(r["annual_volume"] * r["historical_baseline_inr"] for r in rows)
print(f"1. Matrix Total Baseline Spend: INR {total_baseline:,.2f}")

res = solve_split_award("vp_constrained_split", require_quality_audit=True, max_lead_time_days=12, min_vendor_spend_inr=500000)

print(f"2. Solver Baseline Spend:       INR {res['baseline_spend_inr']:,.2f}")
print(f"3. Solver Total Spend:          INR {res['total_spend_inr']:,.2f}")
print(f"4. Solver Net Savings:          INR {res['net_savings_inr']:,.2f}")
print(f"5. Solver Savings %:            {res['savings_percentage']}%")

# Check sum of vendor allocations
alloc_sum = sum(v["total_spend_inr"] for v in res["vendor_allocations"].values())
print(f"6. Sum of Vendor Allocations:   INR {alloc_sum:,.2f}")

# Check sum of line allocations
line_sum = sum(l["annual_spend_inr"] for l in res["line_allocations"])
print(f"7. Sum of Line Allocations:     INR {line_sum:,.2f}")

line_savings_sum = sum(l["savings_vs_baseline_inr"] for l in res["line_allocations"])
print(f"8. Sum of Line Savings:         INR {line_savings_sum:,.2f}")

# Reconcile checks
assert round(total_baseline, 2) == round(res['baseline_spend_inr'], 2), f"Baseline mismatch: {total_baseline} vs {res['baseline_spend_inr']}"
assert round(res['total_spend_inr'], 2) == round(alloc_sum, 2), f"Vendor allocations mismatch: {res['total_spend_inr']} vs {alloc_sum}"
assert round(res['total_spend_inr'], 2) == round(line_sum, 2), f"Line allocations spend mismatch: {res['total_spend_inr']} vs {line_sum}"
assert round(res['net_savings_inr'], 2) == round(line_savings_sum, 2), f"Line savings mismatch: {res['net_savings_inr']} vs {line_savings_sum}"
assert round(res['baseline_spend_inr'] - res['total_spend_inr'], 2) == round(res['net_savings_inr'], 2), f"Net savings mismatch: {res['baseline_spend_inr'] - res['total_spend_inr']} vs {res['net_savings_inr']}"

print("\n>>> ALL FINANCIAL RECONCILIATIONS MATCH 100% TO THE EXACT CENT! <<<")
print("\nVendor breakdown:")
for v_name, alloc in res["vendor_allocations"].items():
    if alloc["sku_count"] > 0:
        print(f"  * {v_name}: {alloc['sku_count']} SKUs, INR {alloc['total_spend_inr']:,.2f} ({alloc['share_pct']}%)")
print("\n--- All Scenarios Reconciliation ---")
for sc in ["cheapest_unconstrained", "vp_constrained_split", "sole_supplier"]:
    r = solve_split_award(sc)
    print(f"Scenario '{sc}': Total Spend = INR {r['total_spend_inr']:,.2f} | Net Savings = INR {r['net_savings_inr']:,.2f} ({r['savings_percentage']}%)")
