from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Union

class RFxItem(BaseModel):
    line_number: int
    sku_code: str
    category: str
    description: str
    length_mm: int
    width_mm: int
    height_mm: int
    ply_count: int
    flute_type: str
    burst_factor: int
    gsm_specs: List[int]
    theoretical_board_weight_grams: float
    annual_volume: int
    historical_baseline_inr: float
    target_price_inr: float

class SpatialBoundingBox(BaseModel):
    page: Optional[int] = 1
    ymin: float
    xmin: float
    ymax: float
    xmax: float
    source_sheet: Optional[str] = None
    cell_reference: Optional[str] = None
    source_file: str

class RawQuoteLine(BaseModel):
    line_number: int
    sku_code: str
    is_bid_present: bool = True
    raw_quoted_price: Optional[float] = None
    raw_unit: str = "per_box"
    currency: str = "INR"
    extracted_text: str = ""
    confidence_score: float = 1.0
    bounding_box: Optional[SpatialBoundingBox] = None
    notes: Optional[str] = None

class NormalizedQuoteLine(BaseModel):
    line_number: int
    sku_code: str
    vendor_id: str
    vendor_name: str
    is_bid_present: bool
    base_unit_price_inr: Optional[float]
    unit_freight_inr: float = 0.0
    unit_rebate_inr: float = 0.0
    unit_handling_inr: float = 0.0
    unit_tax_inr: float = 0.0
    landed_cost_unit_inr: Optional[float]
    annual_spend_inr: Optional[float]
    variance_vs_baseline_pct: Optional[float]
    variance_vs_target_pct: Optional[float]
    pricing_status: str # "WINNING_GREEN", "OUTLIER_RED", "NORMAL", "NO_BID", "QUARANTINED"
    quarantine_reasons: List[str] = []
    bounding_box: Optional[SpatialBoundingBox] = None

class VendorAuditProfile(BaseModel):
    vendor_id: str
    vendor_name: str
    plant_location: str
    incoterms: Optional[str] = "DDP"
    lead_time_days: int
    quoted_sku_coverage: Optional[str] = "30 / 30 SKUs (100%)"
    monthly_capacity_units: Optional[int] = 10000
    monthly_capacity_cartons: Optional[int] = 10000
    payment_terms: str
    audit_status: str
    audit_notes: str
    iso_9001_certified: Optional[bool] = True
    defect_rate_pct: Optional[float] = 0.0
    on_time_delivery_pct: Optional[float] = 95.0

class OptimizationScenarioRequest(BaseModel):
    scenario_type: str = "vp_constrained_split" # "unconstrained_lowest", "vp_constrained_split", "single_source_best"
    require_quality_audit: bool = False
    prefer_delivered_ddp: bool = True
    max_lead_time_days: int = 12
    min_vendor_spend_inr: float = 500000.0
    excluded_vendor_ids: List[str] = []

class LineItemAllocation(BaseModel):
    line_number: int
    sku_code: str
    awarded_vendor_id: str
    awarded_vendor_name: str
    unit_price_inr: float
    annual_spend_inr: float
    savings_vs_baseline_inr: float

class OptimizationScenarioResult(BaseModel):
    scenario_type: str
    status: str # "OPTIMAL", "INFEASIBLE"
    total_spend_inr: float
    baseline_spend_inr: float
    net_savings_inr: float
    savings_percentage: float
    vendor_allocations: Dict[str, Dict[str, Any]] # vendor_name -> {sku_count, total_spend, share_pct}
    line_allocations: List[LineItemAllocation]
    explanation: str
    infeasibility_remedies: List[str] = []
