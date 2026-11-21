import os
import json
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
import fitz

dataset_dir = r"h:\Antigravity\Aerchain\dataset"
with open(os.path.join(dataset_dir, "rfx_spec_30_skus.json"), "r", encoding="utf-8") as f:
    skus_data = json.load(f)
skus = skus_data["items"]

# -------------------------------------------------------------------
# 1. CREATE AUTHENTIC EXCEL QUOTATION (real_packman_packaging_quote.xlsx)
# -------------------------------------------------------------------
wb = openpyxl.Workbook()
ws = wb.active
ws.title = "Commercial Quotation"
ws.views.sheetView[0].showGridLines = True

# Color Fills
header_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
sub_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")
th_fill = PatternFill(start_color="2563EB", end_color="2563EB", fill_type="solid")
border_color = Side(style="thin", color="CBD5E1")
thin_border = Border(left=border_color, right=border_color, top=border_color, bottom=border_color)

# Row 1: Company Title
ws.merge_cells("A1:G1")
ws["A1"] = "PACKMAN PACKAGING PVT. LTD. — OFFICIAL COMMERCIAL QUOTATION"
ws["A1"].font = Font(name="Arial", size=13, bold=True, color="FFFFFF")
ws["A1"].fill = header_fill
ws["A1"].alignment = Alignment(horizontal="center", vertical="center")
ws.row_dimensions[1].height = 36

# Row 2 & 3: Corporate Info & Quotation Ref
ws.merge_cells("A2:D2")
ws["A2"] = "CIN: U74900DL2010PTC208491 | GSTIN: 07AABCP1924L1Z2 | ISO 9001:2015 & FSC Certified"
ws["A2"].font = Font(name="Arial", size=9, italic=True, color="475569")

ws.merge_cells("A3:D3")
ws["A3"] = "Regd Office: Sector 63, Noida, UP - 201301 | Manufacturing Cluster: Surajpur & Bhiwandi Hub"
ws["A3"].font = Font(name="Arial", size=9, color="475569")

ws.merge_cells("E2:G2")
ws["E2"] = "Quotation Ref: PKM/RFX-2026/IND-4491"
ws["E2"].font = Font(name="Arial", size=10, bold=True, color="0F172A")

ws.merge_cells("E3:G3")
ws["E3"] = "Date of Issue: 20-Nov-2026 | Validity: 45 Days"
ws["E3"].font = Font(name="Arial", size=9, color="475569")

# Row 5: Client / Project Details
ws.merge_cells("A5:G5")
ws["A5"] = "Client: Aerchain Sourcing Operations (FY2026 Direct Packaging RFx) | Target Plants: Bhiwandi & Vapi"
ws["A5"].font = Font(name="Arial", size=10, bold=True, color="1E3A8A")
ws["A5"].fill = sub_fill
ws.row_dimensions[5].height = 24

# Row 7: Table Headers
headers = [
    "Item #", 
    "SKU Code", 
    "Description & Dimensions (L x W x H mm)", 
    "Ply", 
    "Burst Factor", 
    "Quoted Rate (INR/Box)", 
    "Annual Volume (Units)"
]
ws.append([])
ws.append(headers)
ws.row_dimensions[7].height = 24

for col_idx in range(1, len(headers) + 1):
    c = ws.cell(row=7, column=col_idx)
    c.fill = th_fill
    c.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    c.alignment = Alignment(horizontal="center" if col_idx in [1, 2, 4, 5] else "left" if col_idx == 3 else "right", vertical="center")

# Rows 8..37: 30 SKUs with real market prices
for row_num, item in enumerate(skus, start=8):
    # Packman is competitive (~12% below historical baseline based on real Indian mill rates)
    rate = round(item["historical_baseline_inr"] * 0.88, 2)
    spec = f"{item['description']} [{item['length_mm']} x {item['width_mm']} x {item['height_mm']} mm]"
    
    ws.append([
        item["line_number"],
        item["sku_code"],
        spec,
        f"{item['ply_count']} Ply",
        f"{item['burst_factor']} BF",
        rate,
        item["annual_volume"]
    ])
    ws.row_dimensions[row_num].height = 20
    
    for col_idx in range(1, len(headers) + 1):
        c = ws.cell(row=row_num, column=col_idx)
        c.border = thin_border
        c.font = Font(name="Arial", size=9.5)
        if col_idx in [1, 2, 4, 5]:
            c.alignment = Alignment(horizontal="center", vertical="center")
        elif col_idx in [6, 7]:
            c.alignment = Alignment(horizontal="right", vertical="center")
        if col_idx == 6:
            c.font = Font(name="Arial", size=10, bold=True, color="0F172A")

# Commercial Terms Section
term_row = 8 + len(skus) + 1
ws.merge_cells(f"A{term_row}:G{term_row}")
ws[f"A{term_row}"] = "COMMERCIAL TERMS & QUALITY COMMITMENTS:"
ws[f"A{term_row}"].font = Font(name="Arial", size=10, bold=True, color="1E3A8A")

