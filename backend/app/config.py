import os
from typing import List
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"))
except ImportError:
    pass

class Settings(BaseModel):
    app_name: str = "CIPERX Graph Analysis Backend"
    app_version: str = "1.0.0"
    app_env: str = os.getenv("APP_ENV", "development")
    app_host: str = os.getenv("APP_HOST", "127.0.0.1")
    app_port: int = int(os.getenv("APP_PORT", "8000"))
    debug: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "t")

    # Neo4j Graph Database
    neo4j_uri: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_username: str = os.getenv("NEO4J_USERNAME", "neo4j")
    neo4j_password: str = os.getenv("NEO4J_PASSWORD", "ciperx_password")
    neo4j_database: str = os.getenv("NEO4J_DATABASE", "neo4j")

    # Security
    api_key: str = os.getenv("API_KEY", "ciperx_dev_token_2026")
    API_SECRET_KEY: str = os.getenv("API_KEY", "ciperx_dev_token_2026")
    allowed_roles: List[str] = os.getenv(
        "ALLOWED_ROLES", "Investigator,Analyst,Supervisor,Admin,lead_investigator,auditor"
    ).split(",")
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    cors_origins: List[str] = [
        os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"),
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ]

settings = Settings()
