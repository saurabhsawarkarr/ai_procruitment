import json
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import docx
from PIL import Image, ImageDraw, ImageFont
import numpy as np

DATASET_DIR = r"h:\Antigravity\Aerchain\dataset"
os.makedirs(DATASET_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. 30 IT HARDWARE SKUs SPECIFICATION
# -------------------------------------------------------------
# Category 1: Enterprise Client Compute & Laptops (SKU-001 to SKU-012) - 12 SKUs
# Category 2: Displays, Docks & Workspace Peripherals (SKU-013 to SKU-022) - 10 SKUs
# Category 3: Enterprise Infrastructure, Rack Servers & Networking (SKU-023 to SKU-030) - 8 SKUs

it_skus = [
    # 1. Client Compute (Items 1-12)
    {
        "line_number": 1,
        "sku_code": "SKU-001",
        "category": "Client Compute & Laptops",
        "model_name": "ThinkPad T14s Gen 5 Ultrabook",
        "description": "Lenovo ThinkPad T14s (Intel Core Ultra 7 155U, 32GB LPDDR5x, 1TB NVMe Gen4, 14\" WUXGA 400nit Low Power, W11P)",
        "specs_summary": "14\" WUXGA / Ultra 7 155U / 32GB / 1TB SSD",
        "annual_volume": 120,
        "historical_baseline_inr": 118500.0,
        "target_price_inr": 104200.0
    },
    {
        "line_number": 2,
        "sku_code": "SKU-002",
        "category": "Client Compute & Laptops",
        "model_name": "Dell Latitude 5440 Enterprise Laptop",
        "description": "Dell Latitude 5440 (Intel Core i5-1345U vPro, 16GB DDR5, 512GB NVMe, 14\" FHD IPS Anti-Glare, 54Whr, W11P)",
        "specs_summary": "14\" FHD / Core i5-1345U / 16GB / 512GB SSD",
        "annual_volume": 200,
        "historical_baseline_inr": 86200.0,
        "target_price_inr": 76500.0
    },
    {
        "line_number": 3,
        "sku_code": "SKU-003",
        "category": "Client Compute & Laptops",
        "model_name": "Apple MacBook Pro 14 M3 Pro",
        "description": "Apple MacBook Pro 14\" (Apple M3 Pro 12-Core CPU, 18-Core GPU, 36GB Unified Memory, 1TB SSD, Space Black)",
        "specs_summary": "14\" Liquid Retina XDR / M3 Pro / 36GB / 1TB SSD",
        "annual_volume": 45,
        "historical_baseline_inr": 239900.0,
        "target_price_inr": 218000.0
    },
    {
        "line_number": 4,
        "sku_code": "SKU-004",
        "category": "Client Compute & Laptops",
        "model_name": "HP EliteBook 840 G10 Business Notebook",
        "description": "HP EliteBook 840 G10 (Intel Core i7-1365U vPro, 32GB DDR5, 1TB PCIe NVMe, 14\" WUXGA SureView Privacy, W11P)",
        "specs_summary": "14\" WUXGA Privacy / Core i7-1365U / 32GB / 1TB",
        "annual_volume": 110,
        "historical_baseline_inr": 124500.0,
        "target_price_inr": 110000.0
    },
    {
        "line_number": 5,
        "sku_code": "SKU-005",
        "category": "Client Compute & Laptops",
        "model_name": "Dell Precision 7680 Mobile Workstation",
        "description": "Dell Precision 7680 (Intel Core i9-13950HX, 64GB ECC DDR5, 2TB Gen4 NVMe, NVIDIA RTX 3500 Ada 12GB, 16\" UHD+ OLED)",
        "specs_summary": "16\" OLED / Core i9-13950HX / 64GB / RTX 3500 Ada",
        "annual_volume": 25,
        "historical_baseline_inr": 348000.0,
        "target_price_inr": 315000.0
    },
    {
        "line_number": 6,
        "sku_code": "SKU-006",
        "category": "Client Compute & Laptops",
        "model_name": "Lenovo ThinkPad X1 Carbon Gen 12",
        "description": "Lenovo ThinkPad X1 Carbon (Intel Core Ultra 7 165H, 32GB LPDDR5x, 1TB NVMe, 14\" 2.8K OLED 120Hz, Carbon Fiber, 1.09kg)",
        "specs_summary": "14\" 2.8K OLED / Ultra 7 165H / 32GB / 1.09kg",
        "annual_volume": 35,
        "historical_baseline_inr": 189000.0,
        "target_price_inr": 168000.0
    },
    {
        "line_number": 7,
        "sku_code": "SKU-007",
        "category": "Client Compute & Laptops",
        "model_name": "Apple MacBook Air 15 M3",
        "description": "Apple MacBook Air 15\" (Apple M3 8-Core CPU, 10-Core GPU, 16GB Unified Memory, 512GB SSD, Midnight)",
        "specs_summary": "15\" Liquid Retina / Apple M3 / 16GB / 512GB SSD",
        "annual_volume": 60,
        "historical_baseline_inr": 144900.0,
        "target_price_inr": 131000.0
    },
    {
        "line_number": 8,
        "sku_code": "SKU-008",
        "category": "Client Compute & Laptops",
        "model_name": "Dell OptiPlex 7010 Micro Desktop",
        "description": "Dell OptiPlex Micro Form Factor (Intel Core i5-13500T, 16GB DDR5, 512GB NVMe SSD, VESA Mount, 65W AC, W11P)",
        "specs_summary": "Micro Desktop / Core i5-13500T / 16GB / 512GB SSD",
        "annual_volume": 80,
        "historical_baseline_inr": 62500.0,
        "target_price_inr": 54800.0
    },
    {
        "line_number": 9,
        "sku_code": "SKU-009",
        "category": "Client Compute & Laptops",
        "model_name": "HP ZBook Firefly 14 G10 Workstation",
        "description": "HP ZBook Firefly 14 (AMD Ryzen 7 PRO 7840HS, 32GB DDR5, 1TB NVMe, NVIDIA RTX A500 4GB, 14\" QHD 120Hz DreamColor)",
        "specs_summary": "14\" QHD / Ryzen 7 PRO / 32GB / RTX A500",
        "annual_volume": 40,
        "historical_baseline_inr": 139000.0,
        "target_price_inr": 122000.0
    },
    {
        "line_number": 10,
        "sku_code": "SKU-010",
        "category": "Client Compute & Laptops",
        "model_name": "Lenovo ThinkCentre M90q Tiny Workstation",
        "description": "Lenovo ThinkCentre M90q Gen 4 (Intel Core i7-13700, 32GB DDR5, 1TB Gen4 SSD, Dual DP + HDMI, Wi-Fi 6E, W11P)",
        "specs_summary": "Tiny 1L Workstation / Core i7-13700 / 32GB / 1TB",
        "annual_volume": 50,
        "historical_baseline_inr": 92000.0,
        "target_price_inr": 81500.0
    },
    {
        "line_number": 11,
        "sku_code": "SKU-011",
        "category": "Client Compute & Laptops",
        "model_name": "Dell Latitude 7440 Ultralight",
        "description": "Dell Latitude 7440 Ultralight Magnesium Chassis (Intel Core i7-1365U vPro, 32GB LPDDR5, 512GB SSD, 14\" FHD+ 400nit, 1.05kg)",
        "specs_summary": "14\" FHD+ Magnesium / Core i7-1365U / 32GB / 1.05kg",
        "annual_volume": 40,
        "historical_baseline_inr": 142000.0,
        "target_price_inr": 126000.0
    },
    {
        "line_number": 12,
        "sku_code": "SKU-012",
        "category": "Client Compute & Laptops",
        "model_name": "Microsoft Surface Laptop 6 for Business",
        "description": "Microsoft Surface Laptop 6 (Intel Core Ultra 7 165H, 16GB LPDDR5x, 512GB Removable SSD, 13.5\" PixelSense Touch, Platinum)",
        "specs_summary": "13.5\" Touch / Ultra 7 165H / 16GB / 512GB SSD",
        "annual_volume": 30,
        "historical_baseline_inr": 154000.0,
        "target_price_inr": 137000.0
    },

    # 2. Displays, Docks & Workspace Peripherals (Items 13-22)
    {
        "line_number": 13,
        "sku_code": "SKU-013",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE)",
        "description": "Dell UltraSharp U2723QE 27\" 4K UHD (3840x2160) IPS Black, 90W Power Delivery, RJ45 Ethernet, 98% DCI-P3, Height Adj.",
        "specs_summary": "27\" 4K UHD IPS Black / 90W USB-C PD / RJ45",
        "annual_volume": 180,
        "historical_baseline_inr": 54500.0,
        "target_price_inr": 47200.0
    },
    {
        "line_number": 14,
        "sku_code": "SKU-014",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Lenovo ThinkVision P34w-20 34\" Curved Monitor",
        "description": "Lenovo ThinkVision P34w-20 34.14\" WQHD (3440x1440) Curved IPS, 21:9 Aspect, USB-C Docking 100W PD, KVM Switch, Ethernet",
        "specs_summary": "34\" Curved WQHD Ultrawide / Built-in KVM / 100W PD",
        "annual_volume": 40,
        "historical_baseline_inr": 72000.0,
        "target_price_inr": 62500.0
    },
    {
        "line_number": 15,
        "sku_code": "SKU-015",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Dell Thunderbolt 4 Universal Dock (WD22TB4)",
        "description": "Dell WD22TB4 Thunderbolt 4 Modular Docking Station (180W Adapter, 130W Power Delivery to Dell, Dual 4K/Single 8K, GbE)",
        "specs_summary": "Thunderbolt 4 / 130W PD / Modular / Dual 4K 60Hz",
        "annual_volume": 160,
        "historical_baseline_inr": 26800.0,
        "target_price_inr": 23200.0
    },
    {
        "line_number": 16,
        "sku_code": "SKU-016",
        "category": "Displays, Docks & Peripherals",
        "model_name": "HP E24 G5 24\" FHD Workspace Monitor",
        "description": "HP E24 G5 23.8\" FHD (1920x1080) IPS, 75Hz, 4-Way Ergonomic Stand, HP Eye Ease Low Blue Light, HDMI/DP/VGA/USB Hub",
        "specs_summary": "24\" FHD IPS / Ergonomic Stand / Low Blue Light",
        "annual_volume": 250,
        "historical_baseline_inr": 15200.0,
        "target_price_inr": 13100.0
    },
    {
        "line_number": 17,
        "sku_code": "SKU-017",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Logitech MX Master 3S + Mechanical Combo",
        "description": "Logitech MX Master 3S Performance Wireless Mouse (8K DPI Quiet Clicks) + MX Mechanical Wireless Illuminated Keyboard",
        "specs_summary": "Wireless MX Master 3S Mouse + MX Mechanical Keyboard",
        "annual_volume": 150,
        "historical_baseline_inr": 19800.0,
        "target_price_inr": 16900.0
    },
    {
        "line_number": 18,
        "sku_code": "SKU-018",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Jabra Evolve2 65 Wireless ANC Headset",
        "description": "Jabra Evolve2 65 MS Stereo Wireless Headset (Bluetooth 5.0, 3-Mic Noise Cancellation, 37-Hour Battery, USB-C Dongle)",
        "specs_summary": "Wireless Bluetooth Headset / ANC / 37hr Battery",
        "annual_volume": 140,
        "historical_baseline_inr": 18500.0,
        "target_price_inr": 15800.0
    },
    {
        "line_number": 19,
        "sku_code": "SKU-019",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Dell UltraSharp 32 6K Monitor (U3224KB)",
        "description": "Dell UltraSharp U3224KB 31.5\" 6K (6144x3456) IPS Black, Built-in 4K HDR Webcam, 140W Thunderbolt 4 Hub, Dual 14W Speakers",
        "specs_summary": "32\" 6K IPS Black / Integrated 4K Webcam / 140W TB4",
        "annual_volume": 15,
        "historical_baseline_inr": 189000.0,
        "target_price_inr": 169000.0
    },
    {
        "line_number": 20,
        "sku_code": "SKU-020",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Lenovo ThinkPad Universal Thunderbolt 4 Dock",
        "description": "Lenovo 40B00135US ThinkPad Universal Thunderbolt 4 Dock (100W Max PD, 8K DisplayPort support, 4x USB 3.2, Intel vPro pass)",
        "specs_summary": "Universal TB4 Dock / 100W PD / vPro Pass-through",
        "annual_volume": 80,
        "historical_baseline_inr": 28400.0,
        "target_price_inr": 24500.0
    },
    {
        "line_number": 21,
        "sku_code": "SKU-021",
        "category": "Displays, Docks & Peripherals",
        "model_name": "Logitech Brio 4K Ultra HD Business Webcam",
        "description": "Logitech Brio 4K Webcam with RightLight 3 with HDR, Dual Omnidirectional Mics, Windows Hello Facial Recognition IR",
        "specs_summary": "4K HDR Pro Webcam / Windows Hello IR / Dual Mics",
        "annual_volume": 90,
        "historical_baseline_inr": 16800.0,
        "target_price_inr": 14200.0
    },
    {
        "line_number": 22,
        "sku_code": "SKU-022",
        "category": "Displays, Docks & Peripherals",
        "model_name": "APC Back-UPS Pro 1500VA Desktop UPS",
        "description": "APC Back-UPS Pro BR1500G-IN (1500VA / 865W, 6 Sockets, LCD Status Display, AVR, Surge Protection for CAD Workstations)",
        "specs_summary": "1500VA / 865W / LCD Screen / Automatic Voltage Reg",
        "annual_volume": 70,
        "historical_baseline_inr": 17200.0,
        "target_price_inr": 14900.0
    },

    # 3. Enterprise Infrastructure, Rack Servers & Networking (Items 23-30)
    {
        "line_number": 23,
        "sku_code": "SKU-023",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Dell PowerEdge R760 2U Rack Server",
        "description": "Dell PowerEdge R760 (Dual Intel Xeon Gold 6430 32C/64T, 256GB DDR5 ECC Registered, 8x 1.92TB NVMe Mixed-Use, PERC H755)",
        "specs_summary": "2U Rack / 2x Xeon Gold 6430 / 256GB RAM / 15TB NVMe",
        "annual_volume": 8,
        "historical_baseline_inr": 1140000.0,
        "target_price_inr": 995000.0
    },
    {
        "line_number": 24,
        "sku_code": "SKU-024",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "HPE ProLiant DL380 Gen11 2U Server",
        "description": "HPE ProLiant DL380 Gen11 (Dual Intel Xeon Silver 4410Y, 128GB DDR5, 4x 960GB SATA Read-Intensive SSD, Redundant 800W PSU)",
        "specs_summary": "2U Rack / 2x Xeon Silver 4410Y / 128GB / HPE iLO 6",
        "annual_volume": 10,
        "historical_baseline_inr": 780000.0,
        "target_price_inr": 685000.0
    },
    {
        "line_number": 25,
        "sku_code": "SKU-025",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Cisco Catalyst 9300 48-Port PoE+ Switch",
        "description": "Cisco Catalyst C9300-48P-A (48x 1G PoE+ Ports, 715W AC, Network Advantage License, 4x 10G SFP+ Uplink Module)",
        "specs_summary": "48-Port PoE+ L3 Switch / 4x 10G SFP+ / DNA Advantage",
        "annual_volume": 12,
        "historical_baseline_inr": 465000.0,
        "target_price_inr": 410000.0
    },
    {
        "line_number": 26,
        "sku_code": "SKU-026",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Fortinet FortiGate 100F Next-Gen Firewall",
        "description": "Fortinet FortiGate 100F Appliance with 3-Year Enterprise Protection Bundle (IPS, Antivirus, Web Filtering, Dual 10GE SFP+)",
        "specs_summary": "100F NGFW / 1Gbps Threat Protection / 3yr License",
        "annual_volume": 6,
        "historical_baseline_inr": 385000.0,
        "target_price_inr": 340000.0
    },
    {
        "line_number": 27,
        "sku_code": "SKU-027",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Aruba CX 6200F 24-Port Gigabit Access Switch",
        "description": "Aruba CX 6200F 24G 4SFP+ Switch (24x 10/100/1000 Ports, 4x 1/10G SFP+ Uplinks, Class 4 PoE 370W, Layer 3 Routing)",
        "specs_summary": "24G PoE+ Switch / 4x 10G SFP+ / Aruba AOS-CX",
        "annual_volume": 14,
        "historical_baseline_inr": 235000.0,
        "target_price_inr": 208000.0
    },
    {
        "line_number": 28,
        "sku_code": "SKU-028",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Dell PowerEdge R660 1U High-Density Server",
        "description": "Dell PowerEdge R660 1U (Intel Xeon Gold 5418Y 24C/48T, 128GB DDR5, 4x 1.92TB NVMe SSD, Dual Redundant 1100W PSU, iDRAC9)",
        "specs_summary": "1U High-Density / Xeon Gold 5418Y / 128GB / 7.6TB NVMe",
        "annual_volume": 8,
        "historical_baseline_inr": 820000.0,
        "target_price_inr": 725000.0
    },
    {
        "line_number": 29,
        "sku_code": "SKU-029",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "Synology Enterprise 12-Bay RackStation NAS (RS3621RPxs)",
        "description": "Synology RS3621RPxs 12-Bay 2U NAS (Intel Xeon D-1541 8-Core, 32GB ECC RAM, Dual Redundant PSU, 12x 16TB Enterprise SATA)",
        "specs_summary": "12-Bay 2U NAS / 192TB Raw Storage / Dual 10GbE",
        "annual_volume": 4,
        "historical_baseline_inr": 690000.0,
        "target_price_inr": 615000.0
    },
    {
        "line_number": 30,
        "sku_code": "SKU-030",
        "category": "Enterprise Infrastructure & Servers",
        "model_name": "APC Smart-UPS On-Line 3000VA 2U Rackmount UPS",
        "description": "APC Smart-UPS On-Line SRT3000RMXLI (3000VA / 2700W, Double Conversion Online, 2U Rackmount, SmartSlot Network Card)",
        "specs_summary": "3kVA / 2.7kW Double-Conversion Online 2U UPS",
        "annual_volume": 8,
        "historical_baseline_inr": 245000.0,
        "target_price_inr": 218000.0
    }
]

