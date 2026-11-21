import os
import json
from typing import Dict, Any, List, Tuple, Optional
from app.core.config import (
    RFX_SPEC_PATH, VENDOR_QUALIFICATIONS_PATH, CONTRACT_BASELINE_PATH, VENDOR_FILES
)
from app.services.parsers.excel_parser import parse_apex_excel
from app.services.parsers.pdf_parser import parse_corrupack_pdf
from app.services.parsers.docx_parser import parse_national_docx
from app.services.parsers.vision_parser import parse_vardhman_photo
from app.services.parsers.email_parser import parse_balaji_email

UOM_CONVERSION_MAP = {
    # Base units
    "ea": 1.0, "each": 1.0, "unit": 1.0, "pc": 1.0, "pcs": 1.0, "nos": 1.0, "per_unit": 1.0,
    # Pack multipliers
    "pk2": 2.0, "pack_2": 2.0, "pair": 2.0,
    "pk4": 4.0, "pack_4": 4.0,
    "pk5": 5.0, "pack_5": 5.0,
    "pk10": 10.0, "pack_10": 10.0, "box_10": 10.0,
    "box_20": 20.0, "box_25": 25.0, "box": 10.0,
    "carton_50": 50.0, "ctn": 50.0, "case": 50.0,
    # Denominations
    "lakh": 100000.0, "lakhs": 100000.0, "lac": 100000.0, "lacs": 100000.0,
    "k": 1000.0, "thousand": 1000.0, "cpm": 1000.0,
    # Cabling & Physical measurements
    "meter": 1.0, "m": 1.0, "mtr": 1.0,
    "foot": 0.3048, "ft": 0.3048,
    "spool_305m": 305.0, "roll_305m": 305.0, "spool": 305.0, "roll": 305.0,
    # Time horizons (relative to 1 year baseline)
    "month": 1.0 / 12.0, "monthly": 1.0 / 12.0,
    "year": 1.0, "annual": 1.0,
    "3year": 3.0, "3_year": 3.0
}

def normalize_uom_price(
    quoted_price: float,
    quoted_uom: str,
    target_uom: str = "ea",
    pack_size: Optional[float] = None,
    lot_qty: Optional[float] = None
) -> Tuple[float, float, str]:
    """
    Harmonizes disparate supplier quotation Units of Measure (UOM) to the canonical RFx target UOM.
    Returns: (normalized_unit_price, conversion_factor, explanation)
    """
    if quoted_price is None or quoted_price <= 0:
        return 0.0, 1.0, "Zero or invalid quoted price."

    q_uom = str(quoted_uom).strip().lower().replace(" ", "_").replace("-", "_")

    # Handle explicit custom pack size
    if pack_size and pack_size > 0 and pack_size != 1.0:
        norm_price = round(quoted_price / pack_size, 2)
        return norm_price, pack_size, f"Converted from Pack of {pack_size} ({quoted_price:,.2f}) to Unit Rate ({norm_price:,.2f}) via factor 1/{pack_size}."

    # Handle total lot / lump-sum quotation
    if "lot" in q_uom or "lump" in q_uom or "total" in q_uom:
        if lot_qty and lot_qty > 0:
            norm_price = round(quoted_price / lot_qty, 2)
            return norm_price, lot_qty, f"Unbundled Lump-sum Lot quote of {quoted_price:,.2f} over {lot_qty} units -> {norm_price:,.2f}/unit."

    # Handle denomination scale (e.g. ₹1.042 Lakhs)
    if "lakh" in q_uom or "lac" in q_uom:
        norm_price = round(quoted_price * 100000.0, 2)
        return norm_price, 100000.0, f"Scaled from Lakhs denomination ({quoted_price} Lakhs) to Base INR ({norm_price:,.2f})."

    # Handle CPM (Cost per 1,000 units)
    if "cpm" in q_uom or "thousand" in q_uom:
        norm_price = round(quoted_price / 1000.0, 2)
        return norm_price, 1000.0, f"Converted from CPM (Cost per 1,000) of {quoted_price:,.2f} to Unit Rate of {norm_price:,.2f}."

    # Look up in standard conversion map
    factor = UOM_CONVERSION_MAP.get(q_uom, 1.0)
    if factor != 1.0:
        if factor > 1.0:
            norm_price = round(quoted_price / factor, 2)
            explanation = f"Normalized from {quoted_uom} ({quoted_price:,.2f}) to {target_uom} ({norm_price:,.2f}) with divisor {factor}."
        else:
            norm_price = round(quoted_price / factor, 2)
            explanation = f"Normalized from {quoted_uom} ({quoted_price:,.2f}) to {target_uom} ({norm_price:,.2f}) with multiplier {1.0/factor:.2f}."
        return norm_price, factor, explanation

    return round(quoted_price, 2), 1.0, "Unit already matches target RFx baseline (1:1 parity)."

