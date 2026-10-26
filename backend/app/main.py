"""
CIPERX — AI-Powered Criminal Network Analysis System
Graph Database & Graph Analysis Backend Engine
FastAPI Application Entrypoint
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

try:
    from app.config import settings
    from app.database.neo4j_client import neo4j_client
    from app.database.schema import init_schema
    from app.api.routes import health, graph, algorithms, evidence
    from app.services.audit_service import audit_service
except ImportError:
    from backend.app.config import settings
    from backend.app.database.neo4j_client import neo4j_client
    from backend.app.database.schema import init_schema
    from backend.app.api.routes import health, graph, algorithms, evidence
    from backend.app.services.audit_service import audit_service

# Configure root logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("ciperx.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle management.
    Initializes database constraints on startup and cleans up connections on shutdown.
    """
    logger.info("Initializing CIPERX Graph Analysis Engine...")
    is_connected = neo4j_client.is_connected
    
    if is_connected:
        logger.info("Neo4j database connection verified at %s", neo4j_client.uri)
        try:
            init_schema()
            logger.info("Neo4j schema constraints and indexes verified.")
        except Exception as e:
            logger.warning("Could not apply Neo4j schema constraints: %s", e)
    else:
        logger.info(
            "Neo4j database not detected on configured port (%s). "
            "Activating offline sandbox mode with preloaded test case dossiers.",
            neo4j_client.uri
        )

    audit_service.log_action(
        action="SYSTEM_STARTUP",
        user_id="SYSTEM",
        details={
            "database_connected": is_connected,
            "database_backend": "neo4j" if is_connected else "demo_offline_neo4j",
            "uri": neo4j_client.uri
        }
    )

    yield

    logger.info("Shutting down CIPERX Graph Analysis Engine...")
    neo4j_client.close()
    audit_service.log_action(
        action="SYSTEM_SHUTDOWN",
        user_id="SYSTEM"
    )
    logger.info("CIPERX engine shutdown complete.")


app = FastAPI(
    title="CIPERX Graph Analysis Engine",
    description=(
        "Production-grade investigative graph analysis backend for CIPERX. "
        "Integrates Cypher-powered Neo4j graph queries with NetworkX algorithms, "
        "evidence provenance tracking, and strict case isolation."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration allowing existing Vite / React frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

# Add any custom origins configured in .env
for origin in settings.cors_origins:
    if origin not in origins:
        origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers under /api/graph
app.include_router(health.router, prefix="/api/graph")
app.include_router(graph.router, prefix="/api/graph")
app.include_router(algorithms.router, prefix="/api/graph")
app.include_router(evidence.router, prefix="/api/graph")


@app.get("/", tags=["System Root"])
def get_system_root():
    """System welcome and operational status endpoint."""
    is_connected = neo4j_client.is_connected
    return {
        "system": "CIPERX — AI-Powered Criminal Network Analysis System",
        "component": "Graph Database & Graph Analysis Backend Engine",
        "version": "1.0.0",
        "status": "operational",
        "database_backend": "neo4j" if is_connected else "demo_offline_neo4j",
        "is_demo_mode": not is_connected,
        "docs_url": "/docs",
        "api_prefix": "/api/graph"
    }