total_baseline_spend = sum(s["annual_volume"] * s["historical_baseline_inr"] for s in it_skus)
print(f"Total IT Hardware Baseline Spend: ₹{total_baseline_spend:,.2f} (~₹{total_baseline_spend/10000000:.2f} Crore)")

with open(os.path.join(DATASET_DIR, "rfx_spec_30_skus.json"), "w", encoding="utf-8") as f:
    json.dump({"total_annual_baseline_inr": total_baseline_spend, "items": it_skus}, f, indent=2)

print("Saved rfx_spec_30_skus.json successfully.")

# -------------------------------------------------------------
# 2. VENDOR QUALIFICATIONS & AUDIT PROFILES (IT HARDWARE)
# -------------------------------------------------------------
qualifications = {
    "Vendor 1 - Apex Technology Solutions": {
        "vendor_id": "VEND-001",
        "vendor_name": "Apex Technology Solutions",
        "plant_location": "Bhiwandi Tech Park, Mumbai",
        "iso_9001_certified": False,
        "defect_rate_pct": 3.8,  # > 2.0% DoA / Hardware Defect Rate -> Disqualified on Quality!
        "on_time_delivery_pct": 88.5,
        "lead_time_days": 7,
        "monthly_capacity_cartons": 5000,
        "payment_terms": "Net 30 Days",
        "audit_status": "FAILED_QUALITY_AUDIT",
        "audit_notes": "DoA (Dead-on-Arrival) rate of 3.8% breaches the 2.0% enterprise SLA hurdle; grey-market distribution audit failure."
    },
    "Vendor 2 - CompuZone India Pvt Ltd": {
        "vendor_id": "VEND-002",
        "vendor_name": "CompuZone India Pvt Ltd",
        "plant_location": "Electronic City, Bengaluru",
        "iso_9001_certified": True,
        "defect_rate_pct": 0.8,
        "on_time_delivery_pct": 98.2,
        "lead_time_days": 9,
        "monthly_capacity_cartons": 15000,
        "payment_terms": "Net 60 Days",
        "audit_status": "PASSED_PREFERRED_SUPPLIER",
        "audit_notes": "Tier-1 OEM Authorized Direct Partner for Dell, Lenovo, and Apple. Full ISO 27001 & ISO 9001 certified depot facility."
    },
    "Vendor 3 - National IT Systems": {
        "vendor_id": "VEND-003",
        "vendor_name": "National IT Systems",
        "plant_location": "Hinjawadi Infotech Zone, Pune",
        "iso_9001_certified": True,
        "defect_rate_pct": 1.2,
        "on_time_delivery_pct": 95.0,
        "lead_time_days": 10,
        "monthly_capacity_cartons": 8000,
        "payment_terms": "Net 45 Days",
        "audit_status": "PASSED_QUALIFIED",
        "audit_notes": "Authorized enterprise gold partner with dedicated staging, asset tagging, and Windows Autopilot pre-provisioning labs."
    },
    "Vendor 4 - Vardhman Infotech": {
        "vendor_id": "VEND-004",
        "vendor_name": "Vardhman Infotech",
        "plant_location": "Surat Technology Corridor, Gujarat",
        "iso_9001_certified": True,
        "defect_rate_pct": 1.5,
        "on_time_delivery_pct": 91.0,
        "lead_time_days": 16, # Exceeds 12-day lead time limit for rapid turnaround
        "monthly_capacity_cartons": 6000,
        "payment_terms": "Net 30 Days",
        "audit_status": "PASSED_CAPACITY_CONSTRAINED",
        "audit_notes": "Authorized distributor but turnaround SLA is 16 days due to transit warehouse constraints in Western region."
    },
    "Vendor 5 - Shree Balaji Infotech": {
        "vendor_id": "VEND-005",
        "vendor_name": "Shree Balaji Infotech",
        "plant_location": "Andheri East, Mumbai",
        "iso_9001_certified": False, # Waiver eligible under senior management review
        "defect_rate_pct": 1.8,
        "on_time_delivery_pct": 94.5,
        "lead_time_days": 8,
        "monthly_capacity_cartons": 9000,
        "payment_terms": "Net 45 Days",
        "audit_status": "PROVISIONAL_WAIVER_REQUIRED",
        "audit_notes": "Aggressive pricing and rapid 8-day SLA. Eligible for ISO waiver based on 3-year spotless corporate delivery track record."
    }
}

