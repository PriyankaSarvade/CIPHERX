from typing import Dict, Any, Optional, List
try:
    from app.models.graph import EvidenceProvenanceResponse
except ImportError:
    from backend.app.models.graph import EvidenceProvenanceResponse

class EvidenceService:
    def __init__(self):
        # Cache or lookup for evidence items across cases
        self._evidence_registry: Dict[str, Dict[str, Any]] = {}

    def register_evidence_item(self, evidence_data: Dict[str, Any]):
        """Registers or caches an evidence item for provenance lookup."""
        ev_id = evidence_data.get("id")
        if ev_id:
            self._evidence_registry[ev_id] = evidence_data

    def register_batch(self, items: List[Dict[str, Any]]):
        for item in items:
            self.register_evidence_item(item)

    def get_relationship_evidence(self, relationship_data: Dict[str, Any]) -> EvidenceProvenanceResponse:
        """
        Assembles full evidence provenance for a graph edge.
        If supporting evidence is missing, explicitly marks that it lacks a linked source.
        """
        rel_id = relationship_data.get("id", "UNKNOWN-REL")
        rel_type = relationship_data.get("relationship_type") or relationship_data.get("label", "CONNECTED_TO")
        src = relationship_data.get("source_name") or relationship_data.get("source") or relationship_data.get("sourceEntityName", "Unknown")
        tgt = relationship_data.get("target_name") or relationship_data.get("target") or relationship_data.get("targetEntityName", "Unknown")
        
        evidence_ids = relationship_data.get("source_evidence_ids") or []
        if isinstance(evidence_ids, str):
            evidence_ids = [s.strip() for s in evidence_ids.split(";") if s.strip()]

        # Check for inline evidence references
        supporting_ref = relationship_data.get("supporting_evidence") or relationship_data.get("supportingEvidence") or relationship_data.get("source_reference")
        ev_type = relationship_data.get("evidence_type") or "Documentary Record"
        
        # Resolve any registered evidence records
        matched_items = []
        for eid in evidence_ids:
            if eid in self._evidence_registry:
                matched_items.append(self._evidence_registry[eid])
            else:
                matched_items.append({
                    "id": eid,
                    "title": f"Referenced Evidence Item {eid}",
                    "source": supporting_ref or "Case File Log",
                    "verification_status": relationship_data.get("verification_status", "Unverified")
                })

        has_source = bool(evidence_ids or supporting_ref)
        verification_status = relationship_data.get("verification_status", "Unverified")
        if not has_source:
            verification_status = "Unverified (Missing Linked Source)"

        return EvidenceProvenanceResponse(
            relationship_id=rel_id,
            relationship_type=rel_type,
            source_entity=src,
            target_entity=tgt,
            evidence_ids=evidence_ids,
            evidence_type=ev_type if has_source else "None",
            source_reference=supporting_ref if has_source else "Lacks linked source evidence",
            date_observed=relationship_data.get("first_observed") or relationship_data.get("dateFirstObserved"),
            verification_status=verification_status,
            has_source_evidence=has_source,
            evidence_items=matched_items,
            notes=relationship_data.get("notes")
        )

evidence_service = EvidenceService()
