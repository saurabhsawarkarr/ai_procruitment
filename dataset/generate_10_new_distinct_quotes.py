import os
import json
import csv
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
import docx
from docx.shared import Pt, RGBColor
from docx.enum.table import WD_TABLE_ALIGNMENT
from PIL import Image, ImageDraw
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

print(f"Generating 10 brand-new distinct format quotations in: {OUTPUT_DIR}")

# ==============================================================================
# FORMAT 1: Modern Excel (.xlsx) - LTIMindtree Enterprise Infrastructure
# ==============================================================================
def create_format_1_xlsx():
    filepath = os.path.join(OUTPUT_DIR, "01_ltimindtree_enterprise_quote.xlsx")
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "LTI Commercial Bid"

    hdr_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")
    hdr_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

    ws["A1"] = "LTIMINDTREE ENTERPRISE INFRASTRUCTURE — B2B PROPOSAL"
    ws["A1"].font = Font(name="Calibri", size=14, bold=True, color="0F172A")
    ws["A2"] = "RFQ Ref: AER-2026-IT-INFRA | Incoterms: DDP Bengaluru/Mumbai | Payment: Net 45 Days | SLA: 8 Days"
    ws["A2"].font = Font(name="Calibri", size=10, italic=True, color="64748B")

    headers = ["Line #", "SKU Code", "Category", "Model Description", "Annual Qty", "Unit Price (INR)", "Total Value (INR)", "Warranty SLA"]
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=4, column=col_idx, value=h)
        cell.fill = hdr_fill
        cell.font = hdr_font
        cell.alignment = Alignment(horizontal="center" if col_idx in [1, 2, 5] else "left")

    for idx, it in enumerate(items, start=5):
        # 11.5% discount from baseline
        rate = round(it["historical_baseline_inr"] * 0.885, 2)
        ws.cell(row=idx, column=1, value=it["line_number"])
        ws.cell(row=idx, column=2, value=it["sku_code"])
        ws.cell(row=idx, column=3, value=it["category"])
        ws.cell(row=idx, column=4, value=it["model_name"])
        ws.cell(row=idx, column=5, value=it["annual_volume"])
        ws.cell(row=idx, column=6, value=rate)
        ws.cell(row=idx, column=7, value=f"=E{idx}*F{idx}")
        ws.cell(row=idx, column=8, value="3-Year On-Site OEM 24x7 Support")

    wb.save(filepath)
    print("✓ Format 1 (.xlsx) created: 01_ltimindtree_enterprise_quote.xlsx")

