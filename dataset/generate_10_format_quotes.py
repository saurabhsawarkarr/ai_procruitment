import os
import json
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from PIL import Image, ImageDraw, ImageFont
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "sample_quotes_10_formats")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load master RFx specification for accurate hardware pricing
rfx_spec_path = os.path.join(BASE_DIR, "rfx_spec_30_skus.json")
with open(rfx_spec_path, "r", encoding="utf-8") as f:
    master_spec = json.load(f)

items = master_spec["items"]

print(f"Generating 10 diverse format quotations in: {OUTPUT_DIR}")

# ==============================================================================
# FORMAT 1: Modern Excel (.xlsx) - Multi-tab with formulas & configuration
# Supplier: Tata Elxsi Systems & Infrastructure
# ==============================================================================
def create_format_1_xlsx():
    filepath = os.path.join(OUTPUT_DIR, "01_tata_elxsi_systems.xlsx")
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Commercial Quotation"

    hdr_fill = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    hdr_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    ws["A1"] = "TATA ELXSI SYSTEMS & INFRASTRUCTURE — B2B ENTERPRISE QUOTATION"
    ws["A1"].font = Font(name="Calibri", size=14, bold=True, color="1E3A8A")
    ws["A2"] = "Tender: FY2026 Enterprise IT Hardware RFx | Terms: DDP Bengaluru | Payment: Net 45 Days"
    ws["A2"].font = Font(name="Calibri", size=10, italic=True, color="475569")

    headers = ["Line #", "SKU Code", "Category", "Description", "Annual Volume", "Quoted Unit Rate (INR)", "Total Value (INR)", "OEM SLA"]
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=h)
        cell.fill = hdr_fill
        cell.font = hdr_font
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 2, 5] else "left")

    for idx, it in enumerate(items, start=5):
        # 10% discount from baseline
        rate = round(it["historical_baseline_inr"] * 0.90, 2)
        ws.cell(row=idx, column=1, value=it["line_number"])
        ws.cell(row=idx, column=2, value=it["sku_code"])
        ws.cell(row=idx, column=3, value=it["category"])
        ws.cell(row=idx, column=4, value=it["model_name"])
        ws.cell(row=idx, column=5, value=it["annual_volume"])
        ws.cell(row=idx, column=6, value=rate)
        ws.cell(row=idx, column=7, value=f"=E{idx}*F{idx}")
        ws.cell(row=idx, column=8, value="3-Yr On-Site OEM 24x7")

    wb.save(filepath)
    print("✓ Format 1 (.xlsx) created: 01_tata_elxsi_systems.xlsx")

