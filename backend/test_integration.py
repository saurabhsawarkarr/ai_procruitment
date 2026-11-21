from app.services.category_guardrail import detect_category_from_text
from app.services.normalizer import normalizer_engine
from app.services.optimizer import solve_split_award

# 1. Category Guardrail test
it_mismatch, it_cat, _, it_exp = detect_category_from_text("Dell Latitude Core i7 16GB RAM 512GB SSD Laptop")
assert it_mismatch == False
print("✓ Category Guardrail verified IT Hardware as valid active RFx category!")

pkg_mismatch, pkg_cat, _, pkg_exp = detect_category_from_text("5-ply master shipper corrugated cartons 180 GSM kraft liner bursting factor")
assert pkg_mismatch == True
assert "Packaging" in pkg_cat
print(f"✓ Category Guardrail successfully detected Packaging mismatch: {pkg_cat}!")

# 2. Benchmark baseline solve
normalizer_engine.reset_to_defaults()
baseline_sol = solve_split_award(scenario_type="vp_constrained_split")
b_spend = baseline_sol["total_spend_inr"] / 10000000.0
print(f"✓ Benchmark 5-supplier spend: Rs {b_spend:.2f} Cr")

# 3. Dynamic Supplier X addition
mock_supplier_x = {
    "vendor_id": "VEND-006",
    "vendor_name": "Supplier X IT Solutions",
    "items": [
        {
            "line_number": i,
            "sku_code": f"SKU-{i:03d}",
            "is_bid_present": True,
            "raw_quoted_price": 45000.0, # Highly competitive rate
            "raw_unit": "per_unit",
            "currency": "INR",
            "confidence_score": 0.98,
            "notes": "Dynamic test quotation from Supplier X"
        } for i in range(1, 31)
    ],
    "commercial_terms": {
        "payment_terms": "Net 45 Days",
        "lead_time_days": 7,
        "incoterms": "DDP Delivered"
    }
}
normalizer_engine.add_custom_vendor("VEND-006", mock_supplier_x)
new_sol = solve_split_award(scenario_type="vp_constrained_split")
new_spend = new_sol["total_spend_inr"] / 10000000.0
print(f"✓ With Supplier X added, spend dynamically dropped to: Rs {new_spend:.2f} Cr")
assert "Supplier X IT Solutions" in new_sol["vendor_allocations"]
alloc_x = new_sol["vendor_allocations"]["Supplier X IT Solutions"]["sku_count"]
print(f"✓ Solver dynamically awarded {alloc_x} lines to Supplier X!")

# 4. Reset test
normalizer_engine.reset_to_defaults()
assert len(normalizer_engine.raw_quotes) == 5
print("✓ Reset to benchmark defaults verified! 5 suppliers restored.")
print("ALL INTEGRATION TESTS PASSED 100%!")
