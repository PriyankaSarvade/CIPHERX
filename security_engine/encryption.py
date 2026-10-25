from cryptography.fernet import Fernet
import base64
import hashlib
from config import settings

def _get_fernet_instance() -> Fernet:
    # Ensure the key is exactly 32 url-safe base64-encoded bytes
    key = settings.DATA_ENCRYPTION_KEY
    if len(key) != 44:
        # Hash to 32 bytes and base64 encode if a raw string was provided
        digest = hashlib.sha256(key).digest()
        key = base64.urlsafe_b64encode(digest)
    return Fernet(key)

fernet = _get_fernet_instance()

def encrypt_sensitive_text(plain_text: str) -> str:
    """Scrambles sensitive plain text (e.g., suspect phone numbers, FIR text) into encrypted string."""
    if not plain_text:
        return ""
    encrypted_bytes = fernet.encrypt(plain_text.encode("utf-8"))
    return encrypted_bytes.decode("utf-8")

def decrypt_sensitive_text(cipher_text: str) -> str:
    """Restores encrypted text back to human-readable plain text."""
    if not cipher_text:
        return ""
    decrypted_bytes = fernet.decrypt(cipher_text.encode("utf-8"))
    return decrypted_bytes.decode("utf-8")