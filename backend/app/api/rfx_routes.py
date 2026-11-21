from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from app.services.normalizer import normalizer_engine

router = APIRouter(prefix="/api/rfx", tags=["RFx Management"])

@router.get("")
def get_rfx_specification() -> Dict[str, Any]:
    """Returns the master 30 SKU Enterprise IT Hardware & Client Compute catalog."""
    return normalizer_engine.rfx_spec

@router.get("/matrix")
def get_quote_matrix() -> Dict[str, Any]:
    """Returns the unified 30-SKU by 5-Vendor Quote Analysis Master Matrix with badging & quarantine metadata."""
    return normalizer_engine.normalize_matrix()

@router.get("/vendors")
def get_vendor_profiles() -> Dict[str, Any]:
    """Returns qualitative audit profiles for the Questionnaire comparison sub-grid."""
    return normalizer_engine.qualifications

@router.get("/quarantine")
def get_quarantine_items() -> Dict[str, Any]:
    """Returns all items currently in Ambiguity Quarantine requiring Human-in-the-Loop review."""
    matrix = normalizer_engine.normalize_matrix()
    quarantined = []
    for row in matrix["rows"]:
        for v_id, q in row["quotes"].items():
            if q.get("quarantine_reasons"):
                quarantined.append({
                    "line_number": row["line_number"],
                    "sku_code": row["sku_code"],
                    "description": row["description"],
                    "vendor_id": v_id,
                    "vendor_name": q["vendor_name"],
                    "reasons": q["quarantine_reasons"],
                    "quoted_price": q.get("base_unit_price_inr"),
                    "landed_cost": q.get("landed_cost_unit_inr"),
                    "bounding_box": q.get("bounding_box"),
                    "notes": q.get("notes")
                })
    return {"count": len(quarantined), "items": quarantined}
