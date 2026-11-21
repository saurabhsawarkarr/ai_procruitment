import json
import math
import os
from PIL import Image, ImageDraw, ImageFont
import numpy as np

# Ensure dataset directory exists
DATASET_DIR = r"h:\Antigravity\Aerchain\dataset"
os.makedirs(DATASET_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE MASTER 30 SKUs CATALOG (rfx_spec_30_skus.json)
# -------------------------------------------------------------

# Flute factor constants
FLUTE_FACTORS = {
    "A": 1.54,
    "B": 1.35,
    "C": 1.43,
    "E": 1.27,
    "BC": 1.39,
    "AAC": 1.50
}

def calc_board_weight(length, width, height, plies, gsm_list, flute_type, waste_pct=0.03):
    # Sheet length = 2 * (L + W) + joint (50mm)
    # Sheet width = W + H + flap (30mm)
    sheet_l_m = (2 * (length + width) + 50) / 1000.0
    sheet_w_m = (width + height + 30) / 1000.0
    area_sqm = sheet_l_m * sheet_w_m
    
    # GSM calculation with flute take-up
    flute_mult = FLUTE_FACTORS.get(flute_type, 1.38)
    total_gsm = 0
    if plies == 3:
        # 1 liner, 1 medium, 1 liner
        total_gsm = gsm_list[0] + (gsm_list[1] * flute_mult) + gsm_list[2]
    elif plies == 5:
        # 3 liners, 2 flutes
        total_gsm = gsm_list[0] + (gsm_list[1] * flute_mult) + gsm_list[2] + (gsm_list[3] * flute_mult) + gsm_list[4]
    elif plies == 7:
        # 4 liners, 3 flutes
        total_gsm = gsm_list[0] + (gsm_list[1] * flute_mult) + gsm_list[2] + (gsm_list[3] * flute_mult) + gsm_list[4] + (gsm_list[5] * flute_mult) + gsm_list[6]
    else:
        total_gsm = sum(gsm_list)

    weight_grams = area_sqm * total_gsm * (1.0 + waste_pct)
    return round(weight_grams, 1)

skus = []

# RSC Cartons (Items 1 - 15)
rsc_dims = [
    (350, 250, 150), (400, 300, 200), (450, 300, 250), (500, 350, 300), (300, 200, 200),
    (380, 280, 220), (420, 320, 260), (480, 380, 320), (520, 400, 350), (360, 260, 180),
    (410, 310, 230), (460, 340, 280), (550, 420, 380), (340, 240, 160), (390, 290, 210)
]

for idx, (l, w, h) in enumerate(rsc_dims, 1):
    sku_code = f"SKU-{idx:03d}"
    annual_qty = 25000 if idx <= 5 else (20000 if idx <= 10 else 18000)
    gsm = [180, 120, 120, 120, 180]
    flute = "BC"
    weight_g = calc_board_weight(l, w, h, 5, gsm, flute)
    
    # Calculate baseline around ₹40-65
    base_inr = round(28.0 + (weight_g / 1000.0) * 45.0, 2)
    tp_inr = round(base_inr * 0.88, 2)
    
    skus.append({
        "line_number": idx,
        "sku_code": sku_code,
        "category": "Regular Slotted Carton (RSC)",
        "description": f"5-Ply Heavy Outer Shipper Box ({l}x{w}x{h} mm)",
        "length_mm": l,
        "width_mm": w,
        "height_mm": h,
        "ply_count": 5,
        "flute_type": flute,
        "burst_factor": 16,
        "gsm_specs": gsm,
        "theoretical_board_weight_grams": weight_g,
        "annual_volume": annual_qty,
        "historical_baseline_inr": base_inr,
        "target_price_inr": tp_inr
    })

# Die-Cut Cartons & Trays (Items 16 - 25)
dc_dims = [
    (300, 200, 100), (320, 220, 110), (340, 240, 120), (280, 180, 90), (310, 210, 105),
    (330, 230, 115), (290, 190, 95), (350, 250, 125), (270, 170, 85), (360, 260, 130)
]

for idx_rel, (l, w, h) in enumerate(dc_dims, 1):
    idx = 15 + idx_rel
    sku_code = f"SKU-{idx:03d}"
    annual_qty = 35000 if idx <= 20 else 30000
    gsm = [150, 120, 150]
    flute = "E"
    weight_g = calc_board_weight(l, w, h, 3, gsm, flute)
    base_inr = round(20.0 + (weight_g / 1000.0) * 52.0, 2)
    tp_inr = round(base_inr * 0.86, 2)
    
    skus.append({
        "line_number": idx,
        "sku_code": sku_code,
        "category": "Die-Cut Cartons & Trays (DC)",
        "description": f"3-Ply Self-Locking Retail Display Carton ({l}x{w}x{h} mm)",
        "length_mm": l,
        "width_mm": w,
        "height_mm": h,
        "ply_count": 3,
        "flute_type": flute,
        "burst_factor": 14,
        "gsm_specs": gsm,
        "theoretical_board_weight_grams": weight_g,
        "annual_volume": annual_qty,
        "historical_baseline_inr": base_inr,
        "target_price_inr": tp_inr
    })

# Heavy-Duty Shippers & Honeycomb Inserts (Items 26 - 30)
hd_dims = [
    (800, 600, 500), (850, 650, 550), (900, 700, 600), (950, 750, 650), (1000, 800, 700)
]

for idx_rel, (l, w, h) in enumerate(hd_dims, 1):
    idx = 25 + idx_rel
    sku_code = f"SKU-{idx:03d}"
    annual_qty = 8000 if idx <= 28 else 6000
    gsm = [250, 150, 150, 150, 150, 150, 250]
    flute = "AAC"
    weight_g = calc_board_weight(l, w, h, 7, gsm, flute)
    base_inr = round(110.0 + (weight_g / 1000.0) * 42.0, 2)
    tp_inr = round(base_inr * 0.85, 2)
    
    skus.append({
        "line_number": idx,
        "sku_code": sku_code,
        "category": "Heavy-Duty Shippers & Inserts (HD)",
        "description": f"7-Ply Export Grade Industrial Bulk Master Shipper ({l}x{w}x{h} mm)",
        "length_mm": l,
        "width_mm": w,
        "height_mm": h,
        "ply_count": 7,
        "flute_type": flute,
        "burst_factor": 24,
        "gsm_specs": gsm,
        "theoretical_board_weight_grams": weight_g,
        "annual_volume": annual_qty,
        "historical_baseline_inr": base_inr,
        "target_price_inr": tp_inr
    })

# Calculate total baseline spend
total_baseline_spend = sum(s["annual_volume"] * s["historical_baseline_inr"] for s in skus)
print(f"Total Master Baseline Spend: ₹{total_baseline_spend:,.2f} (~₹{total_baseline_spend/10000000:.2f} Crore)")

with open(os.path.join(DATASET_DIR, "rfx_spec_30_skus.json"), "w", encoding="utf-8") as f:
    json.dump({"total_annual_baseline_inr": total_baseline_spend, "items": skus}, f, indent=2)

print("Saved rfx_spec_30_skus.json successfully.")

# -------------------------------------------------------------
# 2. GENERATE VENDOR QUALIFICATIONS & 2025 BASELINE
# -------------------------------------------------------------
qualifications = {
    "Vendor 1 - Apex Packaging Solutions": {
        "vendor_id": "VEND-001",
        "vendor_name": "Apex Packaging Solutions",
        "plant_location": "Bhiwandi, Maharashtra",
        "iso_9001_certified": False,
        "defect_rate_pct": 3.8,  # > 2.0% Hurdle -> Disqualified on quality!
        "on_time_delivery_pct": 88.5,
        "lead_time_days": 7,
        "monthly_capacity_cartons": 500000,
        "payment_terms": "Net 30 Days",
        "audit_status": "FAILED_QUALITY_AUDIT",
        "audit_notes": "Defect rate exceeds 2.0% maximum threshold; lack of formal ISO 9001 quality management system."
    },
    "Vendor 2 - CorruPack India Pvt Ltd": {
        "vendor_id": "VEND-002",
        "vendor_name": "CorruPack India Pvt Ltd",
        "plant_location": "Vapi, Gujarat",
        "iso_9001_certified": True,
        "defect_rate_pct": 0.8,
        "on_time_delivery_pct": 98.2,
        "lead_time_days": 9,
        "monthly_capacity_cartons": 1500000,
        "payment_terms": "Net 60 Days",
        "audit_status": "PASSED_PREFERRED_SUPPLIER",
        "audit_notes": "Fully automated 5-ply & 7-ply corrugation lines. Excellent QA lab and burst strength testing."
    },
    "Vendor 3 - National Boxes & Containers": {
        "vendor_id": "VEND-003",
        "vendor_name": "National Boxes & Containers",
        "plant_location": "Chakan, Pune",
        "iso_9001_certified": True,
        "defect_rate_pct": 1.2,
        "on_time_delivery_pct": 95.0,
        "lead_time_days": 10,
        "monthly_capacity_cartons": 800000,
        "payment_terms": "Net 45 Days",
        "audit_status": "PASSED_QUALIFIED",
        "audit_notes": "Reliable regional manufacturer with direct fleet delivery across Maharashtra industrial corridor."
    },
    "Vendor 4 - Vardhman Paper Products": {
        "vendor_id": "VEND-004",
        "vendor_name": "Vardhman Paper Products",
        "plant_location": "Surat, Gujarat",
        "iso_9001_certified": True,
        "defect_rate_pct": 1.5,
        "on_time_delivery_pct": 91.0,
        "lead_time_days": 16, # Exceeds 12-day lead time limit for rapid turnaround
        "monthly_capacity_cartons": 600000,
        "payment_terms": "Net 30 Days",
        "audit_status": "PASSED_CAPACITY_CONSTRAINED",
        "audit_notes": "Good product quality but higher lead times (16 days) due to Surat railhead transit bottleneck."
    },
    "Vendor 5 - Shree Balaji Packaging": {
        "vendor_id": "VEND-005",
        "vendor_name": "Shree Balaji Packaging",
        "plant_location": "Silvassa, DNH",
        "iso_9001_certified": False, # Waiver eligible under senior management review
        "defect_rate_pct": 1.8,
        "on_time_delivery_pct": 94.5,
        "lead_time_days": 8,
        "monthly_capacity_cartons": 900000,
        "payment_terms": "Net 45 Days",
        "audit_status": "PROVISIONAL_WAIVER_REQUIRED",
        "audit_notes": "Low cost structure and rapid 8-day turnaround. Eligible for ISO waiver based on 3-year spotless supply record."
    }
}

with open(os.path.join(DATASET_DIR, "vendor_qualifications.json"), "w", encoding="utf-8") as f:
    json.dump(qualifications, f, indent=2)

# Historical 2025 contract baseline for Balaji / specialty items
baseline_2025 = {
    s["sku_code"]: {
        "rate_2025_inr": round(s["historical_baseline_inr"] * 0.96, 2),
        "contract_ref": "PO-2025-PKG-8821"
    } for s in skus
}

with open(os.path.join(DATASET_DIR, "contract_baseline_2025.json"), "w", encoding="utf-8") as f:
    json.dump(baseline_2025, f, indent=2)

print("Saved vendor_qualifications.json and contract_baseline_2025.json.")

# -------------------------------------------------------------
# 3. GENERATE VENDOR 1: APEX PACKAGING (Multi-Tab Rogue Excel)
# -------------------------------------------------------------
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

wb = openpyxl.Workbook()
# Default sheet
ws_rsc = wb.active
ws_rsc.title = "Shipper Boxes"
ws_dc = wb.create_sheet(title="Die-Cut Cartons")
ws_hd = wb.create_sheet(title="Heavy Duty")

header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

# Apex quotes low base prices (e.g. 10-15% below baseline) but fails quality audit
for ws, (start_idx, end_idx) in [(ws_rsc, (1, 15)), (ws_dc, (16, 25)), (ws_hd, (26, 30))]:
    headers = ["Item #", "Box Spec & Dimensions", "Board Ply", "Quoted Ex-Works Rate (INR)", "MoQ (Units)"]
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    sub_skus = [s for s in skus if start_idx <= s["line_number"] <= end_idx]
    for row_num, item in enumerate(sub_skus, start=2):
        # Merged dimension string like "350x250x150 mm"
        spec_str = f"{item['description']} [{item['length_mm']}x{item['width_mm']}x{item['height_mm']} mm]"
        # Apex is aggressive on base price
        apex_price = round(item["historical_baseline_inr"] * 0.85, 2)
        ws.append([
            item["sku_code"],
            spec_str,
            f"{item['ply_count']} Ply",
            apex_price,
            2000
        ])
    
    # Add summary subtotal row with embedded formula `=SUM(D2:D...)*1.18` (hiding GST in formula)
    last_row = len(sub_skus) + 1
    total_row = last_row + 1
    ws.cell(row=total_row, column=2, value="Subtotal (incl. 18% GST formula)")
    formula_cell = ws.cell(row=total_row, column=4, value=f"=SUM(D2:D{last_row})*1.18")
    formula_cell.font = Font(name="Calibri", bold=True)

excel_path = os.path.join(DATASET_DIR, "vendor_1_apex_quote.xlsx")
wb.save(excel_path)
print(f"Generated {excel_path}")


# -------------------------------------------------------------
# 4. GENERATE VENDOR 2: CORRUPACK INDIA (4-Page Letterhead PDF with 7pt Footnote)
# -------------------------------------------------------------
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

pdf_path = os.path.join(DATASET_DIR, "vendor_2_corrupack_quote.pdf")
doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "TitleStyle",
    parent=styles["Heading1"],
    fontSize=16,
    leading=20,
    textColor=colors.HexColor("#1A365D"),
    fontName="Helvetica-Bold"
)
subtitle_style = ParagraphStyle(
    "SubTitleStyle",
    parent=styles["Normal"],
    fontSize=9,
    leading=12,
    textColor=colors.HexColor("#4A5568")
)
table_text = ParagraphStyle(
    "TableText",
    parent=styles["Normal"],
    fontSize=8,
    leading=10
)
footnote_style = ParagraphStyle(
    "FootnoteStyle",
    parent=styles["Normal"],
    fontSize=7,  # 7pt fine-print footnote
    leading=9,
    textColor=colors.HexColor("#718096"),
    fontName="Helvetica-Oblique"
)