# ==============================================================================
# FORMAT 2: Formal Corporate PDF (.pdf) - 2-Page Vector PDF with Letterhead
# Supplier: Dell Technologies Premier Partner (InfraDirect Ltd)
# ==============================================================================
def create_format_2_pdf():
    filepath = os.path.join(OUTPUT_DIR, "02_delldirect_infradirect.pdf")
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Page 1: Client Compute & Peripherals
    c.setFillColor(colors.HexColor("#0076CE")) # Dell Blue
    c.rect(0, height - 60, width, 60, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(40, height - 38, "DELL PREMIER PARTNER — INFRADIRECT TECHNOLOGIES")
    c.setFont("Helvetica", 9)
    c.drawString(40, height - 52, "Enterprise Client Compute & Infrastructure Bid | Incoterms: DDP Tech Centers | Net 30 Days")

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, height - 80, "SECTION A: CLIENT COMPUTE & WORKSPACE PERIPHERALS (Lines 1 to 18)")

    # Table Header
    y = height - 100
    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.rect(40, y - 5, width - 80, 18, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(45, y, "Line")
    c.drawString(75, y, "SKU Code")
    c.drawString(135, y, "Model Description")
    c.drawString(380, y, "Qty")
    c.drawString(430, y, "Unit Rate (INR)")
    c.drawString(510, y, "Warranty")

    c.setFont("Helvetica", 7.5)
    for it in items[:18]:
        y -= 22
        rate = round(it["historical_baseline_inr"] * 0.88, 2)
        c.drawString(45, y, str(it["line_number"]))
        c.drawString(75, y, it["sku_code"])
        c.drawString(135, y, it["model_name"][:45])
        c.drawString(380, y, str(it["annual_volume"]))
        c.drawString(430, y, f"Rs. {rate:,.2f}")
        c.drawString(510, y, "3Yr ProSupport")

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(40, 40, "Page 1 of 2 — Authorized Dell Partner Quotation #DEL-2026-8841 | Lead Time: 8 Calendar Days")
    c.showPage()

    # Page 2: Infrastructure & Servers
    c.setFillColor(colors.HexColor("#0076CE"))
    c.rect(0, height - 40, width, 40, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 26, "INFRADIRECT TECHNOLOGIES — ENTERPRISE INFRASTRUCTURE & SERVERS")

    y = height - 70
    c.setFillColor(colors.HexColor("#F1F5F9"))
    c.rect(40, y - 5, width - 80, 18, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(45, y, "Line")
    c.drawString(75, y, "SKU Code")
    c.drawString(135, y, "Model Description")
    c.drawString(380, y, "Qty")
    c.drawString(430, y, "Unit Rate (INR)")
    c.drawString(510, y, "Warranty")

    c.setFont("Helvetica", 7.5)
    for it in items[18:]:
        y -= 25
        rate = round(it["historical_baseline_inr"] * 0.87, 2)
        c.drawString(45, y, str(it["line_number"]))
        c.drawString(75, y, it["sku_code"])
        c.drawString(135, y, it["model_name"][:45])
        c.drawString(380, y, str(it["annual_volume"]))
        c.drawString(430, y, f"Rs. {rate:,.2f}")
        c.drawString(510, y, "OEM 24x7 4hr")

    y -= 40
    c.setFont("Helvetica-Bold", 9)
    c.drawString(40, y, "Commercial Conditions & SLA Guarantee:")
    c.setFont("Helvetica", 8)
    c.drawString(40, y - 16, "1. All prices quoted in INR inclusive of customs duty, staging, OS imaging, and delivery to Bengaluru & Mumbai.")
    c.drawString(40, y - 30, "2. Payment Terms: Net 30 Calendar Days post three-way match inspection.")
    c.drawString(40, y - 44, "3. Delivery SLA: 8 calendar days from PO release.")

    c.drawString(40, 30, "Page 2 of 2 — End of Official Bid")
    c.save()
    print("✓ Format 2 (.pdf) created: 02_delldirect_infradirect.pdf")

# ==============================================================================
# FORMAT 3: Word Document Proposal (.docx) - Narrative Bid with Tables
# Supplier: Lenovo Global Enterprise Solutions
# ==============================================================================
def create_format_3_docx():
    filepath = os.path.join(OUTPUT_DIR, "03_lenovo_enterprise_proposal.docx")
    doc = docx.Document()

    title_p = doc.add_paragraph()
    r = title_p.add_run("LENOVO GLOBAL ENTERPRISE SOLUTIONS")
    r.bold = True
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor(0xDC, 0x26, 0x26)

    sub_p = doc.add_paragraph("Commercial Sourcing Proposal for Corporate Client Compute & Datacenter Gear")
    sub_p.runs[0].font.size = Pt(12)
    sub_p.runs[0].italic = True

    doc.add_heading("1. Executive Summary & Delivery Commitment", level=2)
    doc.add_paragraph(
        "Lenovo Enterprise is pleased to submit this comprehensive quotation for all 30 requested SKUs. "
        "All ThinkPad laptops, ThinkVision displays, and ThinkSystem rack servers are backed by premier 3-year on-site support. "
        "Commercial Incoterm: DDP Delivered Tech Centers. Payment Terms: Net 45 Days. Delivery Turnaround: 9 Calendar Days."
    )

    doc.add_heading("2. Line Item Pricing Schedule", level=2)
    table = doc.add_table(rows=1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    hdr_titles = ["Line #", "SKU Code", "Description", "Volume", "Unit Price (INR)", "SLA"]
    for i, t in enumerate(hdr_titles):
        hdr_cells[i].text = t
        hdr_cells[i].paragraphs[0].runs[0].bold = True

    for it in items:
        row_cells = table.add_row().cells
        rate = round(it["historical_baseline_inr"] * 0.89, 2)
        row_cells[0].text = str(it["line_number"])
        row_cells[1].text = it["sku_code"]
        row_cells[2].text = it["model_name"]
        row_cells[3].text = str(it["annual_volume"])
        row_cells[4].text = f"₹{rate:,.2f}"
        row_cells[5].text = "9 Days"

    doc.save(filepath)
    print("✓ Format 3 (.docx) created: 03_lenovo_enterprise_proposal.docx")

# ==============================================================================
# FORMAT 4: High-Res Camera Capture Image (.jpg) - Printed Rate Card
# Supplier: Wipro Infotech Client Compute Division
# ==============================================================================
def create_format_4_jpg():
    filepath = os.path.join(OUTPUT_DIR, "04_wipro_infotech_ratesheet.jpg")
    img_w, img_h = 1200, 1600
    img = Image.new("RGB", (img_w, img_h), color="#FAFAF9")
    draw = ImageDraw.Draw(img)

    # Header banner
    draw.rectangle([(40, 40), (img_w - 40, 120)], fill="#0284C7")
    draw.text((60, 55), "WIPRO INFOTECH — AUTHORIZED IT HARDWARE RATE SHEET", fill="#FFFFFF")
    draw.text((60, 85), "Supplier: Wipro Infotech Ltd | Delivery: DDP Tech Centers (7d) | Terms: Net 30 Days", fill="#E0F2FE")

    # Table Grid
    y = 150
    draw.rectangle([(40, y), (img_w - 40, y + 30)], fill="#E2E8F0")
    draw.text((50, y + 8), "LINE", fill="#0F172A")
    draw.text((110, y + 8), "SKU CODE", fill="#0F172A")
    draw.text((250, y + 8), "MODEL SPECIFICATION", fill="#0F172A")
    draw.text((800, y + 8), "QTY", fill="#0F172A")
    draw.text((900, y + 8), "UNIT RATE (INR)", fill="#0F172A")
    draw.text((1060, y + 8), "TERMS", fill="#0F172A")

    for it in items:
        y += 42
        rate = round(it["historical_baseline_inr"] * 0.91, 2)
        draw.line([(40, y), (img_w - 40, y)], fill="#E2E8F0", width=1)
        draw.text((50, y + 8), str(it["line_number"]), fill="#334155")
        draw.text((110, y + 8), it["sku_code"], fill="#0F172A")
        draw.text((250, y + 8), it["model_name"][:40], fill="#1E293B")
        draw.text((800, y + 8), str(it["annual_volume"]), fill="#334155")
        draw.text((900, y + 8), f"Rs. {rate:,.2f}", fill="#0369A1")
        draw.text((1060, y + 8), "DDP", fill="#059669")

    # Stamp / Signature simulation
    draw.rectangle([(img_w - 300, img_h - 130), (img_w - 60, img_h - 50)], outline="#2563EB", width=2)
    draw.text((img_w - 280, img_h - 115), "AUTHORIZED SIGNATORY", fill="#1D4ED8")
    draw.text((img_w - 260, img_h - 90), "WIPRO INFOTECH LTD", fill="#1D4ED8")
    draw.text((img_w - 240, img_h - 70), "20-NOV-2026", fill="#1D4ED8")

    img.save(filepath, "JPEG", quality=92)
    print("✓ Format 4 (.jpg) created: 04_wipro_infotech_ratesheet.jpg")

# ==============================================================================
# FORMAT 5: Standard Sales Email (.eml) - RFC 822 Mail Message
# Supplier: HP Enterprise Direct Sales
# ==============================================================================
def create_format_5_eml():
    filepath = os.path.join(OUTPUT_DIR, "05_hp_enterprise_quote.eml")
    lines_text = []
    for it in items:
        rate = round(it["historical_baseline_inr"] * 0.885, 2)
        lines_text.append(f"{it['line_number']:2d}. {it['sku_code']} | {it['model_name']} | Qty: {it['annual_volume']} | Rate: INR {rate:,.2f} per unit")

    eml_content = f"""From: HP Enterprise Direct Sales India <sales@hp-enterprise-direct.in>
To: Strategic Sourcing Operations <procurement@aerchain.io>
Date: Fri, 20 Nov 2026 14:15:22 +0530
Subject: Commercial Quotation: FY2026 Enterprise IT Hardware Tender (30 SKUs)
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Dear Sourcing Team,

Please find HP Enterprise Direct's official quotation for the FY2026 IT Hardware procurement tender.

COMMERCIAL TERMS:
• Delivery Incoterm: DDP Bengaluru & Mumbai Technology Centers
• Payment Terms: Net 45 Days from GRN acceptance
• Delivery Lead Time: 8 Calendar Days (Standard dispatch from Sriperumbudur assembly center)
• Warranty: 3-Year 24x7 4-Hour On-site Response OEM Pack included on all models

OFFICIAL UNIT RATE SCHEDULE:
------------------------------------------------------------------------------------------------------------------------
{chr(10).join(lines_text)}
------------------------------------------------------------------------------------------------------------------------

Looking forward to your formal award letter.

Best regards,
Ananya Deshmukh
Director, Enterprise Sales & Public Cloud
HP Enterprise Direct Sales (India) Pvt Ltd
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(eml_content)
    print("✓ Format 5 (.eml) created: 05_hp_enterprise_quote.eml")

# ==============================================================================
# FORMAT 6: SAP / Oracle ERP CSV Dump (.csv)
# Supplier: Redington Cloud & Infrastructure Ltd
# ==============================================================================
def create_format_6_csv():
    filepath = os.path.join(OUTPUT_DIR, "06_redington_erp_dump.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Line_No", "SKU_Code", "Manufacturer", "Item_Description", "Category", "Annual_Demand", "Quoted_Unit_Price_INR", "Currency", "Incoterm", "Lead_Time_Days", "Payment_Terms"])
        for it in items:
            rate = round(it["historical_baseline_inr"] * 0.895, 2)
            mfg = "Lenovo" if "Think" in it["model_name"] else ("Dell" if "Dell" in it["model_name"] else ("Apple" if "Apple" in it["model_name"] or "Mac" in it["model_name"] else ("HP" if "HP" in it["model_name"] else "Enterprise OEM")))
            writer.writerow([
                it["line_number"],
                it["sku_code"],
                mfg,
                it["model_name"],
                it["category"],
                it["annual_volume"],
                rate,
                "INR",
                "DDP",
                8,
                "Net 45 Days"
            ])
    print("✓ Format 6 (.csv) created: 06_redington_erp_dump.csv")

# ==============================================================================
# FORMAT 7: Plain Text Quote Memo (.txt) - ASCII Table
# Supplier: Dynacons Systems & Solutions
# ==============================================================================
def create_format_7_txt():
    filepath = os.path.join(OUTPUT_DIR, "07_dynacons_systems_memo.txt")
    ascii_rows = []
    for it in items:
        rate = round(it["historical_baseline_inr"] * 0.905, 2)
        ascii_rows.append(f"| {it['line_number']:<4} | {it['sku_code']:<8} | {it['model_name'][:38]:<38} | {it['annual_volume']:<5} | INR {rate:>12,.2f} | DDP |")

    txt_content = f"""==============================================================================================
DYNACONS SYSTEMS & SOLUTIONS LTD — OFFICIAL QUOTATION MEMORANDUM
RFQ Reference: AER-FY2026-IT-HW-001 | Date: 20-Nov-2026
Incoterms: DDP Tech Centers | Payment Terms: Net 30 Days | Lead Time: 9 Days
==============================================================================================
+------+----------+----------------------------------------+-------+------------------+-----+
| LINE | SKU CODE | ITEM SPECIFICATION                     | QTY   | UNIT RATE (INR)  | TERM|
+------+----------+----------------------------------------+-------+------------------+-----+
{chr(10).join(ascii_rows)}
+------+----------+----------------------------------------+-------+------------------+-----+
TOTAL ESTIMATED QUOTE VALUE: INR 16,19,59,252.50
Bank Details for Electronic Wire Transfer: HDFC Bank, Fort Branch, IFSC: HDFC0000060
==============================================================================================
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(txt_content)
    print("✓ Format 7 (.txt) created: 07_dynacons_systems_memo.txt")

# ==============================================================================
# FORMAT 8: B2B JSON Quotation Payload (.json)
# Supplier: Unicorn Infosolutions (Apple Enterprise Channel Partner)
# ==============================================================================
def create_format_8_json():
    filepath = os.path.join(OUTPUT_DIR, "08_apple_enterprise_edi.json")
    quote_data = {
        "rfq_id": "AER-RFX-2026-IT-001",
        "vendor_id": "VEND-APL-08",
        "vendor_name": "Unicorn Infosolutions (Apple Enterprise)",
        "quotation_date": "2026-11-20T11:30:00Z",
        "valid_until": "2027-03-31T23:59:59Z",
        "commercial_terms": {
            "incoterm": "DDP",
            "payment_terms": "Net 45 Days",
            "delivery_lead_time_days": 7,
            "warranty_terms": "3-Year AppleCare for Enterprise Onsite",
            "currency": "INR"
        },
        "quotation_items": [
            {
                "line_number": it["line_number"],
                "sku_code": it["sku_code"],
                "item_name": it["model_name"],
                "category": it["category"],
                "quantity": it["annual_volume"],
                "unit_price_inr": round(it["historical_baseline_inr"] * 0.88, 2),
                "extended_total_inr": round(it["historical_baseline_inr"] * 0.88 * it["annual_volume"], 2),
                "in_stock": True
            } for it in items
        ]
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(quote_data, f, indent=2)
    print("✓ Format 8 (.json) created: 08_apple_enterprise_edi.json")

# ==============================================================================
# FORMAT 9: Digital Scan Voucher Image (.png) - Modern Digital Document
# Supplier: Cisco NetOps Premier Distribution
# ==============================================================================
def create_format_9_png():
    filepath = os.path.join(OUTPUT_DIR, "09_cisco_netops_scan.png")
    img_w, img_h = 1200, 1600
    img = Image.new("RGB", (img_w, img_h), color="#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (img_w, 90)], fill="#047857")
    draw.text((50, 30), "CISCO NETOPS PREMIER DISTRIBUTION — OFFICIAL QUOTATION VOUCHER", fill="#FFFFFF")
    draw.text((50, 60), "Cisco Gold Certified Partner | Incoterms: DDP Delivered | Payment: Net 60 Days | Lead Time: 8 Days", fill="#A7F3D0")

    y = 120
    draw.rectangle([(40, y), (img_w - 40, y + 30)], fill="#F0FDF4")
    draw.text((50, y + 8), "#", fill="#065F46")
    draw.text((90, y + 8), "SKU CODE", fill="#065F46")
    draw.text((220, y + 8), "DESCRIPTION & SPECIFICATIONS", fill="#065F46")
    draw.text((800, y + 8), "QTY", fill="#065F46")
    draw.text((910, y + 8), "UNIT RATE (INR)", fill="#065F46")
    draw.text((1070, y + 8), "SLA", fill="#065F46")

    for it in items:
        y += 44
        rate = round(it["historical_baseline_inr"] * 0.89, 2)
        draw.line([(40, y), (img_w - 40, y)], fill="#E2E8F0", width=1)
        draw.text((50, y + 8), str(it["line_number"]), fill="#334155")
        draw.text((90, y + 8), it["sku_code"], fill="#0F172A")
        draw.text((220, y + 8), it["model_name"][:45], fill="#1E293B")
        draw.text((800, y + 8), str(it["annual_volume"]), fill="#334155")
        draw.text((910, y + 8), f"₹{rate:,.2f}", fill="#047857")
        draw.text((1070, y + 8), "8 Days", fill="#065F46")

    # Bottom Seal
    draw.ellipse([(img_w - 240, img_h - 140), (img_w - 60, img_h - 40)], outline="#059669", width=3)
    draw.text((img_w - 215, img_h - 100), "CISCO NETOPS", fill="#059669")
    draw.text((img_w - 200, img_h - 80), "VERIFIED BID", fill="#059669")

    img.save(filepath, "PNG")
    print("✓ Format 9 (.png) created: 09_cisco_netops_scan.png")

# ==============================================================================
# FORMAT 10: Datacenter Specification TSV (.tsv) - Tab-Separated Values
# Supplier: Inspira Enterprise Data Center Systems
# ==============================================================================
def create_format_10_tsv():
    filepath = os.path.join(OUTPUT_DIR, "10_inspira_datacenter_quote.tsv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["LINE_NUMBER", "SKU_CODE", "ITEM_DESCRIPTION", "CATEGORY", "ANNUAL_QUANTITY", "UNIT_PRICE_INR", "INCOTERM", "LEAD_TIME_DAYS", "PAYMENT_TERMS"])
        for it in items:
            rate = round(it["historical_baseline_inr"] * 0.875, 2)
            writer.writerow([
                it["line_number"],
                it["sku_code"],
                it["model_name"],
                it["category"],
                it["annual_volume"],
                rate,
                "DDP",
                7,
                "Net 45 Days"
            ])
    print("✓ Format 10 (.tsv) created: 10_inspira_datacenter_quote.tsv")

if __name__ == "__main__":
    create_format_1_xlsx()
    create_format_2_pdf()
    create_format_3_docx()
    create_format_4_jpg()
    create_format_5_eml()
    create_format_6_csv()
    create_format_7_txt()
    create_format_8_json()
    create_format_9_png()
    create_format_10_tsv()
    print("\nALL 10 DIVERSE FORMAT QUOTATIONS GENERATED SUCCESSFULLY!")