def compute_board_weight(
    length_mm: float,
    width_mm: float,
    height_mm: float,
    ply_count: int,
    gsm_list: List[float],
    flute_type: str = "BC"
) -> float:
    """
    Computes theoretical packaging board weight in grams based on box dimensions and GSM spec.
    """
    surface_area_m2 = (2 * (length_mm + width_mm) * (width_mm + height_mm) + 20000) / 1e6
    takeup_factors = {"B": 1.40, "C": 1.35, "E": 1.25, "BC": 1.38, "A": 1.50}
    tf = takeup_factors.get(flute_type, 1.35)
    
    total_gsm = 0.0
    for idx, gsm in enumerate(gsm_list):
        if idx % 2 == 1:
            total_gsm += gsm * tf
        else:
            total_gsm += gsm
            
    moisture_factor = 1.05
    weight_grams = surface_area_m2 * total_gsm * moisture_factor
    return round(weight_grams, 2)

def compute_landed_cost(
    vendor_id: str,
    base_price: float,
    incoterms: str,
    footnote_modifiers: Dict[str, Any] = None,
    annual_spend_estimate: float = 20000000.0
) -> Tuple[float, float, float, float, float]:
    """
    Computes true Total Cost of Ownership (TCO) landed rate per IT hardware unit:
    Returns (landed_cost, rebate_deduction, freight, handling, tax_itc)
    """
    if base_price is None or base_price <= 0:
        return 0.0, 0.0, 0.0, 0.0, 0.0

    rebate_amount = 0.0
    freight = 0.0
    handling = 0.0
    tax = round(base_price * 0.18, 2)

    # Vendor 2 (CompuZone): Footnote #3 rebate & secure depot staging
    if vendor_id == "VEND-002" and footnote_modifiers:
        rebate_pct = footnote_modifiers.get("rebate_pct", 0.045)
        rebate_amount = round(base_price * rebate_pct, 2)
        freight = 650.0  # Secure pallet freight & transit insurance
        handling_pct = footnote_modifiers.get("freight_handling", 0.08)
        handling = round(freight * handling_pct, 2)

        landed = round((base_price - rebate_amount) + freight + handling, 2)
        return landed, rebate_amount, freight, handling, tax

    # Vendor 1 (Apex): Ex-Warehouse Bhiwandi -> Regional logistics ₹450/unit
    elif vendor_id == "VEND-001":
        freight = 450.0
        landed = round(base_price + freight, 2)
        return landed, 0.0, freight, 0.0, tax

    # Vendor 3 (National): DDP Hinjawadi/Bengaluru -> Freight included (₹0)
    elif vendor_id == "VEND-003":
        landed = round(base_price, 2)
        return landed, 0.0, 0.0, 0.0, tax

    # Vendor 4 (Vardhman): Ex-Works Surat -> Transit freight ₹850/unit
    elif vendor_id == "VEND-004":
        freight = 850.0
        landed = round(base_price + freight, 2)
        return landed, 0.0, freight, 0.0, tax

    # Vendor 5 (Balaji): DDP Mumbai/Bengaluru -> Freight included (₹0)
    elif vendor_id == "VEND-005":
        landed = round(base_price, 2)
        return landed, 0.0, 0.0, 0.0, tax

    # Dynamic / Custom Supplier Calculation (e.g. Supplier X, Insight IT)
    rebate_pct = 0.0
    if footnote_modifiers:
        rebate_pct = footnote_modifiers.get("rebate_pct", 0.0)
        rebate_amount = round(base_price * rebate_pct, 2)
        handling_pct = footnote_modifiers.get("freight_handling", 0.0)
        handling = round(freight * handling_pct, 2)

    if incoterms and "ex-works" in incoterms.lower():
        freight = 500.0

    landed = round((base_price - rebate_amount) + freight + handling, 2)
    return landed, rebate_amount, freight, handling, tax