elements = []

# Page 1: Header + Items 1 - 10
elements.append(Paragraph("<b>CORRUPACK INDIA PRIVATE LIMITED</b>", title_style))
elements.append(Paragraph("GIDC Industrial Estate, Phase II, Vapi - 396195, Gujarat | ISO 9001:2015 Certified<br/><b>COMMERCIAL TENDER QUOTATION - RFX/2026/PKG-030</b>", subtitle_style))
elements.append(Spacer(1, 15))

def create_table_data(slice_skus):
    data = [["Line", "Item Code", "Packaging Specification", "Ply", "Annual Qty", "Ex-Works Rate (₹)"]]
    for item in slice_skus:
        # CorruPack offers competitive rates, e.g. 0.90x baseline
        cp_price = round(item["historical_baseline_inr"] * 0.90, 2)
        desc = f"{item['category'][:15]} ({item['length_mm']}x{item['width_mm']}x{item['height_mm']})"
        data.append([
            str(item["line_number"]),
            item["sku_code"],
            desc,
            str(item["ply_count"]),
            f"{item['annual_volume']:,}",
            f"₹{cp_price:,.2f}"
        ])
    return data

t_style = TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#2B6CB0")),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('ALIGN', (2,1), (2,-1), 'LEFT'),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BOTTOMPADDING', (0,0), (-1,0), 5),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F7FAFC")])
])

