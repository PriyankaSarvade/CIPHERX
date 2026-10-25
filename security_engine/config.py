import os
from pydantic import BaseModel

class SecuritySettings(BaseModel):
    # Secret key for JWT signature
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "darknetra_super_secret_jwt_key_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # Fernet encryption key for sensitive data fields (FIR details, phone records)
    # Generated via cryptography.fernet.Fernet.generate_key()
    DATA_ENCRYPTION_KEY: bytes = os.getenv(
        "DATA_ENCRYPTION_KEY", 
        b"eU9iX3dlaXRfdG9faGFzaF9zZWN1cmVfc3RyXzEyMzQ1Njc="
    )

settings = SecuritySettings()