terms = [
    "1. Pricing Basis: DDP Delivered to Bhiwandi & Vapi Warehouses (Freight and Transit Insurance Included).",
    "2. Payment Terms: Net 30 Days from date of GRN verification.",
    "3. Turnaround SLA: 8 to 10 Calendar Days dispatch from order placement.",
    "4. Quality Assurance: TAPPI T-810 Burst Index compliance guaranteed, ISO 9001:2015 certified.",
    "5. GST: Applicable at 12% extra as per HSN 4819."
]
for i, t in enumerate(terms, start=term_row + 1):
    ws.merge_cells(f"A{i}:G{i}")
    ws[f"A{i}"] = t
    ws[f"A{i}"].font = Font(name="Arial", size=9, color="475569")

# Adjust Column Widths
ws.column_dimensions["A"].width = 8
ws.column_dimensions["B"].width = 12
ws.column_dimensions["C"].width = 54
ws.column_dimensions["D"].width = 10
ws.column_dimensions["E"].width = 14
ws.column_dimensions["F"].width = 22
ws.column_dimensions["G"].width = 22

excel_out = os.path.join(dataset_dir, "real_packman_packaging_quote.xlsx")
wb.save(excel_out)
print(f"Created {excel_out}")


# -------------------------------------------------------------------
# 2. CREATE AUTHENTIC PDF QUOTATION (real_packman_packaging_quote.pdf)
# -------------------------------------------------------------------
doc = fitz.open()

# Page 1 (Header + Items 1-16)
page1 = doc.new_page(width=595, height=842) # A4

# Top banner
page1.draw_rect(fitz.Rect(0, 0, 595, 65), color=None, fill=(0.12, 0.23, 0.54))
page1.insert_text(fitz.Point(30, 32), "PACKMAN PACKAGING PVT. LTD.", fontsize=15, color=(1, 1, 1))
page1.insert_text(fitz.Point(30, 48), "COMMERCIAL QUOTATION • FY2026 PACKAGING RFX", fontsize=9, color=(0.85, 0.9, 1))
page1.insert_text(fitz.Point(390, 30), "REF: PKM/RFX-2026/IND-4491", fontsize=9, color=(1, 1, 1))
page1.insert_text(fitz.Point(390, 45), "DATE: 20-NOV-2026 • VALID: 45 DAYS", fontsize=8, color=(0.85, 0.9, 1))

# Sub details
page1.insert_text(fitz.Point(30, 85), "Vendor: Packman Packaging Pvt. Ltd. | GSTIN: 07AABCP1924L1Z2 | ISO 9001:2015 & FSC Certified", fontsize=8, color=(0.3, 0.3, 0.3))
page1.insert_text(fitz.Point(30, 98), "Client: Aerchain Sourcing Operations (Vapi & Bhiwandi Direct Sourcing) | Terms: DDP Net 30d", fontsize=8, color=(0.1, 0.2, 0.6))

# Table 1 Header
page1.draw_rect(fitz.Rect(30, 115, 565, 132), color=None, fill=(0.15, 0.38, 0.92))
page1.insert_text(fitz.Point(35, 127), "#", fontsize=8, color=(1, 1, 1))
page1.insert_text(fitz.Point(55, 127), "SKU CODE", fontsize=8, color=(1, 1, 1))
page1.insert_text(fitz.Point(115, 127), "SPECIFICATION & DIMENSIONS", fontsize=8, color=(1, 1, 1))
page1.insert_text(fitz.Point(400, 127), "PLY / BF", fontsize=8, color=(1, 1, 1))
page1.insert_text(fitz.Point(470, 127), "RATE (INR)", fontsize=8, color=(1, 1, 1))
page1.insert_text(fitz.Point(525, 127), "QTY", fontsize=8, color=(1, 1, 1))

y = 145
for item in skus[:16]:
    rate = round(item["historical_baseline_inr"] * 0.88, 2)
    spec_txt = f"{item['description']} ({item['length_mm']}x{item['width_mm']}x{item['height_mm']} mm)"
    if len(spec_txt) > 52:
        spec_txt = spec_txt[:50] + "..."
    
    page1.insert_text(fitz.Point(35, y), str(item["line_number"]), fontsize=7.5, color=(0.2, 0.2, 0.2))
    page1.insert_text(fitz.Point(55, y), item["sku_code"], fontsize=7.5, color=(0.1, 0.2, 0.5))
    page1.insert_text(fitz.Point(115, y), spec_txt, fontsize=7.5, color=(0.1, 0.1, 0.1))
    page1.insert_text(fitz.Point(400, y), f"{item['ply_count']} Ply / {item['burst_factor']} BF", fontsize=7.5, color=(0.3, 0.3, 0.3))
    page1.insert_text(fitz.Point(470, y), f"INR {rate:.2f}", fontsize=8, color=(0.05, 0.05, 0.05))
    page1.insert_text(fitz.Point(525, y), str(item["annual_volume"]), fontsize=7.5, color=(0.3, 0.3, 0.3))
    
    page1.draw_line(fitz.Point(30, y + 4), fitz.Point(565, y + 4), color=(0.9, 0.9, 0.9), width=0.5)
    y += 18