# Page 1: Items 1 to 10
t1 = Table(create_table_data(skus[:10]), colWidths=[30, 60, 240, 35, 75, 90])
t1.setStyle(t_style)
elements.append(t1)
elements.append(PageBreak())

# Page 2: Items 11 to 20
elements.append(Paragraph("<b>CORRUPACK INDIA PRIVATE LIMITED - Page 2 of 4</b>", subtitle_style))
elements.append(Spacer(1, 10))
t2 = Table(create_table_data(skus[10:20]), colWidths=[30, 60, 240, 35, 75, 90])
t2.setStyle(t_style)
elements.append(t2)
elements.append(PageBreak())

# Page 3: Items 21 to 30
elements.append(Paragraph("<b>CORRUPACK INDIA PRIVATE LIMITED - Page 3 of 4</b>", subtitle_style))
elements.append(Spacer(1, 10))
t3 = Table(create_table_data(skus[20:30]), colWidths=[30, 60, 240, 35, 75, 90])
t3.setStyle(t_style)
elements.append(t3)
elements.append(PageBreak())

# Page 4: Terms, Commercial Clauses, and 7pt Footnote #3
elements.append(Paragraph("<b>COMMERCIAL TERMS & GENERAL CONDITIONS OF TENDER</b>", title_style))
elements.append(Spacer(1, 12))
terms_text = """
1. <b>Validity:</b> This commercial bid is firm and valid for 90 calendar days from bid submission date.<br/>
2. <b>Delivery:</b> Dispatches within 9 working days from formal purchase order receipt.<br/>
3. <b>Payment Terms:</b> 60 days net from invoice date via RTGS / NEFT.<br/>
4. <b>Quality Standard:</b> Manufactured to TAPPI standard burst index, certified under ISO 9001:2015.<br/>
5. <b>Tooling:</b> One-time block charges waived for annual order quantities above 25,000 units.<br/>
"""
elements.append(Paragraph(terms_text, styles["Normal"]))
elements.append(Spacer(1, 15))

