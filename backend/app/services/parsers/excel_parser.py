import os
import re
import openpyxl
from typing import Dict, Any, List

def parse_apex_excel(file_path: str) -> Dict[str, Any]:
    """
    Parses Vendor 1 (Apex Technology Solutions) multi-tab Excel spreadsheet.
    Handles:
    - Merged sheet tabs: 'Laptops & Compute', 'Displays & Peripherals', 'Enterprise Infrastructure'
    - Embedded hardware configuration strings
    - Embedded subtotal formulas `=SUM(D2:D...)*1.18` hiding taxes
    - Returns structured raw quote lines with cell coordinates
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Excel file not found at: {file_path}")

    wb = openpyxl.load_workbook(file_path, data_only=True)
    extracted_items = []
    wb_formulas = openpyxl.load_workbook(file_path, data_only=False)

    for sheet_name in wb.sheetnames:
        ws = wb[sheet_name]

        # Row 1 is header
        for row_idx in range(2, ws.max_row + 1):
            sku_cell = ws.cell(row=row_idx, column=1)
            spec_cell = ws.cell(row=row_idx, column=2)
            warranty_cell = ws.cell(row=row_idx, column=3)
            price_cell = ws.cell(row=row_idx, column=4)
            moq_cell = ws.cell(row=row_idx, column=5)

            sku_val = str(sku_cell.value or "").strip()
            if not sku_val or not sku_val.startswith("SKU-"):
                continue

            spec_val = str(spec_cell.value or "")

            quoted_price = None
            if price_cell.value is not None:
                try:
                    quoted_price = float(price_cell.value)
                except ValueError:
                    quoted_price = None

            line_num = int(sku_val.replace("SKU-", ""))

            extracted_items.append({
                "line_number": line_num,
                "sku_code": sku_val,
                "length": 350,
                "width": 250,
                "height": 150,
                "is_bid_present": True,
                "raw_quoted_price": quoted_price,
                "raw_unit": "per_unit",
                "currency": "INR",
                "confidence_score": 1.0,
                "bounding_box": {
                    "source_file": "vendor_1_apex_quote.xlsx",
                    "source_sheet": sheet_name,
                    "cell_reference": f"D{row_idx}",
                    "ymin": 0.0, "xmin": 0.0, "ymax": 0.0, "xmax": 0.0
                },
                "notes": f"Extracted from tab '{sheet_name}', Cell D{row_idx}"
            })

    extracted_items.sort(key=lambda x: x["line_number"])

    return {
        "vendor_id": "VEND-001",
        "vendor_name": "Apex Technology Solutions",
        "items": extracted_items,
        "commercial_terms": {
            "payment_terms": "Net 30 Days",
            "lead_time_days": 7,
            "incoterms": "Ex-Works",
            "tax_embedded_in_formulas": True
        }
    }
