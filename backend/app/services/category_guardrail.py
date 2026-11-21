import os
import re
from typing import Dict, Any, Tuple

# Active category keywords (Enterprise IT Hardware)
IT_HARDWARE_KEYWORDS = [
    "laptop", "dell", "lenovo", "hp", "macbook", "intel", "amd", "ryzen", 
    "core i3", "core i5", "core i7", "core i9", "ultra 7", "ultra 9", "ram", 
    "ddr4", "ddr5", "ssd", "nvme", "hard drive", "monitor", "display", 
    "keyboard", "mouse", "gpu", "nvidia", "geforce", "rtx", "server", 
    "switch", "router", "ethernet", "hdmi", "usb-c", "thunderbolt", 
    "windows 11", "software license", "saas", "cpu", "processor", 
    "thinkpad", "latitude", "elitebook", "poweredge", "proliant", "catalyst",
    "workstation", "ultrasharp", "dock", "docking", "nas", "rackmount", "ups"
]

# Foreign mismatch categories
PACKAGING_KEYWORDS = [
    "carton", "box", "corrugated", "flute", "ply", "gsm", "shipper", 
    "bursting", "burst factor", "die-cut", "packaging", "tray", "liner", 
    "kraft", "rsc", "slit", "creasing", "deckle", "paperboard"
]

FURNITURE_KEYWORDS = [
    "ergonomic chair", "standing desk", "workstation table", "cubicle", 
    "mesh chair", "credenza", "pedestal drawer", "conference table"
]

CHEMICAL_KEYWORDS = [
    "resin", "polymer", "polyethylene", "hdpe", "ldpe", "polypropylene", 
    "granules", "viscosity", "tensile strength", "melt flow index", "chemical"
]

def detect_category_from_text(text: str) -> Tuple[bool, str, float, str]:
    """
    Evaluates raw extracted text from an uploaded document against the active RFx category.
    Active RFx: Enterprise IT Hardware & Client Compute.
    Returns:
    (is_mismatch, detected_category, confidence, explanation)
    """
    clean_text = text.lower()

    # Count occurrences
    it_score = sum(1 for kw in IT_HARDWARE_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    pkg_score = sum(1 for kw in PACKAGING_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    furn_score = sum(1 for kw in FURNITURE_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    chem_score = sum(1 for kw in CHEMICAL_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))

    # Check for Packaging mismatch
    if pkg_score >= 2 and it_score <= 1:
        conf = min(0.99, 0.70 + (pkg_score * 0.05))
        return (
            True,
            "Industrial Corrugated Packaging",
            conf,
            f"Document contains {pkg_score} corrugated packaging references (e.g. cartons/GSM/plies/flutes) with negligible IT hardware terminology."
        )

    # Check for Office Furniture mismatch
    if furn_score >= 2 and it_score <= 1:
        conf = min(0.99, 0.70 + (furn_score * 0.05))
        return (
            True,
            "Office Furniture & Workstations",
            conf,
            f"Document contains {furn_score} furniture references rather than enterprise IT hardware and compute specifications."
        )

    # Check for Raw Chemicals/Polymers mismatch
    if chem_score >= 2 and it_score <= 1:
        conf = min(0.99, 0.70 + (chem_score * 0.05))
        return (
            True,
            "Bulk Chemicals & Polymers",
            conf,
            f"Document contains {chem_score} raw polymer/chemical references rather than enterprise IT compute hardware."
        )

    return (
        False,
        "Enterprise IT Hardware & Client Compute",
        1.0,
        "Quotation matches active Enterprise IT Hardware category specification."
    )