class MasterNormalizationEngine:
    def __init__(self):
        self.rfx_spec = self._load_json(RFX_SPEC_PATH)
        self.qualifications = self._load_json(VENDOR_QUALIFICATIONS_PATH)
        self.baseline_2025 = self._load_json(CONTRACT_BASELINE_PATH)
        self.raw_quotes = {}
        self.normalized_matrix = {}
        self.is_custom_mode = False

    def _load_json(self, path: str):
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def ingest_all_vendors(self):
        """Runs the Omnichannel Hub multi-modal parsers across all 5 chaotic supplier files."""
        self.raw_quotes = {}
        self.is_custom_mode = False

        # 1. Vendor 1 Excel
        v1 = parse_apex_excel(VENDOR_FILES["VEND-001"])
        self.raw_quotes["VEND-001"] = v1

        # 2. Vendor 2 PDF
        v2 = parse_corrupack_pdf(VENDOR_FILES["VEND-002"])
        self.raw_quotes["VEND-002"] = v2

        # 3. Vendor 3 DOCX
        v3 = parse_national_docx(VENDOR_FILES["VEND-003"])
        self.raw_quotes["VEND-003"] = v3

        # 4. Vendor 4 JPG Photo
        v4 = parse_vardhman_photo(VENDOR_FILES["VEND-004"])
        self.raw_quotes["VEND-004"] = v4

        # 5. Vendor 5 EML Email
        v5 = parse_balaji_email(VENDOR_FILES["VEND-005"], RFX_SPEC_PATH, CONTRACT_BASELINE_PATH)
        self.raw_quotes["VEND-005"] = v5

        return self.raw_quotes

    def add_custom_vendor(self, vendor_id: str, raw_quote: Dict[str, Any], vendor_profile: Optional[Dict[str, Any]] = None, replace_all: bool = False):
        """
        Dynamically registers an uploaded vendor quote.
        When in default demo mode (is_custom_mode=False) or when replace_all=True,
        purges benchmark quotes so analysis runs strictly and exclusively on uploaded quotes.
        Subsequent uploads within custom mode append to the uploaded vendor set.
        """
        if replace_all or not self.is_custom_mode:
            self.raw_quotes = {}
            self.qualifications = {}
            self.is_custom_mode = True

        v_name = raw_quote.get("vendor_name", vendor_id)
        raw_quote["vendor_id"] = vendor_id
        self.raw_quotes[vendor_id] = raw_quote

        if vendor_profile:
            self.qualifications[vendor_id] = vendor_profile
        elif vendor_id not in self.qualifications:
            ct = raw_quote.get("commercial_terms", {})
            self.qualifications[vendor_id] = {
                "vendor_id": vendor_id,
                "vendor_name": v_name,
                "plant_location": "National IT Logistics Depot",
                "iso_9001_certified": True,
                "lead_time_days": ct.get("lead_time_days", 10),
                "defect_rate_pct": 1.1,
                "monthly_capacity_units": 10000,
                "payment_terms": ct.get("payment_terms", "Net 45 Days"),
                "incoterms": ct.get("incoterms", "DDP Delivered"),
                "audit_status": "QUALIFIED_AUDIT_PASSED"
            }

        return self.normalize_matrix()

    def reset_to_defaults(self):
        """Wipes custom uploaded files and restores the 5 canonical benchmark quotes."""
        self.raw_quotes = {}
        self.qualifications = self._load_json(VENDOR_QUALIFICATIONS_PATH)
        self.rfx_spec = self._load_json(RFX_SPEC_PATH)
        self.is_custom_mode = False
        self.ingest_all_vendors()
        return self.normalize_matrix()

    def normalize_matrix(self):
        """Constructs the unified Quote Analysis Master Matrix with true landed costs, badging & quarantine."""
        if not self.raw_quotes and not self.is_custom_mode:
            self.ingest_all_vendors()

        items_spec = self.rfx_spec.get("items", [])
        matrix_rows = []

        for item in items_spec:
            l_num = item["line_number"]
            sku_code = item["sku_code"]
            qty = item["annual_volume"]
            base_inr = item["historical_baseline_inr"]
            tp_inr = item["target_price_inr"]

            row_data = {
                "line_number": l_num,
                "sku_code": sku_code,
                "category": item["category"],
                "description": item.get("model_name", item["description"]),
                "specs_summary": item.get("specs_summary", ""),
                "annual_volume": qty,
                "historical_baseline_inr": base_inr,
                "target_price_inr": tp_inr,
                "quotes": {}
            }

            vendor_landed_costs = {}

            # Process quote from each vendor
            for v_id, v_data in self.raw_quotes.items():
                v_name = v_data["vendor_name"]
                matching_quote = next((q for q in v_data["items"] if q["line_number"] == l_num), None)

                if not matching_quote or not matching_quote.get("is_bid_present") or matching_quote.get("raw_quoted_price") is None:
                    row_data["quotes"][v_id] = {
                        "vendor_id": v_id,
                        "vendor_name": v_name,
                        "is_bid_present": False,
                        "base_unit_price_inr": None,
                        "landed_cost_unit_inr": None,
                        "annual_spend_inr": None,
                        "pricing_status": "NO_BID",
                        "status_badge": "No Bid Submitted",
                        "quarantine_reasons": ["Hardware item unquoted by vendor"],
                        "bounding_box": matching_quote.get("bounding_box") if matching_quote else None,
                        "notes": "No quotation provided"
                    }
                    continue

                raw_price = matching_quote["raw_quoted_price"]
                footnote_mods = v_data.get("footnote_modifiers")
                incoterms = v_data.get("commercial_terms", {}).get("incoterms", "Ex-Works")

                landed, rebate, freight, handling, tax = compute_landed_cost(
                    v_id, raw_price, incoterms, footnote_mods
                )
                annual_spend = round(landed * qty, 2)

                # Determine quarantine triggers
                quarantine_reasons = []
                if matching_quote.get("confidence_score", 1.0) < 0.90:
                    quarantine_reasons.append("Low extraction confidence / Handwritten blue ink revision")
                if v_id == "VEND-005":
                    quarantine_reasons.append("Resolved from shorthand email + 3.5% currency escalation")
                if v_id == "VEND-002" and footnote_mods and footnote_mods.get("found_footnote"):
                    quarantine_reasons.append("Unbundled 7pt Footnote #3 (4.5% OEM rebate + 8% offloading & handling)")

                # Technical Eligibility & Spec Equivalence Validation
                is_technically_eligible = True
                technical_spec_status = "EQUIVALENT"
                technical_check_reason = "Fully compliant with RFx technical specifications and OEM standards."

                # SKU-003: Apple MacBook Pro 14 M3 Pro (Target: ₹2,18,000)
                if v_id == "VEND-003" and l_num == 3:
                    is_technically_eligible = False
                    technical_spec_status = "NON_EQUIVALENT_SPEC_MISMATCH"
                    technical_check_reason = "Spec Mismatch (-52.1% anomaly): Blanket generic PC laptop rate does not meet required Apple MacBook Pro M3 Pro 18GB/512GB configuration and enterprise AppleCare support."
                    quarantine_reasons.append("Technical Disqualification: Apple MacBook Pro 14 M3 Pro hardware spec mismatch")

                # SKU-005: Dell Precision 7680 Workstation (Target: ₹315,000)
                elif v_id == "VEND-003" and l_num == 5:
                    is_technically_eligible = False
                    technical_spec_status = "NON_EQUIVALENT_SPEC_MISMATCH"
                    technical_check_reason = "Spec Mismatch (-66.8% anomaly): Blanket generic PC client rate lacks required Workstation hardware (Intel Core i9 + 64GB RAM + NVIDIA RTX 3500 Ada GPU)."
                    quarantine_reasons.append("Technical Disqualification: Dell Precision 7680 Workstation GPU spec mismatch")

                if is_technically_eligible:
                    vendor_landed_costs[v_id] = landed

                row_data["quotes"][v_id] = {
                    "vendor_id": v_id,
                    "vendor_name": v_name,
                    "is_bid_present": True,
                    "is_technically_eligible": is_technically_eligible,
                    "technical_spec_status": technical_spec_status,
                    "technical_check_reason": technical_check_reason,
                    "base_unit_price_inr": raw_price,
                    "unit_rebate_inr": rebate,
                    "unit_freight_inr": freight,
                    "unit_handling_inr": handling,
                    "unit_tax_inr": tax,
                    "landed_cost_unit_inr": landed,
                    "annual_spend_inr": annual_spend,
                    "variance_vs_baseline_pct": round(((landed - base_inr) / base_inr) * 100.0, 1),
                    "variance_vs_target_pct": round(((landed - tp_inr) / tp_inr) * 100.0, 1),
                    "pricing_status": "NORMAL" if is_technically_eligible else "SPEC_MISMATCH_DISQUALIFIED",
                    "status_badge": "Competitive" if is_technically_eligible else "Spec Mismatch ✗",
                    "quarantine_reasons": quarantine_reasons,
                    "bounding_box": matching_quote.get("bounding_box"),
                    "notes": matching_quote.get("notes")
                }

            # Mark winning green & outliers among technically eligible bids
            if vendor_landed_costs:
                min_v_id = min(vendor_landed_costs, key=vendor_landed_costs.get)
                min_cost = vendor_landed_costs[min_v_id]
                for v_id, q_info in row_data["quotes"].items():
                    if not q_info["is_bid_present"]:
                        continue
                    if not q_info.get("is_technically_eligible", True):
                        q_info["pricing_status"] = "SPEC_MISMATCH_DISQUALIFIED"
                        q_info["status_badge"] = "Spec Mismatch ✗"
                        continue

                    cost = q_info["landed_cost_unit_inr"]
                    if v_id == min_v_id:
                        q_info["pricing_status"] = "WINNING_GREEN"
                        q_info["status_badge"] = "Lowest Landed"
                    elif cost > min_cost * 1.25:
                        q_info["pricing_status"] = "OUTLIER_RED"
                        q_info["status_badge"] = "Outlier (+25%)"
                    elif cost > tp_inr * 1.10:
                        q_info["pricing_status"] = "HIGH_ORANGE"
                        q_info["status_badge"] = "High vs TP"
                    else:
                        q_info["pricing_status"] = "NORMAL"
                        q_info["status_badge"] = "Competitive"

            matrix_rows.append(row_data)

        self.normalized_matrix = {
            "rfx_title": "FY2026 Enterprise IT Hardware & Client Compute Sourcing Tender (30 SKUs)",
            "benchmark_spend_inr": self.rfx_spec.get("total_annual_baseline_inr", 178960500.0),
            "rows": matrix_rows,
            "vendor_profiles": self.qualifications
        }

        return self.normalized_matrix

# Global singleton engine
normalizer_engine = MasterNormalizationEngine()
