"""
Cypher schema, constraints, and indexes for CIPERX Neo4j graph database.
Ensures stable unique IDs and high-performance scoped traversal per case.
"""
import logging
from typing import List

logger = logging.getLogger("ciperx.schema")

SCHEMA_CONSTRAINTS = [
    # Node Unique Constraints
    "CREATE CONSTRAINT person_id_unique IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT phone_id_unique IF NOT EXISTS FOR (p:PhoneNumber) REQUIRE p.id IS UNIQUE",
    "CREATE CONSTRAINT address_id_unique IF NOT EXISTS FOR (a:Address) REQUIRE a.id IS UNIQUE",
    "CREATE CONSTRAINT org_id_unique IF NOT EXISTS FOR (o:Organization) REQUIRE o.id IS UNIQUE",
    "CREATE CONSTRAINT financial_id_unique IF NOT EXISTS FOR (f:FinancialAccount) REQUIRE f.id IS UNIQUE",
    "CREATE CONSTRAINT vehicle_id_unique IF NOT EXISTS FOR (v:Vehicle) REQUIRE v.id IS UNIQUE",
    "CREATE CONSTRAINT evidence_id_unique IF NOT EXISTS FOR (e:Evidence) REQUIRE e.id IS UNIQUE",
    "CREATE CONSTRAINT case_id_unique IF NOT EXISTS FOR (c:Case) REQUIRE c.id IS UNIQUE",
    "CREATE CONSTRAINT entity_id_unique IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE",
]

SCHEMA_INDEXES = [
    # Fast lookups by case_id for case isolation
    "CREATE INDEX entity_case_id_idx IF NOT EXISTS FOR (n:Entity) ON (n.case_id)",
    "CREATE INDEX entity_name_idx IF NOT EXISTS FOR (n:Entity) ON (n.name)",
    "CREATE INDEX person_name_idx IF NOT EXISTS FOR (p:Person) ON (p.name)",
    "CREATE INDEX phone_number_idx IF NOT EXISTS FOR (ph:PhoneNumber) ON (ph.phone_number)",
]


def init_schema() -> List[str]:
    """
    Applies unique constraints and indexes to the connected Neo4j database.
    """
    try:
        from app.database.neo4j_client import neo4j_client
    except ImportError:
        from backend.app.database.neo4j_client import neo4j_client

    if not neo4j_client.is_connected:
        logger.info("Neo4j is not connected. Skipping remote schema initialization.")
        return []

    applied = []
    for stmt in SCHEMA_CONSTRAINTS + SCHEMA_INDEXES:
        try:
            neo4j_client.execute_write(stmt)
            applied.append(stmt)
        except Exception as e:
            logger.warning("Constraint/index execution notice: %s (%s)", stmt, e)

    logger.info("Successfully synchronized %d Neo4j schema constraints/indexes.", len(applied))
    return applied