with open(os.path.join(DATASET_DIR, "vendor_qualifications.json"), "w", encoding="utf-8") as f:
    json.dump(qualifications, f, indent=2)

baseline_2025 = {
    s["sku_code"]: {
        "rate_2025_inr": round(s["historical_baseline_inr"] * 0.96, 2),
        "contract_ref": "PO-2025-ITHW-9912"
    } for s in it_skus
}

with open(os.path.join(DATASET_DIR, "contract_baseline_2025.json"), "w", encoding="utf-8") as f:
    json.dump(baseline_2025, f, indent=2)

print("Saved vendor_qualifications.json and contract_baseline_2025.json.")

# -------------------------------------------------------------
# 3. GENERATE VENDOR 1: APEX TECHNOLOGY SOLUTIONS (.xlsx)
# -------------------------------------------------------------
wb = openpyxl.Workbook()
ws_laptops = wb.active
ws_laptops.title = "Laptops & Compute"
ws_monitors = wb.create_sheet(title="Displays & Peripherals")
ws_infra = wb.create_sheet(title="Enterprise Infrastructure")

header_fill = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")
header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")

for ws, (start_idx, end_idx) in [(ws_laptops, (1, 12)), (ws_monitors, (13, 22)), (ws_infra, (23, 30))]:
    headers = ["Item #", "Hardware Specification & Configuration", "Warranty Level", "Quoted Ex-Warehouse Unit Price (INR)", "Min Order Qty"]
    ws.append(headers)
    for col_idx in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")

    sub_skus = [s for s in it_skus if start_idx <= s["line_number"] <= end_idx]
    for row_num, item in enumerate(sub_skus, start=2):
        spec_str = f"{item['model_name']} [{item['specs_summary']}]"
        # Apex offers cheap base rates (e.g. 0.86x baseline) but fails audit
        apex_price = round(item["historical_baseline_inr"] * 0.86, 2)
        ws.append([
            item["sku_code"],
            spec_str,
            "3-Yr NBD Onsite",
            apex_price,
            5
        ])

    last_row = len(sub_skus) + 1
    total_row = last_row + 1
    ws.cell(row=total_row, column=2, value="Subtotal (Formula incl. 18% GST)")
    formula_cell = ws.cell(row=total_row, column=4, value=f"=SUM(D2:D{last_row})*1.18")
    formula_cell.font = Font(name="Calibri", bold=True)