page1.insert_text(fitz.Point(30, 820), "Page 1 of 2 • Continued on Page 2...", fontsize=8, color=(0.5, 0.5, 0.5))

# Page 2 (Items 17-30 + Terms + Signatures)
page2 = doc.new_page(width=595, height=842)
page2.draw_rect(fitz.Rect(0, 0, 595, 45), color=None, fill=(0.12, 0.23, 0.54))
page2.insert_text(fitz.Point(30, 28), "PACKMAN PACKAGING PVT. LTD. • COMMERCIAL QUOTATION (CONT.)", fontsize=11, color=(1, 1, 1))

# Table 2 Header
page2.draw_rect(fitz.Rect(30, 60, 565, 77), color=None, fill=(0.15, 0.38, 0.92))
page2.insert_text(fitz.Point(35, 72), "#", fontsize=8, color=(1, 1, 1))
page2.insert_text(fitz.Point(55, 72), "SKU CODE", fontsize=8, color=(1, 1, 1))
page2.insert_text(fitz.Point(115, 72), "SPECIFICATION & DIMENSIONS", fontsize=8, color=(1, 1, 1))
page2.insert_text(fitz.Point(400, 72), "PLY / BF", fontsize=8, color=(1, 1, 1))
page2.insert_text(fitz.Point(470, 72), "RATE (INR)", fontsize=8, color=(1, 1, 1))
page2.insert_text(fitz.Point(525, 72), "QTY", fontsize=8, color=(1, 1, 1))

y2 = 90
for item in skus[16:]:
    rate = round(item["historical_baseline_inr"] * 0.88, 2)
    spec_txt = f"{item['description']} ({item['length_mm']}x{item['width_mm']}x{item['height_mm']} mm)"
    if len(spec_txt) > 52:
        spec_txt = spec_txt[:50] + "..."
    
    page2.insert_text(fitz.Point(35, y2), str(item["line_number"]), fontsize=7.5, color=(0.2, 0.2, 0.2))
    page2.insert_text(fitz.Point(55, y2), item["sku_code"], fontsize=7.5, color=(0.1, 0.2, 0.5))
    page2.insert_text(fitz.Point(115, y2), spec_txt, fontsize=7.5, color=(0.1, 0.1, 0.1))
    page2.insert_text(fitz.Point(400, y2), f"{item['ply_count']} Ply / {item['burst_factor']} BF", fontsize=7.5, color=(0.3, 0.3, 0.3))
    page2.insert_text(fitz.Point(470, y2), f"INR {rate:.2f}", fontsize=8, color=(0.05, 0.05, 0.05))
    page2.insert_text(fitz.Point(525, y2), str(item["annual_volume"]), fontsize=7.5, color=(0.3, 0.3, 0.3))
    
    page2.draw_line(fitz.Point(30, y2 + 4), fitz.Point(565, y2 + 4), color=(0.9, 0.9, 0.9), width=0.5)
    y2 += 18

# Terms block
page2.draw_rect(fitz.Rect(30, y2 + 20, 565, y2 + 150), color=(0.85, 0.9, 0.95), fill=(0.97, 0.98, 1))
page2.insert_text(fitz.Point(40, y2 + 38), "COMMERCIAL TERMS & QUALITY COMMITMENT:", fontsize=9, color=(0.12, 0.23, 0.54))

t_y = y2 + 56
terms = [
    "1. Delivery Basis: DDP Delivered to Bhiwandi (Maharashtra) and Vapi (Gujarat) Plants.",
    "2. Payment Terms: Net 30 Calendar Days post GRN verification.",
    "3. Manufacturing SLA: 8 to 10 days delivery turnaround guaranteed from PO release.",
    "4. Quality & Compliance: 100% Kraft Virgin/Recycled Liner with TAPPI T-810 Burst Index compliance.",
    "5. ISO Certification: ISO 9001:2015, FSC CoC certified manufacturing facility."
]
for t in terms:
    page2.insert_text(fitz.Point(40, t_y), t, fontsize=7.5, color=(0.25, 0.25, 0.25))
    t_y += 14

page2.insert_text(fitz.Point(390, y2 + 180), "For Packman Packaging Pvt. Ltd.", fontsize=8.5, color=(0.2, 0.2, 0.2))
page2.insert_text(fitz.Point(390, y2 + 200), "[Authorized Commercial Signatory]", fontsize=8, color=(0.1, 0.3, 0.7))

pdf_out = os.path.join(dataset_dir, "real_packman_packaging_quote.pdf")
doc.save(pdf_out)
doc.close()
print(f"Created {pdf_out}")