# Footnote #3 in 7pt fine print
footnote_p = """
<b>Note 3:</b> All unit rates quoted above are Ex-Works our Vapi manufacturing facility. Prices subject to a retrospective 4.5% annual turnover rebate if aggregate spend crosses ₹1.5 Crore; freight charged at actuals + 8% handling charge; GST extra at 18%. Any demurrage at destination unloading dock shall be on buyer account.
"""
elements.append(Paragraph(footnote_p, footnote_style))

doc.build(elements)
print(f"Generated {pdf_path}")


# -------------------------------------------------------------
# 5. GENERATE VENDOR 3: NATIONAL BOXES (Word Document with Narrative Prose & Tiers)
# -------------------------------------------------------------
import docx
from docx.shared import Inches, Pt, RGBColor

doc_w = docx.Document()
doc_w.add_heading("National Boxes & Containers", level=1)
p_sub = doc_w.add_paragraph("Industrial Corrugated Packaging Proposal - Reference: NBC/Q-2026-904")
p_sub.style.font.italic = True

doc_w.add_heading("1. Executive Summary & Tiered Volume Structure", level=2)
p_prose = doc_w.add_paragraph(
    "National Boxes & Containers is pleased to submit our comprehensive packaging proposal for your Maharashtra plants. "
    "For Items 1 through 10 (Master Outer Shippers), we propose a fixed rate of ₹48.50 per carton for orders of 5,000 units or more. "
    "For smaller runs below 2,000 units, a surcharge of ₹3.20 per piece will apply. Lead time is 10 days from receipt of approved artwork. "
    "All delivery prices quoted below are DDP Buyer Plant (Bhiwandi & Chakan), inclusive of freight and transit insurance. GST is 18% extra."
)