excel_path = os.path.join(DATASET_DIR, "vendor_1_apex_quote.xlsx")
wb.save(excel_path)
print(f"Generated {excel_path}")

# -------------------------------------------------------------
# 4. GENERATE VENDOR 2: COMPUZONE INDIA (4-Page Letterhead PDF with Footnote #3)
# -------------------------------------------------------------
pdf_path = os.path.join(DATASET_DIR, "vendor_2_corrupack_quote.pdf")
doc = SimpleDocTemplate(pdf_path, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "TitleStyle",
    parent=styles["Heading1"],
    fontSize=15,
    leading=18,
    textColor=colors.HexColor("#1A365D"),
    fontName="Helvetica-Bold"
)
subtitle_style = ParagraphStyle(
    "SubTitleStyle",
    parent=styles["Normal"],
    fontSize=8.5,
    leading=11,
    textColor=colors.HexColor("#4A5568")
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

def create_table_data(slice_skus):
    data = [["Line", "Item Code", "Hardware Specification", "Warranty", "Annual Qty", "Ex-Warehouse Rate (₹)"]]
    for item in slice_skus:
        cp_price = round(item["historical_baseline_inr"] * 0.90, 2)
        desc = item["model_name"][:35]
        data.append([
            str(item["line_number"]),
            item["sku_code"],
            desc,
            "3-Yr ProSupport",
            f"{item['annual_volume']:,}",
            f"₹{cp_price:,.2f}"
        ])
    return data

t_style = TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('ALIGN', (2,1), (2,-1), 'LEFT'),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,0), 8),
    ('BOTTOMPADDING', (0,0), (-1,0), 4),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E0")),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")])
])