# ==============================================================================
# FORMAT 2: Formal Corporate PDF (.pdf) - Cognizant Cloud & Compute
# ==============================================================================
def create_format_2_pdf():
    filepath = os.path.join(OUTPUT_DIR, "02_cognizant_client_proposal.pdf")
    c = canvas.Canvas(filepath, pagesize=letter)
    width, height = letter

    # Page 1: Client Compute & Peripherals (1-18)
    c.setFillColor(colors.HexColor("#0033A0")) # Cognizant Deep Blue
    c.rect(0, height - 60, width, 60, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(40, height - 38, "COGNIZANT CLOUD & COMPUTE INFRASTRUCTURE")
    c.setFont("Helvetica", 9)
    c.drawString(40, height - 52, "Corporate Hardware Proposal — FY2026 Tender | DDP Delivered Tech Centers | Net 30 Days")

    c.setFillColor(colors.HexColor("#0F172A"))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, height - 80, "PART 1: WORKSPACE LAPTOPS & PERIPHERALS (Lines 1 to 18)")

    y = height - 100
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(40, y - 5, width - 80, 18, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(45, y, "Line")
    c.drawString(75, y, "SKU Code")
    c.drawString(135, y, "Model Specification")
    c.drawString(380, y, "Qty")
    c.drawString(430, y, "Unit Rate (INR)")
    c.drawString(510, y, "SLA")

    c.setFont("Helvetica", 7.5)
    for it in items[:18]:
        y -= 22
        rate = round(it["historical_baseline_inr"] * 0.892, 2)
        c.drawString(45, y, str(it["line_number"]))
        c.drawString(75, y, it["sku_code"])
        c.drawString(135, y, it["model_name"][:45])
        c.drawString(380, y, str(it["annual_volume"]))
        c.drawString(430, y, f"Rs. {rate:,.2f}")
        c.drawString(510, y, "7 Days SLA")

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(40, 40, "Page 1 of 2 — Cognizant Proposal #COG-2026-ITX | Prompt Wire Rebate: 2.0% within 15 Days")
    c.showPage()

    # Page 2: Datacenter & Servers (19-30)
    c.setFillColor(colors.HexColor("#0033A0"))
    c.rect(0, height - 40, width, 40, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(40, height - 26, "COGNIZANT ENTERPRISE SYSTEMS — SERVER & NETWORKING GEAR")

    y = height - 70
    c.setFillColor(colors.HexColor("#F8FAFC"))
    c.rect(40, y - 5, width - 80, 18, stroke=1, fill=1)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(45, y, "Line")
    c.drawString(75, y, "SKU Code")
    c.drawString(135, y, "Model Specification")
    c.drawString(380, y, "Qty")
    c.drawString(430, y, "Unit Rate (INR)")
    c.drawString(510, y, "SLA")

    c.setFont("Helvetica", 7.5)
    for it in items[18:]:
        y -= 25
        rate = round(it["historical_baseline_inr"] * 0.878, 2)
        c.drawString(45, y, str(it["line_number"]))
        c.drawString(75, y, it["sku_code"])
        c.drawString(135, y, it["model_name"][:45])
        c.drawString(380, y, str(it["annual_volume"]))
        c.drawString(430, y, f"Rs. {rate:,.2f}")
        c.drawString(510, y, "OEM 24x7")

    y -= 40
    c.setFont("Helvetica-Bold", 9)
    c.drawString(40, y, "Commercial Conditions:")
    c.setFont("Helvetica", 8)
    c.drawString(40, y - 16, "1. Prices are DDP delivered, inclusive of customs duties, transit insurance, and dock staging.")
    c.drawString(40, y - 30, "2. Prompt Payment Incentive: 2.0% rebate for invoices settled within 15 calendar days.")
    c.drawString(40, y - 44, "3. Quality: ISO 9001:2015 certified; Zero defect staging guarantee with 4-hour replacement.")

    c.drawString(40, 30, "Page 2 of 2 — End of Official Cognizant Submission")
    c.save()
    print("✓ Format 2 (.pdf) created: 02_cognizant_client_proposal.pdf")

# ==============================================================================
# FORMAT 3: Microsoft Word Proposal (.docx) - HCLTech Corporate Hardware
# ==============================================================================
def create_format_3_docx():
    filepath = os.path.join(OUTPUT_DIR, "03_hcltech_sourcing_bid.docx")
    doc = docx.Document()

    title_p = doc.add_paragraph()
    r = title_p.add_run("HCLTECH CORPORATE CLIENT HARDWARE")
    r.bold = True
    r.font.size = Pt(18)
    r.font.color.rgb = RGBColor(0x02, 0x84, 0xC7)

    sub_p = doc.add_paragraph("Official Proposal: FY2026 Enterprise Sourcing Tender (30 Hardware Lines)")
    sub_p.runs[0].font.size = Pt(12)
    sub_p.runs[0].italic = True

    doc.add_heading("1. Proposal Overview & Terms", level=2)
    doc.add_paragraph(
        "HCLTech is pleased to present our direct commercial quotation for your FY2026 client compute fleet. "
        "All hardware is factory-configured with standard BIOS security profiles, custom asset tags, and delivery within 8 business days. "
        "Incoterms: DDP Tech Centers. Payment Terms: Net 45 Days."
    )

    doc.add_heading("2. Line Item Pricing Matrix", level=2)
    table = doc.add_table(rows=1, cols=6)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    hdr_cells = table.rows[0].cells
    hdr_titles = ["Line #", "SKU Code", "Description", "Volume", "Unit Price (INR)", "Delivery SLA"]
    for i, t in enumerate(hdr_titles):
        hdr_cells[i].text = t
        hdr_cells[i].paragraphs[0].runs[0].bold = True

    for it in items:
        row_cells = table.add_row().cells
        rate = round(it["historical_baseline_inr"] * 0.888, 2)
        row_cells[0].text = str(it["line_number"])
        row_cells[1].text = it["sku_code"]
        row_cells[2].text = it["model_name"]
        row_cells[3].text = str(it["annual_volume"])
        row_cells[4].text = f"₹{rate:,.2f}"
        row_cells[5].text = "8 Days"

    doc.save(filepath)
    print("✓ Format 3 (.docx) created: 03_hcltech_sourcing_bid.docx")

# ==============================================================================
# FORMAT 4: High-Res Camera Scan (.jpg) - Hitachi Systems India
# ==============================================================================
def create_format_4_jpg():
    filepath = os.path.join(OUTPUT_DIR, "04_hitachi_systems_ratesheet.jpg")
    img_w, img_h = 1200, 1600
    img = Image.new("RGB", (img_w, img_h), color="#FAFAF9")
    draw = ImageDraw.Draw(img)

    # Header banner
    draw.rectangle([(40, 40), (img_w - 40, 120)], fill="#B91C1C")
    draw.text((60, 55), "HITACHI SYSTEMS INDIA PVT LTD — OFFICIAL HARDWARE BID SHEET", fill="#FFFFFF")
    draw.text((60, 85), "Supplier: Hitachi Systems India | Delivery: DDP (8d SLA) | Commercial Terms: Net 30 Days", fill="#FEE2E2")

    # Table Grid
    y = 150
    draw.rectangle([(40, y), (img_w - 40, y + 30)], fill="#E2E8F0")
    draw.text((50, y + 8), "LINE", fill="#0F172A")
    draw.text((110, y + 8), "SKU CODE", fill="#0F172A")
    draw.text((250, y + 8), "HARDWARE DESCRIPTION", fill="#0F172A")
    draw.text((800, y + 8), "QTY", fill="#0F172A")
    draw.text((900, y + 8), "UNIT RATE (INR)", fill="#0F172A")
    draw.text((1060, y + 8), "TERMS", fill="#0F172A")

    for it in items:
        y += 42
        rate = round(it["historical_baseline_inr"] * 0.902, 2)
        draw.line([(40, y), (img_w - 40, y)], fill="#E2E8F0", width=1)
        draw.text((50, y + 8), str(it["line_number"]), fill="#334155")
        draw.text((110, y + 8), it["sku_code"], fill="#0F172A")
        draw.text((250, y + 8), it["model_name"][:40], fill="#1E293B")
        draw.text((800, y + 8), str(it["annual_volume"]), fill="#334155")
        draw.text((900, y + 8), f"Rs. {rate:,.2f}", fill="#B91C1C")
        draw.text((1060, y + 8), "DDP", fill="#059669")

    # Stamp / Signature simulation
    draw.rectangle([(img_w - 320, img_h - 130), (img_w - 40, img_h - 50)], outline="#B91C1C", width=2)
    draw.text((img_w - 300, img_h - 115), "AUTHORIZED CORPORATE BID", fill="#B91C1C")
    draw.text((img_w - 280, img_h - 90), "HITACHI SYSTEMS INDIA", fill="#B91C1C")
    draw.text((img_w - 250, img_h - 70), "21-NOV-2026", fill="#B91C1C")

    img.save(filepath, "JPEG", quality=92)
    print("✓ Format 4 (.jpg) created: 04_hitachi_systems_ratesheet.jpg")

# ==============================================================================
# FORMAT 5: Sales Email (.eml) - Microland Digital Networks
# ==============================================================================
def create_format_5_eml():
    filepath = os.path.join(OUTPUT_DIR, "05_microland_sales_quote.eml")
    lines_text = []
    for it in items:
        rate = round(it["historical_baseline_inr"] * 0.891, 2)
        lines_text.append(f"{it['line_number']:2d}. {it['sku_code']} | {it['model_name']} | Qty: {it['annual_volume']} | Rate: INR {rate:,.2f}/unit")

    eml_content = f"""From: Microland Digital Networks <sourcing@microland-networks.in>
To: Sourcing Directorate <procurement@aerchain.io>
Date: Sat, 21 Nov 2026 11:20:15 +0530
Subject: Official Quotation: FY2026 Enterprise Hardware Tender (30 Items)
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Dear Aerchain Procurement Committee,

Microland Digital Networks is pleased to submit our firm bid for the FY2026 Enterprise IT Hardware Tender.

COMMERCIAL COMMITMENTS:
• Incoterms: Delivered Duty Paid (DDP) Bengaluru & Mumbai Tech Hubs
• Payment Terms: Net 45 Days from GRN acceptance
• Delivery Lead Time: 7 Business Days from PO release
• Hardware Warranty: 3-Year 24x7 4-Hour On-site Response OEM Pack on all items

ITEMIZED RATE SCHEDULE:
------------------------------------------------------------------------------------------------------------------------
{chr(10).join(lines_text)}
------------------------------------------------------------------------------------------------------------------------

We look forward to signing the enterprise framework contract.

Best regards,
Rohan Kulkarni
Vice President — Enterprise IT Infrastructure
Microland Digital Networks & Compute Ltd
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(eml_content)
    print("✓ Format 5 (.eml) created: 05_microland_sales_quote.eml")

# ==============================================================================
# FORMAT 6: ERP CSV Export (.csv) - Ingram Micro Distribution
# ==============================================================================
def create_format_6_csv():
    filepath = os.path.join(OUTPUT_DIR, "06_ingram_micro_catalog_dump.csv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Line_No", "SKU_Code", "Vendor_Part_No", "Item_Description", "Category", "Annual_Demand", "Quoted_Unit_Price_INR", "Currency", "Incoterm", "Lead_Time_Days", "Payment_Terms"])
        for it in items:
            rate = round(it["historical_baseline_inr"] * 0.898, 2)
            part_no = f"ING-{it['sku_code']}-2026"
            writer.writerow([
                it["line_number"],
                it["sku_code"],
                part_no,
                it["model_name"],
                it["category"],
                it["annual_volume"],
                rate,
                "INR",
                "DDP",
                8,
                "Net 45 Days"
            ])
    print("✓ Format 6 (.csv) created: 06_ingram_micro_catalog_dump.csv")

# ==============================================================================
# FORMAT 7: ASCII Text Memorandum (.txt) - Netweb Technologies
# ==============================================================================
def create_format_7_txt():
    filepath = os.path.join(OUTPUT_DIR, "07_netweb_technologies_quotation.txt")
    ascii_rows = []
    for it in items:
        rate = round(it["historical_baseline_inr"] * 0.894, 2)
        ascii_rows.append(f"| {it['line_number']:<4} | {it['sku_code']:<8} | {it['model_name'][:38]:<38} | {it['annual_volume']:<5} | INR {rate:>12,.2f} | DDP |")

    txt_content = f"""==============================================================================================
NETWEB TECHNOLOGIES INDIA LTD — ENTERPRISE COMPUTING BID MEMORANDUM
Tender ID: AER-FY2026-IT-HW-001 | Date: 21-Nov-2026
Incoterms: DDP Tech Centers | Payment Terms: Net 30 Days | Turnaround SLA: 8 Days
==============================================================================================
+------+----------+----------------------------------------+-------+------------------+-----+
| LINE | SKU CODE | ITEM SPECIFICATION                     | QTY   | UNIT RATE (INR)  | TERM|
+------+----------+----------------------------------------+-------+------------------+-----+
{chr(10).join(ascii_rows)}
+------+----------+----------------------------------------+-------+------------------+-----+
Total Estimated Proposal Value: INR 15,99,90,885.00
Bank Wire Transfer: State Bank of India, Corporate Branch Mumbai, IFSC: SBIN0000300
==============================================================================================
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(txt_content)
    print("✓ Format 7 (.txt) created: 07_netweb_technologies_quotation.txt")

# ==============================================================================
# FORMAT 8: B2B EDI JSON Payload (.json) - Ananya Cloud Systems
# ==============================================================================
def create_format_8_json():
    filepath = os.path.join(OUTPUT_DIR, "08_ananya_cloud_b2b_edi.json")
    quote_data = {
        "rfq_id": "AER-RFX-2026-IT-001",
        "vendor_id": "VEND-ANA-08",
        "vendor_name": "Ananya Cloud & Hardware Systems",
        "quotation_date": "2026-11-21T09:30:00Z",
        "valid_until": "2027-03-31T23:59:59Z",
        "commercial_terms": {
            "incoterm": "DDP Delivered",
            "payment_terms": "Net 45 Days",
            "delivery_lead_time_days": 8,
            "warranty_terms": "3-Year OEM Premier Onsite",
            "currency": "INR"
        },
        "quotation_items": [
            {
                "line_number": it["line_number"],
                "sku_code": it["sku_code"],
                "item_name": it["model_name"],
                "category": it["category"],
                "quantity": it["annual_volume"],
                "unit_price_inr": round(it["historical_baseline_inr"] * 0.887, 2),
                "extended_total_inr": round(it["historical_baseline_inr"] * 0.887 * it["annual_volume"], 2),
                "in_stock": True
            } for it in items
        ]
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(quote_data, f, indent=2)
    print("✓ Format 8 (.json) created: 08_ananya_cloud_b2b_edi.json")

# ==============================================================================
# FORMAT 9: Digital PNG Voucher (.png) - Team Computers Digital Solutions
# ==============================================================================
def create_format_9_png():
    filepath = os.path.join(OUTPUT_DIR, "09_team_computers_bid_voucher.png")
    img_w, img_h = 1200, 1600
    img = Image.new("RGB", (img_w, img_h), color="#FFFFFF")
    draw = ImageDraw.Draw(img)

    # Header
    draw.rectangle([(0, 0), (img_w, 90)], fill="#D97706")
    draw.text((50, 30), "TEAM COMPUTERS DIGITAL SOLUTIONS — OFFICIAL TENDER VOUCHER", fill="#FFFFFF")
    draw.text((50, 60), "Authorized OEM Direct Partner | Incoterms: DDP Tech Centers | Net 45 Days | SLA: 8 Days", fill="#FEF3C7")

    y = 120
    draw.rectangle([(40, y), (img_w - 40, y + 30)], fill="#FFFBEB")
    draw.text((50, y + 8), "#", fill="#92400E")
    draw.text((90, y + 8), "SKU CODE", fill="#92400E")
    draw.text((220, y + 8), "HARDWARE DESCRIPTION", fill="#92400E")
    draw.text((800, y + 8), "QTY", fill="#92400E")
    draw.text((910, y + 8), "UNIT RATE (INR)", fill="#92400E")
    draw.text((1070, y + 8), "SLA", fill="#92400E")

    for it in items:
        y += 44
        rate = round(it["historical_baseline_inr"] * 0.893, 2)
        draw.line([(40, y), (img_w - 40, y)], fill="#E2E8F0", width=1)
        draw.text((50, y + 8), str(it["line_number"]), fill="#334155")
        draw.text((90, y + 8), it["sku_code"], fill="#0F172A")
        draw.text((220, y + 8), it["model_name"][:45], fill="#1E293B")
        draw.text((800, y + 8), str(it["annual_volume"]), fill="#334155")
        draw.text((910, y + 8), f"₹{rate:,.2f}", fill="#B45309")
        draw.text((1070, y + 8), "8 Days", fill="#059669")

    # Bottom Seal
    draw.ellipse([(img_w - 240, img_h - 140), (img_w - 60, img_h - 40)], outline="#D97706", width=3)
    draw.text((img_w - 225, img_h - 100), "TEAM COMPUTERS", fill="#D97706")
    draw.text((img_w - 200, img_h - 80), "OFFICIAL BID", fill="#D97706")

    img.save(filepath, "PNG")
    print("✓ Format 9 (.png) created: 09_team_computers_bid_voucher.png")

# ==============================================================================
# FORMAT 10: Tab-Separated Values (.tsv) - Sonata Information Technology
# ==============================================================================
def create_format_10_tsv():
    filepath = os.path.join(OUTPUT_DIR, "10_sonata_information_technology.tsv")
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f, delimiter="\t")
        writer.writerow(["LINE_NUMBER", "SKU_CODE", "ITEM_DESCRIPTION", "CATEGORY", "ANNUAL_QUANTITY", "UNIT_PRICE_INR", "INCOTERM", "LEAD_TIME_DAYS", "PAYMENT_TERMS"])
        for it in items:
            rate = round(it["historical_baseline_inr"] * 0.886, 2)
            writer.writerow([
                it["line_number"],
                it["sku_code"],
                it["model_name"],
                it["category"],
                it["annual_volume"],
                rate,
                "DDP",
                8,
                "Net 45 Days"
            ])
    print("✓ Format 10 (.tsv) created: 10_sonata_information_technology.tsv")

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
    print("\n>>> All 10 brand-new distinct quotation files created successfully! <<<")
