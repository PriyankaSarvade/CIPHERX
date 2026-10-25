from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import shutil
import os

# Import ALL internal modules
from nlp_engine import extract_entities_and_relations, extract_extended_entities
from identity_fusion import fuse_identities
from analytics_engine import analyze_network_and_risks, detect_contradictions
from image_engine import match_suspect_faces

app = FastAPI(
    title="CipherX Master AI Engine API",
    version="2.0.0",
    description="All-in-One AI/NLP/Vision Services for Criminal Network Analysis (PS 26189)"
)

# Enable CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Request Models ---

class TextIngestionRequest(BaseModel):
    text: str
    case_id: str

class ExtendedTextRequest(BaseModel):
    case_id: str
    text: str

class FusionRequest(BaseModel):
    extracted_entities: List[Dict[str, str]]
    db_entities: List[Dict[str, str]]

class GraphAnalysisRequest(BaseModel):
    nodes: List[str]
    edges: List[Dict[str, Any]]
    source_entity: str
    target_entity: str

class LocationLogItem(BaseModel):
    entity: str
    location: str
    timestamp: int
    source: str

class ContradictionRequest(BaseModel):
    logs: List[LocationLogItem]

# --- API Endpoints ---

@app.get("/")
def health_check():
    return {
        "status": "CipherX Engine Active",
        "problem_statement": "26189",
        "service": "AI/NLP Backend Master Pipeline"
    }

# 1. Basic Text Ingestion
@app.post("/api/v1/nlp/extract")
async def extract_nlp(request: TextIngestionRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    extracted = extract_entities_and_relations(request.text)
    return {"case_id": request.case_id, "data": extracted}

# 2. Extended Attribute Ingestion (Height, Age, Job, Bank, etc.)
@app.post("/api/v1/nlp/extract-extended")
async def extract_deep_entities(request: ExtendedTextRequest):
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    extracted = extract_extended_entities(request.text)
    return {"case_id": request.case_id, "extended_data": extracted}

# 3. Identity Fusion & Alias Resolution
@app.post("/api/v1/identity/fuse")
async def fuse_identity_records(request: FusionRequest):
    results = fuse_identities(request.extracted_entities, request.db_entities)
    return {"fusion_results": results}

# 4. Graph Network Analytics & Path Finding
@app.post("/api/v1/analytics/network-path")
async def get_network_path(request: GraphAnalysisRequest):
    analysis = analyze_network_and_risks(
        nodes=request.nodes,
        edges=request.edges,
        target_source=request.source_entity,
        target_dest=request.target_entity
    )
    return analysis

# 5. Timeline & Location Contradiction Check
@app.post("/api/v1/analytics/contradictions")
async def verify_contradictions(request: ContradictionRequest):
    logs_data = [log.model_dump() for log in request.logs]
    alerts = detect_contradictions(logs_data)
    return {"contradiction_alerts": alerts}

# 6. Face Matching & Demographic AI
@app.post("/api/v1/vision/match-faces")
async def match_faces_api(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    os.makedirs("temp_uploads", exist_ok=True)
    path1 = f"temp_uploads/{file1.filename}"
    path2 = f"temp_uploads/{file2.filename}"

    with open(path1, "wb") as buffer:
        shutil.copyfileobj(file1.file, buffer)
    with open(path2, "wb") as buffer:
        shutil.copyfileobj(file2.file, buffer)

    match_result = match_suspect_faces(path1, path2)

    if os.path.exists(path1): os.remove(path1)
    if os.path.exists(path2): os.remove(path2)

    return match_result