doc_w.add_heading("2. Line Item Pricing Schedule (SKU-011 through SKU-030)", level=2)
table = doc_w.add_table(rows=1, cols=4)
hdr_cells = table.rows[0].cells
hdr_cells[0].text = "SKU Code"
hdr_cells[1].text = "Category & Specification"
hdr_cells[2].text = "Tier 1 Rate (≥5k Units)"
hdr_cells[3].text = "Tier 2 Rate (<2k Units)"

for item in skus[10:]:
    # National has competitive rates on Die-Cut cartons (items 16-25)
    if item["line_number"] >= 16 and item["line_number"] <= 25:
        base_p = round(item["historical_baseline_inr"] * 0.86, 2)
    else:
        base_p = round(item["historical_baseline_inr"] * 0.93, 2)
    
    row_cells = table.add_row().cells
    row_cells[0].text = item["sku_code"]
    row_cells[1].text = f"{item['category']} ({item['length_mm']}x{item['width_mm']}x{item['height_mm']})"
    row_cells[2].text = f"₹{base_p:.2f}"
    row_cells[3].text = f"₹{base_p + 3.20:.2f}"

doc_w.add_heading("3. Quality & Lead Time Commitment", level=2)
doc_w.add_paragraph(
    "National Boxes is ISO 9001 certified. Historical rejection rate across Tier-1 automotive and FMCG clients is 1.2%. "
    "Payment terms: Net 45 days. Capacity: 800,000 boxes/month."
)

