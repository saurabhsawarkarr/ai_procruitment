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
    "workstation", "ultrasharp", "dock", "docking", "nas", "rackmount", "ups",
    "pricing", "quote", "quotation", "rate", "commercial", "ddp", "ex-works", "sku"
]

# 1. Personal Identity Documents & PII (Aadhaar, PAN, Passport, Voter ID)
IDENTITY_PII_KEYWORDS = [
    "aadhaar", "aadhar", "uidai", "unique identification authority", 
    "mera aadhaar", "enrolment no", "enrolment number", "identity card", 
    "pan card", "permanent account number", "income tax department", 
    "voter id", "driving licence", "driving license", "passport", 
    "father's name", "date of birth", "dob", "gender", "govt of india",
    "government of india", "bharat sarkar"
]

# 2. Employment Resumes / Curriculum Vitae
RESUME_KEYWORDS = [
    "resume", "curriculum vitae", "work experience", "professional summary", 
    "educational qualification", "skills summary", "employment history", 
    "b.tech", "m.tech", "bachelor of", "master of", "academic background", 
    "extracurricular", "certifications", "linkedin.com", "career objective", 
    "declaration", "technical skills", "internship", "hobbies", "education"
]

# 3. Legal Agreements without pricing
LEGAL_KEYWORDS = [
    "non-disclosure agreement", "confidentiality agreement", "mutual nda", 
    "disclosing party", "receiving party", "governing law", "jurisdiction", 
    "indemnification", "severability", "in witness whereof"
]

# 4. Packaging Mismatch
PACKAGING_KEYWORDS = [
    "carton", "box", "corrugated", "flute", "ply", "gsm", "shipper", 
    "bursting", "burst factor", "die-cut", "packaging", "tray", "liner", 
    "kraft", "rsc", "slit", "creasing", "deckle", "paperboard"
]

# 5. Office Furniture Mismatch
FURNITURE_KEYWORDS = [
    "ergonomic chair", "standing desk", "workstation table", "cubicle", 
    "mesh chair", "credenza", "pedestal drawer", "conference table"
]

# 6. Bulk Chemical Mismatch
CHEMICAL_KEYWORDS = [
    "resin", "polymer", "polyethylene", "hdpe", "ldpe", "polypropylene", 
    "granules", "viscosity", "tensile strength", "melt flow index", "chemical"
]

def detect_category_from_text(text: str) -> Tuple[bool, str, float, str]:
    """
    Evaluates raw extracted text from an uploaded document against the active RFx category.
    Protects the procurement pipeline from:
    1. Personal Identity Documents (Aadhaar, PAN, Passport) - PII Violation
    2. Employment Resumes / CVs - Document Type Violation
    3. Legal NDAs without commercial pricing - Missing Pricing Schedule
    4. Foreign Commodity Categories (Corrugated packaging, furniture, chemicals)
    5. General Non-Quotation Documents

    Active RFx: Enterprise IT Hardware & Client Compute.
    Returns:
    (is_mismatch, detected_category, confidence, explanation)
    """
    clean_text = text.lower()

    # --- 1. AADHAAR / PERSONAL IDENTITY / PII CHECK ---
    has_aadhaar_pattern = bool(re.search(r"\b\d{4}\s\d{4}\s\d{4}\b", clean_text))
    has_pan_pattern = bool(re.search(r"\b[a-z]{5}\d{4}[a-z]\b", clean_text))
    pii_score = sum(1 for kw in IDENTITY_PII_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))

    if pii_score >= 2 or has_aadhaar_pattern or (has_pan_pattern and pii_score >= 1):
        doc_label = "Personal Identity Document (Aadhaar / Government ID)" if (has_aadhaar_pattern or "aadhaar" in clean_text or "aadhar" in clean_text) else "Personal Identity Document / PII (PAN / Govt ID)"
        return (
            True,
            doc_label,
            0.99,
            "Document contains Personal Identifiable Information (PII) such as an Aadhaar Card or Government Identity Proof. Uploading personal identity files into commercial RFx quotation repositories is strictly blocked under enterprise data governance and privacy policies."
        )

    # --- 2. RESUME / CURRICULUM VITAE CHECK ---
    resume_score = sum(1 for kw in RESUME_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    it_hardware_score = sum(1 for kw in IT_HARDWARE_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))

    if resume_score >= 2 and it_hardware_score <= 2:
        return (
            True,
            "Candidate Resume / Curriculum Vitae (CV)",
            0.99,
            f"Document identified as an individual candidate resume or employment CV ({resume_score} HR/qualification sections detected). It contains candidate background details rather than commercial supplier quotation rate sheets."
        )

    # --- 3. LEGAL NDA / CONTRACT CHECK ---
    legal_score = sum(1 for kw in LEGAL_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    if legal_score >= 2 and it_hardware_score <= 2:
        return (
            True,
            "Legal Non-Disclosure Agreement (NDA)",
            0.95,
            "Document identified as a legal non-disclosure or confidentiality agreement with zero commercial pricing schedules or SKU item bids."
        )

    # --- 4. COMMODITY CATEGORY MISMATCH CHECKS ---
    pkg_score = sum(1 for kw in PACKAGING_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    furn_score = sum(1 for kw in FURNITURE_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
    chem_score = sum(1 for kw in CHEMICAL_KEYWORDS if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))

    if pkg_score >= 2 and it_hardware_score <= 1:
        conf = min(0.99, 0.70 + (pkg_score * 0.05))
        return (
            True,
            "Industrial Corrugated Packaging",
            conf,
            f"Document contains {pkg_score} corrugated packaging references (cartons/GSM/plies/flutes) with negligible IT hardware terminology."
        )

    if furn_score >= 2 and it_hardware_score <= 1:
        conf = min(0.99, 0.70 + (furn_score * 0.05))
        return (
            True,
            "Office Furniture & Workstations",
            conf,
            f"Document contains {furn_score} furniture references rather than enterprise IT hardware and compute specifications."
        )

    if chem_score >= 2 and it_hardware_score <= 1:
        conf = min(0.99, 0.70 + (chem_score * 0.05))
        return (
            True,
            "Bulk Chemicals & Polymers",
            conf,
            f"Document contains {chem_score} raw polymer/chemical references rather than enterprise IT compute hardware."
        )

    # --- 5. ZERO QUOTATION / UNRELATED DOCUMENT CHECK ---
    # Check if there is literally no quote-like content at all
    quote_tokens = ["quote", "quotation", "rate", "price", "pricing", "inr", "rs.", "cost", "unit price", "ddp", "ex-works", "terms"]
    quote_score = sum(1 for qt in quote_tokens if re.search(r"\b" + re.escape(qt) + r"\b", clean_text))

    if it_hardware_score == 0 and quote_score == 0 and len(clean_text.strip()) > 50:
        return (
            True,
            "Unrelated Non-Quotation Document",
            0.92,
            "Document contains neither commercial procurement quotation pricing nor Enterprise IT Hardware specifications. Quarantined to prevent RFx matrix contamination."
        )

    return (
        False,
        "Enterprise IT Hardware & Client Compute",
        1.0,
        "Quotation matches active Enterprise IT Hardware category specification."
    )