# Page 1: Items 1 to 10
elements.append(Paragraph("<b>COMPUZONE INDIA PRIVATE LIMITED</b>", title_style))
elements.append(Paragraph("Electronic City, Phase 1, Hosur Road, Bengaluru - 560100 | Tier-1 Authorized Enterprise OEM Partner<br/><b>COMMERCIAL IT HARDWARE TENDER BID - RFX/2026/ITHW-030</b>", subtitle_style))
elements.append(Spacer(1, 12))
t1 = Table(create_table_data(it_skus[0:10]), colWidths=[28, 55, 230, 80, 55, 92])
t1.setStyle(t_style)
elements.append(t1)
elements.append(PageBreak())

# Page 2: Items 11 to 20
elements.append(Paragraph("<b>COMPUZONE INDIA PRIVATE LIMITED — COMMERCIAL PROPOSAL (PAGE 2 OF 4)</b>", title_style))
elements.append(Spacer(1, 12))
t2 = Table(create_table_data(it_skus[10:20]), colWidths=[28, 55, 230, 80, 55, 92])
t2.setStyle(t_style)
elements.append(t2)
elements.append(PageBreak())

# Page 3: Items 21 to 30
elements.append(Paragraph("<b>COMPUZONE INDIA PRIVATE LIMITED — COMMERCIAL PROPOSAL (PAGE 3 OF 4)</b>", title_style))
elements.append(Spacer(1, 12))
t3 = Table(create_table_data(it_skus[20:30]), colWidths=[28, 55, 230, 80, 55, 92])
t3.setStyle(t_style)
elements.append(t3)
elements.append(PageBreak())

