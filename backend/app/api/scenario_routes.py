from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from app.models.schemas import OptimizationScenarioRequest, OptimizationScenarioResult
from app.services.optimizer import solve_split_award

router = APIRouter(prefix="/api/scenarios", tags=["Scenario Optimization"])

@router.post("/solve")
def run_scenario_optimization(req: OptimizationScenarioRequest) -> Dict[str, Any]:
    """Runs MILP optimization with specified parameters."""
    result = solve_split_award(
        scenario_type=req.scenario_type,
        require_quality_audit=req.require_quality_audit,
        prefer_delivered_ddp=req.prefer_delivered_ddp,
        max_lead_time_days=req.max_lead_time_days,
        min_vendor_spend_inr=req.min_vendor_spend_inr,
        excluded_vendor_ids=req.excluded_vendor_ids
    )
    return result

@router.get("/presets")
def get_scenario_presets() -> Dict[str, Any]:
    """Returns the three standard enterprise baseline scenarios."""
    unconstrained = solve_split_award(scenario_type="unconstrained_lowest")
    vp_split = solve_split_award(scenario_type="vp_constrained_split", prefer_delivered_ddp=True, max_lead_time_days=12, min_vendor_spend_inr=500000)
    single_source = solve_split_award(scenario_type="single_source_best", single_source_only=True)

    return {
        "unconstrained_lowest": unconstrained,
        "vp_constrained_split": vp_split,
        "single_source_best": single_source
    }
