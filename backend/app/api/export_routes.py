import io
import datetime
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from fastapi import APIRouter, Response
from typing import Dict, Any
from app.services.optimizer import solve_split_award
from app.services.normalizer import normalizer_engine
from app.services.memo_generator import generate_board_award_memo_markdown

router = APIRouter(prefix="/api/export", tags=["Export & Audit"])

@router.get("/memo")
def export_award_memo(scenario: str = "vp_constrained_split") -> Response:
    """Exports the formal Board Award Memo as markdown text."""
    if scenario == "unconstrained_lowest":
        res = solve_split_award(scenario_type="unconstrained_lowest")
    elif scenario == "single_source_best":
        res = solve_split_award(scenario_type="single_source_best", single_source_only=True)
    else:
        res = solve_split_award(scenario_type="vp_constrained_split", require_quality_audit=True, max_lead_time_days=12, min_vendor_spend_inr=500000)

    memo_text = generate_board_award_memo_markdown(res)
    return Response(content=memo_text, media_type="text/markdown")

@router.get("/excel")
def export_award_excel(scenario: str = "vp_constrained_split") -> Response:
    """
    Exports the complete Quote Analysis Matrix and Award Allocation Schedule as an audit-ready Excel workbook.
    """
    if scenario == "unconstrained_lowest":
        res = solve_split_award(scenario_type="unconstrained_lowest")
    elif scenario == "single_source_best":
        res = solve_split_award(scenario_type="single_source_best", single_source_only=True)
    else:
        res = solve_split_award(scenario_type="vp_constrained_split", require_quality_audit=True, max_lead_time_days=12, min_vendor_spend_inr=500000)

    matrix_data = normalizer_engine.normalize_matrix()
    rows = matrix_data["rows"]

    wb = openpyxl.Workbook()
    # Sheet 1: Executive Summary
    ws1 = wb.active
    ws1.title = "Executive Award Summary"

    title_font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
    hdr_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
    hdr_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    ws1.cell(row=1, column=1, value="AERCHAIN STRATEGIC SOURCING AWARD MEMORANDUM").font = title_font
    ws1.cell(row=2, column=1, value=f"Tender: FY2026 Enterprise IT Hardware & Client Compute RFx (30 SKUs) | Scenario: {scenario}").font = Font(name="Calibri", italic=True)

    ws1.cell(row=4, column=1, value="Historical Benchmark Spend:").font = Font(name="Calibri", bold=True)
    ws1.cell(row=4, column=2, value=f"INR {res['baseline_spend_inr']:,.2f}")

    ws1.cell(row=5, column=1, value="Awarded Landed TCO Spend:").font = Font(name="Calibri", bold=True)
    ws1.cell(row=5, column=2, value=f"INR {res['total_spend_inr']:,.2f}")

    ws1.cell(row=6, column=1, value="Verified Net Bottom-Line Savings:").font = Font(name="Calibri", bold=True, color="047857")
    ws1.cell(row=6, column=2, value=f"INR {res['net_savings_inr']:,.2f} ({res['savings_percentage']}%)").font = Font(name="Calibri", bold=True, color="047857")

    # Supplier Allocation Table
    ws1.cell(row=8, column=1, value="Supplier Spend Distribution").font = Font(name="Calibri", size=12, bold=True)
    alloc_headers = ["Supplier Name", "Status", "Allocated SKUs", "Landed Spend (INR)", "Share (%)"]
    for col_idx, h in enumerate(alloc_headers, 1):
        cell = ws1.cell(row=9, column=col_idx, value=h)
        cell.fill = hdr_fill
        cell.font = hdr_font

    r_idx = 10
    for v_name, alloc in res["vendor_allocations"].items():
        status = "AWARDED" if alloc["sku_count"] > 0 else "Disqualified / Unallocated"
        ws1.cell(row=r_idx, column=1, value=v_name)
        ws1.cell(row=r_idx, column=2, value=status)
        ws1.cell(row=r_idx, column=3, value=alloc["sku_count"])
        ws1.cell(row=r_idx, column=4, value=alloc["total_spend_inr"])
        ws1.cell(row=r_idx, column=5, value=f"{alloc['share_pct']}%")
        r_idx += 1

    # Sheet 2: Master Quote Matrix
    ws2 = wb.create_sheet(title="Quote Analysis Master Matrix")
    matrix_headers = ["Line #", "SKU Code", "Description", "Annual Demand", "Baseline (INR)", "Target Price (INR)",
                      "Apex Technology (VEND-001)", "CompuZone India (VEND-002)", "National IT (VEND-003)", "Vardhman Infotech (VEND-004)", "Shree Balaji (VEND-005)"]
    for col_idx, h in enumerate(matrix_headers, 1):
        cell = ws2.cell(row=1, column=col_idx, value=h)
        cell.fill = hdr_fill
        cell.font = hdr_font

    for r_num, row in enumerate(rows, start=2):
        v1_p = row["quotes"].get("VEND-001", {}).get("landed_cost_unit_inr", "—")
        v2_p = row["quotes"].get("VEND-002", {}).get("landed_cost_unit_inr", "—")
        v3_p = row["quotes"].get("VEND-003", {}).get("landed_cost_unit_inr", "—")
        v4_p = row["quotes"].get("VEND-004", {}).get("landed_cost_unit_inr", "—")
        v5_p = row["quotes"].get("VEND-005", {}).get("landed_cost_unit_inr", "—")

        ws2.append([
            row["line_number"],
            row["sku_code"],
            row["description"],
            row["annual_volume"],
            row["historical_baseline_inr"],
            row["target_price_inr"],
            v1_p, v2_p, v3_p, v4_p, v5_p
        ])

    # Sheet 3: Award Line Schedule
    ws3 = wb.create_sheet(title="Line-by-Line Award Schedule")
    line_headers = ["Line #", "SKU Code", "Awarded Supplier", "Awarded Landed Unit Rate (INR)", "Annual Spend (INR)", "Savings vs Baseline (INR)"]
    for col_idx, h in enumerate(line_headers, 1):
        cell = ws3.cell(row=1, column=col_idx, value=h)
        cell.fill = hdr_fill
        cell.font = hdr_font

    for r_num, la in enumerate(res["line_allocations"], start=2):
        ws3.append([
            la["line_number"],
            la["sku_code"],
            la["awarded_vendor_name"],
            la["unit_price_inr"],
            la["annual_spend_inr"],
            la["savings_vs_baseline_inr"]
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    headers = {
        "Content-Disposition": f"attachment; filename=Aerchain_Award_Report_{scenario}.xlsx"
    }
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers=headers
    )
