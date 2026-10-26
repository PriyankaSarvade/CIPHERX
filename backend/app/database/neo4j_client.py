import logging
from typing import Dict, Any, List, Optional
from neo4j import GraphDatabase, Driver
try:
    from app.config import settings
    from app.database.schema import SCHEMA_CONSTRAINTS, SCHEMA_INDEXES
except ImportError:
    from backend.app.config import settings
    from backend.app.database.schema import SCHEMA_CONSTRAINTS, SCHEMA_INDEXES

logger = logging.getLogger("ciperx.neo4j")

class Neo4jClient:
    def __init__(self):
        self.driver: Optional[Driver] = None
        self.is_connected: bool = False
        self.connection_error: Optional[str] = None
        self._initialize()

    @property
    def uri(self) -> str:
        return settings.neo4j_uri

    @property
    def database(self) -> str:
        return settings.neo4j_database

    def is_online(self) -> bool:
        return self.is_connected

    def _initialize(self):
        """Attempts to initialize the Neo4j driver and verify connection."""
        try:
            self.driver = GraphDatabase.driver(
                settings.neo4j_uri,
                auth=(settings.neo4j_username, settings.neo4j_password),
                max_connection_lifetime=3600,
                max_connection_pool_size=50,
                connection_acquisition_timeout=5.0
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self.is_connected = True
            self.connection_error = None
            logger.info("Successfully connected to Neo4j at %s", settings.neo4j_uri)
            self._apply_schema()
        except Exception as exc:
            self.is_connected = False
            self.connection_error = str(exc)
            logger.warning(
                "Neo4j connection could not be established at %s: %s. "
                "Backend will operate in offline sandbox mode until Neo4j is started.",
                settings.neo4j_uri, exc
            )

    def _apply_schema(self):
        """Applies unique constraints and indexes to Neo4j."""
        if not self.is_connected or not self.driver:
            return
        try:
            with self.driver.session(database=settings.neo4j_database) as session:
                for stmt in SCHEMA_CONSTRAINTS:
                    try:
                        session.run(stmt)
                    except Exception as e:
                        logger.debug("Constraint statement skipped: %s (%s)", stmt, e)
                for stmt in SCHEMA_INDEXES:
                    try:
                        session.run(stmt)
                    except Exception as e:
                        logger.debug("Index statement skipped: %s (%s)", stmt, e)
            logger.info("Neo4j investigative schema constraints & indexes verified.")
        except Exception as exc:
            logger.warning("Could not apply schema constraints: %s", exc)

    def reconnect(self) -> bool:
        """Manually trigger a reconnection attempt to Neo4j."""
        self.close()
        self._initialize()
        return self.is_connected

    def execute_query(self, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a read-only parameterized Cypher query."""
        if not self.is_connected or not self.driver:
            raise ConnectionError(f"Neo4j is offline: {self.connection_error}")
        
        parameters = parameters or {}
        with self.driver.session(database=settings.neo4j_database) as session:
            result = session.run(cypher, parameters)
            return [record.data() for record in result]

    def execute_write(self, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a transactional write Cypher query."""
        if not self.is_connected or not self.driver:
            raise ConnectionError(f"Neo4j is offline: {self.connection_error}")
        
        parameters = parameters or {}
        def _tx_work(tx):
            res = tx.run(cypher, parameters)
            return [record.data() for record in res]

        with self.driver.session(database=settings.neo4j_database) as session:
            return session.execute_write(_tx_work)

    def close(self):
        """Closes the Neo4j driver connection pool."""
        if self.driver:
            try:
                self.driver.close()
            except Exception:
                pass
            self.driver = None
            self.is_connected = False

# Global client singleton
neo4j_client = Neo4jClient()