# Page 4: Terms & Footnote #3 Ambush
elements.append(Paragraph("<b>COMPUZONE INDIA PRIVATE LIMITED — COMMERCIAL TERMS & AUDIT NOTES</b>", title_style))
elements.append(Spacer(1, 14))
elements.append(Paragraph("<b>Standard Commercial Terms & Supply SLAs:</b>", subtitle_style))
elements.append(Paragraph("1. Pricing validity: 60 days from quotation submission date.<br/>2. Payment terms: Net 60 Days from invoice and technical commissioning date.<br/>3. Delivery: Turnaround of 9 business days to enterprise tech centers.", subtitle_style))
elements.append(Spacer(1, 20))

# 7pt Footnote Ambush
footnote_text = (
    "Note 3: Unit rates quoted above are Ex-Warehouse Bengaluru. Prices subject to a retrospective 4.5% annual OEM turnover rebate "
    "if aggregate corporate spend crosses ₹1.5 Crore across hardware lines; secure pallet freight & staging charged at actuals + 8% offloading handling charge; GST extra at 18%."
)
elements.append(Paragraph(f"<i>{footnote_text}</i>", footnote_style))
doc.build(elements)
print(f"Generated {pdf_path}")

# -------------------------------------------------------------
# 5. GENERATE VENDOR 3: NATIONAL IT SYSTEMS (.docx)
# -------------------------------------------------------------
doc_path = os.path.join(DATASET_DIR, "vendor_3_national_quote.docx")
w_doc = docx.Document()
w_doc.add_heading("National IT Systems & Enterprise Hardware Ltd", 0)
w_doc.add_paragraph("Commercial Quotation for FY2026 Enterprise IT Hardware Tender (30 SKUs)\n")

