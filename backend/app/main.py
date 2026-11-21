from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

# Enable CORS for local dev frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
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

@app.get("/")
def root():
    return {
        "platform": "Aerchain Sourcing Intelligence",
        "service": "Autonomous RFx Ingestion & Scenario Modeling Engine",
        "status": "OPERATIONAL",
        "active_category": "Enterprise IT Hardware & Client Compute",
        "benchmark_spend": "₹17.90 Crore ($2.15M)",
        "sku_count": 30,
        "vendor_count": 5
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
