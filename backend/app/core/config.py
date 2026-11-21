import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# Resolve dataset directory across local monorepo and container deployments
if os.path.exists(os.path.join(PROJECT_ROOT, "dataset")):
    DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset")
elif os.path.exists(os.path.join(BASE_DIR, "dataset")):
    DATASET_DIR = os.path.join(BASE_DIR, "dataset")
else:
    DATASET_DIR = os.path.join(PROJECT_ROOT, "dataset")

RFX_SPEC_PATH = os.path.join(DATASET_DIR, "rfx_spec_30_skus.json")
VENDOR_QUALIFICATIONS_PATH = os.path.join(DATASET_DIR, "vendor_qualifications.json")
CONTRACT_BASELINE_PATH = os.path.join(DATASET_DIR, "contract_baseline_2025.json")

VENDOR_FILES = {
    "VEND-001": os.path.join(DATASET_DIR, "vendor_1_apex_quote.xlsx"),
    "VEND-002": os.path.join(DATASET_DIR, "vendor_2_compuzone_quote.pdf"),
    "VEND-003": os.path.join(DATASET_DIR, "vendor_3_national_quote.docx"),
    "VEND-004": os.path.join(DATASET_DIR, "vendor_4_vardhman_quote.jpg"),
    "VEND-005": os.path.join(DATASET_DIR, "vendor_5_balaji_quote.eml"),
}

# Optional Multi-Modal Vision / Cloud LLM API Key (Optional: system runs 100% offline & deterministically)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