docx_path = os.path.join(DATASET_DIR, "vendor_3_national_quote.docx")
doc_w.save(docx_path)
print(f"Generated {docx_path}")


# -------------------------------------------------------------
# 6. GENERATE VENDOR 4: VARDHMAN (Angled Photo with Blue Ballpoint Edits & 27/30 lines)
# -------------------------------------------------------------
import cv2

# Create high-res white page (1200 x 1800)
img_w, img_h = 1200, 1800
canvas = Image.new("RGB", (img_w, img_h), color=(255, 255, 255))
draw = ImageDraw.Draw(canvas)

# Draw simulated printed quotation
draw.rectangle([(40, 40), (img_w - 40, img_h - 40)], outline=(180, 180, 180), width=2)
draw.text((70, 70), "VARDHMAN PAPER PRODUCTS - RATE QUOTATION", fill=(20, 20, 20))
draw.text((70, 105), "Surat Industrial Corridor | Phone: +91 261 249011 | Contact: K. Vardhman", fill=(80, 80, 80))
draw.line([(70, 135), (img_w - 70, 135)], fill=(0, 0, 0), width=2)

draw.text((70, 150), "Line", fill=(0, 0, 0))
draw.text((140, 150), "Item Code", fill=(0, 0, 0))
draw.text((320, 150), "Specification", fill=(0, 0, 0))
draw.text((820, 150), "Printed Rate (INR)", fill=(0, 0, 0))
draw.text((1020, 150), "Remarks", fill=(0, 0, 0))
draw.line([(70, 175), (img_w - 70, 175)], fill=(120, 120, 120), width=1)

y_pos = 195
line_coords = {}

# Lines 1 to 27 are quoted; lines 28, 29, 30 are left blank!
for item in skus:
    l_num = item["line_number"]
    draw.text((70, y_pos), f"{l_num:02d}", fill=(50, 50, 50))
    draw.text((140, y_pos), item["sku_code"], fill=(50, 50, 50))
    draw.text((320, y_pos), f"{item['category'][:22]} {item['length_mm']}x{item['width_mm']}", fill=(50, 50, 50))
    
    if l_num <= 27:
        rate = round(item["historical_baseline_inr"] * 0.89, 2)
        # For items 4, 12, 19, 23 we put printed rate, and then strike through with blue ink!
        if l_num in [4, 12, 19, 23]:
            # Printed rate
            draw.text((820, y_pos), f"₹{rate:.2f}", fill=(120, 120, 120))
            # Blue ballpoint strike-through
            draw.line([(815, y_pos + 7), (890, y_pos + 7)], fill=(20, 40, 200), width=2)
            # Handwritten blue rate
            new_rate = round(rate - 2.50, 2)
            draw.text((910, y_pos - 2), f"₹{new_rate:.2f}", fill=(10, 30, 220))
        else:
            draw.text((820, y_pos), f"₹{rate:.2f}", fill=(20, 20, 20))
        draw.text((1020, y_pos), "Ex-Works", fill=(100, 100, 100))
    else:
        # Lines 28, 29, 30: Blank / unquoted!
        draw.text((820, y_pos), "--- NO BID ---", fill=(180, 50, 50))
        draw.text((1020, y_pos), "No Tooling", fill=(160, 50, 50))
    
    draw.line([(70, y_pos + 25), (img_w - 70, y_pos + 25)], fill=(230, 230, 230), width=1)
    y_pos += 45

