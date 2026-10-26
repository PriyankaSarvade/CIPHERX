import logging
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
try:
    from app.models.audit import AuditLogEntry
except ImportError:
    from backend.app.models.audit import AuditLogEntry

logger = logging.getLogger("ciperx.audit")

class AuditService:
    def __init__(self):
        self._entries: List[AuditLogEntry] = []
        self._log_file = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "audit.log"
        )

    def log_action(
        self,
        action: str,
        case_id: Optional[str] = None,
        user_id: str = "INV-LEAD-01",
        user_role: str = "Investigator",
        details: Optional[Dict[str, Any]] = None,
        status: str = "SUCCESS"
    ) -> AuditLogEntry:
        """Logs an investigative action with sanitized metadata."""
        sanitized_details = self._sanitize_details(details or {})
        entry = AuditLogEntry(
            timestamp=datetime.now(timezone.utc).isoformat(),
            action=action,
            case_id=case_id,
            user_id=user_id,
            user_role=user_role,
            details=sanitized_details,
            status=status
        )
        self._entries.append(entry)

        # Append to audit file
        try:
            with open(self._log_file, "a", encoding="utf-8") as f:
                dump_data = entry.model_dump() if hasattr(entry, "model_dump") else entry.dict()
                f.write(json.dumps(dump_data) + "\n")
        except Exception as e:
            logger.warning("Could not write to audit log file: %s", e)

        logger.info(
            "AUDIT LOG: [%s] Action=%s User=%s (%s) Case=%s",
            entry.timestamp, action, user_id, user_role, case_id or "GLOBAL"
        )
        return entry

    def get_recent_logs(self, limit: int = 50, case_id: Optional[str] = None) -> List[AuditLogEntry]:
        """Retrieves recent audit log entries, optionally filtered by case."""
        logs = self._entries
        if case_id:
            logs = [e for e in logs if e.case_id == case_id]
        return sorted(logs, key=lambda x: x.timestamp, reverse=True)[:limit]

    def get_case_logs(self, case_id: str, limit: int = 100) -> List[AuditLogEntry]:
        """Retrieves audit trail entries specifically for a case."""
        return self.get_recent_logs(limit=limit, case_id=case_id)

    def _sanitize_details(self, details: Dict[str, Any]) -> Dict[str, Any]:
        """Masks sensitive credentials or passwords if passed."""
        masked = {}
        sensitive_keys = {"password", "secret", "token", "api_key", "aadhaar_raw"}
        for k, v in details.items():
            if any(s in k.lower() for s in sensitive_keys):
                masked[k] = "***MASKED***"
            else:
                masked[k] = v
        return masked

audit_service = AuditService()
