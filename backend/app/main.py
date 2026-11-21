import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.api.rfx_routes import router as rfx_router
from app.api.scenario_routes import router as scenario_router
from app.api.export_routes import router as export_router
from app.api.ingestion_routes import router as ingestion_router
from app.api.chat_routes import router as chat_router
from app.services.normalizer import normalizer_engine

app = FastAPI(
    title="Aerchain Autonomous RFx Ingestion & Intelligence Platform",
    description="Multi-Modal Quote Extraction, Total Landed Cost (TCO) Normalization & MILP Strategic Award Solver",
    version="1.0.0"
)

# Enable CORS for local dev frontend and external origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(rfx_router)
app.include_router(scenario_router)
app.include_router(export_router)
app.include_router(ingestion_router)
app.include_router(chat_router)

@app.on_event("startup")
def startup_event():
    print("[Aerchain Omnichannel Hub] Initializing multi-modal ingestion pipeline...")
    normalizer_engine.reset_to_defaults()
    print("[Aerchain Evaluation Agent] Quote Matrix normalized across 30 SKUs and 5 Suppliers.")

@app.get("/api/health")
def health_check():
    return {
        "platform": "Aerchain Sourcing Intelligence",
        "service": "Autonomous RFx Ingestion & Scenario Modeling Engine",
        "status": "OPERATIONAL",
        "active_category": "Enterprise IT Hardware & Client Compute",
        "benchmark_spend": "₹17.90 Crore ($2.15M)",
        "sku_count": 30,
        "vendor_count": 5
    }

# Check for production frontend build
FRONTEND_DIST = None
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend_dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
]
for p in possible_dist_paths:
    if os.path.exists(p) and os.path.isdir(p):
        FRONTEND_DIST = p
        break

if FRONTEND_DIST:
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        return {"error": "Frontend build index.html not found"}
else:
    @app.get("/")
    def root():
        return {
            "platform": "Aerchain Sourcing Intelligence",
            "service": "Autonomous RFx Ingestion & Scenario Modeling Engine",
            "status": "OPERATIONAL",
            "sku_count": 30,
            "vendor_count": 5
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