# Footer
draw.text((70, y_pos + 20), "Payment: Net 30 Days | Lead Time: 16 Days | GST 18% Extra | Freight at actuals", fill=(40, 40, 40))

# Convert to OpenCV format (BGR)
cv_img = cv2.cvtColor(np.array(canvas), cv2.COLOR_RGB2BGR)

# Apply 15-degree affine/perspective skew (mobile photo taken at an angle)
pts1 = np.float32([[0, 0], [img_w, 0], [0, img_h], [img_w, img_h]])
pts2 = np.float32([[80, 110], [img_w - 60, 40], [130, img_h - 90], [img_w - 120, img_h - 50]])
matrix = cv2.getPerspectiveTransform(pts1, pts2)
skewed = cv2.warpPerspective(cv_img, matrix, (img_w, img_h), borderValue=(220, 220, 215))

# Add lighting gradient / shadow across right edge
shadow_mask = np.linspace(1.0, 0.65, img_w).reshape(1, img_w, 1)
shadowed = (skewed * shadow_mask).astype(np.uint8)

jpg_path = os.path.join(DATASET_DIR, "vendor_4_vardhman_quote.jpg")
cv2.imwrite(jpg_path, shadowed, [cv2.IMWRITE_JPEG_QUALITY, 85])
print(f"Generated {jpg_path}")


# -------------------------------------------------------------
# 7. GENERATE VENDOR 5: SHREE BALAJI (Shorthand Casual Email)
# -------------------------------------------------------------
eml_content = """From: sunil.agarwal@shreebalajipackaging.in
To: rajesh.sharma@enterprise.com
Date: Wed, 18 Nov 2026 14:22:10 +0530
Subject: Re: RFx Commercial Packaging Quotation - Bhiwandi & Chakan Plants

Hi Rajesh,

Following up on your RFx for industrial corrugated cartons. As discussed on call, here are our commercial rates:

1. ₹42.00 / kg for all 5-ply Heavy Outer Shipper Cartons (SKU-001 through SKU-015).
2. ₹38.50 / kg for 3-ply Die-Cut Self-Locking Cartons (SKU-016 through SKU-025).
3. For all other specialty items (SKU-026 through SKU-030 Heavy-Duty 7-Ply bulk shippers), our rates will be exactly the same as our 2025 Annual Contract with a 3.5% raw material escalation.

Commercial Terms:
- Delivery: DDP your Bhiwandi plant (freight & transit insurance included).
- Payment terms: Net 45 days.
- Lead time: 8 calendar days from PO.
- GST: 18% extra.

Please issue the PO at the earliest to lock paper deckle slots.

Best regards,

Sunil Agarwal
Director of Sales & Operations
Shree Balaji Packaging Industries
Silvassa, DNH
Mobile: +91 98201 54321
"""

eml_path = os.path.join(DATASET_DIR, "vendor_5_balaji_quote.eml")
with open(eml_path, "w", encoding="utf-8") as f:
    f.write(eml_content)
print(f"Generated {eml_path}")

print("\n--- PHASE 1 DATASET COMPLETE: All 5 files + 30 SKUs + Qualifications generated! ---")