# Narrative prose pricing for Items 1 to 10
prose_p = w_doc.add_paragraph()
prose_p.add_run(
    "For Items 1 through 10 (Enterprise Client Compute & Laptops), National IT proposes a fixed rate of "
    "₹104,500.00 per unit for corporate deployments of 25 units or more per batch. For rapid ad-hoc deployment batches below 10 units, "
    "a surcharge of ₹4,200.00 per piece will apply to cover custom BIOS imaging and asset tagging. Delivery turnaround is guaranteed at 10 days."
)

table_docx = w_doc.add_table(rows=1, cols=4)
hdr_cells = table_docx.rows[0].cells
hdr_cells[0].text = "SKU Code"
hdr_cells[1].text = "Hardware Description"
hdr_cells[2].text = "Base Rate (INR)"
hdr_cells[3].text = "Volume Tier Rate (>50 Units)"

for item in it_skus[10:]: # Items 11 to 30
    row_cells = table_docx.add_row().cells
    row_cells[0].text = item["sku_code"]
    row_cells[1].text = item["model_name"]
    price_val = round(item["historical_baseline_inr"] * 0.92, 2)
    tier_val = round(price_val * 0.95, 2)
    row_cells[2].text = f"₹{price_val:,.2f}"
    row_cells[3].text = f"₹{tier_val:,.2f}"

w_doc.save(doc_path)
print(f"Generated {doc_path}")

# -------------------------------------------------------------
# 6. GENERATE VENDOR 4: VARDHMAN INFOTECH (.jpg)
# -------------------------------------------------------------
jpg_path = os.path.join(DATASET_DIR, "vendor_4_vardhman_quote.jpg")
img_w, img_h = 1000, 1400
img = Image.new("RGB", (img_w, img_h), color=(250, 248, 245))
draw = ImageDraw.Draw(img)

# Title
draw.text((80, 50), "VARDHMAN INFOTECH - DISTRIBUTOR RATE SHEET", fill=(20, 30, 60))
draw.text((80, 80), "Surat Technology Hub | Delivery: 16 Days SLA | Terms: Net 30d", fill=(80, 80, 80))

# Table grid
y = 130
draw.line([(80, y), (920, y)], fill=(100, 100, 100), width=2)
draw.text((90, y + 8), "SKU", fill=(0, 0, 0))
draw.text((200, y + 8), "Hardware Description", fill=(0, 0, 0))
draw.text((700, y + 8), "Unit Rate (INR)", fill=(0, 0, 0))
y += 35
draw.line([(80, y), (920, y)], fill=(100, 100, 100), width=1)

# Items 1 to 27 are quoted; lines 28, 29, 30 are BLANK / NO BID
for item in it_skus:
    l_num = item["line_number"]
    y_row = y + (l_num - 1) * 38
    draw.text((90, y_row + 5), item["sku_code"], fill=(40, 40, 40))
    draw.text((200, y_row + 5), item["model_name"][:45], fill=(50, 50, 50))

    if l_num <= 27:
        rate = round(item["historical_baseline_inr"] * 0.88, 2)
        # Blue pen handwriting simulation for price updates
        if l_num in [4, 12, 19, 23]:
            strike_rate = round(rate * 1.12, 2)
            draw.text((700, y_row + 5), f"{strike_rate:,.2f}", fill=(140, 140, 140))
            draw.line([(695, y_row + 12), (780, y_row + 12)], fill=(180, 50, 50), width=2)
            draw.text((800, y_row + 3), f"{rate:,.2f}", fill=(0, 40, 180)) # Blue pen revision!
        else:
            draw.text((700, y_row + 5), f"{rate:,.2f}", fill=(0, 0, 0))
    else:
        # LINES 28-30: BLANK / NO BID
        draw.text((700, y_row + 5), "--- NO BID ---", fill=(180, 40, 40))

    draw.line([(80, y_row + 32), (920, y_row + 32)], fill=(225, 225, 225), width=1)

# Save photo
img.save(jpg_path, quality=95)
print(f"Generated {jpg_path}")

# -------------------------------------------------------------
# 7. GENERATE VENDOR 5: SHREE BALAJI INFOTECH (.eml)
# -------------------------------------------------------------
eml_path = os.path.join(DATASET_DIR, "vendor_5_balaji_quote.eml")
eml_content = """From: "Rajesh Shah (Balaji Infotech)" <rajesh@balajiinfotech.in>
To: "Chief Procurement Officer" <procurement@enterprise.com>
Date: Fri, 20 Nov 2026 14:15:22 +0530
Subject: Commercial Quotation: FY2026 Enterprise IT Hardware Tender (30 Items)

Hi Team,

Please refer to our corporate quotation for the 30 IT Hardware SKUs:

1. Client Laptops (Items 1-12): Quoting at 2025 contract baseline price + 3.5% dollar escalation rate across Intel/Apple models.
2. Displays & Peripherals (Items 13-22): Standard rate of ₹36,500/unit blended across monitors and docks.
3. Enterprise Infrastructure (Items 23-30): Full OEM pass-through rate at ₹585,000/unit average for rack servers.

All prices are DDP Mumbai and Bengaluru corporate tech centers.
Turnaround: 8 business days guaranteed from PO receipt.
Payment terms: Net 45 Days.

Best Regards,
Rajesh Shah
Managing Director, Shree Balaji Infotech
"""

with open(eml_path, "w", encoding="utf-8") as f:
    f.write(eml_content)
print(f"Generated {eml_path}")

print("\n--- ALL 30 IT HARDWARE SKUS & 5 CHAOS FILES SUCCESSFULLY GENERATED! ---")
